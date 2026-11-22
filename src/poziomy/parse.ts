import { levelDef, znakiObiektow, yuzuWSkrzynce } from "./typy";

export interface spawnInfo {
  ch: string;
  col: number;
  row: number;
}

export interface parsedLevel {
  w: number;
  h: number;

  siatka: string[][];

  lim: boolean[][];
  obiekty: spawnInfo[];
  wszystkieYuzu: number;
}

const isWater = (c: string) => c === '~' || c === 'w';
const isObj = (c: string) => znakiObiektow.includes(c) || c === '|';

export function parsujPoziom(def: levelDef): parsedLevel {
  const surowe = def.mapa;
  const h = surowe.length;
  const w = surowe[0].length;
  const grid: string[][] = [];
  const lim: boolean[][] = [];
  const objects: spawnInfo[] = [];
  let totalYuzu = 0;

  for (let r = 0; r < h; r++) {
    grid.push(new Array<string>(w).fill('.'));
    lim.push(new Array<boolean>(w).fill(false));
    for (let c = 0; c < w; c++) {
      const ch = surowe[r][c] ?? '.';
      if (!isObj(ch)) {
        grid[r][c] = ch;
        continue;
      }
      if (ch === '|') lim[r][c] = true;
      else objects.push({ ch, col: c, row: r });
      if (ch === 'o') totalYuzu += 1;
      if (ch === 'C') totalYuzu += yuzuWSkrzynce;

      let l = c - 1;
      while (l >= 0 && isObj(surowe[r][l])) l--;
      let rr = c + 1;
      while (rr < w && isObj(surowe[r][rr])) rr++;
      const left = l >= 0 ? surowe[r][l] : '#';
      const right = rr < w ? surowe[r][rr] : '#';
      const nad = r > 0 ? grid[r - 1][c] : '.';
      const pod = r + 1 < h ? surowe[r + 1][c] : '#';
      if (ch === 'r') grid[r][c] = '~';
      else if (left === '~' || right === '~') grid[r][c] = '~';
      else if (left === 'w' || right === 'w' || isWater(nad) || pod === 'w') grid[r][c] = 'w';
    }
  }
  return { w, h, siatka: grid, lim, obiekty: objects, wszystkieYuzu: totalYuzu };
}

export class swiat {
  w: number;
  h: number;
  siatka: string[][];
  lim: boolean[][];
  skrzynki = new Map<number, unknown>();

  constructor(p: parsedLevel) {
    this.w = p.w;
    this.h = p.h;
    this.siatka = p.siatka;
    this.lim = p.lim;
  }

  key(c: number, r: number): number {
    return r * this.w + c;
  }

  ch(c: number, r: number): string {
    if (c < 0 || c >= this.w) return '#';
    if (r < 0 || r >= this.h) return '.';
    return this.siatka[r][c];
  }

  twardy(c: number, r: number): boolean {
    return this.ch(c, r) === '#' || this.skrzynki.has(this.key(c, r));
  }

  jednostronny(c: number, r: number): boolean {
    return this.ch(c, r) === '=';
  }

  water(c: number, r: number): boolean {
    const ch = this.ch(c, r);
    return ch === '~' || ch === 'w';
  }

  limit(c: number, r: number): boolean {
    if (c < 0 || c >= this.w || r < 0 || r >= this.h) return false;
    return this.lim[r][c];
  }

  floor(c: number, r: number): boolean {
    return this.twardy(c, r) || this.jednostronny(c, r);
  }
}
