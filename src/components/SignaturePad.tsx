import { useEffect, useRef, useState } from 'react';
import { RotateCcw } from 'lucide-react';

interface SignaturePadProps {
  value: string | null;
  onChange: (dataUrl: string | null) => void;
  heightClass?: string;
}

export function SignaturePad({
  value,
  onChange,
  heightClass = 'h-20',
}: SignaturePadProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const drawingRef = useRef(false);
  const lastPointRef = useRef<{ x: number; y: number } | null>(null);
  const [hasStrokes, setHasStrokes] = useState(Boolean(value));

  // Sync saved signature image onto the canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = Math.max(1, Math.round(rect.width * dpr));
    const h = Math.max(1, Math.round(rect.height * dpr));

    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w;
      canvas.height = h;
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (value) {
      const img = new Image();
      img.onload = () => {
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      };
      img.src = value;
      setHasStrokes(true);
    } else {
      setHasStrokes(false);
    }
  }, [value]);

  const getRelativePoint = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.setPointerCapture(e.pointerId);

    const rect = canvas.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = Math.max(1, Math.round(rect.width * dpr));
    const h = Math.max(1, Math.round(rect.height * dpr));

    if (canvas.width !== w || canvas.height !== h) {
      const prevData = hasStrokes ? canvas.toDataURL('image/png') : null;
      canvas.width = w;
      canvas.height = h;
      if (prevData) {
        const img = new Image();
        img.onload = () => {
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
        };
        img.src = prevData;
      }
    }

    const pt = getRelativePoint(e);
    drawingRef.current = true;
    lastPointRef.current = pt;
    setHasStrokes(true);

    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.fillStyle = '#141214';
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, 1.1, 0, Math.PI * 2);
      ctx.fill();
    }
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!drawingRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx || !lastPointRef.current) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const pt = getRelativePoint(e);

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.strokeStyle = '#141214';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    ctx.beginPath();
    ctx.moveTo(lastPointRef.current.x, lastPointRef.current.y);
    ctx.lineTo(pt.x, pt.y);
    ctx.stroke();

    lastPointRef.current = pt;
  };

  const finishStroke = () => {
    if (!drawingRef.current) return;
    drawingRef.current = false;
    lastPointRef.current = null;
    const canvas = canvasRef.current;
    if (canvas) {
      onChange(canvas.toDataURL('image/png'));
    }
  };

  const handleClear = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (canvas && ctx) {
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
    setHasStrokes(false);
    onChange(null);
  };

  return (
    <div
      className={`relative ${heightClass} w-full max-w-[220px] rounded-lg border border-dashed transition-colors overflow-hidden ${
        hasStrokes
          ? 'border-[#15803D]/50 bg-[#FAF9F7]/70'
          : 'border-[#15803D]/60 bg-[#ECFDF5]/45 hover:border-[#15803D]'
      }`}
    >
      {!hasStrokes && (
        <span className="pointer-events-none absolute inset-0 flex items-center justify-center text-[11px] font-medium text-[#166534]/80 select-none">
          Dibuja tu firma aquí
        </span>
      )}

      <canvas
        ref={canvasRef}
        aria-label="Recuadro para dibujar la firma de Leidy Diana Ponce Berna"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={finishStroke}
        onPointerCancel={finishStroke}
        onLostPointerCapture={finishStroke}
        className="w-full h-full touch-none cursor-crosshair block"
      />

      {hasStrokes && (
        <button
          type="button"
          onClick={handleClear}
          title="Borrar firma"
          aria-label="Borrar firma dibujada"
          className="absolute top-1 right-1 w-6 h-6 rounded-md bg-white/90 border border-[#E5E0E2] text-[#70656A] hover:text-[#15803D] inline-flex items-center justify-center shadow-xs transition-colors cursor-pointer"
        >
          <RotateCcw className="w-3 h-3" />
        </button>
      )}
    </div>
  );
}
