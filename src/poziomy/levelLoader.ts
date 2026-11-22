import Phaser from 'phaser';
import { kolory, warstwy, gameH, gameW, kafel } from '../ustawienia';
import { tileset } from '../grafika/svg/kafelki';
import { bgHeights } from '../grafika/svg/tla';
import { sekretnaSciana } from '../entities/objects';
import { parsedLevel } from './parse';
import { motyw } from './motywy';

export interface teren {
  secrets: sekretnaSciana[];
  waterTops: Phaser.GameObjects.TileSprite[];
}

export function zbudujTeren(scene: Phaser.Scene, p: parsedLevel, th: motyw): teren {
  const { w, h, siatka: grid } = p;
  const solidLike = (c: number, r: number): boolean => {
    if (c < 0 || c >= w) return true;
    if (r < 0) return false;
    if (r >= h) return true;

    return grid[r][c] === '#' || (grid[r][c] === 'S' && th.secret === 'wall');
  };
  const mask = (c: number, r: number): number =>
    (solidLike(c, r - 1) ? 0 : 1) | (solidLike(c + 1, r) ? 0 : 2) | (solidLike(c, r + 1) ? 0 : 4) | (solidLike(c - 1, r) ? 0 : 8);

  const data: number[][] = [];
  for (let r = 0; r < h; r++) {
    const row: number[] = [];
    for (let c = 0; c < w; c++) {
      const ch = grid[r][c];
      if (ch === '#') row.push(tileset.kafleZiemi + mask(c, r));
      else if (ch === '=') {
        const l = c > 0 && (grid[r][c - 1] === '=' || grid[r][c - 1] === '#');
        const rr = c < w - 1 && (grid[r][c + 1] === '=' || grid[r][c + 1] === '#');
        row.push(tileset.kaflePlatform + (l ? 1 : 0) + (rr ? 2 : 0));
      } else if (ch === '^') row.push(tileset.kafleKolcow);
      else row.push(-1);
    }
    data.push(row);
  }
  let map = scene.make.tilemap({ data, tileWidth: kafel, tileHeight: kafel });
  const key = `tiles_${th.key}`;
  const ts = map.addTilesetImage(key, key, kafel, kafel, tileset.margines, tileset.rozstaw)!;
  map.createLayer(0, ts, 0, 0)!.setDepth(warstwy.tiles);

  const waterTops: Phaser.GameObjects.TileSprite[] = [];
  for (let r = 0; r < h; r++) {
    let c = 0;
    while (c < w) {
      const ch = grid[r][c];
      if (ch !== '~' && ch !== 'w') {
        c++;
        continue;
      }
      let e = c;
      while (e < w && grid[r][e] === ch) e++;
      let x = c * kafel;
      const y = r * kafel;
      const ww = (e - c) * kafel;
      if (ch === '~') {
        scene.add.rectangle(x, y + 26, ww, kafel - 26, kolory.waterDeep).setOrigin(0).setDepth(warstwy.waterBack);
        waterTops.push(scene.add.tileSprite(x, y, ww, kafel, 'water_top').setOrigin(0).setDepth(warstwy.water));
      } else {
        scene.add.rectangle(x, y, ww, kafel, kolory.waterDeep).setOrigin(0).setDepth(warstwy.waterBack);
        scene.add.rectangle(x, y, ww, kafel, kolory.water, 0.58).setOrigin(0).setDepth(warstwy.water);
      }
      c = e;
    }
  }

  const secrets: sekretnaSciana[] = [];
  let widziane = new Set<number>();
  for (let r = 0; r < h; r++) {
    for (let c = 0; c < w; c++) {
      if (grid[r][c] !== 'S' || widziane.has(r * w + c)) continue;
      const group = new sekretnaSciana(scene);
      const todo = [[c, r]];
      widziane.add(r * w + c);
      while (todo.length) {
        const [cc, cr] = todo.pop()!;
        let x = cc * kafel;
        const y = cr * kafel;
        const img =
          th.secret === 'waterfall'
            ? scene.add.tileSprite(x, y, kafel, kafel, 'waterfall').setOrigin(0).setDepth(warstwy.secret)
            : scene.add.image(x, y, `ground_${th.key}_${mask(cc, cr)}`).setOrigin(0).setDepth(warstwy.secret);
        group.addCell(cr * w + cc, x + kafel / 2, y + kafel / 2, img);
        for (const [dc, dr] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
          const nc = cc + dc;
          const nr = cr + dr;
          if (nc < 0 || nc >= w || nr < 0 || nr >= h) continue;
          if (grid[nr][nc] !== 'S' || widziane.has(nr * w + nc)) continue;
          widziane.add(nr * w + nc);
          todo.push([nc, nr]);
        }
      }
      secrets.push(group);
    }
  }

  let taken = new Set<number>();
  p.obiekty.forEach((o) => {
    taken.add(o.row * w + o.col);
    if (o.ch === 'G') for (let i = 1; i < 6; i++) taken.add(o.row * w + o.col + i);
  });
  const grassN = Phaser.Display.Color.HexStringToColor(th.trawa).color;
  for (let r = 1; r < h; r++) {
    for (let c = 0; c < w; c++) {
      if (grid[r][c] !== '#' || grid[r - 1][c] !== '.' || taken.has((r - 1) * w + c)) continue;
      const rnd = (c * 7919 + r * 104729) % 11;
      const x = c * kafel + 20 + ((c * 37) % 56);
      let y = r * kafel + 5;
      if (rnd === 0 || rnd === 5) {
        scene.add.image(x, y, 'deco_tuft').setOrigin(0.5, 1).setDepth(warstwy.deco).setTint(th.key === 'sky' ? 0xffffff : grassN);
      } else if ((rnd === 2 || rnd === 8) && th.key !== 'sky') {
        scene.add.image(x, y, 'deco_flower').setOrigin(0.5, 1).setDepth(warstwy.deco).setTint(th.decoTint[c % th.decoTint.length]).setScale(0.9);
      }
    }
  }
  return { secrets, waterTops };
}

export class tloPoziomu {
  private layers: { ts: Phaser.GameObjects.TileSprite; f: number; baseY: number }[] = [];
  sun: Phaser.GameObjects.Image;

  constructor(scene: Phaser.Scene, th: motyw) {
    scene.add.image(gameW / 2, gameH / 2, `sky_${th.key}`).setDisplaySize(gameW * 1.25, gameH * 1.25).setScrollFactor(0).setDepth(warstwy.sky);
    this.sun = scene.add.image(1560, 200, th.night ? 'moon' : 'sun').setScrollFactor(0).setDepth(warstwy.sun);
    scene.tweens.add({ targets: this.sun, angle: th.night ? 4 : 8, duration: 2600, yoyo: true, repeat: -1, ease: 'Sine.InOut' });
    const defs: [string, number, number, number][] = [
      ['far', 0.1, bgHeights.far, 0],
      ['mid', 0.3, bgHeights.mid, 1],
      ['near', 0.6, bgHeights.near, 2],
    ];
    for (const [name, f, hh, i] of defs) {
      const baseY = gameH + 40;
      let ts = scene.add
        .tileSprite(-140, baseY, gameW + 280, hh, `bg_${th.key}_${name}`)
        .setOrigin(0, 1)
        .setScrollFactor(0)
        .setDepth(warstwy.far + i);
      this.layers.push({ ts, f, baseY });
    }
  }

  update(scrollX: number, lift: number): void {
    for (const l of this.layers) {
      l.ts.tilePositionX = scrollX * l.f;
      l.ts.y = l.baseY + lift * l.f * 0.6;
    }
  }
}
