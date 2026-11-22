import { grafikaSvg, obrys, art, line, naklejka } from './common';

const futro = '#B07A4F';
const brzuch = '#D9A877';
const ciemny = '#5B3A29';
const noga = '#8F5F3B';
const noga2 = '#7A5033';
const powieka = '#9C6A43';

type typOka = 'half' | 'closed' | 'happy' | 'dizzy';

export const capyW = 132;
export const capyH = 104;
export const capyFeet = 100;

const leg = (x: number, rot: number, far: boolean): string =>
  `<rect x="${x}" y="72" width="15" height="26" rx="7.5" fill="${far ? noga2 : noga}" transform="rotate(${rot} ${x + 7.5} 76)"/>`;

function eye(kind: typOka): string {
  switch (kind) {
    case 'closed':
      return line('M84 33 q6 5 12 0', obrys, 3);
    case 'happy':
      return line('M84 36 q6 -9 12 0', obrys, 3);
    case 'dizzy':
      return line('M84 33 a6 6 0 1 1 6 6 a4 4 0 1 1 -4 -4 a2 2 0 1 1 2 2', obrys, 2.2);
    default:
      return (
        `<circle cx="90" cy="33" r="5.5" fill="${obrys}"/><circle cx="91.6" cy="34.6" r="1.5" fill="#fff"/>` +
        `<path d="M83 33 a7 7 0 0 1 14 0z" fill="${powieka}"/>` +
        line('M83 33h14', obrys, 2.5)
      );
  }
}

function face(kind: typOka, rumieniec: boolean): string {
  return (
    `<rect x="98" y="36" width="22" height="26" rx="10" fill="${brzuch}"/>` +
    `<ellipse cx="109" cy="42" rx="2.2" ry="3" fill="${ciemny}"/><ellipse cx="116" cy="42" rx="2.2" ry="3" fill="${ciemny}"/>` +
    line('M103 54 q5 4 10 0', ciemny, 2.5) +
    eye(kind) +
    (rumieniec ? `<ellipse cx="88" cy="46" rx="6" ry="3.5" fill="#FF8FAB" opacity=".8"/>` : '')
  );
}

const ucho = `<ellipse cx="78" cy="16" rx="8" ry="8" fill="${ciemny}"/>`;
const glowa = `<rect x="66" y="14" width="58" height="52" rx="20" fill="${futro}"/>`;

function capy(nogi: [number, number, number, number], kind: typOka, rumieniec = false): string {
  const ksztalty =
    leg(40, nogi[1], true) + leg(94, nogi[3], true) + leg(22, nogi[0], false) + leg(76, nogi[2], false) +
    ucho +
    `<rect x="10" y="30" width="96" height="58" rx="28" fill="${futro}"/>` +
    glowa;
  return (
    naklejka(ksztalty) +
    `<ellipse cx="54" cy="80" rx="28" ry="7" fill="${brzuch}" opacity=".85"/>` +
    line('M24 40 q22 -9 40 -4', '#C99668', 5) +
    face(kind, rumieniec)
  );
}

function plop(): string {
  return (
    naklejka(
      `<ellipse cx="38" cy="24" rx="8" ry="8" fill="${ciemny}"/><circle cx="66" cy="54" r="40" fill="${futro}"/>`,
    ) +
    `<ellipse cx="70" cy="64" rx="24" ry="20" fill="${brzuch}" opacity=".85"/>` +
    line('M56 42 l8 4 l-8 4', obrys, 3) + line('M88 42 l-8 4 l8 4', obrys, 3) +
    line('M66 58 q5 4 10 0', ciemny, 2.5) +
    `<ellipse cx="50" cy="84" rx="7" ry="5" fill="${noga}"/><ellipse cx="84" cy="84" rx="7" ry="5" fill="${noga}"/>` +
    line('M40 28 q14 -12 34 -8', '#C99668', 5)
  );
}

function relax(): string {
  return `<g transform="translate(0 34)">${naklejka(ucho + glowa)}${face('closed', true)}</g>`;
}

export function kapibaraSvg(): grafikaSvg[] {
  const a = (key: string, cialo: string) => art(key, capyW, capyH, cialo);
  return [
    a('capy_idle', capy([0, 0, 0, 0], 'half')),
    a('capy_run_a', capy([28, -22, -28, 22], 'half')),
    a('capy_run_b', capy([-28, 22, 28, -22], 'half')),
    a('capy_jump', capy([36, 30, -36, -30], 'half')),
    a('capy_fall', capy([-22, -16, 22, 16], 'half')),
    a('capy_plop', plop()),
    a('capy_happy', capy([0, 0, 0, 0], 'happy', true)),
    a('capy_sleep', capy([0, 0, 0, 0], 'closed')),
    a('capy_dizzy', capy([-22, -16, 22, 16], 'dizzy')),
    a('capy_relax', relax()),
  ];
}
