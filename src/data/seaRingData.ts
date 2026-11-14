export type WorldKey = 'build' | 'brand' | 'learn' | 'ai';

export interface RingSite {
  id: number;
  title: string;
  slug: string;
  videoUrl: string;
  posterUrl: string;
  ratio: number;
  world: 'build' | 'brand' | 'learn';
  alwaysShowLabel?: boolean;
  objectPosition?: string;
}

export interface PetalSpec {
  left: number;
  top: number;
  width: number;
  duration: number;
  delay: number;
  color: '#FFFFFF' | '#D6EEF3';
  mirrored: boolean;
}

export interface MoteSpec {
  left: number;
  top: number;
  size: number;
  duration: number;
  delay: number;
}

export const SEA_STILL_URL =
  './assets/aistudio/wp1892101-anime-4k-your-name-wallpapers_ab5fd9a6.jpg';

export const SEA_VIDEO_URL = '';

const RAW_SITES: Array<
  [string, string, string, number, number, 'build' | 'brand' | 'learn', string]
> = [
  [
    'Corazón a Distancia',
    'corazon-a-distancia',
    './assets/aistudio/image_f54abd78.png',
    920,
    1440,
    'brand',
    '50% 25%',
  ],
  [
    'Único e Inigualable',
    'unico-e-inigualable',
    './assets/aistudio/image_21a5c947.png',
    960,
    1440,
    'build',
    '50% 28%',
  ],
  [
    'Medio Corazón',
    'medio-corazon',
    './assets/aistudio/image_3cd78521.png',
    920,
    1440,
    'brand',
    '50% 26%',
  ],
  [
    'Fox Couture',
    'fox-couture',
    './assets/aistudio/image_319d6fb8.png',
    1000,
    1440,
    'build',
    '50% 35%',
  ],
  [
    'Tu Mirada',
    'tu-mirada',
    './assets/aistudio/image_f129c9a6.png',
    920,
    1440,
    'build',
    '50% 22%',
  ],
  [
    'Tu Graduación',
    'tu-graduacion',
    './assets/aistudio/image_eeef0090.png',
    940,
    1440,
    'build',
    '50% 22%',
  ],
  [
    'Mi Polluelita',
    'mi-polluelita',
    './assets/aistudio/image_faf81bbd.png',
    1000,
    1440,
    'brand',
    '50% 25%',
  ],
  [
    'Paz y Guiño',
    'paz-y-guino',
    './assets/aistudio/image_dbc467a1.png',
    920,
    1440,
    'brand',
    '50% 24%',
  ],
  [
    'Mi Estrellita',
    'mi-estrellita',
    './assets/aistudio/image_06363085.png',
    920,
    1440,
    'learn',
    '50% 26%',
  ],
  [
    'Nuestras Llamadas',
    'nuestras-llamadas',
    './assets/aistudio/image_c0158469.png',
    920,
    1440,
    'build',
    '50% 24%',
  ],
  [
    '31 de Agosto',
    '31-de-agosto',
    './assets/aistudio/image_dfb3ff96.png',
    960,
    1440,
    'learn',
    '50% 28%',
  ],
  [
    'Siempre Radiante',
    'siempre-radiante',
    './assets/aistudio/image_eeef0090.png',
    940,
    1440,
    'learn',
    '50% 22%',
  ],
  [
    'Juntos Siempre',
    'juntos-siempre',
    './assets/aistudio/image_f54abd78.png',
    920,
    1440,
    'brand',
    '50% 25%',
  ],
  [
    'Luz en mi Vida',
    'luz-en-mi-vida',
    './assets/aistudio/image_faf81bbd.png',
    1000,
    1440,
    'learn',
    '50% 25%',
  ],
  [
    'Cada Sonrisa',
    'cada-sonrisa',
    './assets/aistudio/image_dbc467a1.png',
    920,
    1440,
    'build',
    '50% 24%',
  ],
  [
    'Noches Contigo',
    'noches-contigo',
    './assets/aistudio/image_c0158469.png',
    920,
    1440,
    'brand',
    '50% 24%',
  ],
];

