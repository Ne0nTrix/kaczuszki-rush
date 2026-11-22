import { grafikaSvg, obrys, art, line, naklejka } from './common';

function krab(): string {
  const czerwony = '#F25C54';
  return (
    line('M26 62 l-12 14 M34 68 l-8 13 M78 62 l12 14 M70 68 l8 13', obrys, 6) +
    naklejka(
      `<rect x="36" y="14" width="8" height="28" rx="4" fill="${czerwony}"/><rect x="60" y="14" width="8" height="28" rx="4" fill="${czerwony}"/>` +
        `<circle cx="14" cy="42" r="12" fill="${czerwony}"/><circle cx="90" cy="42" r="12" fill="${czerwony}"/>` +
        `<ellipse cx="52" cy="54" rx="34" ry="22" fill="${czerwony}"/>` +
        `<circle cx="40" cy="15" r="9" fill="#fff"/><circle cx="64" cy="15" r="9" fill="#fff"/>`,
    ) +
    `<circle cx="42" cy="16" r="3.6" fill="${obrys}"/><circle cx="62" cy="16" r="3.6" fill="${obrys}"/>` +
    line('M29 5 l17 7 M75 5 l-17 7', obrys, 4.5) +
    line('M44 63 q8 -6 16 0', obrys, 3) +
    `<ellipse cx="36" cy="44" rx="10" ry="5" fill="#FF8A80" opacity=".85"/>` +
    line('M7 36 l8 6 M97 36 l-8 6', obrys, 3)
  );
}

function jez(): string {
  return (
    naklejka(
      `<path d="M12 66 L3 52 L14 46 L7 31 L22 32 L21 16 L36 24 L44 7 L54 22 L68 11 L70 28 L85 27 L78 42 L82 66 Z" fill="#8A5A3C"/>` +
        `<ellipse cx="68" cy="54" rx="30" ry="18" fill="#F3D9B1"/>` +
        `<ellipse cx="30" cy="71" rx="9" ry="6" fill="#D9B88C"/><ellipse cx="66" cy="72" rx="9" ry="6" fill="#D9B88C"/>`,
    ) +
    line('M22 44 l6 -10 M38 38 l5 -12 M56 34 l4 -10', '#6B4027', 4) +
    `<circle cx="97" cy="52" r="5" fill="${obrys}"/>` +
    `<circle cx="79" cy="46" r="4" fill="${obrys}"/><circle cx="80.2" cy="44.8" r="1.3" fill="#fff"/>` +
    `<ellipse cx="74" cy="58" rx="6" ry="3.5" fill="#FF8FAB" opacity=".75"/>` +
    line('M84 61 q4 3 8 0', obrys, 2.5)
  );
}

function bee(): string {
  return (
    naklejka(`<path d="M14 40 l-11 -5 v10z" fill="${obrys}"/><ellipse cx="44" cy="40" rx="30" ry="22" fill="#FFD23F"/>`) +
    `<clipPath id="b"><ellipse cx="44" cy="40" rx="30" ry="22"/></clipPath>` +
    `<g clip-path="url(#b)"><rect x="22" y="10" width="9" height="60" fill="${obrys}"/><rect x="38" y="10" width="9" height="60" fill="${obrys}"/></g>` +
    `<circle cx="61" cy="36" r="4.5" fill="${obrys}"/><circle cx="62.3" cy="34.6" r="1.4" fill="#fff"/>` +
    `<ellipse cx="58" cy="47" rx="5" ry="3" fill="#FF8FAB" opacity=".8"/>` +
    line('M64 46 q4 3 7 -1', obrys, 2.5)
  );
}

