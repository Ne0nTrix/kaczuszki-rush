import Phaser from 'phaser';

export function fadeDoSceny(scena: Phaser.Scene, klucz: string, dane?: object) {
  let kamera = scena.cameras.main;
  kamera.fadeOut(300, 0, 0, 0);
  kamera.once('camerafadeoutcomplete', function () {
    scena.scene.start(klucz, dane);
  });
}

export function fadeIn(scena: Phaser.Scene) {
  scena.cameras.main.fadeIn(300, 0, 0, 0);
}
