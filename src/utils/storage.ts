import heroCoupleImg from '../assets/images/hero_couple_editorial_1794618190066.jpg';
import coffeeMorningImg from '../assets/images/memory_coffee_morning_1794618189997.jpg';
import coastalSunsetImg from '../assets/images/memory_coastal_sunset_1794618190636.jpg';
import rainyWindowImg from '../assets/images/memory_rainy_window_1794618191117.jpg';
import autumnParkImg from '../assets/images/memory_autumn_park_1794618190502.jpg';

import type {
  DedicationProfile,
  MusicTrack,
  SharedMemory,
  SpecialPhoto,
} from '../types/dedication';

export const HERO_DEFAULT_IMAGE = heroCoupleImg;

export const DEFAULT_PROFILE: DedicationProfile = {
  coupleNames: 'Gidy & Naru',
  partnerOne: 'Gidy',
  partnerTwo: 'Naru',
  startDateIso: '2020-11-22T13:48',
  headline: 'Somos uno por siempre',
  subtitle:
    'Un archivo íntimo de nuestros días: las pequeñas rutinas, los viajes inesperados y todo lo que aún nos queda por escribir juntos.',
  letter:
    'Mi polluelita, 💚\n\nQuiero que sepas que te amo muchísimo, más de lo que a veces puedo expresar con palabras. Han pasado 5 años desde que nuestros corazones comenzaron a sentir algo tan bonito y especial, y si hay algo de lo que estoy seguro es de que eres una de las personas más importantes y maravillosas que Dios ha permitido que lleguen a mi vida.\n\nNo quiero que nunca dudes de lo mucho que significas para mí. Eres alguien que ocupa un lugar inmenso en mi corazón, alguien por quien siento un amor que crece cada día y con quien quisiera compartir muchísimas cosas más. No solamente quiero estar contigo en los momentos bonitos, cuando todo marcha bien y tenemos motivos para sonreír, sino también en aquellos días difíciles en los que necesitemos paciencia, comprensión, fuerzas y mucho amor para seguir adelante.\n\nQuiero darte lo mejor de mí. Quiero dedicarte mi tiempo, mi atención, mi esfuerzo y mi espacio. Quiero aprender a amarte cada día de una mejor manera, escucharte, comprenderte, apoyarte en tus sueños, celebrar tus logros, acompañarte en tus dificultades y ser esa persona con la que puedas sentirte tranquila, querida, valorada y segura. No quiero que mis palabras se queden solamente en promesas bonitas; quiero demostrártelo con mis acciones, con mis decisiones y con cada pequeño detalle que te haga sentir lo especial que eres para mí.\n\nQuiero verte feliz, quiero verte cumplir cada uno de tus sueños y alcanzar todo aquello que tu corazón anhela. Quiero ser parte de tus alegrías, de tus proyectos y de cada nueva etapa de tu vida. Quiero que sepas que no tienes que caminar sola, porque deseo estar a tu lado, apoyándote, impulsándote y recordándote lo valiosa que eres.\n\nY si Dios lo permite, quiero que sigamos construyendo una historia juntos. No sueño solamente con un presente a tu lado, también sueño con nuestro futuro: con nuestros planes, nuestras metas, nuestros logros, nuestro hogar y todas esas experiencias que algún día podamos recordar con una sonrisa. Quiero que Dios sea siempre el centro de nuestra relación, que nos enseñe a tener paciencia, a perdonarnos, a respetarnos y a elegirnos incluso cuando las circunstancias no sean fáciles.\n\nSé que el amor no consiste únicamente en decir «te amo», sino en demostrarlo cada día, en cuidar lo que tenemos, en tener disposición para mejorar y en luchar juntos por aquello que queremos construir. Y yo quiero esforzarme por eso. Quiero ser una mejor persona para mí, para ti y para el futuro que tanto anhelo compartir contigo.\n\nGracias por estos 5 años, por cada momento, cada sonrisa, cada recuerdo y por todo lo que hemos vivido. No sé exactamente qué nos deparará el mañana, pero sí sé que mi deseo es seguir caminando contigo, creciendo juntos y poniendo nuestro amor en las manos de Dios.\n\nTe amo muchísimo, mi niña. 💚 Nunca olvides lo importante que eres en mi vida, lo mucho que vales para mí y las ganas tan grandes que tengo de hacerte feliz. Si pudiera pedirle algo a Dios, sería que nos dé sabiduría, madurez y un corazón dispuesto para seguir construyendo algo hermoso, sincero y duradero.\n\nTe amo por lo que eres, por lo que significas en mi vida y por todo lo que todavía sueño vivir contigo. Quiero seguir eligiéndote, cuidándote y amándote, hoy, mañana y en cada etapa de nuestro futuro.💚🙏',
  heroCaption: 'Fig. 01 — Paseo al caer la tarde, nuestra primera escapada juntos.',
  ambientPetalsEnabled: true,
};

