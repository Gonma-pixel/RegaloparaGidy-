export type SectionId = 'dedicatoria' | 'contador' | 'recuerdos' | 'galeria';

export type MemoryCategory = 'Primeros pasos' | 'Viajes' | 'Cotidianos' | 'Hitos';

export interface DedicationProfile {
  coupleNames: string;
  partnerOne: string;
  partnerTwo: string;
  startDateIso: string; // e.g. '2022-06-14T19:30'
  headline: string;
  subtitle: string;
  letter: string;
  heroCaption: string;
  ambientPetalsEnabled: boolean;
}

export interface SharedMemory {
  id: string;
  title: string;
  dateLabel: string;
  location: string;
  category: MemoryCategory;
  note: string;
  favorite: boolean;
}

export interface SpecialPhoto {
  id: string;
  title: string;
  dateLabel: string;
  hiddenMessage: string;
  imageUrl: string;
  aspect?: 'landscape' | 'portrait' | 'square';
  isCustom?: boolean;
}

export interface MusicTrack {
  id: string;
  title: string;
  artist: string;
  kind: 'builtin-nocturne' | 'builtin-waltz' | 'custom';
  audioDataUrl?: string;
}
