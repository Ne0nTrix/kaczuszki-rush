import Phaser from 'phaser';
import { kolory, warstwy, gameH, fizyka, stackCfg, kafel } from '../ustawienia';
import { params } from '../params';
import { sterowanie } from '../sterowanie';
import { audio } from '../audio/dzwieki';
import { music } from '../audio/muzyka';
import { fajerwerki, efekty, ambient } from '../fx/efekty';
import { mrugniecie, isTransitioning, zmienScene } from '../fx/transitions';
import { idzDoZakonczenia, startLevel } from '../nawigacja';
import { poziomy } from '../poziomy/index';
import { levelDef, yuzuWSkrzynce } from '../poziomy/typy';
import { swiat, parsujPoziom } from '../poziomy/parse';
import { motywy, motyw } from '../poziomy/motywy';
import { tloPoziomu, zbudujTeren } from '../poziomy/levelLoader';
import { gracz } from '../entities/gracz';
import { wiezaYuzu } from '../entities/wiezaYuzu';
import { kaczuszki } from '../entities/kaczuszki';
import { pszczola, wrog, rybaRozdymka, chodziarz } from '../entities/wrogowie';
import { punktKontrolny, krokodyl, kruchaPlatforma, ruchomaPlatforma, platforma, sekretnaSciana, tabliczka, sprezyna, chmuraBurzowa } from '../entities/objects';
import { zapiszWynik } from '../zapis';
import { napis } from '../ui';
import { clamp, losowa } from '../utils';

let testowaPredkosc = 600;
const maxWrogowNaEkranie = 12;

interface znajdzka {
  kind: 'yuzu' | 'duck' | 'melon';
  x: number;
  y: number;
  img: Phaser.GameObjects.Image;
  taken: boolean;
  idx: number;
}

interface luzneYuzu {
  img: Phaser.GameObjects.Image;
  x: number;
  y: number;
  vx: number;
  vy: number;
  age: number;
}

interface prostokat {
  x: number;
  y: number;
  w: number;
  h: number;
}

const kolizja = (a: prostokat, b: prostokat) => a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;

export interface stanBiegu {
  level: number;
  name: string;
  total: number;
  par: number;
  ducks: [boolean, boolean, boolean];
  time: number;
  bonks: number;

  delivered: number;
  started: boolean;
  finished: boolean;
}

export class gameScene extends Phaser.Scene {
  nrPoziomu = 1;
  def!: levelDef;
  theme!: motyw;
  world!: swiat;
  fx!: efekty;
  ctl!: sterowanie;
  player!: gracz;
  stack!: wiezaYuzu;
  ducks!: kaczuszki;
  state!: stanBiegu;
  platformy: platforma[] = [];

  private wrogowie: wrog[] = [];
  private chmuryBurzowe: chmuraBurzowa[] = [];
  private crumbles: kruchaPlatforma[] = [];
  private sprezyny: sprezyna[] = [];
  private skrzynki = new Map<number, Phaser.GameObjects.Image>();
  private checkpoints: punktKontrolny[] = [];
  private tabliczki: tabliczka[] = [];
  private secrets: sekretnaSciana[] = [];
  private znajdzki: znajdzka[] = [];
  private luzne: luzneYuzu[] = [];
  private waterTops: Phaser.GameObjects.TileSprite[] = [];
  private backdrop!: tloPoziomu;
  private onsen!: { x: number; y: number; w: number; cx: number; rect: prostokat };
  private punktOdrodzenia = { x: 0, y: 0 };
  private t = 0;
  private camX = 0;
  private camY = 0;
  private camTY = 0;
  private lookX = 0;
  private odradzaSie = false;
  private steamT = 0;
  private fireworks?: fajerwerki;
  private fireT = 0;
  private finaleX = Infinity;
  private licznikKlatek = 0;
  private ostatniCheckpoint = -1;
  private dbg?: Phaser.GameObjects.Graphics;
  private fps?: Phaser.GameObjects.Text;

  constructor() {
    super('Game');
  }

