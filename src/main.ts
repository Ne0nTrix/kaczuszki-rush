import Phaser from 'phaser';
import '@fontsource/fredoka/600.css';
import '@fontsource/fredoka/700.css';
import { gameH, gameW } from './ustawienia';
import { audio } from './audio/dzwieki';
import { bootScene } from './sceny/boot';
import { titleScene } from './sceny/menu';
import { levelSelectScene } from './sceny/wyborPoziomu';
import { gameScene } from './sceny/gra';
import { hudScene } from './sceny/hud';
import { pauseScene } from './sceny/pauza';
import { resultsScene } from './sceny/wyniki';
import { endingScene } from './sceny/zakonczenie';
import { transitionScene } from './fx/transitions';

const odblokuj = () => audio.unlock();
window.addEventListener('keydown', odblokuj);
window.addEventListener('pointerdown', odblokuj);

const game = new Phaser.Game({
  type: Phaser.AUTO,
  parent: 'game',
  width: gameW,
  height: gameH,
  backgroundColor: '#FFF6E5',
  scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH },
  input: { gamepad: true },
  fps: { target: 60 },
  render: { antialias: true, roundPixels: true },
  scene: [bootScene, titleScene, levelSelectScene, gameScene, hudScene, pauseScene, resultsScene, endingScene, transitionScene],
});

window.addEventListener('pointerdown', () => window.focus());
console.log('kibarashka start');
