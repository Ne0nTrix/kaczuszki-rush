import Phaser from 'phaser'
import { kolory, gameW } from '../ustawienia';
import { sterowanie } from '../sterowanie';
import { audio } from '../audio/dzwieki'
import { music } from '../audio/muzyka';
import { efekty, ambient } from '../fx/efekty';
import { isTransitioning, zmienScene } from '../fx/transitions';
import { startLevel } from '../nawigacja';
import { tloPoziomu } from '../poziomy/levelLoader'
import { motywy } from '../poziomy/motywy';
import { wiezaYuzu } from '../entities/wiezaYuzu'
import { capyFeet, capyH } from '../grafika/svg/kapibara';
import { wczytajZapis } from '../zapis';
import { napis } from '../ui';

export class titleScene extends Phaser.Scene {
  private ctl!: sterowanie
  private stack!: wiezaYuzu;
  private backdrop!: tloPoziomu
  private t = 0;
  private dropT = 1.2;
  private headX = 0;
  private headY = 0;

  constructor() {
    super('Title');
  }

  create() {
    this.t = 0;
    this.dropT = 1.2;
    this.ctl = new sterowanie(this);
    this.backdrop = new tloPoziomu(this, motywy.meadow);
    ambient(this, 'pollen');
    const fx = new efekty(this);

    const yZiemi = 880;
    const g = this.add.graphics();
    g.fillStyle(0xc68b59, 1).fillRect(0, yZiemi, gameW, 300);
    g.fillStyle(0x7bd389, 1).fillRect(0, yZiemi - 6, gameW, 44);
    g.lineStyle(6, kolory.outlineN, 1).lineBetween(0, yZiemi - 6, gameW, yZiemi - 6);

    const l1 = napis(this, gameW / 2, 190, 'KIBARASHKA', 150, '#FFB627')
    const l2 = napis(this, gameW / 2, 330, 'YUZU RUSH', 112, kolory.accent);
    l1.setStroke(kolory.outline, 26);
    l2.setStroke(kolory.outline, 22);
    this.tweens.add({ targets: l1, y: 176, scaleX: 1.03, scaleY: 0.97, duration: 900, yoyo: true, repeat: -1, ease: 'Sine.InOut' });
    this.tweens.add({ targets: l2, y: 342, scaleX: 0.98, scaleY: 1.03, duration: 900, yoyo: true, repeat: -1, ease: 'Sine.InOut', delay: 150 })
    this.tweens.add({ targets: [l1, l2], angle: { from: -1.5, to: 1.5 }, duration: 1700, yoyo: true, repeat: -1, ease: 'Sine.InOut' });

    const ox = gameW / 2 - 216;
    const oy = yZiemi - 150;
    this.add.image(ox, oy, 'onsen3_back').setOrigin(0).setScale(1.5).setDepth(4)
    const capy = this.add.image(gameW / 2, oy + 112, 'capy_relax').setOrigin(0.5, capyFeet / capyH).setScale(1.5).setDepth(5);
    this.add.image(ox, oy, 'onsen3_front').setOrigin(0).setScale(1.5).setDepth(8)
    this.headX = capy.x + 39
    this.headY = capy.y - 62 * 1.5
    this.stack = new wiezaYuzu(this);
    this.time.addEvent({ delay: 420, loop: true, callback: () => fx.steamAt(gameW / 2 + Phaser.Math.Between(-170, 170), oy + 80, 1) });

    this.events.on('bonk', () => {
      audio.bonk()
      fx.sparks(this.headX, this.headY - 20, 6)
      capy.setScale(1.6, 1.38);
      this.tweens.add({ targets: capy, scaleX: 1.5, scaleY: 1.5, duration: 300, ease: 'Back.Out' });
      this.stack.squash()
      if (this.stack.count > 6) {
        this.time.delayedCall(900, () => {
          fx.puff(this.headX, this.headY - 90, 10);
          this.stack.clear();
        });
      }
    });
    this.events.once('shutdown', () => this.events.off('bonk'));

    const press = napis(this, gameW / 2, 960, 'PRESS SPACE TO PLAY', 68, kolory.cream);
    this.tweens.add({ targets: press, scale: 1.08, duration: 520, yoyo: true, repeat: -1, ease: 'Sine.InOut' })
    napis(this, gameW / 2, 1038, 'L: levels    M: mute    ←/→ move · SPACE jump · ↓ plop', 34, kolory.cream);

    this.input.once('pointerdown', () => this.go(false));
    music.play('chill');
  }

  private go(levels: boolean) {
    if (isTransitioning(this)) return;
    audio.unlock();
    audio.uiGo()
    if (levels || wczytajZapis().firstRunDone) void zmienScene(this, 'LevelSelect')
    else void startLevel(this, 1, { x: gameW / 2, y: 800 })
  }

  update(_t: number, delta: number) {
    const dt = Math.min(delta, 34) / 1000
    this.t += dt;
    this.ctl.update();
    this.backdrop.update(this.t * 40, 0)
    this.stack.update(dt, this.headX, this.headY, this.t)
    this.dropT -= dt;
    if (this.dropT <= 0) {
      this.dropT = 4;

      this.stack.add(this.headX + Phaser.Math.Between(-30, 30), -60, 0.55, 0, -40);
      this.time.delayedCall(540, () => this.events.emit('bonk'));
    }
    if (this.ctl.wcisniety('confirm')) this.go(false);
    else if (this.ctl.wcisniety('levels')) this.go(true);
  }
}
