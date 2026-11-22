export const obrys = '#3D2C2E';

export interface grafikaSvg {
  key: string;
  w: number;
  h: number;
  svg: string;
}

export const svg = (w: number, h: number, cialo: string): string =>
  `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">${cialo}</svg>`;

export const art = (key: string, w: number, h: number, cialo: string): grafikaSvg => ({ key, w, h, svg: svg(w, h, cialo) });

export const naklejka = (ksztalty: string, sw = 10, color = obrys): string =>
  `<g stroke="${color}" stroke-width="${sw}" stroke-linejoin="round" stroke-linecap="round">${ksztalty}</g><g>${ksztalty}</g>`;

export const line = (d: string, color = obrys, sw = 3): string =>
  `<path d="${d}" stroke="${color}" stroke-width="${sw}" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`;

export function sciezkaGwiazdy(cx: number, cy: number, rZewn: number, r: number, n = 5): string {
  let d = '';
  for (let i = 0; i < n * 2; i++) {
    const rad = i % 2 === 0 ? rZewn : r;
    const a = (Math.PI * i) / n - Math.PI / 2;
    d += `${i === 0 ? 'M' : 'L'}${(cx + Math.cos(a) * rad).toFixed(1)} ${(cy + Math.sin(a) * rad).toFixed(1)}`;
  }
  return d + 'Z';
}
