import { audio, pentaFreq } from "./dzwieki";

const _ = -1;

interface piosenka {
  bpm: number;
  lead: number[];
  bass: number[];
  bassSteps: number[];
  kick: number[];
  snare: number[];
  hat: number[];
}

const levelSong: piosenka = {
  bpm: 124,

  lead: [
    5, _, 5, 7, _, 5, 4, _, 3, _, 4, _, 5, _, _, _,
    7, _, 7, 8, _, 7, 5, _, 4, _, 5, _, 3, _, _, _,
    5, _, 5, 7, _, 8, 7, _, 5, _, 4, _, 3, _, 4, _,
    5, _, 3, _, 4, _, 2, _, 3, _, _, 3, 5, _, _, _,
  ],
  bass: [0, -3, 5, 7],
  bassSteps: [0, 3, 6, 8, 11, 14],
  kick: [0, 8, 10],
  snare: [4, 12],
  hat: [2, 6, 10, 14],
};

const chillSong: piosenka = {
  bpm: 90,

  lead: [
    3, _, _, 5, _, _, 4, _, _, _, 3, _, _, _, _, _,
    2, _, _, 3, _, _, 4, _, _, _, 2, _, _, _, _, _,
    3, _, _, 5, _, _, 7, _, _, _, 5, _, 4, _, _, _,
    3, _, _, 2, _, _, 0, _, _, _, _, _, _, _, _, _,
  ],
  bass: [0, -3, 5, 7],
  bassSteps: [0, 8],
  kick: [0],
  snare: [],
  hat: [4, 12],
};

const rootNotes: Record<string, number> = { C: 72, D: 74, F: 65, G: 67, A: 69, Eb: 63 };

export interface musicOpts {
  root?: string;
  lead?: OscillatorType;
  vibrato?: boolean;
  arp?: boolean;
}

class muzyka {
  private song: piosenka | null = null;
  private name = '';
  private opts: musicOpts = {};
  private step = 0;
  private nextTime = 0;
  private timer: number | null = null;
  private pending: { name: string; opts: musicOpts } | null = null;
  melon = false;
  duck = 1;

  constructor() {
    audio.onUnlock = () => {
      if (this.pending) {
        const p = this.pending;
        this.pending = null;
        this.play(p.name as 'chill' | 'level', p.opts);
      }
    };
  }

  play(name: 'chill' | 'level', opts: musicOpts = {}): void {
    const key = name + JSON.stringify(opts);
    if (!audio.ctx) {
      this.pending = { name, opts };
      return;
    }
    if (this.name === key && this.timer !== null) return;
    this.stop();
    this.name = key;
    this.song = name === 'chill' ? chillSong : levelSong;
    this.opts = opts;
    this.step = 0;
    this.melon = false;
    this.duck = 1;
    this.nextTime = audio.ctx.currentTime + 0.08;
    this.timer = window.setInterval(() => this.tick(), 30);
  }

  stop(): void {
    if (this.timer !== null) window.clearInterval(this.timer);
    this.timer = null;
    this.name = '';
    this.pending = null;
  }

  private tick(): void {
    const c = audio.ctx;
    const s = this.song;
    if (!c || !s) return;
    if (this.nextTime < c.currentTime - 0.3) this.nextTime = c.currentTime + 0.05;
    while (this.nextTime < c.currentTime + 0.12) {
      this.schedule(s, this.step, this.nextTime);
      const bpm = s.bpm * (this.melon ? 1.2 : 1);
      this.nextTime += 60 / bpm / 4;
      this.step = (this.step + 1) % 64;
    }
  }

  private schedule(s: piosenka, step: number, at: number): void {
    const o = this.opts;
    const root = rootNotes[o.root ?? 'C'] ?? 72;
    const bar = Math.floor(step / 16);
    const st = step % 16;
    const sd = 60 / s.bpm / 4;
    const v = this.duck;
    const d = s.lead[step];
    if (d >= 0) {
      audio.tone({
        type: o.lead ?? 'triangle', from: pentaFreq(root, d), dur: sd * 2.4, vol: 0.2 * v,
        bus: 'music', at, vibrato: o.vibrato ? 5 : 0,
      });
    }
    if (s.bassSteps.includes(st)) {
      const polton = s.bass[bar] + (st % 8 === 6 || st === 11 ? 7 : 0);
      const f = 440 * Math.pow(2, (root - 24 + polton - 69) / 12);
      audio.tone({ type: 'triangle', from: f, dur: sd * 2.6, vol: 0.42 * v, bus: 'music', at });
    }
    if (s.kick.includes(st)) audio.tone({ type: 'sine', from: 140, to: 45, dur: 0.14, vol: 0.5 * v, bus: 'music', at });
    if (s.snare.includes(st)) audio.noise({ dur: 0.09, vol: 0.2 * v, filter: 'bandpass', freq: 1800, bus: 'music', at });
    if (s.hat.includes(st)) audio.noise({ dur: 0.035, vol: 0.1 * v, filter: 'highpass', freq: 6000, bus: 'music', at });
    if (this.melon || o.arp) {
      const arp = [0, 2, 3, 5, 3, 2, 5, 7];
      const base = s.bass[bar] === -3 ? 4 : s.bass[bar] === 5 ? 3 : s.bass[bar] === 7 ? 1 : 0;
      if (this.melon || st % 2 === 0) {
        audio.tone({
          type: this.melon ? 'square' : 'sine', from: pentaFreq(root + 12, arp[st % 8] + base - (this.melon ? 0 : 5)),
          dur: sd * 0.9, vol: (this.melon ? 0.07 : 0.09) * v, bus: 'music', at,
        });
      }
    }
  }
}

export const music = new muzyka();
