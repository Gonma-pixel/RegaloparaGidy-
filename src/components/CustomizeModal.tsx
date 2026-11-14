import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { RotateCcw, X } from 'lucide-react';
import type { DedicationProfile } from '../types/dedication';

interface CustomizeModalProps {
  open: boolean;
  profile: DedicationProfile;
  onClose: () => void;
  onSave: (updated: DedicationProfile) => void;
  onResetAll: () => void;
}

export function CustomizeModal({
  open,
  profile,
  onClose,
  onSave,
  onResetAll,
}: CustomizeModalProps) {
  const [draft, setDraft] = useState<DedicationProfile>(profile);
  const [confirmReset, setConfirmReset] = useState(false);

  useEffect(() => {
    if (open) {
      setDraft(profile);
      setConfirmReset(false);
    }
  }, [open, profile]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const combinedNames =
      draft.partnerOne.trim() && draft.partnerTwo.trim()
        ? `${draft.partnerOne.trim()} & ${draft.partnerTwo.trim()}`
        : draft.coupleNames.trim() || 'Nosotros';

    onSave({
      ...draft,
      coupleNames: combinedNames,
    });
    onClose();
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 bg-[#141214]/65 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6"
          role="dialog"
          aria-modal="true"
          aria-labelledby="customize-modal-title"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.98 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-2xl max-h-[88vh] overflow-y-auto bg-[#FAF9F7] rounded-2xl border border-[#E5E0E2] p-6 sm:p-8 shadow-xl relative"
          >
            <button
              type="button"
              onClick={onClose}
              aria-label="Cerrar personalización"
              className="absolute top-5 right-5 w-10 h-10 inline-flex items-center justify-center rounded-lg text-[#574F53] hover:text-[#141214] hover:bg-[#F2EFF0] transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <h2
              id="customize-modal-title"
              className="font-serif text-3xl font-medium text-[#141214] pr-10"
            >
              Personalizar dedicatoria
            </h2>
            <p className="mt-1 text-sm text-[#574F53]">
              Adapta los nombres y la carta con vuestra propia historia.
            </p>

            <form onSubmit={handleSubmit} className="mt-6 space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="cust-p1"
                    className="block text-xs font-medium text-[#574F53] mb-1.5"
                  >
                    Tu pareja
                  </label>
                  <input
                    id="cust-p1"
                    type="text"
                    required
                    value={draft.partnerOne}
                    onChange={(e) =>
                      setDraft((prev) => ({ ...prev, partnerOne: e.target.value }))
                    }
                    className="w-full px-3.5 py-2.5 text-sm bg-white border border-[#E5E0E2] rounded-lg text-[#141214] focus:outline-none focus:ring-2 focus:ring-[#15803D]"
                  />
                </div>
                <div>
                  <label
                    htmlFor="cust-p2"
                    className="block text-xs font-medium text-[#574F53] mb-1.5"
                  >
                    Tu nombre
                  </label>
                  <input
                    id="cust-p2"
                    type="text"
                    required
                    value={draft.partnerTwo}
                    onChange={(e) =>
                      setDraft((prev) => ({ ...prev, partnerTwo: e.target.value }))
                    }
                    className="w-full px-3.5 py-2.5 text-sm bg-white border border-[#E5E0E2] rounded-lg text-[#141214] focus:outline-none focus:ring-2 focus:ring-[#15803D]"
                  />
                </div>
              </div>

              <div>
                <label className="flex items-center gap-3 px-3.5 py-2.5 w-full bg-white border border-[#E5E0E2] rounded-lg cursor-pointer">
                  <input
                    type="checkbox"
                    checked={draft.ambientPetalsEnabled}
                    onChange={(e) =>
                      setDraft((prev) => ({
                        ...prev,
                        ambientPetalsEnabled: e.target.checked,
                      }))
                    }
                    className="w-4 h-4 accent-[#15803D]"
                  />
                  <span className="text-sm text-[#141214]">
                    Animación suave de pétalos
                  </span>
                </label>
              </div>

              <div>
                <label
                  htmlFor="cust-headline"
                  className="block text-xs font-medium text-[#574F53] mb-1.5"
                >
                  Titular principal
                </label>
                <input
                  id="cust-headline"
                  type="text"
                  required
                  value={draft.headline}
                  onChange={(e) =>
                    setDraft((prev) => ({ ...prev, headline: e.target.value }))
                  }
                  className="w-full px-3.5 py-2.5 text-sm bg-white border border-[#E5E0E2] rounded-lg text-[#141214] focus:outline-none focus:ring-2 focus:ring-[#15803D]"
                />
              </div>

              <div>
                <label
                  htmlFor="cust-subtitle"
                  className="block text-xs font-medium text-[#574F53] mb-1.5"
                >
                  Subtítulo introductorio
                </label>
                <textarea
                  id="cust-subtitle"
                  rows={2}
                  value={draft.subtitle}
                  onChange={(e) =>
                    setDraft((prev) => ({ ...prev, subtitle: e.target.value }))
                  }
                  className="w-full px-3.5 py-2.5 text-sm bg-white border border-[#E5E0E2] rounded-lg text-[#141214] focus:outline-none focus:ring-2 focus:ring-[#15803D]"
                />
              </div>

              <div>
                <label
                  htmlFor="cust-letter"
                  className="block text-xs font-medium text-[#574F53] mb-1.5"
                >
                  Carta de dedicación (separa párrafos con una línea en blanco)
                </label>
                <textarea
                  id="cust-letter"
                  rows={6}
                  required
                  value={draft.letter}
                  onChange={(e) =>
                    setDraft((prev) => ({ ...prev, letter: e.target.value }))
                  }
                  className="w-full px-3.5 py-2.5 text-sm bg-white border border-[#E5E0E2] rounded-lg text-[#141214] leading-relaxed focus:outline-none focus:ring-2 focus:ring-[#15803D]"
                />
              </div>

              <div className="pt-4 border-t border-[#E5E0E2] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                {!confirmReset ? (
                  <button
                    type="button"
                    onClick={() => setConfirmReset(true)}
                    className="inline-flex items-center gap-1.5 text-xs font-medium text-[#70656A] hover:text-[#15803D] transition-colors cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Restaurar valores iniciales</span>
                  </button>
                ) : (
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-[#15803D]">¿Confirmas restaurar todo?</span>
                    <button
                      type="button"
                      onClick={() => {
                        onResetAll();
                        onClose();
                      }}
                      className="px-3 py-1.5 text-xs font-medium text-white bg-[#15803D] rounded-md cursor-pointer"
                    >
                      Sí, restaurar
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmReset(false)}
                      className="px-2 py-1.5 text-xs text-[#574F53] cursor-pointer"
                    >
                      No
                    </button>
                  </div>
                )}

                <div className="flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 text-xs font-medium text-[#574F53] hover:text-[#141214] rounded-lg cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 text-xs font-medium text-white bg-[#15803D] hover:bg-[#166534] rounded-lg transition-colors cursor-pointer"
                  >
                    Guardar cambios
                  </button>
                </div>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
