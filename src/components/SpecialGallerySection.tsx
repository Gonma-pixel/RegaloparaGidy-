import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ChevronLeft,
  ChevronRight,
  ImagePlus,
  Heart,
  Trash2,
  Upload,
  X,
  Edit3,
  Check,
} from 'lucide-react';
import type { SpecialPhoto } from '../types/dedication';

interface SpecialGallerySectionProps {
  photos: SpecialPhoto[];
  onAddPhoto: (photo: Omit<SpecialPhoto, 'id'>) => void;
  onUpdatePhotoMessage: (id: string, newMessage: string) => void;
  onDeletePhoto: (id: string) => void;
}

export function SpecialGallerySection({
  photos,
  onAddPhoto,
  onUpdatePhotoMessage,
  onDeletePhoto,
}: SpecialGallerySectionProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Pending upload state
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadDate, setUploadDate] = useState('');
  const [uploadHiddenMsg, setUploadHiddenMsg] = useState('');
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Mobile/touch active reveal & Lightbox state
  const [revealedCardId, setRevealedCardId] = useState<string | null>(null);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [editingLightboxMsg, setEditingLightboxMsg] = useState(false);
  const [draftLightboxMsg, setDraftLightboxMsg] = useState('');
  const [failedImages, setFailedImages] = useState<Record<string, boolean>>({});

  const activeLightboxPhoto =
    lightboxIndex !== null && photos[lightboxIndex] ? photos[lightboxIndex] : null;

  useEffect(() => {
    if (lightboxIndex === null) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setLightboxIndex(null);
        setEditingLightboxMsg(false);
      } else if (e.key === 'ArrowRight') {
        setLightboxIndex((prev) =>
          prev === null ? null : (prev + 1) % Math.max(1, photos.length)
        );
        setEditingLightboxMsg(false);
      } else if (e.key === 'ArrowLeft') {
        setLightboxIndex((prev) =>
          prev === null
            ? null
            : (prev - 1 + Math.max(1, photos.length)) % Math.max(1, photos.length)
        );
        setEditingLightboxMsg(false);
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [lightboxIndex, photos.length]);

  const handleFile = (file: File) => {
    setUploadError(null);
    if (!file.type.startsWith('image/')) {
      setUploadError('Por favor selecciona un archivo de imagen válido (JPG, PNG o WebP).');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setPreviewUrl(reader.result);
        if (!uploadTitle) {
          const cleanName = file.name.replace(/\.[^/.]+$/, '').replace(/[_-]+/g, ' ');
          setUploadTitle(cleanName.slice(0, 48));
        }
      }
    };
    reader.onerror = () => {
      setUploadError('No pudimos leer esa imagen. Intenta con otro archivo.');
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  const handlePublishPhoto = (e: React.FormEvent) => {
    e.preventDefault();
    if (!previewUrl || !uploadHiddenMsg.trim()) return;

    onAddPhoto({
      title: uploadTitle.trim() || 'Instante especial',
      dateLabel:
        uploadDate.trim() ||
        new Date().toLocaleDateString('es-ES', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
        }),
      hiddenMessage: uploadHiddenMsg.trim(),
      imageUrl: previewUrl,
      aspect: 'landscape',
      isCustom: true,
    });

    setPreviewUrl(null);
    setUploadTitle('');
    setUploadDate('');
    setUploadHiddenMsg('');
    setUploadError(null);
  };

  return (
    <section id="galeria" className="py-16 sm:py-20">
      <div className="max-w-6xl mx-auto px-6 sm:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div>
            <p className="text-xs font-medium text-[#70656A] mb-2">
              <span>Colección visual</span>
              <span aria-hidden="true" className="mx-2">·</span>
              <span>Pasa el cursor sobre cada foto para revelar su mensaje oculto</span>
            </p>
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-[2.6rem] font-medium text-[#141214] tracking-tight text-balance">
              Fotos especiales con mensajes secretos
            </h2>
          </div>

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-[#15803D] hover:bg-[#166534] rounded-lg transition-colors self-start md:self-auto whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#15803D] focus-visible:ring-offset-2"
          >
            <ImagePlus className="w-4 h-4" />
            <span>Subir foto especial</span>
          </button>
        </div>

        {/* Interactive Upload Zone */}
        <div className="mb-12">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="sr-only"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFile(file);
              e.target.value = '';
            }}
          />

          {!previewUrl ? (
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  fileInputRef.current?.click();
                }
              }}
              className={`rounded-2xl border border-dashed p-7 sm:p-8 text-center transition-colors duration-200 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#15803D] ${
                isDragging
                  ? 'border-[#15803D] bg-[#ECFDF5]/60'
                  : 'border-[#CFC7CA] bg-white hover:border-[#15803D]/60 hover:bg-[#FAF9F7]'
              }`}
            >
              <Upload className="w-6 h-6 text-[#15803D] mx-auto mb-3" />
              <p className="font-serif text-xl text-[#141214]">
                Arrastra una fotografía especial aquí o haz clic para seleccionarla
              </p>
              <p className="mt-1 text-xs text-[#70656A]">
                Después podrás escribir el mensaje secreto que aparecerá al pasar el cursor
              </p>
              {uploadError && (
                <p className="mt-3 text-xs font-medium text-[#15803D]" role="alert">
                  {uploadError}
                </p>
              )}
            </div>
          ) : (
            <motion.form
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              onSubmit={handlePublishPhoto}
              className="rounded-2xl bg-white border border-[#E5E0E2] p-6 sm:p-8 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start"
            >
              <div className="lg:col-span-5">
                <div className="aspect-[4/3] rounded-xl overflow-hidden bg-[#F2EFF0] border border-[#E5E0E2]">
                  <img
                    src={previewUrl}
                    alt="Vista previa de la foto subida"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>

              <div className="lg:col-span-7 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-serif text-2xl font-medium text-[#141214]">
                    Añade tu mensaje oculto
                  </h3>
                  <button
                    type="button"
                    onClick={() => setPreviewUrl(null)}
                    aria-label="Cancelar subida"
                    className="w-9 h-9 inline-flex items-center justify-center rounded-lg text-[#574F53] hover:bg-[#F2EFF0] cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="photo-title"
                      className="block text-xs font-medium text-[#574F53] mb-1.5"
                    >
                      Título de la fotografía
                    </label>
                    <input
                      id="photo-title"
                      type="text"
                      value={uploadTitle}
                      onChange={(e) => setUploadTitle(e.target.value)}
                      placeholder="Ej. Nuestra tarde en el parque"
                      className="w-full px-3.5 py-2.5 text-sm bg-[#FAF9F7] border border-[#E5E0E2] rounded-lg text-[#141214] focus:outline-none focus:ring-2 focus:ring-[#15803D]"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="photo-date"
                      className="block text-xs font-medium text-[#574F53] mb-1.5"
                    >
                      Fecha o lugar
                    </label>
                    <input
                      id="photo-date"
                      type="text"
                      value={uploadDate}
                      onChange={(e) => setUploadDate(e.target.value)}
                      placeholder="Ej. Noviembre 2026"
                      className="w-full px-3.5 py-2.5 text-sm bg-[#FAF9F7] border border-[#E5E0E2] rounded-lg text-[#141214] focus:outline-none focus:ring-2 focus:ring-[#15803D]"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="photo-hidden-msg"
                    className="block text-xs font-medium text-[#574F53] mb-1.5"
                  >
                    Mensaje oculto al pasar el cursor
                  </label>
                  <textarea
                    id="photo-hidden-msg"
                    required
                    rows={3}
                    value={uploadHiddenMsg}
                    onChange={(e) => setUploadHiddenMsg(e.target.value)}
                    placeholder="Escribe una dedicatoria secreta que solo se revelará al acercarse a esta foto..."
                    className="w-full px-3.5 py-2.5 text-sm bg-[#FAF9F7] border border-[#E5E0E2] rounded-lg text-[#141214] focus:outline-none focus:ring-2 focus:ring-[#15803D]"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setPreviewUrl(null)}
                    className="px-4 py-2 text-xs font-medium text-[#574F53] hover:text-[#141214] rounded-lg cursor-pointer"
                  >
                    Descartar
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 text-xs font-medium text-white bg-[#15803D] hover:bg-[#166534] rounded-lg transition-colors cursor-pointer"
                  >
                    Guardar en la galería
                  </button>
                </div>
              </div>
            </motion.form>
          )}
        </div>

        {/* Gallery Bento / Masonry Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {photos.map((photo, index) => {
            const isFeatured = index === 0;
            const isRevealedOnTouch = revealedCardId === photo.id;
            const hasFailed = failedImages[photo.id];

            return (
              <motion.figure
                key={photo.id}
                layout="position"
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.15 }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                className={`group flex flex-col ${isFeatured ? 'md:col-span-2' : ''}`}
              >
                <div
                  tabIndex={0}
                  role="button"
                  aria-label={`${photo.title}. Pasa el cursor o pulsa para abrir y leer el mensaje oculto`}
                  onClick={() => {
                    // On touch screens, first tap reveals message if not revealed; second tap opens lightbox.
                    if (window.matchMedia('(hover: none)').matches && !isRevealedOnTouch) {
                      setRevealedCardId(photo.id);
                      return;
                    }
                    setLightboxIndex(index);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      setLightboxIndex(index);
                    }
                  }}
                  className={`relative rounded-2xl overflow-hidden bg-[#F2EFF0] border border-[#E5E0E2] cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#15803D] ${
                    isFeatured ? 'aspect-[16/10]' : 'aspect-[4/3]'
                  }`}
                >
                  {!hasFailed ? (
                    <img
                      src={photo.imageUrl}
                      alt={photo.title}
                      referrerPolicy="no-referrer"
                      onError={() =>
                        setFailedImages((prev) => ({ ...prev, [photo.id]: true }))
                      }
                      className="w-full h-full object-cover transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.03]"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center bg-gradient-to-br from-[#F2EFF0] to-[#E5E0E2]">
                      <Heart className="w-7 h-7 text-[#15803D] mb-2" />
                      <span className="font-serif text-lg text-[#141214]">
                        {photo.title}
                      </span>
                    </div>
                  )}

                  {/* Measured Contrast Scrim + Hidden Love Message on Hover / Focus / Touch */}
                  <div
                    className={`absolute inset-0 bg-gradient-to-t from-black/90 via-black/55 to-black/15 flex flex-col justify-end p-6 sm:p-7 transition-opacity duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                      isRevealedOnTouch
                        ? 'opacity-100'
                        : 'opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100'
                    }`}
                  >
                    <p className="text-[11px] font-medium text-white/75 mb-2">
                      <span>Mensaje oculto</span>
                      <span aria-hidden="true" className="mx-1.5">·</span>
                      <span>Haz clic para ampliar</span>
                    </p>
                    <p className="font-serif italic text-lg sm:text-xl text-white leading-relaxed transform transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] translate-y-2 group-hover:translate-y-0 group-focus-visible:translate-y-0">
                      {photo.hiddenMessage}
                    </p>
                  </div>
                </div>

                {/* Clean Editorial Caption & Delete Action */}
                <figcaption className="mt-3 flex items-baseline justify-between gap-4 px-1">
                  <div className="min-w-0">
                    <p className="font-serif text-lg font-medium text-[#141214] truncate">
                      {photo.title}
                    </p>
                    <p className="text-xs text-[#70656A] tabular-nums">
                      <span>{photo.dateLabel}</span>
                      <span aria-hidden="true" className="mx-1.5">·</span>
                      <span>Pasa el cursor para leer</span>
                    </p>
                  </div>

                  {photos.length > 1 && (
                    <button
                      type="button"
                      onClick={() => onDeletePhoto(photo.id)}
                      aria-label={`Eliminar fotografía ${photo.title}`}
                      className="w-8 h-8 inline-flex items-center justify-center rounded-lg text-[#70656A] hover:text-[#15803D] hover:bg-[#ECFDF5] transition-colors shrink-0 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </figcaption>
              </motion.figure>
            );
          })}
        </div>
      </div>

      {/* Fullscreen Lightbox Viewer */}
      <AnimatePresence>
        {activeLightboxPhoto && lightboxIndex !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 bg-[#0A090A]/92 backdrop-blur-sm flex items-center justify-center p-4 sm:p-8"
            role="dialog"
            aria-modal="true"
            aria-label={activeLightboxPhoto.title}
            onClick={() => {
              setLightboxIndex(null);
              setEditingLightboxMsg(false);
            }}
          >
            <button
              type="button"
              onClick={() => {
                setLightboxIndex(null);
                setEditingLightboxMsg(false);
              }}
              aria-label="Cerrar visor"
              className="absolute top-5 right-5 w-11 h-11 inline-flex items-center justify-center rounded-lg text-white/85 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            >
              <X className="w-6 h-6" />
            </button>

            {photos.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setLightboxIndex((lightboxIndex - 1 + photos.length) % photos.length);
                    setEditingLightboxMsg(false);
                  }}
                  aria-label="Foto anterior"
                  className="hidden sm:inline-flex absolute left-5 w-11 h-11 items-center justify-center rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setLightboxIndex((lightboxIndex + 1) % photos.length);
                    setEditingLightboxMsg(false);
                  }}
                  aria-label="Foto siguiente"
                  className="hidden sm:inline-flex absolute right-5 w-11 h-11 items-center justify-center rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </>
            )}

            <div
              onClick={(e) => e.stopPropagation()}
              className="max-w-4xl w-full flex flex-col items-center gap-5"
            >
              <div className="w-full max-h-[65vh] rounded-2xl overflow-hidden bg-black flex items-center justify-center">
                <img
                  src={activeLightboxPhoto.imageUrl}
                  alt={activeLightboxPhoto.title}
                  referrerPolicy="no-referrer"
                  className="max-h-[65vh] w-auto object-contain"
                />
              </div>

              <div className="w-full max-w-2xl text-center">
                <p className="text-xs text-white/65 tabular-nums mb-1">
                  <span>{activeLightboxPhoto.title}</span>
                  <span aria-hidden="true" className="mx-2">·</span>
                  <span>{activeLightboxPhoto.dateLabel}</span>
                </p>

                {!editingLightboxMsg ? (
                  <div className="space-y-3">
                    <p className="font-serif italic text-xl sm:text-2xl text-white leading-relaxed">
                      {activeLightboxPhoto.hiddenMessage}
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        setDraftLightboxMsg(activeLightboxPhoto.hiddenMessage);
                        setEditingLightboxMsg(true);
                      }}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white/80 hover:text-white bg-white/10 hover:bg-white/15 rounded-lg transition-colors cursor-pointer"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Editar mensaje oculto</span>
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 mt-2">
                    <input
                      type="text"
                      value={draftLightboxMsg}
                      onChange={(e) => setDraftLightboxMsg(e.target.value)}
                      className="flex-1 px-3.5 py-2 text-sm bg-white/10 border border-white/25 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#15803D]"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (draftLightboxMsg.trim()) {
                          onUpdatePhotoMessage(
                            activeLightboxPhoto.id,
                            draftLightboxMsg.trim()
                          );
                        }
                        setEditingLightboxMsg(false);
                      }}
                      className="inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-medium text-white bg-[#15803D] hover:bg-[#166534] rounded-lg cursor-pointer"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Guardar</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
