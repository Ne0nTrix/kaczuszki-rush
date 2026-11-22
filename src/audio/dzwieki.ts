import { glosnosc } from '../ustawienia';
import { params } from '../params';
import { wczytajZapis, zapiszDoStorage } from '../zapis';

type typOsc = OscillatorType;

interface toneOpts {
  type?: typOsc;
  from: number;
  to?: number;
  dur: number;
  vol?: number;
  delay?: number;
  attack?: number;
  bus?: 'sfx' | 'music';
  vibrato?: number;
  at?: number;
}

interface noiseOpts {
  dur: number;
  vol?: number;
  delay?: number;
  filter?: BiquadFilterType;
  freq?: number;
  to?: number;
  q?: number;
  bus?: 'sfx' | 'music';
  at?: number;
}

const pentatonika = [0, 2, 4, 7, 9];
export const pentaFreq = (rootMidi: number, stopien: number): number => {
  const oct = Math.floor(stopien / 5);
  const polton = pentatonika[((stopien % 5) + 5) % 5] + oct * 12;
  return 440 * Math.pow(2, (rootMidi + polton - 69) / 12);
};

class audioSys {
  ctx: AudioContext | null = null;
  private master!: GainNode;
  private sfxBus!: GainNode;
  musicBus!: GainNode;
  private buforSzumu!: AudioBuffer;
  muted = false;
  private plinkStep = 0;
  private plinkAt = 0;
  onUnlock: (() => void) | null = null;

  constructor() {
    this.muted = params.mute || wczytajZapis().muted;
  }

  unlock(): void {
    if (params.mute) return;
    if (!this.ctx) {
      try {
        const audioCtxClass: typeof AudioContext = window.AudioContext || (window as any).webkitAudioContext;
        this.ctx = new audioCtxClass();
      } catch {
        return;
      }
      const c = this.ctx;
      this.master = c.createGain();
      this.master.gain.value = this.muted ? 0 : 1;
      const comp = c.createDynamicsCompressor();
      this.master.connect(comp).connect(c.destination);
      this.sfxBus = c.createGain();
      this.sfxBus.gain.value = glosnosc.sfx;
      this.sfxBus.connect(this.master);
      this.musicBus = c.createGain();
      this.musicBus.gain.value = glosnosc.music;
      this.musicBus.connect(this.master);
      const len = c.sampleRate;
      this.buforSzumu = c.createBuffer(1, len, c.sampleRate);
      const d = this.buforSzumu.getChannelData(0);
      for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
      if (this.onUnlock) this.onUnlock();
    }
    if (this.ctx.state === 'suspended') void this.ctx.resume();
  }

  przelaczWyciszenie(): boolean {
    this.muted = !this.muted;
    if (this.ctx) this.master.gain.setTargetAtTime(this.muted ? 0 : 1, this.ctx.currentTime, 0.02);
    wczytajZapis().muted = this.muted;
    zapiszDoStorage();
    return this.muted;
  }

