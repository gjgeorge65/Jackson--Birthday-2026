import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  SettingsProvider,
  BadgesProvider,
  useSettings,
  ParticleField,
  Balloons,
} from './components/Ambience';
import { I18nProvider, useI18n } from './i18n';
import { NavBar, Footer, ScrollProgress } from './components/Chrome';
import LoadingScreen from './components/LoadingScreen';
import Countdown from './components/Countdown';
import MovieIntro from './components/MovieIntro';
import { Hero, Companies, Timeline, Achievements, PhotoMemories, Trailer } from './components/Story';
import Wishes from './components/WishStudio';
import GamesHub from './components/GamesHub';
import GuestBook from './components/GuestBook';
import { Vision, Finale } from './components/Vision';
import Legacy from './components/Legacy';
import { sound, fireworks, confettiRain } from './audio';

type Phase = 'loading' | 'countdown' | 'intro' | 'main';

const PHASE_KEY = 'jb-phase-v1';

function Experience() {
  const { music, setMusic } = useSettings();
  const { t } = useI18n();
  const [phase, setPhase] = useState<Phase>(() => {
    try {
      const saved = sessionStorage.getItem(PHASE_KEY);
      if (saved === 'main') return 'main';
    } catch {
      /* ignore */
    }
    return 'loading';
  });
  const [secret, setSecret] = useState(false);
  const konami = useRefKeyBuffer();

  const go = (p: Phase) => {
    setPhase(p);
    if (p === 'main') {
      try {
        sessionStorage.setItem(PHASE_KEY, 'main');
      } catch {
        /* ignore */
      }
      sound.unlock();
      sound.setMusic(true);
    }
  };

  // Keyboard shortcuts + Konami easter egg
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'm' || e.key === 'M') setMusic(!music);
      if (e.key === 'f' || e.key === 'F') {
        if (document.fullscreenElement) void document.exitFullscreen();
        else void document.documentElement.requestFullscreen().catch(() => undefined);
      }
      if (konami(e.key)) {
        sound.fanfare();
        fireworks();
        window.setTimeout(confettiRain, 800);
        setSecret(true);
        window.setTimeout(() => setSecret(false), 4000);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [music, setMusic, konami]);

  return (
    <div className="relative min-h-screen bg-[#05060a] text-[#f5f2e9]">
      <div className="fixed inset-0 z-0 pointer-events-none bg-[radial-gradient(ellipse_at_top,rgba(11,21,38,0.85),#05060a_70%)]" />
      <ParticleField />
      <Balloons />
      <div className="fixed inset-0 z-[2] pointer-events-none shadow-[inset_0_0_180px_rgba(0,0,0,0.85)]" />

      <AnimatePresence>
        {phase === 'loading' && <LoadingScreen key="loading" onDone={() => go('countdown')} />}
        {phase === 'countdown' && <Countdown key="countdown" onEnter={() => go('intro')} />}
        {phase === 'intro' && <MovieIntro key="intro" onDone={() => go('main')} />}
      </AnimatePresence>

      {/* Konami secret banner */}
      <AnimatePresence>
        {secret && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="fixed top-16 left-1/2 -translate-x-1/2 z-[96] glass-dark rounded-full px-6 py-3 text-sm text-gold shadow-[0_0_30px_rgba(212,175,55,0.4)]"
          >
            {t('misc.easter')}
          </motion.div>
        )}
      </AnimatePresence>

      {phase === 'main' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1 }}>
          <ScrollProgress />
          <NavBar />
          <main className="relative">
            <Hero />
            <Companies />
            <Timeline />
            <Achievements />
            <PhotoMemories />
            <Trailer />
            <Wishes />
            <GamesHub />
            <GuestBook />
            <Vision />
            <Legacy />
            <Finale />
          </main>
          <Footer />
        </motion.div>
      )}
    </div>
  );
}

// Konami sequence tracker
const KONAMI = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];

function useRefKeyBuffer() {
  const seq = useRef<string[]>([]);
  return (key: string): boolean => {
    seq.current = [...seq.current, key.toLowerCase()].slice(-KONAMI.length);
    const match = KONAMI.every((k, i) => seq.current[i]?.toLowerCase() === k.toLowerCase());
    if (match) seq.current = [];
    return match;
  };
}

import { useRef } from 'react';

export default function App() {
  return (
    <I18nProvider>
      <SettingsProvider>
        <BadgesProvider>
          <Experience />
        </BadgesProvider>
      </SettingsProvider>
    </I18nProvider>
  );
}
