import { useState } from 'react';
import { motion } from 'motion/react';
import { Menu, X } from 'lucide-react';
import type { SectionId } from '../types/dedication';

interface HeaderProps {
  coupleNames: string;
  activeSection: SectionId;
  onSelectSection: (section: SectionId) => void;
  onOpenCustomize: () => void;
}

const NAV_ITEMS: Array<{ id: SectionId; label: string }> = [
  { id: 'dedicatoria', label: 'Dedicatoria' },
  { id: 'contador', label: 'Tiempo juntos' },
  { id: 'recuerdos', label: 'Recuerdos' },
  { id: 'galeria', label: 'Galería' },
];

export function Header({
  coupleNames,
  activeSection,
  onSelectSection,
  onOpenCustomize,
}: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSelect = (id: SectionId) => {
    onSelectSection(id);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-30 bg-[#E7F8E8]/88 backdrop-blur-md border-b border-[#D5E6D6]">
      <div className="max-w-6xl mx-auto px-6 sm:px-8 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Single-line editorial wordmark */}
        <button
          type="button"
          onClick={() => handleSelect('dedicatoria')}
          className="font-serif text-xl sm:text-2xl font-medium tracking-tight text-[#141214] whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#15803D] rounded-sm"
        >
          {coupleNames}
        </button>

        {/* Zone 2: 4 concise single-line section activation buttons */}
        <nav
          aria-label="Secciones de la dedicatoria"
          className="hidden md:flex items-center gap-7 text-sm font-medium"
        >
          {NAV_ITEMS.map((item) => {
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleSelect(item.id)}
                aria-current={isActive ? 'page' : undefined}
                className={`relative py-1 transition-colors duration-200 whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#15803D] rounded-sm ${
                  isActive
                    ? 'text-[#15803D]'
                    : 'text-[#574F53] hover:text-[#141214]'
                }`}
              >
                <span>{item.label}</span>
                {isActive && (
                  <motion.span
                    layoutId="active-section-underline"
                    transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                    className="absolute left-0 right-0 -bottom-0.5 h-[1.5px] bg-[#15803D]"
                  />
                )}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: Single primary action */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={onOpenCustomize}
            className="hidden sm:inline-flex items-center justify-center px-4 py-2 text-xs font-medium text-white bg-[#15803D] hover:bg-[#166534] rounded-lg transition-colors duration-200 whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#15803D] focus-visible:ring-offset-2"
          >
            Personalizar
          </button>

          <button
            type="button"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            aria-label={mobileMenuOpen ? 'Cerrar menú' : 'Abrir menú'}
            aria-expanded={mobileMenuOpen}
            className="md:hidden inline-flex items-center justify-center w-11 h-11 rounded-lg text-[#141214] hover:bg-[#F2EFF0] transition-colors cursor-pointer"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile navigation drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-[#D5E6D6] bg-[#F7FCE6] px-6 py-4 flex flex-col gap-2">
          {NAV_ITEMS.map((item) => {
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleSelect(item.id)}
                className={`py-2.5 px-3 text-left text-sm font-medium rounded-lg transition-colors cursor-pointer ${
                  isActive
                    ? 'bg-[#ECFDF5] text-[#15803D]'
                    : 'text-[#141214] hover:bg-[#F2EFF0]'
                }`}
              >
                {item.label}
              </button>
            );
          })}
          <button
            type="button"
            onClick={() => {
              setMobileMenuOpen(false);
              onOpenCustomize();
            }}
            className="mt-2 w-full py-2.5 px-4 text-sm font-medium text-white bg-[#15803D] hover:bg-[#166534] rounded-lg transition-colors cursor-pointer"
          >
            Personalizar página
          </button>
        </div>
      )}
    </header>
  );
}
