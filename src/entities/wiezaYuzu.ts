import Phaser from 'phaser';
import { kolory, warstwy, stackCfg } from '../ustawienia';
import { napis } from '../ui';

interface elementWiezy {
  img: Phaser.GameObjects.Image;
  cx: number;
  cy: number;

  t: number;
  dur: number;
  fx: number;
  fy: number;
  arc: number;
}

export class wiezaYuzu {
  count = 0;
  private elementy: elementWiezy[] = [];
  private odstep = stackCfg.rozstaw;
  private sp = { v: stackCfg.rozstaw };
  private plakietka: Phaser.GameObjects.Text;
  private tween?: Phaser.Tweens.Tween;
  private ax = 0;
  private ay = 0;

  constructor(private scene: Phaser.Scene) {
    this.plakietka = napis(scene, 0, 0, '', 34, kolory.cream).setDepth(warstwy.stack + 2).setVisible(false);
  }

  add(fromX?: number, fromY?: number, dur = 0.15, delay = 0, arc = 40) {
    this.count++;
    if (this.elementy.length < stackCfg.maxWidocznych) {
      const top = this.szczyt();
      const x = fromX ?? top.x;
      const y = fromY ?? top.y;
      const img = this.scene.add.image(x, y, 'yuzu').setDepth(warstwy.stack);
      this.elementy.push({ img, cx: top.x, cy: top.y - this.odstep, t: fromX === undefined ? dur : -delay, dur, fx: x, fy: y, arc });
    }
    this.refresh();
  }

  private refresh() {
    const extra = this.count - this.elementy.length;
    this.plakietka.setVisible(extra > 0);
    if (extra > 0) this.plakietka.setText(`+${extra}`);
  }

  zabierz(n: number): number {
    const k = Math.min(n, this.count);
    this.count -= k;
    while (this.elementy.length > this.count) this.elementy.pop()!.img.destroy();
    this.refresh();
    return k;
  }

  clear() {
    this.zabierz(this.count);
  }

  szczyt(): { x: number; y: number } {
    const it = this.elementy[this.elementy.length - 1];
    return it ? { x: it.cx, y: it.cy } : { x: this.ax, y: this.ay + this.odstep };
  }

  squash() {
    this.tween?.stop();
    this.sp.v = stackCfg.zgniecione;
    this.tween = this.scene.tweens.add({ targets: this.sp, v: stackCfg.rozstaw, duration: 520, ease: 'Elastic.Out' });
  }

  update(dt: number, ax: number, ay: number, time: number) {
    this.ax = ax;
    this.ay = ay;

    const n = this.elementy.length;
    this.odstep = this.sp.v * (n <= 12 ? 1 : Math.max(0.66, 1 - (n - 12) * 0.019));
    const f = dt * 60;
    let px = ax;
    let py = ay + this.odstep;
    for (let i = 0; i < this.elementy.length; i++) {
      const it = this.elementy[i];
      const k = 1 - Math.pow(1 - Math.max(0.25, 0.55 - i * 0.012), f);
      const tx = px + Math.sin(time * 2.2 + i * 0.35) * i * 0.3;
      const ty = py - this.odstep;
      it.cx += (tx - it.cx) * k;
      it.cx = Phaser.Math.Clamp(it.cx, px - 9, px + 9);
      it.cy += (ty - it.cy) * (1 - Math.pow(0.25, f));
      const rot = (it.cx - px) * 0.02 + Math.sin(time * 3 + i * 0.6) * 0.04;
      if (it.t < it.dur) {
        it.t += dt;
        const p = Phaser.Math.Clamp(it.t / it.dur, 0, 1);
        it.img.setPosition(it.fx + (it.cx - it.fx) * p, it.fy + (it.cy - it.fy) * p - Math.sin(p * Math.PI) * it.arc);
        it.img.setRotation(p * Math.PI * 2);
      } else {
        it.img.setPosition(it.cx, it.cy);
        it.img.setRotation(rot);
      }
      px = it.cx;
      py = it.cy;
    }
    if (this.plakietka.visible) this.plakietka.setPosition(px + 44, py - 26);
  }
}
