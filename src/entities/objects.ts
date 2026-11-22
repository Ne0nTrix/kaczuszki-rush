import Phaser from "phaser";
import { kolory, warstwy, fizyka, kafel } from "../ustawienia";
import { audio } from "../audio/dzwieki";
import { panel, napis } from "../ui";
import { wolnePola } from "./wrogowie";
import type { gameScene } from "../sceny/gra";

export interface platforma {
  x: number;
  top: number;
  w: number;
  prevTop: number;
  dx: number;
  aktywny: boolean;
  bounce?: number;
  onLand?(): void;
  update(dt: number, t: number): void;
}

export class ruchomaPlatforma implements platforma {
  x: number;
  top: number;
  w = kafel * 2;
  prevTop: number;
  dx = 0;
  aktywny = true;
  private min: number;
  private max: number;
  private dir = 1;
  private pause = 0;
  private img: Phaser.GameObjects.Image;

  constructor(scene: gameScene, col: number, row: number, private pionowa: boolean, key: string) {
    this.x = col * kafel;
    this.top = row * kafel;
    this.prevTop = this.top;
    const w = scene.world;
    if (pionowa) {
      const up = Math.min(wolnePola(w, col, row, 0, -1).n, wolnePola(w, col + 1, row, 0, -1).n);
      const down = Math.min(wolnePola(w, col, row, 0, 1).n, wolnePola(w, col + 1, row, 0, 1).n);
      this.min = this.top - up * kafel;
      this.max = this.top + down * kafel;
    } else {
      this.min = this.x - wolnePola(w, col, row, -1, 0).n * kafel;
      this.max = this.x + wolnePola(w, col + 1, row, 1, 0).n * kafel;
    }
    this.img = scene.add.image(this.x, this.top, key).setOrigin(0, 0.08).setDepth(warstwy.obj);
  }

  update(dt: number): void {
    this.prevTop = this.top;
    this.dx = 0;
    if (this.min === this.max) return;
    if (this.pause > 0) {
      this.pause -= dt;
      return;
    }
    const step = 110 * dt * this.dir; // px/s, TODO wyniesc do ustawien
    let pos = (this.pionowa ? this.top : this.x) + step;
    if (pos >= this.max) {
      pos = this.max;
      this.dir = -1;
      this.pause = 0.3;
    } else if (pos <= this.min) {
      pos = this.min;
      this.dir = 1;
      this.pause = 0.3;
    }
    if (this.pionowa) this.top = pos;
    else {
      this.dx = pos - this.x;
      this.x = pos;
    }
    this.img.setPosition(this.x, this.top);
  }
}

// krokodyl = platforma ktora spi dopoki sie na nia nie wskoczy
export class krokodyl implements platforma {
  x: number;
  top: number;
  w = kafel * 2;
  prevTop: number;
  dx = 0;
  aktywny = true;
  started = false;
  private min: number;
  private max: number;
  private dir = 1;
  private pause = 0;
  private img: Phaser.GameObjects.Image;
  private zT = 1;

  constructor(private scene: gameScene, col: number, row: number) {
    this.x = col * kafel;
    this.top = row * kafel + 14;
    this.prevTop = this.top;
    const w = scene.world;
    let l = 0;
    while (w.ch(col - l - 1, row) === '~' && !w.limit(col - l - 1, row)) l++;
    let r = 0;
    while (w.ch(col + 2 + r, row) === '~' && !w.limit(col + 2 + r, row)) r++;
    this.min = this.x - l * kafel;
    this.max = this.x + r * kafel;
    if (r === 0) this.dir = -1;
    this.img = scene.add.image(this.x, this.top, 'croc').setOrigin(0.5, 22 / 88).setDepth(warstwy.objBack);
    this.place(0);
  }

  private place(t: number): void {
    this.img.setPosition(this.x + kafel, this.top + Math.sin(t * 2) * 1.5).setFlipX(this.dir < 0);
  }

  onLand(): void {
    if (!this.started) {
      this.started = true;
      this.scene.fx.text(this.x + kafel, this.top - 40, '!', kolory.cream, 44);
      this.scene.fx.splash(this.x + kafel, this.top + 10, 6);
    }
  }

