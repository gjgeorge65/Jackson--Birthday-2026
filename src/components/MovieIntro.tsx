import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { sound } from '../audio';
import { useI18n } from '../i18n';

const stagger = {
  hidden: { opacity: 0, y: 60, filter: 'blur(10px)' },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: { delay: 0.05 * i, duration: 0.7, ease: 'easeOut' as const },
  }),
};

function Letters({ text }: { text: string }) {
  return (
    <div className="flex flex-wrap justify-center">
      {text.split('').map((ch, i) => (
        <motion.span
          key={i}
          custom={i}
          variants={stagger}
          initial="hidden"
          animate="show"
          className="font-display text-2xl sm:text-4xl lg:text-5xl font-bold tracking-[0.25em] text-gold-grad"
        >
          {ch === ' ' ? '\u00A0' : ch}
        </motion.span>
      ))}
    </div>
  );
}

type Stage = 0 | 1 | 2 | 3;

export default function MovieIntro({ onDone }: { onDone: () => void }) {
  const [stage, setStage] = useState<Stage>(0);
  const timers = useRef<number[]>([]);
  const { t } = useI18n();

  useEffect(() => {
    const t1 = window.setTimeout(() => {
      setStage(1);
      sound.boom();
    }, 1600);
    const t2 = window.setTimeout(() => {
      setStage(2);
      sound.boom();
    }, 4300);
    const t3 = window.setTimeout(() => {
      setStage(3);
      sound.whoosh();
    }, 7200);
    timers.current = [t1, t2, t3];
    return () => timers.current.forEach((x) => window.clearTimeout(x));
  }, []);

  const enter = () => {
    sound.fanfare();
    onDone();
  };

  return (
    <div className="fixed inset-0 z-[90] bg-black flex items-center justify-center overflow-hidden grain">
      <div className="absolute inset-0 opacity-40">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[140vmax] h-[70vmax] bg-[conic-gradient(from_90deg_at_50%_50%,transparent_0deg,rgba(212,175,55,0.12)_8deg,transparent_16deg,rgba(212,175,55,0.07)_26deg,transparent_34deg,rgba(59,130,246,0.06)_44deg,transparent_52deg)] spin-slow" />
      </div>

      <AnimatePresence mode="wait">
        {stage === 0 && (
          <motion.div key="s0" exit={{ opacity: 0 }} className="relative text-center px-6">
            <motion.div
              initial={{ scale: 2.4, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 1.2, ease: 'easeOut' }}
              className="w-24 h-24 mx-auto rounded-full border-2 border-gold/60 flex items-center justify-center text-4xl shadow-[0_0_60px_rgba(212,175,55,0.5)]"
            >
              🎬
            </motion.div>
            <Letters text="SAADAN GROUP · JETRAS" />
            <motion.p
              initial={{ opacity: 0, letterSpacing: '0.2em' }}
              animate={{ opacity: 1, letterSpacing: '0.8em' }}
              transition={{ delay: 1.1, duration: 1 }}
              className="mt-4 text-[11px] sm:text-sm text-white/70 uppercase"
            >
              {t('intro.presents')}
            </motion.p>
          </motion.div>
        )}

        {stage === 1 && (
          <motion.div
            key="s1"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="relative text-center px-6"
          >
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1 }}
              className="text-[11px] sm:text-xs tracking-[0.6em] uppercase text-white/50"
            >
              {t('intro.storyOf')}
            </motion.p>
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ delay: 0.4, duration: 1 }}
              className="mx-auto mt-6 h-px w-64 sm:w-96 bg-gold-grad"
            />
          </motion.div>
        )}

        {stage === 2 && (
          <motion.div
            key="s2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="relative text-center px-4"
          >
            <Letters text="JACKSON SAID ISSA" />
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.4 }}
              className="mt-6 text-xs sm:text-sm text-white/50 tracking-[0.4em] uppercase"
            >
              {t('intro.sub')}
            </motion.p>
          </motion.div>
        )}

        {stage === 3 && (
          <motion.div
            key="s3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="relative text-center px-6"
          >
            <p className="font-display text-2xl sm:text-4xl text-gold-grad font-bold mb-8">
              {t('intro.ready')}
            </p>
            <motion.button
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              onClick={enter}
              className="btn-gold text-lg px-10 py-4"
            >
              {t('intro.begin')}
            </motion.button>
            <p className="mt-8 text-[11px] text-white/30 tracking-[0.3em] uppercase">
              {t('intro.note')}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {stage < 3 && (
        <button
          onClick={enter}
          className="absolute bottom-10 right-6 sm:right-10 text-xs text-white/35 hover:text-gold transition-colors"
        >
          {t('intro.skip')}
        </button>
      )}
    </div>
  );
}