  init(data: { level?: number }): void {
    this.nrPoziomu = Phaser.Math.Clamp(data.level ?? 1, 1, poziomy.length);
  }

  create(): void {
    let def = (this.def = poziomy[this.nrPoziomu - 1]);
    console.log('start poziomu', this.nrPoziomu, def.name);
    this.licznikKlatek = 0;
    const th = (this.theme = motywy[def.theme]);
    const sparsowane = parsujPoziom(def);
    this.world = new swiat(sparsowane);
    this.platformy = [];
    this.wrogowie = [];
    this.chmuryBurzowe = [];
    this.crumbles = [];
    this.sprezyny = [];
    this.skrzynki = new Map();
    this.checkpoints = [];
    this.tabliczki = [];
    this.znajdzki = [];
    this.luzne = [];
    this.t = 0;
    this.lookX = 0;
    this.odradzaSie = false;
    this.fireworks = undefined;
    this.finaleX = Infinity;
    this.dbg = undefined;
    this.state = {
      level: def.id, name: def.name, total: sparsowane.wszystkieYuzu, par: def.czasPar,
      ducks: [false, false, false], time: 0, bonks: 0, delivered: -1, started: false, finished: false,
    };

    this.ctl = new sterowanie(this);
    this.fx = new efekty(this);
    this.backdrop = new tloPoziomu(this, th);
    const terr = zbudujTeren(this, sparsowane, th);
    this.secrets = terr.secrets;
    this.waterTops = terr.waterTops;

    let spawn = { x: 200, y: 200 };
    let duckIdx = 0;
    let signIdx = 0;
    let cloudIdx = 0;
    const objs = [...sparsowane.obiekty].sort((a, b) => a.col - b.col || a.row - b.row);
    for (const o of objs) {
      const { col, row } = o;
      const cx = col * kafel + kafel / 2;
      const cy = row * kafel + kafel / 2;
      switch (o.ch) {
        case 'P':
          spawn = { x: cx, y: (row + 1) * kafel - fizyka.hitH / 2 };
          break;
        case 'o':
          this.znajdzki.push({ kind: 'yuzu', x: cx, y: cy, img: this.add.image(cx, cy, 'yuzu').setDepth(warstwy.obj), taken: false, idx: col });
          break;
        case 'd':
          this.znajdzki.push({
            kind: 'duck', x: cx, y: (row + 1) * kafel - 26, taken: false, idx: Math.min(duckIdx++, 2),
            img: this.add.image(cx, (row + 1) * kafel - 26, 'duck').setDepth(warstwy.obj),
          });
          break;
        case 'M':
          this.znajdzki.push({ kind: 'melon', x: cx, y: cy, img: this.add.image(cx, cy, 'melon').setDepth(warstwy.obj), taken: false, idx: col });
          break;
        case 'C': {
          let img = this.add.image(cx, cy, 'crate').setDepth(warstwy.obj);
          this.skrzynki.set(this.world.key(col, row), img);
          this.world.skrzynki.set(this.world.key(col, row), img);
          break;
        }
        case 's':
          this.sprezyny.push(new sprezyna(this, col, row, th.spring));
          break;
        case 'K':
          this.checkpoints.push(new punktKontrolny(this, col, row, th.checkpoint));
          break;
        case 'G': {
          const n = def.rozmiarOnsenu === 5 ? 5 : 3;
          this.add.image(col * kafel, row * kafel, `onsen${n}_back`).setOrigin(0).setDepth(warstwy.objBack);
          this.add.image(col * kafel, row * kafel, `onsen${n}_front`).setOrigin(0).setDepth(warstwy.objFront);
          this.onsen = {
            x: col * kafel, y: row * kafel, w: n * kafel, cx: col * kafel + (n * kafel) / 2,
            rect: { x: col * kafel + 34, y: row * kafel, w: n * kafel - 68, h: kafel },
          };
          break;
        }
        case 'i':
          this.tabliczki.push(new tabliczka(this, col, row, def.podpowiedzi[signIdx++] ?? '...'));
          break;
        case 'c':
          this.wrogowie.push(new chodziarz(this, 'crab', col, row));
          break;
        case 'h':
          this.wrogowie.push(new chodziarz(this, 'hedgehog', col, row));
          break;
        case 'b':
          this.wrogowie.push(new pszczola(this, col, row));
          break;
        case 'f':
          this.wrogowie.push(new rybaRozdymka(this, col, row));
          break;
        case 't': {
          const c = new chmuraBurzowa(this, col, row, cloudIdx++);
          this.chmuryBurzowe.push(c);
          this.platformy.push(c);
          break;
        }
        case 'r':
          this.platformy.push(new krokodyl(this, col, row));
          break;
        case 'L':
        case 'V':
          this.platformy.push(new ruchomaPlatforma(this, col, row, o.ch === 'V', `plat_${th.plat}`));
          break;
        case '_': {
          let c = new kruchaPlatforma(this, col, row, `crumble_${th.crumble}`);
          this.crumbles.push(c);
          this.platformy.push(c);
          break;
        }
      }
    }

    if (th.night) {
      let arbuzy = this.znajdzki.filter((p) => p.kind === 'melon');
      if (arbuzy.length) this.finaleX = arbuzy[arbuzy.length - 1].x - kafel * 6;
      this.fireworks = new fajerwerki(this);
    }

    this.punktOdrodzenia = { ...spawn };
    this.player = new gracz(this, spawn.x, spawn.y - 760);
    this.stack = new wiezaYuzu(this);
    this.ducks = new kaczuszki(this);

    const cam = this.cameras.main;
    cam.setBounds(0, -400, sparsowane.w * kafel, sparsowane.h * kafel + 400);
    cam.setZoom(1);
    this.camX = spawn.x + 150;
    this.camY = this.camTY = spawn.y - 80;
    cam.centerOn(this.camX, this.camY);

    ambient(this, th.ambient);
    this.scene.launch('Hud', { game: this });
    music.play('level', def.music);
    this.events.on('resume', () => this.ctl.reset());
    this.events.once('shutdown', () => this.events.off('resume'));

    if (params.debug) {
      this.dbg = this.add.graphics().setDepth(999);
      this.fps = napis(this, 20, 1040, '', 28).setOrigin(0, 0.5).setScrollFactor(0).setDepth(999);
    }
  }

