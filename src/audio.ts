// ─── Web Audio engine — synthesized music with 5 genres + SFX ───

export type Genre = 'birthday' | 'piano' | 'orchestra' | 'african' | 'cinematic';

interface GenreCfg {
  interval: number;
  chords: number[][];
  wave: OscillatorType;
  filter: number;
  gain: number;
  arp: boolean;
  arpScale: number[];
  perc?: boolean;
  drone?: number;
}

const CONFIGS: Record<Genre, GenreCfg> = {
  birthday: {
    interval: 4000,
    chords: [
      [261.63, 329.63, 392.0],
      [220.0, 261.63, 329.63],
      [174.61, 220.0, 261.63],
      [196.0, 246.94, 293.66],
    ],
    wave: 'sine', filter: 1300, gain: 0.05, arp: true,
    arpScale: [523.25, 587.33, 659.25, 783.99, 880.0, 987.77, 1046.5],
  },
  piano: {
    interval: 3400,
    chords: [
      [261.63, 329.63, 392.0],
      [293.66, 349.23, 440.0],
      [220.0, 261.63, 329.63],
      [174.61, 220.0, 261.63],
    ],
    wave: 'triangle', filter: 950, gain: 0.075, arp: true,
    arpScale: [523.25, 587.33, 659.25, 783.99, 880.0],
  },
  orchestra: {
    interval: 4200,
    chords: [
      [130.81, 196.0, 246.94, 329.63],
      [110.0, 164.81, 220.0, 261.63],
      [146.83, 220.0, 293.66, 349.23],
      [98.0, 146.83, 196.0, 246.94],
    ],
    wave: 'sawtooth', filter: 620, gain: 0.04, arp: false, arpScale: [],
    drone: 55,
  },
  african: {
    interval: 2200,
    chords: [[261.63, 329.63, 392.0]],
    wave: 'square', filter: 1800, gain: 0.045, arp: true,
    arpScale: [261.63, 293.66, 329.63, 392.0, 440.0, 523.25],
    perc: true,
  },
  cinematic: {
    interval: 5200,
    chords: [
      [220.0, 261.63, 329.63],
      [174.61, 220.0, 261.63],
      [130.81, 164.81, 196.0],
      [196.0, 246.94, 293.66],
    ],
    wave: 'sawtooth', filter: 480, gain: 0.035, arp: false, arpScale: [],
    drone: 41.2,
  },
};

type ToneOpts = {
  type?: OscillatorType;
  gain?: number;
  attack?: number;
  slide?: number;
  when?: number;
  filterFreq?: number;
};

class SoundEngine {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private musicBus: GainNode | null = null;
  private noiseBuf: AudioBuffer | null = null;
  private musicTimer: number | null = null;
  private step = 0;
  enabled = true;
  musicOn = false;
  genre: Genre = 'birthday';
  volume = 1;
  muted = false;

