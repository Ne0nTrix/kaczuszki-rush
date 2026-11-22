import Phaser from 'phaser';
import { kolory, warstwy, gameH, gameW } from '../ustawienia';
import type { typAmbientu } from '../poziomy/motywy';
import { napis } from '../ui';

type emiter = Phaser.GameObjects.Particles.ParticleEmitter;

const koloryKonfetti = [0xff6fb5, 0xffd166, 0x6bcb77, 0x8fd3ff, 0xffb627, 0xc9a7ff];

export class efekty {
  private dust: emiter;
  private spark: emiter;
  private conf: emiter;
  private starE: emiter;
  private heart: emiter;
  private splinter: emiter;
  private bubble: emiter;
  private drop: emiter;
  private steam: emiter;
  hitstop = 0;

  constructor(private scene: Phaser.Scene) {
    const mk = (tex: string, cfg: Phaser.Types.GameObjects.Particles.ParticleEmitterConfig): emiter =>
      scene.add.particles(0, 0, tex, { emitting: false, ...cfg }).setDepth(warstwy.fx);

    this.dust = mk('p_circle', {
      speed: { min: 40, max: 170 }, angle: { min: 200, max: 340 }, lifespan: { min: 260, max: 460 },
      scale: { start: 0.9, end: 0 }, alpha: { start: 0.85, end: 0 }, gravityY: -60, maxAliveParticles: 90,
    });
    this.spark = mk('p_star', {
      speed: { min: 150, max: 330 }, lifespan: 340, scale: { start: 0.7, end: 0 }, rotate: { min: 0, max: 360 },
      tint: [0xffe08a, 0xffb627, 0xffffff], maxAliveParticles: 80,
    });
    this.conf = mk('p_rect', {
      speed: { min: 220, max: 620 }, angle: { min: 200, max: 340 }, lifespan: { min: 600, max: 1000 },
      gravityY: 1300, rotate: { start: 0, end: 720 }, scale: { start: 1.3, end: 0.6 }, tint: koloryKonfetti, maxAliveParticles: 120,
    });
    this.starE = mk('p_star', {
      speed: { min: 180, max: 420 }, lifespan: { min: 450, max: 750 }, gravityY: 500,
      scale: { start: 1, end: 0 }, rotate: { start: 0, end: 360 }, tint: [0xffd166, 0xfff3b0, 0xff6fb5], maxAliveParticles: 80,
    });
    this.heart = mk('p_heart', {
      speedY: { min: -260, max: -120 }, speedX: { min: -90, max: 90 }, lifespan: 800,
      scale: { start: 1.1, end: 0.3 }, alpha: { start: 1, end: 0 }, maxAliveParticles: 30,
    });
    this.splinter = mk('p_rect', {
      speed: { min: 220, max: 560 }, angle: { min: 190, max: 350 }, lifespan: 700, gravityY: 1600,
      rotate: { start: 0, end: 540 }, scale: { start: 1.8, end: 1 }, tint: [0xe0a96d, 0xa8703d, 0xcf9558], maxAliveParticles: 60,
    });
    this.bubble = mk('p_bubble', {
      speedY: { min: -170, max: -70 }, speedX: { min: -40, max: 40 }, lifespan: { min: 500, max: 900 },
      scale: { start: 0.5, end: 1 }, alpha: { start: 0.9, end: 0 }, maxAliveParticles: 40,
    });
    this.drop = mk('p_drop', {
      speed: { min: 260, max: 640 }, angle: { min: 230, max: 310 }, lifespan: 650, gravityY: 1700,
      scale: { start: 1, end: 0.4 }, tint: [0x8fe3f0, 0xe8fdff, 0x4dd0e1], maxAliveParticles: 90,
    });
    this.steam = mk('p_circle', {
      speedY: { min: -80, max: -40 }, speedX: { min: -16, max: 16 }, lifespan: { min: 1400, max: 2200 },
      scale: { start: 0.8, end: 2.6 }, alpha: { start: 0.5, end: 0 }, maxAliveParticles: 40,
    });
  }

  trzesienie(moc: number, ms: number): void {
    this.scene.cameras.main.shake(ms, moc);
  }

  stop(ms: number): void {
    this.hitstop = Math.max(this.hitstop, ms / 1000);
  }

  blysk(): void {
    this.scene.cameras.main.flash(90, 255, 255, 255);
  }

  puff(x: number, y: number, n: number): void {
    this.dust.emitParticleAt(x, y, n);
  }
  sparks(x: number, y: number, n = 8): void {
    this.spark.emitParticleAt(x, y, n);
  }
  konfetti(x: number, y: number, n = 16): void {
    this.conf.emitParticleAt(x, y, n);
  }
  stars(x: number, y: number, n = 10): void {
    this.starE.emitParticleAt(x, y, n);
  }
  serduszka(x: number, y: number, n = 5): void {
    this.heart.emitParticleAt(x, y, n);
  }
  drzazgi(x: number, y: number, n = 10): void {
    this.splinter.emitParticleAt(x, y, n);
  }
  babelki(x: number, y: number, n = 3): void {
    this.bubble.emitParticleAt(x, y, n);
  }
  splash(x: number, y: number, n = 14): void {
    this.drop.emitParticleAt(x, y, n);
  }
  steamAt(x: number, y: number, n = 1): void {
    this.steam.emitParticleAt(x, y, n);
  }

