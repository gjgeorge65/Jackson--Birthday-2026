import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { BIRTHDAY } from '../data';
import { sound, fireworks, confettiRain } from '../audio';
import { useI18n } from '../i18n';

interface TimeLeft {
  d: number;
  h: number;
  m: number;
  s: number;
}

function getTimeLeft(): TimeLeft | null {
  const diff = BIRTHDAY.getTime() - Date.now();
  if (diff <= 0) return null;
  return {
    d: Math.floor(diff / 86400000),
    h: Math.floor((diff / 3600000) % 24),
    m: Math.floor((diff / 60000) % 60),
    s: Math.floor((diff / 1000) % 60),
  };
}

function TimeCell({ value, label }: { value: number; label: string }) {
  const display = String(value).padStart(2, '0');
  return (
    <div className="glass rounded-2xl px-3 py-5 sm:px-6 sm:py-7 min-w-[76px] sm:min-w-[104px] text-center">
      <motion.p
        key={display}
        initial={{ opacity: 0, y: -14 }}
        animate={{ opacity: 1, y: 0 }}
        className="font-display text-3xl sm:text-5xl font-bold text-gold-grad tabular-nums"
      >
        {display}
      </motion.p>
      <p className="mt-2 text-[10px] sm:text-xs tracking-[0.3em] uppercase text-white/45">{label}</p>
    </div>
  );
}

export default function Countdown({ onEnter }: { onEnter: () => void }) {
  const [time, setTime] = useState<TimeLeft | null>(() => getTimeLeft());
  const [unlocked, setUnlocked] = useState(false);
  const fired = useMemo(() => ({ value: false }), []);
  const { t } = useI18n();

  useEffect(() => {
    const timer = window.setInterval(() => {
      const next = getTimeLeft();
      setTime(next);
      if (next === null && !fired.value) {
        fired.value = true;
        setUnlocked(true);
        sound.unlock();
        sound.fanfare();
        fireworks();
        window.setTimeout(fireworks, 900);
        window.setTimeout(confettiRain, 1600);
      }
    }, 1000);
    return () => window.clearInterval(timer);
  }, [fired]);

  return (
    <div className="fixed inset-0 z-[90] bg-[#05060a] flex items-center justify-center px-4 overflow-hidden grain">
      <div className="absolute -top-40 -left-40 w-[500px] h-[500px] rounded-full bg-gold/10 blur-[120px]" />
      <div className="absolute -bottom-40 -right-40 w-[500px] h-[500px] rounded-full bg-blue-800/20 blur-[120px]" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9, ease: 'easeOut' }}
        className="relative text-center max-w-3xl w-full"
      >
        <p className="text-[11px] sm:text-xs tracking-[0.5em] uppercase text-gold/80 mb-4">
          {t('countdown.kicker')}
        </p>
        <h1 className="font-display text-3xl sm:text-5xl lg:text-6xl font-bold leading-tight">
          <span className="text-white">{t('countdown.titleA')}</span>{' '}
          <span className="text-gold-grad shimmer">{t('countdown.titleB')}</span>
        </h1>
        <p className="mt-4 text-white/50 text-sm sm:text-base">{t('countdown.sub')}</p>

        {time ? (
          <div className="mt-12 grid grid-cols-4 gap-2 sm:gap-4 justify-items-center">
            <TimeCell value={time.d} label={t('countdown.days')} />
            <TimeCell value={time.h} label={t('countdown.hours')} />
            <TimeCell value={time.m} label={t('countdown.minutes')} />
            <TimeCell value={time.s} label={t('countdown.seconds')} />
          </div>
        ) : (
          !unlocked && <div className="mt-12 text-gold text-lg">🎉</div>
        )}

        {!unlocked && (
          <button
            onClick={() => {
              sound.click();
              onEnter();
            }}
            className="mt-12 text-xs text-white/35 hover:text-gold transition-colors underline underline-offset-4"
          >
            {t('countdown.skip')}
          </button>
        )}

        {unlocked && (
          <motion.div
            initial={{ opacity: 0, scale: 0.7 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring', stiffness: 120, damping: 12 }}
            className="mt-12"
          >
            <div className="inline-block glass rounded-3xl px-8 sm:px-14 py-8 sm:py-10 relative">
              <div className="absolute inset-0 rounded-3xl bg-gold-grad opacity-10 pulse-ring" />
              <p className="text-[11px] tracking-[0.4em] uppercase text-gold/80 mb-2">System Alert</p>
              <p className="font-display text-4xl sm:text-6xl font-black text-gold-grad shimmer">
                {t('countdown.unlocked')}
              </p>
              <p className="mt-4 text-white/60 text-sm">{t('countdown.birthdayLine')}</p>
              <button
                onClick={() => {
                  sound.fanfare();
                  onEnter();
                }}
                className="btn-gold mt-8"
              >
                {t('countdown.begin')}
              </button>
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
