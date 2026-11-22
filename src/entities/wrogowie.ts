import Phaser from 'phaser';
import { warstwy, kafel } from '../ustawienia';
import type { swiat } from '../poziomy/parse';
import type { gameScene } from '../sceny/gra';

// ile wolnych kafli w danym kierunku (max 12), uzywane tez przez platformy
export function wolnePola(w: swiat, col: number, row: number, dc: number, dr: number, def = 3): { n: number; byLimit: boolean } {
  for (let i = 1; i <= 12; i++) {
    const c = col + dc * i;
    const r = row + dr * i;
    if (w.limit(c, r)) return { n: i - 1, byLimit: true };
    if (w.twardy(c, r)) return { n: i - 1, byLimit: false };
  }
  return { n: def, byLimit: false };
}

export abstract class wrog {
  zyje = true;
  moznaSkoczyc = true;
  ploppable = true;
  x: number;
  y: number;
  hw: number;
  hh: number;
  img: Phaser.GameObjects.Image;

  constructor(protected scene: gameScene, key: string, x: number, y: number, hw: number, hh: number) {
    this.x = x;
    this.y = y;
    this.hw = hw;
    this.hh = hh;
    this.img = scene.add.image(x, y, key).setDepth(warstwy.enemy);
  }

  abstract update(dt: number, t: number): void;

  protected extras(): Phaser.GameObjects.GameObject[] {
    return [];
  }

  squash() {
    this.zyje = false;
    this.extras().forEach((e) => e.destroy());
    this.scene.tweens.add({
      targets: this.img, scaleY: 0.15, scaleX: 1.5, y: this.y + this.hh, duration: 110,
      onComplete: () => this.img.destroy(),
    });
  }

  yeet(dir: number) {
    this.zyje = false;
    this.extras().forEach((e) => e.destroy());
    this.img.setDepth(warstwy.fx);
    this.scene.tweens.add({
      targets: this.img, x: this.x + dir * 1300, y: this.y - 900, angle: 1080 * dir, duration: 800, ease: 'Sine.Out',
      onComplete: () => this.img.destroy(),
    });
  }
}

export class chodziarz extends wrog {
  private dir = -1;
  private predkosc: number;
  private row: number;

  constructor(scene: gameScene, kind: 'crab' | 'hedgehog', col: number, row: number) {
    super(scene, kind, col * kafel + kafel / 2, (row + 1) * kafel - (kind === 'crab' ? 34 : 32), 38, kind === 'crab' ? 27 : 26);
    this.row = row;
    this.predkosc = kind === 'crab' ? 90 : 70;
    if (kind === 'hedgehog') this.moznaSkoczyc = false;
  }

  update(dt: number, t: number) {
    const w = this.scene.world;
    const nx = this.x + this.dir * this.predkosc * dt;
    const c = Math.floor((nx + this.dir * this.hw) / kafel);
    const maBlokade =
      w.twardy(c, this.row) || w.limit(c, this.row) || w.ch(c, this.row) === 'S' || w.ch(c, this.row) === '^' ||
      w.water(c, this.row) || !w.floor(c, this.row + 1);
    if (maBlokade) this.dir = -this.dir;
    else this.x = nx;
    this.img.setPosition(this.x, this.y + Math.abs(Math.sin(t * 9 + this.row)) * -3);
    this.img.setRotation(Math.sin(t * 9 + this.row) * 0.1);
    this.img.setFlipX(this.dir < 0);
  }
}

export class pszczola extends wrog {
  private dir = -1;
  private minX: number;
  private maxX: number;
  private y0: number;
  private wing: Phaser.GameObjects.Image;
  private phase: number;

  constructor(scene: gameScene, col: number, row: number) {
    super(scene, 'bee', col * kafel + kafel / 2, row * kafel + kafel / 2, 28, 21);
    const l = wolnePola(scene.world, col, row, -1, 0);
    const r = wolnePola(scene.world, col, row, 1, 0);
    this.minX = this.x - (l.byLimit ? l.n : Math.min(l.n, 3)) * kafel;
    this.maxX = this.x + (r.byLimit ? r.n : Math.min(r.n, 3)) * kafel;
    this.y0 = this.y;
    this.phase = col * 0.7;
    this.wing = scene.add.image(this.x, this.y, 'bee_wing').setDepth(warstwy.enemy + 1).setOrigin(0.5, 1);
  }

  protected extras() {
    return [this.wing];
  }

  update(dt: number, t: number) {
    this.x += this.dir * 150 * dt;
    if (this.x <= this.minX) {
      this.x = this.minX;
      this.dir = 1;
    } else if (this.x >= this.maxX) {
      this.x = this.maxX;
      this.dir = -1;
    }
    this.y = this.y0 + Math.sin((t * Math.PI * 2) / 1.6 + this.phase) * 48;
    this.img.setPosition(this.x, this.y).setFlipX(this.dir < 0);
    this.wing.setPosition(this.x - this.dir * 6, this.y - 12);
    this.wing.setScale(1, 0.35 + Math.abs(Math.sin(t * 40)) * 0.75);
  }
}

export class rybaRozdymka extends wrog {
  private y0: number;
  private minY: number;
  private maxY: number;
  private phase: number;
  private big = false;

  constructor(scene: gameScene, col: number, row: number) {
    super(scene, 'puffer', col * kafel + kafel / 2, row * kafel + kafel / 2, 28, 28);
    this.moznaSkoczyc = false;
    this.ploppable = false;
    const w = scene.world;
    let top = row;
    while (w.water(col, top - 1)) top--;
    let bot = row;
    while (w.water(col, bot + 1)) bot++;
    this.minY = top * kafel + (w.ch(col, top) === '~' ? 62 : 40);
    this.maxY = (bot + 1) * kafel - 40;
    this.y0 = Phaser.Math.Clamp(this.y, this.minY, this.maxY);
    this.phase = col * 1.3;
    this.img.setDepth(warstwy.enemy);
  }

  update(_dt: number, t: number) {
    const chce = this.y0 + Math.sin(t * 1.6 + this.phase) * 72;
    this.y = Phaser.Math.Clamp(chce, this.minY, this.maxY);
    const cyc = (t + this.phase) % 3.5;
    const big = cyc > 2.5;
    if (big !== this.big) {
      this.big = big;
      this.img.setTexture(big ? 'puffer_big' : 'puffer');
      this.hw = this.hh = big ? 44 : 28;
      this.img.setScale(big ? 0.6 : 1.2);
      this.scene.tweens.add({ targets: this.img, scale: 1, duration: 260, ease: 'Back.Out' });
    }
    this.img.setPosition(this.x, this.y);
    this.img.setRotation(Math.sin(t * 2 + this.phase) * 0.08);
  }
}
