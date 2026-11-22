import Phaser from 'phaser';
import { kolory, gameW } from '../ustawienia';
import { sterowanie } from '../sterowanie';
import { audio } from '../audio/dzwieki';
import { music } from '../audio/muzyka';
import { fajerwerki, efekty, ambient } from '../fx/efekty';
import { isTransitioning, zmienScene } from '../fx/transitions';
import { tloPoziomu } from '../poziomy/levelLoader';
import { motywy } from '../poziomy/motywy';
import { poziomy } from '../poziomy/index';
import { wiezaYuzu } from '../entities/wiezaYuzu';
import { capyFeet, capyH } from '../grafika/svg/kapibara';
import { formatujCzas, zapisDlaPoziomu } from '../zapis';
import { napis } from '../ui';

export class endingScene extends Phaser.Scene {
  private ctl!: sterowanie;
  private stack!: wiezaYuzu;
  private backdrop!: tloPoziomu;
  private fw!: fajerwerki;
  private t = 0;
  private fireT = 0.5;
  private head = { x: 0, y: 0 };
  private ready = false;

  constructor() {
    super('Ending');
  }

  create(): void {
    this.t = 0;
    this.ready = false;
    this.ctl = new sterowanie(this);
    this.backdrop = new tloPoziomu(this, motywy.night);
    this.fw = new fajerwerki(this);
    ambient(this, 'fireflies');
    const fx = new efekty(this);

    let yZiemi = 900;
    const g = this.add.graphics();
    g.fillStyle(0x3b3355, 1).fillRect(0, yZiemi, gameW, 300);
    g.fillStyle(0x4fd1c5, 1).fillRect(0, yZiemi - 6, gameW, 40);
    g.lineStyle(6, 0x15122a, 1).lineBetween(0, yZiemi - 6, gameW, yZiemi - 6);

    const skalaS = 2.6;
    const ox = gameW / 2 - 240 * skalaS;
    const oy = yZiemi - 96 * skalaS + 30;
    const yWody = oy + 66 * skalaS;
    this.add.image(ox, oy, 'onsen5_back').setOrigin(0).setScale(skalaS).setDepth(4);
    this.add.image(ox, oy, 'onsen5_front').setOrigin(0).setScale(skalaS).setDepth(8);

    const bobbers: Phaser.GameObjects.Image[] = [];
    const kolega = (key: string, x: number, dy: number, scale: number, flip = false) => {
      const im = this.add.image(x, yWody + dy, key).setScale(scale).setFlipX(flip).setDepth(5);
      bobbers.push(im);
      return im;
    };
    kolega('croc', gameW / 2 - 400, 0, 1.3);
    kolega('crab', gameW / 2 - 170, -34, 1.3);
    kolega('hedgehog', gameW / 2 + 200, -30, 1.3, true);
    kolega('puffer', gameW / 2 + 390, -24, 1.2, true);
    kolega('duck', gameW / 2 + 105, -4, 1.2).setDepth(9);
    let bee = this.add.image(gameW / 2 - 300, yWody - 190, 'bee').setDepth(9);
    this.tweens.add({ targets: bee, y: bee.y - 26, duration: 900, yoyo: true, repeat: -1, ease: 'Sine.InOut' });
    this.tweens.add({ targets: bee, x: bee.x + 60, duration: 2300, yoyo: true, repeat: -1, ease: 'Sine.InOut' });
    bobbers.forEach((b, i) => this.tweens.add({ targets: b, y: b.y + 8, angle: 3, duration: 1300 + i * 170, yoyo: true, repeat: -1, ease: 'Sine.InOut' }));

    const cloud = this.add.image(gameW / 2 + 330, yWody - 260, 'cloud').setScale(1.2).setDepth(9);
    this.tweens.add({ targets: cloud, y: cloud.y - 14, duration: 1500, yoyo: true, repeat: -1, ease: 'Sine.InOut' });
    this.add
      .particles(cloud.x, cloud.y + 50, 'p_drop', {
        x: { min: -70, max: 70 }, speedY: { min: 260, max: 340 }, lifespan: 800, scale: 0.6, alpha: { start: 0.9, end: 0.2 },
        frequency: 110, tint: 0x8fe3f0,
      })
      .setDepth(7);

    let capy = this.add.image(gameW / 2, yWody + 12, 'capy_relax').setOrigin(0.5, capyFeet / capyH).setScale(2).setDepth(6);
    this.head = { x: capy.x + 52, y: capy.y - 62 * 2 };
    this.stack = new wiezaYuzu(this);
    for (let i = 0; i < 7; i++) this.stack.add();
    this.time.addEvent({ delay: 300, loop: true, callback: () => fx.steamAt(gameW / 2 + Phaser.Math.Between(-520, 520), yWody, 1) });

    const t1 = napis(this, gameW / 2, 120, 'THE END', 140, '#FFB627');
    t1.setStroke(kolory.outline, 24);
    this.tweens.add({ targets: t1, y: 108, duration: 1000, yoyo: true, repeat: -1, ease: 'Sine.InOut' });
    napis(this, gameW / 2, 240, 'Everyone is unbothered now.', 52);

    let stars = 0;
    let time = 0;
    let all = true;
    poziomy.forEach((l) => {
      const s = zapisDlaPoziomu(l.id);
      stars += s.stars.filter(Boolean).length;
      if (s.najlepszyCzas === null) all = false;
      else time += s.najlepszyCzas;
    });
    napis(this, 330, 380, `★ ${stars} / ${poziomy.length * 3}`, 64, '#FFD166');
    napis(this, 330, 460, all ? `total best ${formatujCzas(time, true)}` : 'play every level for a total time', 36);
    const credits = napis(
      this, 330, 590,
      'art: SVG drawn in code\nsound: Web Audio synth\nengine: Phaser 3 · font: Fredoka',
      34,
    );
    credits.setLineSpacing(4);

    const press = napis(this, gameW / 2, 1030, 'PRESS SPACE', 56);
    press.setAlpha(0);
    this.time.delayedCall(1500, () => {
      this.ready = true;
      press.setAlpha(1);
      this.tweens.add({ targets: press, scale: 1.08, duration: 520, yoyo: true, repeat: -1, ease: 'Sine.InOut' });
    });
    this.input.on('pointerdown', () => this.leave());
    music.play('chill');
  }

  private leave(): void {
    if (!this.ready || isTransitioning(this)) return;
    audio.uiGo();
    void zmienScene(this, 'Title');
  }

  update(_t: number, delta: number): void {
    const dt = Math.min(delta, 34) / 1000;
    this.t += dt;
    this.ctl.update();
    this.backdrop.update(this.t * 20, 0);
    this.stack.update(dt, this.head.x, this.head.y, this.t);
    this.fireT -= dt;
    if (this.fireT <= 0) {
      this.fireT = 0.3 + Math.random() * 0.6;
      this.fw.wybuch(Phaser.Math.Between(120, 1800), Phaser.Math.Between(80, 520));
      audio.firework();
    }
    if (this.ctl.wcisniety('confirm') || this.ctl.wcisniety('back')) this.leave();
  }
}