  update(dt: number, t: number): void {
    this.prevTop = this.top;
    this.dx = 0;
    if (!this.started) {
      this.zT -= dt;
      if (this.zT <= 0 && this.scene.naEkranie(this.x)) {
        this.zT = 1.6;
        this.scene.fx.text(this.x + kafel * 1.6, this.top - 30, 'z', '#FFFFFF', 28);
      }
      this.place(t);
      return;
    }
    if (this.min === this.max) return;
    if (this.pause > 0) {
      this.pause -= dt;
      this.place(t);
      return;
    }
    let pos = this.x + 140 * dt * this.dir;
    if (pos >= this.max) {
      pos = this.max;
      this.dir = -1;
      this.pause = 0.5;
    } else if (pos <= this.min) {
      pos = this.min;
      this.dir = 1;
      this.pause = 0.5;
    }
    this.dx = pos - this.x;
    this.x = pos;
    this.place(t);
  }
}

export class kruchaPlatforma implements platforma {
  x: number;
  top: number;
  w = kafel;
  prevTop: number;
  dx = 0;
  aktywny = true;
  private state = 0;
  private timer = 0;
  private img: Phaser.GameObjects.Image;

  constructor(private scene: gameScene, col: number, row: number, key: string) {
    this.x = col * kafel;
    this.top = row * kafel;
    this.prevTop = this.top;
    this.img = scene.add.image(this.x + kafel / 2, this.top, key).setOrigin(0.5, 0.1).setDepth(warstwy.obj);
  }

  onLand(): void {
    if (this.state !== 0) return;
    this.state = 1;
    this.timer = 0.35;
    audio.crumble();
  }

  reset(): void {
    this.scene.tweens.killTweensOf(this.img);
    this.state = 0;
    this.aktywny = true;
    this.img.setPosition(this.x + kafel / 2, this.top).setAlpha(1).setScale(1).setAngle(0);
  }

  update(dt: number): void {
    if (this.state === 1) {
      this.timer -= dt;
      this.img.x = this.x + kafel / 2 + (Math.random() - 0.5) * 8;
      if (this.timer <= 0) {
        this.state = 2;
        this.aktywny = false;
        this.timer = 3;
        this.scene.fx.puff(this.x + kafel / 2, this.top + 20, 5);
        this.scene.tweens.add({ targets: this.img, y: this.top + 260, alpha: 0, angle: 30, duration: 420, ease: 'Quad.In' });
      }
    } else if (this.state === 2) {
      this.timer -= dt;
      if (this.timer <= 0) {
        this.reset();
        this.img.setScale(0.2);
        this.scene.tweens.add({ targets: this.img, scale: 1, duration: 260, ease: 'Back.Out' });
        if (this.scene.naEkranie(this.x)) audio.pop();
      }
    }
  }
}

export class chmuraBurzowa implements platforma {
  x: number;
  top: number;
  w = 124;
  prevTop: number;
  dx = 0;
  aktywny = true;
  bounce = fizyka.cloudBounce;
  razi = false;
  bolt: { x: number; y: number; w: number; h: number };
  private cx: number;
  private cy: number;
  private img: Phaser.GameObjects.Image;
  private g: Phaser.GameObjects.Graphics;
  private offset: number;
  private redraw = 0;
  private warnT = 0;
  private wasZap = false;

  constructor(private scene: gameScene, col: number, row: number, index: number) {
    this.cx = col * kafel + kafel / 2;
    this.cy = row * kafel + kafel / 2;
    this.x = this.cx - this.w / 2;
    this.top = this.cy - 30;
    this.prevTop = this.top;
    this.offset = index * 1.0;
    const w = scene.world;
    let r = row + 1;
    while (r < w.h && !w.floor(col, r)) r++;
    const yZiemi = r * kafel;
    this.bolt = { x: this.cx - 24, y: this.cy + 30, w: 48, h: yZiemi - this.cy - 30 };
    this.g = scene.add.graphics().setDepth(warstwy.enemy - 1);
    this.img = scene.add.image(this.cx, this.cy, 'cloud').setDepth(warstwy.enemy);
  }

