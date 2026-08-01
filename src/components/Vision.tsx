import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Section, SectionTitle } from './Ambience';
import { destinations, waLink, siteUrl } from '../data';
import { sound, fireworks } from '../audio';
import { useI18n } from '../i18n';
import { useBadges } from './Ambience';

// ─── Interactive globe ───
const ORIGIN = { lat: -6.79, lon: 39.28 };

interface Pt3 {
  x: number;
  y: number;
  z: number;
}

function to3D(lat: number, lon: number, rot: number, R: number): Pt3 {
  const phi = (lat * Math.PI) / 180;
  const theta = (lon * Math.PI) / 180 + rot;
  return {
    x: R * Math.cos(phi) * Math.sin(theta),
    y: -R * Math.sin(phi),
    z: R * Math.cos(phi) * Math.cos(theta),
  };
}

function Globe() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => setInView(e.isIntersecting), { threshold: 0.15 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (!inView) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let raf = 0;
    let rot = 0;

    const dots: { lat: number; lon: number }[] = [];
    for (let lat = -72; lat <= 72; lat += 10) {
      for (let lon = 0; lon < 360; lon += 10) dots.push({ lat, lon });
    }

    const draw = () => {
      const W = canvas.width;
      const H = canvas.height;
      const R = Math.min(W, H) / 2 - 18;
      const cx = W / 2;
      const cy = H / 2;

      ctx.clearRect(0, 0, W, H);
      rot += 0.0045;

      const glow = ctx.createRadialGradient(cx, cy, 0, cx, cy, R * 1.6);
      glow.addColorStop(0, 'rgba(212,175,55,0.12)');
      glow.addColorStop(1, 'rgba(212,175,55,0)');
      ctx.fillStyle = glow;
      ctx.fillRect(0, 0, W, H);

      for (const d of dots) {
        const p = to3D(d.lat, d.lon, rot, R);
        if (p.z <= 0) continue;
        const a = 0.1 + (p.z / R) * 0.5;
        ctx.beginPath();
        ctx.arc(cx + p.x, cy + p.y, 1.6, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(246,226,122,${a})`;
        ctx.fill();
      }

      // arcs from Tanzania to every destination
      for (const dest of destinations) {
        if (dest.id === 'tz') continue;
        const p0 = to3D(ORIGIN.lat, ORIGIN.lon, rot, R);
        const p1 = to3D(dest.lat, dest.lon, rot, R);
        const cx3 = p0.x + p1.x;
        const cy3 = p0.y + p1.y;
        const cz3 = p0.z + p1.z;
        const len = Math.sqrt(cx3 * cx3 + cy3 * cy3 + cz3 * cz3) || 1;
        const C = { x: (cx3 / len) * R * 1.55, y: (cy3 / len) * R * 1.55, z: (cz3 / len) * R * 1.55 };
        ctx.beginPath();
        let started = false;
        for (let t = 0; t <= 1.0001; t += 0.02) {
          const u = 1 - t;
          const p = {
            x: u * u * p0.x + 2 * u * t * C.x + t * t * p1.x,
            y: u * u * p0.y + 2 * u * t * C.y + t * t * p1.y,
            z: u * u * p0.z + 2 * u * t * C.z + t * t * p1.z,
          };
          if (p.z <= 0) {
            started = false;
            continue;
          }
          const sx = cx + p.x;
          const sy = cy + p.y;
          if (!started) {
            ctx.moveTo(sx, sy);
            started = true;
          } else {
            ctx.lineTo(sx, sy);
          }
        }
        ctx.strokeStyle = 'rgba(212,175,55,0.45)';
        ctx.lineWidth = 1.2;
        ctx.setLineDash([5, 5]);
        ctx.stroke();
        ctx.setLineDash([]);
      }

      const pulse = (Math.sin(Date.now() / 400) + 1) / 2;
      const drawMarker = (lat: number, lon: number, color: string, r: number) => {
        const p = to3D(lat, lon, rot, R);
        if (p.z <= 0) return;
        const sx = cx + p.x;
        const sy = cy + p.y;
        const ring = 5 + pulse * 7;
        ctx.beginPath();
        ctx.arc(sx, sy, ring, 0, Math.PI * 2);
        ctx.strokeStyle = color;
        ctx.lineWidth = 1.5;
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(sx, sy, r, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.fill();
      };

      drawMarker(ORIGIN.lat, ORIGIN.lon, '#f6e27a', 4);
      for (const dest of destinations) {
        if (dest.id === 'tz') continue;
        drawMarker(dest.lat, dest.lon, '#60a5fa', 3.2);
      }

      raf = requestAnimationFrame(draw);
    };

    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, [inView]);

  return (
    <div ref={wrapRef} className="relative">
      <canvas
        ref={canvasRef}
        width={640}
        height={560}
        className="w-full max-w-[640px] mx-auto"
        aria-label="Interactive globe showing Jackson's dream destinations"
      />
    </div>
  );
}

// ─── Vision page ───
interface DestText {
  country: string;
  city: string;
  reason: string;
}

export function Vision() {
  const { t } = useI18n();
  const texts = t('vision.destinations') as unknown as DestText[];

  return (
    <Section id="vision" className="bg-gradient-to-b from-transparent via-[#070b14] to-transparent">
      <SectionTitle kicker={t('vision.kicker')} title={t('vision.title')} sub={t('vision.sub')} />

      <div className="grid lg:grid-cols-2 gap-10 items-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.94 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="relative"
        >
          <div className="absolute inset-0 rounded-full bg-gold/5 blur-3xl" />
          <Globe />
        </motion.div>

        <div className="grid sm:grid-cols-2 gap-3">
          {destinations.map((d, i) => (
            <motion.div
              key={d.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className="glass rounded-2xl p-4 hover:border-gold/60 transition-all hover:-translate-y-1"
            >
              <div className="flex items-center gap-2.5">
                <span className="text-2xl">{d.flag}</span>
                <div>
                  <h3 className="font-display font-bold text-[15px] text-white">{texts[i].country}</h3>
                  <p className="text-[10px] text-gold tracking-[0.2em] uppercase">{texts[i].city}</p>
                </div>
              </div>
              <p className="mt-2 text-xs text-white/55 leading-relaxed">{texts[i].reason}</p>
              {i === 0 && (
                <span className="mt-2 inline-flex chip !py-1 !text-[9px]">{t('vision.origin')}</span>
              )}
            </motion.div>
          ))}
        </div>
      </div>

      <motion.p
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className="mt-14 text-center font-hand text-3xl sm:text-4xl text-gold-grad"
      >
        {t('vision.quote')}
      </motion.p>
    </Section>
  );
}

// ─── Final Celebration + Completion Certificate ───
function drawCert(ctx: CanvasRenderingContext2D, name: string, badgeCount: number, date: string) {
  const W = ctx.canvas.width;
  const H = ctx.canvas.height;
  const grad = ctx.createLinearGradient(0, 0, W, H);
  grad.addColorStop(0, '#070b14');
  grad.addColorStop(1, '#0d1220');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, H);

  const orb = ctx.createRadialGradient(W / 2, H * 0.2, 0, W / 2, H * 0.2, W * 0.6);
  orb.addColorStop(0, 'rgba(212,175,55,0.22)');
  orb.addColorStop(1, 'rgba(212,175,55,0)');
  ctx.fillStyle = orb;
  ctx.fillRect(0, 0, W, H);

  ctx.strokeStyle = '#d4af37';
  ctx.lineWidth = 5;
  ctx.strokeRect(40, 40, W - 80, H - 80);
  ctx.strokeStyle = 'rgba(212,175,55,0.4)';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(58, 58, W - 116, H - 116);

  ctx.textAlign = 'center';
  ctx.fillStyle = '#f6e27a';
  ctx.font = '700 26px Cinzel, serif';
  ctx.fillText('SAADAN GROUP & JETRAS PRESENTS', W / 2, 130);
  ctx.font = '900 52px Cinzel, serif';
  ctx.fillText('CERTIFICATE', W / 2, 225);
  ctx.font = '600 24px Cinzel, serif';
  ctx.fillStyle = '#ffffff';
  ctx.fillText('OF EXPERIENCE COMPLETION', W / 2, 285);

  ctx.fillStyle = 'rgba(245,242,233,0.75)';
  ctx.font = '400 19px Outfit, sans-serif';
  ctx.fillText('This certifies that', W / 2, 370);
  ctx.fillStyle = '#f6e27a';
  ctx.font = '700 42px Caveat, cursive';
  ctx.fillText(name || 'Guest', W / 2, 435);
  ctx.fillStyle = 'rgba(245,242,233,0.75)';
  ctx.font = '400 19px Outfit, sans-serif';
  ctx.fillText('has completed the Interactive Birthday Experience', W / 2, 490);
  ctx.fillStyle = '#d4af37';
  ctx.font = '900 26px Cinzel, serif';
  ctx.fillText(`${badgeCount} badges earned · Level 23`, W / 2, 550);

  ctx.fillStyle = 'rgba(212,175,55,0.8)';
  ctx.font = '500 15px Outfit, sans-serif';
  ctx.fillText(`${date} · jackson-birthday · SAADAN GROUP & JETRAS`, W / 2, H - 95);
}

export function Finale() {
  const { t } = useI18n();
  const { badges } = useBadges();
  const [certName, setCertName] = useState('');
  const certRef = useRef<HTMLCanvasElement>(null);
  const ref = useRef<HTMLDivElement>(null);
  const fired = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting && !fired.current) {
          fired.current = true;
          sound.unlock();
          sound.fanfare();
          const int = window.setInterval(() => fireworks(), 1500);
          window.setTimeout(() => window.clearInterval(int), 16000);
        }
      },
      { threshold: 0.3 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (certRef.current) {
      const ctx = certRef.current.getContext('2d');
      if (ctx) drawCert(ctx, certName, badges.length, new Date().toLocaleDateString());
    }
  }, [certName, badges.length]);

  const certDownload = () => {
    const c = certRef.current;
    if (!c) return;
    sound.chime();
    const a = document.createElement('a');
    a.href = c.toDataURL('image/png');
    a.download = 'jackson-completion-certificate.png';
    a.click();
  };

  const certShare = () => {
    sound.click();
    window.open(
      waLink(`🏅 I completed Jackson's Interactive Birthday Experience with ${badges.length} badges! Try it: ${siteUrl()}`),
      '_blank'
    );
  };

  const go = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });

  return (
    <section
      id="finale"
      ref={ref}
      className="relative z-10 min-h-[92vh] flex items-center justify-center px-4 py-24 overflow-hidden"
    >
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(212,175,55,0.12),transparent_60%)]" />
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.9 }}
        className="relative text-center max-w-3xl w-full"
      >
        <p className="text-xs tracking-[0.5em] uppercase text-gold/80 mb-6">{t('finale.kicker')}</p>
        <h2 className="font-display text-4xl sm:text-6xl lg:text-7xl font-black leading-tight">
          <span className="text-white">{t('finale.titleA')}</span>
          <span className="block text-gold-grad shimmer">{t('finale.titleB')}</span>
        </h2>
        <div className="mt-8 h-px w-56 mx-auto bg-gold-grad" />
        <p className="mt-8 font-display text-xl sm:text-2xl text-white/85 italic leading-relaxed">
          {t('finale.quote')}
        </p>
        <p className="mt-6 text-white/50 text-sm">{t('finale.thanks')}</p>
        <div className="mt-10 flex flex-wrap justify-center gap-3">
          <a href="https://saadanfilm.com" target="_blank" rel="noreferrer" onClick={() => sound.fanfare()} className="btn-gold">
            {t('finale.visit')}
          </a>
          <button
            onClick={() => {
              sound.click();
              window.open(waLink(`🎉 I celebrated Jackson's birthday online — Level 23 unlocked! Join the celebration: ${siteUrl()}`), '_blank');
            }}
            className="btn-ghost"
          >
            {t('finale.share')}
          </button>
          <button
            onClick={() => {
              sound.click();
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="btn-ghost"
          >
            {t('finale.replay')}
          </button>
        </div>

        {/* Completion certificate */}
        <div className="mt-16 glass rounded-3xl p-6 sm:p-8 text-left">
          <p className="font-display text-xl font-bold text-gold-grad text-center">🎖 {t('finale.cert.title')}</p>
          <p className="text-center text-white/50 text-xs mt-1">{t('finale.cert.sub')}</p>
          <div className="mt-5 grid md:grid-cols-2 gap-6 items-center">
            <canvas
              ref={certRef}
              width={560}
              height={400}
              className="w-full rounded-2xl border border-gold/40 shadow-[0_0_40px_rgba(212,175,55,0.2)]"
            />
            <div className="space-y-3">
              <input
                className="input-lux text-center"
                placeholder={t('finale.cert.name')}
                value={certName}
                onChange={(e) => setCertName(e.target.value)}
                maxLength={20}
              />
              <p className="text-center text-sm text-white/55">
                🏅 {badges.length} / 12 {t('finale.cert.badges')}
              </p>
              <div className="flex flex-wrap justify-center gap-3">
                <button onClick={certDownload} className="btn-gold text-sm">⬇ {t('finale.cert.download')}</button>
                <button onClick={certShare} className="btn-ghost text-sm">📤 {t('finale.cert.share')}</button>
              </div>
              <button onClick={() => go('legacy')} className="chip mx-auto !flex">
                🛂 {t('nav.legacy')}
              </button>
            </div>
          </div>
        </div>

        <p className="mt-12 text-[10px] tracking-[0.4em] uppercase text-white/25">{t('finale.endLine')}</p>
      </motion.div>
    </section>
  );
}
