import Phaser from 'phaser';
import { warstwy, fizyka, kafel } from '../ustawienia';
import { audio } from '../audio/dzwieki';
import { capyFeet, capyH } from '../grafika/svg/kapibara';
import type { sterowanie } from '../sterowanie';
import type { gameScene } from '../sceny/gra';
import type { platforma } from './objects';
import { lerp } from '../utils';

const polSzer = fizyka.hitW / 2;
const polWys = fizyka.hitH / 2;
const zblizDo = (v: number, cel: number, d: number) => (v < cel ? Math.min(v + d, cel) : Math.max(v - d, cel));

export class gracz {
  x: number;
  y: number;
  vx = 0;
  vy = 0;
  kierunek = 1;
  naZiemi = false;
  wWodzie = false;

  plop = 0;
  private plopT = 0;
  private coyote = 0;
  private buforSkoku = 0;
  private skacze = false;
  nietykalny = 0;
  melon = 0;
  bezczynnosc = 0;
  combo = 0;
  zablokowany = false;
  jedzieNa: platforma | null = null;
  pose: string | null = null;
  prevBottom = 0;
  surfaceY = 0;

  img: Phaser.GameObjects.Image;
  cien: Phaser.GameObjects.Ellipse;
  sq = { x: 1, y: 1 };
  private sqTween?: Phaser.Tweens.Tween;
  private runT = 0;
  private dustT = 0;
  private trailT = 0;
  private spin = 0;
  private hue = 0;
  private zT = 0;
  private bob = 0;
  private bird?: Phaser.GameObjects.Image;
  private blinkT = 0;
  // zostalo po starym graczu, na razie nie uzywane
  private podwojnySkok = false;
  zycia = 3;

  constructor(private scene: gameScene, x: number, y: number) {
    this.x = x;
    this.y = y;
    this.cien = scene.add.ellipse(x, y, 84, 16, 0x000000, 0.16).setDepth(warstwy.player - 1);
    this.img = scene.add.image(x, y, 'capy_idle').setDepth(warstwy.player);
  }

  get bottom(): number {
    return this.y + polWys;
  }
  get box() {
    return { x: this.x - polSzer, y: this.y - polWys, w: polSzer * 2, h: polWys * 2 };
  }

  get headX(): number {
    if (this.plop) return this.x;
    return this.x + this.kierunek * 26 * this.sq.x;
  }
  get headY(): number {
    if (this.plop) return this.y - 46;
    // 62 i 93 dobrane na oko zeby wieza siedziala na glowie a nie w niej
    return this.y + polWys + 2 - this.bob - (this.pose === 'capy_relax' ? 62 : 93) * this.sq.y;
  }

