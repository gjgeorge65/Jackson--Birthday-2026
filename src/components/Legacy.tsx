import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Section, SectionTitle } from './Ambience';
import { badgeIds, waLink, siteUrl } from '../data';
import { sound } from '../audio';
import { useI18n } from '../i18n';
import { useBadges } from './Ambience';

const BOOTH_FRAMES = [
  { id: 0, emoji: '🎉' },
  { id: 1, emoji: '🎬' },
  { id: 2, emoji: '👑' },
  { id: 3, emoji: '🎈' },
];

// ─── Future Jackson 2035 (typewriter) ───
function FutureLetter() {
  const { t } = useI18n();
  const paragraphs = t('legacy.future.letter') as unknown as string[];
  const full = paragraphs.join('\n\n');
  const [shown, setShown] = useState(0);
  const done = shown >= full.length;

  useEffect(() => {
    setShown(0);
    const timer = window.setInterval(() => {
      setShown((s) => {
        if (s >= full.length) {
          window.clearInterval(timer);
          return s;
        }
        return s + 2;
      });
    }, 18);
    return () => window.clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [t('legacy.future.letter')]);

  const rendered = full.slice(0, shown);

  return (
    <div className="glass rounded-3xl p-7 sm:p-10 max-w-2xl mx-auto relative overflow-hidden">
      <div className="absolute -top-20 -right-20 w-56 h-56 rounded-full bg-gold/10 blur-3xl" />
      <div className="flex items-center gap-3 mb-6">
        <span className="text-4xl">✉️</span>
        <div>
          <h3 className="font-display text-xl sm:text-2xl font-bold text-gold-grad">{t('legacy.future.title')}</h3>
          <p className="text-xs text-white/45">{t('legacy.future.sub')}</p>
        </div>
      </div>
      <div className="space-y-4 text-white/75 leading-relaxed whitespace-pre-wrap text-[15px]">
        {rendered}
        {!done && <span className="inline-block w-2 h-4 bg-gold ml-0.5 animate-pulse" />}
      </div>
      {done && (
        <div className="mt-6 text-right">
          <button
            onClick={() => window.open(waLink(`${t('legacy.future.title')}: ${paragraphs[2]}`), '_blank')}
            className="btn-ghost text-sm"
          >
            📤 {t('legacy.future.share')}
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Legacy Book ───
function LegacyBook() {
  const { t } = useI18n();
  const quotes = t('legacy.book.quotes') as unknown as string[];
  const [idx, setIdx] = useState(0);

  return (
    <div className="glass rounded-3xl p-7 sm:p-10 max-w-2xl mx-auto relative overflow-hidden text-center">
      <div className="absolute -bottom-24 -left-24 w-64 h-64 rounded-full bg-gold/10 blur-3xl" />
      <span className="text-4xl">📖</span>
      <h3 className="mt-3 font-display text-xl sm:text-2xl font-bold text-gold-grad">{t('legacy.book.title')}</h3>
      <p className="text-xs text-white/45 mt-1">{t('legacy.book.sub')}</p>

      <AnimatePresence mode="wait">
        <motion.blockquote
          key={idx}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          className="mt-8 font-display text-xl sm:text-2xl text-white/85 italic leading-relaxed min-h-[90px]"
        >
          {quotes[idx]}
        </motion.blockquote>
      </AnimatePresence>

      <div className="mt-6 flex justify-center gap-2">
        {quotes.map((_, i) => (
          <button
            key={i}
            onClick={() => { setIdx(i); sound.click(); }}
            className={`w-2.5 h-2.5 rounded-full transition-all ${i === idx ? 'bg-gold w-6' : 'bg-white/20'}`}
            aria-label={`Quote ${i + 1}`}
          />
        ))}
      </div>
      <div className="mt-6 flex justify-center gap-3">
        <button
          onClick={() => window.open(waLink(`"${quotes[idx]}" — Jackson Said Issa`), '_blank')}
          className="btn-ghost text-sm"
        >
          📤 {t('legacy.book.share')}
        </button>
      </div>
    </div>
  );
}

// ─── Birthday Passport ───
function drawPassport(ctx: CanvasRenderingContext2D, name: string, badges: string[], date: string) {
  const W = ctx.canvas.width;
  const H = ctx.canvas.height;
  const grad = ctx.createLinearGradient(0, 0, W, H);
  grad.addColorStop(0, '#0a1220');
  grad.addColorStop(1, '#060b14');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, H);

  const orb = ctx.createRadialGradient(W / 2, H * 0.25, 0, W / 2, H * 0.25, W * 0.7);
  orb.addColorStop(0, 'rgba(212,175,55,0.25)');
  orb.addColorStop(1, 'rgba(212,175,55,0)');
  ctx.fillStyle = orb;
  ctx.fillRect(0, 0, W, H);

  ctx.strokeStyle = '#d4af37';
  ctx.lineWidth = 4;
  ctx.strokeRect(32, 32, W - 64, H - 64);

  ctx.textAlign = 'center';
  ctx.fillStyle = '#f6e27a';
  ctx.font = '900 44px Cinzel, serif';
  ctx.fillText('JACKSONVERSE', W / 2, 130);
  ctx.font = '600 20px Cinzel, serif';
  ctx.fillText('INTERACTIVE BIRTHDAY PASSPORT', W / 2, 175);
  ctx.font = '400 16px Outfit, sans-serif';
  ctx.fillStyle = 'rgba(245,242,233,0.6)';
  ctx.fillText('VALID UNTIL 2035 · LEVEL 23', W / 2, 210);

  ctx.fillStyle = 'rgba(245,242,233,0.5)';
  ctx.font = '500 15px Outfit, sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText('PASSPORT No. JSI-2003-082', 70, 290);
  ctx.fillText(`ISSUED ${date}`, 70, 325);
  ctx.fillStyle = '#ffffff';
  ctx.font = '700 26px Caveat, cursive';
  ctx.fillText(name || 'Guest', 70, 380);

  ctx.textAlign = 'center';
  ctx.fillStyle = '#f6e27a';
  ctx.font = '700 18px Cinzel, serif';
  ctx.fillText(`${badges.length} STAMPS EARNED`, W / 2, 450);
  const emojis = ['🎨', '🧠', '⭐', '🧩', '🖼️', '🎡', '⌨️', '🗺️', '🎬', '🕵️', '📖', '💭'];
  const cell = Math.min(54, (W - 120) / Math.max(6, badges.length));
  badges.forEach((b, i) => {
    const idx = badgeIds.indexOf(b as (typeof badgeIds)[number]);
    const col = i % 6;
    const row = Math.floor(i / 6);
    ctx.font = `${cell * 0.5}px serif`;
    ctx.fillText(emojis[idx] || '🏅', 80 + col * ((W - 120) / 6) + cell / 2, 500 + row * (cell * 0.75));
  });
}

function Passport() {
  const { t } = useI18n();
  const { badges } = useBadges();
  const [name, setName] = useState('');
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d');
      if (ctx) drawPassport(ctx, name, badges, new Date().toLocaleDateString());
    }
  }, [name, badges]);

  const download = () => {
    const c = canvasRef.current;
    if (!c) return;
    sound.chime();
    const a = document.createElement('a');
    a.href = c.toDataURL('image/png');
    a.download = 'jacksonverse-passport.png';
    a.click();
  };

  return (
    <div className="glass rounded-3xl p-7 sm:p-10 max-w-2xl mx-auto relative overflow-hidden">
      <div className="flex items-center gap-3 mb-6">
        <span className="text-4xl">🛂</span>
        <div>
          <h3 className="font-display text-xl sm:text-2xl font-bold text-gold-grad">{t('legacy.passport.title')}</h3>
          <p className="text-xs text-white/45">{t('legacy.passport.sub')}</p>
        </div>
      </div>
      <div className="grid sm:grid-cols-2 gap-6 items-center">
        <canvas
          ref={canvasRef}
          width={560}
          height={420}
          className="w-full rounded-2xl border border-gold/40 shadow-[0_0_40px_rgba(212,175,55,0.2)]"
        />
        <div className="space-y-4">
          <input
            className="input-lux text-center"
            placeholder={t('legacy.passport.name')}
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={20}
          />
          <p className="text-center text-sm text-white/55">
            🏅 {badges.length}/12 {t('legacy.passport.stamp')}
          </p>
          {badges.length === 0 ? (
            <p className="text-center text-xs text-white/40">{t('legacy.passport.empty')}</p>
          ) : (
            <div className="flex flex-wrap justify-center gap-2 text-2xl">
              {badges.map((b) => (
                <span key={b} className="glass rounded-xl w-10 h-10 flex items-center justify-center" title={t(`badges.${b}.name`)}>
                  {['🎨', '🧠', '⭐', '🧩', '🖼️', '🎡', '⌨️', '🗺️', '🎬', '🕵️', '📖', '💭'][badgeIds.indexOf(b as (typeof badgeIds)[number])]}
                </span>
              ))}
            </div>
          )}
          <div className="flex flex-wrap justify-center gap-3">
            <button onClick={download} className="btn-gold text-sm">⬇ {t('legacy.passport.download')}</button>
            <button
              onClick={() => window.open(waLink(`🛂 My Jacksonverse Passport has ${badges.length} stamps! Earn yours: ${siteUrl()}`), '_blank')}
              className="btn-ghost text-sm"
            >
              📤 {t('legacy.passport.share')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Photo Booth ───
function PhotoBooth() {
  const { t } = useI18n();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [frame, setFrame] = useState(0);
  const [cameraOn, setCameraOn] = useState(false);
  const [camError, setCamError] = useState(false);
  const [shot, setShot] = useState<string | null>(null);
  const frames = t('legacy.booth.frames') as unknown as string[];

  const startCamera = async () => {
    sound.click();
    setCamError(false);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' }, audio: false });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play().catch(() => undefined);
      }
      setCameraOn(true);
      setShot(null);
    } catch {
      setCamError(true);
      setCameraOn(false);
    }
  };

  useEffect(() => {
    return () => {
      streamRef.current?.getTracks().forEach((tr) => tr.stop());
    };
  }, []);

  const drawShot = (img: HTMLImageElement | HTMLVideoElement, w: number, h: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    canvas.width = w;
    canvas.height = h;
    ctx.drawImage(img, 0, 0, w, h);
    // frame
    const colors = ['#d4af37', '#e8b84b', '#f6e27a', '#60a5fa'];
    ctx.strokeStyle = colors[frame];
    ctx.lineWidth = 14;
    ctx.strokeRect(0, 0, w, h);
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 3;
    ctx.strokeRect(16, 16, w - 32, h - 32);
    ctx.font = `${Math.round(w * 0.14)}px serif`;
    ctx.textAlign = 'center';
    const deco = ['🎉', '🎬', '👑', '🎈'][frame];
    ctx.fillText(deco, w / 2, h - Math.round(h * 0.12));
    ctx.font = '700 22px Cinzel, serif';
    ctx.fillStyle = '#ffffff';
    ctx.fillText('JACKSONVERSE · LEVEL 23', w / 2, 42);
  };

  const capture = () => {
    const video = videoRef.current;
    if (!video || !video.videoWidth) return;
    sound.pop();
    drawShot(video, video.videoWidth, video.videoHeight);
    setShot(canvasRef.current?.toDataURL('image/png') || null);
    streamRef.current?.getTracks().forEach((tr) => tr.stop());
    setCameraOn(false);
  };

  const onUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        drawShot(img, 640, 480);
        setShot(canvasRef.current?.toDataURL('image/png') || null);
        sound.pop();
      };
      img.src = String(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const download = () => {
    const s = shot;
    if (!s) return;
    sound.chime();
    const a = document.createElement('a');
    a.href = s;
    a.download = 'jackson-photobooth.png';
    a.click();
  };

  const share = () => {
    sound.click();
    if (shot) {
      window.open(waLink(`📸 I took a photo in Jackson's Photo Booth! Try it: ${siteUrl()}`), '_blank');
    }
  };

  return (
    <div className="glass rounded-3xl p-7 sm:p-10 max-w-2xl mx-auto relative overflow-hidden">
      <div className="flex items-center gap-3 mb-6">
        <span className="text-4xl">📸</span>
        <div>
          <h3 className="font-display text-xl sm:text-2xl font-bold text-gold-grad">{t('legacy.booth.title')}</h3>
          <p className="text-xs text-white/45">{t('legacy.booth.sub')}</p>
        </div>
      </div>

      <div className="flex flex-wrap justify-center gap-2 mb-5">
        {frames.map((f, i) => (
          <button
            key={f}
            onClick={() => { setFrame(i); sound.click(); }}
            className={`chip ${frame === i ? 'active' : ''}`}
          >
            {BOOTH_FRAMES[i].emoji} {f}
          </button>
        ))}
      </div>

      <div className="flex flex-col items-center gap-5">
        <div className="relative w-full max-w-md">
          {cameraOn && (
            <video
              ref={videoRef}
              playsInline
              muted
              className="w-full aspect-[4/3] object-cover rounded-2xl border-2 border-gold/50 bg-black"
            />
          )}
          {!cameraOn && !shot && (
            <div className="w-full aspect-[4/3] rounded-2xl border-2 border-dashed border-gold/40 bg-black/40 flex items-center justify-center text-white/30 text-sm text-center px-4">
              {camError ? t('legacy.booth.noCam') : '📷'}
            </div>
          )}
          {shot && <img src={shot} alt="Photo booth" className="w-full rounded-2xl border-2 border-gold/50" />}
          <canvas ref={canvasRef} className="hidden" />
        </div>

        <div className="flex flex-wrap justify-center gap-3">
          {!cameraOn && !shot && (
            <button onClick={startCamera} className="btn-gold text-sm">{t('legacy.booth.camera')}</button>
          )}
          {cameraOn && (
            <button onClick={capture} className="btn-gold text-sm">{t('legacy.booth.capture')}</button>
          )}
          {shot && (
            <>
              <button onClick={() => { setShot(null); sound.click(); }} className="btn-ghost text-sm">
                {t('legacy.booth.retake')}
              </button>
              <button onClick={download} className="btn-gold text-sm">⬇ {t('legacy.booth.download')}</button>
              <button onClick={share} className="btn-ghost text-sm">📤 {t('legacy.booth.share')}</button>
            </>
          )}
          <label className="btn-ghost text-sm cursor-pointer">
            {t('legacy.booth.upload')}
            <input type="file" accept="image/*" className="hidden" onChange={onUpload} />
          </label>
        </div>
      </div>
    </div>
  );
}

// ─── Legacy Vault page ───
export default function Legacy() {
  const { t } = useI18n();
  const [tab, setTab] = useState<'future' | 'book' | 'passport' | 'booth'>('future');
  const tabs = [
    { id: 'future' as const, icon: '✉️', label: t('legacy.tabs.future') },
    { id: 'book' as const, icon: '📖', label: t('legacy.tabs.book') },
    { id: 'passport' as const, icon: '🛂', label: t('legacy.tabs.passport') },
    { id: 'booth' as const, icon: '📸', label: t('legacy.tabs.booth') },
  ];

  return (
    <Section id="legacy" className="bg-gradient-to-b from-transparent via-[#070b14] to-transparent">
      <SectionTitle kicker={t('legacy.kicker')} title={t('legacy.title')} sub={t('legacy.sub')} />
      <div className="flex flex-wrap justify-center gap-2 mb-10">
        {tabs.map((tb) => (
          <button
            key={tb.id}
            onClick={() => { sound.click(); setTab(tb.id); }}
            className={`chip !text-sm ${tab === tb.id ? 'active' : ''}`}
          >
            {tb.icon} {tb.label}
          </button>
        ))}
      </div>
      <AnimatePresence mode="wait">
        <motion.div
          key={tab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -14 }}
          transition={{ duration: 0.35 }}
        >
          {tab === 'future' && <FutureLetter />}
          {tab === 'book' && <LegacyBook />}
          {tab === 'passport' && <Passport />}
          {tab === 'booth' && <PhotoBooth />}
        </motion.div>
      </AnimatePresence>
    </Section>
  );
}
