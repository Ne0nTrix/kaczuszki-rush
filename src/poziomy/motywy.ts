import { nazwaMotywu } from './typy';

export type typAmbientu = 'pollen' | 'leaves' | 'glints' | 'petals' | 'sparkles' | 'fireflies';

export interface motyw {
  key: nazwaMotywu;
  sky: [string, string];
  trawa: string;
  trawaJasna: string;
  ziemia: string;
  ziemiaCiemna: string;
  deska: string;
  deskaCiemna: string;
  kolec: string;
  outline: string;

  plat: 'wood' | 'lily' | 'cloud';
  crumble: 'mochi' | 'puff';
  spring: 'spring' | 'spring_sky';
  checkpoint: 'towel' | 'lantern';
  secret: 'wall' | 'waterfall';
  ambient: typAmbientu;
  decoTint: number[];
  night: boolean;
}

export const motywy: Record<nazwaMotywu, motyw> = {
  meadow: {
    key: 'meadow', sky: ['#BDEBFF', '#E9F9FF'], trawa: '#7BD389', trawaJasna: '#A8E6A1',
    ziemia: '#C68B59', ziemiaCiemna: '#A9713F', deska: '#E0A96D', deskaCiemna: '#B98049', kolec: '#4E9F5B',
    outline: '#3D2C2E', plat: 'wood', crumble: 'mochi', spring: 'spring', checkpoint: 'towel',
    secret: 'wall', ambient: 'pollen', decoTint: [0xff8fab, 0xffd166, 0xffffff], night: false,
  },
  grove: {
    key: 'grove', sky: ['#FFE3C2', '#FFF4E0'], trawa: '#A5D86E', trawaJasna: '#C8EB96',
    ziemia: '#B9774E', ziemiaCiemna: '#9A5D38', deska: '#C98B5B', deskaCiemna: '#A46A3F', kolec: '#5C9A3E',
    outline: '#3D2C2E', plat: 'wood', crumble: 'mochi', spring: 'spring', checkpoint: 'towel',
    secret: 'wall', ambient: 'leaves', decoTint: [0xffb627, 0xffffff, 0xffe08a], night: false,
  },
  river: {
    key: 'river', sky: ['#C8F7F0', '#EFFFFB'], trawa: '#5DBB63', trawaJasna: '#8ED98F',
    ziemia: '#F6D7A7', ziemiaCiemna: '#E0B97F', deska: '#C99A6B', deskaCiemna: '#A67B4E', kolec: '#3F8F52',
    outline: '#3D2C2E', plat: 'lily', crumble: 'mochi', spring: 'spring', checkpoint: 'towel',
    secret: 'waterfall', ambient: 'glints', decoTint: [0xff8fab, 0xffffff, 0xfff3a3], night: false,
  },
  sakura: {
    key: 'sakura', sky: ['#FFD6E8', '#F3E8FF'], trawa: '#B79CED', trawaJasna: '#D3C0F7',
    ziemia: '#8E6C8A', ziemiaCiemna: '#76556F', deska: '#B5838D', deskaCiemna: '#93636E', kolec: '#7A5BB5',
    outline: '#3D2C2E', plat: 'wood', crumble: 'mochi', spring: 'spring', checkpoint: 'towel',
    secret: 'wall', ambient: 'petals', decoTint: [0xffb7d5, 0xffffff, 0xffd6e8], night: false,
  },
  sky: {
    key: 'sky', sky: ['#B8E1FF', '#E8C5FF'], trawa: '#FFFFFF', trawaJasna: '#FFFFFF',
    ziemia: '#FFE3F3', ziemiaCiemna: '#FFD1EC', deska: '#FFC6E5', deskaCiemna: '#F7A8D4', kolec: '#B78CE0',
    outline: '#6E5791', plat: 'cloud', crumble: 'puff', spring: 'spring_sky', checkpoint: 'towel',
    secret: 'wall', ambient: 'sparkles', decoTint: [0xffffff, 0xffe9a8, 0xcdf3ff], night: false,
  },
  night: {
    key: 'night', sky: ['#141833', '#2E2350'], trawa: '#4FD1C5', trawaJasna: '#8BE8DF',
    ziemia: '#3B3355', ziemiaCiemna: '#2E2745', deska: '#6A5A8E', deskaCiemna: '#4C3F6B', kolec: '#2F8F8A',
    outline: '#15122A', plat: 'wood', crumble: 'mochi', spring: 'spring', checkpoint: 'lantern',
    secret: 'wall', ambient: 'fireflies', decoTint: [0xff6fb5, 0xffd166, 0x8be8df], night: true,
  },
};