  tone(o: toneOpts): void {
    const c = this.ctx;
    if (!c || this.muted) return;
    const t0 = (o.at ?? c.currentTime) + (o.delay ?? 0);
    const osc = c.createOscillator();
    const g = c.createGain();
    osc.type = o.type ?? 'square';
    osc.frequency.setValueAtTime(Math.max(20, o.from), t0);
    if (o.to !== undefined && o.to !== o.from) {
      osc.frequency.exponentialRampToValueAtTime(Math.max(20, o.to), t0 + o.dur);
    }
    if (o.vibrato) {
      const lfo = c.createOscillator();
      const lg = c.createGain();
      lfo.frequency.value = 6;
      lg.gain.value = o.vibrato;
      lfo.connect(lg).connect(osc.frequency);
      lfo.start(t0);
      lfo.stop(t0 + o.dur + 0.05);
    }
    const vol = o.vol ?? 0.3;
    const a = o.attack ?? 0.005;
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.linearRampToValueAtTime(vol, t0 + a);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + o.dur);
    osc.connect(g).connect(o.bus === 'music' ? this.musicBus : this.sfxBus);
    osc.start(t0);
    osc.stop(t0 + o.dur + 0.05);
  }

  noise(o: noiseOpts): void {
    const c = this.ctx;
    if (!c || this.muted) return;
    const t0 = (o.at ?? c.currentTime) + (o.delay ?? 0);
    const src = c.createBufferSource();
    src.buffer = this.buforSzumu;
    src.loop = true;
    const f = c.createBiquadFilter();
    f.type = o.filter ?? 'lowpass';
    f.frequency.setValueAtTime(o.freq ?? 1200, t0);
    if (o.to) f.frequency.exponentialRampToValueAtTime(o.to, t0 + o.dur);
    f.Q.value = o.q ?? 0.8;
    const g = c.createGain();
    g.gain.setValueAtTime(o.vol ?? 0.3, t0);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + o.dur);
    src.connect(f).connect(g).connect(o.bus === 'music' ? this.musicBus : this.sfxBus);
    src.start(t0, Math.random() * 0.5);
    src.stop(t0 + o.dur + 0.05);
  }

  jump(): void {
    this.tone({ type: 'square', from: 300, to: 620, dur: 0.14, vol: 0.16 });
  }
  land(): void {
    this.noise({ dur: 0.09, vol: 0.22, freq: 500 });
  }

  plink(): void {
    const now = performance.now();
    this.plinkStep = now - this.plinkAt < 600 ? Math.min(this.plinkStep + 1, 12) : 0;
    this.plinkAt = now;
    const f = pentaFreq(76, this.plinkStep);
    this.tone({ type: 'triangle', from: f, dur: 0.16, vol: 0.34 });
    this.tone({ type: 'sine', from: f * 2, dur: 0.1, vol: 0.12 });
  }
  boop(): void {
    this.tone({ type: 'square', from: 520, to: 260, dur: 0.1, vol: 0.2 });
    this.noise({ dur: 0.07, vol: 0.25, filter: 'bandpass', freq: 1800, delay: 0.03 });
  }
  whoosh(): void {
    this.noise({ dur: 0.22, vol: 0.2, filter: 'bandpass', freq: 500, to: 2600, q: 2 });
  }
  thud(): void {
    this.tone({ type: 'sine', from: 150, to: 42, dur: 0.24, vol: 0.6 });
    this.noise({ dur: 0.16, vol: 0.35, freq: 400 });
  }
  crack(): void {
    this.noise({ dur: 0.12, vol: 0.4, filter: 'highpass', freq: 900 });
    this.tone({ type: 'square', from: 190, to: 80, dur: 0.1, vol: 0.2 });
  }
  bonk(): void {
    this.tone({ type: 'square', from: 420, to: 130, dur: 0.22, vol: 0.24 });
  }
  bonkBig(): void {
    this.tone({ type: 'square', from: 500, to: 250, dur: 0.14, vol: 0.22 });
    this.tone({ type: 'square', from: 380, to: 160, dur: 0.16, vol: 0.22, delay: 0.14 });
    this.tone({ type: 'sine', from: 1200, to: 300, dur: 0.5, vol: 0.16, delay: 0.26 });
  }
  sproing(): void {
    this.tone({ type: 'square', from: 180, to: 900, dur: 0.26, vol: 0.2 });
    this.tone({ type: 'sine', from: 360, to: 1400, dur: 0.22, vol: 0.14, delay: 0.03 });
  }
  quack(): void {
    this.tone({ type: 'sawtooth', from: 880, to: 600, dur: 0.07, vol: 0.2 });
    this.tone({ type: 'sawtooth', from: 980, to: 660, dur: 0.08, vol: 0.2, delay: 0.1 });
  }
  checkpoint(): void {
    [0, 2, 4].forEach((d, i) => this.tone({ type: 'triangle', from: pentaFreq(72, d + 2), dur: 0.22, vol: 0.3, delay: i * 0.09 }));
  }
  melon(): void {
    [0, 1, 2, 3, 4, 5, 6, 7].forEach((d, i) => this.tone({ type: 'square', from: pentaFreq(72, d), dur: 0.1, vol: 0.16, delay: i * 0.045 }));
  }
  yeet(): void {
    this.tone({ type: 'sawtooth', from: 300, to: 1500, dur: 0.22, vol: 0.14 });
    this.noise({ dur: 0.1, vol: 0.2, filter: 'bandpass', freq: 1400 });
  }
  splash(): void {
    this.noise({ dur: 0.45, vol: 0.45, filter: 'bandpass', freq: 1500, to: 350, q: 0.7 });
    this.tone({ type: 'sine', from: 320, to: 90, dur: 0.25, vol: 0.25 });
  }
  smallSplash(): void {
    this.noise({ dur: 0.16, vol: 0.2, filter: 'bandpass', freq: 1600, to: 600 });
  }
  plip(i: number): void {
    this.tone({ type: 'sine', from: pentaFreq(72, Math.min(i, 17)), dur: 0.12, vol: 0.3 });
  }
  fanfare(): void {
    const seq = [0, 2, 3, 5, 3, 5, 7];
    const t = [0, 0.11, 0.22, 0.33, 0.5, 0.61, 0.72];
    seq.forEach((d, i) => this.tone({ type: 'square', from: pentaFreq(72, d), dur: i === 6 ? 0.5 : 0.14, vol: 0.2, delay: t[i] }));
    seq.forEach((d, i) => this.tone({ type: 'triangle', from: pentaFreq(60, d), dur: i === 6 ? 0.5 : 0.14, vol: 0.2, delay: t[i] }));
  }
  star(i: number): void {
    this.tone({ type: 'triangle', from: pentaFreq(76, i * 2), dur: 0.3, vol: 0.34 });
    this.tone({ type: 'sine', from: pentaFreq(88, i * 2), dur: 0.2, vol: 0.14, delay: 0.03 });
  }
  zapWarn(): void {
    this.noise({ dur: 0.05, vol: 0.12, filter: 'highpass', freq: 3000 });
  }
  zap(): void {
    this.noise({ dur: 0.3, vol: 0.4, filter: 'highpass', freq: 1200 });
    this.tone({ type: 'sawtooth', from: 900, to: 90, dur: 0.28, vol: 0.2 });
  }
  hmph(): void {
    this.tone({ type: 'triangle', from: 220, to: 330, dur: 0.12, vol: 0.3 });
  }
  crumble(): void {
    this.noise({ dur: 0.2, vol: 0.2, freq: 700, to: 200 });
  }
  pop(): void {
    this.tone({ type: 'sine', from: 400, to: 900, dur: 0.08, vol: 0.25 });
  }
  swim(): void {
    this.noise({ dur: 0.12, vol: 0.12, filter: 'bandpass', freq: 700, to: 1300 });
  }
  ui(): void {
    this.tone({ type: 'triangle', from: 660, dur: 0.06, vol: 0.2 });
  }
  uiGo(): void {
    this.tone({ type: 'triangle', from: 660, to: 990, dur: 0.12, vol: 0.25 });
  }
  firework(): void {
    this.noise({ dur: 0.35, vol: 0.1, filter: 'bandpass', freq: 2400, to: 500 });
  }
  melonEnd(): void {
    this.tone({ type: 'square', from: 700, to: 300, dur: 0.2, vol: 0.14 });
  }
}

export const audio = new audioSys();
