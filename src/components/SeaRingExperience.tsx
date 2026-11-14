import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { ArrowRight, Music2, Pause, Play, Sparkles, X } from 'lucide-react';
import type { DedicationProfile, SharedMemory } from '../types/dedication';
import { AmbientSynthEngine } from '../utils/ambientAudio';
import { OurMomentsPage } from './OurMomentsPage';
import {
  ALL_PETALS,
  BACK_PETALS,
  FRONT_PETALS,
  LIGHT_MOTES,
  RING_SITES,
  SEA_STILL_URL,
  SEA_VIDEO_URL,
  WORLD_META,
  type RingSite,
} from '../data/seaRingData';
import '../styles/seaRing.css';

interface SeaRingExperienceProps {
  profile: DedicationProfile;
  totalDays?: number;
  totalMemories?: number;
  onAddMemory?: (memory: Omit<SharedMemory, 'id'>) => void;
}

type ViewMode = 'home' | 'build';

const CARD_BASE_HEIGHT = 220;

interface CardTiltState {
  tx: number;
  ty: number;
  tz: number;
  rx: number;
  ry: number;
  z: number;
  vx: number;
  vy: number;
  vz: number;
}

function clamp(v: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, v));
}

function easeOutExpoish(t: number): number {
  // Cubic-bezier approximation of (0.5, 0, 0.15, 1)
  return t < 0.5
    ? 4 * t * t * t
    : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

export function SeaRingExperience({
  profile,
  onAddMemory,
}: SeaRingExperienceProps) {
  const [view, setView] = useState<ViewMode>('home');
  const [reducedMotion, setReducedMotion] = useState(() =>
    typeof window !== 'undefined'
      ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
      : false
  );

  // Intro & Loader State
  const [loaderRemoved, setLoaderRemoved] = useState(false);
  const [loaderFading, setLoaderFading] = useState(false);
  const [loaderReady, setLoaderReady] = useState(false);
  const [loaderLeaving, setLoaderLeaving] = useState(false);
  const [frameOpen, setFrameOpen] = useState(true);
  const [frameRevealed, setFrameRevealed] = useState(false);
  const [pageEntered, setPageEntered] = useState(false);
  const [wmLanded, setWmLanded] = useState(false);
  const [introHidden, setIntroHidden] = useState(true);
  const [buildEntered, setBuildEntered] = useState(false);

  const [loadPct, setLoadPct] = useState(0);
  const [typedCaption, setTypedCaption] = useState('');
  const [seaHomePlaying, setSeaHomePlaying] = useState(false);
  const [seaBuildPlaying, setSeaBuildPlaying] = useState(false);
  const [musicPlaying, setMusicPlaying] = useState(false);
  const synthRef = useRef<AmbientSynthEngine | null>(null);

  // Modal State
  const [activeModalSite, setActiveModalSite] = useState<RingSite | null>(null);

  // Build / Mensaje Brief Form State
  const [whatText, setWhatText] = useState('');
  const [forText, setForText] = useState('');
  const [whenChoice, setWhenChoice] = useState<
    'hoy y siempre' | 'en cada etapa' | 'por toda la vida'
  >('hoy y siempre');
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);
  const [sendOffset, setSendOffset] = useState({ x: 0, y: 0 });
  const [promiseSaved, setPromiseSaved] = useState(false);
  const [momentsOpen, setMomentsOpen] = useState(false);

  // Refs for direct 60fps imperative DOM updates
  const rootRef = useRef<HTMLDivElement | null>(null);
  const worldFrameRef = useRef<HTMLDivElement | null>(null);
  const ringWallRef = useRef<HTMLDivElement | null>(null);
  const lensRef = useRef<HTMLDivElement | null>(null);
  const ringCenterRef = useRef<HTMLDivElement | null>(null);
  const cardRefs = useRef<Array<HTMLAnchorElement | null>>([]);
  const tiltRefs = useRef<Array<HTMLDivElement | null>>([]);
  const faceRefs = useRef<Array<HTMLDivElement | null>>([]);
  const videoRefs = useRef<Array<HTMLVideoElement | null>>([]);
  const slotSiteMapRef = useRef<number[]>(Array.from({ length: 16 }, (_, i) => i));
  const tiltStatesRef = useRef<CardTiltState[]>(
    Array.from({ length: 16 }, () => ({
      tx: 0,
      ty: 0,
      tz: 0,
      rx: 0,
      ry: 0,
      z: 0,
      vx: 0,
      vy: 0,
      vz: 0,
    }))
  );

  // Parallax layers
  const homeSceneRef = useRef<HTMLDivElement | null>(null);
  const homeBackPetalsRef = useRef<HTMLDivElement | null>(null);
  const homeMistRef = useRef<HTMLDivElement | null>(null);
  const homeMotesRef = useRef<HTMLDivElement | null>(null);
  const homeFrontPetalsRef = useRef<HTMLDivElement | null>(null);
  const buildSceneRef = useRef<HTMLDivElement | null>(null);
  const buildPetalsRef = useRef<HTMLDivElement | null>(null);

  // Scene videos
  const homeVideoRef = useRef<HTMLVideoElement | null>(null);
  const buildVideoRef = useRef<HTMLVideoElement | null>(null);

  // Simulation mutable state
  const simRef = useRef({
    formation: 0,
    expansion: 0,
    introComplete: false,
    revealStarted: false,
    postersReady: false,
    formationReady: false,
    targetRot: 0,
    currentRot: 0,
    rotVel: 0,
    easeFactor: 1,
    isDragging: false,
    dragMoved: false,
    dragStartX: 0,
    dragStartY: 0,
    dragStartRot: 0,
    lastDragEndMs: 0,
    focusedInWall: false,
    pointerNormX: 0,
    pointerNormY: 0,
    px: 0,
    py: 0,
    pvx: 0,
    pvy: 0,
    mouseClientX: typeof window !== 'undefined' ? window.innerWidth / 2 : 500,
    mouseClientY: typeof window !== 'undefined' ? window.innerHeight / 2 : 400,
    frameTick: 0,
    view: 'home' as ViewMode,
    reducedMotion: false,
    hoveredCardIdx: -1,
  });

  useEffect(() => {
    simRef.current.view = view;
  }, [view]);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const onChange = () => {
      setReducedMotion(mq.matches);
      simRef.current.reducedMotion = mq.matches;
    };
    simRef.current.reducedMotion = mq.matches;
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  useEffect(() => {
    return () => {
      synthRef.current?.stop();
    };
  }, []);

  const handleToggleMusic = useCallback(() => {
    if (!synthRef.current) {
      synthRef.current = new AmbientSynthEngine();
      synthRef.current.setVolume(0.72);
    }
    setMusicPlaying((prev) => {
      const next = !prev;
      if (next) {
        synthRef.current?.start('your-name');
      } else {
        synthRef.current?.stop();
      }
      return next;
    });
  }, []);

  // Measure open clip-path insets so forming ring reaches viewport edges
  const updateOpenFrameInsets = useCallback(() => {
    const frame = worldFrameRef.current;
    if (!frame) return;
    const rect = frame.getBoundingClientRect();
    frame.style.setProperty('--ft', `${Math.max(0, rect.top)}px`);
    frame.style.setProperty('--fl', `${Math.max(0, rect.left)}px`);
    frame.style.setProperty(
      '--fr',
      `${Math.max(0, window.innerWidth - rect.right)}px`
    );
    frame.style.setProperty(
      '--fb',
      `${Math.max(0, window.innerHeight - rect.bottom)}px`
    );
  }, []);

  const jumpToFinalState = useCallback(() => {
    const s = simRef.current;
    s.formation = 1;
    s.expansion = 1;
    s.introComplete = true;
    s.revealStarted = true;
    s.postersReady = true;
    s.formationReady = true;
    setLoadPct(100);
    setFrameOpen(false);
    setFrameRevealed(true);
    setLoaderFading(true);
    setLoaderLeaving(true);
    setLoaderRemoved(true);
    setIntroHidden(false);
    setWmLanded(true);
    setPageEntered(true);
  }, []);

  const triggerReveal = useCallback(() => {
    const s = simRef.current;
    if (s.revealStarted) return;
    s.revealStarted = true;

    setLoaderLeaving(true);
    setLoaderFading(true);
    setFrameOpen(false);
    setFrameRevealed(true);

    // Animate expansion 0 -> 1 over 1900ms
    const expStart = performance.now();
    const expDuration = 1900;
    const tickExp = (now: number) => {
      if (s.introComplete) return;
      const t = clamp((now - expStart) / expDuration, 0, 1);
      s.expansion = easeOutExpoish(t);
      if (t < 1) {
        requestAnimationFrame(tickExp);
      } else {
        s.expansion = 1;
        s.introComplete = true;
      }
    };
    requestAnimationFrame(tickExp);

    const landTimer = window.setTimeout(() => {
      setWmLanded(true);
      setIntroHidden(false);
      setLoaderRemoved(true);
    }, 1300);

    const enterTimer = window.setTimeout(() => {
      setPageEntered(true);
    }, 1050);

    return () => {
      window.clearTimeout(landTimer);
      window.clearTimeout(enterTimer);
    };
  }, []);

  // Intro sequence & poster preloading
  useEffect(() => {
    if (simRef.current.reducedMotion) {
      jumpToFinalState();
      return;
    }

    updateOpenFrameInsets();
    window.addEventListener('resize', updateOpenFrameInsets);

    const readyTimer = window.setTimeout(() => setLoaderReady(true), 50);

    // Type "CARGANDO RECUERDOS" one character every 45ms starting at 350ms
    const fullCaption = 'CARGANDO RECUERDOS';
    let typeInterval: number | null = null;
    const typeStartTimer = window.setTimeout(() => {
      let i = 0;
      typeInterval = window.setInterval(() => {
        i += 1;
        setTypedCaption(fullCaption.slice(0, i));
        if (i >= fullCaption.length && typeInterval !== null) {
          window.clearInterval(typeInterval);
        }
      }, 45);
    }, 350);

    // Animate formation 0 -> 1 linearly over 2.4s
    const formStart = performance.now();
    const formDuration = 2400;
    let formRaf = 0;
    const tickForm = (now: number) => {
      if (simRef.current.revealStarted) return;
      const t = clamp((now - formStart) / formDuration, 0, 1);
      simRef.current.formation = t;
      if (t < 1) {
        formRaf = requestAnimationFrame(tickForm);
      } else {
        simRef.current.formationReady = true;
        if (simRef.current.postersReady) {
          triggerReveal();
        }
      }
    };
    formRaf = requestAnimationFrame(tickForm);

    // Preload 16 card posters
    let loadedCount = 0;
    const markDone = () => {
      loadedCount += 1;
      const pct = Math.min(100, Math.round((loadedCount / RING_SITES.length) * 100));
      setLoadPct(pct);
      if (loadedCount >= RING_SITES.length) {
        simRef.current.postersReady = true;
        if (simRef.current.formationReady) {
          triggerReveal();
        }
      }
    };

    RING_SITES.forEach((site) => {
      const img = new Image();
      img.referrerPolicy = 'no-referrer';
      img.onload = markDone;
      img.onerror = markDone;
      img.src = site.posterUrl;
    });

    // Failsafe so loader always completes even on slow networks
    const failsafeTimer = window.setTimeout(() => {
      setLoadPct(100);
      simRef.current.postersReady = true;
      simRef.current.formation = 1;
      simRef.current.formationReady = true;
      triggerReveal();
    }, 4500);

    const onKeySkip = (e: KeyboardEvent) => {
      if (
        !simRef.current.introComplete &&
        (e.key === 'Escape' || e.key === 'Tab')
      ) {
        jumpToFinalState();
      }
    };
    window.addEventListener('keydown', onKeySkip);

    return () => {
      window.removeEventListener('resize', updateOpenFrameInsets);
      window.removeEventListener('keydown', onKeySkip);
      window.clearTimeout(readyTimer);
      window.clearTimeout(typeStartTimer);
      window.clearTimeout(failsafeTimer);
      if (typeInterval !== null) window.clearInterval(typeInterval);
      cancelAnimationFrame(formRaf);
    };
  }, [jumpToFinalState, triggerReveal, updateOpenFrameInsets]);

  // Switch scene videos when view or reveal changes
  useEffect(() => {
    const hv = homeVideoRef.current;
    const bv = buildVideoRef.current;
    if (reducedMotion || !frameRevealed || !SEA_VIDEO_URL) {
      hv?.pause();
      bv?.pause();
      return;
    }

    if (view === 'home') {
      bv?.pause();
      if (hv) {
        if (!hv.src) hv.src = SEA_VIDEO_URL;
        void hv.play().catch(() => {});
      }
    } else {
      hv?.pause();
      if (bv) {
        if (!bv.src) bv.src = SEA_VIDEO_URL;
        void bv.play().catch(() => {});
      }
    }
  }, [view, frameRevealed, reducedMotion]);

  // Wheel & pointer tracking listeners
  useEffect(() => {
    const onWheel = (e: WheelEvent) => {
      const s = simRef.current;
      if (s.view !== 'home') return;
      if (e.ctrlKey || e.metaKey) return;
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA')
      ) {
        return;
      }
      e.preventDefault();
      if (!s.introComplete) return;

      const raw =
        Math.abs(e.deltaY) >= Math.abs(e.deltaX) ? e.deltaY : e.deltaX;
      let delta = raw;
      if (e.deltaMode === 1) delta *= 16;
      else if (e.deltaMode === 2) delta *= window.innerHeight;
      s.targetRot += 0.5 * clamp(delta, -480, 480);
    };

    const onPointerMove = (e: PointerEvent) => {
      const s = simRef.current;
      s.mouseClientX = e.clientX;
      s.mouseClientY = e.clientY;
      if (window.matchMedia('(pointer: fine)').matches && !s.reducedMotion) {
        s.pointerNormX = (e.clientX / window.innerWidth) * 2 - 1;
        s.pointerNormY = (e.clientY / window.innerHeight) * 2 - 1;
      }
    };

    window.addEventListener('wheel', onWheel, { passive: false });
    window.addEventListener('pointermove', onPointerMove, { passive: true });
    return () => {
      window.removeEventListener('wheel', onWheel);
      window.removeEventListener('pointermove', onPointerMove);
    };
  }, []);

  // Main 60fps simulation loop (3D ring geometry, spring rotation, parallax, card tilts, preview card, lazy card videos)
  useEffect(() => {
    let rafId = 0;
    let lastNow = performance.now();

    const loop = (now: number) => {
      const dtMs = Math.min(50, Math.max(1, now - lastNow));
      lastNow = now;
      const dt = dtMs / 1000;
      const k = Math.min(3, dtMs / 16.67);

      const s = simRef.current;
      s.frameTick += 1;

      // Check card hover every 3rd frame to slow rotation
      let overCard = false;
      if (s.frameTick % 3 === 0 && s.view === 'home' && s.introComplete) {
        const el = document.elementFromPoint(s.mouseClientX, s.mouseClientY);
        overCard = Boolean(el && el.closest('.sr-card'));
        s.hoveredCardIdx = overCard ? 1 : -1;
      } else {
        overCard = s.hoveredCardIdx !== -1;
      }

      const targetEase = overCard ? 0.2 : 1;
      s.easeFactor += (targetEase - s.easeFactor) * Math.min(1, 0.08 * k);

      // Auto-spin
      if (!s.isDragging && !s.focusedInWall && !s.reducedMotion && s.view === 'home') {
        if (s.introComplete) {
          s.targetRot += 0.3 * s.easeFactor * k;
        } else {
          s.targetRot +=
            0.3 *
            (0.5 + 0.5 * s.expansion) *
            clamp((78 - s.targetRot) / 20, 0, 1) *
            s.easeFactor *
            k;
        }
      }

      // Spring rotation (stiffness 150, damping 27, mass 1)
      if (s.reducedMotion) {
        s.currentRot = s.targetRot;
        s.rotVel = 0;
      } else {
        const force = -150 * (s.currentRot - s.targetRot) - 27 * s.rotVel;
        s.rotVel += force * dt;
        s.currentRot += s.rotVel * dt;
      }

      // Ring geometry calculation
      const e = s.expansion;
      const f = s.formation;
      const iw = window.innerWidth;
      const ih = window.innerHeight;
      const wallScale = iw <= 820 ? 0.8 : ih <= 760 ? 0.9 : 1.1;
      const fit =
        Math.min(1.05, (iw - 32) / 1240, (0.66 * ih) / 800) / wallScale;
      const A = wallScale * (fit + (1 - fit) * e);

      const tiltDeg = -22 * (1 - e);
      const tiltRad = (tiltDeg * Math.PI) / 180;
      const radius = 460 + 1340 * e;
      const anchor =
        -radius * Math.sin(tiltRad) +
        460 * Math.sin((-22 * Math.PI) / 180) * (1 - e);
      const perspective = 1000 + (760 - 1000) * e;
      const rollDeg = -20 * (1 - e);
      const rollRad = (rollDeg * Math.PI) / 180;
      const cardScale = 0.52 + (2.3 - 0.52) * e * e;

      const frameEl = worldFrameRef.current;
      let introOff = 0;
      if (frameEl) {
        const fr = frameEl.getBoundingClientRect();
        const frameCenterY = fr.top + fr.height / 2;
        introOff = 0.44 * ih - frameCenterY;
      }

      const introOffsetPx = introOff * (1 - e) + anchor * A;
      const introX = 160 * Math.sin(rollRad) * A;
      const introScale = fit + (1 - fit) * e;
      const sScale = wallScale * introScale;

      if (lensRef.current) {
        lensRef.current.style.perspective = `${(perspective * A).toFixed(2)}px`;
        lensRef.current.style.perspectiveOrigin = `50% calc(50% + ${(
          introOff *
          (1 - e)
        ).toFixed(2)}px)`;
      }

      if (ringCenterRef.current) {
        ringCenterRef.current.style.transform = `translate(${introX.toFixed(
          2
        )}px, ${introOffsetPx.toFixed(2)}px) rotateZ(${rollDeg.toFixed(
          3
        )}deg) rotateX(${tiltDeg.toFixed(3)}deg) scale3d(${sScale.toFixed(
          4
        )}, ${sScale.toFixed(4)}, ${A.toFixed(4)})`;
      }

      // Position all 16 ring slots
      const activeRot = s.introComplete ? s.currentRot : 0;
      const rotForAngle = s.currentRot;
      const totalSites = RING_SITES.length;

      for (let slot = 0; slot < 16; slot++) {
        const cardEl = cardRefs.current[slot];
        if (!cardEl) continue;

        const r =
          ((((360 * slot) / 16 + rotForAngle + 180) % 360) + 360) % 360 - 180;
        const aWrap = Math.floor((360 * slot / 16 + activeRot + 180) / 360);
        const siteIdx =
          ((slot - aWrap * 16 + Math.min(3, totalSites - 1)) % totalSites +
            totalSites) %
          totalSites;

        const site = RING_SITES[siteIdx];

        // Update site content on slot wrap if needed
        if (slotSiteMapRef.current[slot] !== siteIdx) {
          slotSiteMapRef.current[slot] = siteIdx;
          cardEl.setAttribute('data-world', site.world);
          const worldMeta = WORLD_META[site.world];
          cardEl.style.setProperty('--world', worldMeta.color);
          cardEl.style.setProperty('--on', worldMeta.onColor);
          const w = Math.round(CARD_BASE_HEIGHT * site.ratio);
          cardEl.style.width = `${w}px`;
          cardEl.style.left = `${-w / 2}px`;

          const posterImg = cardEl.querySelector(
            '.sr-card-poster'
          ) as HTMLImageElement | null;
          if (posterImg) {
            posterImg.src = site.posterUrl;
            posterImg.alt = site.title;
            posterImg.style.objectPosition = site.objectPosition || 'center';
          }

          const vid = videoRefs.current[slot];
          if (vid) {
            vid.pause();
            vid.removeAttribute('src');
            vid.classList.remove('is-playing');
            vid.load();
          }
        }

        const n = ((r + 180) % 360 + 360) % 360;
        const aNorm = n / 360;
        const iProg = clamp((f - 0.7 * aNorm) / 0.3, 0, 1);
        const smoothS = 1 - Math.pow(1 - iProg, 3);
        const yawDeg = -180 + n * smoothS;
        const yawRad = (yawDeg * Math.PI) / 180;
        const effRadius = radius - (1 - smoothS) * aNorm * 24;
        const x = -Math.sin(yawRad) * effRadius;
        const z = -Math.cos(yawRad) * effRadius;
        const appear = Math.min(1, 2.5 * iProg);

        const hiddenByCamera =
          z * Math.cos(tiltRad) >= perspective - 70 ||
          (s.introComplete && Math.abs(r) > 96);

        cardEl.style.opacity = hiddenByCamera ? '0' : appear.toFixed(3);
        cardEl.style.pointerEvents = hiddenByCamera ? 'none' : 'auto';
        cardEl.style.transform = `translate3d(${x.toFixed(2)}px, 0px, ${z.toFixed(
          2
        )}px) rotateY(${yawDeg.toFixed(2)}deg) scale(${cardScale.toFixed(4)})`;

        const faceEl = faceRefs.current[slot];
        if (faceEl) {
          faceEl.style.transform =
            z > (radius * radius) / perspective ? 'rotateY(180deg)' : '';
        }

        // Card tilt spring (stiffness 180, damping 24)
        const ts = tiltStatesRef.current[slot];
        const tiltEl = tiltRefs.current[slot];
        if (tiltEl) {
          if (s.reducedMotion) {
            ts.rx = ts.tx;
            ts.ry = ts.ty;
            ts.z = ts.tz;
          } else {
            const fx = -180 * (ts.rx - ts.tx) - 24 * ts.vx;
            const fy = -180 * (ts.ry - ts.ty) - 24 * ts.vy;
            const fz = -180 * (ts.z - ts.tz) - 24 * ts.vz;
            ts.vx += fx * dt;
            ts.vy += fy * dt;
            ts.vz += fz * dt;
            ts.rx += ts.vx * dt;
            ts.ry += ts.vy * dt;
            ts.z += ts.vz * dt;
          }
          tiltEl.style.transform = `translateZ(${ts.z.toFixed(
            2
          )}px) rotateX(${ts.rx.toFixed(2)}deg) rotateY(${ts.ry.toFixed(2)}deg)`;
        }

        // Lazy card video playback
        const vid = videoRefs.current[slot];
        if (vid) {
          const shouldPlay =
            Boolean(site.videoUrl) &&
            f > 0.5 &&
            Math.abs(r) <= 78 &&
            !document.hidden &&
            s.view === 'home' &&
            !s.reducedMotion &&
            !hiddenByCamera;
          if (shouldPlay) {
            if (!vid.getAttribute('src')) {
              vid.src = site.videoUrl;
            }
            if (vid.paused) {
              void vid.play().catch(() => {});
            }
          } else if (!vid.paused) {
            vid.pause();
          }
        }
      }

      // Pointer Parallax Spring (stiffness 40, damping 18, mass 1)
      if (!s.reducedMotion) {
        const pfx = -40 * (s.px - s.pointerNormX) - 18 * s.pvx;
        const pfy = -40 * (s.py - s.pointerNormY) - 18 * s.pvy;
        s.pvx += pfx * dt;
        s.pvy += pfy * dt;
        s.px += s.pvx * dt;
        s.py += s.pvy * dt;
      } else {
        s.px = 0;
        s.py = 0;
      }

      const applyParallax = (el: HTMLElement | null, depth: number) => {
        if (!el) return;
        const tx = -s.px * depth;
        const ty = -s.py * depth * 0.5;
        el.style.transform = `translate3d(${tx.toFixed(2)}px, ${ty.toFixed(
          2
        )}px, 0)`;
      };

      if (s.view === 'home') {
        applyParallax(homeSceneRef.current, 10);
        applyParallax(homeBackPetalsRef.current, 22);
        applyParallax(homeMistRef.current, 34);
        applyParallax(homeMotesRef.current, 40);
        applyParallax(homeFrontPetalsRef.current, 48);
      } else {
        applyParallax(buildSceneRef.current, 10);
        applyParallax(buildPetalsRef.current, 22);
      }

      rafId = requestAnimationFrame(loop);
    };

    rafId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafId);
  }, []);

  // Drag & Touch handlers on the ring wall
  const handleWallPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    const s = simRef.current;
    if (!s.introComplete) return;
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    const target = e.target as HTMLElement | null;
    if (
      e.pointerType === 'touch' &&
      target &&
      (target.closest('.sr-card') || target.tagName === 'INPUT')
    ) {
      return;
    }

    s.isDragging = true;
    s.dragMoved = false;
    s.dragStartX = e.clientX;
    s.dragStartY = e.clientY;
    s.dragStartRot = s.targetRot;
    ringWallRef.current?.classList.add('is-grabbing');
    ringWallRef.current?.setPointerCapture(e.pointerId);
  };

  const handleWallPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const s = simRef.current;
    if (!s.isDragging) return;
    const dx = e.clientX - s.dragStartX;
    const dy = e.clientY - s.dragStartY;
    if (Math.hypot(dx, dy) > 4) s.dragMoved = true;
    const primary = Math.abs(dx) >= Math.abs(dy) ? dx : dy;
    s.targetRot = s.dragStartRot + 0.2 * primary;
  };

  const handleWallPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    const s = simRef.current;
    if (!s.isDragging) return;
    s.isDragging = false;
    if (s.dragMoved) {
      s.lastDragEndMs = performance.now();
    }
    ringWallRef.current?.classList.remove('is-grabbing');
    try {
      ringWallRef.current?.releasePointerCapture(e.pointerId);
    } catch {
      // ignore if already released
    }
  };

  // Switch between Home & Build/Mensaje views
  const switchView = (next: ViewMode) => {
    if (next === view) return;
    setView(next);
    window.scrollTo({ top: 0, behavior: 'auto' });
    if (next === 'build') {
      setBuildEntered(false);
      window.setTimeout(() => setBuildEntered(true), 40);
    }
  };

  // Odometer digits
  const odoDigits = useMemo(() => {
    const clamped = clamp(loadPct, 0, 100);
    const str = String(clamped).padStart(3, '0');
    return {
      hundreds: Number(str[0]),
      tens: Number(str[1]),
      ones: Number(str[2]),
      hideHundreds: clamped < 100,
      hideTens: clamped < 10,
    };
  }, [loadPct]);

  // Brief / Mensaje actions
  const composedBrief = useMemo(() => {
    const what = whatText.trim() || 'nuestros 5 años juntos';
    const who = forText.trim() || 'mi polluelita hermosa';
    return `Quiero recordar ${what} con ${who}, y soñar ${whenChoice}.`;
  }, [whatText, forText, whenChoice]);

  const handleCopyBrief = async () => {
    try {
      await navigator.clipboard.writeText(composedBrief);
      setFeedbackMsg('Mensaje copiado');
      window.setTimeout(() => setFeedbackMsg(null), 1600);
    } catch {
      setFeedbackMsg('No se pudo copiar');
      window.setTimeout(() => setFeedbackMsg(null), 1600);
    }
  };

  const handleShareBrief = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${profile.coupleNames} — Dedicatoria`,
          text: composedBrief,
        });
        return;
      } catch {
        // Fallback to copy
      }
    }
    void handleCopyBrief();
  };

  const handleSaveBrief = (e: React.FormEvent) => {
    e.preventDefault();
    const what = whatText.trim() || 'nuestros 5 años juntos';
    const who = forText.trim() || 'mi polluelita hermosa';
    if (onAddMemory) {
      onAddMemory({
        title: what,
        dateLabel: new Date().toLocaleDateString('es-ES', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
        }),
        location: who,
        category: 'Hitos',
        note: composedBrief,
        favorite: true,
      });
    }
    setPromiseSaved(true);
    setFeedbackMsg('Guardado en nuestra historia 💚');
    window.setTimeout(() => setFeedbackMsg(null), 2600);
  };

  // Word index helper for staggered sentence reveal
  const renderMaskedWords = (text: string, startIdx: number) => {
    const parts = text.split(/(\s+)/);
    let idx = startIdx;
    return parts.map((part, i) => {
      if (!part) return null;
      if (/^\s+$/.test(part)) return part;
      const delay = 0.05 + 0.035 * idx;
      idx += 1;
      return (
        <span key={i} className="sr-word-mask">
          <span
            className="sr-word-inner"
            style={{ '--d': `${delay.toFixed(3)}s` } as React.CSSProperties}
          >
            {part}
          </span>
        </span>
      );
    });
  };

  return (
    <div
      ref={rootRef}
      className={`sea-ring-root ${view === 'home' ? 'is-home-locked' : ''} ${
        pageEntered ? 'is-entered' : ''
      } ${wmLanded ? 'is-wm-landed' : ''} ${
        introHidden ? 'is-intro-hidden' : ''
      }`}
    >
      {/* Top Nav */}
      <header className="sr-nav">
        <button
          type="button"
          onClick={() => switchView(view === 'home' ? 'build' : 'home')}
          className="sr-next-btn"
        >
          <span>{view === 'home' ? 'Siguiente →' : '← Volver'}</span>
        </button>
      </header>

      {/* VIEW 1: HOME (3D Sea Ring) */}
      {view === 'home' && (
        <section id="view-home" className="sr-view sr-home-stage">
          <div className="sr-top-row">
            <h1 className="sr-sentence">
              {renderMaskedWords(
                'No importa cuántas veces nos perdamos, de alguna manera nuestros caminos volverán a encontrarse',
                0
              )}
            </h1>
          </div>

          {/* Rounded World Frame */}
          <div
            ref={worldFrameRef}
            className={`sr-world-frame ${frameOpen ? 'is-open' : ''} ${
              frameRevealed ? 'is-revealed' : ''
            }`}
          >
            {/* Scene: 4K Sky Backdrop + Grain */}
            <div ref={homeSceneRef} className="sr-scene-layer">
              <img
                src={SEA_STILL_URL}
                alt="Cielo estrellado con cometa luminoso sobre nubes al atardecer"
                referrerPolicy="no-referrer"
                className="sr-scene-still"
              />
              {SEA_VIDEO_URL && (
                <video
                  ref={homeVideoRef}
                  muted
                  loop
                  playsInline
                  preload="none"
                  onPlaying={() => setSeaHomePlaying(true)}
                  className={`sr-scene-video ${seaHomePlaying ? 'is-playing' : ''}`}
                />
              )}
              <div className="sr-scene-grain" />
            </div>

            {/* Back Petals */}
            <div ref={homeBackPetalsRef} className="sr-petals sr-petals-back">
              {BACK_PETALS.map((p, idx) => (
                <span
                  key={idx}
                  className={`sr-petal ${p.mirrored ? 'is-mirrored' : ''}`}
                  style={{
                    left: `${p.left}%`,
                    top: `${p.top}%`,
                    width: `${p.width}px`,
                    height: `${(p.width * 0.62).toFixed(1)}px`,
                    backgroundColor: p.color,
                    animationDuration: `${p.duration}s`,
                    animationDelay: `${p.delay}s`,
                  }}
                />
              ))}
            </div>

            {/* 3D Cylindrical Ring Wall */}
            <div
              ref={ringWallRef}
              onPointerDown={handleWallPointerDown}
              onPointerMove={handleWallPointerMove}
              onPointerUp={handleWallPointerUp}
              onPointerCancel={handleWallPointerUp}
              onFocusCapture={() => {
                simRef.current.focusedInWall = true;
              }}
              onBlurCapture={() => {
                simRef.current.focusedInWall = false;
              }}
              className="sr-ring-wall"
            >
              <div ref={lensRef} className="sr-lens">
                <div ref={ringCenterRef} className="sr-ring-center">
                  {RING_SITES.map((site, slot) => {
                    const worldMeta = WORLD_META[site.world];
                    const width = Math.round(CARD_BASE_HEIGHT * site.ratio);
                    return (
                      <a
                        key={slot}
                        ref={(el) => {
                          cardRefs.current[slot] = el;
                        }}
                        href={`#${site.slug}`}
                        data-world={site.world}
                        onClick={(e) => {
                          e.preventDefault();
                          if (performance.now() - simRef.current.lastDragEndMs < 50) {
                            return;
                          }
                          const mappedIdx = slotSiteMapRef.current[slot] ?? slot;
                          setActiveModalSite(RING_SITES[mappedIdx]);
                        }}
                        onMouseMove={(e) => {
                          const rect = e.currentTarget.getBoundingClientRect();
                          if (!rect.width || !rect.height) return;
                          const nx = clamp(
                            (e.clientX - rect.left) / rect.width - 0.5,
                            -0.5,
                            0.5
                          );
                          const ny = clamp(
                            (e.clientY - rect.top) / rect.height - 0.5,
                            -0.5,
                            0.5
                          );
                          const ts = tiltStatesRef.current[slot];
                          ts.tx = -20 * ny;
                          ts.ty = 24 * nx;
                          ts.tz = 45;
                        }}
                        onMouseLeave={() => {
                          const ts = tiltStatesRef.current[slot];
                          ts.tx = 0;
                          ts.ty = 0;
                          ts.tz = 0;
                        }}
                        className="sr-card"
                        style={
                          {
                            width: `${width}px`,
                            left: `${-width / 2}px`,
                            opacity: 0,
                            '--world': worldMeta.color,
                            '--on': worldMeta.onColor,
                          } as React.CSSProperties
                        }
                      >
                        <div
                          ref={(el) => {
                            tiltRefs.current[slot] = el;
                          }}
                          className="sr-card-tilt"
                        >
                          <div className="sr-card-frame" aria-hidden="true" />
                          <div
                            ref={(el) => {
                              faceRefs.current[slot] = el;
                            }}
                            className="sr-card-face"
                          >
                            <img
                              src={site.posterUrl}
                              alt={site.title}
                              referrerPolicy="no-referrer"
                              style={{
                                objectPosition: site.objectPosition || 'center',
                              }}
                              className="sr-card-poster"
                            />
                            <video
                              ref={(el) => {
                                videoRefs.current[slot] = el;
                              }}
                              muted
                              loop
                              playsInline
                              preload="none"
                              onPlaying={(e) => {
                                e.currentTarget.classList.add('is-playing');
                              }}
                              className="sr-card-video"
                            />
                            <div className="sr-card-dim" aria-hidden="true" />
                          </div>
                        </div>
                      </a>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Mist Layer */}
            <div ref={homeMistRef} className="sr-mist" aria-hidden="true" />

            {/* Front Petals */}
            <div ref={homeFrontPetalsRef} className="sr-petals sr-petals-front">
              {FRONT_PETALS.map((p, idx) => (
                <span
                  key={idx}
                  className={`sr-petal ${p.mirrored ? 'is-mirrored' : ''}`}
                  style={{
                    left: `${p.left}%`,
                    top: `${p.top}%`,
                    width: `${p.width}px`,
                    height: `${(p.width * 0.62).toFixed(1)}px`,
                    backgroundColor: p.color,
                    animationDuration: `${p.duration}s`,
                    animationDelay: `${p.delay}s`,
                  }}
                />
              ))}
            </div>

            {/* Light Motes */}
            <div ref={homeMotesRef} className="sr-motes" aria-hidden="true">
              {LIGHT_MOTES.map((m, idx) => (
                <span
                  key={idx}
                  className="sr-mote"
                  style={{
                    left: `${m.left}%`,
                    top: `${m.top}%`,
                    width: `${m.size}px`,
                    height: `${m.size}px`,
                    animationDuration: `${m.duration}s`,
                    animationDelay: `${m.delay}s`,
                  }}
                />
              ))}
            </div>
          </div>

          {/* Compact Your Name Music Box below photographs */}
          <div className="sr-music-bar-wrap">
            <div
              className={`sr-music-bar ${musicPlaying ? 'is-playing' : ''}`}
              role="region"
              aria-label="Reproductor de música Your Name"
            >
              <button
                type="button"
                onClick={handleToggleMusic}
                aria-label={musicPlaying ? 'Pausar música de Your Name' : 'Reproducir música de Your Name'}
                aria-pressed={musicPlaying}
                className="sr-music-play-btn"
              >
                {musicPlaying ? (
                  <Pause className="w-4 h-4 fill-current" />
                ) : (
                  <Play className="w-4 h-4 fill-current ml-0.5" />
                )}
              </button>

              <div className="sr-music-meta">
                <span className="sr-music-title">
                  <Music2 className="w-3.5 h-3.5 shrink-0 text-[#15803D]" />
                  <span>Your Name — Katawaredoki</span>
                </span>
                <span className="sr-music-sub">
                  {musicPlaying
                    ? 'Reproduciendo melodía...'
                    : 'Presiona Play para escuchar'}
                </span>
              </div>

              <div className="sr-music-eq" aria-hidden="true">
                <span />
                <span />
                <span />
                <span />
              </div>
            </div>
          </div>
        </section>
      )}

      {/* VIEW 2: MENSAJE / BUILD */}
      {view === 'build' && (
        <section
          id="view-build"
          className={`sr-view sr-build-stage ${
            buildEntered ? 'is-entered' : ''
          }`}
        >
          <div className="sr-build-panel">
            <div ref={buildSceneRef} className="sr-scene-layer">
              <img
                src={SEA_STILL_URL}
                alt="Cielo estrellado con cometa luminoso sobre nubes al atardecer"
                referrerPolicy="no-referrer"
                className="sr-scene-still"
              />
              {SEA_VIDEO_URL && (
                <video
                  ref={buildVideoRef}
                  muted
                  loop
                  playsInline
                  preload="none"
                  onPlaying={() => setSeaBuildPlaying(true)}
                  className={`sr-scene-video ${
                    seaBuildPlaying ? 'is-playing' : ''
                  }`}
                />
              )}
              <div className="sr-scene-grain" />
            </div>

            <div ref={buildPetalsRef} className="sr-petals sr-petals-back">
              {ALL_PETALS.map((p, idx) => (
                <span
                  key={idx}
                  className={`sr-petal ${p.mirrored ? 'is-mirrored' : ''}`}
                  style={{
                    left: `${p.left}%`,
                    top: `${p.top}%`,
                    width: `${p.width}px`,
                    height: `${(p.width * 0.62).toFixed(1)}px`,
                    backgroundColor: p.color,
                    animationDuration: `${p.duration}s`,
                    animationDelay: `${p.delay}s`,
                  }}
                />
              ))}
            </div>

            <div className="sr-build-content">
              <h1 className="sr-build-headline">
                <span className="sr-bword-mask">
                  <span
                    className="sr-bword-inner"
                    style={{ '--bd': '0.15s' } as React.CSSProperties}
                  >
                    Contigo
                  </span>
                </span>{' '}
                <span className="sr-bword-mask">
                  <span
                    className="sr-bword-inner"
                    style={{ '--bd': '0.21s' } as React.CSSProperties}
                  >
                    cada
                  </span>
                </span>{' '}
                <span className="sr-bword-mask">
                  <span
                    className="sr-bword-inner"
                    style={{ '--bd': '0.27s' } as React.CSSProperties}
                  >
                    día
                  </span>
                </span>
                <br />
                <span className="sr-bword-mask">
                  <span
                    className="sr-bword-inner"
                    style={{ '--bd': '0.33s' } as React.CSSProperties}
                  >
                    es
                  </span>
                </span>{' '}
                <span className="sr-bword-mask">
                  <span
                    className="sr-bword-inner"
                    style={{ '--bd': '0.39s' } as React.CSSProperties}
                  >
                    para
                  </span>
                </span>{' '}
                <span className="sr-bword-mask">
                  <span
                    className="sr-bword-inner"
                    style={{ '--bd': '0.45s' } as React.CSSProperties}
                  >
                    siempre.
                  </span>
                </span>
              </h1>

              <form onSubmit={handleSaveBrief} className="sr-brief-card">
                <p className="sr-kicker">ESCRIBE UN RECUERDO O PROMESA</p>

                <p className="sr-brief-sentence">
                  Quiero recordar{' '}
                  <input
                    type="text"
                    value={whatText}
                    onChange={(e) => setWhatText(e.target.value)}
                    placeholder="nuestros 5 años juntos"
                    aria-label="Lo que quieres recordar"
                    className="sr-blank"
                    style={{ width: 'calc(23 * 0.5em)' }}
                  />
                  <br className="sr-desktop-br" /> con{' '}
                  <input
                    type="text"
                    value={forText}
                    onChange={(e) => setForText(e.target.value)}
                    placeholder="mi polluelita hermosa"
                    aria-label="Con quién"
                    className="sr-blank"
                    style={{ width: 'calc(20 * 0.5em)' }}
                  />
                  , y soñar
                  <br className="sr-desktop-br" />{' '}
                  <span
                    role="radiogroup"
                    aria-label="Cuándo"
                    className="sr-radio-group"
                  >
                    {(
                      [
                        'hoy y siempre',
                        'en cada etapa',
                        'por toda la vida',
                      ] as const
                    ).map((opt, idx) => (
                      <span key={opt}>
                        {idx === 1 && ' '}
                        {idx === 2 && ' / '}
                        <button
                          type="button"
                          role="radio"
                          aria-checked={whenChoice === opt}
                          onClick={() => setWhenChoice(opt)}
                          className="sr-radio-btn"
                        >
                          <span>{opt}</span>
                        </button>
                      </span>
                    ))}
                  </span>
                  .
                </p>

                <p className="sr-kicker">
                  PARA LEIDY DIANA PONCE BERNA · DE LUIS FELIPE CUYA RUIZ.
                </p>

                <div className="sr-brief-actions">
                  <button
                    type="button"
                    onClick={handleCopyBrief}
                    title="Copiar mensaje"
                    aria-label="Copiar mensaje"
                    className="sr-ghost-btn"
                  >
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.6"
                      strokeLinecap="round"
                      aria-hidden="true"
                    >
                      <line x1="12" y1="3" x2="12" y2="21" />
                      <line x1="3" y1="12" x2="21" y2="12" />
                      <line x1="5.6" y1="5.6" x2="18.4" y2="18.4" />
                      <line x1="18.4" y1="5.6" x2="5.6" y2="18.4" />
                    </svg>
                  </button>

                  <button
                    type="button"
                    onClick={handleShareBrief}
                    title="Compartir mensaje"
                    aria-label="Compartir mensaje"
                    className="sr-ghost-btn"
                  >
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.6"
                      aria-hidden="true"
                    >
                      <circle cx="12" cy="12" r="8" />
                      <circle cx="12" cy="12" r="3" />
                      <line x1="12" y1="2" x2="12" y2="5" />
                      <line x1="12" y1="19" x2="12" y2="22" />
                    </svg>
                  </button>

                  <button
                    type="submit"
                    onMouseMove={(e) => {
                      const rect = e.currentTarget.getBoundingClientRect();
                      const dx = e.clientX - (rect.left + rect.width / 2);
                      const dy = e.clientY - (rect.top + rect.height / 2);
                      setSendOffset({ x: 0.3 * dx, y: 0.4 * dy });
                    }}
                    onMouseLeave={() => setSendOffset({ x: 0, y: 0 })}
                    style={{
                      transform: `translate(${sendOffset.x.toFixed(
                        1
                      )}px, ${sendOffset.y.toFixed(1)}px)`,
                    }}
                    className="sr-send-btn"
                  >
                    <span>Guardar promesa ↗</span>
                  </button>

                  {feedbackMsg && (
                    <span className="sr-feedback-msg">{feedbackMsg}</span>
                  )}
                </div>
              </form>
            </div>

            {/* Magical translucent white button appearing on the right when promise is saved */}
            <AnimatePresence>
              {promiseSaved && !momentsOpen && (
                <motion.button
                  type="button"
                  onClick={() => setMomentsOpen(true)}
                  initial={
                    reducedMotion
                      ? { opacity: 0 }
                      : { opacity: 0, x: 48, scale: 0.72, filter: 'blur(8px)' }
                  }
                  animate={
                    reducedMotion
                      ? { opacity: 1 }
                      : { opacity: 1, x: 0, scale: 1, filter: 'blur(0px)' }
                  }
                  exit={
                    reducedMotion
                      ? { opacity: 0 }
                      : { opacity: 0, x: 32, scale: 0.88 }
                  }
                  whileHover={reducedMotion ? undefined : { scale: 1.08, x: 2 }}
                  whileTap={reducedMotion ? undefined : { scale: 0.94 }}
                  transition={{ type: 'spring', stiffness: 260, damping: 20 }}
                  aria-label="Abrir nuestros momentos juntos"
                  title="Nuestros momentos juntos"
                  className="fixed md:absolute right-4 md:right-7 bottom-6 md:bottom-auto md:top-1/2 md:-translate-y-1/2 z-30 inline-flex items-center gap-2 px-4 py-3.5 rounded-2xl bg-white/25 hover:bg-white/42 backdrop-blur-md border border-white/80 text-white shadow-[0_12px_36px_rgba(255,255,255,0.28)] cursor-pointer transition-colors"
                >
                  <motion.span
                    animate={
                      reducedMotion
                        ? undefined
                        : { rotate: [0, 14, -10, 0], scale: [1, 1.18, 1] }
                    }
                    transition={{
                      duration: 2.2,
                      repeat: Infinity,
                      ease: 'easeInOut',
                    }}
                    className="inline-flex items-center justify-center"
                  >
                    <Sparkles className="w-4 h-4 text-white shrink-0 drop-shadow-[0_1px_5px_rgba(0,0,0,0.45)]" />
                  </motion.span>
                  <motion.span
                    animate={
                      reducedMotion
                        ? undefined
                        : { x: [0, 6, 0], opacity: [0.85, 1, 0.85] }
                    }
                    transition={{
                      duration: 1.25,
                      repeat: Infinity,
                      ease: 'easeInOut',
                    }}
                    className="inline-flex items-center justify-center"
                  >
                    <ArrowRight className="w-5 h-5 text-white shrink-0 drop-shadow-[0_1px_6px_rgba(0,0,0,0.45)]" />
                  </motion.span>
                </motion.button>
              )}
            </AnimatePresence>
          </div>

          <div className="sr-worked-at">
            <p className="sr-kicker">UNIDOS POR SIEMPRE</p>
            <div className="sr-worked-marks">
              <div className="sr-worked-item">
                <svg
                  className="sr-worked-icon"
                  viewBox="0 0 42 18"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  aria-hidden="true"
                >
                  <path d="M2 12 C 9 3, 15 15, 22 7 C 28 1, 34 13, 40 6" />
                </svg>
                <span>Leidy Diana</span>
              </div>
              <div className="sr-worked-item">
                <svg
                  className="sr-worked-icon"
                  viewBox="0 0 42 18"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M2 15 L 14 4 L 22 11 L 31 3 L 40 15" />
                </svg>
                <span>Luis Felipe</span>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* In-app Card Video Modal */}
      {activeModalSite && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={activeModalSite.title}
          onClick={() => setActiveModalSite(null)}
          className="fixed inset-0 z-[210] bg-[#142619]/55 backdrop-blur-md flex items-center justify-center p-4 sm:p-8"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-3xl rounded-2xl overflow-hidden bg-white border border-[#D5E6D6] shadow-2xl"
          >
            <div className="px-5 py-3.5 flex items-center justify-between border-b border-[#E5E0E2]">
              <div>
                <span
                  className="text-[11px] tracking-[0.12em] uppercase block text-[#15803D]"
                  style={{ fontFamily: 'var(--sr-mono)' }}
                >
                  {WORLD_META[activeModalSite.world].label} · No.{' '}
                  {String(activeModalSite.id).padStart(2, '0')}
                </span>
                <h2
                  className="text-xl text-[#141214]"
                  style={{ fontFamily: 'var(--sr-serif)' }}
                >
                  {activeModalSite.title}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setActiveModalSite(null)}
                aria-label="Cerrar vista"
                className="w-9 h-9 rounded-full border border-[#D5E6D6] text-[#574F53] hover:text-[#15803D] hover:border-[#15803D]/50 inline-flex items-center justify-center cursor-pointer transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="relative aspect-video bg-gradient-to-br from-[#E7F8E8] via-[#F7FCE6] to-[#FEF9D7]">
              {activeModalSite.videoUrl ? (
                <video
                  src={activeModalSite.videoUrl}
                  poster={activeModalSite.posterUrl}
                  autoPlay
                  loop
                  muted
                  playsInline
                  controls
                  className="w-full h-full object-cover"
                />
              ) : (
                <img
                  src={activeModalSite.posterUrl}
                  alt={activeModalSite.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-contain"
                />
              )}
            </div>
          </div>
        </div>
      )}

      {/* Opening Loader Sequence */}
      {!loaderRemoved && (
        <div
          className={`sr-loader ${loaderReady ? 'is-ready' : ''} ${
            loaderLeaving ? 'is-leaving' : ''
          } ${loaderFading ? 'is-fading' : ''}`}
        >
          <div className="sr-loader-word">
            {['G', 'i', 'd', 'y'].map((ch, idx) => (
              <span key={ch} className="sr-loader-char-mask">
                <span
                  className="sr-loader-char"
                  style={{
                    animationDelay: `${(0.1 + idx * 0.08).toFixed(2)}s`,
                  }}
                >
                  {ch}
                </span>
              </span>
            ))}
            <span className="sr-loader-char-mask sr-loader-dot">
              <span
                className="sr-loader-char"
                style={{ animationDelay: '0.42s' }}
              >
                .
              </span>
            </span>
          </div>

          <div className="sr-loader-progress">
            <div className="sr-loader-caption">{typedCaption}</div>
            <div className="sr-odometer-mask">
              <div className="sr-odometer-wrap">
                <span
                  className={`sr-odo-col ${
                    odoDigits.hideHundreds ? 'is-hidden' : ''
                  }`}
                >
                  <span
                    className="sr-odo-strip"
                    style={{
                      transform: `translateY(${-odoDigits.hundreds}em)`,
                    }}
                  >
                    {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((d) => (
                      <span key={d}>{d}</span>
                    ))}
                  </span>
                </span>
                <span
                  className={`sr-odo-col ${
                    odoDigits.hideTens ? 'is-hidden' : ''
                  }`}
                >
                  <span
                    className="sr-odo-strip"
                    style={{ transform: `translateY(${-odoDigits.tens}em)` }}
                  >
                    {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((d) => (
                      <span key={d}>{d}</span>
                    ))}
                  </span>
                </span>
                <span className="sr-odo-col">
                  <span
                    className="sr-odo-strip"
                    style={{ transform: `translateY(${-odoDigits.ones}em)` }}
                  >
                    {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((d) => (
                      <span key={d}>{d}</span>
                    ))}
                  </span>
                </span>
                <span className="sr-odo-pct">%</span>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={jumpToFinalState}
            aria-label="Saltar introducción"
            className="sr-skip-btn"
          >
            ↗
          </button>
        </div>
      )}

      {/* Right-opening "Nuestros momentos juntos" Page */}
      <AnimatePresence>
        {momentsOpen && (
          <OurMomentsPage
            coupleNames={profile.coupleNames}
            musicPlaying={musicPlaying}
            onToggleMusic={handleToggleMusic}
            onBack={() => setMomentsOpen(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