  onLand(): void {
    audio.hmph();
    this.scene.fx.text(this.cx, this.cy - 70, 'hmph!', kolory.cream, 36);
    this.img.setScale(1.25, 0.7);
    this.scene.tweens.add({ targets: this.img, scaleX: 1, scaleY: 1, duration: 300, ease: 'Back.Out' });
  }

  update(dt: number, t: number): void {
    const cyc = (t + this.offset) % 3;
    const ostrzezenie = cyc >= 1.8 && cyc < 2.5;
    const zap = cyc >= 2.5;
    const widziane = this.scene.naEkranie(this.cx);
    this.razi = zap;
    this.img.y = this.cy + Math.sin(t * 2 + this.offset) * 4;
    if (ostrzezenie) {
      this.img.setTexture(Math.floor(cyc * 14) % 2 ? 'cloud_zap' : 'cloud');
      this.img.x = this.cx + (Math.random() - 0.5) * 6;
      this.warnT -= dt;
      if (this.warnT <= 0 && widziane) {
        this.warnT = 0.12;
        audio.zapWarn();
        this.scene.fx.sparks(this.cx + (Math.random() - 0.5) * 100, this.cy + 40, 1);
      }
    } else {
      this.img.x = this.cx;
      this.img.setTexture(zap ? 'cloud_zap' : 'cloud');
    }
    if (zap) {
      if (!this.wasZap && widziane) {
        audio.zap();
        this.scene.fx.trzesienie(0.004, 120);
        this.scene.fx.sparks(this.cx, this.bolt.y + this.bolt.h, 8);
      }
      this.redraw -= dt;
      if (this.redraw <= 0) {
        this.redraw = 0.05;
        this.drawBolt();
      }
    } else if (this.wasZap) {
      this.g.clear();
    }
    this.wasZap = zap;
  }

  private drawBolt(): void {
    const g = this.g;
    const b = this.bolt;
    g.clear();
    const pts: number[][] = [[this.cx, b.y]];
    const n = Math.max(3, Math.round(b.h / 70));
    for (let i = 1; i < n; i++) pts.push([this.cx + (Math.random() - 0.5) * 44, b.y + (b.h * i) / n]);
    pts.push([this.cx + (Math.random() - 0.5) * 16, b.y + b.h]);
    const stroke = (wd: number, col: number, a: number) => {
      g.lineStyle(wd, col, a);
      g.beginPath();
      g.moveTo(pts[0][0], pts[0][1]);
      for (let i = 1; i < pts.length; i++) g.lineTo(pts[i][0], pts[i][1]);
      g.strokePath();
    };
    stroke(26, 0xfff3b0, 0.35);
    stroke(14, kolory.outlineN, 1);
    stroke(8, 0xffe066, 1);
    stroke(3, 0xffffff, 1);
  }
}

export class sprezyna {
  rect: { x: number; y: number; w: number; h: number };
  cx: number;
  private img: Phaser.GameObjects.Image;

  constructor(private scene: gameScene, col: number, row: number, key: string) {
    this.cx = col * kafel + kafel / 2;
    this.rect = { x: col * kafel + 12, y: row * kafel + 20, w: 72, h: 46 };
    this.img = scene.add.image(this.cx, (row + 1) * kafel, key).setOrigin(0.5, 1).setDepth(warstwy.obj);
  }

  fire(): void {
    audio.sproing();
    this.scene.fx.stars(this.cx, this.rect.y, 8);
    this.scene.tweens.killTweensOf(this.img);
    this.img.setScale(1.3, 0.55);
    this.scene.tweens.add({ targets: this.img, scaleX: 1, scaleY: 1, duration: 520, ease: 'Elastic.Out' });
  }
}

export class punktKontrolny {
  aktywny = false;
  x: number;
  y: number;
  col: number;
  rect: { x: number; y: number; w: number; h: number };
  private img: Phaser.GameObjects.Image;

