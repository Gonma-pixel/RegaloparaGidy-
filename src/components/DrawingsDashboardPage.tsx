import { useCallback, useEffect, useMemo, useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import {
  ArrowLeft,
  Calendar,
  Check,
  Copy,
  Download,
  Image as ImageIcon,
  MessageCircle,
  RefreshCw,
  Search,
  Sparkles,
  Trash2,
} from 'lucide-react';
import {
  buildDashboardUrl,
  deleteDashboardDrawing,
  fetchDashboardDrawingById,
  fetchDashboardDrawings,
  type SavedDrawingRecord,
} from '../utils/drawingsApi';

interface DrawingsDashboardPageProps {
  initialDrawingId?: string | null;
  onGoToStory: () => void;
}

const WHATSAPP_NUMBER = '51940265054';

function formatDateTime(iso: string): string {
  try {
    return new Intl.DateTimeFormat('es-PE', {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

export function DrawingsDashboardPage({
  initialDrawingId,
  onGoToStory,
}: DrawingsDashboardPageProps) {
  const shouldReduceMotion = useReducedMotion();
  const [drawings, setDrawings] = useState<SavedDrawingRecord[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(
    initialDrawingId ?? null
  );
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const loadAll = useCallback(async () => {
    setLoading(true);
    try {
      const list = await fetchDashboardDrawings();
      let combined = list;

      if (initialDrawingId && !list.some((d) => d.id === initialDrawingId)) {
        const direct = await fetchDashboardDrawingById(initialDrawingId);
        if (direct) {
          combined = [direct, ...list];
        }
      }

      setDrawings(combined);
      setSelectedId((prev) => {
        if (prev && combined.some((d) => d.id === prev)) return prev;
        if (initialDrawingId && combined.some((d) => d.id === initialDrawingId)) {
          return initialDrawingId;
        }
        return combined[0]?.id ?? null;
      });
    } finally {
      setLoading(false);
    }
  }, [initialDrawingId]);

  useEffect(() => {
    void loadAll();
  }, [loadAll]);

  const filteredDrawings = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return drawings;
    return drawings.filter(
      (d) =>
        d.title.toLowerCase().includes(q) ||
        formatDateTime(d.createdAt).toLowerCase().includes(q)
    );
  }, [drawings, searchQuery]);

  const activeDrawing =
    drawings.find((d) => d.id === selectedId) ?? filteredDrawings[0] ?? null;

  const handleSelectDrawing = (id: string) => {
    setSelectedId(id);
    setConfirmDeleteId(null);
    const nextUrl = buildDashboardUrl(id);
    window.history.replaceState(null, '', nextUrl);
  };

  const handleCopyLink = async (id: string) => {
    const url = buildDashboardUrl(id);
    try {
      await navigator.clipboard.writeText(url);
      setCopiedId(id);
      window.setTimeout(() => setCopiedId(null), 2200);
    } catch {
      // ignore clipboard error
    }
  };

  const handleDownloadDrawing = (drawing: SavedDrawingRecord) => {
    const link = document.createElement('a');
    link.href = drawing.dataUrl;
    link.download = `${drawing.id}.png`;
    link.click();
  };

  const handleDelete = async (id: string) => {
    await deleteDashboardDrawing(id);
    setDrawings((prev) => {
      const next = prev.filter((item) => item.id !== id);
      if (selectedId === id) {
        setSelectedId(next[0]?.id ?? null);
      }
      return next;
    });
    setConfirmDeleteId(null);
  };

  const activeShareUrl = activeDrawing ? buildDashboardUrl(activeDrawing.id) : '';
  const whatsappShareHref = activeDrawing
    ? `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
        `Mira nuestro dibujo guardado 💚✨\n${activeShareUrl}`
      )}`
    : `https://wa.me/${WHATSAPP_NUMBER}`;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#E7F8E8] via-[#F7FCE6] to-[#FEF9D7] text-[#141214]">
      {/* Top Bar Contract (3 zones) */}
      <header className="sticky top-0 z-20 bg-[#E7F8E8]/90 backdrop-blur-md border-b border-[#15803D]/15">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 h-16 flex items-center justify-between gap-8">
          <span className="font-serif text-xl sm:text-2xl font-medium text-[#141214] whitespace-nowrap shrink-0">
            Galería de dibujos
          </span>

          <div className="hidden md:flex items-center gap-6 text-xs font-medium text-[#4B5E4E]">
            <span className="whitespace-nowrap shrink-0 tabular-nums">
              {drawings.length} {drawings.length === 1 ? 'dibujo guardado' : 'dibujos guardados'}
            </span>
            <span aria-hidden="true">·</span>
            <span className="whitespace-nowrap shrink-0">Gidy &amp; Naru</span>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={() => void loadAll()}
              aria-label="Actualizar dibujos"
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/90 hover:bg-white border border-[#15803D]/20 text-xs font-medium text-[#15803D] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Actualizar</span>
            </button>
            <button
              type="button"
              onClick={onGoToStory}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#15803D] hover:bg-[#166534] text-xs font-medium text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Ir a nuestra historia</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-5 sm:px-8 py-8 sm:py-10 space-y-8">
        {loading ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-8 h-[480px] rounded-2xl bg-white/80 border border-[#15803D]/15 animate-pulse" />
            <div className="lg:col-span-4 space-y-3">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="h-24 rounded-xl bg-white/80 border border-[#15803D]/15 animate-pulse"
                />
              ))}
            </div>
          </div>
        ) : drawings.length === 0 ? (
          <section className="max-w-xl mx-auto rounded-2xl bg-white/95 border border-[#15803D]/20 p-10 text-center space-y-4">
            <div className="mx-auto w-12 h-12 rounded-xl bg-[#ECFDF5] border border-[#15803D]/20 flex items-center justify-center text-[#15803D]">
              <ImageIcon className="w-5 h-5" />
            </div>
            <h1 className="font-serif text-3xl font-medium text-[#141214]">
              Aún no hay dibujos guardados aquí
            </h1>
            <p className="text-sm text-[#4B5E4E] leading-relaxed">
              Cuando dibujes algo en el lienzo blanco mágico y presiones <strong>Guardar dibujo</strong>, aparecerá en este panel con su enlace directo.
            </p>
            <div className="pt-2">
              <button
                type="button"
                onClick={onGoToStory}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#15803D] hover:bg-[#166534] text-sm font-medium text-white transition-colors cursor-pointer"
              >
                <Sparkles className="w-4 h-4" />
                <span>Abrir nuestra historia</span>
              </button>
            </div>
          </section>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Featured Drawing Spotlight */}
            {activeDrawing && (
              <motion.section
                key={activeDrawing.id}
                initial={shouldReduceMotion ? undefined : { opacity: 0, y: 10 }}
                animate={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
                transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                className="lg:col-span-8 rounded-2xl bg-white border border-[#15803D]/20 overflow-hidden"
              >
                <div className="px-6 py-4 border-b border-[#E5E0E2] flex flex-wrap items-center justify-between gap-4">
                  <div className="min-w-0">
                    <h1 className="font-serif text-2xl sm:text-3xl font-medium text-[#141214] truncate">
                      {activeDrawing.title}
                    </h1>
                    <div className="mt-1 flex items-center gap-2 text-xs text-[#4B5E4E] tabular-nums">
                      <Calendar className="w-3.5 h-3.5 text-[#15803D]" />
                      <span>{formatDateTime(activeDrawing.createdAt)}</span>
                      <span aria-hidden="true">·</span>
                      <span className="font-mono text-[#15803D]">{activeDrawing.id}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    <button
                      type="button"
                      onClick={() => void handleCopyLink(activeDrawing.id)}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#FAFDF9] hover:bg-[#ECFDF5] border border-[#15803D]/25 text-xs font-medium text-[#15803D] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                    >
                      {copiedId === activeDrawing.id ? (
                        <Check className="w-3.5 h-3.5" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                      <span>
                        {copiedId === activeDrawing.id ? 'Enlace copiado' : 'Copiar enlace'}
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDownloadDrawing(activeDrawing)}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#FAFDF9] hover:bg-[#ECFDF5] border border-[#15803D]/25 text-xs font-medium text-[#15803D] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Descargar PNG</span>
                    </button>

                    <a
                      href={whatsappShareHref}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#15803D] hover:bg-[#166534] text-xs font-medium text-white transition-colors whitespace-nowrap shrink-0"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      <span>Enviar por WhatsApp</span>
                    </a>
                  </div>
                </div>

                {/* Pure White Artwork Frame */}
                <div className="p-4 sm:p-6 bg-[#FAFDF9]">
                  <div className="rounded-xl border border-[#15803D]/15 bg-white overflow-hidden">
                    <img
                      src={activeDrawing.dataUrl}
                      alt={activeDrawing.title}
                      referrerPolicy="no-referrer"
                      className="w-full max-h-[65vh] object-contain mx-auto bg-white"
                    />
                  </div>
                </div>
              </motion.section>
            )}

            {/* Saved Drawings History Sidebar */}
            <aside className="lg:col-span-4 rounded-2xl bg-white border border-[#15803D]/20 p-5 space-y-4">
              <div className="flex items-center justify-between gap-2">
                <h2 className="font-serif text-xl font-medium text-[#141214]">
                  Todos los dibujos
                </h2>
                <span className="text-xs font-mono tabular-nums text-[#15803D]">
                  {filteredDrawings.length}
                </span>
              </div>

              <div className="relative">
                <Search className="w-3.5 h-3.5 text-[#6B7D6F] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Buscar por título o fecha..."
                  aria-label="Buscar dibujos guardados"
                  className="w-full pl-8 pr-3 py-2 text-xs rounded-xl bg-[#FAFDF9] border border-[#15803D]/20 text-[#141214] placeholder:text-[#6B7D6F] focus:outline-none focus:border-[#15803D]"
                />
              </div>

              <ul className="space-y-2.5 max-h-[60vh] overflow-y-auto pr-1">
                {filteredDrawings.map((item) => {
                  const isActive = activeDrawing?.id === item.id;
                  const isConfirmingDelete = confirmDeleteId === item.id;
                  return (
                    <li
                      key={item.id}
                      className={`rounded-xl border p-2.5 transition-colors ${
                        isActive
                          ? 'bg-[#ECFDF5] border-[#15803D]/55'
                          : 'bg-[#FAFDF9] border-[#15803D]/15 hover:border-[#15803D]/40'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => handleSelectDrawing(item.id)}
                          className="flex-1 min-w-0 flex items-center gap-3 text-left cursor-pointer"
                        >
                          <div className="w-16 h-14 rounded-lg border border-[#15803D]/20 bg-white overflow-hidden shrink-0">
                            <img
                              src={item.dataUrl}
                              alt={item.title}
                              referrerPolicy="no-referrer"
                              className="w-full h-full object-contain bg-white"
                            />
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-[#141214] truncate">
                              {item.title}
                            </p>
                            <p className="text-[11px] text-[#4B5E4E] tabular-nums mt-0.5">
                              {formatDateTime(item.createdAt)}
                            </p>
                          </div>
                        </button>

                        {isConfirmingDelete ? (
                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              type="button"
                              onClick={() => void handleDelete(item.id)}
                              className="px-2 py-1 rounded-lg bg-[#15803D] text-white text-[11px] font-medium cursor-pointer"
                            >
                              Sí
                            </button>
                            <button
                              type="button"
                              onClick={() => setConfirmDeleteId(null)}
                              className="px-2 py-1 rounded-lg bg-white border border-[#15803D]/20 text-[11px] text-[#4B5E4E] cursor-pointer"
                            >
                              No
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setConfirmDeleteId(item.id)}
                            aria-label="Eliminar dibujo"
                            className="w-8 h-8 rounded-lg flex items-center justify-center text-[#6B7D6F] hover:text-[#15803D] hover:bg-white transition-colors shrink-0 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ul>
            </aside>
          </div>
        )}
      </main>
    </div>
  );
}
