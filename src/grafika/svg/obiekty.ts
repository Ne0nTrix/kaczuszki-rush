import { grafikaSvg, obrys, art, line, naklejka } from './common';

function skrzynka(): string {
  return (
    `<rect x="3" y="3" width="90" height="90" rx="10" fill="#E0A96D" stroke="${obrys}" stroke-width="6"/>` +
    `<rect x="13" y="13" width="70" height="70" rx="5" fill="#CF9558"/>` +
    line('M13 36h70M13 60h70', '#A8703D', 3) +
    `<circle cx="48" cy="50" r="15" fill="#FFB627" opacity=".9" stroke="#A8703D" stroke-width="3"/>` +
    `<path d="M48 34 q8 -9 15 -3 q-6 7 -15 3z" fill="#6BCB77" stroke="#A8703D" stroke-width="2"/>` +
    `<circle cx="20" cy="20" r="2.5" fill="#8A5A2B"/><circle cx="76" cy="20" r="2.5" fill="#8A5A2B"/><circle cx="20" cy="76" r="2.5" fill="#8A5A2B"/><circle cx="76" cy="76" r="2.5" fill="#8A5A2B"/>`
  );
}

function spring(sky: boolean): string {
  const cap = sky ? '#FF8FD0' : '#FF5D5D';
  const dots = sky
    ? `<circle cx="30" cy="42" r="7" fill="#FFE066"/><circle cx="51" cy="32" r="8" fill="#8FE3F0"/><circle cx="71" cy="46" r="6" fill="#B8F2A0"/>`
    : `<circle cx="30" cy="42" r="7" fill="#fff"/><circle cx="51" cy="32" r="8" fill="#fff"/><circle cx="71" cy="46" r="6" fill="#fff"/>`;
  return (
    naklejka(
      `<rect x="34" y="54" width="28" height="40" rx="10" fill="#FFF1D6"/>` +
        `<path d="M8 60 Q8 18 48 18 Q88 18 88 60 Q88 66 80 66 H16 Q8 66 8 60Z" fill="${cap}"/>`,
    ) +
    dots +
    `<circle cx="42" cy="78" r="2.6" fill="${obrys}"/><circle cx="54" cy="78" r="2.6" fill="${obrys}"/>` +
    line('M44 84 q4 3 8 0', obrys, 2.5)
  );
}

function checkpoint(on: boolean): string {
  const slupek = `<rect x="42" y="44" width="12" height="146" rx="5" fill="#B5835A"/>`;
  if (!on) {
    return (
      naklejka(slupek + `<circle cx="48" cy="34" r="22" fill="#FF8FAB"/>`) +
      line('M48 34 m-13 0 a13 13 0 1 1 13 13 a8 8 0 1 1 -8 -8 a4 4 0 1 1 4 4', '#fff', 4)
    );
  }
  return (
    naklejka(slupek + `<path d="M54 14 H88 Q94 44 88 76 H54Z" fill="#FF8FAB"/><circle cx="48" cy="14" r="8" fill="#FFD166"/>`) +
    line('M56 28H89 M56 62H89', '#fff', 5) +
    line('M58 78v8 M66 78v8 M74 78v8 M82 78v8', '#FF6FB5', 4)
  );
}

function latarnia(on: boolean): string {
  const slupek = `<rect x="43" y="96" width="10" height="94" rx="4" fill="#5A4B7A"/>`;
  const papier = on ? '#FFD166' : '#7A6C9A';
  const cap = on ? '#FF6FB5' : '#5A4B7A';
  return (
    (on
      ? `<defs><radialGradient id="g"><stop offset="0" stop-color="#FFE9A8" stop-opacity=".9"/><stop offset="1" stop-color="#FFD166" stop-opacity="0"/></radialGradient></defs><circle cx="48" cy="54" r="48" fill="url(#g)"/>`
      : '') +
    naklejka(
      slupek +
        `<ellipse cx="48" cy="54" rx="28" ry="34" fill="${papier}"/><rect x="34" y="14" width="28" height="10" rx="4" fill="${cap}"/><rect x="34" y="84" width="28" height="10" rx="4" fill="${cap}"/>`,
      8,
    ) +
    line('M26 44 q22 8 44 0 M22 58 q26 8 52 0 M26 72 q22 8 44 0', on ? '#F2A93B' : '#5F5280', 3)
  );
}

