import { grafikaSvg, obrys, art, line, sciezkaGwiazdy, naklejka } from './common';

export function uiArt(): grafikaSvg[] {
  return [
    art(
      'star_full', 110, 110,
      naklejka(`<path d="${sciezkaGwiazdy(55, 58, 46, 21)}" fill="#FFD166"/>`, 12) + line('M40 44 l10 -16', '#FFF3B0', 6),
    ),
    art('star_empty', 110, 110, `<path d="${sciezkaGwiazdy(55, 58, 46, 21)}" fill="#3D2C2E" opacity=".22" stroke="${obrys}" stroke-opacity=".35" stroke-width="6" stroke-linejoin="round"/>`),
    art('px', 4, 4, `<rect width="4" height="4" fill="#fff"/>`),
  ];
}
