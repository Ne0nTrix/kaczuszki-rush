import Phaser from 'phaser';
import { kolory, czcionka, gameH, gameW } from '../ustawienia';
import { params } from '../params';
import { dodajGrafike, commonArt, zaladujMotyw } from '../grafika/textures';
import { poziomy } from '../poziomy/index';

export class bootScene extends Phaser.Scene {
  constructor() {
    super('Boot');
  }

  async create(): Promise<void> {
    this.cameras.main.setBackgroundColor(kolory.cream);
    const g = this.add.graphics();
    const bx = gameW / 2 - 300;
    const by = gameH / 2;
    let gotowe = 0;
    const grafiki = commonArt();
    const total = grafiki.length + 2;
    const rysuj = () => {
      const k = Math.min(1, gotowe / total);
      g.clear();
      g.fillStyle(0xe8d9bf, 1).fillRoundedRect(bx, by - 14, 600, 28, 14);
      g.fillStyle(kolory.yuzuN, 1).fillRoundedRect(bx, by - 14, Math.max(28, 600 * k), 28, 14);
      g.lineStyle(6, kolory.outlineN, 1).strokeRoundedRect(bx, by - 14, 600, 28, 14);

      const x = bx + 600 * k;
      g.fillStyle(kolory.yuzuN, 1).fillCircle(x, by, 34);
      g.lineStyle(6, kolory.outlineN, 1).strokeCircle(x, by, 34);
      g.fillStyle(0x6bcb77, 1).fillEllipse(x + 10, by - 36, 26, 12);
    };
    rysuj();
    const step = () => {
      gotowe++;
      rysuj();
    };

    try {
      await Promise.all([document.fonts.load(`700 64px ${czcionka}`), document.fonts.load(`600 32px ${czcionka}`)]);
    } catch (e) {}
    step();
    await dodajGrafike(this, grafiki, step);
    const first = params.level ? poziomy[params.level - 1].theme : 'meadow';
    await zaladujMotyw(this, 'meadow');
    await zaladujMotyw(this, first);
    step();
    console.log('zaladowane, grafik: ' + grafiki.length);

    this.scene.launch('Transition');
    if (params.level) this.scene.launch('Game', { level: params.level });
    else this.scene.launch('Title');
    this.scene.bringToTop('Transition');
    this.scene.stop();
  }
}