function tabliczkaSvg(): string {
  return (
    naklejka(`<rect x="38" y="46" width="12" height="48" rx="4" fill="#B5835A"/><rect x="6" y="8" width="76" height="48" rx="10" fill="#F2C48D"/>`) +
    `<rect x="40" y="16" width="8" height="22" rx="4" fill="${obrys}"/><circle cx="44" cy="46" r="4.5" fill="${obrys}"/>` +
    line('M12 16 h10', '#FFE3BD', 4)
  );
}

function onsen(tiles: number, front: boolean): string {
  const szer = tiles * 96;
  const kamien = (x: number, y: number, rx: number, ry: number, i: number) =>
    `<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" fill="${i % 2 ? '#B9B4C7' : '#A29BB5'}"/>`;
  if (!front) {
    let kamienie = '';
    let i = 0;
    for (let x = 24; x <= szer - 24; x += 36) kamienie += kamien(x, 56 - (i % 2) * 4, 20, 16 + (i++ % 3) * 2, i);
    return (
      naklejka(kamienie + `<rect x="10" y="54" width="${szer - 20}" height="42" rx="16" fill="#8FE3F0"/>`) +
      line(`M40 66 q10 -5 20 0 M${szer / 2} 62 q12 -5 24 0 M${szer - 90} 68 q10 -5 20 0`, '#D9FAFF', 4)
    );
  }
  let kamienie = '';
  let i = 0;
  for (let x = 22; x <= szer - 22; x += 42) kamienie += kamien(x, 86 + (i % 2) * 3, 23, 12 + (i++ % 2) * 2, i + 1);
  return (
    `<rect x="12" y="66" width="${szer - 24}" height="30" fill="#8FE3F0" opacity=".82"/>` +
    line(`M30 70 q12 -6 24 0 t24 0 M${szer / 2 + 10} 72 q12 -6 24 0 t24 0`, '#E8FDFF', 4) +
    naklejka(kamienie, 8)
  );
}

function plat(kind: 'wood' | 'lily' | 'cloud'): string {
  if (kind === 'lily') {
    return (
      naklejka(`<path d="M6 20 Q6 4 96 4 Q186 4 186 20 Q186 36 96 36 Q6 36 6 20Z" fill="#5DBB63"/>`, 8) +
      `<path d="M96 20 L150 4 L166 8Z" fill="#3F8F52" opacity=".5"/>` +
      line('M30 18 q30 -8 60 -6', '#9BE3A0', 4) +
      `<circle cx="46" cy="18" r="9" fill="#FF8FAB" stroke="${obrys}" stroke-width="3"/><circle cx="46" cy="18" r="3.5" fill="#FFD166"/>`
    );
  }
  if (kind === 'cloud') {
    return (
      naklejka(
        `<circle cx="34" cy="28" r="22" fill="#fff"/><circle cx="76" cy="24" r="20" fill="#fff"/><circle cx="118" cy="24" r="20" fill="#fff"/><circle cx="158" cy="28" r="22" fill="#fff"/><rect x="20" y="8" width="152" height="40" rx="16" fill="#fff"/>`,
        8, '#6E5791',
      ) + `<rect x="24" y="36" width="144" height="9" rx="4.5" fill="#FFD1EC"/>`
    );
  }
  return (
    `<rect x="3" y="3" width="186" height="34" rx="12" fill="#D9A066" stroke="${obrys}" stroke-width="6"/>` +
    line('M14 14h60 M100 26h70', '#B98049', 4) + line('M16 12h30', '#F2C48D', 4) +
    `<circle cx="18" cy="26" r="3" fill="#8A5A2B"/><circle cx="174" cy="14" r="3" fill="#8A5A2B"/>`
  );
}

