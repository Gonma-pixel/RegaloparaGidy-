import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Music,
  Pause,
  Play,
  Trash2,
  Upload,
  Volume2,
  VolumeX,
  ChevronUp,
  ChevronDown,
} from 'lucide-react';
import type { MusicTrack } from '../types/dedication';
import { AmbientSynthEngine } from '../utils/ambientAudio';

interface MusicPlayerDockProps {
  tracks: MusicTrack[];
  activeTrackId: string;
  onSelectTrack: (id: string) => void;
  onAddCustomTrack: (track: MusicTrack) => void;
  onDeleteCustomTrack: (id: string) => void;
}

export function MusicPlayerDock({
  tracks,
  activeTrackId,
  onSelectTrack,
  onAddCustomTrack,
  onDeleteCustomTrack,
}: MusicPlayerDockProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.6);
  const [muted, setMuted] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [audioError, setAudioError] = useState<string | null>(null);

  const synthRef = useRef<AmbientSynthEngine | null>(null);
  const audioElRef = useRef<HTMLAudioElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const activeTrack = tracks.find((t) => t.id === activeTrackId) ?? tracks[0];

  useEffect(() => {
    synthRef.current = new AmbientSynthEngine();
    return () => {
      synthRef.current?.stop();
      audioElRef.current?.pause();
    };
  }, []);

  const effectiveVolume = muted ? 0 : volume;

  useEffect(() => {
    synthRef.current?.setVolume(effectiveVolume);
    if (audioElRef.current) {
      audioElRef.current.volume = effectiveVolume;
    }
  }, [effectiveVolume]);

  // Synchronize playback whenever activeTrack or isPlaying changes
  useEffect(() => {
    const synth = synthRef.current;
    const audioEl = audioElRef.current;
    if (!synth || !activeTrack) return;

    setAudioError(null);

    if (!isPlaying) {
      synth.stop();
      audioEl?.pause();
      return;
    }

    if (activeTrack.kind === 'custom' && activeTrack.audioDataUrl) {
      synth.stop();
      if (audioEl) {
        if (audioEl.src !== activeTrack.audioDataUrl) {
          audioEl.src = activeTrack.audioDataUrl;
        }
        audioEl.volume = effectiveVolume;
        void audioEl.play().catch(() => {
          setIsPlaying(false);
          setAudioError('No se pudo reproducir el archivo de audio.');
        });
      }
    } else {
      audioEl?.pause();
      synth.setVolume(effectiveVolume);
      synth.start(
        activeTrack.kind === 'builtin-waltz' ? 'builtin-waltz' : 'builtin-nocturne'
      );
    }
  }, [activeTrack, isPlaying]);

  const handleUploadAudio = (file: File) => {
    setAudioError(null);
    if (!file.type.startsWith('audio/')) {
      setAudioError('Selecciona un archivo de audio válido (.mp3, .wav, .m4a, .ogg).');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        const cleanTitle = file.name.replace(/\.[^/.]+$/, '').replace(/[_-]+/g, ' ');
        const newTrack: MusicTrack = {
          id: `custom-track-${Date.now()}`,
          title: cleanTitle || 'Nuestra canción',
          artist: 'Música personalizada',
          kind: 'custom',
          audioDataUrl: reader.result,
        };
        onAddCustomTrack(newTrack);
        onSelectTrack(newTrack.id);
        setIsPlaying(true);
      }
    };
    reader.onerror = () => {
      setAudioError('Error al leer el archivo de música.');
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="fixed bottom-4 right-4 left-4 sm:left-auto sm:w-[360px] z-40">
      <audio
        ref={audioElRef}
        loop
        onError={() => {
          setIsPlaying(false);
          setAudioError('Formato de audio no compatible en este navegador.');
        }}
      />

      <input
        ref={fileInputRef}
        type="file"
        accept="audio/*"
        className="sr-only"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleUploadAudio(file);
          e.target.value = '';
        }}
      />

      {/* Expandable Track Picker & Uploader Popover */}
      <AnimatePresence>
        {drawerOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.98 }}
            transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
            className="mb-2.5 p-4 rounded-2xl bg-white border border-[#E5E0E2] shadow-lg"
          >
            <div className="flex items-center justify-between gap-3 mb-3">
              <p className="text-xs font-medium text-[#141214]">
                Música de fondo personalizada
              </p>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-[#15803D] hover:bg-[#166534] rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Subir canción</span>
              </button>
            </div>

            {audioError && (
              <p className="text-xs text-[#15803D] mb-2.5" role="alert">
                {audioError}
              </p>
            )}

            <div className="space-y-1.5 max-h-44 overflow-y-auto">
              {tracks.map((track) => {
                const selected = track.id === activeTrack?.id;
                return (
                  <div
                    key={track.id}
                    className={`flex items-center justify-between gap-2 px-3 py-2 rounded-lg transition-colors ${
                      selected ? 'bg-[#ECFDF5]' : 'hover:bg-[#FAF9F7]'
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => {
                        onSelectTrack(track.id);
                        setIsPlaying(true);
                      }}
                      className="flex-1 text-left min-w-0 cursor-pointer"
                    >
                      <p
                        className={`text-xs font-medium truncate ${
                          selected ? 'text-[#15803D]' : 'text-[#141214]'
                        }`}
                      >
                        {track.title}
                      </p>
                      <p className="text-[11px] text-[#70656A] truncate">
                        {track.artist}
                      </p>
                    </button>

                    {track.kind === 'custom' && (
                      <button
                        type="button"
                        onClick={() => onDeleteCustomTrack(track.id)}
                        aria-label={`Eliminar canción ${track.title}`}
                        className="w-7 h-7 inline-flex items-center justify-center rounded-md text-[#70656A] hover:text-[#15803D] cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="mt-3 pt-3 border-t border-[#E5E0E2] flex items-center gap-3">
              <button
                type="button"
                onClick={() => setMuted((prev) => !prev)}
                aria-label={muted ? 'Activar sonido' : 'Silenciar'}
                className="text-[#574F53] hover:text-[#141214] cursor-pointer"
              >
                {muted || volume === 0 ? (
                  <VolumeX className="w-4 h-4" />
                ) : (
                  <Volume2 className="w-4 h-4" />
                )}
              </button>
              <input
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={muted ? 0 : volume}
                onChange={(e) => {
                  setMuted(false);
                  setVolume(parseFloat(e.target.value));
                }}
                aria-label="Volumen de la música"
                className="flex-1 accent-[#15803D] h-1.5 cursor-pointer"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Compact Floating Control Bar (<15% mobile height) */}
      <div className="h-14 px-3.5 rounded-2xl bg-white/95 backdrop-blur-md border border-[#E5E0E2] shadow-md flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => setIsPlaying((prev) => !prev)}
          aria-label={isPlaying ? 'Pausar música de fondo' : 'Reproducir música de fondo'}
          className="w-9 h-9 rounded-xl bg-[#15803D] hover:bg-[#166534] text-white inline-flex items-center justify-center shrink-0 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#15803D]"
        >
          {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
        </button>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <Music className="w-3 h-3 text-[#15803D] shrink-0" />
            <p className="text-xs font-medium text-[#141214] truncate">
              {activeTrack?.title ?? 'Música de fondo'}
            </p>
          </div>
          <p className="text-[11px] text-[#70656A] truncate">
            {isPlaying ? 'Reproduciendo suavemente' : activeTrack?.artist}
          </p>
        </div>

        <button
          type="button"
          onClick={() => setDrawerOpen((prev) => !prev)}
          aria-label={drawerOpen ? 'Ocultar lista de canciones' : 'Elegir o subir música'}
          aria-expanded={drawerOpen}
          className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-[#574F53] hover:text-[#141214] bg-[#F2EFF0] hover:bg-[#E5E0E2] rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
        >
          <span>Música</span>
          {drawerOpen ? (
            <ChevronDown className="w-3.5 h-3.5" />
          ) : (
            <ChevronUp className="w-3.5 h-3.5" />
          )}
        </button>
      </div>
    </div>
  );
}
