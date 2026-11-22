import Phaser from "phaser";
import { kolory, gameH, gameW } from "../ustawienia";
import { sterowanie } from "../sterowanie";
import { audio } from "../audio/dzwieki";
import { isTransitioning, zmienScene } from "../fx/transitions";
import { idzDoZakonczenia, startLevel } from "../nawigacja";
import { poziomy } from "../poziomy/index";
import { formatujCzas } from "../zapis";
import { panel, napis } from "../ui";

interface resultData {
  level: number;
  stars: [boolean, boolean, boolean];
  delivered: number;
  total: number;
  need: number;
  ducks: number;
  time: number;
  par: number;
  bonks: number;
  score: number;
  newBest: boolean;
}

export class resultsScene extends Phaser.Scene {
  private ctl!: sterowanie;
  private d!: resultData;
  private ready = false;

  constructor() {
    super('Results');
  }

  init(data: resultData): void {
    this.d = data;
  }

  create(): void {
    const d = this.d;
    this.ready = false;
    this.ctl = new sterowanie(this);
    const shade = this.add.rectangle(0, 0, gameW, gameH, kolory.outlineN, 0).setOrigin(0);
    this.tweens.add({ targets: shade, fillAlpha: 0.35, duration: 300 });
    let box = this.add.container(gameW / 2, gameH / 2 + 20);
    box.add(panel(this, 940, 900));
    box.add(napis(this, 0, -380, 'AHH~ ONSEN TIME!', 78, '#FFB627').setStroke(kolory.outline, 16));
    box.setScale(0.5).setAlpha(0);
    this.tweens.add({ targets: box, scale: 1, alpha: 1, duration: 300, ease: 'Back.Out' });

    const etykiety = ['FINISH', 'YUZU 80%', 'DUCKLINGS'];
    const brakuje = ['', `${d.delivered}/${d.need} yuzu`, `${d.ducks}/3 ducklings`];
    d.stars.forEach((on, i) => {
      const x = (i - 1) * 270;
      box.add(this.add.image(x, -230, 'star_empty').setScale(1.5));
      box.add(napis(this, x, -120, on ? etykiety[i] : brakuje[i], 36, on ? kolory.outline : '#A3564E', false));
      if (!on) return;
      const star = this.add.image(x, -230, 'star_full').setScale(0);
      box.add(star);
      this.time.delayedCall(450 + i * 380, () => {
        audio.star(i);
        this.cameras.main.shake(110, 0.005);
        this.tweens.add({ targets: star, scale: { from: 0, to: 1.95 }, duration: 180, ease: 'Quad.Out' });
        this.tweens.add({ targets: star, scale: 1.5, duration: 200, delay: 180, ease: 'Back.Out' });
        this.tweens.add({ targets: star, angle: { from: -30, to: 0 }, duration: 380, ease: 'Back.Out' });
      });
    });

    let ponizejPar = d.time <= d.par;
    const wiersze: [string, string][] = [
      ['Yuzu delivered', `${d.delivered} / ${d.total}`],
      ['Ducklings', `${d.ducks} / 3`],
      ['Time', `${formatujCzas(d.time, true)}${ponizejPar ? '  PAR!' : ''}`],
      ['Bonks', String(d.bonks)],
    ];
    wiersze.forEach(([k, v], i) => {
      const y = -40 + i * 62;
      box.add(napis(this, -380, y, k, 42, kolory.outline, false).setOrigin(0, 0.5));
      box.add(napis(this, 380, y, v, 42, kolory.outline, false).setOrigin(1, 0.5));
    });
    box.add(napis(this, -380, 230, 'SCORE', 60, kolory.accent).setOrigin(0, 0.5));
    const score = napis(this, 380, 230, '0', 60, kolory.accent).setOrigin(1, 0.5);
    box.add(score);
    this.tweens.addCounter({
      from: 0, to: d.score, duration: 1100, delay: 500, ease: 'Cubic.Out',
      onUpdate: (tw) => score.setText(Math.round(tw.getValue() ?? 0).toLocaleString('en-US').replace(/,/g, ' ')),
    });
    if (d.newBest) {
      const nb = napis(this, 330, -420, 'NEW BEST!', 48, kolory.accent).setAngle(10);
      box.add(nb);
      this.tweens.add({ targets: nb, scale: 1.15, duration: 400, yoyo: true, repeat: -1 });
    }

    let last = d.level >= poziomy.length;
    let podpowiedz = napis(this, 0, 370, `[SPACE] ${last ? 'Finale' : 'Next'}     [R] Retry     [ESC] Levels`, 40, kolory.outline, false);
    box.add(podpowiedz);
    this.tweens.add({ targets: podpowiedz, alpha: 0.5, duration: 600, yoyo: true, repeat: -1 });
    this.time.delayedCall(700, () => (this.ready = true));
    this.input.on('pointerdown', () => this.next());
  }

  private next(): void {
    if (!this.ready || isTransitioning(this)) return;
    audio.uiGo();
    if (this.d.level >= poziomy.length) void idzDoZakonczenia(this);
    else void startLevel(this, this.d.level + 1);
  }

  update(): void {
    const ctl = this.ctl;
    ctl.update();
    if (!this.ready || isTransitioning(this)) return;
    if (ctl.wcisniety('confirm')) this.next();
    else if (ctl.wcisniety('restart')) void startLevel(this, this.d.level);
    else if (ctl.wcisniety('back')) void zmienScene(this, 'LevelSelect', { sel: this.d.level - 1 });
  }
}