  update(dt: number, ctl: sterowanie): void {
    const s = this.scene;
    const w = s.world;
    if (this.nietykalny > 0) this.nietykalny -= dt;
    if (this.melon > 0) {
      this.melon -= dt;
      if (this.melon <= 0) s.onMelonEnd();
    }
    if (this.zablokowany) {
      this.odswiezWyglad(dt);
      return;
    }

    if (this.jedzieNa) {
      const p = this.jedzieNa;
      if (p.aktywny && this.x + polSzer > p.x && this.x - polSzer < p.x + p.w) {
        if (p.dx) this.ruchX(p.dx);
        this.y = p.top - polWys;
      } else {
        this.jedzieNa = null;
      }
    }

    const bylWWodzie = this.wWodzie;
    const cc = Math.floor(this.x / kafel);
    const cr = Math.floor(this.y / kafel);
    this.wWodzie = false;
    if (w.water(cc, cr)) {
      let r = cr;
      while (w.water(cc, r - 1)) r--;
      this.surfaceY = r * kafel + 22;
      this.wWodzie = this.y > this.surfaceY - 6;
    }
    if (this.wWodzie && !bylWWodzie) {
      if (this.vy > 250) {
        s.fx.splash(this.x, this.surfaceY, 12);
        audio.smallSplash();
      }
      this.vy *= 0.35;
      this.plop = 0;
      this.spin = 0;
      this.combo = 0;
    }

    const dir = ctl.osX;
    if (dir) this.kierunek = dir;
    //const max = fizyka.predkoscBiegu * (this.melon > 0 ? 1.4 : 1);
    const max = fizyka.predkoscBiegu * (this.melon > 0 ? fizyka.melonSpeed : 1) * (this.wWodzie ? fizyka.waterSpeed : 1);
    if (this.plop) {
      this.vx = 0;
    } else {
      const acc = this.naZiemi ? (dir ? fizyka.groundAccel : fizyka.groundDecel) : dir ? fizyka.airAccel : fizyka.airDecel;
      this.vx = zblizDo(this.vx, dir * max, acc * dt);
    }

    if (ctl.wcisniety('jump')) this.buforSkoku = fizyka.jumpBuffer;
    else this.buforSkoku -= dt;
    this.coyote = this.naZiemi ? fizyka.coyoteTime : this.coyote - dt;
    if (this.wWodzie) {
      if (ctl.wcisniety('jump')) {
        const przyPowierzchni = this.y - this.surfaceY < 50;
        this.vy = przyPowierzchni ? fizyka.swimExitVelocity : fizyka.swimVelocity;
        this.skacze = !przyPowierzchni;
        this.buforSkoku = 0;
        this.naZiemi = false;
        this.jedzieNa = null;
        s.fx.babelki(this.x, this.y, 4);
        audio.swim();
        if (przyPowierzchni) s.fx.splash(this.x, this.surfaceY, 8);
        this.stretch(0.88, 1.15);
      }
    } else if (this.buforSkoku > 0 && this.coyote > 0 && !this.plop) {
      this.vy = fizyka.silaSkoku;
      this.skacze = true;
      this.naZiemi = false;
      this.jedzieNa = null;
      this.coyote = 0;
      this.buforSkoku = 0;
      s.fx.puff(this.x, this.bottom, 4);
      audio.jump();
      this.stretch(0.85, 1.2);
    }
    // puszczenie skoku = nizszy skok
    if (this.skacze && this.vy < 0 && !ctl.trzyma('jump')) {
      this.vy *= fizyka.jumpCut;
      this.skacze = false;
    }
    if (this.vy >= 0) this.skacze = false;

    if (!this.naZiemi && !this.wWodzie && this.plop === 0 && this.coyote <= 0 && ctl.wcisniety('down')) {
      this.plop = 1;
      this.plopT = fizyka.plopHang;
      this.spin = 0;
      this.skacze = false;
      audio.whoosh();
    }
    if (this.plop === 1) {
      this.plopT -= dt;
      this.vy = 0;
      this.spin += (Math.PI * 2 * dt) / fizyka.plopHang;
      if (this.plopT <= 0) {
        this.plop = 2;
        this.spin = 0;
      }
    }
    if (this.plop === 2) {
      this.vy = fizyka.plopSpeed;
    } else if (this.plop === 0) {
      if (this.wWodzie) this.vy = Math.min(this.vy + fizyka.grawitacja * fizyka.grawitacjaWody * dt, fizyka.waterMaxFall);
      else this.vy = Math.min(this.vy + fizyka.grawitacja * dt, fizyka.maxSpadanie);
    }

    const bylNaZiemi = this.naZiemi;
    const vyPrzed = this.vy;
    this.naZiemi = false;
    this.ruchX(this.vx * dt);
    this.ruchY(this.vy * dt);
    if (this.naZiemi && !bylNaZiemi) this.land(vyPrzed);

    if (this.naZiemi && !ctl.trzyma('any') && Math.abs(this.vx) < 5) this.bezczynnosc += dt;
    else this.obudz();

    if (this.naZiemi && Math.abs(this.vx) > 220) {
      this.dustT -= dt;
      if (this.dustT <= 0) {
        this.dustT = 0.15;
        s.fx.puff(this.x - this.kierunek * 30, this.bottom, 1);
      }
    }
    if (this.wWodzie && (Math.abs(this.vx) > 60 || Math.abs(this.vy) > 120)) {
      this.dustT -= dt;
      if (this.dustT <= 0) {
        this.dustT = 0.22;
        s.fx.babelki(this.x - this.kierunek * 20, this.y, 1);
      }
    }
    this.odswiezWyglad(dt);
  }

  // kolizje robione recznie, osobno x i osobno y (arcade physics sie gryzlo z one-way platformami)
  private ruchX(dx: number): void {
    if (!dx) return;
    const w = this.scene.world;
    this.x += dx;
    const top = Math.floor((this.y - polWys) / kafel);
    const bot = Math.floor((this.y + polWys - 0.01) / kafel);
    if (dx > 0) {
      const c = Math.floor((this.x + polSzer) / kafel);
      for (let r = top; r <= bot; r++) {
        if (w.twardy(c, r)) {
          this.x = c * kafel - polSzer - 0.01; // bez tego 0.01 wchodzil w sciane
          this.vx = Math.min(this.vx, 0);
          break;
        }
      }
    } else {
      const c = Math.floor((this.x - polSzer) / kafel);
      for (let r = top; r <= bot; r++) {
        if (w.twardy(c, r)) {
          this.x = (c + 1) * kafel + polSzer;
          this.vx = Math.max(this.vx, 0);
          break;
        }
      }
    }
  }

