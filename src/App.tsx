import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, MotionConfig, motion } from 'motion/react';
import type {
  DedicationProfile,
  SharedMemory,
} from './types/dedication';
import {
  DEFAULT_MEMORIES,
  DEFAULT_PROFILE,
  idbGet,
  idbSet,
} from './utils/storage';
import { OpeningChickGate } from './components/OpeningChickGate';
import { FingerprintEnvelopeStep } from './components/FingerprintEnvelopeStep';
import { FullScreenLetterPage } from './components/FullScreenLetterPage';
import { TimeTogetherPage } from './components/TimeTogetherPage';
import { calculateDuration } from './components/TimeTogetherCounter';
import { SeaRingExperience } from './components/SeaRingExperience';
import { DrawingsDashboardPage } from './components/DrawingsDashboardPage';

const KEYS = {
  profile: 'dedication_profile_v1',
  memories: 'dedication_memories_v1',
  partnerSignature: 'dedication_partner_signature_v1',
};

export default function App() {
  const [profile, setProfile] = useState<DedicationProfile>(DEFAULT_PROFILE);
  const [memories, setMemories] = useState<SharedMemory[]>(DEFAULT_MEMORIES);
  const [entryStage, setEntryStage] = useState<
    'chick' | 'envelope' | 'letter' | 'time' | 'sea-ring'
  >('chick');
  const [partnerSignature, setPartnerSignature] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const [dashboardRoute, setDashboardRoute] = useState<{
    active: boolean;
    drawingId: string | null;
  }>(() => {
    if (typeof window === 'undefined') return { active: false, drawingId: null };
    const params = new URLSearchParams(window.location.search);
    return {
      active: params.get('dashboard') === 'dibujos',
      drawingId: params.get('id'),
    };
  });

  useEffect(() => {
    const syncRoute = () => {
      const params = new URLSearchParams(window.location.search);
      setDashboardRoute({
        active: params.get('dashboard') === 'dibujos',
        drawingId: params.get('id'),
      });
    };
    window.addEventListener('popstate', syncRoute);
    return () => window.removeEventListener('popstate', syncRoute);
  }, []);

  // Hydrate persisted state from IndexedDB on mount
  useEffect(() => {
    let active = true;
    (async () => {
      const [savedProfile, savedMemories, savedSignature] = await Promise.all([
        idbGet<DedicationProfile>(KEYS.profile),
        idbGet<SharedMemory[]>(KEYS.memories),
        idbGet<string>(KEYS.partnerSignature),
      ]);

      if (!active) return;
      if (savedProfile) {
        const nextProfile = { ...savedProfile };
        if (nextProfile.coupleNames === 'Sofía & Mateo') {
          nextProfile.coupleNames = DEFAULT_PROFILE.coupleNames;
          nextProfile.partnerOne = DEFAULT_PROFILE.partnerOne;
          nextProfile.partnerTwo = DEFAULT_PROFILE.partnerTwo;
        }
        if (
          nextProfile.headline ===
          'Cada instante contigo se ha vuelto mi lugar favorito en el mundo'
        ) {
          nextProfile.headline = DEFAULT_PROFILE.headline;
        }
        if (nextProfile.letter.startsWith('Desde aquella tarde de junio')) {
          nextProfile.letter = DEFAULT_PROFILE.letter;
        }
        if (nextProfile.startDateIso === '2022-06-14T19:30') {
          nextProfile.startDateIso = DEFAULT_PROFILE.startDateIso;
        }
        setProfile(nextProfile);
      }
      if (savedMemories) setMemories(savedMemories);
      if (savedSignature) setPartnerSignature(savedSignature);
      setHydrated(true);
    })();

    return () => {
      active = false;
    };
  }, []);

  // Persist updates once hydrated
  useEffect(() => {
    if (!hydrated) return;
    void idbSet(KEYS.profile, profile);
  }, [profile, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    void idbSet(KEYS.memories, memories);
  }, [memories, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    void idbSet(KEYS.partnerSignature, partnerSignature);
  }, [partnerSignature, hydrated]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, [entryStage]);

  const totalDays = useMemo(
    () => calculateDuration(profile.startDateIso, new Date()).totalDays,
    [profile.startDateIso]
  );

  const handleAddMemory = (newMem: Omit<SharedMemory, 'id'>) => {
    setMemories((prev) => [
      { ...newMem, id: `mem-${Date.now()}` },
      ...prev,
    ]);
  };

  if (dashboardRoute.active) {
    return (
      <MotionConfig reducedMotion="user">
        <DrawingsDashboardPage
          initialDrawingId={dashboardRoute.drawingId}
          onGoToStory={() => {
            window.history.pushState(null, '', '/');
            setDashboardRoute({ active: false, drawingId: null });
          }}
        />
      </MotionConfig>
    );
  }

  return (
    <MotionConfig reducedMotion="user">
      <AnimatePresence mode="wait">
        {entryStage === 'chick' ? (
          <motion.div
            key="opening-gate"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          >
            <OpeningChickGate onOpen={() => setEntryStage('envelope')} />
          </motion.div>
        ) : entryStage === 'envelope' ? (
          <motion.div
            key="fingerprint-envelope"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          >
            <FingerprintEnvelopeStep
              partnerOne={profile.partnerOne}
              partnerTwo={profile.partnerTwo}
              coupleNames={profile.coupleNames}
              onUnlocked={() => setEntryStage('letter')}
            />
          </motion.div>
        ) : entryStage === 'letter' ? (
          <motion.div
            key="fullscreen-letter"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          >
            <FullScreenLetterPage
              profile={profile}
              partnerSignature={partnerSignature}
              onChangePartnerSignature={setPartnerSignature}
              onContinue={() => setEntryStage('time')}
            />
          </motion.div>
        ) : entryStage === 'time' ? (
          <motion.div
            key="time-together-page"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          >
            <TimeTogetherPage
              profile={profile}
              onContinue={() => setEntryStage('sea-ring')}
            />
          </motion.div>
        ) : (
          <motion.div
            key="sea-ring-experience"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          >
            <SeaRingExperience
              profile={profile}
              totalDays={totalDays}
              totalMemories={memories.length}
              onAddMemory={handleAddMemory}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </MotionConfig>
  );
}
