import { grafikaSvg, obrys, art, line, sciezkaGwiazdy, naklejka } from './common';

export function yuzuArt(): grafikaSvg[] {
  const yuzu =
    naklejka(`<path d="M20 12 q9 -12 17 -5 q-6 9 -17 5z" fill="#6BCB77"/><circle cx="20" cy="27" r="14" fill="#FFB627"/>`, 7) +
    `<ellipse cx="15" cy="22" rx="4.5" ry="3" fill="#FFE08A"/>` +
    `<circle cx="24" cy="32" r="1.2" fill="#E8950C"/><circle cx="18" cy="34" r="1.2" fill="#E8950C"/><circle cx="27" cy="26" r="1.2" fill="#E8950C"/>`;

  const melon =
    naklejka(`<path d="M6 18 Q38 0 70 18 L38 62 Z" fill="#FF5D73"/>`) +
    `<path d="M6 18 Q38 0 70 18" stroke="#6BCB77" stroke-width="9" fill="none" stroke-linecap="round"/>` +
    `<path d="M11 22 Q38 8 65 22" stroke="#E9FFDB" stroke-width="3" fill="none" stroke-linecap="round"/>` +
    `<ellipse cx="29" cy="32" rx="2.4" ry="3.6" fill="${obrys}"/><ellipse cx="47" cy="32" rx="2.4" ry="3.6" fill="${obrys}"/><ellipse cx="38" cy="45" rx="2.4" ry="3.6" fill="${obrys}"/>` +
    `<ellipse cx="24" cy="24" rx="5" ry="2.5" fill="#FF9AAA" opacity=".9"/>`;

  const duck =
    naklejka(
      `<ellipse cx="24" cy="35" rx="18" ry="13" fill="#FFE14D"/><circle cx="38" cy="20" r="12" fill="#FFE14D"/><path d="M48 17 l9 4 l-9 4z" fill="#FF9F1C"/>`,
      8,
    ) +
    `<circle cx="41" cy="18" r="2.6" fill="${obrys}"/>` +
    line('M14 33 q8 9 17 0', '#E0AE00', 3) +
    `<ellipse cx="35" cy="25" rx="3.5" ry="2" fill="#FFB0A0" opacity=".8"/>`;

  const bird =
    naklejka(
      `<ellipse cx="22" cy="24" rx="15" ry="12" fill="#7CC6FE"/><circle cx="34" cy="16" r="9" fill="#7CC6FE"/><path d="M42 14 l7 3 l-7 3z" fill="#FFB627"/>`,
      7,
    ) +
    `<circle cx="36" cy="15" r="2" fill="${obrys}"/>` +
    line('M12 24 q8 7 16 -1', '#4B9FE0', 3) +
    `<ellipse cx="24" cy="31" rx="8" ry="4" fill="#EAF6FF"/>`;

  return [
    art('yuzu', 40, 44, yuzu),
    art('melon', 76, 68, melon),
    art('duck', 60, 52, duck),
    art('bird', 52, 40, bird),

    art('p_circle', 24, 24, `<circle cx="12" cy="12" r="10" fill="#fff"/>`),
    art('p_star', 32, 32, `<path d="${sciezkaGwiazdy(16, 17, 14, 6)}" fill="#fff"/>`),
    art('p_rect', 16, 10, `<rect width="16" height="10" rx="2" fill="#fff"/>`),
    art('p_petal', 22, 14, `<path d="M1 7 Q8 -3 21 7 Q8 17 1 7Z" fill="#fff"/>`),
    art('p_leaf', 26, 14, `<path d="M1 7 Q10 -4 25 7 Q10 18 1 7Z" fill="#fff"/><path d="M3 7H22" stroke="#00000022" stroke-width="1.5"/>`),
    art('p_ring', 160, 160, `<circle cx="80" cy="80" r="70" fill="none" stroke="#fff" stroke-width="12"/>`),
    art(
      'p_glow', 48, 48,
      `<defs><radialGradient id="g"><stop offset="0" stop-color="#fff"/><stop offset=".35" stop-color="#fff" stop-opacity=".7"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient></defs><circle cx="24" cy="24" r="24" fill="url(#g)"/>`,
    ),
    art(
      'p_heart', 30, 28,
      `<path d="M15 25 C-4 12 5 -2 15 8 C25 -2 34 12 15 25Z" fill="#FF6FB5" stroke="${obrys}" stroke-width="3" stroke-linejoin="round"/>`,
    ),
    art('p_bubble', 22, 22, `<circle cx="11" cy="11" r="8.5" fill="#ffffff44" stroke="#fff" stroke-width="2.5"/><circle cx="8" cy="8" r="2" fill="#fff"/>`),
    art('p_drop', 16, 22, `<path d="M8 1 Q16 13 8 21 Q0 13 8 1Z" fill="#fff"/>`),
    art('p_streak', 8, 60, `<rect width="8" height="60" rx="4" fill="#fff"/>`),
  ];
}
