/**
 * Voortgang per vraagtype (anoniem, localStorage). Puur rekenwerk hier; opslag via load/save.
 * Beheerst = minstens 3 van de laatste 4 pogingen goed (volle punten).
 */
import type { BankItem } from "./grade.ts";
import { leerwegenVoor, TYPEN, type Leerweg } from "./nav.ts";
import { mulberry32 } from "./pick.ts";

export type TypeVoortgang = { hist: boolean[]; n: number };
export type Voortgang = { v: 1; lw: Record<string, { types: Record<string, TypeVoortgang>; recent: string[] }> };
export type Status = "beheerst" | "oefenen" | "nieuw";

const KEY = "toetsgpt-examtrain-voortgang";
const HIST = 6;
const RECENT = 40;

export function leeg(): Voortgang {
  return { v: 1, lw: {} };
}

export function laad(): Voortgang {
  try {
    const raw = window.localStorage.getItem(KEY);
    const p = raw ? (JSON.parse(raw) as Voortgang) : null;
    return p && p.v === 1 && p.lw ? p : leeg();
  } catch {
    return leeg();
  }
}

export function bewaar(v: Voortgang) {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(v));
  } catch {
    // geen opslag beschikbaar
  }
}

function deel(v: Voortgang, lw: Leerweg) {
  return v.lw[lw] ?? { types: {}, recent: [] };
}

/** Nieuwe voortgang na één beantwoorde vraag (immutable). */
export function registreer(v: Voortgang, lw: Leerweg, item: BankItem, goed: boolean): Voortgang {
  const d = deel(v, lw);
  const t = d.types[item.type] ?? { hist: [], n: 0 };
  const types = { ...d.types, [item.type]: { hist: [...t.hist, goed].slice(-HIST), n: t.n + 1 } };
  const recent = [...d.recent.filter((id) => id !== item.id), item.id].slice(-RECENT);
  return { ...v, lw: { ...v.lw, [lw]: { types, recent } } };
}

export function resetLeerweg(v: Voortgang, lw: Leerweg): Voortgang {
  const lwCopy = { ...v.lw };
  delete lwCopy[lw];
  return { ...v, lw: lwCopy };
}

export function statusVan(t: TypeVoortgang | undefined): Status {
  if (!t || t.n === 0) return "nieuw";
  const laatste = t.hist.slice(-4);
  return laatste.length >= 3 && laatste.filter(Boolean).length >= 3 ? "beheerst" : "oefenen";
}

export function typeInfo(v: Voortgang, lw: Leerweg, type: string) {
  const t = deel(v, lw).types[type];
  const laatste = t?.hist.slice(-4) ?? [];
  return { status: statusVan(t), goed: laatste.filter(Boolean).length, van: laatste.length, n: t?.n ?? 0 };
}

function beschikbaar(bank: BankItem[], lw: Leerweg) {
  const ok = leerwegenVoor(lw);
  return bank.filter((b) => ok.includes(b.leerweg));
}

/** Startmeting: één vraag per vaakst gevraagd type (alleen lokaal na te kijken), eigen leerweg eerst. */
export function maakStartmeting(bank: BankItem[], lw: Leerweg, seed: number, n = 15): BankItem[] {
  const r = mulberry32(seed);
  const pool = beschikbaar(bank, lw).filter((b) => !(b.vorm === "open" && b.ai));
  const typen = [...TYPEN].sort((a, b) => b.freq[lw] - a.freq[lw]).filter((t) => pool.some((b) => b.type === t.id));
  const out: BankItem[] = [];
  for (const t of typen) {
    if (out.length >= n) break;
    const kand = pool.filter((b) => b.type === t.id);
    const eigen = kand.filter((b) => b.leerweg === lw);
    const uit = eigen.length ? eigen : kand;
    out.push(uit[Math.floor(r() * uit.length)]!);
  }
  // door elkaar, maar niet volledig willekeurig: meng MC en rekenen
  return out.map((b) => ({ b, k: r() })).sort((a, b) => a.k - b.k).map((x) => x.b);
}

/** Gewicht van een type voor slim oefenen: zwak + vaak op het examen = vaker. */
export function typeGewicht(v: Voortgang, lw: Leerweg, type: string): number {
  const freq = TYPEN.find((t) => t.id === type)?.freq[lw] ?? 1;
  const info = typeInfo(v, lw, type);
  const basis = 1 + Math.log1p(freq);
  if (info.status === "beheerst") return basis * 0.25;
  if (info.status === "nieuw") return basis * 1.2;
  const fout = info.van - info.goed;
  return basis * (1.5 + fout);
}

/** Slim oefenen: types gewogen trekken, recente vragen vermijden, max 2 per type, max 1 AI-open. */
export function maakSlimSet(bank: BankItem[], lw: Leerweg, v: Voortgang, seed: number, n = 10, typen?: string[]): BankItem[] {
  const r = mulberry32(seed);
  let pool = beschikbaar(bank, lw);
  if (typen) pool = pool.filter((b) => typen.includes(b.type));
  const recent = new Set(deel(v, lw).recent);
  const perType = new Map<string, BankItem[]>();
  for (const b of pool) perType.set(b.type, [...(perType.get(b.type) ?? []), b]);
  const gewicht = new Map([...perType.keys()].map((t) => [t, typeGewicht(v, lw, t)]));
  const out: BankItem[] = [];
  const telType = new Map<string, number>();
  let ai = 0;
  const maxPerType = typen && typen.length === 1 ? n : 2;
  for (let poging = 0; out.length < n && poging < n * 20; poging++) {
    const kandTypen = [...perType.keys()].filter((t) => (telType.get(t) ?? 0) < maxPerType);
    if (!kandTypen.length) break;
    const tot = kandTypen.reduce((a, t) => a + gewicht.get(t)!, 0);
    let x = r() * tot;
    let type = kandTypen[0]!;
    for (const t of kandTypen) { x -= gewicht.get(t)!; if (x <= 0) { type = t; break; } }
    const items = perType.get(type)!.filter((b) => !out.includes(b) && !(b.vorm === "open" && b.ai && ai >= 1));
    if (!items.length) { telType.set(type, maxPerType); continue; }
    const vers = items.filter((b) => !recent.has(b.id));
    const eigen = (vers.length ? vers : items).filter((b) => b.leerweg === lw);
    const keus = eigen.length ? eigen : vers.length ? vers : items;
    // bij geen verse vragen: de langst geleden gemaakte
    const lijst = deel(v, lw).recent;
    const b = vers.length || !lijst.length ? keus[Math.floor(r() * keus.length)]! : [...keus].sort((p, q) => lijst.indexOf(p.id) - lijst.indexOf(q.id))[0]!;
    if (b.vorm === "open" && b.ai) ai++;
    out.push(b);
    telType.set(type, (telType.get(type) ?? 0) + 1);
  }
  return out;
}