  naEkranie(x: number): boolean {
    const v = this.cameras.main.worldView;
    return x > v.x - 200 && x < v.right + 200;
  }

  private screenPos(x: number, y: number): { x: number; y: number } {
    const cam = this.cameras.main;
    return { x: (x - cam.worldView.x) * cam.zoom, y: (y - cam.worldView.y) * cam.zoom };
  }

  rozwalSkrzynke(c: number, r: number): void {
    const key = this.world.key(c, r);
    const img = this.skrzynki.get(key);
    if (!img) return;
    this.skrzynki.delete(key);
    this.world.skrzynki.delete(key);
    img.destroy();
    const cx = c * kafel + kafel / 2;
    const cy = r * kafel + kafel / 2;
    this.fx.drzazgi(cx, cy, 10);
    this.fx.trzesienie(0.005, 90);
    this.fx.stop(40);
    audio.crack();
    for (let i = 0; i < yuzuWSkrzynce; i++) {
      this.stack.add(cx + Phaser.Math.Between(-36, 36), cy + Phaser.Math.Between(-20, 20), 0.42, i * 0.07, 120);
    }
    this.fx.text(cx, cy - 40, `+${yuzuWSkrzynce}`, '#FFE08A', 44);
  }

  onMelonEnd(): void {
    music.melon = false;
    audio.melonEnd();
    if (!this.state.finished) this.tweens.add({ targets: this.cameras.main, zoom: 1, duration: 400, ease: 'Sine.Out' });
  }

  private restart(): void {
    const p = this.player;
    void startLevel(this, this.nrPoziomu, this.screenPos(p.x, p.y));
  }