  unlock() {
    if (!this.ctx) {
      const AC =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!AC) return;
      this.ctx = new AC();
      this.master = this.ctx.createGain();
      this.master.gain.value = 0.5;
      this.master.connect(this.ctx.destination);
      this.musicBus = this.ctx.createGain();
      this.musicBus.gain.value = 0;
      this.musicBus.connect(this.master);
      const len = this.ctx.sampleRate * 1;
      this.noiseBuf = this.ctx.createBuffer(1, len, this.ctx.sampleRate);
      const data = this.noiseBuf.getChannelData(0);
      for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
    }
    if (this.ctx.state === 'suspended') void this.ctx.resume();
  }

  setEnabled(on: boolean) {
    this.enabled = on;
    if (!on) this.setMusic(false);
  }

  private tone(freq: number, dur: number, opts: ToneOpts = {}) {
    if (!this.enabled || !this.ctx || !this.master) return;
    const { type = 'sine', gain = 0.12, attack = 0.01, slide, when = 0, filterFreq } = opts;
    const t = this.ctx.currentTime + when;
    const osc = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t);
    if (slide) osc.frequency.exponentialRampToValueAtTime(Math.max(20, slide), t + dur);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(gain, t + attack);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    osc.connect(g);
    if (filterFreq) {
      const flt = this.ctx.createBiquadFilter();
      flt.type = 'lowpass';
      flt.frequency.value = filterFreq;
      g.connect(flt);
      flt.connect(this.master);
    } else {
      g.connect(this.master);
    }
    osc.start(t);
    osc.stop(t + dur + 0.05);
  }

  private shaker(when: number) {
    if (!this.ctx || !this.musicBus || !this.noiseBuf) return;
    const src = this.ctx.createBufferSource();
    src.buffer = this.noiseBuf;
    const g = this.ctx.createGain();
    const flt = this.ctx.createBiquadFilter();
    flt.type = 'highpass';
    flt.frequency.value = 3500;
    const t = this.ctx.currentTime + when;
    g.gain.setValueAtTime(0.05, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.12);
    src.connect(flt);
    flt.connect(g);
    g.connect(this.musicBus);
    src.start(t);
    src.stop(t + 0.15);
  }

  startup() {
    this.tone(90, 1.1, { type: 'sawtooth', gain: 0.07, slide: 640 });
    this.tone(180, 0.9, { type: 'square', gain: 0.03, slide: 480 });
    window.setTimeout(() => this.tone(520, 0.25, { type: 'square', gain: 0.05 }), 900);
  }

  click() { this.tone(540, 0.07, { type: 'square', gain: 0.045 }); }
  pop() { this.tone(320, 0.16, { type: 'sine', gain: 0.16, slide: 940 }); }
  whoosh() { this.tone(240, 0.45, { type: 'sawtooth', gain: 0.035, slide: 48 }); }
  boom() { this.tone(70, 1.4, { type: 'sine', gain: 0.3, slide: 34 }); }
  error() { this.tone(220, 0.2, { type: 'square', gain: 0.06, slide: 110 }); }

  chime() {
    [523.25, 659.25, 783.99, 1046.5].forEach((f, i) =>
      window.setTimeout(() => this.tone(f, 0.5, { type: 'sine', gain: 0.1 }), i * 130)
    );
  }

  fanfare() {
    [392, 523.25, 659.25, 783.99, 1046.5, 1318.5].forEach((f, i) =>
      window.setTimeout(() => this.tone(f, 0.65, { type: 'triangle', gain: 0.13 }), i * 150)
    );
  }

  setGenre(g: Genre) {
    this.genre = g;
    if (this.musicOn) {
      this.stopLoop();
      this.startLoop();
    }
  }

  setVolume(v: number) {
    this.volume = Math.max(0, Math.min(1, v));
    this.applyLevel();
  }

  setMuted(m: boolean) {
    this.muted = m;
    this.applyLevel();
  }

  private applyLevel() {
    if (!this.ctx || !this.musicBus) return;
    const target = this.musicOn && !this.muted ? 0.24 * this.volume : 0;
    this.musicBus.gain.setTargetAtTime(target, this.ctx.currentTime, 0.4);
  }

  setMusic(on: boolean) {
    this.musicOn = on;
    if (!this.ctx || !this.musicBus) return;
    this.applyLevel();
    if (on && this.musicTimer === null) this.startLoop();
    if (!on && this.musicTimer !== null) {
      this.stopLoop();
    }
  }

  private stopLoop() {
    if (this.musicTimer !== null) {
      window.clearInterval(this.musicTimer);
      this.musicTimer = null;
    }
  }

  private startLoop() {
    const cfg = CONFIGS[this.genre];
    this.musicTimer = window.setInterval(() => {
      if (!this.musicOn || !this.ctx || !this.musicBus) return;
      const bus = this.musicBus;
      const t = this.ctx.currentTime;
      const chord = cfg.chords[this.step % cfg.chords.length];

      // pad chord
      chord.forEach((f) => {
        const osc = this.ctx!.createOscillator();
        const g = this.ctx!.createGain();
        const flt = this.ctx!.createBiquadFilter();
        flt.type = 'lowpass';
        flt.frequency.value = cfg.filter;
        osc.type = cfg.wave;
        osc.frequency.value = f;
        const attack = cfg.wave === 'sawtooth' ? 1.4 : 0.4;
        g.gain.setValueAtTime(0.0001, t);
        g.gain.exponentialRampToValueAtTime(cfg.gain, t + attack);
        g.gain.exponentialRampToValueAtTime(0.0001, t + cfg.interval / 1000 - 0.2);
        osc.connect(flt);
        flt.connect(g);
        g.connect(bus);
        osc.start(t);
        osc.stop(t + cfg.interval / 1000);
      });

      // drone
      if (cfg.drone) {
        const osc = this.ctx.createOscillator();
        const g = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.value = cfg.drone;
        g.gain.setValueAtTime(0.0001, t);
        g.gain.exponentialRampToValueAtTime(0.06, t + 1.5);
        g.gain.exponentialRampToValueAtTime(0.0001, t + cfg.interval / 1000);
        osc.connect(g);
        g.connect(bus);
        osc.start(t);
        osc.stop(t + cfg.interval / 1000 + 0.1);
      }

      // arp / melody
      if (cfg.arp && cfg.arpScale.length) {
        const notes = cfg.arpScale;
        const stepDur = cfg.perc ? 0.26 : 0.8;
        const count = Math.floor((cfg.interval / 1000) / stepDur) - 1;
        for (let i = 0; i < count; i++) {
          const note = notes[Math.floor(Math.random() * notes.length)] * (Math.random() < 0.3 && !cfg.perc ? 2 : 1);
          const tt = t + 0.5 + i * stepDur;
          const osc = this.ctx.createOscillator();
          const g = this.ctx.createGain();
          const flt = this.ctx.createBiquadFilter();
          flt.type = 'lowpass';
          flt.frequency.value = cfg.perc ? 2000 : 2600;
          osc.type = cfg.perc ? 'square' : 'triangle';
          osc.frequency.value = note;
          g.gain.setValueAtTime(0.0001, tt);
          g.gain.exponentialRampToValueAtTime(cfg.perc ? 0.05 : 0.028, tt + 0.03);
          g.gain.exponentialRampToValueAtTime(0.0001, tt + (cfg.perc ? 0.2 : 0.5));
          osc.connect(flt);
          flt.connect(g);
          g.connect(bus);
          osc.start(tt);
          osc.stop(tt + 0.55);
        }
      }

      // percussion
      if (cfg.perc) {
        for (let i = 0; i < 6; i++) this.shaker(0.4 + i * 0.28);
      }

      this.step += 1;
    }, cfg.interval);
  }
}

