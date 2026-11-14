import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Heart, Plus, Trash2, X } from 'lucide-react';
import type { MemoryCategory, SharedMemory } from '../types/dedication';

interface MemoriesSectionProps {
  memories: SharedMemory[];
  onAddMemory: (memory: Omit<SharedMemory, 'id'>) => void;
  onToggleFavorite: (id: string) => void;
  onDeleteMemory: (id: string) => void;
}

const CATEGORIES: Array<'Todos' | 'Favoritos' | MemoryCategory> = [
  'Todos',
  'Favoritos',
  'Primeros pasos',
  'Viajes',
  'Cotidianos',
  'Hitos',
];

export function MemoriesSection({
  memories,
  onAddMemory,
  onToggleFavorite,
  onDeleteMemory,
}: MemoriesSectionProps) {
  const [filter, setFilter] = useState<'Todos' | 'Favoritos' | MemoryCategory>('Todos');
  const [formOpen, setFormOpen] = useState(false);

  const [title, setTitle] = useState('');
  const [dateLabel, setDateLabel] = useState('');
  const [location, setLocation] = useState('');
  const [category, setCategory] = useState<MemoryCategory>('Cotidianos');
  const [note, setNote] = useState('');

  const filteredMemories = useMemo(() => {
    if (filter === 'Todos') return memories;
    if (filter === 'Favoritos') return memories.filter((m) => m.favorite);
    return memories.filter((m) => m.category === filter);
  }, [memories, filter]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !note.trim()) return;

    onAddMemory({
      title: title.trim(),
      dateLabel:
        dateLabel.trim() ||
        new Date().toLocaleDateString('es-ES', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
        }),
      location: location.trim() || 'Nuestro rincón',
      category,
      note: note.trim(),
      favorite: true,
    });

    setTitle('');
    setDateLabel('');
    setLocation('');
    setCategory('Cotidianos');
    setNote('');
    setFormOpen(false);
  };

  return (
    <section id="recuerdos" className="py-16 sm:py-20 border-b border-[#E5E0E2]">
      <div className="max-w-6xl mx-auto px-6 sm:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div>
            <p className="text-xs font-medium text-[#70656A] mb-2">
              <span>Capítulos compartidos</span>
              <span aria-hidden="true" className="mx-2">·</span>
              <span className="tabular-nums">{memories.length} recuerdos guardados</span>
            </p>
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-[2.6rem] font-medium text-[#141214] tracking-tight text-balance">
              Lista de recuerdos compartidos
            </h2>
          </div>

          <button
            type="button"
            onClick={() => setFormOpen((prev) => !prev)}
            className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-[#15803D] hover:bg-[#166534] rounded-lg transition-colors self-start md:self-auto whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#15803D] focus-visible:ring-offset-2"
          >
            {formOpen ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            <span>{formOpen ? 'Cerrar formulario' : 'Añadir recuerdo'}</span>
          </button>
        </div>

        {/* New Memory Form */}
        <AnimatePresence>
          {formOpen && (
            <motion.form
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
              onSubmit={handleSubmit}
              className="mb-10 p-6 sm:p-8 rounded-2xl bg-white border border-[#E5E0E2]"
            >
              <h3 className="font-serif text-2xl font-medium text-[#141214] mb-5">
                Guardar un nuevo recuerdo
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                <div className="sm:col-span-2">
                  <label
                    htmlFor="mem-title"
                    className="block text-xs font-medium text-[#574F53] mb-1.5"
                  >
                    Título del momento
                  </label>
                  <input
                    id="mem-title"
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Ej. Cena improvisada bajo las estrellas"
                    className="w-full px-3.5 py-2.5 text-sm bg-[#FAF9F7] border border-[#E5E0E2] rounded-lg text-[#141214] focus:outline-none focus:ring-2 focus:ring-[#15803D]"
                  />
                </div>
                <div>
                  <label
                    htmlFor="mem-date"
                    className="block text-xs font-medium text-[#574F53] mb-1.5"
                  >
                    Fecha
                  </label>
                  <input
                    id="mem-date"
                    type="text"
                    value={dateLabel}
                    onChange={(e) => setDateLabel(e.target.value)}
                    placeholder="Ej. 14 Feb 2026"
                    className="w-full px-3.5 py-2.5 text-sm bg-[#FAF9F7] border border-[#E5E0E2] rounded-lg text-[#141214] focus:outline-none focus:ring-2 focus:ring-[#15803D]"
                  />
                </div>
                <div>
                  <label
                    htmlFor="mem-category"
                    className="block text-xs font-medium text-[#574F53] mb-1.5"
                  >
                    Capítulo
                  </label>
                  <select
                    id="mem-category"
                    value={category}
                    onChange={(e) => setCategory(e.target.value as MemoryCategory)}
                    className="w-full px-3.5 py-2.5 text-sm bg-[#FAF9F7] border border-[#E5E0E2] rounded-lg text-[#141214] focus:outline-none focus:ring-2 focus:ring-[#15803D]"
                  >
                    <option value="Primeros pasos">Primeros pasos</option>
                    <option value="Viajes">Viajes</option>
                    <option value="Cotidianos">Cotidianos</option>
                    <option value="Hitos">Hitos</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-5">
                <div>
                  <label
                    htmlFor="mem-location"
                    className="block text-xs font-medium text-[#574F53] mb-1.5"
                  >
                    Lugar
                  </label>
                  <input
                    id="mem-location"
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="Ej. Sevilla"
                    className="w-full px-3.5 py-2.5 text-sm bg-[#FAF9F7] border border-[#E5E0E2] rounded-lg text-[#141214] focus:outline-none focus:ring-2 focus:ring-[#15803D]"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label
                    htmlFor="mem-note"
                    className="block text-xs font-medium text-[#574F53] mb-1.5"
                  >
                    Lo que sentiste en ese instante
                  </label>
                  <textarea
                    id="mem-note"
                    required
                    rows={2}
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="Escribe los detalles que nunca quieres olvidar..."
                    className="w-full px-3.5 py-2.5 text-sm bg-[#FAF9F7] border border-[#E5E0E2] rounded-lg text-[#141214] focus:outline-none focus:ring-2 focus:ring-[#15803D]"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setFormOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-[#574F53] hover:text-[#141214] rounded-lg transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-medium text-white bg-[#15803D] hover:bg-[#166534] rounded-lg transition-colors cursor-pointer"
                >
                  Guardar recuerdo
                </button>
              </div>
            </motion.form>
          )}
        </AnimatePresence>

        {/* Interactive Filter Tabs */}
        <div
          role="tablist"
          aria-label="Filtrar recuerdos por categoría"
          className="flex items-center gap-1.5 p-1 bg-[#F2EFF0] rounded-xl overflow-x-auto max-w-full mb-8"
        >
          {CATEGORIES.map((cat) => {
            const active = filter === cat;
            return (
              <button
                key={cat}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setFilter(cat)}
                className={`px-3.5 py-2 text-xs font-medium rounded-lg transition-colors duration-200 whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#15803D] ${
                  active
                    ? 'bg-white text-[#141214] shadow-sm'
                    : 'text-[#574F53] hover:text-[#141214]'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>

        {/* Editorial Numbered Memory List */}
        {filteredMemories.length === 0 ? (
          <div className="py-12 px-6 text-center rounded-2xl bg-white border border-[#E5E0E2]">
            <p className="font-serif text-xl text-[#141214] mb-1">
              No hay recuerdos en esta categoría todavía
            </p>
            <p className="text-sm text-[#70656A]">
              Añade un nuevo momento compartido o cambia el filtro superior.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-[#E5E0E2] border-t border-b border-[#E5E0E2]">
            {filteredMemories.map((memory, idx) => {
              const indexStr = String(idx + 1).padStart(2, '0');
              return (
                <motion.article
                  key={memory.id}
                  layout="position"
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.15 }}
                  transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                  className="py-7 sm:py-8 grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-8 items-start"
                >
                  {/* Number & Unboxed Metadata */}
                  <div className="md:col-span-4 flex flex-col gap-1">
                    <span className="font-mono text-xs text-[#15803D] tabular-nums">
                      {indexStr}.
                    </span>
                    <div className="text-xs text-[#70656A] flex flex-wrap items-center gap-x-2 gap-y-1">
                      <span className="tabular-nums">{memory.dateLabel}</span>
                      <span aria-hidden="true">·</span>
                      <span>{memory.location}</span>
                      <span aria-hidden="true">·</span>
                      <span>{memory.category}</span>
                    </div>
                  </div>

                  {/* Narrative Content */}
                  <div className="md:col-span-6">
                    <h3 className="font-serif text-2xl font-medium text-[#141214] leading-snug">
                      {memory.title}
                    </h3>
                    <p className="mt-2.5 text-[15px] text-[#574F53] leading-relaxed max-w-prose">
                      {memory.note}
                    </p>
                  </div>

                  {/* Functional Actions */}
                  <div className="md:col-span-2 flex items-center md:justify-end gap-2">
                    <motion.button
                      type="button"
                      whileTap={{ scale: 0.88 }}
                      onClick={() => onToggleFavorite(memory.id)}
                      aria-label={
                        memory.favorite ? 'Quitar de favoritos' : 'Marcar como favorito'
                      }
                      aria-pressed={memory.favorite}
                      className={`inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg transition-colors duration-200 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#15803D] ${
                        memory.favorite
                          ? 'bg-[#ECFDF5] text-[#15803D]'
                          : 'bg-[#F2EFF0] text-[#574F53] hover:text-[#141214]'
                      }`}
                    >
                      <Heart
                        className={`w-3.5 h-3.5 transition-transform duration-200 ${
                          memory.favorite ? 'fill-[#15803D] text-[#15803D] scale-110' : ''
                        }`}
                      />
                      <span>{memory.favorite ? 'Favorito' : 'Guardar'}</span>
                    </motion.button>

                    <button
                      type="button"
                      onClick={() => onDeleteMemory(memory.id)}
                      aria-label={`Eliminar recuerdo ${memory.title}`}
                      className="w-9 h-9 inline-flex items-center justify-center rounded-lg text-[#70656A] hover:text-[#15803D] hover:bg-[#ECFDF5] transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#15803D]"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </motion.article>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
