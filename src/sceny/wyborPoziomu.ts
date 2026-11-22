import Phaser from 'phaser';
import { kolory, gameH, gameW } from '../ustawienia';
import { sterowanie } from '../sterowanie';
import { audio } from '../audio/dzwieki';
import { music } from '../audio/muzyka';
import { isTransitioning, zmienScene } from '../fx/transitions';
import { startLevel } from '../nawigacja';
import { poziomy } from '../poziomy/index';
import { motywy } from '../poziomy/motywy';
import { formatujCzas, zapisDlaPoziomu } from '../zapis';
import { napis } from '../ui';

const cardW = 540;
const cardH = 350;
const hex = (s: string) => Phaser.Display.Color.HexStringToColor(s).color;

export class levelSelectScene extends Phaser.Scene {
  private ctl!: sterowanie;
  private karty: Phaser.GameObjects.Container[] = [];
  private frames: Phaser.GameObjects.Graphics[] = [];
  private sel = 0;
  private t = 0;

  constructor() {
    super('LevelSelect');
  }

  init(data: { sel?: number }) {
    this.sel = Phaser.Math.Clamp(data.sel ?? this.sel, 0, poziomy.length - 1);
  }

  create() {
    this.ctl = new sterowanie(this);
    this.karty = [];
    this.frames = [];
    this.cameras.main.setBackgroundColor(kolory.cream);
    const bg = this.add.graphics();
    bg.fillStyle(0xffe9c9, 1);
    for (let i = 0; i < 14; i++) for (let j = 0; j < 8; j++) bg.fillCircle(i * 150 + (j % 2) * 75, j * 150 + 40, 16);

    napis(this, gameW / 2, 90, 'CHOOSE A LEVEL', 92, '#FFB627').setStroke(kolory.outline, 18);

    poziomy.forEach((def, i) => {
      const th = motywy[def.theme];
      const x = gameW / 2 + ((i % 3) - 1) * (cardW + 50);
      const y = 380 + Math.floor(i / 3) * (cardH + 60);
      const c = this.add.container(x, y);
      const g = this.add.graphics();

      g.fillStyle(kolory.outlineN, 0.22).fillRoundedRect(-cardW / 2 + 8, -cardH / 2 + 16, cardW, cardH, 36);
      g.fillStyle(hex(th.sky[0]), 1).fillRoundedRect(-cardW / 2, -cardH / 2, cardW, cardH, 36);
      g.fillStyle(hex(th.sky[1]), 1).fillRect(-cardW / 2 + 4, -40, cardW - 8, 90);
      g.fillStyle(th.night ? 0xfff3b0 : 0xffe066, 1).fillCircle(cardW / 2 - 80, -cardH / 2 + 74, 38);
      g.fillStyle(hex(th.ziemiaCiemna), 1).fillEllipse(-110, 70, 300, 170);
      g.fillStyle(hex(th.trawa), 1).fillEllipse(105, 80, 310, 190);
      g.fillStyle(hex(th.trawaJasna), 1).fillEllipse(-125, 96, 270, 130);
      g.fillStyle(kolory.creamN, 1).fillRoundedRect(-cardW / 2, 50, cardW, cardH / 2 - 50, { tl: 0, tr: 0, bl: 36, br: 36 });
      const frame = this.add.graphics();
      c.add([g, frame]);
      c.add(napis(this, -cardW / 2 + 70, -cardH / 2 + 74, String(def.id), 96, kolory.cream));
      c.add(napis(this, 20, -28, def.name.toUpperCase(), def.name.length > 14 ? 40 : 48, kolory.cream));
      const sv = zapisDlaPoziomu(def.id);
      for (let s = 0; s < 3; s++) {
        c.add(this.add.image(-cardW / 2 + 70 + s * 70, 112, sv.stars[s] ? 'star_full' : 'star_empty').setScale(0.6));
      }
      c.add(napis(this, cardW / 2 - 110, 112, `best ${formatujCzas(sv.najlepszyCzas)}`, 36, kolory.outline, false));
      c.setSize(cardW, cardH);
      c.setInteractive({ useHandCursor: true });
      c.on('pointerover', () => this.wybierz(i));
      c.on('pointerdown', () => {
        this.wybierz(i);
        this.play();
      });
      this.karty.push(c);
      this.frames.push(frame);
    });

    napis(this, gameW / 2, gameH - 54, '←/→/↑/↓ choose · SPACE play · ESC back', 38, kolory.outline, false);
    this.wybierz(this.sel, true);
    music.play('chill');
  }

  private wybierz(i: number, cicho = false) {
    if (i === this.sel && !cicho) return;
    this.sel = i;
    if (!cicho) audio.ui();
    this.frames.forEach((f, k) => {
      f.clear();
      f.lineStyle(k === i ? 14 : 8, k === i ? kolory.accentN : kolory.outlineN, 1).strokeRoundedRect(-cardW / 2, -cardH / 2, cardW, cardH, 36);
    });
    this.karty.forEach((c, k) => c.setDepth(k === i ? 2 : 1));
  }

  private play() {
    if (isTransitioning(this)) return;
    audio.unlock();
    audio.uiGo();
    const c = this.karty[this.sel];
    void startLevel(this, this.sel + 1, { x: c.x, y: c.y });
  }

  update(_t: number, delta: number) {
    this.t += delta / 1000;
    const ctl = this.ctl;
    ctl.update();
    let s = this.sel;
    if (ctl.wcisniety('left')) s = s % 3 === 0 ? s + 2 : s - 1;
    if (ctl.wcisniety('right')) s = s % 3 === 2 ? s - 2 : s + 1;
    if (ctl.wcisniety('up') || ctl.wcisniety('down')) s = (s + 3) % 6;
    if (s !== this.sel) this.wybierz(s);

    this.karty.forEach((c, k) => {
      const cel = k === this.sel ? 1.06 + Math.sin(this.t * 6) * 0.02 : 1;
      c.setScale(c.scale + (cel - c.scale) * 0.25);
      c.setAngle(k === this.sel ? Math.sin(this.t * 3) * 1.2 : 0);
    });
    if (ctl.wcisniety('confirm')) this.play();
    else if (ctl.wcisniety('back') && !isTransitioning(this)) void zmienScene(this, 'Title');
  }
}
