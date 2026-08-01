import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { sound } from '../audio';
import { useI18n } from '../i18n';

export default function LoadingScreen({ onDone }: { onDone: () => void }) {
  const [progress, setProgress] = useState(0);
  const [leaving, setLeaving] = useState(false);
  const started = useRef(false);
  const { t } = useI18n();
  const lines = t('loading.lines') as unknown as string[];

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    sound.unlock();
    sound.startup();

    let p = 0;
    const timer = window.setInterval(() => {
      p += 2 + Math.random() * 5;
      if (p >= 100) {
        p = 100;
        window.clearInterval(timer);
        sound.chime();
        window.setTimeout(() => setLeaving(true), 550);
        window.setTimeout(onDone, 1250);
      }
      setProgress(Math.min(100, Math.floor(p)));
    }, 90);
    return () => window.clearInterval(timer);
  }, [onDone]);

  const msg = lines[Math.min(lines.length - 1, Math.floor((progress / 100) * lines.length))];

  return (
    <AnimatePresence>
      {!leaving && (
        <motion.div
          exit={{ opacity: 0, scale: 1.06, filter: 'blur(8px)' }}
          transition={{ duration: 0.7 }}
          className="fixed inset-0 z-[100] bg-[#05060a] flex flex-col items-center justify-center px-6"
        >
          <div className="relative mb-10">
            <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-full border border-gold/30 flex items-center justify-center spin-slow">
              <div className="absolute inset-2 rounded-full border border-dashed border-gold/20" />
              <span className="text-5xl flicker">🎬</span>
            </div>
            <div className="absolute -inset-4 rounded-full border border-gold/10 pulse-ring" />
          </div>

          <p className="font-display text-xl sm:text-2xl font-bold tracking-[0.3em] text-gold-grad mb-2 uppercase text-center">
            SAADAN GROUP · JETRAS
          </p>
          <p className="text-[11px] tracking-[0.5em] text-white/40 uppercase mb-10 text-center">
            Jackson's Birthday Experience
          </p>

          <div className="w-full max-w-sm h-[3px] rounded-full bg-white/10 overflow-hidden">
            <motion.div
              className="h-full bg-gold-grad"
              animate={{ width: `${progress}%` }}
              transition={{ ease: 'easeOut', duration: 0.25 }}
            />
          </div>

          <div className="mt-5 flex items-center justify-between w-full max-w-sm">
            <span className="text-xs text-gold/80 tracking-[0.25em] uppercase">{msg}</span>
            <span className="font-display text-lg font-bold text-gold">{progress}%</span>
          </div>

          <button
            onClick={() => {
              sound.click();
              setLeaving(true);
              window.setTimeout(onDone, 600);
            }}
            className="mt-12 text-xs text-white/35 hover:text-gold transition-colors underline underline-offset-4"
          >
            {t('loading.skip')}
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
