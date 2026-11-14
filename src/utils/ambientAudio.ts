// Gentle polyphonic Web Audio synthesizer for built-in romantic background music.
// Provides warm piano-like and crystalline tones with zero external audio network dependencies.

export type BuiltinKind = 'builtin-nocturne' | 'builtin-waltz' | 'your-name';

interface NoteStep {
  notes: number[]; // Frequencies in Hz
  durationMs: number;
  staggerMs?: number;
}

const NOCTURNE_SEQUENCE: NoteStep[] = [
  { notes: [261.63, 329.63, 392.0], durationMs: 1100 }, // C4, E4, G4
  { notes: [493.88], durationMs: 650 }, // B4
  { notes: [440.0], durationMs: 650 }, // A4
  { notes: [220.0, 261.63, 329.63], durationMs: 1100 }, // A3, C4, E4
  { notes: [392.0], durationMs: 700 }, // G4
  { notes: [349.23], durationMs: 700 }, // F4
  { notes: [174.61, 261.63, 329.63], durationMs: 1150 }, // Fmaj7
  { notes: [440.0], durationMs: 650 }, // A4
  { notes: [392.0], durationMs: 700 }, // G4
  { notes: [196.0, 293.66, 349.23], durationMs: 1150 }, // G7sus4
  { notes: [329.63], durationMs: 850 }, // E4
  { notes: [293.66], durationMs: 900 }, // D4
];

const WALTZ_SEQUENCE: NoteStep[] = [
  { notes: [220.0, 329.63], durationMs: 750 }, // Am
  { notes: [440.0], durationMs: 600 },
  { notes: [523.25], durationMs: 600 },
  { notes: [174.61, 261.63], durationMs: 750 }, // F
  { notes: [349.23], durationMs: 600 },
  { notes: [440.0], durationMs: 600 },
  { notes: [261.63, 329.63], durationMs: 750 }, // C
  { notes: [392.0], durationMs: 600 },
  { notes: [493.88], durationMs: 600 },
  { notes: [196.0, 293.66], durationMs: 800 }, // G
  { notes: [392.0], durationMs: 750 },
  { notes: [329.63], durationMs: 850 },
];

// Inspired by "Katawaredoki" & "Sparkle" (Your Name / Kimi no Na wa) — luminous cascading piano & bell motif in D major / B minor
const YOUR_NAME_SEQUENCE: NoteStep[] = [
  // Motif 1 — Bm7 (warm cascading twilight chord)
  { notes: [246.94, 369.99, 440.0, 587.33], durationMs: 760, staggerMs: 150 }, // B3, F#4, A4, D5
  { notes: [659.25], durationMs: 420 }, // E5
  { notes: [739.99], durationMs: 480 }, // F#5
  { notes: [587.33], durationMs: 560 }, // D5

  // Motif 2 — Gmaj7 (luminous sky lift)
  { notes: [196.0, 293.66, 369.99, 493.88], durationMs: 760, staggerMs: 150 }, // G3, D4, F#4, B4
  { notes: [587.33], durationMs: 420 }, // D5
  { notes: [659.25], durationMs: 420 }, // E5
  { notes: [739.99], durationMs: 660 }, // F#5

  // Motif 3 — Dmaj7 (sparkling bell piano descent)
  { notes: [146.83, 293.66, 440.0, 554.37], durationMs: 760, staggerMs: 145 }, // D3, D4, A4, C#5
  { notes: [739.99], durationMs: 380 }, // F#5
  { notes: [880.0], durationMs: 460 }, // A5
  { notes: [739.99], durationMs: 420 }, // F#5
  { notes: [659.25], durationMs: 520 }, // E5

  // Motif 4 — Asus4 -> A (hopeful resolution)
  { notes: [220.0, 329.63, 440.0, 587.33], durationMs: 760, staggerMs: 150 }, // A3, E4, A4, D5
  { notes: [554.37], durationMs: 480 }, // C#5
  { notes: [493.88], durationMs: 520 }, // B4
  { notes: [440.0], durationMs: 880 }, // A4

  // Bridge — Em9 -> F#m7 -> Gmaj7 -> A
  { notes: [164.81, 246.94, 392.0, 587.33], durationMs: 760, staggerMs: 145 }, // E3, B3, G4, D5
  { notes: [739.99], durationMs: 460 }, // F#5
  { notes: [659.25], durationMs: 520 }, // E5
  { notes: [185.0, 277.18, 440.0, 554.37], durationMs: 760, staggerMs: 145 }, // F#3, C#4, A4, C#5
  { notes: [587.33], durationMs: 480 }, // D5
  { notes: [659.25], durationMs: 520 }, // E5
  { notes: [196.0, 293.66, 493.88, 739.99], durationMs: 920, staggerMs: 165 }, // G3, D4, B4, F#5
  { notes: [220.0, 329.63, 554.37, 659.25], durationMs: 1050, staggerMs: 165 }, // A3, E4, C#5, E5
];

