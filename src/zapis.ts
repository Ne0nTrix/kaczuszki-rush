const kluczZapisu = 'kibarashka.save.v1';

export interface zapisPoziomu {
  stars: [boolean, boolean, boolean]
  najlepszyCzas: number | null
  bestYuzu: number
  ducklings: [boolean, boolean, boolean];
}

export interface daneZapisu {
  firstRunDone: boolean
  muted: boolean;
  levels: Record<number, zapisPoziomu>;
}

const pustyZapis = (): daneZapisu => ({ firstRunDone: false, muted: false, levels: {} });

let zapisCache: daneZapisu | null = null;

export function wczytajZapis(): daneZapisu {
  if (zapisCache) return zapisCache
  let data = pustyZapis()
  try {
    const surowe = localStorage.getItem(kluczZapisu);
    if (surowe) {
      const sparsowane = JSON.parse(surowe);
      if (sparsowane && typeof sparsowane === 'object') data = { ...data, ...sparsowane, levels: sparsowane.levels || {} }
    }
  } catch (e) {
    console.log('brak zapisu', e);
  }
  zapisCache = data;
  return data;
}

export function zapiszDoStorage(): void {
  if (!zapisCache) return;
  try {
    localStorage.setItem(kluczZapisu, JSON.stringify(zapisCache))
  } catch (e) {
    // tryb prywatny w safari rzuca wyjatek, trudno
  }
}

export function zapisDlaPoziomu(id: number): zapisPoziomu {
  const s = wczytajZapis()
  if (!s.levels[id]) {
    s.levels[id] = { stars: [false, false, false], najlepszyCzas: null, bestYuzu: 0, ducklings: [false, false, false] };
  }
  return s.levels[id]
}

export interface wynikBiegu {
  stars: [boolean, boolean, boolean];
  time: number
  yuzu: number
  ducklings: [boolean, boolean, boolean];
}

export function zapiszWynik(id: number, r: wynikBiegu): boolean {
  const s = wczytajZapis();
  const l = zapisDlaPoziomu(id)
  const newBest = l.najlepszyCzas === null || r.time < l.najlepszyCzas;
  l.stars = [l.stars[0] || r.stars[0], l.stars[1] || r.stars[1], l.stars[2] || r.stars[2]]
  l.ducklings = [l.ducklings[0] || r.ducklings[0], l.ducklings[1] || r.ducklings[1], l.ducklings[2] || r.ducklings[2]];
  if (newBest) l.najlepszyCzas = r.time;
  l.bestYuzu = Math.max(l.bestYuzu, r.yuzu);
  s.firstRunDone = true;
  zapiszDoStorage()
  return newBest;
}

export function formatujCzas(t: number | null, dokladnie = false): string {
  if (t === null) return '--:--'
  const m = Math.floor(t / 60);
  const s = t - m * 60;
  if (dokladnie) return `${m}:${s.toFixed(2).padStart(5, '0')}`;
  return `${m}:${Math.floor(s).toString().padStart(2, '0')}`;
}
