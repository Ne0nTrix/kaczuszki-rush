import Phaser from 'phaser'
import { zaladujMotyw } from './grafika/textures';
import { zmienScene } from './fx/transitions';
import { poziomy } from './poziomy/index';

export function startLevel(from: Phaser.Scene, id: number, focus?: { x: number; y: number }): Promise<void> {
  const def = poziomy[id - 1];
  return zmienScene(from, 'Game', { level: id }, { focus, prepare: (s) => zaladujMotyw(s, def.theme) });
}

export function idzDoZakonczenia(from: Phaser.Scene): Promise<void> {
  return zmienScene(from, 'Ending', {}, { prepare: (s) => zaladujMotyw(s, 'night') });
}
