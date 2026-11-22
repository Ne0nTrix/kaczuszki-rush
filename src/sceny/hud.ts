import Phaser from 'phaser';
import { kolory, gameH, gameW } from '../ustawienia';
import { formatujCzas } from '../zapis';
import { napis } from '../ui';
import type { gameScene } from './gra';

export class hudScene extends Phaser.Scene {
  private g!: gameScene;
  private count!: Phaser.GameObjects.Text;
  private icon!: Phaser.GameObjects.Image;
  private ducks: Phaser.GameObjects.Image[] = [];
  private timer!: Phaser.GameObjects.Text;
  private combo!: Phaser.GameObjects.Text;
  private glow!: Phaser.GameObjects.Graphics;
  private lastCount = -1;
  private lastCombo = 0;
  private lastDucks = '';

  constructor() {
    super('Hud');
  }

  init(data: { game: gameScene }) {
    this.g = data.game;
  }

  create() {
    const st = this.g.state;
    this.lastCount = -1;
    this.lastCombo = 0;
    this.lastDucks = '';
    this.glow = this.add.graphics();
    this.icon = this.add.image(70, 66, 'yuzu').setScale(1.9);
    this.count = napis(this, 124, 68, '', 56).setOrigin(0, 0.5);
    this.ducks = [0, 1, 2].map((i) => this.add.image(470 + i * 76, 66, 'duck').setScale(1.15));
    napis(this, gameW / 2, 60, `${st.level} · ${st.name.toUpperCase()}`, 40).setAlpha(0.95);
    this.timer = napis(this, gameW - 40, 66, '0:00.0', 56).setOrigin(1, 0.5);
    this.combo = napis(this, gameW - 40, 150, '', 72, kolory.accent).setOrigin(1, 0.5).setVisible(false);

    const baner = this.add.container(gameW / 2, -160);
    const tytul = napis(this, 0, 0, st.name.toUpperCase(), 110, '#FFB627');
    tytul.setStroke(kolory.outline, 20);
    const podtytul = napis(this, 0, 92, `LEVEL ${st.level}`, 48);
    baner.add([tytul, podtytul]);
    this.tweens.add({ targets: baner, y: 280, duration: 500, ease: 'Back.Out' });
    this.tweens.add({ targets: baner, y: -220, duration: 400, ease: 'Back.In', delay: 2200, onComplete: () => baner.destroy() });
  }

  update() {
    const g = this.g;
    const st = g.state;
    if (!g.stack) return;
    const n = st.delivered >= 0 ? st.delivered : g.stack.count;
    if (n !== this.lastCount) {
      this.lastCount = n;
      this.count.setText(`${n} / ${st.total}`);
      this.tweens.killTweensOf([this.count, this.icon]);
      this.count.setScale(1.3);
      this.icon.setScale(2.5);
      this.tweens.add({ targets: this.count, scale: 1, duration: 220, ease: 'Back.Out' });
      this.tweens.add({ targets: this.icon, scale: 1.9, duration: 220, ease: 'Back.Out' });
    }
    const dk = st.ducks.join();
    if (dk !== this.lastDucks) {
      this.lastDucks = dk;
      this.ducks.forEach((d, i) => {
        if (st.ducks[i]) {
          d.clearTint().setAlpha(1).setScale(1.8);
          this.tweens.add({ targets: d, scale: 1.15, duration: 400, ease: 'Bounce.Out' });
        } else d.setTintFill(0x3d2c2e).setAlpha(0.3);
      });
    }
    this.timer.setText(formatujCzas(st.time, true).slice(0, -1));
    const c = g.player.combo;
    if (c !== this.lastCombo) {
      this.lastCombo = c;
      this.combo.setVisible(c >= 2);
      if (c >= 2) {
        this.combo.setText(`x${c}!`).setScale(1.6);
        this.tweens.add({ targets: this.combo, scale: 1, duration: 260, ease: 'Back.Out' });
      }
    }

    this.glow.clear();
    const m = g.player.melon;
    if (m > 0 && !(m < 1 && Math.floor(m / 0.1) % 2 === 0)) {
      const col = Phaser.Display.Color.HSVToRGB((this.time.now / 700) % 1, 0.55, 1).color;
      for (let i = 0; i < 4; i++) {
        this.glow.lineStyle(26, col, 0.26 - i * 0.055).strokeRect(13 + i * 26, 13 + i * 26, gameW - 26 - i * 52, gameH - 26 - i * 52);
      }
    }
  }
}
