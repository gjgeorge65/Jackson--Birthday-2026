import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Section, SectionTitle } from './Ambience';
import {
  timelineMeta,
  achievementIcons,
  companies,
  films,
  galleryItems,
  waLink,
  LEVEL,
  siteUrl,
} from '../data';
import { sound, confettiRain } from '../audio';
import { useI18n } from '../i18n';
import { useBadges } from './Ambience';

// ─── Hero ───
export function Hero() {
  const { t } = useI18n();
  const go = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  const marquee = (t('hero.marquee') + '★ ').repeat(4);

  return (
    <section id="home" className="relative z-10 min-h-screen flex flex-col justify-center overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 pt-28 pb-16 grid lg:grid-cols-2 gap-12 items-center flex-1 w-full">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: 'easeOut' }}
          className="text-center lg:text-left"
        >
          <p className="inline-flex items-center gap-2 chip mb-6">
            <span className="w-2 h-2 rounded-full bg-gold animate-pulse" />
            {t('hero.badge')}
          </p>
          <h1 className="font-display font-black leading-[1.05]">
            <span className="block text-4xl sm:text-6xl lg:text-7xl text-white">{t('hero.firstName')}</span>
            <span className="block text-4xl sm:text-6xl lg:text-7xl text-gold-grad shimmer">
              {t('hero.lastName')}
            </span>
          </h1>
          <p className="mt-6 text-base sm:text-lg text-white/60 max-w-xl mx-auto lg:mx-0 leading-relaxed">
            {t('hero.role')} <span className="text-gold font-semibold">{t('hero.level')}</span>
            {t('hero.role2')}
          </p>
          <div className="mt-9 flex flex-wrap gap-3 justify-center lg:justify-start">
            <button onClick={() => { sound.click(); go('story'); }} className="btn-gold">
              {t('hero.explore')}
            </button>
            <button onClick={() => { sound.pop(); go('cards'); }} className="btn-ghost">
              {t('hero.candle')}
            </button>
          </div>
          <div className="mt-10 grid grid-cols-3 gap-4 max-w-md mx-auto lg:mx-0">
            {[
              [String(LEVEL), t('hero.stat1')],
              ['2', t('hero.stat2')],
              [String(films.length), t('hero.stat3')],
            ].map(([n, l]) => (
              <div key={l} className="glass rounded-2xl py-4 text-center">
                <p className="font-display text-2xl sm:text-3xl font-bold text-gold-grad">{n}</p>
                <p className="mt-1 text-[10px] sm:text-[11px] tracking-[0.15em] uppercase text-white/45">{l}</p>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.1, delay: 0.25, ease: 'easeOut' }}
          className="relative flex justify-center"
        >
          <div className="relative w-[280px] sm:w-[360px] lg:w-[400px]">
            <div className="absolute -inset-6 rounded-[2rem] bg-gold-grad opacity-20 blur-3xl" />
            <div className="relative rounded-[2rem] overflow-hidden border-2 border-gold/50 shadow-[0_0_80px_rgba(212,175,55,0.3)]">
              <img src="images/portrait.jpg" alt="Jackson Said Issa" className="w-full aspect-[4/5] object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/20" />
              <div className="absolute bottom-4 left-0 right-0 text-center">
                <p className="font-hand text-3xl text-gold-light">{t('hero.hand')}</p>
                <p className="text-[10px] tracking-[0.4em] uppercase text-white/60 mt-1">{t('hero.caption')}</p>
              </div>
            </div>
            {[
              { i: '🎭', l: 'SAADAN GROUP', pos: '-left-4 top-8', d: 0.5 },
              { i: '🤖', l: 'JETRAS', pos: '-right-3 top-1/3', d: 0.7 },
              { i: '🌍', l: 'Vision 2030', pos: '-left-2 bottom-10', d: 0.9 },
            ].map((b) => (
              <motion.div
                key={b.l}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: b.d, type: 'spring', stiffness: 160 }}
                className={`absolute ${b.pos} glass rounded-2xl px-4 py-2.5 flex items-center gap-2 shadow-xl`}
              >
                <span className="text-xl">{b.i}</span>
                <span className="text-xs font-semibold text-gold tracking-wide">{b.l}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      <div className="relative z-10 border-y border-gold/20 bg-black/40 py-3 overflow-hidden">
        <div className="marquee-track flex whitespace-nowrap">
          <span className="text-xs tracking-[0.4em] text-gold/70 pr-8">{marquee}</span>
          <span className="text-xs tracking-[0.4em] text-gold/70 pr-8">{marquee}</span>
        </div>
      </div>
    </section>
  );
}