  update(_time: number, delta: number): void {
    const dt = Math.min(delta, 34) / 1000;
    let ctl = this.ctl;
    ctl.update();
    if (!isTransitioning(this)) {
      if (ctl.wcisniety('restart')) {
        this.restart();
        return;
      }
      if (ctl.wcisniety('pause') && !this.state.finished && !this.odradzaSie) {
        audio.ui();
        this.scene.launch('Pause', { level: this.nrPoziomu });
        this.scene.pause();
        return;
      }
      if (params.debug) this.debugKeys();
    }

    if (this.fx.hitstop > 0) {
      this.fx.hitstop -= dt;
      return;
    }
    this.t += dt;
    this.licznikKlatek++;
    let p = this.player;
    let st = this.state;
    if (st.started && !st.finished && !this.odradzaSie) st.time += dt;

    for (const pl of this.platformy) pl.update(dt, this.t);
    for (const e of this.wrogowie) if (e.zyje) e.update(dt, this.t);
    p.update(dt, ctl);
    if (!st.started && p.naZiemi) st.started = true;
    if (!p.zablokowany) this.interakcje();
    this.updateLoose(dt);

    this.stack.update(dt, p.headX, p.headY, this.t);
    this.ducks.update(p.x, p.bottom, p.kierunek, this.t);

    for (const k of this.znajdzki) {
      if (k.taken) continue;
      if (k.kind === 'duck') {
        k.img.y = k.y - Math.abs(Math.sin(this.t * 3 + k.x)) * 5;
        k.img.setFlipX(Math.sin(this.t * 0.8 + k.x) > 0);
      } else {
        k.img.y = k.y + Math.sin(this.t * 3.4 + k.x * 0.02) * 6;
        if (k.kind === 'melon') k.img.setRotation(Math.sin(this.t * 2) * 0.15);
      }
    }
    for (const s of this.tabliczki) s.update(p.x, p.y);
    let pc = Math.floor(p.y / kafel) * this.world.w + Math.floor(p.x / kafel);
    for (const s of this.secrets) s.update(dt, s.komorki.has(pc), (x, y) => this.naEkranie(x) && this.fx.sparks(x, y, 2));
    for (const w of this.waterTops) w.tilePositionX += dt * 36;

    this.steamT -= dt;
    if (this.steamT <= 0 && this.onsen) {
      this.steamT = 0.3;
      if (this.naEkranie(this.onsen.cx)) {
        this.fx.steamAt(this.onsen.cx + Phaser.Math.Between(-this.onsen.w / 2 + 40, this.onsen.w / 2 - 40), this.onsen.y + 50, 1);
      }
    }

    if (this.fireworks && (p.x > this.finaleX || st.finished)) {
      this.fireT -= dt;
      if (this.fireT <= 0) {
        this.fireT = 0.35 + Math.random() * 0.5;
        this.fireworks.wybuch(Phaser.Math.Between(150, 1770), Phaser.Math.Between(90, 430));
        audio.firework();
      }
    }

    this.aktualizujKamere(dt);
    if (this.dbg) this.debugDraw();
  }

  private aktualizujKamere(dt: number, snap = false): void {
    const p = this.player;
    const cam = this.cameras.main;
    const f = snap ? 1 : 1 - Math.pow(1 - 0.12, dt * 60);
    let tx: number;
    let py: number;
    if (this.state.finished) {
      tx = this.onsen.cx;
      py = this.onsen.y - 150;
      this.camTY = py;
    } else {
      this.lookX += (p.kierunek * 150 - this.lookX) * (snap ? 1 : 1 - Math.pow(0.95, dt * 60));
      tx = p.x + this.lookX;
      py = p.y - 90;

      if (py < this.camTY - 75) this.camTY = py + 75;
      else if (py > this.camTY + 75) this.camTY = py - 75;
    }
    this.camX += (tx - this.camX) * f;
    this.camY += (this.camTY - this.camY) * f;
    cam.centerOn(this.camX, this.camY);
    const maxScroll = this.world.h * kafel - gameH;
    this.backdrop.update(cam.scrollX, Math.max(0, maxScroll - cam.scrollY));
  }

