import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import type { ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { sound } from '../audio';
import { loadBadges, saveBadge, type BadgeId } from '../data';
import { useI18n } from '../i18n';

// ─── Settings ───
interface Settings {
  music: boolean;
  motion: boolean;
  setMusic: (b: boolean) => void;
  setMotion: (b: boolean) => void;
}

const SettingsContext = createContext<Settings>({
  music: false,
  motion: true,
  setMusic: () => undefined,
  setMotion: () => undefined,
});

export const useSettings = () => useContext(SettingsContext);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [music, setMusicState] = useState(false);
  const [motion, setMotionState] = useState(true);

  const setMusic = useCallback((b: boolean) => {
    sound.unlock();
    setMusicState(b);
    sound.setMusic(b);
  }, []);

  const setMotion = useCallback((b: boolean) => {
    setMotionState(b);
    if (!b) sound.setEnabled(false);
  }, []);

  return (
    <SettingsContext.Provider value={{ music, motion, setMusic, setMotion }}>
      {children}
    </SettingsContext.Provider>
  );
}

// ─── Badges ───
interface BadgesCtx {
  badges: string[];
  earn: (id: BadgeId) => void;
}

const BadgesContext = createContext<BadgesCtx>({ badges: [], earn: () => undefined });
export const useBadges = () => useContext(BadgesContext);

export function BadgesProvider({ children }: { children: ReactNode }) {
  const [badges, setBadges] = useState<string[]>(() => loadBadges());
  const [toast, setToast] = useState<string | null>(null);
  const { t } = useI18n();
  const toastTimer = useRef<number | null>(null);

  const earn = useCallback(
    (id: BadgeId) => {
      const next = saveBadge(id);
      if (next.length > badges.length) {
        setBadges(next);
        const name = t(`badges.${id}.name`);
        setToast(t('misc.badgeToast', { name }));
        sound.pop();
        if (toastTimer.current) window.clearTimeout(toastTimer.current);
        toastTimer.current = window.setTimeout(() => setToast(null), 2800);
      }
    },
    [badges.length, t]
  );

  return (
    <BadgesContext.Provider value={{ badges, earn }}>
      {children}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 40 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[95] glass-dark rounded-full px-6 py-3 flex items-center gap-2 text-sm text-gold shadow-[0_0_30px_rgba(212,175,55,0.3)]"
          >
            <span className="text-lg">🏅</span> {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </BadgesContext.Provider>
  );
}

// ─── Gold dust particle field ───
export function ParticleField() {
  const { motion: motionOn } = useSettings();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !motionOn) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let raf = 0;
    let w = window.innerWidth;
    let h = window.innerHeight;
    const DPR = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = w * DPR;
    canvas.height = h * DPR;
    ctx.scale(DPR, DPR);

    const N = Math.min(90, Math.floor((w * h) / 22000));
    const parts = Array.from({ length: N }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      r: 0.6 + Math.random() * 1.8,
      v: 0.12 + Math.random() * 0.4,
      tw: Math.random() * Math.PI * 2,
      hue: Math.random() > 0.75 ? 'rgba(255,255,255,' : 'rgba(212,175,55,',
    }));

    const onResize = () => {
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = w * DPR;
      canvas.height = h * DPR;
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    };
    window.addEventListener('resize', onResize);

    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      for (const p of parts) {
        p.y -= p.v;
        p.tw += 0.02;
        if (p.y < -8) {
          p.y = h + 8;
          p.x = Math.random() * w;
        }
        const alpha = 0.14 + 0.3 * (0.5 + 0.5 * Math.sin(p.tw));
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `${p.hue}${alpha})`;
        ctx.fill();
      }
      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', onResize);
    };
  }, [motionOn]);

  if (!motionOn) return null;
  return <canvas ref={canvasRef} className="fixed inset-0 z-0 pointer-events-none" aria-hidden />;
}

// ─── Floating balloons ───
const BALLOON_COLORS = [
  'rgba(212,175,55,0.35)',
  'rgba(212,175,55,0.18)',
  'rgba(59,130,246,0.22)',
  'rgba(246,226,122,0.3)',
  'rgba(160,120,40,0.28)',
  'rgba(255,255,255,0.14)',
];

export function Balloons() {
  const { motion: motionOn } = useSettings();
  if (!motionOn) return null;
  return (
    <div className="fixed inset-0 z-[1] pointer-events-none overflow-hidden" aria-hidden>
      {BALLOON_COLORS.map((c, i) => (
        <div
          key={i}
          className="balloon"
          style={{
            left: `${6 + i * 13}%`,
            width: `${26 + (i % 4) * 8}px`,
            height: `${34 + (i % 4) * 11}px`,
            background: `radial-gradient(circle at 32% 28%, rgba(255,255,255,0.35), ${c} 60%)`,
            animationDuration: `${16 + (i % 5) * 5}s`,
            animationDelay: `${-i * 3.4}s`,
          }}
        />
      ))}
    </div>
  );
}

// ─── Section title ───
export function SectionTitle({
  kicker,
  title,
  sub,
}: {
  kicker: string;
  title: string;
  sub?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.7, ease: 'easeOut' }}
      className="text-center max-w-3xl mx-auto mb-14"
    >
      <p className="text-[11px] sm:text-xs tracking-[0.5em] uppercase text-gold mb-3">{kicker}</p>
      <h2 className="font-display text-3xl sm:text-5xl font-bold text-gold-grad shimmer">{title}</h2>
      <div className="mx-auto mt-5 h-px w-40 bg-gold-grad opacity-70" />
      {sub && <p className="mt-5 text-sm sm:text-base text-white/55 leading-relaxed">{sub}</p>}
    </motion.div>
  );
}

// ─── Section wrapper ───
export function Section({
  id,
  children,
  className = '',
}: {
  id?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section id={id} className={`relative z-10 py-20 sm:py-28 px-4 sm:px-8 ${className}`}>
      <div className="max-w-6xl mx-auto">{children}</div>
    </section>
  );
}