export class AmbientSynthEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private filterNode: BiquadFilterNode | null = null;
  private timerId: number | null = null;
  private noteTimers: number[] = [];
  private stepIndex = 0;
  private isPlaying = false;
  private kind: BuiltinKind = 'builtin-nocturne';
  private volume = 0.55;

  private ensureContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();

      this.filterNode = this.ctx.createBiquadFilter();
      this.filterNode.type = 'lowpass';
      this.filterNode.frequency.value = 1850;
      this.filterNode.Q.value = 0.7;

      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.value = this.volume * 0.32;

      this.filterNode.connect(this.masterGain);
      this.masterGain.connect(this.ctx.destination);
    }

    if (this.ctx.state === 'suspended') {
      void this.ctx.resume();
    }
  }

  public setVolume(vol: number) {
    this.volume = Math.max(0, Math.min(1, vol));
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setTargetAtTime(this.volume * 0.32, this.ctx.currentTime, 0.08);
    }
  }

  public start(kind: BuiltinKind) {
    this.stop();
    this.kind = kind;
    this.stepIndex = 0;
    this.isPlaying = true;
    this.ensureContext();
    this.scheduleNext();
  }

  private playTone(freq: number, durationMs: number, crystalBell = false) {
    if (!this.ctx || !this.filterNode) return;

    const now = this.ctx.currentTime;
    const oscPrimary = this.ctx.createOscillator();
    const oscHarmonic = this.ctx.createOscillator();
    const noteGain = this.ctx.createGain();

    oscPrimary.type = 'sine';
    oscPrimary.frequency.setValueAtTime(freq, now);

    oscHarmonic.type = crystalBell ? 'sine' : 'triangle';
    oscHarmonic.frequency.setValueAtTime(freq * 2, now);

    const harmonicGain = this.ctx.createGain();
    harmonicGain.gain.value = crystalBell ? 0.2 : 0.14;

    const totalSec = Math.max(crystalBell ? 1.85 : 1.2, durationMs / 1000 + (crystalBell ? 1.35 : 0.8));
    noteGain.gain.setValueAtTime(0.0001, now);
    noteGain.gain.linearRampToValueAtTime(crystalBell ? 0.3 : 0.35, now + (crystalBell ? 0.035 : 0.06));
    noteGain.gain.exponentialRampToValueAtTime(0.0001, now + totalSec);

    oscPrimary.connect(noteGain);
    oscHarmonic.connect(harmonicGain);
    harmonicGain.connect(noteGain);
    noteGain.connect(this.filterNode);

    oscPrimary.start(now);
    oscHarmonic.start(now);
    oscPrimary.stop(now + totalSec + 0.05);
    oscHarmonic.stop(now + totalSec + 0.05);
  }

  private scheduleNext = () => {
    if (!this.isPlaying) return;
    const seq =
      this.kind === 'your-name'
        ? YOUR_NAME_SEQUENCE
        : this.kind === 'builtin-nocturne'
        ? NOCTURNE_SEQUENCE
        : WALTZ_SEQUENCE;
    const step = seq[this.stepIndex % seq.length];
    const stagger = step.staggerMs ?? 55;
    const isYourName = this.kind === 'your-name';

    step.notes.forEach((freq, idx) => {
      const id = window.setTimeout(() => {
        if (this.isPlaying) {
          this.playTone(freq, step.durationMs, isYourName);
        }
      }, idx * stagger);
      this.noteTimers.push(id);
    });

    this.stepIndex = (this.stepIndex + 1) % seq.length;
    this.timerId = window.setTimeout(this.scheduleNext, step.durationMs);
  };

  public stop() {
    this.isPlaying = false;
    if (this.timerId !== null) {
      window.clearTimeout(this.timerId);
      this.timerId = null;
    }
    this.noteTimers.forEach((id) => window.clearTimeout(id));
    this.noteTimers = [];
  }
}
