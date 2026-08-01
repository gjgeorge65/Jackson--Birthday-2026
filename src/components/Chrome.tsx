import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence, useScroll, useSpring } from 'framer-motion';
import { useSettings } from './Ambience';
import { useI18n } from '../i18n';
import { sound, type Genre } from '../audio';
import { shareText, waLink } from '../data';

const NAV_IDS = [
  'home', 'companies', 'story', 'achievements', 'cinema', 'cards', 'games', 'guestbook', 'vision', 'legacy',
];

export function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 120, damping: 24 });
  return (
    <motion.div
      className="fixed top-0 left-0 right-0 h-[3px] z-[70] origin-left bg-gold-grad"
      style={{ scaleX }}
    />
  );
}

const GENRES: Genre[] = ['birthday', 'piano', 'orchestra', 'african', 'cinematic'];

function MusicPanel({ onClose }: { onClose: () => void }) {
  const { t } = useI18n();
  const [genre, setGenre] = useState<Genre>(sound.genre);
  const [vol, setVol] = useState(sound.volume);
  const [muted, setMuted] = useState(sound.muted);

  const pick = (g: Genre) => {
    sound.unlock();
    sound.setGenre(g);
    setGenre(g);
    sound.click();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 10, scale: 0.96 }}
      className="absolute right-0 top-12 w-72 glass-dark rounded-2xl p-5 z-[75] shadow-2xl"
    >
      <div className="flex items-center justify-between mb-4">
        <p className="text-xs tracking-[0.3em] uppercase text-gold">{t('music.title')}</p>
        <button onClick={onClose} className="text-white/50 hover:text-white text-sm">✕</button>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {GENRES.map((g) => (
          <button
            key={g}
            onClick={() => pick(g)}
            className={`chip !justify-center ${genre === g ? 'active' : ''}`}
          >
            {g === 'birthday' ? '🎂' : g === 'piano' ? '🎹' : g === 'orchestra' ? '🎻' : g === 'african' ? '🥁' : '🎬'}{' '}
            {t(`music.tracks.${g}`)}
          </button>
        ))}
        <button
          onClick={() => {
            sound.setGenre('birthday');
            setGenre('birthday');
            sound.click();
          }}
          className={`chip !justify-center ${genre === 'birthday' ? 'active' : ''}`}
        >
          🔇 {t('music.none')}
        </button>
      </div>
      <div className="mt-5 space-y-3">
        <div className="flex items-center gap-3">
          <span className="text-xs text-white/50">{t('music.volume')}</span>
          <input
            type="range"
            min={0}
            max={1}
            step={0.05}
            value={vol}
            onChange={(e) => {
              const v = Number(e.target.value);
              setVol(v);
              sound.setVolume(v);
              sound.unlock();
            }}
            className="flex-1 accent-[#d4af37]"
            aria-label={t('music.volume')}
          />
          <button
            onClick={() => {
              const m = !muted;
              setMuted(m);
              sound.setMuted(m);
              sound.click();
            }}
            className="text-lg"
            title={t('music.none')}
          >
            {muted ? '🔇' : '🔊'}
          </button>
        </div>
      </div>
    </motion.div>
  );
}

