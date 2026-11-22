import Phaser from 'phaser';
import { warstwy } from '../ustawienia';

interface punkt {
  x: number;
  y: number;
  f: number
}

export class kaczuszki {
  private hist: punkt[] = [];
  ducks: Phaser.GameObjects.Image[] = [];

  constructor(private scene: Phaser.Scene) {}

  add(x: number, y: number) {
    this.ducks.push(this.scene.add.image(x, y, 'duck').setDepth(warstwy.duck));
  }

  update(px: number, bottom: number, facing: number, time: number) {
    const last = this.hist[0];
    if (!last || Math.abs(last.x - px) + Math.abs(last.y - bottom) >= 6) {
      this.hist.unshift({ x: px, y: bottom, f: facing });
      if (this.hist.length > 64) this.hist.pop();
    }
    this.ducks.forEach((d, i) => {
      const h = this.hist[Math.min(this.hist.length - 1, (i + 1) * 10)];
      if (!h) return
      d.x += (h.x - d.x) * 0.35;
      const ty = h.y - 22 - Math.abs(Math.sin(time * 9 + i * 1.3)) * 7
      d.y += (ty - d.y) * 0.5
      d.setFlipX(h.f < 0)
    })
  }

  teleport(x: number, bottom: number) {
    this.hist = [];
    this.ducks.forEach((d) => d.setPosition(x, bottom - 22))
  }
}