  constructor(private scene: gameScene, col: number, row: number, private kind: 'towel' | 'lantern') {
    this.col = col;
    this.x = col * kafel + kafel / 2;
    this.y = (row + 1) * kafel - fizyka.hitH / 2;
    this.rect = { x: col * kafel, y: (row - 1) * kafel, w: kafel, h: kafel * 2 };
    this.img = scene.add.image(this.x, (row + 1) * kafel, `${kind}_off`).setOrigin(0.5, 1).setDepth(warstwy.objBack);
  }

  activate(cicho = false): void {
    if (this.aktywny) return;
    this.aktywny = true;
    this.img.setTexture(`${this.kind}_on`);
    if (cicho) return;
    audio.checkpoint();
    this.scene.fx.stars(this.x, this.img.y - 150, 14);
    this.scene.fx.text(this.x, this.img.y - 230, 'CHECKPOINT!', kolory.cream, 40);
    this.img.setScale(1.25, 0.8);
    this.scene.tweens.add({ targets: this.img, scaleX: 1, scaleY: 1, duration: 420, ease: 'Elastic.Out' });
  }
}

export class tabliczka {
  private bubble: Phaser.GameObjects.Container;
  private pokazany = false;
  private half: number;
  x: number;
  y: number;

  constructor(private scene: gameScene, col: number, row: number, text: string) {
    this.x = col * kafel + kafel / 2;
    this.y = row * kafel + kafel / 2;
    scene.add.image(this.x, (row + 1) * kafel, 'sign').setOrigin(0.5, 1).setDepth(warstwy.objBack);
    const t = napis(scene, 0, 0, text, 36, kolory.outline, false);
    const bg = panel(scene, t.width + 40, t.height + 20, kolory.creamN, 24);
    this.half = (t.width + 40) / 2;
    this.bubble = scene.add.container(this.x, row * kafel - 70, [bg, t]).setDepth(warstwy.text).setScale(0).setVisible(false);
  }

  update(px: number, py: number): void {
    const near = Math.abs(px - this.x) < kafel * 1.5 && Math.abs(py - this.y) < kafel * 2;
    if (near === this.pokazany) return;
    this.pokazany = near;
    this.scene.tweens.killTweensOf(this.bubble);
    if (near) {
      this.bubble.setVisible(true);
      this.bubble.x = Math.max(this.x, 30 + this.half);
      this.scene.tweens.add({ targets: this.bubble, scale: 1, duration: 220, ease: 'Back.Out' });
    } else {
      this.scene.tweens.add({ targets: this.bubble, scale: 0, duration: 140, onComplete: () => this.bubble.setVisible(false) });
    }
  }
}

export class sekretnaSciana {
  komorki = new Set<number>();
  images: (Phaser.GameObjects.Image | Phaser.GameObjects.TileSprite)[] = [];
  private alpha = 1;
  private hintT = 2;
  private pts: { x: number; y: number }[] = [];

  constructor(private scene: Phaser.Scene) {}

  addCell(key: number, x: number, y: number, img: Phaser.GameObjects.Image | Phaser.GameObjects.TileSprite): void {
    this.komorki.add(key);
    this.images.push(img);
    this.pts.push({ x, y });
  }

  update(dt: number, wSrodku: boolean, sparkle: (x: number, y: number) => void): void {
    const cel = wSrodku ? 0.25 : 1;
    if (this.alpha !== cel) {
      this.alpha += (cel - this.alpha) * Math.min(1, dt * 10);
      if (Math.abs(this.alpha - cel) < 0.01) this.alpha = cel;
      this.images.forEach((i) => i.setAlpha(this.alpha));
    }

    this.hintT -= dt;
    if (this.hintT <= 0) {
      this.hintT = 3;
      if (!wSrodku) {
        const p = this.pts[Math.floor(Math.random() * this.pts.length)];
        sparkle(p.x, p.y);
      }
    }
    for (const i of this.images) {
      if (i instanceof Phaser.GameObjects.TileSprite) i.tilePositionY -= dt * 260;
    }
  }
}
