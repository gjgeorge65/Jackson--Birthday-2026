import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Section, SectionTitle } from './Ambience';
import { loadWishes, saveWish, waLink, type WishEntry } from '../data';
import { sound } from '../audio';
import { useI18n } from '../i18n';
import { useBadges } from './Ambience';

export default function GuestBook() {
  const { t } = useI18n();
  const { earn } = useBadges();
  const [wishes, setWishes] = useState<WishEntry[]>(() => loadWishes());
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');
  const [toast, setToast] = useState<string | null>(null);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !message.trim()) return;
    sound.chime();
    const entry: WishEntry = {
      name: name.trim(),
      message: message.trim(),
      date: new Date().toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' }),
    };
    setWishes(saveWish(entry));
    earn('guest');
    setName('');
    setMessage('');
    setToast(t('guestbook.toast'));
    window.setTimeout(() => setToast(null), 2600);
  };

  const exportTxt = () => {
    sound.click();
    const text = [
      "🎂 JACKSON'S DIGITAL GUEST BOOK — LEVEL 23",
      '==========================================',
      '',
      ...wishes.map((w) => `${w.name} (${w.date})\n${w.message}\n`),
      'Made with 💛 · SAADAN GROUP & JETRAS Presents',
    ].join('\n');
    const blob = new Blob([text], { type: 'text/plain' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'jackson-guestbook.txt';
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const clearAll = () => {
    sound.error();
    try {
      localStorage.removeItem('jb-guestbook-v1');
      localStorage.removeItem('jb-guestbook-seeded-v1');
    } catch {
      /* ignore */
    }
    setWishes([]);
    setToast(t('guestbook.cleared'));
    window.setTimeout(() => setToast(null), 2600);
  };

  return (
    <Section id="guestbook">
      <SectionTitle kicker={t('guestbook.kicker')} title={t('guestbook.title')} sub={t('guestbook.sub')} />

      <div className="grid lg:grid-cols-2 gap-8">
        <form onSubmit={submit} className="glass rounded-3xl p-6 sm:p-8 space-y-5 h-fit lg:sticky lg:top-24">
          <h3 className="font-display text-xl font-bold text-gold">✍️ {t('guestbook.message')}</h3>
          <div>
            <label className="text-xs tracking-[0.25em] uppercase text-white/50">{t('guestbook.name')}</label>
            <input
              className="input-lux mt-2"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t('guestbook.name')}
              maxLength={28}
            />
          </div>
          <div>
            <label className="text-xs tracking-[0.25em] uppercase text-white/50">{t('guestbook.message')}</label>
            <textarea
              className="input-lux mt-2 min-h-[120px] resize-none"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Happy birthday, Jackson! 🎂…"
              maxLength={280}
            />
          </div>
          <button type="submit" className="btn-gold w-full">{t('guestbook.sign')}</button>
          <div className="flex gap-3">
            <button type="button" onClick={exportTxt} className="btn-ghost flex-1 text-sm">{t('guestbook.export')}</button>
            <button type="button" onClick={clearAll} className="btn-ghost flex-1 text-sm !text-red-300/80">{t('guestbook.clear')}</button>
          </div>
          <AnimatePresence>
            {toast && (
              <motion.p
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="text-center text-sm text-gold"
              >
                {toast}
              </motion.p>
            )}
          </AnimatePresence>
        </form>

        <div>
          <div className="flex items-center justify-between mb-4 px-1">
            <p className="text-sm text-white/50">
              <span className="font-display text-gold text-lg font-bold">{wishes.length}</span> {t('guestbook.count')}
            </p>
          </div>
          <div className="space-y-4 max-h-[560px] overflow-y-auto pr-2">
            <AnimatePresence>
              {wishes.length === 0 && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass rounded-3xl p-10 text-center text-white/40">
                  <span className="text-4xl">🕊️</span>
                  <p className="mt-3">{t('guestbook.empty')}</p>
                </motion.div>
              )}
              {wishes.map((w, i) => (
                <motion.div
                  key={`${w.name}-${w.date}-${i}`}
                  initial={{ opacity: 0, x: 24 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: Math.min(i * 0.05, 0.4) }}
                  className="glass rounded-2xl p-5 relative overflow-hidden"
                >
                  <div className="absolute top-0 left-0 w-1 h-full bg-gold-grad" />
                  <div className="flex items-center justify-between">
                    <p className="font-display font-bold text-gold">{w.name}</p>
                    <p className="text-[11px] text-white/35">{w.date}</p>
                  </div>
                  <p className="mt-2 text-sm text-white/70 leading-relaxed">{w.message}</p>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
          <p className="mt-6 text-center">
            <a
              href={waLink("I just signed Jackson's digital guest book! 🎂 Sign yours too:")}
              target="_blank"
              rel="noreferrer"
              onClick={() => sound.click()}
              className="text-sm text-gold/80 hover:text-gold underline underline-offset-4"
            >
              {t('guestbook.invite')}
            </a>
          </p>
        </div>
      </div>
    </Section>
  );
}