export function NavBar() {
  const { t, lang, setLang } = useI18n();
  const { music, setMusic, motion: motionOn, setMotion } = useSettings();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [musicOpen, setMusicOpen] = useState(false);
  const [active, setActive] = useState('home');
  const [fontScale, setFontScale] = useState(() => Number(localStorage.getItem('jb-font') || 100));

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) setActive(e.target.id);
        }
      },
      { rootMargin: '-35% 0px -60% 0px' }
    );
    NAV_IDS.forEach((id) => {
      const el = document.getElementById(id);
      if (el) obs.observe(el);
    });
    return () => obs.disconnect();
  }, []);

  const setFont = (delta: number) => {
    const next = Math.max(85, Math.min(125, fontScale + delta));
    setFontScale(next);
    document.documentElement.style.fontSize = `${next}%`;
    try {
      localStorage.setItem('jb-font', String(next));
    } catch {
      /* ignore */
    }
    sound.click();
  };

  useEffect(() => {
    document.documentElement.style.fontSize = `${fontScale}%`;
  }, []);

  const go = (id: string) => {
    sound.click();
    setMenuOpen(false);
    setMusicOpen(false);
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  const toggleFullscreen = () => {
    sound.click();
    if (document.fullscreenElement) void document.exitFullscreen();
    else void document.documentElement.requestFullscreen().catch(() => undefined);
  };

  const share = async () => {
    sound.click();
    try {
      if ('share' in navigator) await navigator.share({ title: "Jackson's Birthday", text: shareText });
      else window.open(waLink(shareText), '_blank');
    } catch {
      /* cancelled */
    }
  };

  const labels = NAV_IDS.map((id) => ({ id, label: t(`nav.${id}`) }));

  return (
    <>
      <header
        className={`fixed top-0 inset-x-0 z-[60] transition-all duration-500 ${
          scrolled ? 'glass-dark py-2.5' : 'bg-transparent py-4'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between gap-2">
          <button onClick={() => go('home')} className="flex items-center gap-2.5 shrink-0" title="🎬">
            <span className="w-9 h-9 rounded-full bg-gold-grad flex items-center justify-center text-black font-black font-display text-sm shadow-[0_0_18px_rgba(212,175,55,0.5)]">
              J
            </span>
            <span className="hidden sm:block text-left">
              <span className="block font-display font-bold tracking-[0.18em] text-[11px] text-gold">
                SAADAN GROUP · JETRAS
              </span>
              <span className="block text-[10px] tracking-[0.35em] text-white/40 uppercase">
                Presents · Level 23
              </span>
            </span>
          </button>

          <nav className="hidden xl:flex items-center gap-0.5 overflow-x-auto no-scrollbar">
            {labels.map((n) => (
              <button
                key={n.id}
                onClick={() => go(n.id)}
                className={`px-2.5 py-2 rounded-full text-[12.5px] font-medium whitespace-nowrap transition-all ${
                  active === n.id
                    ? 'text-gold bg-gold/10'
                    : 'text-white/60 hover:text-gold hover:bg-gold/5'
                }`}
              >
                {n.label}
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-1.5 shrink-0">
            {/* Language switcher */}
            <div className="hidden sm:flex items-center rounded-full border border-white/15 overflow-hidden">
              <button
                onClick={() => { setLang('en'); sound.click(); }}
                className={`px-2.5 py-1.5 text-xs font-semibold transition-all ${
                  lang === 'en' ? 'bg-gold-grad text-black' : 'text-white/60 hover:text-white'
                }`}
              >
                🇬🇧 EN
              </button>
              <button
                onClick={() => { setLang('sw'); sound.click(); }}
                className={`px-2.5 py-1.5 text-xs font-semibold transition-all ${
                  lang === 'sw' ? 'bg-gold-grad text-black' : 'text-white/60 hover:text-white'
                }`}
              >
                🇹🇿 SW
              </button>
            </div>

            {/* Font size */}
            <div className="hidden md:flex items-center rounded-full border border-white/15 overflow-hidden">
              <button onClick={() => setFont(-5)} className="px-2 py-1.5 text-[10px] text-white/60 hover:text-white" title={t('misc.fontSmall')}>A−</button>
              <button onClick={() => setFont(5)} className="px-2 py-1.5 text-xs text-white/60 hover:text-white" title={t('misc.fontLarge')}>A+</button>
            </div>

            <button
              onClick={() => {
                sound.unlock();
                setMusicOpen((o) => !o);
                if (!music) setMusic(true);
              }}
              title={t('music.title')}
              className={`relative w-9 h-9 rounded-full border flex items-center justify-center transition-all ${
                music
                  ? 'border-gold bg-gold/15 text-gold shadow-[0_0_14px_rgba(212,175,55,0.4)]'
                  : 'border-white/15 text-white/50 hover:text-white'
              }`}
            >
              {music ? '🎵' : '🔇'}
            </button>
            <AnimatePresence>{musicOpen && <MusicPanel onClose={() => setMusicOpen(false)} />}</AnimatePresence>

            <button
              onClick={() => setMotion(!motionOn)}
              title={t('misc.animations')}
              className="hidden sm:flex w-9 h-9 rounded-full border border-white/15 items-center justify-center text-white/50 hover:text-white transition-all"
            >
              {motionOn ? '✨' : '💤'}
            </button>
            <button
              onClick={toggleFullscreen}
              title={t('misc.fullscreen')}
              className="hidden sm:flex w-9 h-9 rounded-full border border-white/15 items-center justify-center text-white/50 hover:text-white transition-all"
            >
              ⛶
            </button>
            <button
              onClick={share}
              title={t('misc.share')}
              className="hidden sm:flex w-9 h-9 rounded-full border border-white/15 items-center justify-center text-white/50 hover:text-white transition-all"
            >
              ↗
            </button>
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="xl:hidden w-9 h-9 rounded-full border border-white/15 flex items-center justify-center text-white/70"
              aria-label={t('nav.home')}
            >
              {menuOpen ? '✕' : '☰'}
            </button>
          </div>
        </div>

        <AnimatePresence>
          {menuOpen && (
            <motion.nav
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="xl:hidden glass-dark mt-2 mx-4 rounded-2xl overflow-hidden"
            >
              <div className="p-3">
                <div className="flex gap-2 mb-2">
                  <button
                    onClick={() => { setLang('en'); sound.click(); }}
                    className={`flex-1 py-2 rounded-xl text-sm font-semibold ${lang === 'en' ? 'bg-gold-grad text-black' : 'bg-white/5 text-white/70'}`}
                  >
                    🇬🇧 English
                  </button>
                  <button
                    onClick={() => { setLang('sw'); sound.click(); }}
                    className={`flex-1 py-2 rounded-xl text-sm font-semibold ${lang === 'sw' ? 'bg-gold-grad text-black' : 'bg-white/5 text-white/70'}`}
                  >
                    🇹🇿 Kiswahili
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-1">
                  {labels.map((n) => (
                    <button
                      key={n.id}
                      onClick={() => go(n.id)}
                      className={`flex items-center gap-2 px-4 py-3 rounded-xl text-sm transition-all ${
                        active === n.id ? 'bg-gold/10 text-gold' : 'text-white/75 hover:bg-gold/10 hover:text-gold'
                      }`}
                    >
                      {n.label}
                    </button>
                  ))}
                </div>
              </div>
            </motion.nav>
          )}
        </AnimatePresence>
      </header>
    </>
  );
}

export function Footer() {
  const { t } = useI18n();
  return (
    <footer className="relative z-10 border-t border-gold/15 bg-black/40">
      <div className="max-w-6xl mx-auto px-6 py-14 text-center">
        <p className="font-display text-2xl font-bold text-gold-grad">SAADAN GROUP · JETRAS</p>
        <p className="mt-3 text-sm text-white/45 max-w-md mx-auto">{t('footer.quote')}</p>
        <div className="mt-6 flex justify-center gap-3 flex-wrap">
          <button onClick={() => window.open('https://saadanfilm.com', '_blank')} className="chip">
            {t('footer.visit')}
          </button>
          <button onClick={() => window.open(waLink(shareText), '_blank')} className="chip">
            {t('footer.share')}
          </button>
        </div>
        <p className="mt-8 text-xs text-white/30 tracking-widest uppercase">{t('footer.rights')}</p>
        <p className="mt-2 text-xs text-white/25">{t('footer.crafted')}</p>
      </div>
    </footer>
  );
}

// QR modal used by ShareHub
import QRCode from 'qrcode';

export function QrModal({ url, onClose }: { url: string; onClose: () => void }) {
  const { t } = useI18n();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    QRCode.toCanvas(canvasRef.current, url, {
      width: 220,
      margin: 1,
      color: { dark: '#0a0a08', light: '#f6e27a' },
    })
      .then(() => undefined)
      .catch(() => undefined);
  }, [url]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[85] bg-black/85 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.85 }}
        animate={{ scale: 1 }}
        className="glass-dark rounded-3xl p-8 text-center relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button onClick={onClose} className="absolute top-3 right-4 text-white/50 hover:text-white">✕</button>
        <p className="text-xs tracking-[0.3em] uppercase text-gold mb-4">{t('wish.shareHub.qrAlt')}</p>
        <canvas ref={canvasRef} className="mx-auto rounded-xl bg-[#f6e27a] p-2" />
        <p className="mt-4 text-[11px] text-white/40 break-all">{url}</p>
      </motion.div>
    </motion.div>
  );
}
