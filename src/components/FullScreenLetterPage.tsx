import { motion } from 'motion/react';
import { ArrowRight, Heart } from 'lucide-react';
import type { DedicationProfile } from '../types/dedication';
import { SignaturePad } from './SignaturePad';

interface FullScreenLetterPageProps {
  profile: DedicationProfile;
  partnerSignature: string | null;
  onChangePartnerSignature: (dataUrl: string | null) => void;
  onContinue: () => void;
}

export function FullScreenLetterPage({
  profile,
  partnerSignature,
  onChangePartnerSignature,
  onContinue,
}: FullScreenLetterPageProps) {
  const paragraphs = profile.letter
    .split('\n\n')
    .map((p) => p.trim())
    .filter(Boolean);

  const hasSignature = Boolean(partnerSignature);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
      className="min-h-screen w-full bg-gradient-to-br from-[#E7F8E8] via-[#F7FCE6] to-[#FEF9D7] text-[#141214] flex flex-col"
    >
      {/* Fullscreen Expanded Editorial Love Letter */}
      <main className="flex-1 flex items-center justify-center px-6 sm:px-8 py-12 sm:py-16">
        <motion.article
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-3xl bg-white rounded-2xl border border-[#E5E0E2] p-8 sm:p-14 shadow-sm"
        >
          <div className="flex items-center justify-between gap-4 pb-6 border-b border-[#E5E0E2]">
            <p className="text-xs font-medium text-[#70656A]">
              Para {profile.partnerOne} De {profile.partnerTwo}
            </p>
            <Heart className="w-5 h-5 text-[#15803D] fill-[#15803D] shrink-0" />
          </div>

          <h1 className="mt-8 font-serif text-3xl sm:text-5xl font-medium leading-[1.12] tracking-tight text-[#141214] text-balance">
            {profile.headline}
          </h1>

          <div className="mt-8 space-y-6 text-base sm:text-[17px] leading-[1.85] text-[#292426] max-w-prose whitespace-pre-line">
            {paragraphs.map((paragraph, idx) => {
              const hasShortGreeting = paragraphs[0]?.length < 40 && paragraphs.length > 1;
              const isSalutation = hasShortGreeting && idx === 0;
              const isDropCap = hasShortGreeting ? idx === 1 : idx === 0;
              return (
                <p
                  key={idx}
                  className={
                    isSalutation
                      ? 'font-serif text-2xl sm:text-[26px] font-medium text-[#141214]'
                      : isDropCap
                      ? 'first-letter:text-5xl first-letter:font-serif first-letter:font-medium first-letter:float-left first-letter:mr-3 first-letter:mt-1 first-letter:leading-none first-letter:text-[#15803D]'
                      : ''
                  }
                >
                  {paragraph}
                </p>
              );
            })}
          </div>

          {/* Two-column signature zone */}
          <div className="mt-12 pt-8 border-t border-[#E5E0E2]">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-10 sm:gap-16 max-w-xl mx-auto text-center items-end">
              <div className="flex flex-col items-center">
                <div className="w-full max-w-[220px] pb-1.5 border-b-2 border-dotted border-[#9E9398] flex flex-col items-center">
                  <SignaturePad
                    value={partnerSignature}
                    onChange={onChangePartnerSignature}
                    heightClass="h-20"
                  />
                </div>
                <span className="mt-2 text-xs text-[#70656A]">Firma</span>
                <span className="mt-1 text-xs font-medium text-[#141214]">
                  Leidy Diana Ponce Berna
                </span>
              </div>

              <div className="flex flex-col items-center">
                <div className="h-[86px] w-full max-w-[220px] flex items-end justify-center border-b-2 border-dotted border-[#9E9398] pb-1.5">
                  <img
                    src="/assets/aistudio/Dibujo_9d6c1bce.png"
                    alt="Firma de Luis Felipe Cuya Ruiz"
                    referrerPolicy="no-referrer"
                    className="max-h-20 w-auto object-contain select-none brightness-0"
                  />
                </div>
                <span className="mt-2 text-xs text-[#70656A]">Firma</span>
                <span className="mt-1 text-xs font-medium text-[#141214]">
                  Luis Felipe Cuya Ruiz
                </span>
              </div>
            </div>
          </div>

          <div className="mt-10 pt-6 border-t border-[#E5E0E2] flex flex-wrap items-center justify-between gap-3">
            <p className="text-xs font-medium text-[#166534]">
              {hasSignature
                ? 'Firma registrada. Ya puedes continuar.'
                : 'Dibuja tu firma en el recuadro para habilitar Continuar.'}
            </p>
            <button
              type="button"
              disabled={!hasSignature}
              onClick={() => {
                if (hasSignature) onContinue();
              }}
              className={`inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium rounded-xl transition-colors whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#15803D] ${
                hasSignature
                  ? 'text-white bg-[#15803D] hover:bg-[#166534] cursor-pointer shadow-sm'
                  : 'text-[#6B7D6F] bg-[#E5EDE7] cursor-not-allowed opacity-75'
              }`}
            >
              <span>Continuar</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </motion.article>
      </main>
    </motion.div>
  );
}