  private interakcje(): void {
    const p = this.player;
    const b = p.box;
    let w = this.world;

    for (const k of this.znajdzki) {
      if (k.taken) continue;
      const zasieg = k.kind === 'yuzu' ? 60 : 68;
      if (Math.abs(k.x - p.x) > zasieg || Math.abs(k.y - p.y) > zasieg) continue;
      k.taken = true;
      k.img.destroy();
      if (k.kind === 'yuzu') {
        this.stack.add(k.x, k.y);
        this.fx.sparks(k.x, k.y, 8);
        this.fx.text(k.x, k.y - 30, '+1', '#FFE08A', 32);
        audio.plink();
      } else if (k.kind === 'duck') {
        this.state.ducks[k.idx] = true;
        this.ducks.add(k.x, k.y);
        this.fx.serduszka(k.x, k.y - 20, 6);
        this.fx.text(k.x, k.y - 70, 'QUACK!', '#FFE14D', 52);
        audio.quack();
      } else {
        p.startArbuza();
        music.melon = true;
        audio.melon();
        this.fx.stars(k.x, k.y, 16);
        this.fx.text(k.x, k.y - 80, 'MELON MODE!', kolory.accent, 64);
        this.tweens.add({ targets: this.cameras.main, zoom: 0.95, duration: 400, ease: 'Sine.Out' });
      }
    }

    for (const e of this.wrogowie) {
      if (!e.zyje) continue;
      if (!kolizja(b, { x: e.x - e.hw, y: e.y - e.hh, w: e.hw * 2, h: e.hh * 2 })) continue;
      if (p.melon > 0) {
        e.yeet(p.kierunek);
        audio.yeet();
        this.fx.konfetti(e.x, e.y, 12);
        this.fx.trzesienie(0.004, 80);
        continue;
      }
      if (p.plop === 2 && e.ploppable) {
        this.pokonaj(e, false);
        continue;
      }
      const nad = Math.min(p.prevBottom, p.bottom) < e.y + 12;
      if (p.vy > 0 && nad && e.moznaSkoczyc) this.pokonaj(e, true);
      else this.zran(e.x);
    }

    const c0 = Math.floor(b.x / kafel);
    const c1 = Math.floor((b.x + b.w) / kafel);
    const r0 = Math.floor(b.y / kafel);
    let r1 = Math.floor((b.y + b.h - 1) / kafel);
    for (let r = r0; r <= r1; r++) {
      for (let c = c0; c <= c1; c++) {
        if (w.ch(c, r) !== '^') continue;
        if (kolizja(b, { x: c * kafel + 14, y: r * kafel + kafel * 0.4, w: kafel - 28, h: kafel * 0.6 })) this.zran(c * kafel + kafel / 2);
      }
    }

    for (const c of this.chmuryBurzowe) if (c.razi && kolizja(b, c.bolt)) this.zran(c.bolt.x + 24);

    if (p.vy >= 0) {
      for (const s of this.sprezyny) {
        if (kolizja(b, s.rect)) {
          s.fire();
          p.spring(s.cx);
          break;
        }
      }
    }

    for (const c of this.checkpoints) {
      if (!c.aktywny && kolizja(b, c.rect)) {
        c.activate();
        this.punktOdrodzenia = { x: c.x, y: c.y };
      }
    }

    if (!this.state.finished && this.onsen && kolizja(b, this.onsen.rect)) this.koniecPoziomu();

    if (p.y > w.h * kafel + 160 && !this.odradzaSie) {
      this.state.bonks++;
      this.bonk(true);
    }
  }

  private pokonaj(e: wrog, bounce: boolean): void {
    const p = this.player;
    e.squash();
    this.fx.stop(60);
    this.fx.konfetti(e.x, e.y, 16);
    this.fx.trzesienie(0.004, 80);
    audio.boop();
    p.combo++;
    if (p.combo >= 2) this.fx.text(e.x, e.y - 70, `x${p.combo}`, kolory.accent, 60);
    if (p.combo >= 3) this.stack.add(e.x, e.y, 0.3, 0, 90);
    if (bounce) p.bounce(this.ctl.trzyma('jump') ? fizyka.stompBounceHeld : fizyka.stompBounce);
  }