  pierscien(x: number, y: number, tint = 0xffffff): void {
    const r = this.scene.add.image(x, y, 'p_ring').setDepth(warstwy.fx).setScale(0.2, 0.08).setTint(tint);
    this.scene.tweens.add({ targets: r, scaleX: 2.6, scaleY: 0.9, alpha: 0, duration: 380, ease: 'Cubic.Out', onComplete: () => r.destroy() });
  }

  text(x: number, y: number, s: string, color: string = kolory.cream, size = 44): Phaser.GameObjects.Text {
    const t = napis(this.scene, x, y, s, size, color).setDepth(warstwy.text).setScale(0.3);
    this.scene.tweens.add({ targets: t, scale: 1, duration: 160, ease: 'Back.Out' });
    this.scene.tweens.add({ targets: t, y: y - 90, alpha: 0, duration: 700, delay: 220, ease: 'Sine.In', onComplete: () => t.destroy() });
    return t;
  }
}

export function ambient(scene: Phaser.Scene, kind: typAmbientu, depth = warstwy.fx - 1): emiter {
  const all = { min: 0, max: gameW };
  let tex = 'p_circle';
  let cfg: Phaser.Types.GameObjects.Particles.ParticleEmitterConfig;
  switch (kind) {
    case 'leaves':
      tex = 'p_leaf';
      cfg = {
        x: { min: 0, max: gameW + 300 }, y: -30, lifespan: 9000, speedY: { min: 70, max: 140 }, speedX: { min: -90, max: -10 },
        rotate: { start: 0, end: 540 }, scale: { min: 0.7, max: 1.2 }, frequency: 420, tint: [0x8ccb5e, 0xffb627, 0xd9a05b],
      };
      break;
    case 'petals':
      tex = 'p_petal';
      cfg = {
        x: { min: 0, max: gameW + 300 }, y: -30, lifespan: 9000, speedY: { min: 70, max: 150 }, speedX: { min: -110, max: -20 },
        rotate: { start: 0, end: 720 }, scale: { min: 0.7, max: 1.3 }, frequency: 170, tint: [0xffb7d5, 0xffd6e8, 0xffffff],
      };
      break;
    case 'glints':
      tex = 'p_star';
      cfg = {
        x: all, y: { min: 380, max: gameH }, lifespan: 900, scale: { start: 0.6, end: 0 }, rotate: { min: 0, max: 90 },
        frequency: 230, tint: [0xffffff, 0xe8fdff],
      };
      break;
    case 'sparkles':
      tex = 'p_star';
      cfg = {
        x: all, y: { min: 0, max: gameH }, lifespan: 1300, scale: { start: 0.7, end: 0 }, rotate: { start: 0, end: 180 },
        frequency: 140, tint: [0xffffff, 0xffe9a8, 0xffc6e5, 0xcdf3ff],
      };
      break;
    case 'fireflies':
      tex = 'p_glow';
      cfg = {
        x: all, y: { min: 150, max: gameH }, lifespan: 4200, speed: { min: 10, max: 45 }, scale: { min: 0.3, max: 0.75 },
        alpha: { start: 1, end: 0 }, frequency: 150, tint: 0xf9f871, blendMode: 'ADD',
      };
      break;
    default:
      cfg = {
        x: all, y: { min: 250, max: gameH }, lifespan: 6000, speedY: { min: -34, max: -8 }, speedX: { min: -20, max: 34 },
        scale: { min: 0.15, max: 0.42 }, alpha: { start: 0.75, end: 0 }, frequency: 240, tint: [0xfff6c9, 0xffffff, 0xffd166],
      };
  }
  return scene.add.particles(0, 0, tex, cfg).setScrollFactor(0).setDepth(depth);
}

export class fajerwerki {
  private e: emiter;
  constructor(private scene: Phaser.Scene, depth = warstwy.fireworks) {
    this.e = scene.add
      .particles(0, 0, 'p_glow', {
        emitting: false, speed: { min: 90, max: 380 }, lifespan: { min: 700, max: 1100 }, gravityY: 220,
        scale: { start: 0.7, end: 0 }, blendMode: 'ADD', maxAliveParticles: 260,
      })
      .setScrollFactor(0)
      .setDepth(depth);
  }
  wybuch(x: number, y: number): void {
    this.e.setParticleTint(Phaser.Utils.Array.GetRandom(koloryKonfetti));
    this.e.emitParticleAt(x, y, 44);
  }
}