  private ruchY(dy: number): void {
    let s = this.scene;
    let w = s.world;
    const prevBottom = this.y + polWys;
    this.prevBottom = prevBottom;
    this.y += dy;
    let c0 = Math.floor((this.x - polSzer) / kafel);
    let c1 = Math.floor((this.x + polSzer - 0.01) / kafel);
    if (dy < 0) {
      let r = Math.floor((this.y - polWys) / kafel);
      for (let c = c0; c <= c1; c++) {
        if (w.twardy(c, r)) {
          this.y = (r + 1) * kafel + polWys;
          this.vy = 0;
          this.skacze = false;
          break;
        }
      }
      return;
    }
    const bottom = this.y + polWys;
    const r = Math.floor(bottom / kafel);
    let yLadowania = Infinity;
    let plat: platforma | null = null;
    let trafilSciane = false;
    for (let c = c0; c <= c1; c++) {
      if (!w.twardy(c, r)) continue;
      if (this.plop === 2 && w.skrzynki.has(w.key(c, r))) {
        s.rozwalSkrzynke(c, r);
        continue;
      }
      trafilSciane = true;
    }
    if (trafilSciane) {
      yLadowania = r * kafel;
    } else {
      for (let c = c0; c <= c1; c++) {
        if (w.jednostronny(c, r) && prevBottom <= r * kafel + 0.01) yLadowania = r * kafel;
      }
    }
    for (const p of s.platformy) {
      if (!p.aktywny) continue;
      if (this.x + polSzer <= p.x || this.x - polSzer >= p.x + p.w) continue;
      if (prevBottom <= Math.max(p.prevTop, p.top) + 6 && bottom >= p.top && p.top < yLadowania) {
        yLadowania = p.top;
        plat = p;
      }
    }
    if (yLadowania === Infinity) return; // nic pod nogami
    this.y = yLadowania - polWys;
    if (plat && plat.bounce) {
      plat.onLand?.();
      this.bounce(plat.bounce);
      return;
    }
    this.vy = 0;
    this.naZiemi = true;
    this.jedzieNa = plat;
    if (plat) plat.onLand?.();
  }

  private land(v: number): void {
    const s = this.scene;
    let by = this.bottom;
    if (this.plop === 2) {
      s.fx.pierscien(this.x, by);
      s.fx.puff(this.x, by, 12);
      s.fx.trzesienie(0.01, 150);
      audio.thud();
      this.squash(1.45, 0.55);
      s.stack.squash();
    } else if (v > 420) {
      s.fx.puff(this.x, by, 6);
      audio.land();
      this.squash(1.3, 0.7);
      s.stack.squash();
    }
    this.plop = 0;
    this.spin = 0;
    this.combo = 0;
  }

  private tweenBack(dur: number): void {
    this.sqTween?.stop();
    this.sqTween = this.scene.tweens.add({ targets: this.sq, x: 1, y: 1, duration: dur, ease: 'Back.Out' });
  }
  squash(x: number, y: number): void {
    this.sq.x = x;
    this.sq.y = y;
    this.tweenBack(260);
  }
  stretch(x: number, y: number): void {
    this.sq.x = x;
    this.sq.y = y;
    this.tweenBack(300);
  }

  bounce(v: number): void {
    this.vy = v;
    this.naZiemi = false;
    this.jedzieNa = null;
    this.skacze = false;
    this.plop = 0;
    this.spin = 0;
    this.stretch(0.85, 1.2);
  }

  spring(cx: number): void {
    this.x = Phaser.Math.Clamp(this.x, cx - 10, cx + 10);
    this.vx *= 0.6;
    this.bounce(fizyka.springVelocity);
    this.stretch(0.7, 1.35);
  }

  odrzut(fromX: number): void {
    //console.log('odrzut', fromX, this.x);
    this.vy = -720;
    this.vx = (this.x < fromX ? -1 : 1) * 320;
    this.naZiemi = false;
    this.jedzieNa = null;
    this.plop = 0;
    this.spin = 0;
    this.skacze = false;
  }

  startArbuza(): void {
    this.melon = fizyka.czasArbuza;
    this.nietykalny = 0;
  }

  reset(x: number, y: number): void {
    this.x = x;
    this.y = y;
    this.vx = 0;
    this.vy = 0;
    this.plop = 0;
    this.spin = 0;
    this.combo = 0;
    this.jedzieNa = null;
    this.naZiemi = false;
    this.wWodzie = false;
    this.skacze = false;
    this.pose = null;
    this.melon = 0;
    this.img.setAngle(0);
  }

