export interface sekcja {
  top: string[];
  floor: string[];
}

export function sec(top: string[], floor: string | string[] = '#'): sekcja {
  return { top, floor: Array.isArray(floor) ? floor : [floor] };
}

export function sparse(w: number, n: number, wiersze: Record<number, string>): string[] {
  const out: string[] = [];
  for (let i = 0; i < n; i++) out.push(wiersze[i] ?? '.'.repeat(w));
  return out;
}

export function zbudujMape(wysokosc: number, glebokoscPodlogi: number, secs: sekcja[]): string[] {
  const wiersze: string[] = Array.from({ length: wysokosc }, () => '');
  const topH = wysokosc - glebokoscPodlogi;
  secs.forEach((s, si) => {
    const probka = s.top[0] ?? s.floor.find((f) => f.length > 1) ?? '';
    const w = probka.length;
    if (!w) throw new Error(`section ${si + 1}: cannot tell the width`);
    if (s.top.length > topH) throw new Error(`section ${si + 1}: too many top rows (${s.top.length} > ${topH})`);
    s.top.forEach((r, i) => {
      if (r.length !== w) throw new Error(`section ${si + 1}: top row ${i} has length ${r.length}, expected ${w}: "${r}"`);
    });
    const pad = topH - s.top.length;
    for (let r = 0; r < pad; r++) wiersze[r] += '.'.repeat(w);
    s.top.forEach((r, i) => (wiersze[pad + i] += r));
    for (let f = 0; f < glebokoscPodlogi; f++) {
      let fr = s.floor[Math.min(f, s.floor.length - 1)];
      if (fr.length === 1) fr = fr.repeat(w);
      if (fr.length !== w) throw new Error(`section ${si + 1}: floor row ${f} has length ${fr.length}, expected ${w}: "${fr}"`);
      wiersze[topH + f] += fr;
    }
  });
  return wiersze;
}
