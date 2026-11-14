import { useCallback, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import {
  ArrowLeft,
  Check,
  Download,
  Eraser,
  Feather,
  Highlighter,
  Paintbrush,
  PenTool,
  RotateCcw,
  Sparkles,
  Trash2,
  Type,
  X,
} from 'lucide-react';
import { idbGet, idbSet } from '../utils/storage';
import { saveDrawingToDashboard } from '../utils/drawingsApi';

export type PenStyle =
  | 'pluma'
  | 'marcador'
  | 'acuarela'
  | 'caligrafia'
  | 'destellos'
  | 'borrador';

export type ToolMode = 'draw' | 'text';

export interface TextFontOption {
  id: string;
  label: string;
  family: string;
  sample: string;
  italic?: boolean;
}

export interface MagicalDrawingOrigin {
  x: number;
  y: number;
}

interface MagicalDrawingCanvasProps {
  origin: MagicalDrawingOrigin;
  onClose: () => void;
}

interface PendingTextPlacement {
  x: number;
  y: number;
  value: string;
}

const DRAWING_STORAGE_KEY = 'dedication_moments_white_drawing_v1';

const COLOR_SWATCHES = [
  { name: 'Tinta negra', hex: '#141214' },
  { name: 'Verde esmeralda', hex: '#15803D' },
  { name: 'Verde vivo', hex: '#22C55E' },
  { name: 'Amarillo sol', hex: '#EAB308' },
  { name: 'Naranja cálido', hex: '#EA580C' },
  { name: 'Azul cielo', hex: '#0284C7' },
  { name: 'Azul noche', hex: '#1E3A8A' },
  { name: 'Violeta suave', hex: '#7C3AED' },
  { name: 'Gris grafito', hex: '#64748B' },
  { name: 'Blanco puro', hex: '#FFFFFF' },
];

const PEN_OPTIONS: Array<{
  id: PenStyle;
  label: string;
  icon: typeof PenTool;
}> = [
  { id: 'pluma', label: 'Pluma fina', icon: PenTool },
  { id: 'marcador', label: 'Marcador', icon: Highlighter },
  { id: 'acuarela', label: 'Acuarela', icon: Paintbrush },
  { id: 'caligrafia', label: 'Caligrafía', icon: Feather },
  { id: 'destellos', label: 'Destellos', icon: Sparkles },
  { id: 'borrador', label: 'Borrador', icon: Eraser },
];

const TEXT_FONT_OPTIONS: TextFontOption[] = [
  {
    id: 'manuscrita',
    label: 'Manuscrita',
    family: '"Dancing Script", cursive',
    sample: 'Amor',
  },
  {
    id: 'creativa',
    label: 'Creativa',
    family: '"Caveat", cursive',
    sample: 'Siempre',
  },
  {
    id: 'elegante',
    label: 'Elegante',
    family: '"Cormorant Garamond", Georgia, serif',
    sample: 'Contigo',
    italic: true,
  },
  {
    id: 'moderna',
    label: 'Moderna',
    family: '"Plus Jakarta Sans", sans-serif',
    sample: 'Juntos',
  },
  {
    id: 'maquina',
    label: 'Máquina',
    family: '"JetBrains Mono", monospace',
    sample: '22·11',
  },
];

const THICKNESS_PRESETS = [
  { label: 'Fino', value: 3 },
  { label: 'Medio', value: 8 },
  { label: 'Grueso', value: 16 },
  { label: 'Ancho', value: 28 },
];

function drawStarSparkle(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  radius: number,
  color: string,
  alpha: number
) {
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.fillStyle = color;
  ctx.beginPath();
  const spikes = 4;
  const innerRadius = radius * 0.35;
  for (let i = 0; i < spikes * 2; i++) {
    const r = i % 2 === 0 ? radius : innerRadius;
    const angle = (i * Math.PI) / spikes;
    const x = cx + Math.cos(angle) * r;
    const y = cy + Math.sin(angle) * r;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

export function MagicalDrawingCanvas({
  origin,
  onClose,
}: MagicalDrawingCanvasProps) {
  const shouldReduceMotion = useReducedMotion();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const textInputRef = useRef<HTMLInputElement | null>(null);
  const historyRef = useRef<string[]>([]);
  const isDrawingRef = useRef(false);
  const lastPointRef = useRef<{ x: number; y: number } | null>(null);
  const hydratedRef = useRef(false);

  const [toolMode, setToolMode] = useState<ToolMode>('draw');
  const [penStyle, setPenStyle] = useState<PenStyle>('pluma');
  const [strokeColor, setStrokeColor] = useState<string>('#15803D');
  const [strokeWidth, setStrokeWidth] = useState<number>(6);
  const [selectedFontId, setSelectedFontId] = useState<string>('manuscrita');
  const [textSize, setTextSize] = useState<number>(38);
  const [pendingText, setPendingText] = useState<PendingTextPlacement | null>(null);
  const [canUndo, setCanUndo] = useState(false);
  const [savedToast, setSavedToast] = useState(false);
  const [savingToServer, setSavingToServer] = useState(false);
  const [savedPreviewUrl, setSavedPreviewUrl] = useState<string | null>(null);

  const activeFont =
    TEXT_FONT_OPTIONS.find((f) => f.id === selectedFontId) ?? TEXT_FONT_OPTIONS[0];

  const persistCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    try {
      const dataUrl = canvas.toDataURL('image/png');
      void idbSet(DRAWING_STORAGE_KEY, dataUrl);
    } catch {
      // ignore serialization errors
    }
  }, []);

  const pushHistorySnapshot = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    try {
      const snap = canvas.toDataURL('image/png');
      historyRef.current = [...historyRef.current.slice(-24), snap];
      setCanUndo(historyRef.current.length > 0);
    } catch {
      // ignore snapshot errors
    }
  }, []);

  const paintWhiteBackground = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number) => {
    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, w, h);
    ctx.restore();
  }, []);

  const restoreDataUrlToCanvas = useCallback(
    (dataUrl: string) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      const img = new Image();
      img.onload = () => {
        const dpr = window.devicePixelRatio || 1;
        const cssW = canvas.width / dpr;
        const cssH = canvas.height / dpr;
        paintWhiteBackground(ctx, canvas.width, canvas.height);
        ctx.save();
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        ctx.drawImage(img, 0, 0, cssW, cssH);
        ctx.restore();
      };
      img.src = dataUrl;
    },
    [paintWhiteBackground]
  );

  // Initialize high-DPI white canvas & hydrate saved artwork
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const setupSize = (preserveExisting: boolean) => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const cssW = window.innerWidth;
      const cssH = window.innerHeight;
      let snapshot: string | null = null;
      if (preserveExisting && canvas.width > 0 && canvas.height > 0) {
        try {
          snapshot = canvas.toDataURL('image/png');
        } catch {
          snapshot = null;
        }
      }

      canvas.width = Math.max(1, Math.floor(cssW * dpr));
      canvas.height = Math.max(1, Math.floor(cssH * dpr));
      canvas.style.width = `${cssW}px`;
      canvas.style.height = `${cssH}px`;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      paintWhiteBackground(ctx, canvas.width, canvas.height);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      if (snapshot) {
        const img = new Image();
        img.onload = () => {
          ctx.drawImage(img, 0, 0, cssW, cssH);
        };
        img.src = snapshot;
      }
    };

    setupSize(false);

    let active = true;
    if (!hydratedRef.current) {
      hydratedRef.current = true;
      void (async () => {
        const saved = await idbGet<string>(DRAWING_STORAGE_KEY);
        if (!active || !saved) return;
        restoreDataUrlToCanvas(saved);
      })();
    }

    const handleResize = () => setupSize(true);
    window.addEventListener('resize', handleResize);
    return () => {
      active = false;
      window.removeEventListener('resize', handleResize);
    };
  }, [paintWhiteBackground, restoreDataUrlToCanvas]);

  useEffect(() => {
    if (pendingText) {
      const id = window.setTimeout(() => textInputRef.current?.focus(), 30);
      return () => window.clearTimeout(id);
    }
  }, [pendingText]);

  const handleUndo = () => {
    const previous = historyRef.current[historyRef.current.length - 1];
    if (!previous) return;
    historyRef.current = historyRef.current.slice(0, -1);
    setCanUndo(historyRef.current.length > 0);
    restoreDataUrlToCanvas(previous);
    void idbSet(DRAWING_STORAGE_KEY, previous);
  };

  const handleClear = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    pushHistorySnapshot();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    paintWhiteBackground(ctx, canvas.width, canvas.height);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    persistCanvas();
  };

  const handleSaveDrawing = async () => {
    const canvas = canvasRef.current;
    if (!canvas || savingToServer) return;
    if (pendingText?.value.trim()) {
      commitPendingText();
    }

    setSavingToServer(true);
    persistCanvas();
    const url = canvas.toDataURL('image/png');

    setSavedToast(true);
    window.setTimeout(() => setSavedToast(false), 2400);

    await saveDrawingToDashboard(url);
    setSavedPreviewUrl(url);
    setSavingToServer(false);
  };

  const commitPendingText = () => {
    if (!pendingText) return;
    const text = pendingText.value.trim();
    if (!text) {
      setPendingText(null);
      return;
    }
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    pushHistorySnapshot();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    ctx.save();
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.fillStyle = strokeColor === '#FFFFFF' ? '#141214' : strokeColor;
    const italicPrefix = activeFont.italic ? 'italic ' : '';
    ctx.font = `${italicPrefix}600 ${textSize}px ${activeFont.family}`;
    ctx.textBaseline = 'middle';
    ctx.fillText(text, pendingText.x, pendingText.y);
    ctx.restore();

    setPendingText(null);
    persistCanvas();
  };

  const drawSegment = (
    ctx: CanvasRenderingContext2D,
    from: { x: number; y: number },
    to: { x: number; y: number }
  ) => {
    const effectiveColor = penStyle === 'borrador' ? '#FFFFFF' : strokeColor;
    ctx.save();

    if (penStyle === 'pluma') {
      ctx.globalAlpha = 1;
      ctx.strokeStyle = effectiveColor;
      ctx.lineWidth = strokeWidth;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.beginPath();
      ctx.moveTo(from.x, from.y);
      ctx.lineTo(to.x, to.y);
      ctx.stroke();
    } else if (penStyle === 'marcador') {
      ctx.globalAlpha = 0.72;
      ctx.strokeStyle = effectiveColor;
      ctx.lineWidth = Math.max(8, strokeWidth * 1.9);
      ctx.lineCap = 'square';
      ctx.lineJoin = 'round';
      ctx.beginPath();
      ctx.moveTo(from.x, from.y);
      ctx.lineTo(to.x, to.y);
      ctx.stroke();
    } else if (penStyle === 'acuarela') {
      ctx.globalAlpha = 0.24;
      ctx.strokeStyle = effectiveColor;
      ctx.shadowColor = effectiveColor;
      ctx.shadowBlur = Math.max(6, strokeWidth * 0.9);
      ctx.lineWidth = Math.max(10, strokeWidth * 2.1);
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.beginPath();
      ctx.moveTo(from.x, from.y);
      ctx.lineTo(to.x, to.y);
      ctx.stroke();
    } else if (penStyle === 'caligrafia') {
      const dx = to.x - from.x;
      const dy = to.y - from.y;
      const dist = Math.max(1, Math.hypot(dx, dy));
      const steps = Math.ceil(dist / 2);
      const nibHalf = Math.max(3, strokeWidth * 0.85);
      const angle = -Math.PI / 5;
      const ox = Math.cos(angle) * nibHalf;
      const oy = Math.sin(angle) * nibHalf;
      ctx.strokeStyle = effectiveColor;
      ctx.lineWidth = Math.max(1.8, strokeWidth * 0.26);
      ctx.lineCap = 'round';
      for (let i = 0; i <= steps; i++) {
        const t = i / steps;
        const cx = from.x + dx * t;
        const cy = from.y + dy * t;
        ctx.beginPath();
        ctx.moveTo(cx - ox, cy - oy);
        ctx.lineTo(cx + ox, cy + oy);
        ctx.stroke();
      }
    } else if (penStyle === 'destellos') {
      ctx.globalAlpha = 0.85;
      ctx.strokeStyle = effectiveColor;
      ctx.lineWidth = Math.max(1.5, strokeWidth * 0.45);
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(from.x, from.y);
      ctx.lineTo(to.x, to.y);
      ctx.stroke();

      const count = 2 + Math.floor(Math.random() * 2);
      for (let i = 0; i < count; i++) {
        const spread = Math.max(12, strokeWidth * 2.2);
        const sx = to.x + (Math.random() - 0.5) * spread;
        const sy = to.y + (Math.random() - 0.5) * spread;
        const r = Math.max(2.5, (strokeWidth * 0.45) + Math.random() * 4.5);
        drawStarSparkle(ctx, sx, sy, r, effectiveColor, 0.55 + Math.random() * 0.4);
      }
    } else if (penStyle === 'borrador') {
      ctx.globalAlpha = 1;
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = Math.max(12, strokeWidth * 2.2);
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.beginPath();
      ctx.moveTo(from.x, from.y);
      ctx.lineTo(to.x, to.y);
      ctx.stroke();
    }

    ctx.restore();
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (e.button !== 0 && e.pointerType === 'mouse') return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (toolMode === 'text') {
      if (pendingText?.value.trim()) {
        commitPendingText();
      }
      setPendingText({ x, y, value: '' });
      return;
    }

    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    pushHistorySnapshot();
    e.currentTarget.setPointerCapture(e.pointerId);
    isDrawingRef.current = true;
    lastPointRef.current = { x, y };
    drawSegment(ctx, { x, y }, { x: x + 0.01, y: y + 0.01 });
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawingRef.current || toolMode !== 'draw') return;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    const prev = lastPointRef.current;
    if (!canvas || !ctx || !prev) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const next = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    drawSegment(ctx, prev, next);
    lastPointRef.current = next;
  };

  const finishStroke = () => {
    if (!isDrawingRef.current) return;
    isDrawingRef.current = false;
    lastPointRef.current = null;
    persistCanvas();
  };

  const originStyle = `${Math.round(origin.x)}px ${Math.round(origin.y)}px`;

  return (
    <motion.div
      initial={
        shouldReduceMotion
          ? { opacity: 0 }
          : { clipPath: `circle(0% at ${originStyle})`, opacity: 0.96 }
      }
      animate={
        shouldReduceMotion
          ? { opacity: 1 }
          : { clipPath: `circle(160% at ${originStyle})`, opacity: 1 }
      }
      exit={
        shouldReduceMotion
          ? { opacity: 0 }
          : { clipPath: `circle(0% at ${originStyle})`, opacity: 0.96 }
      }
      transition={{ duration: 0.72, ease: [0.16, 1, 0.3, 1] }}
      className="fixed inset-0 z-[220] bg-white overflow-hidden select-none"
      role="dialog"
      aria-modal="true"
      aria-label="Lienzo blanco mágico para dibujar"
    >
      {/* Pure White Full-Viewport Canvas */}
      <canvas
        ref={canvasRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={finishStroke}
        onPointerCancel={finishStroke}
        className={`block w-full h-full touch-none bg-white ${
          toolMode === 'text' ? 'cursor-text' : 'cursor-crosshair'
        }`}
      />

      {/* Magical Opening Shimmer Veil */}
      {!shouldReduceMotion && (
        <motion.div
          initial={{ opacity: 0.75 }}
          animate={{ opacity: 0 }}
          transition={{ duration: 0.9, ease: 'easeOut' }}
          aria-hidden="true"
          className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_center,rgba(134,239,172,0.35),rgba(254,249,215,0.28),transparent_70%)]"
        />
      )}

      {/* Top Floating Bar */}
      <motion.header
        initial={shouldReduceMotion ? undefined : { y: -18, opacity: 0 }}
        animate={shouldReduceMotion ? undefined : { y: 0, opacity: 1 }}
        transition={{ duration: 0.45, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
        className="pointer-events-none fixed top-3 inset-x-3 sm:top-4 sm:inset-x-6 z-20 flex items-center justify-between gap-2"
      >
        <div className="pointer-events-auto flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              persistCanvas();
              onClose();
            }}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/95 hover:bg-[#ECFDF5] border border-[#15803D]/25 text-xs font-medium text-[#15803D] shadow-sm transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Volver</span>
          </button>

          <div className="hidden md:flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/90 border border-[#15803D]/15 text-xs text-[#4B5E4E] shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-[#15803D]" />
            <span>
              {toolMode === 'text'
                ? 'Toca cualquier punto del lienzo blanco para escribir'
                : 'Dibuja libremente sobre el lienzo en blanco'}
            </span>
          </div>
        </div>

        <div className="pointer-events-auto flex items-center gap-1.5 sm:gap-2">
          <button
            type="button"
            onClick={handleUndo}
            disabled={!canUndo}
            title="Deshacer último trazo"
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/95 hover:bg-[#ECFDF5] border border-[#15803D]/20 text-xs font-medium text-[#141214] disabled:opacity-40 disabled:cursor-not-allowed shadow-sm transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5 text-[#15803D]" />
            <span className="hidden sm:inline">Deshacer</span>
          </button>

          <button
            type="button"
            onClick={handleClear}
            title="Limpiar lienzo"
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/95 hover:bg-[#FEF9D7] border border-[#15803D]/20 text-xs font-medium text-[#141214] shadow-sm transition-colors cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5 text-[#15803D]" />
            <span className="hidden sm:inline">Limpiar</span>
          </button>

          <button
            type="button"
            onClick={() => void handleSaveDrawing()}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#15803D] hover:bg-[#166534] text-xs font-medium text-white shadow-sm transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{savedToast ? '¡Guardado!' : 'Guardar dibujo'}</span>
          </button>
        </div>
      </motion.header>

      {/* Inline Floating Text Placement Overlay */}
      <AnimatePresence>
        {pendingText && (
          <motion.div
            initial={{ opacity: 0, scale: 0.94 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.94 }}
            transition={{ duration: 0.16 }}
            style={{
              left: Math.min(Math.max(16, pendingText.x), window.innerWidth - 260),
              top: Math.min(Math.max(76, pendingText.y - 26), window.innerHeight - 190),
            }}
            className="fixed z-30 flex items-center gap-1.5 p-2 rounded-2xl bg-white/95 border border-[#15803D]/40 shadow-[0_14px_34px_-12px_rgba(21,128,61,0.3)]"
          >
            <input
              ref={textInputRef}
              type="text"
              value={pendingText.value}
              onChange={(e) =>
                setPendingText((prev) =>
                  prev ? { ...prev, value: e.target.value } : null
                )
              }
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  commitPendingText();
                } else if (e.key === 'Escape') {
                  setPendingText(null);
                }
              }}
              placeholder="Escribe aquí..."
              style={{
                fontFamily: activeFont.family,
                fontStyle: activeFont.italic ? 'italic' : 'normal',
                fontSize: `${Math.min(Math.max(18, textSize * 0.62), 34)}px`,
                color: strokeColor === '#FFFFFF' ? '#141214' : strokeColor,
              }}
              className="w-44 sm:w-56 px-2.5 py-1 bg-[#FAFDF9] rounded-xl border border-[#15803D]/20 focus:outline-none focus:border-[#15803D]"
            />
            <button
              type="button"
              onClick={commitPendingText}
              aria-label="Colocar texto en el lienzo"
              className="w-8 h-8 rounded-xl bg-[#15803D] hover:bg-[#166534] text-white flex items-center justify-center cursor-pointer shrink-0"
            >
              <Check className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setPendingText(null)}
              aria-label="Cancelar texto"
              className="w-8 h-8 rounded-xl bg-white hover:bg-[#ECFDF5] border border-[#15803D]/20 text-[#4B5E4E] flex items-center justify-center cursor-pointer shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom Floating Studio Dock: Colors, Pen Type, Thickness & Text Type */}
      <motion.aside
        initial={shouldReduceMotion ? undefined : { y: 36, opacity: 0 }}
        animate={shouldReduceMotion ? undefined : { y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
        aria-label="Herramientas de dibujo y texto"
        className="fixed bottom-3 sm:bottom-5 inset-x-3 sm:inset-x-auto sm:left-1/2 sm:-translate-x-1/2 z-20 sm:w-[min(980px,calc(100vw-2rem))] rounded-2xl bg-white/95 backdrop-blur-md border border-[#15803D]/25 shadow-[0_18px_48px_-14px_rgba(20,83,45,0.28)] p-3 sm:p-4 space-y-2.5"
      >
        {/* Row 1: Colors & Thickness */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-2.5">
          {/* Colors */}
          <div className="flex items-center gap-2 min-w-0 flex-wrap">
            <span className="text-[11px] font-medium text-[#4B5E4E] whitespace-nowrap">
              Colores
            </span>
            <div className="flex items-center gap-1.5 flex-wrap">
              {COLOR_SWATCHES.map((swatch) => {
                const isSelected =
                  strokeColor.toLowerCase() === swatch.hex.toLowerCase() &&
                  !(toolMode === 'draw' && penStyle === 'borrador');
                return (
                  <button
                    key={swatch.hex}
                    type="button"
                    title={swatch.name}
                    aria-label={swatch.name}
                    onClick={() => {
                      setStrokeColor(swatch.hex);
                      if (penStyle === 'borrador') setPenStyle('pluma');
                    }}
                    style={{ backgroundColor: swatch.hex }}
                    className={`w-6 h-6 sm:w-7 sm:h-7 rounded-full border transition-transform cursor-pointer ${
                      swatch.hex === '#FFFFFF'
                        ? 'border-[#CBD5E1]'
                        : 'border-black/15'
                    } ${
                      isSelected
                        ? 'scale-115 ring-2 ring-offset-2 ring-[#15803D]'
                        : 'hover:scale-105'
                    }`}
                  />
                );
              })}

              <label
                title="Elegir otro color"
                className="relative w-6 h-6 sm:w-7 sm:h-7 rounded-full border border-[#15803D]/35 bg-gradient-to-tr from-[#22C55E] via-[#FACC15] to-[#38BDF8] cursor-pointer hover:scale-105 transition-transform flex items-center justify-center overflow-hidden"
              >
                <span className="sr-only">Elegir color personalizado</span>
                <input
                  type="color"
                  value={strokeColor}
                  onChange={(e) => {
                    setStrokeColor(e.target.value);
                    if (penStyle === 'borrador') setPenStyle('pluma');
                  }}
                  className="opacity-0 absolute inset-0 w-full h-full cursor-pointer"
                />
              </label>
            </div>
          </div>

          {/* Thickness / Text Size */}
          <div className="flex items-center gap-2 shrink-0 flex-wrap">
            <span className="text-[11px] font-medium text-[#4B5E4E] whitespace-nowrap">
              {toolMode === 'text' ? 'Tamaño texto' : 'Grosor'}
            </span>
            {toolMode === 'draw' ? (
              <>
                <div className="flex items-center gap-1">
                  {THICKNESS_PRESETS.map((preset) => (
                    <button
                      key={preset.value}
                      type="button"
                      title={`${preset.label} (${preset.value}px)`}
                      onClick={() => setStrokeWidth(preset.value)}
                      className={`w-7 h-7 rounded-lg flex items-center justify-center border transition-colors cursor-pointer ${
                        strokeWidth === preset.value
                          ? 'bg-[#ECFDF5] border-[#15803D]'
                          : 'bg-white border-[#E2E8F0] hover:border-[#15803D]/40'
                      }`}
                    >
                      <span
                        style={{
                          width: Math.max(4, Math.min(18, preset.value * 0.65)),
                          height: Math.max(4, Math.min(18, preset.value * 0.65)),
                          backgroundColor:
                            penStyle === 'borrador'
                              ? '#94A3B8'
                              : strokeColor === '#FFFFFF'
                                ? '#141214'
                                : strokeColor,
                        }}
                        className="rounded-full block"
                      />
                    </button>
                  ))}
                </div>
                <input
                  type="range"
                  min={1}
                  max={42}
                  value={strokeWidth}
                  onChange={(e) => setStrokeWidth(Number(e.target.value))}
                  aria-label="Grosor del trazo"
                  className="w-20 sm:w-24 accent-[#15803D] cursor-pointer"
                />
                <span className="text-[11px] font-mono tabular-nums text-[#15803D] w-8 text-right">
                  {strokeWidth}px
                </span>
              </>
            ) : (
              <>
                <input
                  type="range"
                  min={18}
                  max={84}
                  value={textSize}
                  onChange={(e) => setTextSize(Number(e.target.value))}
                  aria-label="Tamaño del texto"
                  className="w-24 sm:w-32 accent-[#15803D] cursor-pointer"
                />
                <span className="text-[11px] font-mono tabular-nums text-[#15803D] w-9 text-right">
                  {textSize}px
                </span>
              </>
            )}
          </div>
        </div>

        {/* Row 2: Pen Type (Tipo de pluma) */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 pt-2 border-t border-[#15803D]/12">
          <span className="text-[11px] font-medium text-[#4B5E4E] whitespace-nowrap mr-1">
            Tipo de pluma
          </span>
          {PEN_OPTIONS.map((opt) => {
            const Icon = opt.icon;
            const active = toolMode === 'draw' && penStyle === opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => {
                  setToolMode('draw');
                  setPendingText(null);
                  setPenStyle(opt.id);
                }}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap shrink-0 border transition-colors cursor-pointer ${
                  active
                    ? 'bg-[#15803D] border-[#15803D] text-white shadow-xs'
                    : 'bg-white border-[#E2E8F0] text-[#475569] hover:border-[#15803D]/40'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{opt.label}</span>
              </button>
            );
          })}
        </div>

        {/* Row 3: Text Font Type (Tipo de texto para dibujar) */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 pt-2 border-t border-[#15803D]/12">
          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-[#4B5E4E] whitespace-nowrap mr-1">
            <Type className="w-3.5 h-3.5 text-[#15803D]" />
            <span>Tipo de texto</span>
          </span>
          {TEXT_FONT_OPTIONS.map((font) => {
            const active = toolMode === 'text' && selectedFontId === font.id;
            return (
              <button
                key={font.id}
                type="button"
                onClick={() => {
                  setToolMode('text');
                  setSelectedFontId(font.id);
                }}
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs whitespace-nowrap shrink-0 border transition-colors cursor-pointer ${
                  active
                    ? 'bg-[#15803D] border-[#15803D] text-white font-medium shadow-xs'
                    : 'bg-white border-[#E2E8F0] text-[#475569] hover:border-[#15803D]/40'
                }`}
              >
                <span
                  style={{
                    fontFamily: font.family,
                    fontStyle: font.italic ? 'italic' : 'normal',
                  }}
                  className="text-sm leading-none"
                >
                  {font.sample}
                </span>
                <span className="text-[11px] opacity-85">· {font.label}</span>
              </button>
            );
          })}
        </div>
      </motion.aside>

      {/* Saved Drawing Confirmation Modal */}
      <AnimatePresence>
        {savedPreviewUrl && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22 }}
            className="fixed inset-0 z-40 bg-[#141214]/45 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setSavedPreviewUrl(null)}
          >
            <motion.div
              initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.94, y: 12 }}
              animate={shouldReduceMotion ? { opacity: 1 } : { opacity: 1, scale: 1, y: 0 }}
              exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.94, y: 12 }}
              transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md rounded-3xl bg-gradient-to-br from-[#F4FBF4] via-white to-[#FEF9D7] border border-[#15803D]/25 shadow-2xl p-6 space-y-4 text-[#141214]"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-xl bg-[#ECFDF5] border border-[#15803D]/20 flex items-center justify-center text-[#15803D]">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <h3 className="font-serif text-xl font-medium text-[#141214]">
                    Nuestro dibujo
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setSavedPreviewUrl(null)}
                  aria-label="Cerrar ventana"
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-[#4B5E4E] hover:bg-[#ECFDF5] hover:text-[#15803D] cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="rounded-2xl overflow-hidden border border-[#15803D]/20 bg-white shadow-xs">
                <img
                  src={savedPreviewUrl}
                  alt="Vista previa de nuestro dibujo guardado"
                  className="w-full h-48 object-contain bg-white"
                />
              </div>

              <div className="rounded-xl bg-[#ECFDF5]/80 border border-[#15803D]/20 px-3.5 py-3 text-xs sm:text-sm text-[#166534]">
                <p className="font-medium flex items-center gap-2">
                  <Check className="w-4 h-4 text-[#15803D] shrink-0" />
                  <span>Dibujo guardado y enviado</span>
                </p>
              </div>

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => setSavedPreviewUrl(null)}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#15803D] hover:bg-[#166534] text-sm font-medium text-white transition-colors cursor-pointer"
                >
                  Seguir dibujando
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