  // TODO ptak czasem odlatuje w zla strone jak kapibara patrzy w lewo
  private obudz(): void {
    if (this.bezczynnosc >= fizyka.sleepAfter && this.bird) {
      const b = this.bird;
      this.bird = undefined;
      b.setFlipX(false);
      this.scene.tweens.add({ targets: b, x: b.x + 500, y: b.y - 420, duration: 900, ease: 'Sine.In', onComplete: () => b.destroy() });
    }
    this.bezczynnosc = 0;
  }

  private odswiezWyglad(dt: number): void {
    const s = this.scene;
    let img = this.img;
    let key: string;
    this.bob = 0;
    if (this.pose) key = this.pose;
    else if (this.plop) key = 'capy_plop';
    else if (this.wWodzie) {
      this.runT += dt;
      key = Math.floor(this.runT / 0.2) % 2 ? 'capy_run_a' : 'capy_run_b';
    } else if (!this.naZiemi) key = this.vy < 0 ? 'capy_jump' : 'capy_fall';
    else if (Math.abs(this.vx) > 40) {
      this.runT += dt;
      key = Math.floor(this.runT / 0.12) % 2 ? 'capy_run_a' : 'capy_run_b';
      this.bob = Math.abs(Math.sin((this.runT / 0.12) * Math.PI)) * 4;
    } else if (this.bezczynnosc >= fizyka.sleepAfter) key = 'capy_sleep';
    else key = 'capy_idle';
    if (img.texture.key !== key) img.setTexture(key);
    img.setFlipX(this.kierunek < 0);

    if (this.plop && !this.pose) {
      img.setOrigin(0.5, 0.52);
      img.setPosition(this.x, this.y - 4);
      img.setRotation(this.spin * this.kierunek);
    } else {
      img.setOrigin(0.5, capyFeet / capyH);
      img.setPosition(this.x, this.y + polWys + 2 - this.bob);
      if (this.pose !== 'capy_dizzy') img.setRotation(0);
    }
    img.setScale(this.sq.x, this.sq.y);

    if (this.nietykalny > 0 && !this.zablokowany) {
      this.blinkT += dt;
      img.setAlpha(Math.floor(this.blinkT / 0.07) % 2 ? 0.35 : 1);
    } else img.setAlpha(1);

    this.cien.setVisible(this.naZiemi && !this.wWodzie && !this.pose);
    this.cien.setPosition(this.x, this.y + polWys + 2);

    if (this.melon > 0) {
      this.trailT -= dt;
      this.hue = (this.hue + dt * 1.6) % 1;
      const ending = this.melon < 1 && Math.floor(this.melon / 0.1) % 2 === 0;
      if (this.trailT <= 0 && !ending) {
        this.trailT = 0.035;
        const g = s.add.image(img.x, img.y, key).setDepth(warstwy.player - 1).setOrigin(img.originX, img.originY);
        g.setFlipX(img.flipX).setScale(img.scaleX, img.scaleY).setRotation(img.rotation).setAlpha(0.7);
        g.setTintFill(Phaser.Display.Color.HSVToRGB(this.hue, 0.6, 1).color);
        s.tweens.add({ targets: g, alpha: 0, duration: 320, onComplete: () => g.destroy() });
        if (Math.random() < 0.5) s.fx.sparks(this.x + Phaser.Math.Between(-40, 40), this.y + Phaser.Math.Between(-30, 30), 1);
      }
    }

    if (this.bezczynnosc >= fizyka.sleepAfter && !this.zablokowany) {
      this.zT -= dt;
      if (this.zT <= 0) {
        this.zT = 1.1;
        s.fx.text(this.x + this.kierunek * 50, this.y - 70, 'z', '#FFFFFF', 34);
      }
      let top = s.stack.szczyt();
      if (!this.bird) {
        this.bird = s.add.image(top.x - 500, top.y - 400, 'bird').setDepth(warstwy.stack + 1);
        s.tweens.add({ targets: this.bird, x: top.x, y: top.y - 26, duration: 900, ease: 'Sine.Out' });
      } else if (!s.tweens.isTweening(this.bird)) {
        this.bird.setPosition(top.x, top.y - 26 + Math.sin(s.time.now / 300) * 1.5);
      }
    }
  }

  destroyBird(): void {
    this.bird?.destroy();
    this.bird = undefined;
    this.bezczynnosc = 0;
  }
}
