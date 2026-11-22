export type nazwaMotywu = 'meadow' | 'grove' | 'river' | 'sakura' | 'sky' | 'night';

export interface levelDef {
  id: number;
  name: string;
  theme: nazwaMotywu;

  czasPar: number;
  rozmiarOnsenu: number;
  minCheckpointow: number;
  music: { root: string; lead: OscillatorType; vibrato?: boolean; arp?: boolean };

  podpowiedzi: string[];
  mapa: string[];
}

export const znakiTerenu = '.#=^S~w';
export const znakiObiektow = '_CodPKGsMicbhftrLV';
export const legenda = znakiTerenu + znakiObiektow + '|';
export const yuzuWSkrzynce = 5;