export const DEFAULT_MEMORIES: SharedMemory[] = [
  {
    id: 'mem-1',
    title: 'El café que se convirtió en cuatro horas de charla',
    dateLabel: '14 Jun 2022',
    location: 'Cafetería El Mirador',
    category: 'Primeros pasos',
    note: 'Pedimos dos expresos pensando en quedarnos veinte minutos y terminamos viendo encenderse las farolas de la plaza mientras hablábamos de libros y viajes.',
    favorite: true,
  },
  {
    id: 'mem-2',
    title: 'La lluvia imprevista bajo el toldo del tranvía',
    dateLabel: '19 Oct 2022',
    location: 'Centro Histórico',
    category: 'Cotidianos',
    note: 'Nos empapamos intentando correr hacia la esquina, pero terminar compartiendo un té caliente junto al cristal empañado fue mejor que cualquier plan.',
    favorite: true,
  },
  {
    id: 'mem-3',
    title: 'Silencio frente al mar en el muelle viejo',
    dateLabel: '11 Feb 2023',
    location: 'Costa Azul',
    category: 'Viajes',
    note: 'No dijimos casi nada durante media hora. Solo el sonido suave de las olas y tu cabeza apoyada en mi hombro viendo el cielo teñirse de rosa.',
    favorite: false,
  },
  {
    id: 'mem-4',
    title: 'Nuestra primera mañana en casa nueva',
    dateLabel: '03 Ago 2024',
    location: 'Nuestro apartamento',
    category: 'Hitos',
    note: 'Aún rodeados de cajas sin abrir, improvisamos desayuno sobre una manta en el suelo y brindamos con tazas distintas por todo lo que venía.',
    favorite: true,
  },
  {
    id: 'mem-5',
    title: 'Caminata entre hojas doradas de noviembre',
    dateLabel: '09 Nov 2025',
    location: 'Parque del Retiro',
    category: 'Cotidianos',
    note: 'El frío empezaba a notarse y me metiste la mano en el bolsillo del abrigo sin soltarme en todo el sendero.',
    favorite: false,
  },
];

export const DEFAULT_PHOTOS: SpecialPhoto[] = [
  {
    id: 'photo-1',
    title: 'Desayuno lento de domingo',
    dateLabel: '18 Ago 2024',
    hiddenMessage:
      '«Si pudiera detener un momento para siempre, sería el olor a café recién hecho sabiendo que acabas de despertar a mi lado.»',
    imageUrl: coffeeMorningImg,
    aspect: 'portrait',
    isCustom: false,
  },
  {
    id: 'photo-2',
    title: 'El último sol en el muelle',
    dateLabel: '11 Feb 2023',
    hiddenMessage:
      '«En esa foto estábamos en silencio, pero por dentro yo pensaba que nunca había sentido tanta paz como contigo.»',
    imageUrl: coastalSunsetImg,
    aspect: 'landscape',
    isCustom: false,
  },
  {
    id: 'photo-3',
    title: 'Tarde de lluvia y té caliente',
    dateLabel: '19 Oct 2022',
    hiddenMessage:
      '«Fuera caía una tormenta enorme y tú leías en voz baja mientras afuera pasaba el tranvía. Ese día supe que eras mi hogar.»',
    imageUrl: rainyWindowImg,
    aspect: 'square',
    isCustom: false,
  },
  {
    id: 'photo-4',
    title: 'Sendero de otoño sin prisa',
    dateLabel: '09 Nov 2025',
    hiddenMessage:
      '«Caminar a tu paso es mi forma favorita de recorrer cualquier estación del año. Gracias por caminar siempre a mi lado.»',
    imageUrl: autumnParkImg,
    aspect: 'landscape',
    isCustom: false,
  },
];

export const DEFAULT_BUILTIN_TRACKS: MusicTrack[] = [
  {
    id: 'track-nocturne',
    title: 'Nocturno en Do Mayor',
    artist: 'Piano suave integrado',
    kind: 'builtin-nocturne',
  },
  {
    id: 'track-waltz',
    title: 'Vals de Atardecer',
    artist: 'Melodía acústica integrada',
    kind: 'builtin-waltz',
  },
];

const DB_NAME = 'nuestra_historia_db';
const DB_VERSION = 1;
const STORE_NAME = 'dedication_state';

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function idbGet<T>(key: string): Promise<T | null> {
  try {
    const db = await openDatabase();
    return await new Promise<T | null>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.get(key);
      req.onsuccess = () => resolve((req.result as T | undefined) ?? null);
      req.onerror = () => reject(req.error);
    });
  } catch {
    return null;
  }
}

export async function idbSet<T>(key: string, value: T): Promise<void> {
  try {
    const db = await openDatabase();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.put(value, key);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch {
    // Graceful silent fallback if IndexedDB is restricted in sandboxed context
  }
}

export async function idbClearAll(): Promise<void> {
  try {
    const db = await openDatabase();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.clear();
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch {
    // Ignore
  }
}
