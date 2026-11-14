import { useEffect, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import {
  ArrowLeft,
  ChevronDown,
  Film,
  Hash,
  Heart,
  Music,
  Paintbrush,
  Pause,
  PenTool,
  Play,
  Plus,
  Sparkles,
} from 'lucide-react';
import {
  MagicalDrawingCanvas,
  type MagicalDrawingOrigin,
} from './MagicalDrawingCanvas';
import movieWeatheringYouImg from '../assets/images/movie_weathering_you_1794675337740.jpg';
import movieStandBesosOneImg from '../assets/images/movie_stand_besos_one_1794675337871.jpg';
import movieStandBesosTwoImg from '../assets/images/movie_stand_besos_two_1794675338423.jpg';
import movieElDramaImg from '../assets/images/movie_el_drama_1794675338908.jpg';
import movieVozSilenciosaImg from '../assets/images/movie_voz_silenciosa_1794675339920.jpg';
import movieAngryBirdsTwoImg from '../assets/images/movie_angry_birds_two_1794675339008.jpg';
import songKatawaredokiImg from '../assets/images/song_katawaredoki_1794675374185.jpg';
import songSaturnoImg from '../assets/images/song_saturno_1794675355647.jpg';
import songPorPrimeraVezImg from '../assets/images/song_por_primera_vez_1794675357113.jpg';
import songFavoritoImg from '../assets/images/song_favorito_1794675357300.jpg';
import songTeLlevoConmigoImg from '../assets/images/song_te_llevo_conmigo_1794675668558.jpg';
import songNoHayNadieMasImg from '../assets/images/song_no_hay_nadie_mas_1794675358447.jpg';
import songLaMedallaImg from '../assets/images/song_la_medalla_1794675358594.jpg';
import heroCoupleImg from '../assets/images/hero_couple_editorial_1794618190066.jpg';
import { idbGet, idbSet } from '../utils/storage';

interface MovieItem {
  id: string;
  title: string;
  tag: string;
  note: string;
  imageUrl?: string;
  favorite: boolean;
}

interface SongItem {
  id: string;
  title: string;
  artist: string;
  note: string;
  imageUrl?: string;
  playableYourName?: boolean;
  favorite: boolean;
}

interface HashtagItem {
  id: string;
  tag: string;
  count: number;
}

interface OurMomentsPageProps {
  coupleNames: string;
  musicPlaying: boolean;
  onToggleMusic: () => void;
  onBack: () => void;
}

const STORAGE_KEYS = {
  movies: 'dedication_moments_movies_v2',
  songs: 'dedication_moments_songs_v3',
  hashtags: 'dedication_moments_hashtags_v1',
  legacyMovies: 'dedication_moments_movies_v1',
  legacySongs: 'dedication_moments_songs_v2',
};

const YOUR_NAME_BG =
  '/assets/aistudio/wp1892101-anime-4k-your-name-wallpapers_ab5fd9a6.jpg';

const PAGE_MEDIA_POOL = [
  YOUR_NAME_BG,
  heroCoupleImg,
  movieStandBesosOneImg,
  movieStandBesosTwoImg,
  songSaturnoImg,
  songPorPrimeraVezImg,
  songLaMedallaImg,
];

const DEFAULT_MOVIES: MovieItem[] = [
  {
    id: 'mov-1',
    title: 'Your Name (Kimi no Na wa)',
    tag: 'Anime · Favorita',
    note: 'Nuestra historia en el cielo y el hilo que siempre vuelve a unir nuestros caminos.',
    imageUrl: YOUR_NAME_BG,
    favorite: true,
  },
  {
    id: 'mov-2',
    title: 'El Tiempo Contigo (Weathering with You)',
    tag: 'Anime · Romance',
    note: 'Eligiendo estar juntos incluso cuando afuera llueve sin parar.',
    imageUrl: movieWeatheringYouImg,
    favorite: true,
  },
  {
    id: 'mov-3',
    title: 'Stand de Besos 1',
    tag: 'Romance · Comedia',
    note: 'Entre luces de feria, risas cómplices y ese primer momento inolvidable.',
    imageUrl: movieStandBesosOneImg,
    favorite: true,
  },
  {
    id: 'mov-4',
    title: 'Stand de besos 2',
    tag: 'Romance · Comedia',
    note: 'Segundas partes llenas de emociones, promesas y ganas de vernos siempre.',
    imageUrl: movieStandBesosTwoImg,
    favorite: false,
  },
  {
    id: 'mov-5',
    title: 'El drama',
    tag: 'Cine · Romance',
    note: 'De esas historias intensas que disfrutamos comentando abrazados.',
    imageUrl: movieElDramaImg,
    favorite: false,
  },
  {
    id: 'mov-6',
    title: 'Una Voz Silenciosa (Koe no Katachi)',
    tag: 'Anime · Emoción',
    note: 'De esas películas que se quedan guardadas por todo lo que hacen sentir.',
    imageUrl: movieVozSilenciosaImg,
    favorite: false,
  },
  {
    id: 'mov-7',
    title: 'Angry birds 2',
    tag: 'Animación · Aventura',
    note: 'Risas sin parar viendo aventuras juntos y disfrutando cada escena divertida.',
    imageUrl: movieAngryBirdsTwoImg,
    favorite: true,
  },
];

const DEFAULT_SONGS: SongItem[] = [
  {
    id: 'song-1',
    title: 'Katawaredoki / Sparkle',
    artist: 'RADWIMPS · Your Name',
    note: 'La melodía de nuestro cielo estrellado y nuestro reencuentro.',
    imageUrl: songKatawaredokiImg,
    playableYourName: true,
    favorite: true,
  },
  {
    id: 'song-2',
    title: 'Saturno',
    artist: 'Pablo Alborán',
    note: 'Un amor tan grande que alcanza hasta las estrellas y cada pensamiento nuestro.',
    imageUrl: songSaturnoImg,
    favorite: true,
  },
  {
    id: 'song-3',
    title: 'Por Primera Vez',
    artist: 'Camilo',
    note: 'Porque contigo cada día se siente tan bonito y mágico como la primera vez.',
    imageUrl: songPorPrimeraVezImg,
    favorite: true,
  },
  {
    id: 'song-4',
    title: 'Favorito',
    artist: 'Camilo',
    note: 'Porque cada detalle contigo se vuelve mi momento favorito.',
    imageUrl: songFavoritoImg,
    favorite: false,
  },
  {
    id: 'song-5',
    title: 'Te llevo conmigo',
    artist: 'Restart',
    note: 'Porque a donde vaya siempre te llevo en mi corazón, en mis planes y en cada alegría.',
    imageUrl: songTeLlevoConmigoImg,
    favorite: true,
  },
  {
    id: 'song-6',
    title: 'No Hay Nadie Más',
    artist: 'Sebastián Yatra',
    note: 'Para recordarte siempre que no hay nadie como tú para mí.',
    imageUrl: songNoHayNadieMasImg,
    favorite: false,
  },
  {
    id: 'song-7',
    title: 'La Medalla',
    artist: 'Camilo, Evaluna Montaner',
    note: 'Nuestra canción para celebrar que el amor verdadero siempre merece lo mejor.',
    imageUrl: songLaMedallaImg,
    favorite: true,
  },
];

const DEFAULT_HASHTAGS: HashtagItem[] = [
  { id: 'tag-1', tag: 'SomosUnoPorSiempre', count: 12 },
  { id: 'tag-2', tag: 'MiPolluelita', count: 18 },
  { id: 'tag-3', tag: 'ConDiosEnElCentro', count: 15 },
  { id: 'tag-4', tag: 'NuestrosCaminosSeEncuentran', count: 9 },
  { id: 'tag-5', tag: 'GidyYNaru', count: 22 },
  { id: 'tag-6', tag: 'UnicoEInigualable', count: 11 },
  { id: 'tag-7', tag: 'MiEstrellita', count: 14 },
  { id: 'tag-8', tag: 'HoyYEnCadaEtapa', count: 8 },
  { id: 'tag-9', tag: 'HastaViejitos', count: 16 },
  { id: 'tag-10', tag: 'TeAmoMiNiña', count: 20 },
  { id: 'tag-11', tag: 'NuestroParaSiempre', count: 13 },
  { id: 'tag-12', tag: '22DeNoviembre', count: 19 },
];

const MOMENTS_PARTICLES = [
  { id: 0, left: '6%', delay: 0, duration: 11, size: 15, kind: 'heart' as const },
  { id: 1, left: '15%', delay: 2.3, duration: 13, size: 14, kind: 'sparkle' as const },
  { id: 2, left: '25%', delay: 1.1, duration: 10.5, size: 14, kind: 'music' as const },
  { id: 3, left: '37%', delay: 3.4, duration: 12.5, size: 17, kind: 'heart' as const },
  { id: 4, left: '51%', delay: 0.8, duration: 11.2, size: 13, kind: 'sparkle' as const },
  { id: 5, left: '64%', delay: 2.9, duration: 13.5, size: 15, kind: 'music' as const },
  { id: 6, left: '76%', delay: 1.6, duration: 10.8, size: 18, kind: 'heart' as const },
  { id: 7, left: '88%', delay: 3.2, duration: 11.8, size: 14, kind: 'sparkle' as const },
  { id: 8, left: '94%', delay: 0.4, duration: 12.2, size: 14, kind: 'heart' as const },
];

export function OurMomentsPage({
  coupleNames,
  musicPlaying,
  onToggleMusic,
  onBack,
}: OurMomentsPageProps) {
  const shouldReduceMotion = useReducedMotion();
  const [movies, setMovies] = useState<MovieItem[]>(DEFAULT_MOVIES);
  const [songs, setSongs] = useState<SongItem[]>(DEFAULT_SONGS);
  const [hashtags, setHashtags] = useState<HashtagItem[]>(DEFAULT_HASHTAGS);
  const [hydrated, setHydrated] = useState(false);
  const [tagBurstKey, setTagBurstKey] = useState<{ id: string; seq: number } | null>(null);
  const [favBurstId, setFavBurstId] = useState<{ id: string; seq: number } | null>(null);

  const [newMovieTitle, setNewMovieTitle] = useState('');
  const [newSongTitle, setNewSongTitle] = useState('');
  const [newSongArtist, setNewSongArtist] = useState('');
  const [newHashtag, setNewHashtag] = useState('');
  const [drawingOpen, setDrawingOpen] = useState(false);
  const [drawingOrigin, setDrawingOrigin] = useState<MagicalDrawingOrigin>({
    x: 500,
    y: 500,
  });

  useEffect(() => {
    let active = true;
    (async () => {
      const [
        savedMovies,
        savedSongs,
        savedTags,
        legacyMovies,
        legacySongs,
      ] = await Promise.all([
        idbGet<MovieItem[]>(STORAGE_KEYS.movies),
        idbGet<SongItem[]>(STORAGE_KEYS.songs),
        idbGet<HashtagItem[]>(STORAGE_KEYS.hashtags),
        idbGet<MovieItem[]>(STORAGE_KEYS.legacyMovies),
        idbGet<SongItem[]>(STORAGE_KEYS.legacySongs),
      ]);
      if (!active) return;

      if (savedMovies?.length) {
        setMovies(
          savedMovies.map((m, idx) => ({
            ...m,
            imageUrl:
              DEFAULT_MOVIES.find((d) => d.id === m.id)?.imageUrl ||
              m.imageUrl ||
              PAGE_MEDIA_POOL[idx % PAGE_MEDIA_POOL.length],
          }))
        );
      } else if (legacyMovies?.length) {
        const customMovies = legacyMovies.filter((m) => m.id.length > 6);
        setMovies([...customMovies, ...DEFAULT_MOVIES]);
      }

      if (savedSongs?.length) {
        setSongs(
          savedSongs.map((s, idx) => ({
            ...s,
            imageUrl:
              DEFAULT_SONGS.find((d) => d.id === s.id)?.imageUrl ||
              s.imageUrl ||
              PAGE_MEDIA_POOL[(idx + 1) % PAGE_MEDIA_POOL.length],
          }))
        );
      } else if (legacySongs?.length) {
        const customSongs = legacySongs.filter((s) => s.id.length > 7);
        setSongs([...customSongs, ...DEFAULT_SONGS]);
      }

      if (savedTags?.length) setHashtags(savedTags);
      setHydrated(true);
    })();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    void idbSet(STORAGE_KEYS.movies, movies);
  }, [movies, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    void idbSet(STORAGE_KEYS.songs, songs);
  }, [songs, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    void idbSet(STORAGE_KEYS.hashtags, hashtags);
  }, [hashtags, hydrated]);

  const handleAddMovie = (e: React.FormEvent) => {
    e.preventDefault();
    const title = newMovieTitle.trim();
    if (!title) return;
    setMovies((prev) => [
      {
        id: `mov-${Date.now()}`,
        title,
        tag: 'Vista juntos',
        note: 'Otro momento especial frente a la pantalla contigo.',
        imageUrl: PAGE_MEDIA_POOL[prev.length % PAGE_MEDIA_POOL.length],
        favorite: true,
      },
      ...prev,
    ]);
    setNewMovieTitle('');
  };

  const handleAddSong = (e: React.FormEvent) => {
    e.preventDefault();
    const title = newSongTitle.trim();
    if (!title) return;
    setSongs((prev) => [
      {
        id: `song-${Date.now()}`,
        title,
        artist: newSongArtist.trim() || coupleNames,
        note: 'Canción guardada en nuestra lista especial.',
        imageUrl: PAGE_MEDIA_POOL[(prev.length + 2) % PAGE_MEDIA_POOL.length],
        favorite: true,
      },
      ...prev,
    ]);
    setNewSongTitle('');
    setNewSongArtist('');
  };

  const handleAddHashtag = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = newHashtag.trim().replace(/^#+/, '');
    if (!clean) return;
    setHashtags((prev) => [
      { id: `tag-${Date.now()}`, tag: clean, count: 1 },
      ...prev,
    ]);
    setNewHashtag('');
  };

  return (
    <motion.div
      initial={
        shouldReduceMotion
          ? { opacity: 0 }
          : { clipPath: 'inset(0 100% 0 0)', opacity: 0.92 }
      }
      animate={
        shouldReduceMotion
          ? { opacity: 1 }
          : { clipPath: 'inset(0 0% 0 0)', opacity: 1 }
      }
      exit={
        shouldReduceMotion
          ? { opacity: 0 }
          : { clipPath: 'inset(0 100% 0 0)', opacity: 0.92 }
      }
      transition={{ duration: 0.62, ease: [0.16, 1, 0.3, 1] }}
      className="fixed inset-0 z-[180] overflow-y-auto bg-gradient-to-br from-[#E7F8E8] via-[#F7FCE6] to-[#FEF9D7] text-[#141214]"
    >
      {/* Floating Romantic Atmosphere */}
      <div aria-hidden="true" className="pointer-events-none fixed inset-0 overflow-hidden z-0">
        <motion.div
          animate={
            shouldReduceMotion
              ? undefined
              : { scale: [1, 1.14, 1], opacity: [0.36, 0.58, 0.36] }
          }
          transition={{ duration: 7.5, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute -top-24 -left-24 w-[28rem] h-[28rem] rounded-full bg-[#86EFAC]/35 blur-3xl"
        />
        <motion.div
          animate={
            shouldReduceMotion
              ? undefined
              : { scale: [1, 1.16, 1], opacity: [0.32, 0.52, 0.32] }
          }
          transition={{ duration: 8.5, repeat: Infinity, ease: 'easeInOut', delay: 1.4 }}
          className="absolute -bottom-28 -right-20 w-[30rem] h-[30rem] rounded-full bg-[#FDE68A]/45 blur-3xl"
        />
        <motion.div
          animate={
            shouldReduceMotion
              ? undefined
              : { scale: [1, 1.1, 1], opacity: [0.22, 0.38, 0.22] }
          }
          transition={{ duration: 6.8, repeat: Infinity, ease: 'easeInOut', delay: 0.6 }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[36rem] h-[22rem] rounded-full bg-[#A7F3D0]/30 blur-3xl"
        />

        {!shouldReduceMotion &&
          MOMENTS_PARTICLES.map((p) => (
            <motion.div
              key={p.id}
              initial={{ y: '108vh', opacity: 0, rotate: -10 }}
              animate={{
                y: ['108vh', '-10vh'],
                opacity: [0, 0.5, 0.5, 0],
                x: [0, p.id % 2 === 0 ? 22 : -22, 0],
                rotate: [0, p.id % 2 === 0 ? 18 : -18, 0],
              }}
              transition={{
                duration: p.duration,
                delay: p.delay,
                repeat: Infinity,
                ease: 'linear',
              }}
              style={{ left: p.left }}
              className="absolute top-0 text-[#15803D]/35"
            >
              {p.kind === 'heart' ? (
                <Heart
                  style={{ width: p.size, height: p.size }}
                  className="fill-[#22C55E]/20 text-[#15803D]/45"
                />
              ) : p.kind === 'music' ? (
                <Music
                  style={{ width: p.size, height: p.size }}
                  className="text-[#15803D]/40"
                />
              ) : (
                <Sparkles
                  style={{ width: p.size, height: p.size }}
                  className="text-[#16A34A]/45"
                />
              )}
            </motion.div>
          ))}
      </div>

      {/* Top Bar */}
      <header className="sticky top-0 z-20 bg-[#E7F8E8]/85 backdrop-blur-md border-b border-[#15803D]/15">
        <div className="max-w-6xl mx-auto px-5 sm:px-8 h-16 flex items-center justify-between gap-4">
          <motion.button
            type="button"
            whileHover={shouldReduceMotion ? undefined : { x: -2 }}
            whileTap={shouldReduceMotion ? undefined : { scale: 0.96 }}
            onClick={onBack}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/85 hover:bg-white border border-[#15803D]/25 text-xs font-medium text-[#15803D] shadow-xs transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Volver</span>
          </motion.button>

          <div className="inline-flex items-center gap-2 text-xs font-medium text-[#166534]">
            <motion.span
              animate={
                shouldReduceMotion
                  ? undefined
                  : { rotate: [0, 15, -10, 0], scale: [1, 1.15, 1] }
              }
              transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut' }}
              className="inline-flex"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#15803D]" />
            </motion.span>
            <span>{coupleNames} · Nuestros momentos juntos</span>
          </div>
        </div>
      </header>

      <motion.main
        initial={shouldReduceMotion ? undefined : { x: -24, opacity: 0 }}
        animate={shouldReduceMotion ? undefined : { x: 0, opacity: 1 }}
        transition={{ duration: 0.55, delay: 0.14, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 max-w-6xl mx-auto px-5 sm:px-8 py-10 sm:py-14 space-y-12"
      >
        {/* Hero Header */}
        <section className="text-center max-w-2xl mx-auto">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/85 backdrop-blur-sm border border-[#15803D]/20 shadow-xs text-xs font-medium text-[#15803D]">
            <motion.span
              animate={
                shouldReduceMotion
                  ? undefined
                  : { scale: [1, 1.25, 1, 1.15, 1] }
              }
              transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
              className="inline-flex"
            >
              <Heart className="w-3.5 h-3.5 fill-[#22C55E] text-[#15803D]" />
            </motion.span>
            <span>Nuestros momentos juntos</span>
          </span>
          <h1 className="mt-4 font-serif text-4xl sm:text-5xl font-medium tracking-tight text-[#141214] leading-[1.08] text-balance">
            Lo que vemos, escuchamos y{' '}
            <span className="italic text-[#15803D]">repetimos siempre</span>
          </h1>
          <p className="mt-3 text-sm sm:text-base text-[#4B5E4E] leading-relaxed">
            Un rincón con las películas que disfrutamos juntos, las canciones que suenan en nuestra historia y esas frases que decimos en tantos momentos.
          </p>
        </section>

        {/* Two-column Movies & Music */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          {/* Movies Section */}
          <motion.section
            initial={shouldReduceMotion ? undefined : { opacity: 0, y: 20 }}
            animate={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            aria-labelledby="moments-movies-title"
            className="relative overflow-hidden rounded-2xl bg-white/88 backdrop-blur-md border border-[#15803D]/20 p-6 sm:p-7 shadow-[0_14px_34px_-16px_rgba(20,83,45,0.2)]"
          >
            <div
              aria-hidden="true"
              className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[#86EFAC] via-[#15803D] to-[#86EFAC]"
            />

            <div className="flex items-center justify-between gap-3 pb-4 border-b border-[#E5E0E2]">
              <div className="flex items-center gap-2.5">
                <motion.div
                  whileHover={shouldReduceMotion ? undefined : { rotate: -8, scale: 1.08 }}
                  className="w-9 h-9 rounded-xl bg-[#ECFDF5] border border-[#15803D]/20 flex items-center justify-center text-[#15803D]"
                >
                  <Film className="w-4 h-4" />
                </motion.div>
                <div>
                  <h2
                    id="moments-movies-title"
                    className="font-serif text-2xl font-medium text-[#141214]"
                  >
                    Películas que hemos visto juntos
                  </h2>
                  <p className="text-xs text-[#4B5E4E]">
                    {movies.length} películas guardadas
                  </p>
                </div>
              </div>
            </div>

            <form onSubmit={handleAddMovie} className="mt-4 flex gap-2">
              <input
                type="text"
                value={newMovieTitle}
                onChange={(e) => setNewMovieTitle(e.target.value)}
                placeholder="Agregar otra película que vimos..."
                aria-label="Nombre de la película"
                className="flex-1 min-w-0 px-3.5 py-2 text-sm rounded-xl bg-[#FAFBF9] border border-[#15803D]/20 text-[#141214] placeholder:text-[#6B7D6F] focus:outline-none focus:border-[#15803D]"
              />
              <motion.button
                type="submit"
                whileHover={shouldReduceMotion ? undefined : { scale: 1.03 }}
                whileTap={shouldReduceMotion ? undefined : { scale: 0.96 }}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-white bg-[#15803D] hover:bg-[#166534] rounded-xl transition-colors shrink-0 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Agregar</span>
              </motion.button>
            </form>

            <ul className="mt-5 space-y-3">
              {movies.map((movie, idx) => {
                const thumbUrl =
                  movie.imageUrl || PAGE_MEDIA_POOL[idx % PAGE_MEDIA_POOL.length];
                const isBurst = favBurstId?.id === movie.id;
                return (
                  <motion.li
                    key={movie.id}
                    initial={shouldReduceMotion ? undefined : { opacity: 0, x: -16 }}
                    animate={shouldReduceMotion ? undefined : { opacity: 1, x: 0 }}
                    transition={{
                      duration: 0.45,
                      delay: 0.05 * Math.min(idx, 8),
                      ease: [0.16, 1, 0.3, 1],
                    }}
                    whileHover={shouldReduceMotion ? undefined : { y: -3, scale: 1.01 }}
                    className="group relative rounded-xl bg-[#FAFDF9] border border-[#15803D]/15 hover:border-[#15803D]/45 hover:shadow-[0_10px_24px_-12px_rgba(21,128,61,0.28)] p-3.5 transition-shadow flex items-start justify-between gap-3"
                  >
                    <div className="flex items-start gap-3.5 min-w-0">
                      <div className="w-20 h-20 sm:w-22 sm:h-22 rounded-xl overflow-hidden border border-[#15803D]/20 bg-[#ECFDF5] shrink-0 shadow-xs">
                        <img
                          src={thumbUrl}
                          alt={movie.title}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-110"
                        />
                      </div>

                      <div className="min-w-0">
                        <span className="inline-block text-[10px] font-mono uppercase tracking-wider text-[#15803D] bg-[#ECFDF5] px-2 py-0.5 rounded-md mb-1">
                          {movie.tag}
                        </span>
                        <h3 className="font-serif text-lg font-medium text-[#141214] leading-snug">
                          {movie.title}
                        </h3>
                        <p className="mt-1 text-xs sm:text-sm text-[#4B5E4E] leading-relaxed">
                          {movie.note}
                        </p>
                      </div>
                    </div>

                    <div className="relative shrink-0">
                      <motion.button
                        type="button"
                        whileTap={shouldReduceMotion ? undefined : { scale: 0.78 }}
                        onClick={() => {
                          setMovies((prev) =>
                            prev.map((m) =>
                              m.id === movie.id ? { ...m, favorite: !m.favorite } : m
                            )
                          );
                          setFavBurstId((prev) => ({
                            id: movie.id,
                            seq: (prev?.seq ?? 0) + 1,
                          }));
                        }}
                        aria-label={
                          movie.favorite ? 'Quitar de favoritas' : 'Marcar favorita'
                        }
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-[#15803D] hover:bg-[#ECFDF5] transition-colors cursor-pointer"
                      >
                        <motion.span
                          animate={
                            movie.favorite && !shouldReduceMotion
                              ? { scale: [1, 1.25, 1] }
                              : undefined
                          }
                          transition={{ duration: 0.35 }}
                          className="inline-flex"
                        >
                          <Heart
                            className={`w-4 h-4 ${
                              movie.favorite
                                ? 'fill-[#22C55E] text-[#15803D]'
                                : 'text-[#6B7D6F]'
                            }`}
                          />
                        </motion.span>
                      </motion.button>

                      <AnimatePresence>
                        {isBurst && !shouldReduceMotion && (
                          <motion.span
                            key={favBurstId.seq}
                            initial={{ opacity: 0.95, y: 0, scale: 0.6 }}
                            animate={{ opacity: 0, y: -22, scale: 1.2 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.65, ease: 'easeOut' }}
                            aria-hidden="true"
                            className="pointer-events-none absolute -top-1 left-2 text-[#15803D]"
                          >
                            <Heart className="w-3.5 h-3.5 fill-[#22C55E]" />
                          </motion.span>
                        )}
                      </AnimatePresence>
                    </div>
                  </motion.li>
                );
              })}
            </ul>
          </motion.section>

          {/* Music Section */}
          <motion.section
            initial={shouldReduceMotion ? undefined : { opacity: 0, y: 20 }}
            animate={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.28, ease: [0.16, 1, 0.3, 1] }}
            aria-labelledby="moments-music-title"
            className="relative overflow-hidden rounded-2xl bg-white/88 backdrop-blur-md border border-[#15803D]/20 p-6 sm:p-7 shadow-[0_14px_34px_-16px_rgba(20,83,45,0.2)]"
          >
            <div
              aria-hidden="true"
              className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[#86EFAC] via-[#15803D] to-[#86EFAC]"
            />

            <div className="flex items-center justify-between gap-3 pb-4 border-b border-[#E5E0E2]">
              <div className="flex items-center gap-2.5">
                <motion.div
                  animate={
                    musicPlaying && !shouldReduceMotion
                      ? { rotate: [0, -8, 8, 0] }
                      : undefined
                  }
                  transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
                  whileHover={shouldReduceMotion ? undefined : { rotate: 8, scale: 1.08 }}
                  className="w-9 h-9 rounded-xl bg-[#ECFDF5] border border-[#15803D]/20 flex items-center justify-center text-[#15803D]"
                >
                  <Music className="w-4 h-4" />
                </motion.div>
                <div>
                  <h2
                    id="moments-music-title"
                    className="font-serif text-2xl font-medium text-[#141214]"
                  >
                    Músicas que escuchamos juntos
                  </h2>
                  <p className="text-xs text-[#4B5E4E]">
                    {songs.length} canciones especiales
                  </p>
                </div>
              </div>
            </div>

            <form onSubmit={handleAddSong} className="mt-4 flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                value={newSongTitle}
                onChange={(e) => setNewSongTitle(e.target.value)}
                placeholder="Nombre de la canción..."
                aria-label="Nombre de la canción"
                className="flex-1 min-w-0 px-3.5 py-2 text-sm rounded-xl bg-[#FAFBF9] border border-[#15803D]/20 text-[#141214] placeholder:text-[#6B7D6F] focus:outline-none focus:border-[#15803D]"
              />
              <input
                type="text"
                value={newSongArtist}
                onChange={(e) => setNewSongArtist(e.target.value)}
                placeholder="Artista (opcional)"
                aria-label="Artista de la canción"
                className="sm:w-36 px-3.5 py-2 text-sm rounded-xl bg-[#FAFBF9] border border-[#15803D]/20 text-[#141214] placeholder:text-[#6B7D6F] focus:outline-none focus:border-[#15803D]"
              />
              <motion.button
                type="submit"
                whileHover={shouldReduceMotion ? undefined : { scale: 1.03 }}
                whileTap={shouldReduceMotion ? undefined : { scale: 0.96 }}
                className="inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-medium text-white bg-[#15803D] hover:bg-[#166534] rounded-xl transition-colors shrink-0 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Agregar</span>
              </motion.button>
            </form>

            <ul className="mt-5 space-y-3">
              {songs.map((song, idx) => {
                const isActivePlaying = Boolean(song.playableYourName && musicPlaying);
                const thumbUrl =
                  song.imageUrl ||
                  PAGE_MEDIA_POOL[(idx + 1) % PAGE_MEDIA_POOL.length];
                const isBurst = favBurstId?.id === song.id;
                return (
                  <motion.li
                    key={song.id}
                    initial={shouldReduceMotion ? undefined : { opacity: 0, x: 16 }}
                    animate={shouldReduceMotion ? undefined : { opacity: 1, x: 0 }}
                    transition={{
                      duration: 0.45,
                      delay: 0.05 * Math.min(idx, 8),
                      ease: [0.16, 1, 0.3, 1],
                    }}
                    whileHover={shouldReduceMotion ? undefined : { y: -3, scale: 1.01 }}
                    className={`group relative rounded-xl border p-3.5 transition-shadow flex items-start justify-between gap-3 ${
                      isActivePlaying
                        ? 'bg-[#ECFDF5]/85 border-[#15803D]/55 shadow-[0_10px_28px_-10px_rgba(21,128,61,0.34)]'
                        : 'bg-[#FAFDF9] border-[#15803D]/15 hover:border-[#15803D]/45 hover:shadow-[0_10px_24px_-12px_rgba(21,128,61,0.28)]'
                    }`}
                  >
                    <div className="flex items-start gap-3.5 min-w-0">
                      <div className="relative w-20 h-20 sm:w-22 sm:h-22 rounded-xl overflow-hidden border border-[#15803D]/20 bg-[#ECFDF5] shrink-0 shadow-xs">
                        <img
                          src={thumbUrl}
                          alt={song.title}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-110"
                        />
                        {song.playableYourName ? (
                          <motion.button
                            type="button"
                            whileHover={shouldReduceMotion ? undefined : { scale: 1.1 }}
                            whileTap={shouldReduceMotion ? undefined : { scale: 0.9 }}
                            onClick={onToggleMusic}
                            aria-label={
                              musicPlaying
                                ? 'Pausar canción de Your Name'
                                : 'Reproducir canción de Your Name'
                            }
                            className="absolute inset-0 m-auto w-9 h-9 rounded-xl bg-[#15803D]/90 hover:bg-[#166534] text-white flex items-center justify-center shadow-md backdrop-blur-xs transition-colors cursor-pointer"
                          >
                            {musicPlaying ? (
                              <Pause className="w-4 h-4 fill-current" />
                            ) : (
                              <Play className="w-4 h-4 fill-current ml-0.5" />
                            )}
                          </motion.button>
                        ) : (
                          <span
                            aria-hidden="true"
                            className="absolute bottom-1.5 right-1.5 w-6 h-6 rounded-lg bg-white/90 border border-[#15803D]/25 text-[#15803D] flex items-center justify-center shadow-xs transition-transform duration-300 group-hover:scale-110"
                          >
                            <Music className="w-3 h-3" />
                          </span>
                        )}
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="font-serif text-lg font-medium text-[#141214] leading-snug">
                            {song.title}
                          </h3>
                          {isActivePlaying && !shouldReduceMotion && (
                            <span
                              aria-hidden="true"
                              className="inline-flex items-end gap-0.5 h-3.5"
                            >
                              {[0, 0.15, 0.3, 0.1].map((d, bIdx) => (
                                <motion.span
                                  key={bIdx}
                                  animate={{ height: ['4px', '13px', '4px'] }}
                                  transition={{
                                    duration: 0.75,
                                    delay: d,
                                    repeat: Infinity,
                                    ease: 'easeInOut',
                                  }}
                                  className="w-[3px] rounded-full bg-[#15803D]"
                                />
                              ))}
                            </span>
                          )}
                        </div>
                        <p className="text-xs font-medium text-[#15803D]">
                          {song.artist}
                        </p>
                        <p className="mt-1 text-xs sm:text-sm text-[#4B5E4E] leading-relaxed">
                          {song.note}
                        </p>
                      </div>
                    </div>

                    <div className="relative shrink-0">
                      <motion.button
                        type="button"
                        whileTap={shouldReduceMotion ? undefined : { scale: 0.78 }}
                        onClick={() => {
                          setSongs((prev) =>
                            prev.map((s) =>
                              s.id === song.id ? { ...s, favorite: !s.favorite } : s
                            )
                          );
                          setFavBurstId((prev) => ({
                            id: song.id,
                            seq: (prev?.seq ?? 0) + 1,
                          }));
                        }}
                        aria-label={
                          song.favorite ? 'Quitar de favoritas' : 'Marcar favorita'
                        }
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-[#15803D] hover:bg-[#ECFDF5] transition-colors cursor-pointer"
                      >
                        <motion.span
                          animate={
                            song.favorite && !shouldReduceMotion
                              ? { scale: [1, 1.25, 1] }
                              : undefined
                          }
                          transition={{ duration: 0.35 }}
                          className="inline-flex"
                        >
                          <Heart
                            className={`w-4 h-4 ${
                              song.favorite
                                ? 'fill-[#22C55E] text-[#15803D]'
                                : 'text-[#6B7D6F]'
                            }`}
                          />
                        </motion.span>
                      </motion.button>

                      <AnimatePresence>
                        {isBurst && !shouldReduceMotion && (
                          <motion.span
                            key={favBurstId.seq}
                            initial={{ opacity: 0.95, y: 0, scale: 0.6 }}
                            animate={{ opacity: 0, y: -22, scale: 1.2 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.65, ease: 'easeOut' }}
                            aria-hidden="true"
                            className="pointer-events-none absolute -top-1 left-2 text-[#15803D]"
                          >
                            <Heart className="w-3.5 h-3.5 fill-[#22C55E]" />
                          </motion.span>
                        )}
                      </AnimatePresence>
                    </div>
                  </motion.li>
                );
              })}
            </ul>
          </motion.section>
        </div>

        {/* Nuestras frases Section */}
        <motion.section
          initial={shouldReduceMotion ? undefined : { opacity: 0, y: 22 }}
          animate={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.34, ease: [0.16, 1, 0.3, 1] }}
          aria-labelledby="moments-hashtags-title"
          className="relative overflow-hidden rounded-2xl bg-white/88 backdrop-blur-md border border-[#15803D]/20 p-6 sm:p-8 shadow-[0_14px_34px_-16px_rgba(20,83,45,0.2)]"
        >
          <div
            aria-hidden="true"
            className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[#86EFAC] via-[#15803D] to-[#86EFAC]"
          />

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-[#E5E0E2]">
            <div className="flex items-center gap-2.5">
              <motion.div
                whileHover={shouldReduceMotion ? undefined : { rotate: 10, scale: 1.08 }}
                className="w-9 h-9 rounded-xl bg-[#ECFDF5] border border-[#15803D]/20 flex items-center justify-center text-[#15803D]"
              >
                <Hash className="w-4 h-4" />
              </motion.div>
              <div>
                <h2
                  id="moments-hashtags-title"
                  className="font-serif text-2xl font-medium text-[#141214]"
                >
                  Nuestras frases
                </h2>
                <p className="text-xs text-[#4B5E4E]">
                  Toca cualquiera para darle un poquito más de amor o agrega una nueva
                </p>
              </div>
            </div>

            <form onSubmit={handleAddHashtag} className="flex gap-2 w-full sm:w-auto">
              <input
                type="text"
                value={newHashtag}
                onChange={(e) => setNewHashtag(e.target.value)}
                placeholder="#Agrega una frase"
                aria-label="Agrega una frase"
                className="flex-1 sm:w-52 px-3.5 py-2 text-sm rounded-xl bg-[#FAFBF9] border border-[#15803D]/20 text-[#141214] placeholder:text-[#6B7D6F] focus:outline-none focus:border-[#15803D]"
              />
              <motion.button
                type="submit"
                whileHover={shouldReduceMotion ? undefined : { scale: 1.03 }}
                whileTap={shouldReduceMotion ? undefined : { scale: 0.96 }}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-white bg-[#15803D] hover:bg-[#166534] rounded-xl transition-colors shrink-0 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Agregar</span>
              </motion.button>
            </form>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            {hashtags.map((item, idx) => {
              const isBurst = tagBurstKey?.id === item.id;
              return (
                <div key={item.id} className="relative">
                  <motion.button
                    type="button"
                    animate={
                      shouldReduceMotion
                        ? undefined
                        : { y: [0, -3, 0] }
                    }
                    transition={{
                      duration: 3 + (idx % 4) * 0.45,
                      delay: (idx % 5) * 0.25,
                      repeat: Infinity,
                      ease: 'easeInOut',
                    }}
                    whileHover={
                      shouldReduceMotion ? undefined : { y: -5, scale: 1.05 }
                    }
                    whileTap={shouldReduceMotion ? undefined : { scale: 0.94 }}
                    onClick={() => {
                      setHashtags((prev) =>
                        prev.map((t) =>
                          t.id === item.id ? { ...t, count: t.count + 1 } : t
                        )
                      );
                      setTagBurstKey((prev) => ({
                        id: item.id,
                        seq: (prev?.seq ?? 0) + 1,
                      }));
                    }}
                    className="group inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#FAFDF9] hover:bg-[#ECFDF5] border border-[#15803D]/25 hover:border-[#15803D]/60 text-sm font-medium text-[#141214] shadow-xs hover:shadow-md transition-colors cursor-pointer"
                  >
                    <span className="text-[#15803D] font-mono font-semibold">#</span>
                    <span>{item.tag}</span>
                    <span className="inline-flex items-center gap-1 ml-1 px-2 py-0.5 rounded-md bg-white border border-[#15803D]/15 text-[11px] font-mono text-[#166534] tabular-nums">
                      <Heart className="w-2.5 h-2.5 fill-[#22C55E] text-[#15803D]" />
                      {item.count}
                    </span>
                  </motion.button>

                  <AnimatePresence>
                    {isBurst && !shouldReduceMotion && (
                      <motion.span
                        key={tagBurstKey.seq}
                        initial={{ opacity: 1, y: 0, scale: 0.7 }}
                        animate={{ opacity: 0, y: -26, scale: 1.15 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.65, ease: 'easeOut' }}
                        aria-hidden="true"
                        className="pointer-events-none absolute -top-2 right-3 inline-flex items-center gap-0.5 text-xs font-mono font-semibold text-[#15803D]"
                      >
                        +1 💚
                      </motion.span>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </motion.section>

        {/* Scroll More Invitation */}
        <div className="pt-8 pb-4 flex flex-col items-center justify-center gap-2 text-center">
          <span className="text-xs font-medium tracking-wide text-[#166534]/80">
            Desliza un poquito más abajo
          </span>
          <motion.div
            animate={shouldReduceMotion ? undefined : { y: [0, 7, 0] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
            className="w-8 h-8 rounded-full bg-white/80 border border-[#15803D]/20 flex items-center justify-center text-[#15803D] shadow-xs"
          >
            <ChevronDown className="w-4 h-4" />
          </motion.div>
        </div>

        {/* Draw Something Magical Section */}
        <motion.section
          initial={shouldReduceMotion ? undefined : { opacity: 0, y: 26 }}
          whileInView={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.25 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          aria-labelledby="moments-draw-title"
          className="relative overflow-hidden rounded-3xl bg-white/92 backdrop-blur-md border border-[#15803D]/25 p-8 sm:p-12 text-center shadow-[0_18px_46px_-18px_rgba(20,83,45,0.25)] mb-14"
        >
          <div
            aria-hidden="true"
            className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[#86EFAC] via-[#15803D] to-[#FDE047]"
          />

          <motion.div
            animate={
              shouldReduceMotion
                ? undefined
                : { rotate: [0, -6, 6, 0], scale: [1, 1.06, 1] }
            }
            transition={{ duration: 3.4, repeat: Infinity, ease: 'easeInOut' }}
            className="mx-auto w-14 h-14 rounded-2xl bg-[#ECFDF5] border border-[#15803D]/25 flex items-center justify-center text-[#15803D] shadow-xs"
          >
            <Paintbrush className="w-6 h-6" />
          </motion.div>

          <h2
            id="moments-draw-title"
            className="mt-5 font-serif text-3xl sm:text-4xl font-medium text-[#141214] text-balance"
          >
            ¿Creamos un <span className="italic text-[#15803D]">dibujo juntos</span>?
          </h2>

          <p className="mt-3 max-w-xl mx-auto text-sm sm:text-base text-[#4B5E4E] leading-relaxed">
            Abre nuestro lienzo blanco mágico para dibujar libremente con colores, distintos tipos de pluma, grosores y letras especiales.
          </p>

          <div className="mt-7 flex justify-center">
            <motion.button
              type="button"
              whileHover={shouldReduceMotion ? undefined : { scale: 1.04, y: -2 }}
              whileTap={shouldReduceMotion ? undefined : { scale: 0.96 }}
              onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                setDrawingOrigin({
                  x: rect.left + rect.width / 2,
                  y: rect.top + rect.height / 2,
                });
                setDrawingOpen(true);
              }}
              className="group inline-flex items-center gap-2.5 px-7 py-3.5 rounded-2xl bg-[#15803D] hover:bg-[#166534] text-white text-sm sm:text-base font-medium shadow-[0_14px_30px_-10px_rgba(21,128,61,0.5)] transition-colors cursor-pointer"
            >
              <Sparkles className="w-4 h-4 transition-transform duration-300 group-hover:rotate-12" />
              <span>Dibujar algo</span>
              <PenTool className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-0.5" />
            </motion.button>
          </div>
        </motion.section>
      </motion.main>

      <AnimatePresence>
        {drawingOpen && (
          <MagicalDrawingCanvas
            origin={drawingOrigin}
            onClose={() => setDrawingOpen(false)}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}