  zran(fromX: number): void {
    const p = this.player;
    if (p.nietykalny > 0 || p.melon > 0 || p.zablokowany || this.odradzaSie) return;
    this.state.bonks++;
    if (this.stack.count === 0) {
      this.bonk(false);
      return;
    }

    // rozsypujemy max 12 bo przy 30+ sie robil balagan na ekranie
    const n = Math.min(stackCfg.maxRozsypanych, this.stack.count);
    this.stack.clear();
    for (let i = 0; i < n; i++) {
      const x = p.x;
      const y = p.y - 50 - i * 6;
      this.luzne.push({
        img: this.add.image(x, y, 'yuzu').setDepth(warstwy.stack), x, y,
        vx: Phaser.Math.Between(-460, 460), vy: Phaser.Math.Between(-1050, -500), age: 0,
      });
    }
    p.nietykalny = fizyka.czasNietykalnosci;
    p.odrzut(fromX);
    this.fx.blysk();
    this.fx.trzesienie(0.006, 140);
    audio.bonk();
    this.fx.text(p.x, p.y - 100, '…', kolory.cream, 60);
  }

  private bonk(dziura: boolean): void {
    if (this.odradzaSie) return;
    this.odradzaSie = true;
    const p = this.player;
    p.zablokowany = true;
    p.destroyBird();
    this.stack.clear();
    audio.bonkBig();
    const go = () => {
      if (isTransitioning(this)) {
        this.time.delayedCall(80, go);
        return;
      }
      void mrugniecie(this, this.screenPos(p.x, Math.min(p.y, this.cameras.main.worldView.bottom - 40)), () => {
        if (p.melon > 0) this.onMelonEnd();
        p.reset(this.punktOdrodzenia.x, this.punktOdrodzenia.y);
        p.zablokowany = false;
        p.nietykalny = fizyka.czasNietykalnosci;
        this.crumbles.forEach((c) => c.reset());
        this.ducks.teleport(p.x, p.bottom);
        this.odradzaSie = false;
        this.camX = p.x;
        this.camY = this.camTY = p.y - 90;
        this.aktualizujKamere(0, true);
        return this.screenPos(p.x, p.y);
      });
    };
    if (dziura) {
      go();
      return;
    }
    p.pose = 'capy_dizzy';
    p.vx = 0;
    this.fx.stars(p.x, p.y - 60, 12);
    this.fx.text(p.x, p.y - 120, 'BONK!', kolory.cream, 64);
    this.fx.trzesienie(0.008, 160);
    this.tweens.add({ targets: p.img, angle: 360, duration: 520 });
    this.time.delayedCall(600, go);
  }

  private updateLoose(dt: number): void {
    const w = this.world;
    let p = this.player;
    for (let i = this.luzne.length - 1; i >= 0; i--) {
      let l = this.luzne[i];
      l.age += dt;
      l.vy += 2200 * dt;
      let prevBottom = l.y + 16;
      l.x += l.vx * dt;
      l.y += l.vy * dt;
      const c = Math.floor(l.x / kafel);
      const r = Math.floor((l.y + 16) / kafel);
      if (l.vy > 0 && (w.twardy(c, r) || (w.jednostronny(c, r) && prevBottom <= r * kafel + 1))) {
        l.y = r * kafel - 16;
        l.vy *= -0.6;
        l.vx *= 0.8;
        if (Math.abs(l.vy) < 130) l.vy = 0;
      }
      let cw = Math.floor((l.x + Math.sign(l.vx) * 16) / kafel);
      if (w.twardy(cw, Math.floor(l.y / kafel))) {
        l.vx *= -0.6;
        l.x += l.vx * dt * 2;
      }
      l.img.setPosition(l.x, l.y);
      l.img.rotation += l.vx * dt * 0.012;
      l.img.setAlpha(l.age > 2 && Math.floor(l.age / 0.09) % 2 ? 0.3 : 1);
      let zniknal = l.age > 3.5 || l.y > w.h * kafel + 200;
      if (!zniknal && l.age > 0.4 && !p.zablokowany && Math.abs(l.x - p.x) < 66 && Math.abs(l.y - p.y) < 66) {
        this.stack.add(l.x, l.y);
        this.fx.sparks(l.x, l.y, 5);
        audio.plink();
        zniknal = true;
      }
      if (zniknal) {
        l.img.destroy();
        this.luzne.splice(i, 1);
      }
    }
  }

