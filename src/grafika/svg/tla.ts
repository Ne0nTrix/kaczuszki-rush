import { nazwaMotywu } from '../../poziomy/typy';
import { grafikaSvg, obrys, art, line, sciezkaGwiazdy } from './common';

const szer = 1920;
export const bgHeights = { far: 620, mid: 470, near: 300 };

type skladowa = [amp: number, k: number, phase: number];

function ridge(wys: number, base: number, comps: skladowa[]) {
  const y = (x: number) => base + comps.reduce((s, [a, k, p]) => s + a * Math.sin((x / szer) * Math.PI * 2 * k + p), 0);
  let d = `M0 ${wys} L0 ${y(0).toFixed(1)}`;
  for (let x = 24; x <= szer; x += 24) d += ` L${x} ${y(x).toFixed(1)}`;
  d += ` L${szer} ${wys} Z`;
  return { d, y };
}

const wzgorze = (wys: number, base: number, comps: skladowa[], fill: string, extra = '') => {
  const r = ridge(wys, base, comps);
  return { svg: `<path d="${r.d}" fill="${fill}" ${extra}/>`, y: r.y };
};

const chmurka = (x: number, y: number, s: number, fill: string, shade = '') =>
  `<g transform="translate(${x} ${y}) scale(${s})"><circle cx="-34" cy="6" r="24" fill="${fill}"/><circle cx="0" cy="-8" r="32" fill="${fill}"/><circle cx="36" cy="6" r="24" fill="${fill}"/><rect x="-56" y="4" width="112" height="28" rx="14" fill="${fill}"/>${shade ? `<rect x="-46" y="22" width="92" height="8" rx="4" fill="${shade}"/>` : ''}</g>`;

const drzewko = (x: number, y: number, s: number, korona: string, pien: string, dots = '') =>
  `<g transform="translate(${x} ${y}) scale(${s})"><rect x="-6" y="-56" width="12" height="62" rx="5" fill="${pien}"/><circle cx="0" cy="-84" r="38" fill="${korona}"/><circle cx="-26" cy="-62" r="26" fill="${korona}"/><circle cx="26" cy="-62" r="26" fill="${korona}"/>${dots}</g>`;

const yuzuDots = `<circle cx="-18" cy="-70" r="6" fill="#FFB627"/><circle cx="12" cy="-90" r="6" fill="#FFB627"/><circle cx="22" cy="-60" r="6" fill="#FFB627"/><circle cx="-6" cy="-52" r="6" fill="#FFB627"/>`;
const blossomDots = `<circle cx="-16" cy="-78" r="6" fill="#FFE3F0"/><circle cx="14" cy="-92" r="5" fill="#FFE3F0"/><circle cx="24" cy="-62" r="6" fill="#FFE3F0"/><circle cx="-24" cy="-54" r="5" fill="#FFE3F0"/>`;

const palma = (x: number, y: number, s: number, leaf: string, pien: string) => {
  let liscie = '';
  [-70, -35, 0, 35, 70].forEach((a) => {
    liscie += `<ellipse cx="0" cy="-34" rx="11" ry="40" fill="${leaf}" transform="translate(14 -118) rotate(${a})"/>`;
  });
  return `<g transform="translate(${x} ${y}) scale(${s})"><path d="M-7 6 Q-10 -60 8 -120 L20 -118 Q4 -60 7 6Z" fill="${pien}"/>${liscie}<circle cx="14" cy="-116" r="8" fill="${pien}"/></g>`;
};

const kwiatek = (x: number, y: number, c: string) =>
  `<path d="M${x} ${y} v-18" stroke="#4E9F5B" stroke-width="4" stroke-linecap="round"/><circle cx="${x}" cy="${y - 22}" r="8" fill="${c}"/><circle cx="${x}" cy="${y - 22}" r="3" fill="#FFF6E5"/>`;

const pagoda = (x: number, y: number, s: number, sciana: string, dach: string) => {
  let p = '';
  for (let i = 0; i < 3; i++) {
    const w = 100 - i * 24;
    const yy = -i * 58;
    p += `<rect x="${-w / 2 + 12}" y="${yy - 46}" width="${w - 24}" height="46" fill="${sciana}"/><path d="M${-w / 2 - 14} ${yy - 44} Q0 ${yy - 74} ${w / 2 + 14} ${yy - 44} L${w / 2 - 4} ${yy - 60} H${-w / 2 + 4}Z" fill="${dach}"/>`;
  }
  return `<g transform="translate(${x} ${y}) scale(${s})">${p}<rect x="-3" y="-212" width="6" height="34" fill="${dach}"/></g>`;
};

