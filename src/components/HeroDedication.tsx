import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { BookOpen, Heart, X, Edit3 } from 'lucide-react';
import type { DedicationProfile, SectionId } from '../types/dedication';
import { HERO_DEFAULT_IMAGE } from '../utils/storage';
import { SignaturePad } from './SignaturePad';

interface HeroDedicationProps {
  profile: DedicationProfile;
  partnerSignature: string | null;
  onChangePartnerSignature: (dataUrl: string | null) => void;
  onOpenCustomize: () => void;
  onSelectSection: (section: SectionId) => void;
}

export function HeroDedication({
  profile,
  partnerSignature,
  onChangePartnerSignature,
  onOpenCustomize,
  onSelectSection,
}: HeroDedicationProps) {
  const [letterOpen, setLetterOpen] = useState(false);
  const [imgError, setImgError] = useState(false);

  const formattedStartYear = (() => {
    const parsed = new Date(profile.startDateIso);
    if (Number.isNaN(parsed.getTime())) return '2022';
    return parsed.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });
  })();

  const paragraphs = profile.letter
    .split('\n\n')
    .map((p) => p.trim())
    .filter(Boolean);
  const hasShortGreeting = (paragraphs[0]?.length ?? 0) < 40 && paragraphs.length > 1;
  const previewGreeting = hasShortGreeting ? paragraphs[0] : null;
  const previewBody = hasShortGreeting ? paragraphs[1] : (paragraphs[0] ?? profile.letter);

  return (
    <section
      id="dedicatoria"
      className="pt-12 pb-16 sm:pt-16 sm:pb-20"
    >
      <div className="max-w-6xl mx-auto px-6 sm:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-stretch">
          {/* Left Column: Editorial Dedication */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-7 flex flex-col justify-between py-2"
          >
            <div>
              <p className="text-xs font-medium text-[#70656A] tracking-wide mb-4">
                <span>Archivo íntimo</span>
                <span aria-hidden="true" className="mx-2">·</span>
                <span>Desde {formattedStartYear}</span>
                <span aria-hidden="true" className="mx-2">·</span>
                <span>{profile.partnerOne} y {profile.partnerTwo}</span>
              </p>

              <h1 className="font-serif text-4xl sm:text-5xl lg:text-[3.5rem] font-medium leading-[1.08] tracking-tight text-[#141214] text-balance max-w-2xl">
                {profile.headline}
              </h1>

              <p className="mt-5 text-base sm:text-lg text-[#574F53] leading-relaxed max-w-xl">
                {profile.subtitle}
              </p>

              <div className="mt-8 pt-7 border-t border-[#E5E0E2] max-w-xl space-y-3">
                {previewGreeting && (
                  <p className="font-serif text-xl font-medium text-[#141214]">
                    {previewGreeting}
                  </p>
                )}
                <p className="text-[15px] sm:text-base text-[#292426] leading-[1.75] first-letter:text-5xl first-letter:font-serif first-letter:font-medium first-letter:float-left first-letter:mr-3 first-letter:mt-1 first-letter:leading-none first-letter:text-[#15803D]">
                  {previewBody}
                </p>
              </div>
            </div>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => setLetterOpen(true)}
                className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-[#15803D] hover:bg-[#166534] rounded-lg transition-colors duration-200 whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#15803D] focus-visible:ring-offset-2"
              >
                <BookOpen className="w-4 h-4" />
                <span>Leer carta completa</span>
              </button>

              <button
                type="button"
                onClick={() => onSelectSection('galeria')}
                className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-[#141214] bg-[#F2EFF0] hover:bg-[#E5E0E2] rounded-lg transition-colors duration-200 whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#15803D]"
              >
                <span>Ir a la galería</span>
              </button>
            </div>
          </motion.div>

          {/* Right Column: Framed Editorial Portrait */}
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-5 flex flex-col"
          >
            <figure className="flex-1 flex flex-col">
              <div className="relative flex-1 min-h-[300px] lg:min-h-[420px] rounded-2xl overflow-hidden bg-[#F2EFF0] border border-[#E5E0E2]">
                {!imgError ? (
                  <img
                    src={HERO_DEFAULT_IMAGE}
                    alt={`${profile.coupleNames} caminando juntos al atardecer`}
                    referrerPolicy="no-referrer"
                    onError={() => setImgError(true)}
                    className="w-full h-full object-cover lg:absolute lg:inset-0"
                  />
                ) : (
                  <div className="w-full h-full min-h-[300px] flex flex-col items-center justify-center p-8 text-center bg-gradient-to-br from-[#F2EFF0] to-[#E5E0E2]">
                    <Heart className="w-8 h-8 text-[#15803D] mb-3" />
                    <p className="font-serif text-xl text-[#141214]">{profile.coupleNames}</p>
                  </div>
                )}
              </div>
              <figcaption className="mt-3 text-xs font-serif italic text-[#70656A]">
                {profile.heroCaption}
              </figcaption>
            </figure>
          </motion.div>
        </div>
      </div>

      {/* Full Dedication Letter Reading Modal */}
      <AnimatePresence>
        {letterOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-[#141214]/65 backdrop-blur-sm"
            role="dialog"
            aria-modal="true"
            aria-labelledby="letter-modal-title"
            onClick={() => setLetterOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, y: 16, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 12, scale: 0.98 }}
              transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-2xl max-h-[85vh] overflow-y-auto bg-[#FAF9F7] rounded-2xl border border-[#E5E0E2] p-6 sm:p-10 shadow-xl"
            >
              <button
                type="button"
                onClick={() => setLetterOpen(false)}
                aria-label="Cerrar carta"
                className="absolute top-5 right-5 w-10 h-10 inline-flex items-center justify-center rounded-lg text-[#574F53] hover:text-[#141214] hover:bg-[#F2EFF0] transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <p className="text-xs font-medium text-[#70656A] mb-2">
                Para {profile.partnerOne} · Con amor, {profile.partnerTwo}
              </p>
              <h2
                id="letter-modal-title"
                className="font-serif text-3xl sm:text-4xl font-medium text-[#141214] text-balance pr-10"
              >
                {profile.headline}
              </h2>

              <div className="mt-6 pt-6 border-t border-[#E5E0E2] space-y-5 text-[16px] leading-[1.8] text-[#292426] max-w-prose">
                {paragraphs.map((para, idx) => {
                  const isSalutation = hasShortGreeting && idx === 0;
                  const isDropCap = hasShortGreeting ? idx === 1 : idx === 0;
                  return (
                    <p
                      key={idx}
                      className={
                        isSalutation
                          ? 'font-serif text-xl font-medium text-[#141214]'
                          : isDropCap
                          ? 'first-letter:text-5xl first-letter:font-serif first-letter:font-medium first-letter:float-left first-letter:mr-3 first-letter:mt-1 first-letter:leading-none first-letter:text-[#15803D]'
                          : ''
                      }
                    >
                      {para}
                    </p>
                  );
                })}
              </div>

              <div className="mt-8 pt-6 border-t border-[#E5E0E2]">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 text-center mb-6 items-end">
                  <div className="flex flex-col items-center">
                    <div className="w-full max-w-[220px] pb-1.5 border-b-2 border-dotted border-[#9E9398] flex flex-col items-center">
                      <SignaturePad
                        value={partnerSignature}
                        onChange={onChangePartnerSignature}
                        heightClass="h-20"
                      />
                    </div>
                    <span className="mt-1.5 text-xs text-[#70656A]">Firma</span>
                    <span className="mt-0.5 text-xs font-medium text-[#141214]">
                      Leidy Diana Ponce Berna
                    </span>
                  </div>
                  <div className="flex flex-col items-center">
                    <div className="h-[86px] w-full max-w-[220px] flex items-end justify-center border-b-2 border-dotted border-[#9E9398] pb-1.5">
                      <img
                        src="./assets/aistudio/Dibujo_9d6c1bce.png"
                        alt="Firma de Luis Felipe Cuya Ruiz"
                        referrerPolicy="no-referrer"
                        className="max-h-20 w-auto object-contain select-none brightness-0"
                      />
                    </div>
                    <span className="mt-1.5 text-xs text-[#70656A]">Firma</span>
                    <span className="mt-0.5 text-xs font-medium text-[#141214]">
                      Luis Felipe Cuya Ruiz
                    </span>
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => {
                      setLetterOpen(false);
                      onOpenCustomize();
                    }}
                    className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-[#141214] bg-[#F2EFF0] hover:bg-[#E5E0E2] rounded-lg transition-colors cursor-pointer"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Editar carta</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
