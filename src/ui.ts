import Phaser from 'phaser';
import { kolory, czcionka } from './ustawienia';

export function napis(
  scene: Phaser.Scene, x: number, y: number, s: string, size = 48, color: string = kolory.cream, stroke = true,
): Phaser.GameObjects.Text {
  const t = scene.add.text(x, y, s, {
    fontFamily: czcionka,
    fontStyle: 'bold',
    fontSize: `${size}px`,
    color,
    align: 'center',
    stroke: kolory.outline,
    strokeThickness: stroke ? Math.max(4, Math.round(size / 6)) : 0,
    padding: { x: 8, y: 8 },
  })
  t.setOrigin(0.5);
  return t
}

export function panel(scene: Phaser.Scene, w: number, h: number, fill: number = kolory.creamN, r = 36): Phaser.GameObjects.Graphics {
  const g = scene.add.graphics();
  g.fillStyle(kolory.outlineN, 0.25).fillRoundedRect(-w / 2 + 6, -h / 2 + 14, w, h, r);
  g.fillStyle(fill, 1).fillRoundedRect(-w / 2, -h / 2, w, h, r)
  g.lineStyle(8, kolory.outlineN, 1).strokeRoundedRect(-w / 2, -h / 2, w, h, r);
  return g
}

export interface przycisk {
  box: Phaser.GameObjects.Container;
  label: Phaser.GameObjects.Text
  setSelected(on: boolean): void
}

export function zrobPrzycisk(scene: Phaser.Scene, x: number, y: number, w: number, label: string, poKliknieciu: () => void): przycisk {
  const box = scene.add.container(x, y);
  const bg = scene.add.graphics();
  const t = napis(scene, 0, -2, label, 44, kolory.cream)
  box.add([bg, t])
  let wybrany = false;
  const rysuj = () => {
    bg.clear();
    bg.fillStyle(kolory.outlineN, 0.25).fillRoundedRect(-w / 2 + 4, -36 + 10, w, 76, 26);
    bg.fillStyle(wybrany ? kolory.accentN : 0xd9a877, 1).fillRoundedRect(-w / 2, -38, w, 76, 26);
    bg.lineStyle(7, kolory.outlineN, 1).strokeRoundedRect(-w / 2, -38, w, 76, 26);
  }
  rysuj();
  box.setSize(w, 76)
  box.setInteractive({ useHandCursor: true })
  box.on('pointerdown', poKliknieciu)
  let tw: Phaser.Tweens.Tween | null = null;
  const b: przycisk = {
    box,
    label: t,
    setSelected(on: boolean) {
      if (on === wybrany) return;
      wybrany = on
      rysuj();
      if (tw) tw.stop();
      box.setScale(1);
      if (on) tw = scene.tweens.add({ targets: box, scale: 1.08, duration: 260, yoyo: true, repeat: -1, ease: 'Sine.InOut' });
    },
  }
  return b
}