const domek = (x: number, y: number, w: number, h: number, sciana: string, dach: string, win: string) =>
  `<rect x="${x - w / 2}" y="${y - h}" width="${w}" height="${h + 40}" fill="${sciana}"/>` +
  `<path d="M${x - w / 2 - 22} ${y - h + 4} Q${x} ${y - h - 46} ${x + w / 2 + 22} ${y - h + 4} L${x + w / 2 + 6} ${y - h - 14} H${x - w / 2 - 6}Z" fill="${dach}"/>` +
  `<rect x="${x - 16}" y="${y - h + 26}" width="32" height="28" rx="4" fill="${win}"/>`;

function sunArt(night: boolean): string {
  if (night) {
    return (
      `<defs><radialGradient id="g"><stop offset=".5" stop-color="#FFF3B0" stop-opacity=".45"/><stop offset="1" stop-color="#FFF3B0" stop-opacity="0"/></radialGradient></defs>` +
      `<circle cx="120" cy="120" r="120" fill="url(#g)"/><circle cx="120" cy="120" r="72" fill="#FFF3B0"/>` +
      `<circle cx="92" cy="92" r="12" fill="#F2E08A"/><circle cx="150" cy="150" r="9" fill="#F2E08A"/><circle cx="156" cy="96" r="6" fill="#F2E08A"/>` +
      line('M96 122 q8 6 16 0 M128 122 q8 6 16 0', obrys, 4) + line('M110 142 q10 8 20 0', obrys, 4) +
      `<ellipse cx="92" cy="138" rx="9" ry="5" fill="#FFB0A0" opacity=".7"/><ellipse cx="148" cy="138" rx="9" ry="5" fill="#FFB0A0" opacity=".7"/>`
    );
  }
  let promienie = '';
  for (let i = 0; i < 12; i++) promienie += `<rect x="114" y="6" width="12" height="30" rx="6" fill="#FFE066" transform="rotate(${i * 30} 120 120)"/>`;
  return (
    promienie +
    `<circle cx="120" cy="120" r="70" fill="#FFE066"/><circle cx="120" cy="120" r="70" fill="none" stroke="#FFD23F" stroke-width="6"/>` +
    line('M94 116 q8 -9 16 0 M130 116 q8 -9 16 0', obrys, 4.5) + line('M106 136 q14 12 28 0', obrys, 4.5) +
    `<ellipse cx="90" cy="134" rx="10" ry="6" fill="#FF8FAB" opacity=".7"/><ellipse cx="150" cy="134" rx="10" ry="6" fill="#FF8FAB" opacity=".7"/>`
  );
}

