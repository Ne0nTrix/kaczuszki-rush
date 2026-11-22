import Phaser from 'phaser';

// STARA WERSJA na arcade physics - nie uzywac, zostawiam na wszelki wypadek
const predkosc = 400;
const skok = -900;

export class staryGracz extends Phaser.Physics.Arcade.Sprite {
  private kursory: Phaser.Types.Input.Keyboard.CursorKeys;
  zycia = 3;
  punkty = 0;
  private mozePodwojnySkok = false;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, 'capy_idle');
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.setCollideWorldBounds(true);
    this.setBounce(0.1);
    this.kursory = scene.input.keyboard!.createCursorKeys();
  }

  aktualizuj() {
    const body = this.body as Phaser.Physics.Arcade.Body;
    if (this.kursory.left.isDown) {
      this.setVelocityX(-predkosc);
      this.setFlipX(true);
    } else if (this.kursory.right.isDown) {
      this.setVelocityX(predkosc);
      this.setFlipX(false);
    } else {
      this.setVelocityX(0);
    }

    if (body.blocked.down) this.mozePodwojnySkok = true;

    if (Phaser.Input.Keyboard.JustDown(this.kursory.up)) {
      if (body.blocked.down) {
        this.setVelocityY(skok);
      } else if (this.mozePodwojnySkok) {
        this.setVelocityY(skok * 0.8);
        this.mozePodwojnySkok = false;
      }
    }
  }

  trafiony() {
    this.zycia = this.zycia - 1;
    if (this.zycia <= 0) {
      this.scene.scene.restart();
    }
  }
}
