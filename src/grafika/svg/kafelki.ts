import { motyw } from '../../poziomy/motywy';
import { svg } from './common';

export const tileset = {
  kafleZiemi: 0,
  kaflePlatform: 16,
  kafleKolcow: 20,
  liczbaKafli: 21,
  margines: 2,
  rozstaw: 4,
};

export function kafelZiemi(th: motyw, mask: number): string {
  const odGory = !!(mask & 1), odPrawej = !!(mask & 2), odDolu = !!(mask & 4), odLewej = !!(mask & 8);
  const o = 2.5, r = 22, skalaS = 96;
  const x0 = odLewej ? o : 0, x1 = odPrawej ? skalaS - o : skalaS, y0 = odGory ? o : 0, y1 = odDolu ? skalaS - o : skalaS;
  const tl = odGory && odLewej, tr = odGory && odPrawej, br = odDolu && odPrawej, bl = odDolu && odLewej;
  const arc = (x: number, y: number) => `A${r} ${r} 0 0 1 ${x} ${y}`;
  const cialo =
    `M${x0 + (tl ? r : 0)} ${y0} L${x1 - (tr ? r : 0)} ${y0} ${tr ? arc(x1, y0 + r) : ''} ` +
    `L${x1} ${y1 - (br ? r : 0)} ${br ? arc(x1 - r, y1) : ''} ` +
    `L${x0 + (bl ? r : 0)} ${y1} ${bl ? arc(x0, y1 - r) : ''} ` +
    `L${x0} ${y0 + (tl ? r : 0)} ${tl ? arc(x0 + r, y0) : ''} Z`;
  let krawedz = '';
  if (odGory) krawedz += `M${x0 + (tl ? r : 0)} ${y0} L${x1 - (tr ? r : 0)} ${y0} ${tr ? arc(x1, y0 + r) : ''} `;
  if (odPrawej) krawedz += `M${x1} ${y0 + (tr ? r : 0)} L${x1} ${y1 - (br ? r : 0)} ${br ? arc(x1 - r, y1) : ''} `;
  if (odDolu) krawedz += `M${x1 - (br ? r : 0)} ${y1} L${x0 + (bl ? r : 0)} ${y1} ${bl ? arc(x0, y1 - r) : ''} `;
  if (odLewej) krawedz += `M${x0} ${y1 - (bl ? r : 0)} L${x0} ${y0 + (tl ? r : 0)} ${tl ? arc(x0 + r, y0) : ''} `;
  const g = 26;
  const grass = odGory
    ? `<path d="M0 0H96V${g}Q84 ${g + 10} 72 ${g}T48 ${g}T24 ${g}T0 ${g}Z" fill="${th.trawa}"/>` +
      `<path d="M10 ${y0 + 9}H86" stroke="${th.trawaJasna}" stroke-width="5" stroke-linecap="round" opacity=".8"/>`
    : '';
  const kropki =
    `<rect x="18" y="52" width="16" height="8" rx="4" fill="${th.ziemiaCiemna}"/>` +
    `<rect x="58" y="70" width="20" height="8" rx="4" fill="${th.ziemiaCiemna}"/>` +
    (odGory ? '' : `<rect x="46" y="18" width="14" height="8" rx="4" fill="${th.ziemiaCiemna}"/><rect x="10" y="84" width="12" height="6" rx="3" fill="${th.ziemiaCiemna}" opacity=".7"/>`);
  return svg(
    96, 96,
    `<clipPath id="c"><path d="${cialo}"/></clipPath>` +
      `<g clip-path="url(#c)"><rect width="96" height="96" fill="${th.ziemia}"/>${kropki}${grass}</g>` +
      (krawedz ? `<path d="${krawedz}" stroke="${th.outline}" stroke-width="5" fill="none" stroke-linecap="butt"/>` : ''),
  );
}

export function oneWayTile(th: motyw, hasL: boolean, hasR: boolean): string {
  const x0 = hasL ? -14 : 2.5;
  const x1 = hasR ? 110 : 93.5;
  return svg(
    96, 96,
    `<rect x="${x0}" y="2.5" width="${x1 - x0}" height="26" rx="11" fill="${th.deska}" stroke="${th.outline}" stroke-width="5"/>` +
      `<path d="M${hasL ? 0 : 14} 11 H${hasR ? 96 : 82}" stroke="${th.trawaJasna}" stroke-width="4" stroke-linecap="round" opacity=".55"/>` +
      `<path d="M${hasL ? 0 : 16} 21 H${hasR ? 96 : 80}" stroke="${th.deskaCiemna}" stroke-width="4" stroke-linecap="round"/>` +
      (hasL ? '' : `<circle cx="14" cy="15" r="3" fill="${th.deskaCiemna}"/>`) +
      (hasR ? '' : `<circle cx="82" cy="15" r="3" fill="${th.deskaCiemna}"/>`),
  );
}

export function kafelKolcow(th: motyw): string {
  return svg(
    96, 96,
    `<path d="M2 96 L12 50 L24 78 L36 42 L48 78 L60 46 L72 78 L84 52 L94 96 Z" fill="${th.kolec}" stroke="${th.outline}" stroke-width="5" stroke-linejoin="round"/>` +
      `<path d="M12 56 l0 8 M36 48 l0 8 M60 52 l0 8 M84 58 l0 8" stroke="#ffffff" stroke-width="4" stroke-linecap="round" opacity=".6"/>` +
      `<circle cx="24" cy="88" r="4" fill="${th.trawaJasna}" opacity=".7"/><circle cx="70" cy="90" r="4" fill="${th.trawaJasna}" opacity=".7"/>`,
  );
}

export function tilesetSvgs(th: motyw): string[] {
  const out: string[] = [];
  for (let m = 0; m < 16; m++) out.push(kafelZiemi(th, m));
  for (let v = 0; v < 4; v++) out.push(oneWayTile(th, !!(v & 1), !!(v & 2)));
  out.push(kafelKolcow(th));
  return out;
}
