import { useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';

interface OpeningChickGateProps {
  onOpen: () => void;
}

export function OpeningChickGate({ onOpen }: OpeningChickGateProps) {
  const prefersReducedMotion = useReducedMotion();
  const [imgError, setImgError] = useState(false);

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-[#E7F8E8] via-[#F7FCE6] to-[#FEF9D7] flex flex-col items-center justify-center px-6 py-12">
      <motion.div
        initial={{ opacity: 0, scale: 0.94 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="flex flex-col items-center gap-8"
      >
        {/* Medium-sized 3D chick blended over soft baby green & yellow background */}
        <div className="w-52 sm:w-64 flex items-center justify-center">
          {!imgError ? (
            <motion.img
              src="./assets/aistudio/image_bf2475da.png"
              alt="Pollito en 3D sosteniendo un corazón"
              referrerPolicy="no-referrer"
              onError={() => setImgError(true)}
              animate={
                prefersReducedMotion
                  ? undefined
                  : {
                      y: [0, -10, 0, -5, 0],
                      rotate: [0, -1.5, 0, 1.5, 0],
                    }
              }
              transition={{
                duration: 2.2,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
              className="w-full h-auto object-contain select-none mix-blend-multiply"
            />
          ) : (
            <div className="w-44 h-44 flex items-center justify-center rounded-2xl bg-white/90 border border-[#D5E6D6]">
              <span className="font-serif text-lg text-[#141214]">Pollito</span>
            </div>
          )}
        </div>

        {/* Single Ábreme button */}
        <motion.button
          type="button"
          onClick={onOpen}
          whileHover={prefersReducedMotion ? undefined : { scale: 1.04 }}
          whileTap={prefersReducedMotion ? undefined : { scale: 0.96 }}
          transition={{ duration: 0.16, ease: [0.16, 1, 0.3, 1] }}
          className="px-10 py-3.5 text-base font-semibold text-[#141214] bg-[#FACC15] hover:bg-[#15803D] hover:text-white rounded-xl shadow-sm transition-colors duration-200 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#15803D] focus-visible:ring-offset-2"
        >
          Ábreme
        </motion.button>
      </motion.div>
    </div>
  );
}