function layers(theme: nazwaMotywu): { far: string; mid: string; near: string } {
  const hFar = bgHeights.far, hMid = bgHeights.mid, hNear = bgHeights.near;
  switch (theme) {
    case 'meadow': {
      const far = wzgorze(hFar, 330, [[60, 2, 0], [24, 5, 1.2]], '#CDEFC9');
      const mid = wzgorze(hMid, 220, [[50, 3, 2], [18, 7, 0.4]], '#A8E0A0');
      const near = wzgorze(hNear, 150, [[34, 4, 1], [12, 9, 2]], '#8FD694');
      let clouds = '';
      [[160, 70, 1.2], [520, 150, 0.9], [900, 60, 1.4], [1300, 170, 1], [1650, 90, 1.2]].forEach(
        ([x, y, s]) => (clouds += chmurka(x, y, s, '#FFFFFF', '#E3F4FF')),
      );
      let drzewa = '';
      [220, 700, 1180, 1620].forEach((x, i) => (drzewa += drzewko(x, mid.y(x) + 8, 1.1 + (i % 2) * 0.3, '#7FCF8A', '#A9713F')));
      let fl = '';
      for (let x = 60; x < szer; x += 130) fl += kwiatek(x, near.y(x) + 6, (x / 130) % 2 ? '#FF8FAB' : '#FFD166');
      return { far: clouds + far.svg, mid: mid.svg + drzewa, near: near.svg + fl };
    }
    case 'grove': {
      const far = wzgorze(hFar, 340, [[50, 2, 1], [20, 6, 0]], '#FFE2B8');
      const mid = wzgorze(hMid, 230, [[40, 3, 0.5], [14, 8, 2]], '#D2E8A2');
      const near = wzgorze(hNear, 160, [[24, 4, 2], [10, 10, 0]], '#B5DB7C');
      let clouds = '';
      [[300, 110, 1.1], [1000, 70, 1.3], [1560, 140, 0.9]].forEach(([x, y, s]) => (clouds += chmurka(x, y, s, '#FFF8EC')));
      let far2 = '';
      [140, 480, 860, 1240, 1700].forEach((x, i) => (far2 += drzewko(x, far.y(x) + 10, 1 + (i % 2) * 0.2, '#C9E08F', '#D9B88C')));
      let drzewa = '';
      [100, 420, 760, 1090, 1400, 1760].forEach((x, i) => (drzewa += drzewko(x, mid.y(x) + 10, 1.25 + (i % 3) * 0.2, '#8CCB5E', '#9A5D38', yuzuDots)));
      let plot = '';
      for (let x = 30; x < szer; x += 96) plot += `<rect x="${x}" y="${near.y(x) - 44}" width="14" height="60" rx="5" fill="#D9A877"/>`;
      const r1 = ridge(hNear, 150, [[24, 4, 2], [10, 10, 0]]);
      let rail = `M0 ${r1.y(0) - 30}`;
      for (let x = 48; x <= szer; x += 48) rail += ` L${x} ${(r1.y(x) - 30).toFixed(1)}`;
      plot += `<path d="${rail}" stroke="#D9A877" stroke-width="9" fill="none"/>`;
      return { far: clouds + far.svg + far2, mid: mid.svg + drzewa, near: plot + near.svg };
    }
    case 'river': {
      const far = wzgorze(hFar, 300, [[80, 2, 2.4], [30, 5, 0]], '#B2E8DC');
      const mid = wzgorze(hMid, 230, [[40, 3, 1], [16, 7, 3]], '#7CCB8A');
      const near = wzgorze(hNear, 170, [[24, 5, 0], [10, 11, 1]], '#5DBB63');

      const fx = 1180;
      const fall =
        `<rect x="${fx - 26}" y="${far.y(fx) - 4}" width="52" height="400" fill="#E8FDFF"/>` +
        `<rect x="${fx - 14}" y="${far.y(fx) - 4}" width="10" height="400" fill="#A6E9F2"/><rect x="${fx + 8}" y="${far.y(fx) - 4}" width="8" height="400" fill="#A6E9F2"/>`;
      let palmy = '';
      [180, 560, 940, 1380, 1740].forEach((x, i) => (palmy += palma(x, mid.y(x) + 10, 1.3 + (i % 2) * 0.35, '#4FAE5E', '#B98049')));
      let krzaki = '';
      for (let x = 80; x < szer; x += 240) krzaki += chmurka(x, near.y(x) - 4, 0.9, '#4FAE5E');
      let palms2 = '';
      [360, 1160].forEach((x) => (palms2 += palma(x, near.y(x) + 10, 1.9, '#3F9F52', '#A67B4E')));
      return { far: far.svg + fall, mid: mid.svg + palmy, near: palms2 + krzaki + near.svg };
    }
    case 'sakura': {
      const far = wzgorze(hFar, 400, [[40, 2, 0], [16, 5, 2]], '#E6D3F7');
      const mid = wzgorze(hMid, 240, [[46, 3, 1.4], [16, 7, 0]], '#E7B8E0');
      const near = wzgorze(hNear, 160, [[28, 4, 0.6], [10, 9, 2.2]], '#C9A2E8');
      const mx = 520;
      const gora =
        `<path d="M${mx - 420} 620 L${mx} 90 L${mx + 420} 620Z" fill="#D5C2F0"/>` +
        `<path d="M${mx - 118} 240 L${mx} 90 L${mx + 118} 240 L${mx + 70} 216 L${mx + 30} 250 L${mx - 10} 214 L${mx - 60} 248Z" fill="#FFFFFF"/>`;
      const pg = pagoda(1420, far.y(1420) + 14, 1.15, '#C9A7E0', '#A77FCB');
      let drzewa = '';
      [120, 470, 820, 1180, 1500, 1800].forEach((x, i) => (drzewa += drzewko(x, mid.y(x) + 10, 1.2 + (i % 3) * 0.2, '#FFB7D5', '#8E6C8A', blossomDots)));
      let trees2 = '';
      [300, 1040, 1660].forEach((x) => (trees2 += drzewko(x, near.y(x) + 12, 1.8, '#FF9CC4', '#76556F', blossomDots)));
      return { far: gora + far.svg + pg, mid: mid.svg + drzewa, near: trees2 + near.svg };
    }
    case 'sky': {
      const cols = ['#FF8FAB', '#FFC56B', '#FFF08A', '#A8E6A1', '#8FD3FF', '#C9A7FF'];
      let tecza = '';
      cols.forEach((c, i) => (tecza += `<path d="M${260 + i * 22} 620 A${700 - i * 22} ${520 - i * 22} 0 0 1 ${1660 - i * 22} 620" stroke="${c}" stroke-width="23" fill="none" opacity=".75"/>`));
      let c1 = '';
      [[200, 420, 1.3], [760, 520, 1.6], [1320, 440, 1.2], [1740, 540, 1.5]].forEach(([x, y, s]) => (c1 += chmurka(x, y, s, '#FFFFFF', '#FFE3F3')));
      const wyspa = (x: number, y: number, s: number) =>
        `<g transform="translate(${x} ${y}) scale(${s})"><path d="M-90 0 Q0 110 90 0Z" fill="#E9C8F5"/><rect x="-96" y="-18" width="192" height="30" rx="15" fill="#FFFFFF"/><circle cx="-40" cy="-20" r="20" fill="#fff"/><circle cx="30" cy="-24" r="26" fill="#fff"/></g>`;
      const balon = (x: number, y: number, c: string) =>
        `<path d="M${x} ${y + 36} q6 30 -4 60" stroke="#8A7AA8" stroke-width="3" fill="none"/><ellipse cx="${x}" cy="${y}" rx="28" ry="36" fill="${c}"/><ellipse cx="${x - 9}" cy="${y - 12}" rx="6" ry="10" fill="#fff" opacity=".6"/>`;
      const mid =
        wyspa(300, 200, 1.2) + wyspa(1040, 280, 1.5) + wyspa(1640, 170, 1) +
        balon(640, 120, '#FF8FAB') + balon(1340, 90, '#FFD166') + balon(1820, 300, '#8FD3FF');
      let near = '';
      for (let x = 0; x <= szer; x += 160) near += chmurka(x, 190 + ((x / 160) % 3) * 22, 2.2, '#FFFFFF', '#FFD1EC');
      near += `<rect x="0" y="230" width="${szer}" height="80" fill="#FFFFFF"/>`;
      return { far: tecza + c1, mid, near };
    }
    default: {
      const far = wzgorze(hFar, 330, [[70, 2, 1], [26, 5, 0]], '#1E2247');
      const mid = wzgorze(hMid, 300, [[18, 2, 0], [8, 6, 1]], '#252352');
      const near = wzgorze(hNear, 170, [[22, 4, 1.4], [10, 9, 0]], '#221D44');
      let stars = '';
      for (let i = 0; i < 46; i++) {
        const x = (i * 397) % szer, y = (i * 211) % 300;
        stars += i % 7 === 0 ? `<path d="${sciezkaGwiazdy(x, y + 10, 7, 3)}" fill="#FFF3B0"/>` : `<circle cx="${x}" cy="${y + 6}" r="${1.5 + (i % 3)}" fill="#FFFFFF" opacity="${0.5 + (i % 4) * 0.12}"/>`;
      }
      let domki = '';
      [[140, 150, 150], [400, 190, 210], [700, 140, 140], [960, 200, 190], [1260, 150, 230], [1540, 180, 160], [1790, 140, 200]].forEach(
        ([x, w, h], i) => (domki += domek(x, 320, w, h, '#2E2B63', '#3D387F', i % 3 === 1 ? '#3D387F' : '#FFD166')),
      );

      let girlanda = '';
      const lc = ['#FF6FB5', '#FFD166', '#8BE8DF'];
      for (let s = 0; s < 4; s++) {
        const x0 = s * 480;
        girlanda += `<path d="M${x0} 30 Q${x0 + 240} 120 ${x0 + 480} 30" stroke="#0E0C1F" stroke-width="4" fill="none"/>`;
        for (let i = 1; i < 6; i++) {
          const t = i / 6;
          const x = x0 + 480 * t;
          const y = 30 + 2 * t * (1 - t) * 90 + 16;
          girlanda += `<circle cx="${x}" cy="${y}" r="26" fill="${lc[(i + s) % 3]}" opacity=".18"/><ellipse cx="${x}" cy="${y}" rx="12" ry="15" fill="${lc[(i + s) % 3]}"/>`;
        }
      }
      let krzaki = '';
      for (let x = 60; x < szer; x += 260) krzaki += chmurka(x, near.y(x) - 2, 1, '#1B1738');
      return { far: stars + far.svg, mid: domki + mid.svg, near: girlanda + krzaki + near.svg };
    }
  }
}

export function tlaSvg(theme: nazwaMotywu): grafikaSvg[] {
  const l = layers(theme);

  const clip = (h: number, cialo: string) =>
    `<clipPath id="k"><rect width="${szer}" height="${h - 4}"/></clipPath><g clip-path="url(#k)">${cialo}</g>`;
  return [
    art(`bg_${theme}_far`, szer, bgHeights.far, clip(bgHeights.far, l.far)),
    art(`bg_${theme}_mid`, szer, bgHeights.mid, clip(bgHeights.mid, l.mid)),
    art(`bg_${theme}_near`, szer, bgHeights.near, clip(bgHeights.near, l.near)),
  ];
}

export function sunArtAll(): grafikaSvg[] {
  return [art('sun', 240, 240, sunArt(false)), art('moon', 240, 240, sunArt(true))];
}