  private koniecPoziomu(): void {
    const p = this.player;
    const o = this.onsen;
    const st = this.state;
    st.finished = true;
    st.delivered = 0;
    p.zablokowany = true;
    p.destroyBird();
    p.nietykalny = 0;
    if (p.melon > 0) {
      p.melon = 0;
      music.melon = false;
    }
    music.duck = 0.45;
    this.tweens.add({ targets: this.cameras.main, zoom: 1.1, duration: 700, ease: 'Sine.InOut' });
    const sx = p.x;
    const sy = p.y;
    let tx = o.cx;
    let ty = o.y + 52;
    p.pose = 'capy_jump';
    p.kierunek = tx >= sx ? 1 : -1;
    audio.jump();
    p.stretch(0.85, 1.2);
    this.tweens.addCounter({
      from: 0, to: 1, duration: 560,
      onUpdate: (tw) => {
        const k = tw.getValue() ?? 0;
        p.x = sx + (tx - sx) * k;
        p.y = sy + (ty - sy) * k - Math.sin(k * Math.PI) * 190;
      },
      onComplete: () => {
        p.x = tx;
        p.y = ty;
        p.pose = 'capy_relax';
        p.squash(1.3, 0.75);
        this.fx.splash(tx, o.y + 62, 28);
        this.fx.trzesienie(0.006, 160);
        for (let i = 0; i < 6; i++) this.fx.steamAt(tx + Phaser.Math.Between(-80, 80), o.y + 40, 1);
        audio.splash();
        this.time.delayedCall(350, () => this.dostarcz());
      },
    });
  }

  private dostarcz(): void {
    const o = this.onsen;
    const st = this.state;
    let i = 0;
    let delay = 130;
    let floating = 0;
    const next = () => {
      if (this.stack.count <= 0) {
        this.time.delayedCall(300, () => this.poDostarczeniu());
        return;
      }
      const top = this.stack.szczyt();
      this.stack.zabierz(1);
      const img = this.add.image(top.x, top.y, 'yuzu').setDepth(warstwy.stack);
      const tx = o.cx + Phaser.Math.Between(-o.w / 2 + 60, o.w / 2 - 60);
      let ty = o.y + 64;
      const idx = i++;
      const sx = top.x;
      let sy = top.y;
      this.tweens.addCounter({
        from: 0, to: 1, duration: 260,
        onUpdate: (tw) => {
          const k = tw.getValue() ?? 0;
          img.setPosition(sx + (tx - sx) * k, sy + (ty - sy) * k - Math.sin(k * Math.PI) * 110);
          img.setRotation(k * 6);
        },
        onComplete: () => {
          this.fx.splash(tx, ty, 4);
          audio.plip(idx);
          st.delivered++;
          if (floating < 9 && Math.abs(tx - o.cx) > 70) {
            floating++;
            img.setDepth(warstwy.objBack + 1).setPosition(tx, ty + 6).setRotation(0);
            this.tweens.add({ targets: img, y: ty + 11, angle: 8, duration: 700 + idx * 13, yoyo: true, repeat: -1, ease: 'Sine.InOut' });
          } else img.destroy();
        },
      });
      delay = Math.max(34, delay * 0.9);
      this.time.delayedCall(delay, next);
    };
    next();
  }

