import Phaser from 'phaser';
import { kolory, gameH, gameW } from '../ustawienia';
import { sterowanie } from '../sterowanie';
import { audio } from '../audio/dzwieki';
import { isTransitioning, zmienScene } from '../fx/transitions';
import { startLevel } from '../nawigacja';
import { przycisk, zrobPrzycisk, panel, napis } from '../ui';

export class pauseScene extends Phaser.Scene {
  private ctl!: sterowanie;
  private przyciski: przycisk[] = [];
  private akcje: (() => void)[] = [];
  private sel = 0;
  private level = 1;

  constructor() {
    super('Pause');
  }

  init(data: { level: number }) {
    this.level = data.level;
  }

  create() {
    this.ctl = new sterowanie(this);
    this.sel = 0;
    this.add.rectangle(0, 0, gameW, gameH, kolory.outlineN, 0.55).setOrigin(0);
    const box = this.add.container(gameW / 2, gameH / 2);
    box.add(panel(this, 760, 700));
    box.add(napis(this, 0, -270, 'Kibarashka is chilling…', 54, kolory.outline, false));
    box.add(this.add.image(0, -170, 'capy_sleep').setScale(1.2));
    box.setScale(0.6);
    this.tweens.add({ targets: box, scale: 1, duration: 240, ease: 'Back.Out' });

    const soundLabel = () => `Sound: ${audio.muted ? 'off' : 'on'}`;
    const defs: [string, () => void][] = [
      ['Resume', () => this.wznow()],
      ['Restart', () => void startLevel(this, this.level)],
      ['Levels', () => void zmienScene(this, 'LevelSelect', { sel: this.level - 1 })],
      [soundLabel(), () => {
        audio.przelaczWyciszenie();
        this.przyciski[3].label.setText(soundLabel());
      }],
    ];
    this.przyciski = [];
    this.akcje = [];
    defs.forEach(([label, fn], i) => {
      const b = zrobPrzycisk(this, 0, -50 + i * 100, 460, label, () => {
        this.sel = i;
        this.refresh();
        fn();
      });
      box.add(b.box);
      this.przyciski.push(b);
      this.akcje.push(fn);
    });
    this.refresh();
  }

  private refresh() {
    this.przyciski.forEach((b, i) => b.setSelected(i === this.sel));
  }

  private wznow() {
    this.scene.resume('Game');
    this.scene.stop();
  }

  update() {
    const ctl = this.ctl;
    ctl.update();
    if (isTransitioning(this)) return;
    const n = this.przyciski.length;
    if (ctl.wcisniety('up')) {
      this.sel = (this.sel + n - 1) % n;
      audio.ui();
      this.refresh();
    } else if (ctl.wcisniety('down')) {
      this.sel = (this.sel + 1) % n;
      audio.ui();
      this.refresh();
    }
    if (ctl.wcisniety('pause')) this.wznow();
    else if (ctl.wcisniety('confirm')) {
      audio.uiGo();
      this.akcje[this.sel]();
    } else if (ctl.wcisniety('restart')) void startLevel(this, this.level);
  }
}
