export const gameW = 1920;
export const gameH = 1080;
export const kafel = 96;
export const czcionka = 'Fredoka';
export const wersja = '0.9.2';
export const maxZycia = 3; // nieuzywane, patrz todo
export let pokazHitboxy = false;

export const fizyka = {
  grawitacja: 3000, // bylo 2400 ale skok byl za "ksiezycowy"
  predkoscBiegu: 576,
  groundAccel: 4200,
  groundDecel: 5200,
  airAccel: 3000,
  airDecel: 1600,
  silaSkoku: -1360,
  //silaSkoku: -1250,
  jumpCut: 0.45,
  // w sekundach
  coyoteTime: 0.1,
  jumpBuffer: 0.12,
  maxSpadanie: 1700,
  springVelocity: -2000,
  stompBounce: -1000,
  stompBounceHeld: -1400,
  cloudBounce: -1150,
  plopHang: 0.12,
  plopSpeed: 2400,
  czasNietykalnosci: 1.5,
  hitW: 72,
  hitH: 60,
  swimVelocity: -760,
  swimExitVelocity: -1250,
  grawitacjaWody: 0.3,
  waterMaxFall: 220,
  waterSpeed: 0.7,
  czasArbuza: 6,
  melonSpeed: 1.4,
  sleepAfter: 5,
};

export const stackCfg = {
  rozstaw: 30,
  zgniecione: 18,
  maxWidocznych: 30,
  maxRozsypanych: 12,
};

export const glosnosc = { music: 0.25, sfx: 0.5 };

export const kolory = {
  outline: '#3D2C2E',
  outlineN: 0x3d2c2e,
  cream: '#FFF6E5',
  creamN: 0xfff6e5,
  accent: '#FF6FB5',
  accentN: 0xff6fb5,
  yuzu: '#FFB627',
  yuzuN: 0xffb627,
  leaf: '#6BCB77',
  water: 0x3fbfd8,
  waterDeep: 0x26a6c9,
};

// kolejnosc rysowania (depth), wieksze = blizej
export const warstwy = {
  sky: -100,
  sun: -95,
  far: -90,
  fireworks: -70,
  waterBack: -2,
  tiles: 0,
  deco: 1,
  objBack: 4,
  obj: 6,
  enemy: 10,
  duck: 18,
  player: 20,
  stack: 21,
  objFront: 24,
  water: 25,
  secret: 30,
  fx: 35,
  text: 40,
};