  private poDostarczeniu(): void {
    const o = this.onsen;
    const p = this.player;

    this.ducks.ducks.forEach((d, i) => {
      let sx = d.x;
      const sy = d.y;
      const tx = o.cx + (i - 1) * 74 + (i === 1 ? 110 : 0);
      const ty = o.y + 56;
      this.tweens.addCounter({
        from: 0, to: 1, duration: 420, delay: i * 170,
        onUpdate: (tw) => {
          const k = tw.getValue() ?? 0;
          d.setPosition(sx + (tx - sx) * k, sy + (ty - sy) * k - Math.sin(k * Math.PI) * 120);
        },
        onComplete: () => {
          audio.quack();
          this.fx.splash(tx, ty + 6, 4);
          this.tweens.add({ targets: d, y: ty + 4, duration: 600, yoyo: true, repeat: -1, ease: 'Sine.InOut' });
        },
      });
    });
    this.ducks.ducks = [];
    const wait = 250 + this.state.ducks.filter(Boolean).length * 170;
    this.time.delayedCall(wait, () => {
      this.fx.text(p.x, o.y - 70, 'Ahh~', kolory.cream, 72);
      this.fx.serduszka(p.x, o.y - 10, 4);
      audio.fanfare();
      this.time.delayedCall(950, () => this.pokazWyniki());
    });
  }

  private pokazWyniki(): void {
    const st = this.state;
    const need = Math.ceil(st.total * 0.8);
    const ducksN = st.ducks.filter(Boolean).length;
    const stars: [boolean, boolean, boolean] = [true, st.delivered >= need, ducksN === 3];
    const score =
      st.delivered * 100 + ducksN * 500 + Math.floor(Math.max(0, st.par - st.time) * 50) + (st.bonks === 0 ? 1000 : 0);
    const newBest = zapiszWynik(st.level, { stars, time: st.time, yuzu: st.delivered, ducklings: st.ducks });
    this.scene.launch('Results', {
      level: st.level, stars, delivered: st.delivered, total: st.total, need, ducks: ducksN,
      time: st.time, par: st.par, bonks: st.bonks, score, newBest,
    });
  }

  private debugKeys(): void {
    const ctl = this.ctl;
    if (ctl.wcisniety('next')) {
      if (this.nrPoziomu < poziomy.length) void startLevel(this, this.nrPoziomu + 1);
      else void idzDoZakonczenia(this);
    }
    if (ctl.wcisniety('warp')) {
      let p = this.player;
      const next = this.checkpoints.find((c) => c.x > p.x + kafel);
      if (next) {
        next.activate(true);
        this.punktOdrodzenia = { x: next.x, y: next.y };
        p.reset(next.x, next.y);
      } else if (this.onsen) {
        p.reset(this.onsen.x - kafel * 2, this.onsen.y + kafel - fizyka.hitH / 2);
      }
    }
    if (ctl.wcisniety('levels')) void zmienScene(this, 'LevelSelect');
  }

  private debugDraw(): void {
    let g = this.dbg!;
    let p = this.player;
    g.clear();
    g.lineStyle(2, 0x00ff00, 1).strokeRect(p.box.x, p.box.y, p.box.w, p.box.h);
    g.lineStyle(2, 0xff0000, 1);
    for (const e of this.wrogowie) if (e.zyje) g.strokeRect(e.x - e.hw, e.y - e.hh, e.hw * 2, e.hh * 2);
    for (const c of this.chmuryBurzowe) if (c.razi) g.strokeRect(c.bolt.x, c.bolt.y, c.bolt.w, c.bolt.h);
    g.lineStyle(2, 0x00aaff, 1);
    for (const pl of this.platformy) if (pl.aktywny) g.strokeRect(pl.x, pl.top, pl.w, 12);
    for (const s of this.sprezyny) g.strokeRect(s.rect.x, s.rect.y, s.rect.w, s.rect.h);
    if (this.onsen) g.strokeRect(this.onsen.rect.x, this.onsen.rect.y, this.onsen.rect.w, this.onsen.rect.h);
    this.fps!.setText(`${Math.round(this.game.loop.actualFps)} fps  x${Math.round(p.x / kafel)} y${Math.round(p.y / kafel)}`);
  }
}