export const sound = new SoundEngine();

// ─── Fireworks / confetti helpers ───
import confetti from 'canvas-confetti';

const GOLD = ['#f6e27a', '#d4af37', '#fff3c4', '#ffffff'];
const BLUE = ['#3b82f6', '#60a5fa', '#d4af37', '#ffffff'];

export const burst = (x = 0.5, y = 0.4) => {
  confetti({
    particleCount: 90,
    spread: 75,
    startVelocity: 34,
    origin: { x, y },
    colors: GOLD,
    scalar: 1.05,
    ticks: 180,
  });
};

export const fireworks = () => {
  const count = 4;
  for (let i = 0; i < count; i++) {
    window.setTimeout(() => {
      confetti({
        particleCount: 70,
        spread: 360,
        startVelocity: 30,
        origin: { x: 0.15 + Math.random() * 0.7, y: 0.15 + Math.random() * 0.4 },
        colors: Math.random() > 0.5 ? GOLD : BLUE,
        ticks: 220,
        decay: 0.92,
      });
    }, i * 320);
  }
};

export const confettiRain = (duration = 2000) => {
  const end = Date.now() + duration;
  (function frame() {
    confetti({ particleCount: 3, angle: 60, spread: 60, origin: { x: 0 }, colors: GOLD });
    confetti({ particleCount: 3, angle: 120, spread: 60, origin: { x: 1 }, colors: BLUE });
    if (Date.now() < end) requestAnimationFrame(frame);
  })();
};
