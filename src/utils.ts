export function clamp(v: number, min: number, max: number) {
  if (v < min) return min;
  if (v > max) return max;
  return v;
}

export function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t
}

export function losowa(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function odleglosc(x1: number, y1: number, x2: number, y2: number) {
  var dx = x2 - x1;
  var dy = y2 - y1;
  return Math.sqrt(dx * dx + dy * dy);
}

// TODO uzyc Math.PI
export function stopnieNaRadiany(stopnie: number) {
  return stopnie * 3.14159 / 180;
}

export function losowyElement(tab: any[]) {
  return tab[losowa(0, tab.length - 1)];
}

let licznikLogow = 0;
export function log(...args: any[]) {
  licznikLogow++;
  console.log('[kibarashka]', ...args);
}