export const RING_SITES: RingSite[] = RAW_SITES.map(
  ([title, slug, posterPath, w, h, world, objectPosition], index) => ({
    id: index + 1,
    title,
    slug,
    videoUrl: '',
    posterUrl: posterPath,
    ratio: w / h,
    world,
    alwaysShowLabel: slug === 'fox-couture',
    objectPosition,
  })
);

export const WORLD_META: Record<
  WorldKey,
  {
    label: string;
    color: string;
    onColor: string;
    blurb: string;
    featuredSiteIndex?: number;
  }
> = {
  build: {
    label: 'MOMENTOS',
    color: '#3AA8D0',
    onColor: '#04121A',
    blurb: 'Cada paso que dimos desde el primer día hasta nuestra historia hoy.',
    featuredSiteIndex: 1,
  },
  brand: {
    label: 'SIEMPRE',
    color: '#EEF4F6',
    onColor: '#0A0E11',
    blurb: 'Detalles, risas y sueños compartidos que siguen iluminando mi vida.',
    featuredSiteIndex: 0,
  },
  learn: {
    label: 'NOSOTROS',
    color: '#9ED8E4',
    onColor: '#0E2A3B',
    blurb: 'Cinco años y once meses caminando de la mano con Dios en el centro.',
    featuredSiteIndex: 8,
  },
  ai: {
    label: 'PARA TI, GIDY',
    color: '#9ED8E4',
    onColor: '#0A0E11',
    blurb: 'Un espacio íntimo para dejarte una promesa o un nuevo recuerdo.',
  },
};

const RAW_BACK_PETALS: Array<[number, number, number, number, number]> = [
  [4, 14, 9, 29, 0],
  [14, 4, 7, 34, -12],
  [24, 26, 8, 31, -21],
  [36, 10, 6, 37, -5],
  [46, 30, 9, 27, -16],
  [56, 6, 7, 33, -27],
  [66, 20, 8, 30, -9],
  [76, 2, 6, 36, -24],
  [86, 24, 9, 28, -3],
  [94, 12, 7, 35, -18],
  [30, 44, 6, 39, -31],
  [60, 40, 7, 32, -13],
];

const RAW_FRONT_PETALS: Array<[number, number, number, number, number]> = [
  [10, 50, 14, 23, -6],
  [40, 62, 12, 26, -19],
  [70, 56, 16, 21, -11],
  [88, 46, 13, 24, -2],
  [52, 70, 11, 28, -23],
];

export const BACK_PETALS: PetalSpec[] = RAW_BACK_PETALS.map(
  ([left, top, width, duration, delay], idx) => ({
    left,
    top,
    width,
    duration,
    delay,
    color: idx % 2 === 0 ? '#FFFFFF' : '#D6EEF3',
    mirrored: idx % 3 === 0,
  })
);

const FRONT_COLORS: Array<'#FFFFFF' | '#D6EEF3'> = [
  '#D6EEF3',
  '#FFFFFF',
  '#FFFFFF',
  '#D6EEF3',
  '#D6EEF3',
];

export const FRONT_PETALS: PetalSpec[] = RAW_FRONT_PETALS.map(
  ([left, top, width, duration, delay], idx) => ({
    left,
    top,
    width,
    duration,
    delay,
    color: FRONT_COLORS[idx],
    mirrored: idx % 3 === 0,
  })
);

export const ALL_PETALS: PetalSpec[] = [...BACK_PETALS, ...FRONT_PETALS];

const RAW_MOTES: Array<[number, number, number, number, number]> = [
  [8, 62, 10, 14, -2],
  [18, 40, 6, 18, -9],
  [27, 70, 14, 16, -5],
  [36, 52, 8, 20, -13],
  [44, 30, 5, 17, -3],
  [53, 66, 12, 15, -11],
  [61, 44, 7, 19, -7],
  [69, 74, 16, 14, -1],
  [77, 36, 6, 21, -15],
  [85, 58, 11, 16, -8],
  [92, 46, 7, 18, -4],
  [13, 82, 9, 22, -17],
  [48, 84, 13, 17, -6],
  [72, 22, 5, 23, -19],
];

export const LIGHT_MOTES: MoteSpec[] = RAW_MOTES.map(
  ([left, top, size, duration, delay]) => ({
    left,
    top,
    size,
    duration,
    delay,
  })
);