function puffer(big: boolean): string {
  const zolty = '#FFE066';
  if (!big) {
    return (
      naklejka(
        `<path d="M14 46 l-10 -11 v22z" fill="#FFB627"/><circle cx="48" cy="46" r="32" fill="${zolty}"/><ellipse cx="44" cy="78" rx="8" ry="5" fill="#FFB627"/>`,
      ) +
      `<ellipse cx="50" cy="60" rx="20" ry="11" fill="#FFF6D6"/>` +
      `<circle cx="30" cy="34" r="3.5" fill="#FFB627"/><circle cx="40" cy="24" r="3" fill="#FFB627"/><circle cx="26" cy="50" r="3" fill="#FFB627"/>` +
      `<circle cx="60" cy="38" r="7.5" fill="#fff" stroke="${obrys}" stroke-width="2.5"/><circle cx="62" cy="39" r="3.2" fill="${obrys}"/>` +
      `<ellipse cx="75" cy="53" rx="4" ry="5" fill="#E8590C" stroke="${obrys}" stroke-width="2"/>`
    );
  }
  let kolce = '';
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2;
    const a1 = a - 0.16;
    const a2 = a + 0.16;
    const p = (ang: number, r: number) => `${(64 + Math.cos(ang) * r).toFixed(1)} ${(64 + Math.sin(ang) * r).toFixed(1)}`;
    kolce += `<path d="M${p(a1, 44)} L${p(a, 60)} L${p(a2, 44)}Z" fill="#FFB627"/>`;
  }
  return (
    naklejka(`${kolce}<circle cx="64" cy="64" r="46" fill="${zolty}"/>`) +
    `<ellipse cx="66" cy="84" rx="28" ry="15" fill="#FFF6D6"/>` +
    `<circle cx="40" cy="46" r="4" fill="#FFB627"/><circle cx="54" cy="32" r="3.5" fill="#FFB627"/><circle cx="34" cy="68" r="3.5" fill="#FFB627"/>` +
    `<circle cx="80" cy="52" r="10" fill="#fff" stroke="${obrys}" stroke-width="2.5"/><circle cx="82" cy="53" r="4" fill="${obrys}"/>` +
    `<circle cx="56" cy="54" r="8" fill="#fff" stroke="${obrys}" stroke-width="2.5"/><circle cx="58" cy="55" r="3.4" fill="${obrys}"/>` +
    `<ellipse cx="72" cy="74" rx="6" ry="7" fill="#E8590C" stroke="${obrys}" stroke-width="2"/>`
  );
}

function cloud(zap: boolean): string {
  const kolorChmury = zap ? '#FFE889' : '#B9A9D6';
  const kolorCienia = zap ? '#F2C94C' : '#9C8BC0';
  return (
    naklejka(
      `<circle cx="48" cy="58" r="30" fill="${kolorChmury}"/><circle cx="84" cy="44" r="36" fill="${kolorChmury}"/><circle cx="122" cy="60" r="28" fill="${kolorChmury}"/><rect x="28" y="56" width="114" height="36" rx="18" fill="${kolorChmury}"/>`,
    ) +
    `<rect x="36" y="78" width="98" height="11" rx="5.5" fill="${kolorCienia}" opacity=".8"/>` +
    line('M60 46 l15 7 M108 46 l-15 7', obrys, 4.5) +
    `<circle cx="69" cy="60" r="4.2" fill="${obrys}"/><circle cx="99" cy="60" r="4.2" fill="${obrys}"/>` +
    (zap
      ? `<ellipse cx="84" cy="72" rx="7" ry="6" fill="${obrys}"/>`
      : line('M76 73 q8 -6 16 0', obrys, 3))
  );
}

function krokodylSvg(): string {
  const zielony = '#6BCB77';
  let ridges = '';
  for (let i = 0; i < 5; i++) ridges += `<path d="M${30 + i * 20} 26 l8 -9 l8 9z" fill="#4FAE5E"/>`;
  return (
    naklejka(
      `<path d="M26 36 L2 26 L14 54Z" fill="${zielony}"/>${ridges}<rect x="10" y="22" width="150" height="48" rx="22" fill="${zielony}"/><rect x="118" y="20" width="86" height="44" rx="20" fill="${zielony}"/>` +
        `<circle cx="140" cy="20" r="10" fill="${zielony}"/>`,
    ) +
    `<rect x="22" y="52" width="120" height="14" rx="7" fill="#C9F2C7" opacity=".9"/>` +
    line('M134 20 q6 5 12 0', obrys, 3) +
    `<ellipse cx="192" cy="30" rx="2.5" ry="3.5" fill="${obrys}"/>` +
    line('M132 50 q32 12 66 -2', obrys, 3) +
    `<path d="M156 55 l4 7 l4 -6z M176 55 l4 6 l4 -7z" fill="#fff" stroke="${obrys}" stroke-width="1.5"/>` +
    `<ellipse cx="162" cy="42" rx="7" ry="4" fill="#FF8FAB" opacity=".7"/>` +
    line('M30 30 q40 -6 80 0', '#9BE3A0', 4)
  );
}

export function wrogowieSvg(): grafikaSvg[] {
  return [
    art('crab', 104, 84, krab()),
    art('hedgehog', 104, 80, jez()),
    art('bee', 84, 68, bee()),
    art('bee_wing', 44, 36, naklejka(`<ellipse cx="22" cy="18" rx="16" ry="12" fill="#E8F7FF"/>`, 7)),
    art('puffer', 92, 92, puffer(false)),
    art('puffer_big', 128, 128, puffer(true)),
    art('cloud', 168, 108, cloud(false)),
    art('cloud_zap', 168, 108, cloud(true)),
    art('croc', 208, 88, krokodylSvg()),
  ];
}