function crumble(kind: 'mochi' | 'puff'): string {
  if (kind === 'puff') {
    return (
      naklejka(
        `<circle cx="24" cy="24" r="18" fill="#fff"/><circle cx="50" cy="20" r="17" fill="#fff"/><circle cx="74" cy="24" r="18" fill="#fff"/><rect x="12" y="8" width="72" height="34" rx="14" fill="#fff"/>`,
        7, '#6E5791',
      ) +
      `<rect x="18" y="32" width="60" height="7" rx="3.5" fill="#FFD1EC"/>` +
      `<circle cx="40" cy="22" r="2.4" fill="#6E5791"/><circle cx="58" cy="22" r="2.4" fill="#6E5791"/>` +
      line('M45 27 q4 3 8 0', '#6E5791', 2.2)
    );
  }
  return (
    naklejka(`<path d="M5 30 Q5 5 48 5 Q91 5 91 30 Q91 40 78 40 H18 Q5 40 5 30Z" fill="#FFF3F8"/>`, 8) +
    `<path d="M14 34 Q48 26 82 34 Q80 39 76 39 H20 Q16 39 14 34Z" fill="#FFC9DE"/>` +
    `<circle cx="38" cy="20" r="2.6" fill="${obrys}"/><circle cx="58" cy="20" r="2.6" fill="${obrys}"/>` +
    line('M43 25 q5 4 10 0', obrys, 2.4) +
    `<ellipse cx="30" cy="25" rx="5" ry="3" fill="#FF8FAB" opacity=".7"/><ellipse cx="66" cy="25" rx="5" ry="3" fill="#FF8FAB" opacity=".7"/>`
  );
}

export function obiektySvg(): grafikaSvg[] {
  return [
    art('crate', 96, 96, skrzynka()),
    art('spring', 96, 96, spring(false)),
    art('spring_sky', 96, 96, spring(true)),
    art('towel_off', 96, 192, checkpoint(false)),
    art('towel_on', 96, 192, checkpoint(true)),
    art('lantern_off', 96, 192, latarnia(false)),
    art('lantern_on', 96, 192, latarnia(true)),
    art('sign', 88, 96, tabliczkaSvg()),
    art('onsen3_back', 288, 96, onsen(3, false)),
    art('onsen3_front', 288, 96, onsen(3, true)),
    art('onsen5_back', 480, 96, onsen(5, false)),
    art('onsen5_front', 480, 96, onsen(5, true)),
    art('plat_wood', 192, 40, plat('wood')),
    art('plat_lily', 192, 40, plat('lily')),
    art('plat_cloud', 192, 52, plat('cloud')),
    art('crumble_mochi', 96, 44, crumble('mochi')),
    art('crumble_puff', 96, 46, crumble('puff')),
    art(
      'deco_flower', 36, 46,
      line('M18 46 V22', '#4E9F5B', 4) +
        [0, 72, 144, 216, 288].map((a) => `<ellipse cx="18" cy="8" rx="5" ry="7" fill="#fff" transform="rotate(${a} 18 16)"/>`).join('') +
        `<circle cx="18" cy="16" r="5" fill="#FFD166"/>`,
    ),
    art('deco_tuft', 44, 26, `<path d="M4 26 Q6 8 12 26 Q16 0 22 26 Q28 6 32 26 Q38 12 40 26Z" fill="#fff"/>`),
    art(
      'water_top', 96, 96,
      `<path d="M0 24 Q24 14 48 24 T96 24 V96 H0Z" fill="#3FBFD8" opacity=".58"/>` +
        `<path d="M0 24 Q24 14 48 24 T96 24" stroke="#E8FDFF" stroke-width="5" fill="none"/>`,
    ),
    art(
      'waterfall', 96, 96,
      `<rect width="96" height="96" fill="#7FDBEA"/>` +
        `<path d="M14 0V40 M14 60V96 M38 10V70 M58 0V28 M58 48V96 M82 20V84" stroke="#E8FDFF" stroke-width="7" stroke-linecap="round" opacity=".9"/>` +
        `<path d="M26 30V52 M70 0V14 M70 86V96 M46 80V96" stroke="#4DD0E1" stroke-width="6" stroke-linecap="round" opacity=".8"/>`,
    ),
  ];
}
