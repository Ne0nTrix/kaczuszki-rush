import Phaser from 'phaser';
import { grafikaSvg } from './svg/common';
import { kapibaraSvg } from './svg/kapibara';
import { yuzuArt } from './svg/yuzu';
import { wrogowieSvg } from './svg/wrogowie';
import { obiektySvg } from './svg/obiekty';
import { uiArt } from './svg/ui';
import { tlaSvg, sunArtAll } from './svg/tla';
import { tileset, tilesetSvgs } from './svg/kafelki';
import { motywy } from '../poziomy/motywy';
import { nazwaMotywu } from '../poziomy/typy';
import { kafel } from '../ustawienia';

function loadImage(svg: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('SVG failed to load: ' + svg.slice(0, 120)));
    img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
  });
}

export async function dodajGrafike(scene: Phaser.Scene, grafiki: grafikaSvg[], onStep?: () => void): Promise<void> {
  await Promise.all(
    grafiki.map(async (a) => {
      if (!scene.textures.exists(a.key)) {
        const img = await loadImage(a.svg);
        if (!scene.textures.exists(a.key)) {
          const c = document.createElement('canvas');
          c.width = a.w;
          c.height = a.h;
          c.getContext('2d')!.drawImage(img, 0, 0, a.w, a.h);
          scene.textures.addCanvas(a.key, c);
        }
      }
      if (onStep) onStep();
    }),
  );
}

export function commonArt(): grafikaSvg[] {
  return [...kapibaraSvg(), ...yuzuArt(), ...wrogowieSvg(), ...obiektySvg(), ...uiArt(), ...sunArtAll()];
}

function dodajNiebo(scene: Phaser.Scene, theme: nazwaMotywu): void {
  const key = `sky_${theme}`;
  if (scene.textures.exists(key)) return;
  const c = document.createElement('canvas');
  c.width = 16;
  c.height = 512;
  const g = c.getContext('2d')!;
  const grad = g.createLinearGradient(0, 0, 0, 512);
  grad.addColorStop(0, motywy[theme].sky[0]);
  grad.addColorStop(1, motywy[theme].sky[1]);
  g.fillStyle = grad;
  g.fillRect(0, 0, 16, 512);
  scene.textures.addCanvas(key, c);
}

async function addTileset(scene: Phaser.Scene, theme: nazwaMotywu): Promise<void> {
  const key = `tiles_${theme}`;
  if (scene.textures.exists(key)) return;
  const obrazki = await Promise.all(tilesetSvgs(motywy[theme]).map(loadImage));
  if (scene.textures.exists(key)) return;
  const step = kafel + tileset.rozstaw;
  const c = document.createElement('canvas');
  c.width = tileset.liczbaKafli * step;
  c.height = kafel + tileset.margines * 2;
  const g = c.getContext('2d')!;
  obrazki.forEach((img, i) => {
    const x = tileset.margines + i * step;
    const y = tileset.margines;

    g.drawImage(img, 0, 0, 96, 96, x - 2, y - 2, kafel + 4, kafel + 4);
    g.clearRect(x, y, kafel, kafel);
    g.drawImage(img, x, y, kafel, kafel);
  });
  scene.textures.addCanvas(key, c);

  for (let m = 0; m < 16; m++) {
    const tc = document.createElement('canvas');
    tc.width = kafel;
    tc.height = kafel;
    tc.getContext('2d')!.drawImage(obrazki[m], 0, 0, kafel, kafel);
    scene.textures.addCanvas(`ground_${theme}_${m}`, tc);
  }
}

const motywGotowy = new Set<nazwaMotywu>();

export async function zaladujMotyw(scene: Phaser.Scene, theme: nazwaMotywu): Promise<void> {
  if (motywGotowy.has(theme)) return;
  dodajNiebo(scene, theme);
  await Promise.all([addTileset(scene, theme), dodajGrafike(scene, tlaSvg(theme))]);
  motywGotowy.add(theme);
}
