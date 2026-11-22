import Phaser from 'phaser';
import { kolory, gameH, gameW } from '../ustawienia';

const sceneKeys = ['Title', 'LevelSelect', 'Game', 'Hud', 'Pause', 'Results', 'Ending'];
const pelnyPromien = 2300;

export class transitionScene extends Phaser.Scene {
  private maskG!: Phaser.GameObjects.Graphics;
  private cx = gameW / 2;
  private cy = gameH / 2;
  r = pelnyPromien;
  zajety = false;

  constructor() {
    super('Transition');
  }

  create(): void {
    const zaslona = this.add.graphics();
    zaslona.fillStyle(kolory.outlineN, 1).fillRect(-50, -50, gameW + 100, gameH + 100);
    this.maskG = this.make.graphics({}, false);
    const mask = this.maskG.createGeometryMask();
    mask.setInvertAlpha(true);
    zaslona.setMask(mask);
    this.draw();
  }

  private draw(): void {
    this.maskG.clear();
    if (this.r > 1) this.maskG.fillStyle(0xffffff, 1).fillCircle(this.cx, this.cy, this.r);
  }

  private run(to: number, dur: number, ease: string): Promise<void> {
    return new Promise((resolve) => {
      this.tweens.add({
        targets: this, r: to, duration: dur, ease,
        onUpdate: () => this.draw(),
        onComplete: () => {
          this.draw();
          resolve();
        },
      });
    });
  }

  zamknij(x = gameW / 2, y = gameH / 2, dur = 380): Promise<void> {
    this.cx = Phaser.Math.Clamp(x, 0, gameW);
    this.cy = Phaser.Math.Clamp(y, 0, gameH);
    this.r = Math.min(this.r, 1500);
    return this.run(0, dur, 'Cubic.In');
  }

  otworz(dur = 420, x?: number, y?: number): Promise<void> {
    if (x !== undefined && y !== undefined) {
      this.cx = Phaser.Math.Clamp(x, 0, gameW);
      this.cy = Phaser.Math.Clamp(y, 0, gameH);
    }
    return this.run(pelnyPromien, dur, 'Cubic.Out');
  }

  wait(ms: number): Promise<void> {
    return new Promise((resolve) => this.time.delayedCall(ms, () => resolve()));
  }
}

interface switchOpts {
  focus?: { x: number; y: number };
  prepare?: (scene: Phaser.Scene) => Promise<void>;
}

export async function zmienScene(from: Phaser.Scene, key: string, data: object = {}, opts: switchOpts = {}): Promise<void> {
  const tr = from.scene.get('Transition') as transitionScene;
  if (tr.zajety) return;
  tr.zajety = true;
  try {
    await tr.zamknij(opts.focus?.x, opts.focus?.y);
    for (const k of sceneKeys) {
      if (tr.scene.isActive(k) || tr.scene.isPaused(k) || tr.scene.isSleeping(k)) tr.scene.stop(k);
    }
    if (opts.prepare) await opts.prepare(tr);
    tr.scene.run(key, data);
    tr.scene.bringToTop('Transition');
    await tr.wait(120);
    await tr.otworz(420, gameW / 2, gameH / 2);
  } finally {
    tr.zajety = false;
  }
}

export async function mrugniecie(from: Phaser.Scene, focus: { x: number; y: number }, mid: () => { x: number; y: number }): Promise<void> {
  const tr = from.scene.get('Transition') as transitionScene;
  if (tr.zajety) return;
  tr.zajety = true;
  try {
    await tr.zamknij(focus.x, focus.y, 300);
    const f = mid();
    await tr.wait(80);
    await tr.otworz(340, f.x, f.y);
  } finally {
    tr.zajety = false;
  }
}

export function isTransitioning(scene: Phaser.Scene): boolean {
  return (scene.scene.get('Transition') as transitionScene).zajety;
}
