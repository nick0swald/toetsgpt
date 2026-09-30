import type { BankItem } from "./grade.ts";
import { leerwegenVoor, TYPEN, type Leerweg } from "./nav.ts";
import { TOETSDELEN } from "./toetsdelen.ts";

export function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function shuffle<T>(xs: T[], r: () => number): T[] {
  const a = [...xs];
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [a[i], a[j]] = [a[j]!, a[i]!]; }
  return a;
}

export function voorLeerweg(bank: BankItem[], lw: Leerweg): BankItem[] {
  const ok = leerwegenVoor(lw);
  // eigen leerweg eerst
  return bank.filter((b) => ok.includes(b.leerweg)).sort((a, b) => ok.indexOf(a.leerweg) - ok.indexOf(b.leerweg));
}

export function telPerType(bank: BankItem[], lw: Leerweg) {
  const pool = voorLeerweg(bank, lw);
  return TYPEN.map((t) => ({ ...t, n: pool.filter((b) => b.type === t.id).length }))
    .filter((t) => t.n > 0)
    .sort((a, b) => b.freq[lw] - a.freq[lw] || b.n - a.n);
}

export function telPerDeel(bank: BankItem[], lw: Leerweg) {
  const pool = voorLeerweg(bank, lw);
  return TOETSDELEN.map((d) => ({ ...d, n: pool.filter((b) => d.typen.includes(b.type)).length }));
}

/** Set samenstellen: eigen leerweg voorrang, max 2 open (AI) per set, gewogen op examenfrequentie. */
export function maakSet(bank: BankItem[], lw: Leerweg, opts: { typen?: string[]; n: number; seed: number }): BankItem[] {
  const r = mulberry32(opts.seed);
  let pool = voorLeerweg(bank, lw);
  if (opts.typen) pool = pool.filter((b) => opts.typen!.includes(b.type));
  const eigen = shuffle(pool.filter((b) => b.leerweg === lw), r);
  const rest = shuffle(pool.filter((b) => b.leerweg !== lw), r);
  const freq = new Map(TYPEN.map((t) => [t.id, t.freq[lw]]));
  // gewogen volgorde: hoge frequentie iets vaker vooraan, maar niet steeds hetzelfde type
  const gewogen = (xs: BankItem[]) =>
    xs.map((b) => ({ b, k: r() * (1 + Math.log1p(freq.get(b.type) ?? 1)) })).sort((a, b) => b.k - a.k).map((x) => x.b);
  const lijst = [...gewogen(eigen), ...gewogen(rest)];
  const out: BankItem[] = [];
  const perType = new Map<string, number>();
  let ai = 0;
  const maxPerType = opts.typen && opts.typen.length === 1 ? opts.n : Math.max(2, Math.ceil(opts.n / 4));
  for (const b of lijst) {
    if (out.length >= opts.n) break;
    if ((perType.get(b.type) ?? 0) >= maxPerType) continue;
    if (b.vorm === "open" && b.ai) { if (ai >= 2) continue; ai++; }
    out.push(b);
    perType.set(b.type, (perType.get(b.type) ?? 0) + 1);
  }
  // aanvullen als typelimiet te streng was
  for (const b of lijst) { if (out.length >= opts.n) break; if (!out.includes(b) && !(b.vorm === "open" && b.ai && ai >= 2)) out.push(b); }
  return out;
}