// ─── Companies ───
export function Companies() {
  const { t } = useI18n();
  const ent = (companies.entities as { initials: string; icon: string; id: string }[]).map((e, i) => ({
    ...e,
    name: (t('companies.entities') as unknown as { name: string; role: string; text: string }[])[i].name,
    role: (t('companies.entities') as unknown as { name: string; role: string; text: string }[])[i].role,
    text: (t('companies.entities') as unknown as { name: string; role: string; text: string }[])[i].text,
  }));
  const focus = t('companies.jetrasFocus') as unknown as string[];

  return (
    <Section id="companies" className="bg-gradient-to-b from-transparent via-[#070b14] to-transparent">
      <SectionTitle kicker={t('companies.kicker')} title={t('companies.title')} sub={t('companies.sub')} />

      <div className="grid lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="glass rounded-3xl p-7 sm:p-9 relative overflow-hidden"
        >
          <div className="absolute -top-20 -right-20 w-56 h-56 rounded-full bg-gold/10 blur-3xl" />
          <div className="flex items-center gap-4">
            <span className="w-14 h-14 rounded-2xl bg-gold-grad flex items-center justify-center text-black text-xl font-black font-display">
              SG
            </span>
            <div>
              <h3 className="font-display text-xl sm:text-2xl font-bold text-gold-grad">{t('companies.groupName')}</h3>
              <p className="text-[11px] tracking-[0.3em] uppercase text-white/45 mt-1">{t('companies.groupRole')}</p>
            </div>
          </div>
          <p className="mt-5 text-white/60 text-sm leading-relaxed">{t('companies.groupText')}</p>
          <div className="mt-6 grid sm:grid-cols-2 gap-3">
            {ent.map((e) => (
              <div key={e.id} className="rounded-2xl border border-gold/20 bg-black/30 p-4 hover:border-gold/50 transition-all">
                <div className="flex items-center gap-2">
                  <span className="text-xl">{e.icon}</span>
                  <p className="font-display font-bold text-gold text-sm">{e.name}</p>
                </div>
                <p className="text-[10px] tracking-[0.25em] uppercase text-white/40 mt-1.5">{e.role}</p>
                <p className="text-xs text-white/55 mt-2 leading-relaxed">{e.text}</p>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.15 }}
          className="glass rounded-3xl p-7 sm:p-9 relative overflow-hidden flex flex-col"
        >
          <div className="absolute -top-20 -right-20 w-56 h-56 rounded-full bg-blue-500/10 blur-3xl" />
          <div className="flex items-center gap-4">
            <span className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-900 flex items-center justify-center text-white text-xl font-black font-display">
              JT
            </span>
            <div>
              <h3 className="font-display text-xl sm:text-2xl font-bold text-white">{t('companies.jetrasName')}</h3>
              <p className="text-[11px] tracking-[0.3em] uppercase text-blue-300/80 mt-1">{t('companies.jetrasRole')}</p>
            </div>
          </div>
          <p className="mt-5 text-white/60 text-sm leading-relaxed">{t('companies.jetrasText')}</p>
          <div className="mt-6 flex flex-wrap gap-2">
            {focus.map((f) => (
              <span key={f} className="chip !cursor-default">⚡ {f}</span>
            ))}
          </div>
          <div className="mt-auto pt-8">
            <div className="rounded-2xl border border-blue-400/20 bg-blue-500/5 p-4">
              <p className="text-xs text-white/50 leading-relaxed">
                🤖 {t('companies.jetrasText')}
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </Section>
  );
}

// ─── Timeline ───
export function Timeline() {
  const { t } = useI18n();
  const scroller = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(6);
  const scenes = t('timeline.scenes') as unknown as { title: string; text: string; detail: string }[];

  const scrollBy = (dir: number) => {
    sound.click();
    scroller.current?.scrollBy({ left: dir * 320, behavior: 'smooth' });
  };

  return (
    <Section id="story">
      <SectionTitle kicker={t('timeline.kicker')} title={t('timeline.title')} sub={t('timeline.sub')} />

      <div className="relative">
        <div className="hidden lg:block absolute left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-gold/40 to-transparent -translate-x-1/2" />
        <div ref={scroller} className="timeline-scroll flex gap-5 overflow-x-auto no-scrollbar pb-4 px-2">
          {timelineMeta.map((item, i) => (
            <motion.button
              key={item.year}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.06 }}
              onClick={() => {
                sound.pop();
                setActive(i);
                scroller.current?.scrollTo({ left: i * 340 - 40, behavior: 'smooth' });
              }}
              className={`glass rounded-3xl p-6 w-[270px] shrink-0 text-left transition-all duration-300 hover:border-gold/60 ${
                active === i ? 'border-gold/70 shadow-[0_0_40px_rgba(212,175,55,0.2)]' : ''
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-3xl">{item.icon}</span>
                <span className="font-display text-lg font-bold text-gold-grad">{item.year}</span>
              </div>
              <h3 className="mt-4 font-display font-bold text-white text-lg">{scenes[i].title}</h3>
              <p className="mt-2 text-sm text-white/55">{scenes[i].text}</p>
              <span className="mt-4 inline-flex items-center gap-1 text-[11px] tracking-[0.25em] uppercase text-gold/80">
                {active === i ? t('timeline.open') : t('timeline.tap')}
              </span>
            </motion.button>
          ))}
        </div>
        <div className="mt-4 flex justify-center gap-3">
          <button onClick={() => scrollBy(-1)} className="btn-ghost !px-5 !py-2 text-sm">{t('timeline.earlier')}</button>
          <button onClick={() => scrollBy(1)} className="btn-ghost !px-5 !py-2 text-sm">{t('timeline.later')}</button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={active}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.4 }}
          className="mt-10 glass rounded-3xl p-7 sm:p-10 relative overflow-hidden"
        >
          <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full bg-gold/10 blur-3xl" />
          <div className="flex flex-col sm:flex-row gap-6 items-start">
            <span className="text-5xl sm:text-6xl">{timelineMeta[active].icon}</span>
            <div>
              <p className="text-[11px] tracking-[0.4em] uppercase text-gold mb-2">
                {timelineMeta[active].year} · Scene {active + 1}
              </p>
              <h3 className="font-display text-2xl sm:text-3xl font-bold text-white">{scenes[active].title}</h3>
              <p className="mt-4 text-white/65 leading-relaxed max-w-2xl">{scenes[active].detail}</p>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </Section>
  );
}

// ─── Achievements ───
interface AchItem {
  title: string;
  tag: string;
  text: string;
  details: string[];
  stat: string;
}

export function Achievements() {
  const { t } = useI18n();
  const { earn } = useBadges();
  const [flipped, setFlipped] = useState<Record<number, boolean>>({});
  const [modal, setModal] = useState<number | null>(null);
  const [dream, setDream] = useState('');
  const [dreamSaved, setDreamSaved] = useState(false);
  const items = t('achievements.items') as unknown as AchItem[];
  const yt = t('achievements.yourTurn') as unknown as Record<string, string>;

  const flip = (i: number) => {
    sound.pop();
    setFlipped((f) => ({ ...f, [i]: !f[i] }));
  };

  const saveDream = () => {
    if (!dream.trim()) return;
    sound.chime();
    setDreamSaved(true);
    earn('dream');
    window.setTimeout(() => setDreamSaved(false), 2500);
  };

  const downloadDream = () => {
    if (!dream.trim()) return;
    const blob = new Blob([`"${dream}" — a dream shared on Jackson's birthday, 2026. 💛`], { type: 'text/plain' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'my-dream.txt';
    a.click();
    URL.revokeObjectURL(a.href);
  };

  return (
    <Section id="achievements" className="bg-gradient-to-b from-transparent via-[#070b14] to-transparent">
      <SectionTitle kicker={t('achievements.kicker')} title={t('achievements.title')} sub={t('achievements.sub')} />
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 [perspective:1600px]">
        {items.map((a, i) => (
          <motion.div
            key={a.title}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.06 }}
            className={`flip-card h-52 sm:h-56 cursor-pointer ${flipped[i] ? 'flipped' : ''}`}
            onClick={() => flip(i)}
          >
            <div className="flip-inner">
              <div className="flip-face glass flex flex-col items-center justify-center p-5 text-center">
                <span className="text-4xl sm:text-5xl">{achievementIcons[i]}</span>
                <h3 className="mt-3 font-display font-bold text-lg sm:text-xl text-gold-grad">{a.title}</h3>
                <p className="mt-1 text-[10px] tracking-[0.3em] uppercase text-white/40">{a.tag}</p>
                <p className="mt-3 text-[10px] text-white/30">{t('achievements.flip')}</p>
              </div>
              <div className="flip-face flip-back bg-gold-grad flex flex-col items-center justify-center p-5 text-center text-black">
                <span className="text-2xl">{achievementIcons[i]}</span>
                <h3 className="mt-2 font-display font-bold text-lg">{a.title}</h3>
                <p className="mt-2 text-[12.5px] leading-snug font-medium">{a.text}</p>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    sound.click();
                    setModal(i);
                  }}
                  className="mt-3 text-[11px] font-black tracking-[0.15em] uppercase underline underline-offset-4"
                >
                  {t('achievements.details')} →
                </button>
              </div>
            </div>
          </motion.div>
        ))}

        {/* Your Turn */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
          className="rounded-3xl border border-dashed border-gold/40 flex flex-col items-center justify-center p-5 text-center bg-gold/5"
        >
          <span className="text-4xl">💭</span>
          <p className="mt-3 font-display font-bold text-gold">{yt.title}</p>
          <p className="mt-2 text-xs text-white/50 leading-relaxed">{yt.text}</p>
          <textarea
            className="input-lux mt-3 !py-2.5 text-sm min-h-[70px] resize-none"
            placeholder={yt.placeholder}
            value={dream}
            onChange={(e) => setDream(e.target.value)}
            maxLength={160}
          />
          <div className="mt-3 flex flex-wrap justify-center gap-2">
            <button onClick={saveDream} className="chip !text-[11px]">{dreamSaved ? '✅' : '💾'} {dreamSaved ? 'OK' : yt.title}</button>
            <button onClick={downloadDream} className="chip !text-[11px]">⬇ {t('achievements.yourTurn.download')}</button>
          </div>
          <p className="mt-3 text-[10px] text-white/35">{yt.hint}</p>
        </motion.div>
      </div>

      {/* Detail modal */}
      <AnimatePresence>
        {modal !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[85] bg-black/85 flex items-center justify-center p-4"
            onClick={() => setModal(null)}
          >
            <motion.div
              initial={{ scale: 0.88, y: 24 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.92, y: 12 }}
              className="glass-dark rounded-3xl p-7 sm:p-10 max-w-lg w-full relative max-h-[85vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setModal(null)}
                className="absolute top-4 right-5 text-white/50 hover:text-white text-lg"
                aria-label={t('achievements.close')}
              >
                ✕
              </button>
              <div className="flex items-center gap-4">
                <span className="text-5xl">{achievementIcons[modal]}</span>
                <div>
                  <h3 className="font-display text-2xl font-bold text-gold-grad">{items[modal].title}</h3>
                  <p className="text-[11px] tracking-[0.3em] uppercase text-white/45 mt-1">{items[modal].tag}</p>
                </div>
              </div>
              <p className="mt-5 text-white/65 leading-relaxed">{items[modal].text}</p>
              <div className="mt-5 space-y-2.5">
                {items[modal].details.map((d, di) => (
                  <div key={di} className="flex items-start gap-2.5 text-sm text-white/70">
                    <span className="text-gold mt-0.5">◆</span>
                    <span>{d}</span>
                  </div>
                ))}
              </div>
              <div className="mt-6 flex flex-wrap gap-2">
                {modal === 2 || modal === 3 ? (
                  films.map((f) => (
                    <span key={f.title} className="chip !cursor-default !text-[11px]">
                      {f.emoji} {f.title}
                    </span>
                  ))
                ) : (
                  <span className="chip !cursor-default !text-[11px]">{items[modal].stat}</span>
                )}
              </div>
              <button
                onClick={() => {
                  sound.click();
                  window.open(waLink(`🏆 ${items[modal].title} — ${items[modal].text} ${siteUrl()}`), '_blank');
                }}
                className="btn-ghost w-full mt-6 text-sm"
              >
                📤 {t('games.quiz.share')}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </Section>
  );
}

// ─── Photo Memories ───
export function PhotoMemories() {
  const { t } = useI18n();
  const [open, setOpen] = useState<number | null>(null);
  const [loaded, setLoaded] = useState<Record<number, boolean>>({});

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (open === null) return;
      if (e.key === 'Escape') setOpen(null);
      if (e.key === 'ArrowRight') setOpen((o) => (o === null ? o : (o + 1) % galleryItems.length));
      if (e.key === 'ArrowLeft')
        setOpen((o) => (o === null ? o : (o - 1 + galleryItems.length) % galleryItems.length));
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  return (
    <Section id="cinema" className="bg-gradient-to-b from-transparent via-[#070b14] to-transparent">
      <SectionTitle kicker={t('gallery.kicker')} title={t('gallery.title')} sub={t('gallery.sub')} />

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {galleryItems.map((g, i) => (
          <motion.button
            key={g.src}
            initial={{ opacity: 0, scale: 0.92 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.05 }}
            onClick={() => {
              sound.click();
              setOpen(i);
            }}
            className={`group relative rounded-2xl overflow-hidden border border-white/10 hover:border-gold/60 transition-all duration-500 ${
              i === 0 ? 'row-span-2' : ''
            }`}
          >
            <img
              src={g.src}
              alt={g.caption}
              loading="lazy"
              onLoad={() => setLoaded((l) => ({ ...l, [i]: true }))}
              className={`w-full object-cover transition-all duration-700 group-hover:scale-110 ${
                i === 0 ? 'aspect-[4/5]' : 'aspect-square'
              } ${loaded[i] ? '' : 'opacity-0'}`}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-end p-4 text-left">
              <div>
                <p className="font-display font-bold text-white">{g.caption}</p>
                <p className="text-xs text-gold">{g.sub}</p>
              </div>
            </div>
          </motion.button>
        ))}
      </div>

      <AnimatePresence>
        {open !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[80] bg-black/95 flex items-center justify-center p-4 sm:p-10"
            onClick={() => setOpen(null)}
          >
            <motion.img
              key={open}
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              src={galleryItems[open].src}
              alt={galleryItems[open].caption}
              className="max-h-[82vh] max-w-full rounded-2xl border border-gold/40 shadow-[0_0_80px_rgba(212,175,55,0.25)] object-contain"
              onClick={(e) => e.stopPropagation()}
            />
            <div className="absolute bottom-8 left-0 right-0 text-center px-6" onClick={(e) => e.stopPropagation()}>
              <p className="font-display text-xl font-bold text-white">{galleryItems[open].caption}</p>
              <p className="text-sm text-gold mt-1">{galleryItems[open].sub}</p>
              <p className="mt-2 text-[11px] text-white/40 tracking-[0.3em] uppercase">
                {open + 1} / {galleryItems.length} · {t('gallery.keys')}
              </p>
            </div>
            <button
              onClick={(e) => { e.stopPropagation(); setOpen((o) => (o === null ? o : (o + 1) % galleryItems.length)); sound.click(); }}
              className="absolute right-4 sm:right-8 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full glass flex items-center justify-center text-2xl text-gold hover:scale-110 transition-transform"
            >
              →
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); setOpen((o) => (o === null ? o : (o - 1 + galleryItems.length) % galleryItems.length)); sound.click(); }}
              className="absolute left-4 sm:left-8 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full glass flex items-center justify-center text-2xl text-gold hover:scale-110 transition-transform"
            >
              ←
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); setOpen(null); sound.click(); }}
              className="absolute top-5 right-5 w-11 h-11 rounded-full glass flex items-center justify-center text-white/70 hover:text-white"
            >
              ✕
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </Section>
  );
}

