import { useCallback, useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Section, SectionTitle } from './Ambience';
import { cardThemes, cardDecos, galleryItems, waLink, shareText, siteUrl } from '../data';
import { sound } from '../audio';
import { useI18n } from '../i18n';
import { useBadges } from './Ambience';
import { QrModal } from './Chrome';

// ─── helpers ───
function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const words = text.split(' ');
  const lines: string[] = [];
  let line = '';
  for (const w of words) {
    const test = line ? `${line} ${w}` : w;
    if (ctx.measureText(test).width > maxWidth && line) {
      lines.push(line);
      line = w;
    } else {
      line = test;
    }
  }
  if (line) lines.push(line);
  return lines;
}

function drawDeco(ctx: CanvasRenderingContext2D, emoji: string, x: number, y: number, size: number) {
  ctx.font = `${size}px serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(emoji, x, y);
}

function drawFireworks(ctx: CanvasRenderingContext2D, x: number, y: number, seed: number) {
  for (let i = 0; i < 14; i++) {
    const a = (i / 14) * Math.PI * 2 + seed;
    const len = 14 + ((i * 7 + seed * 3) % 12);
    ctx.strokeStyle = i % 2 === 0 ? '#f6e27a' : '#ffffff';
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + Math.cos(a) * len, y + Math.sin(a) * len);
    ctx.stroke();
  }
  ctx.beginPath();
  ctx.arc(x, y, 2.4, 0, Math.PI * 2);
  ctx.fillStyle = '#fff3c4';
  ctx.fill();
}

function drawConfetti(ctx: CanvasRenderingContext2D, w: number, h: number, seed: number) {
  const colors = ['#f6e27a', '#d4af37', '#fff3c4', '#60a5fa', '#ffffff'];
  for (let i = 0; i < 42; i++) {
    const x = ((i * 53 + seed * 29) % 97) / 100 * w + 20;
    const y = ((i * 97 + seed * 41) % 93) / 100 * h + 20;
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(seed + i);
    ctx.fillStyle = colors[i % colors.length];
    ctx.globalAlpha = 0.75;
    ctx.fillRect(-3, -2, 6, 4);
    ctx.restore();
  }
  ctx.globalAlpha = 1;
}

function drawStars(ctx: CanvasRenderingContext2D, w: number, h: number, seed: number) {
  for (let i = 0; i < 30; i++) {
    const x = ((i * 71 + seed * 13) % 98) / 100 * w;
    const y = ((i * 43 + seed * 37) % 96) / 100 * h;
    ctx.font = `${12 + (i % 4) * 6}px serif`;
    ctx.fillStyle = i % 3 === 0 ? '#fff3c4' : '#f6e27a';
    ctx.globalAlpha = 0.5 + (i % 5) * 0.1;
    ctx.fillText('✦', x, y);
  }
  ctx.globalAlpha = 1;
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

// ─── Wish Card Generator (8 steps) ───
function WishGenerator() {
  const { t } = useI18n();
  const { earn } = useBadges();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [themeIdx, setThemeIdx] = useState(0);
  const [photo, setPhoto] = useState(galleryItems[0].src);
  const [customPhoto, setCustomPhoto] = useState<string | null>(null);
  const [name, setName] = useState('Guest');
  const [message, setMessage] = useState(
    'May this new year of your life be full of gold, glory, and unforgettable scenes. Happy Birthday, Jackson!'
  );
  const [decos, setDecos] = useState<number[]>([1, 3]);
  const [gen, setGen] = useState(0);

  const theme = cardThemes[themeIdx];

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const W = canvas.width;
    const H = canvas.height;
    const src = customPhoto || photo;

    // background
    const grad = ctx.createLinearGradient(0, 0, W, H);
    grad.addColorStop(0, theme.colors[0]);
    grad.addColorStop(0.55, theme.colors[1]);
    grad.addColorStop(1, theme.colors[2]);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);

    // glow orb
    const orb = ctx.createRadialGradient(W * 0.8, H * 0.12, 0, W * 0.8, H * 0.12, W * 0.55);
    orb.addColorStop(0, `${theme.frame}44`);
    orb.addColorStop(1, `${theme.frame}00`);
    ctx.fillStyle = orb;
    ctx.fillRect(0, 0, W, H);

    // frame
    ctx.strokeStyle = theme.frame;
    ctx.lineWidth = 5;
    ctx.strokeRect(36, 36, W - 72, H - 72);
    ctx.strokeStyle = `${theme.frame}55`;
    ctx.lineWidth = 1.5;
    ctx.strokeRect(52, 52, W - 104, H - 104);

    // decorations
    const decoMap = ['🍰', '🎈', '🎆', '🎊', '⭐', '💛', '🎥', '👑'];
    decos.forEach((d, di) => {
      const e = decoMap[d];
      const slot = (di + gen) % 4;
      if (e === '🎆') {
        drawFireworks(ctx, W * (0.22 + (slot % 2) * 0.56), H * (0.16 + Math.floor(slot / 2) * 0.1), gen + di);
      } else if (e === '🎊') {
        drawConfetti(ctx, W, H, gen + di);
      } else if (e === '⭐') {
        drawStars(ctx, W, H, gen + di);
      } else {
        drawDeco(ctx, e, W * (0.14 + (slot % 4) * 0.24), H * (0.14 + Math.floor(slot / 4) * 0.12), 54);
      }
    });

    // photo
    loadImage(src)
      .then((img) => {
        const r = 138;
        const cx = W / 2;
        const cy = 300;
        ctx.save();
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.closePath();
        ctx.clip();
        const scale = Math.max((r * 2) / img.width, (r * 2) / img.height);
        const iw = img.width * scale;
        const ih = img.height * scale;
        ctx.drawImage(img, cx - iw / 2, cy - ih / 2, iw, ih);
        ctx.restore();
        ctx.strokeStyle = theme.frame;
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.stroke();

        // name
        ctx.fillStyle = theme.accent;
        ctx.font = '700 44px Cinzel, serif';
        ctx.textAlign = 'center';
        ctx.fillText(`— ${name || 'Guest'} —`, W / 2, 500);

        // title
        ctx.fillStyle = theme.text;
        ctx.font = '900 52px Cinzel, serif';
        ctx.fillText(t('wish.cardTitle'), W / 2, 568);
        ctx.fillStyle = theme.accent;
        ctx.font = '900 64px Cinzel, serif';
        ctx.fillText(t('wish.cardName'), W / 2, 640);

        // divider
        const dg = ctx.createLinearGradient(W / 2 - 180, 0, W / 2 + 180, 0);
        dg.addColorStop(0, `${theme.frame}00`);
        dg.addColorStop(0.5, theme.frame);
        dg.addColorStop(1, `${theme.frame}00`);
        ctx.fillStyle = dg;
        ctx.fillRect(W / 2 - 180, 668, 360, 3);

        // message
        ctx.fillStyle = theme.sub;
        ctx.font = 'italic 500 30px Outfit, sans-serif';
        const lines = wrapText(ctx, message || '🎉', W - 220);
        lines.slice(0, 4).forEach((l, i) => ctx.fillText(l, W / 2, 722 + i * 44));

        // footer
        ctx.fillStyle = theme.frame;
        ctx.font = '600 20px Outfit, sans-serif';
        ctx.fillText(t('wish.footer'), W / 2, H - 118);
        ctx.fillStyle = `${theme.sub}88`;
        ctx.font = '400 15px Outfit, sans-serif';
        ctx.fillText(t('wish.madeWith'), W / 2, H - 84);
      })
      .catch(() => undefined);
  }, [theme, photo, customPhoto, name, message, decos, gen, t]);

  useEffect(() => {
    draw();
    if (document.fonts) document.fonts.ready.then(() => draw()).catch(() => undefined);
  }, [draw]);

  const onUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setCustomPhoto(String(reader.result));
      sound.pop();
    };
    reader.readAsDataURL(file);
  };

  const download = () => {
    sound.chime();
    earn('card');
    const canvas = canvasRef.current;
    if (!canvas) return;
    const hi = document.createElement('canvas');
    hi.width = canvas.width * 2;
    hi.height = canvas.height * 2;
    const hctx = hi.getContext('2d');
    if (!hctx) return;
    hctx.drawImage(canvas, 0, 0, hi.width, hi.height);
    const a = document.createElement('a');
    a.href = hi.toDataURL('image/png');
    a.download = 'jackson-birthday-card.png';
    a.click();
  };

  const share = async () => {
    sound.pop();
    const canvas = canvasRef.current;
    if (!canvas) return;
    try {
      const blob = await new Promise<Blob | null>((res) => canvas.toBlob(res, 'image/png'));
      if (blob && 'share' in navigator) {
        const file = new File([blob], 'jackson-birthday-card.png', { type: 'image/png' });
        await navigator.share({
          files: [file],
          title: "Jackson's Birthday Card",
          text: `Happy Birthday Jackson! 🎂 A card from ${name}: ${message}`,
        });
        return;
      }
    } catch {
      /* fall through */
    }
    window.open(
      waLink(`🎂 Birthday card for Jackson! ${message} — from ${name}. Make yours: ${siteUrl()}`),
      '_blank'
    );
  };

  const decoList = t('wish.decos') as unknown as string[];

  return (
    <div className="grid lg:grid-cols-2 gap-8 items-start">
      <div className="glass rounded-3xl p-6 sm:p-8 space-y-5">
        <h3 className="font-display text-xl font-bold text-gold">🎨 {t('wish.shareLabel')}</h3>

        {/* Step 1: theme */}
        <div>
          <label className="text-xs tracking-[0.25em] uppercase text-white/50">{t('wish.themeLabel')}</label>
          <div className="mt-2 grid grid-cols-4 gap-2">
            {(t('wish.themes') as unknown as string[]).map((th, i) => (
              <button
                key={th}
                onClick={() => { setThemeIdx(i); sound.click(); }}
                className={`h-12 rounded-xl border-2 text-[10px] font-semibold transition-all ${
                  themeIdx === i
                    ? 'border-gold scale-105 shadow-[0_0_16px_rgba(212,175,55,0.4)]'
                    : 'border-white/10 text-white/50'
                }`}
                style={{ background: `linear-gradient(135deg, ${cardThemes[i].colors[0]}, ${cardThemes[i].colors[2]})`, color: i >= 5 ? '#1a1206' : undefined }}
              >
                {th}
              </button>
            ))}
          </div>
        </div>

        {/* Step 2: photo */}
        <div>
          <label className="text-xs tracking-[0.25em] uppercase text-white/50">{t('wish.photoLabel')}</label>
          <div className="mt-2 grid grid-cols-6 gap-2">
            {galleryItems.map((g) => (
              <button
                key={g.src}
                onClick={() => { setPhoto(g.src); setCustomPhoto(null); sound.click(); }}
                className={`aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                  photo === g.src && !customPhoto ? 'border-gold scale-105' : 'border-white/10 hover:border-gold/40'
                }`}
              >
                <img src={g.src} alt={g.caption} loading="lazy" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>

        {/* Step 3: upload */}
        <div>
          <label className="text-xs tracking-[0.25em] uppercase text-white/50">{t('wish.uploadLabel')}</label>
          <label className="mt-2 flex items-center justify-center gap-2 rounded-xl border border-dashed border-gold/40 bg-gold/5 px-4 py-3 text-sm text-gold cursor-pointer hover:bg-gold/10 transition-all">
            🖼 {t('wish.uploadHint')}
            <input type="file" accept="image/*" className="hidden" onChange={onUpload} />
          </label>
          {customPhoto && (
            <p className="mt-2 text-[11px] text-emerald-300">✅ {t('wish.photo')}</p>
          )}
        </div>

        {/* Step 4: name + message */}
        <div>
          <label className="text-xs tracking-[0.25em] uppercase text-white/50">{t('wish.namePh')}</label>
          <input
            className="input-lux mt-2"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={t('wish.namePh')}
            maxLength={24}
          />
        </div>
        <div>
          <label className="text-xs tracking-[0.25em] uppercase text-white/50">{t('wish.msgLabel')}</label>
          <textarea
            className="input-lux mt-2 min-h-[90px] resize-none"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            maxLength={160}
            placeholder={t('wish.msgPh')}
          />
          <p className="mt-1 text-right text-[11px] text-white/30">{message.length}/160</p>
        </div>

        {/* Step 5: decorations */}
        <div>
          <label className="text-xs tracking-[0.25em] uppercase text-white/50">{t('wish.decoLabel')}</label>
          <div className="mt-2 flex flex-wrap gap-2">
            {decoList.map((d, i) => (
              <button
                key={d}
                onClick={() => {
                  setDecos((prev) => (prev.includes(i) ? prev.filter((x) => x !== i) : [...prev, i]));
                  sound.click();
                }}
                className={`chip ${decos.includes(i) ? 'active' : ''}`}
              >
                {cardDecos[i]} {d}
              </button>
            ))}
          </div>
        </div>

        {/* Steps 6-8 */}
        <button onClick={() => { setGen((g) => g + 1); sound.pop(); }} className="btn-gold w-full">
          {t('wish.generate')}
        </button>
        <div className="flex flex-wrap gap-3">
          <button onClick={download} className="btn-gold flex-1">⬇ {t('wish.download')}</button>
          <button onClick={share} className="btn-ghost flex-1">📤 {t('wish.share')}</button>
        </div>
        <p className="text-center text-[10px] text-white/30 tracking-[0.2em] uppercase">
          {t('wish.genLabel')} · {t('wish.downloadLabel')} · {t('wish.shareLabel')}
        </p>
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        className="flex justify-center lg:sticky lg:top-24"
      >
        <div className="relative">
          <div className="absolute -inset-4 rounded-3xl bg-gold/15 blur-2xl" />
          <canvas
            ref={canvasRef}
            width={540}
            height={900}
            className="relative w-full max-w-[380px] rounded-3xl border border-gold/40 shadow-2xl"
          />
        </div>
      </motion.div>
    </div>
  );
}

// ─── Message Studio ───
function MessageStudio() {
  const { t } = useI18n();
  const [cat, setCat] = useState('friend');
  const [idx, setIdx] = useState(0);
  const [copied, setCopied] = useState(false);
  const categories = t('wish.msgGen.categories') as unknown as string[];
  const catIds = ['friend', 'family', 'business', 'funny', 'romantic', 'professional', 'inspirational'];
  const templates = t(`wish.templates.${cat}`) as unknown as string[];
  const current = templates[idx % templates.length];

  const generate = () => {
    sound.pop();
    setIdx((i) => i + 1);
    setCopied(false);
  };

  const copy = async () => {
    sound.click();
    try {
      await navigator.clipboard.writeText(current);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      /* ignore */
    }
  };

  return (
    <div>
      <div className="flex flex-wrap gap-2 justify-center">
        {categories.map((c, i) => (
          <button
            key={c}
            onClick={() => { setCat(catIds[i]); setIdx(0); sound.click(); }}
            className={`chip ${cat === catIds[i] ? 'active' : ''}`}
          >
            {['🤝', '🏠', '💼', '😂', '💛', '📈', '🚀'][i]} {c}
          </button>
        ))}
      </div>

      <motion.div
        key={`${cat}-${idx}`}
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className="mt-8 glass rounded-3xl p-8 sm:p-10 max-w-2xl mx-auto relative overflow-hidden text-center"
      >
        <div className="absolute -top-20 -left-20 w-56 h-56 rounded-full bg-gold/10 blur-3xl" />
        <p className="mt-2 text-lg sm:text-xl text-white/85 leading-relaxed font-light italic">“{current}”</p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <button onClick={generate} className="btn-gold">{t('wish.msgGen.generate')}</button>
          <button onClick={copy} className="btn-ghost">
            {copied ? '✅' : '📋'} {copied ? t('wish.shareOptions.copied') : t('wish.msgGen.copy')}
          </button>
          <button onClick={() => window.open(waLink(current), '_blank')} className="btn-ghost">
            💬 {t('wish.msgGen.send')}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

// ─── Share Hub with QR ───
function ShareHub() {
  const { t } = useI18n();
  const [copied, setCopied] = useState(false);
  const [qr, setQr] = useState(false);

  const copy = async () => {
    sound.click();
    try {
      await navigator.clipboard.writeText(shareText);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      /* ignore */
    }
  };

  const share = async () => {
    sound.pop();
    try {
      if ('share' in navigator) {
        await navigator.share({ title: "Jackson's Birthday", text: shareText });
        return;
      }
    } catch {
      /* ignore */
    }
    window.open(waLink(shareText), '_blank');
  };

  const links = [
    { label: 'WhatsApp', url: waLink(shareText), icon: '💬' },
    { label: 'Facebook', url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(siteUrl())}`, icon: '📘' },
    { label: 'Instagram', url: `https://www.instagram.com/?url=${encodeURIComponent(siteUrl())}`, icon: '📸' },
    { label: 'Telegram', url: `https://t.me/share/url?url=${encodeURIComponent(siteUrl())}&text=${encodeURIComponent("I've just celebrated Jackson's birthday online! 🎉")}`, icon: '✈️' },
    { label: 'X', url: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`, icon: '🐦' },
  ];

  return (
    <div className="max-w-2xl mx-auto text-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        className="glass rounded-3xl p-8 sm:p-10 relative overflow-hidden"
      >
        <div className="absolute -bottom-24 -right-24 w-72 h-72 rounded-full bg-gold/10 blur-3xl" />
        <span className="text-5xl">📣</span>
        <h3 className="mt-4 font-display text-2xl font-bold text-gold-grad">{t('wish.shareHub.title')}</h3>
        <p className="mt-3 text-white/55 text-sm leading-relaxed max-w-md mx-auto">{t('wish.shareHub.sub')}</p>
        <div className="mt-7 flex flex-wrap justify-center gap-3">
          <button onClick={share} className="btn-gold">{t('wish.shareHub.shareBtn')}</button>
          <button onClick={copy} className="btn-ghost">
            {copied ? '✅' : '📋'} {copied ? t('wish.shareOptions.copied') : t('wish.shareHub.copyBtn')}
          </button>
          <button onClick={() => { setQr(true); sound.click(); }} className="btn-ghost">
            {t('wish.shareHub.qrBtn')}
          </button>
        </div>
        <div className="mt-8 grid grid-cols-2 sm:grid-cols-5 gap-3">
          {links.map((l) => (
            <a
              key={l.label}
              href={l.url}
              target="_blank"
              rel="noreferrer"
              onClick={() => sound.click()}
              className="glass rounded-2xl py-4 flex flex-col items-center gap-2 hover:border-gold/60 transition-all hover:-translate-y-1"
            >
              <span className="text-2xl">{l.icon}</span>
              <span className="text-xs text-white/60">{l.label}</span>
            </a>
          ))}
        </div>
      </motion.div>
      <AnimatePresence>{qr && <QrModal url={siteUrl()} onClose={() => setQr(false)} />}</AnimatePresence>
    </div>
  );
}

// ─── Main Wishes page ───
export default function Wishes() {
  const { t } = useI18n();
  return (
    <Section id="cards" className="bg-gradient-to-b from-transparent via-[#070b14] to-transparent">
      <SectionTitle kicker={t('wish.kicker')} title={t('wish.title')} sub={t('wish.sub')} />
      <div className="space-y-20">
        <WishGenerator />
        <div>
          <h3 className="text-center font-display text-2xl font-bold text-gold mb-2">{t('wish.msgGen.title')}</h3>
          <p className="text-center text-white/50 text-sm mb-8">{t('wish.msgGen.sub')}</p>
          <MessageStudio />
        </div>
        <ShareHub />
      </div>
    </Section>
  );
}
