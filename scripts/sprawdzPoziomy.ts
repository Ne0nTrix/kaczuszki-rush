import { poziomy } from '../src/poziomy/index';
import { parsujPoziom } from '../src/poziomy/parse';
import { legenda } from '../src/poziomy/typy';

declare const process: { exit(code: number): never };

let bledy = 0;
const zglosBlad = (lvl: number, wiadomosc: string) => {
  bledy++;
  console.error(`  BLAD level ${lvl}: ${wiadomosc}`);
};

for (const def of poziomy) {
  const m = def.mapa;
  let w = m[0].length;
  console.log(`Level ${def.id}: ${def.name} (${w} x ${m.length})`);

  m.forEach((row, r) => {
    if (row.length !== w) zglosBlad(def.id, `row ${r} has length ${row.length}, expected ${w}`);
    for (const ch of row) if (!legenda.includes(ch)) zglosBlad(def.id, `row ${r}: unknown character "${ch}"`);
  });

  const count = (ch: string) => m.reduce((s, row) => s + row.split(ch).length - 1, 0);
  if (count('P') !== 1) zglosBlad(def.id, `expected exactly 1 P, found ${count('P')}`);
  if (count('G') !== 1) zglosBlad(def.id, `expected exactly 1 G, found ${count('G')}`);
  if (count('d') !== 3) zglosBlad(def.id, `expected exactly 3 d, found ${count('d')}`);
  if (count('K') < def.minCheckpointow) zglosBlad(def.id, `expected at least ${def.minCheckpointow} K, found ${count('K')}`);
  if (count('i') !== def.podpowiedzi.length) zglosBlad(def.id, `${count('i')} signs but ${def.podpowiedzi.length} hints`);

  m.forEach((row, r) => {
    const c = row.indexOf('G');
    if (c < 0) return;
    for (let i = 1; i < def.rozmiarOnsenu; i++) if (row[c + i] !== '.') zglosBlad(def.id, `onsen needs ${def.rozmiarOnsenu - 1} empty tiles to its right`);
    for (let i = 0; i < def.rozmiarOnsenu; i++) if ((m[r + 1] ?? '')[c + i] !== '#') zglosBlad(def.id, 'onsen needs ground underneath');
  });

  m.forEach((row, r) => {
    const c = row.indexOf('P');
    if (c < 0) return;
    let near = false;
    for (let rr = Math.max(0, r - 3); rr <= r; rr++) for (let cc = c; cc <= c + 4; cc++) if (m[rr][cc] === 'o') near = true;
    if (!near) zglosBlad(def.id, 'no yuzu within 3 tiles of the start');
  });

  // sprawdzanie czy rzeczy nie wisza w powietrzu
  let p = parsujPoziom(def);
  const floor = (c: number, r: number) => {
    let ch = (m[r] ?? '')[c];
    return ch === '#' || ch === '=' || ch === 'C' || ch === '_';
  };
  for (const o of p.obiekty) {
    if ('PKsichG'.includes(o.ch) && !floor(o.col, o.row + 1)) {
      zglosBlad(def.id, `"${o.ch}" at col ${o.col}, row ${o.row} has no floor under it`);
    }
    if (o.ch === 'r' && p.siatka[o.row][o.col + 1] !== '~') zglosBlad(def.id, `crocodile at col ${o.col} needs 2 water tiles`);
    if (o.ch === 'f' && p.siatka[o.row][o.col] !== 'w' && p.siatka[o.row][o.col] !== '~') zglosBlad(def.id, `pufferfish at col ${o.col} is not in water`);
  }

  const need = Math.ceil(p.wszystkieYuzu * 0.8);
  console.log(`  yuzu: ${p.wszystkieYuzu} (with crates), star needs ${need}, checkpoints: ${count('K')}, par ${def.czasPar}s`);
  if (p.wszystkieYuzu < 40 || p.wszystkieYuzu > 80) zglosBlad(def.id, `yuzu count ${p.wszystkieYuzu} outside 40-80`);
}

if (bledy) {
  console.error(`\nznaleziono bledow: ${bledy}`);
  process.exit(1);
}
console.log('\nwszystko ok');
