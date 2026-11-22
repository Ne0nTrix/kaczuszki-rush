import Phaser from 'phaser';
import { audio } from './audio/dzwieki';

type nazwaAkcji =
  | 'left' | 'right' | 'up' | 'down' | 'jump' | 'restart' | 'pause' | 'mute'
  | 'confirm' | 'back' | 'levels' | 'next' | 'warp' | 'any';

const klawisze = 'LEFT,RIGHT,UP,DOWN,A,D,W,S,Z,SPACE,R,ESC,P,M,L,N,K,ENTER';

export class sterowanie {
  private keys: Record<string, Phaser.Input.Keyboard.Key>;
  private cur: Partial<Record<nazwaAkcji, boolean>> = {};
  private prev: Partial<Record<nazwaAkcji, boolean>> = {};
  private first = true;
  private zatrzask: Record<string, boolean> = {};

  constructor(private scene: Phaser.Scene) {
    this.keys = scene.input.keyboard!.addKeys(klawisze) as Record<string, Phaser.Input.Keyboard.Key>;
    for (const name in this.keys) this.keys[name].on('down', () => (this.zatrzask[name] = true));
  }

  update() {
    const k: Record<string, { isDown: boolean }> = {};
    for (const name in this.keys) {
      k[name] = { isDown: this.keys[name].isDown || !!this.zatrzask[name] };
      this.zatrzask[name] = false;
    }
    let pad: Phaser.Input.Gamepad.Gamepad | undefined;
    try {
      const gp = this.scene.input.gamepad;
      if (gp && gp.total > 0) pad = gp.getPad(0);
    } catch {
      pad = undefined;
    }
    const ax = pad && pad.axes.length > 0 ? pad.axes[0].getValue() : 0;
    const ay = pad && pad.axes.length > 1 ? pad.axes[1].getValue() : 0;
    const btn = (i: number) => !!(pad && pad.buttons[i] && pad.buttons[i].pressed);
    const c: Partial<Record<nazwaAkcji, boolean>> = {
      left: k.LEFT.isDown || k.A.isDown || !!pad?.left || ax < -0.4,
      right: k.RIGHT.isDown || k.D.isDown || !!pad?.right || ax > 0.4,
      up: k.UP.isDown || k.W.isDown || !!pad?.up || ay < -0.6,
      down: k.DOWN.isDown || k.S.isDown || !!pad?.down || ay > 0.6 || btn(1),
      jump: k.SPACE.isDown || k.W.isDown || k.UP.isDown || k.Z.isDown || btn(0),
      restart: k.R.isDown || btn(3),
      pause: k.ESC.isDown || k.P.isDown || btn(9),
      mute: k.M.isDown,
      confirm: k.SPACE.isDown || k.ENTER.isDown || btn(0),
      back: k.ESC.isDown || btn(1),
      levels: k.L.isDown,
      next: k.N.isDown,
      warp: k.K.isDown,
    };
    c.any = Object.values(c).some(Boolean);
    this.prev = this.first ? c : this.cur;
    this.cur = c;
    this.first = false;
    if (this.wcisniety('mute')) audio.przelaczWyciszenie();
  }

  reset() {
    this.first = true;
    this.zatrzask = {};
  }

  trzyma(n: nazwaAkcji): boolean {
    return !!this.cur[n];
  }

  wcisniety(n: nazwaAkcji): boolean {
    return !!this.cur[n] && !this.prev[n];
  }

  czyCokolwiek(): boolean {
    return this.trzyma('any');
  }

  get osX(): number {
    return (this.cur.right ? 1 : 0) - (this.cur.left ? 1 : 0);
  }
}