// ─── Video Trailer ───
export function Trailer() {
  const { t } = useI18n();
  const wrapRef = useRef<HTMLDivElement>(null);

  return (
    <Section>
      <SectionTitle kicker={t('trailer.kicker')} title={t('trailer.title')} sub={t('trailer.sub')} />
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        ref={wrapRef}
        className="video-frame relative rounded-3xl overflow-hidden bg-black max-w-4xl mx-auto"
      >
        <video
          src="https://youtu.be/Dkv4ZNn0AfA?si=kI6Nve6dTC3FYTA4"
          poster="images/trailer-poster.jpg"
          controls
          playsInline
          preload="metadata"
          className="w-full aspect-video object-cover"
        />
        <div className="absolute top-4 left-4 pointer-events-none">
          <span className="chip !cursor-default">{t('trailer.chip')}</span>
        </div>
        <button
          onClick={() => {
            sound.click();
            void wrapRef.current?.requestFullscreen().catch(() => undefined);
          }}
          className="absolute top-4 right-4 w-10 h-10 rounded-full glass flex items-center justify-center text-white/80 hover:text-gold transition-colors"
          title="Fullscreen"
        >
          ⛶
        </button>
      </motion.div>
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className="mt-6 flex flex-wrap justify-center gap-3"
        onClick={() => confettiRain(1200)}
      >
        <a className="chip" href="https://saadanfilm.com" target="_blank" rel="noreferrer">
          {t('trailer.watch')}
        </a>
      </motion.div>
    </Section>
  );
}
