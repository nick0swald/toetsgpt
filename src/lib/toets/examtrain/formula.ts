/**
 * Formulecontrole: de leerling moet een formule met benoemde grootheden noteren
 * (symbolen of woorden). Getallen alleen = geen formulepunt.
 * Controle: invullen van willekeurige, consistente waarden in beide kanten.
 */

type Vals = Record<string, number>;
type Fam = {
  naam: string;
  /** canonieke weergave */
  toon: string;
  /** variabelen met aliassen (kleine letters vergeleken, behalve waar hoofdletter telt) */
  vars: Record<string, string[]>;
  /** geeft consistente set waarden op basis van random */
  sample: (r: () => number) => Vals;
};

const rnd = (r: () => number) => 1 + r() * 9;

export const FAMILIES: Record<string, Fam> = {
  rho: {
    naam: "dichtheid", toon: "ρ = m / V",
    vars: { rho: ["ρ", "rho", "p", "dichtheid", "d"], m: ["m", "massa"], V: ["v", "volume", "inhoud"] },
    sample: (r) => { const m = rnd(r), V = rnd(r); return { m, V, rho: m / V }; },
  },
  svt: {
    naam: "snelheid", toon: "s = v · t",
    vars: { s: ["s", "afstand", "weg", "sreactie", "sr", "reactieafstand", "remweg", "d", "x"], v: ["v", "vgem", "snelheid", "vgeluid", "geluidssnelheid", "gemiddeldesnelheid"], t: ["t", "tijd", "treactie", "reactietijd", "tr"] },
    sample: (r) => { const v = rnd(r), t = rnd(r); return { v, t, s: v * t }; },
  },
  pui: {
    naam: "vermogen", toon: "P = U · I",
    vars: { P: ["p", "vermogen"], U: ["u", "spanning", "v"], I: ["i", "stroomsterkte", "stroom"] },
    sample: (r) => { const U = rnd(r), I = rnd(r); return { U, I, P: U * I }; },
  },
  uir: {
    naam: "wet van Ohm", toon: "U = I · R",
    vars: { U: ["u", "spanning", "v"], I: ["i", "stroomsterkte", "stroom"], R: ["r", "weerstand", "rtot", "rtotaal", "rv"] },
    sample: (r) => { const I = rnd(r), R = rnd(r); return { I, R, U: I * R }; },
  },
  cit: {
    naam: "capaciteit", toon: "C = I · t",
    vars: { C: ["c", "capaciteit", "q", "lading"], I: ["i", "stroomsterkte", "stroom"], t: ["t", "tijd"] },
    sample: (r) => { const I = rnd(r), t = rnd(r); return { I, t, C: I * t }; },
  },
  pfa: {
    naam: "druk", toon: "p = F / A",
    vars: { p: ["p", "druk"], F: ["f", "kracht", "fz", "fzw", "zwaartekracht"], A: ["a", "oppervlakte", "oppervlak", "contactoppervlak", "contactoppervlakte"] },
    sample: (r) => { const F = rnd(r), A = rnd(r); return { F, A, p: F / A }; },
  },
  ft: {
    naam: "frequentie", toon: "f = 1 / T",
    vars: { f: ["f", "frequentie"], T: ["t", "trillingstijd"] },
    sample: (r) => { const T = rnd(r); return { T, f: 1 / T }; },
  },
  ept: {
    naam: "energie", toon: "E = P · t",
    vars: { E: ["e", "energie", "eel", "w"], P: ["p", "vermogen", "pel"], t: ["t", "tijd"] },
    sample: (r) => { const P = rnd(r), t = rnd(r); return { P, t, E: P * t }; },
  },
  rend: {
    naam: "rendement", toon: "η = Pnuttig / Ptoegevoerd × 100%",
    vars: {
      eta: ["η", "eta", "n", "rendement", "r"],
      a: ["paf", "pnuttig", "pn", "pnut", "eaf", "enuttig", "en", "enut", "nuttig", "nuttigvermogen", "nuttigeenergie", "afgestaan", "pafgestaan", "pa", "ea", "pout", "eout", "pgeleverd"],
      o: ["pop", "ptoegevoerd", "ptoe", "pin", "ptot", "ptotaal", "eop", "etoegevoerd", "etoe", "ein", "etot", "etotaal", "toegevoerd", "opgenomen", "popgenomen", "po", "eo", "pt", "et"],
    },
    sample: (r) => { const o = rnd(r) + 10, a = o * (0.1 + 0.8 * r()); return { a, o, eta: a / o }; },
  },
  trafo: {
    naam: "transformator", toon: "Up / Us = np / ns",
    vars: { Up: ["up", "vp", "uprim", "primairespanning"], Us: ["us", "vs", "usec", "secundairespanning"], np: ["np", "nprim", "primairewindingen"], ns: ["ns", "nsec", "secundairewindingen"] },
    sample: (r) => { const Up = rnd(r), Us = rnd(r), np = rnd(r); return { Up, Us, np, ns: (np * Us) / Up }; },
  },
  ez: {
    naam: "zwaarte-energie", toon: "Ez = m · g · h",
    vars: { Ez: ["ez", "ezw", "zwaarte-energie", "zwaarteenergie", "e", "w"], m: ["m", "massa"], g: ["g"], h: ["h", "hoogte"] },
    sample: (r) => { const m = rnd(r), g = rnd(r), h = rnd(r); return { m, g, h, Ez: m * g * h }; },
  },
  ek: {
    naam: "bewegingsenergie", toon: "Ek = ½ · m · v²",
    vars: { Ek: ["ek", "ebew", "ekin", "eb", "bewegingsenergie", "e"], m: ["m", "massa"], v: ["v", "snelheid"] },
    sample: (r) => { const m = rnd(r), v = rnd(r); return { m, v, Ek: 0.5 * m * v * v }; },
  },
  fz: {
    naam: "zwaartekracht", toon: "Fz = m · g",
    vars: { Fz: ["fz", "fzw", "zwaartekracht", "f"], m: ["m", "massa"], g: ["g"] },
    sample: (r) => { const m = rnd(r), g = rnd(r); return { m, g, Fz: m * g }; },
  },
  fma: {
    naam: "tweede wet van Newton", toon: "F = m · a",
    vars: { F: ["f", "fnetto", "fres", "fnet", "kracht", "nettokracht", "resulterendekracht"], m: ["m", "massa"], a: ["a", "versnelling", "vertraging"] },
    sample: (r) => { const m = rnd(r), a = rnd(r); return { m, a, F: m * a }; },
  },
  acc: {
    naam: "versnelling", toon: "a = Δv / Δt",
    vars: { a: ["a", "versnelling", "vertraging"], v: ["v", "δv", "dv", "deltav", "snelheidsverandering", "vverschil"], t: ["t", "δt", "dt", "deltat", "tijd"] },
    sample: (r) => { const v = rnd(r), t = rnd(r); return { v, t, a: v / t }; },
  },
  wfs: {
    naam: "arbeid", toon: "W = F · s",
    vars: { W: ["w", "arbeid", "e", "ez", "energie"], F: ["f", "kracht", "fz", "fzw", "zwaartekracht"], s: ["s", "afstand", "weg", "h", "hoogte"] },
    sample: (r) => { const F = rnd(r), s = rnd(r); return { F, s, W: F * s }; },
  },
  mom: {
    naam: "momentenwet", toon: "F1 · l1 = F2 · l2",
    vars: { F1: ["f1", "fl", "flinks"], l1: ["l1", "r1", "a1", "arm1"], F2: ["f2", "fr", "frechts"], l2: ["l2", "r2", "a2", "arm2"] },
    sample: (r) => { const F1 = rnd(r), l1 = rnd(r), F2 = rnd(r); return { F1, l1, F2, l2: (F1 * l1) / F2 }; },
  },
  rvs: {
    naam: "vervangingsweerstand (serie)", toon: "Rv = R1 + R2",
    vars: { Rv: ["rv", "rtot", "rtotaal", "rt", "r"], R1: ["r1", "rmotor", "rm"], R2: ["r2", "rregel", "rw"] },
    sample: (r) => { const R1 = rnd(r), R2 = rnd(r); return { R1, R2, Rv: R1 + R2 }; },
  },
  rvp: {
    naam: "vervangingsweerstand (parallel)", toon: "1/Rv = 1/R1 + 1/R2",
    vars: { Rv: ["rv", "rtot", "rtotaal", "rt", "r"], R1: ["r1"], R2: ["r2"] },
    sample: (r) => { const R1 = rnd(r), R2 = rnd(r); return { R1, R2, Rv: 1 / (1 / R1 + 1 / R2) }; },
  },
  stop: {
    naam: "stopafstand", toon: "stopafstand = reactieafstand + remweg",
    vars: { S: ["stopafstand", "sstop", "stop", "ss"], R: ["reactieafstand", "sreactie", "sr", "sreac"], B: ["remweg", "srem", "sb", "rem"] },
    sample: (r) => { const R = rnd(r), B = rnd(r); return { R, B, S: R + B }; },
  },
  kost: {
    naam: "energiekosten", toon: "kosten = energie (kWh) × prijs per kWh",
    vars: { K: ["kosten", "k", "bedrag", "prijs totaal", "totaal"], E: ["e", "energie", "kwh"], p: ["prijs", "p", "tarief", "prijsperkwh"] },
    sample: (r) => { const E = rnd(r), p = rnd(r); return { E, p, K: E * p }; },
  },
  temp: {
    naam: "temperatuur", toon: "T = t + 273",
    vars: { T: ["t", "tk", "kelvin", "k"], c: ["tc", "celsius", "c", "°c"] },
    sample: (r) => { const c = rnd(r) * 10; return { c, T: c + 273 }; },
  },
};

// ---------- parser ----------
type Tok = { t: "num"; v: number } | { t: "id"; v: string } | { t: "op"; v: string };

function tokenize(src: string): Tok[] | null {
  const s = src
    .replace(/½/g, "(1/2)")
    .replace(/²/g, "^2")
    .replace(/³/g, "^3")
    .replace(/[×∙·•⋅*]/g, "*")
    .replace(/[:÷]/g, "/")
    .replace(/[−–]/g, "-")
    .replace(/%/g, " %");
  const out: Tok[] = [];
  let i = 0;
  while (i < s.length) {
    const ch = s[i]!;
    if (/\s/.test(ch)) { i++; continue; }
    if (/[0-9]/.test(ch) || (ch === "," && /[0-9]/.test(s[i + 1] ?? ""))) {
      let j = i; while (j < s.length && /[0-9.,]/.test(s[j]!)) j++;
      const v = Number(s.slice(i, j).replace(",", "."));
      if (Number.isNaN(v)) return null;
      out.push({ t: "num", v }); i = j; continue;
    }
    if (/[A-Za-zρηΔδ°_À-ÿ-]/.test(ch) && !(ch === "-")) {
      let j = i; while (j < s.length && /[A-Za-z0-9ρηΔδ°_À-ÿ-]/.test(s[j]!)) j++;
      // streepje aan het eind is een min
      let w = s.slice(i, j);
      while (w.endsWith("-")) { w = w.slice(0, -1); j--; }
      out.push({ t: "id", v: w }); i = j; continue;
    }
    if ("+-*/^()=%".includes(ch)) { out.push({ t: "op", v: ch }); i++; continue; }
    return null;
  }
  return out;
}

type Node = { k: "n"; v: number } | { k: "v"; name: string } | { k: "b"; op: string; a: Node; b: Node } | { k: "neg"; a: Node };

class P {
  i = 0;
  toks: Tok[];
  constructor(toks: Tok[]) { this.toks = toks; }
  peek() { return this.toks[this.i]; }
  expr(): Node {
    let a = this.term();
    for (;;) {
      const p = this.peek();
      if (p?.t === "op" && (p.v === "+" || p.v === "-")) { this.i++; a = { k: "b", op: p.v, a, b: this.term() }; } else return a;
    }
  }
  term(): Node {
    let a = this.pow();
    for (;;) {
      const p = this.peek();
      if (p?.t === "op" && (p.v === "*" || p.v === "/")) { this.i++; a = { k: "b", op: p.v, a, b: this.pow() }; }
      else if (p?.t === "op" && p.v === "%") { this.i++; a = { k: "b", op: "*", a, b: { k: "n", v: 0.01 } }; }
      else if (p && (p.t === "num" || p.t === "id" || (p.t === "op" && p.v === "("))) { a = { k: "b", op: "*", a, b: this.pow() }; }
      else return a;
    }
  }
  pow(): Node {
    const a = this.unary();
    const p = this.peek();
    if (p?.t === "op" && p.v === "^") { this.i++; return { k: "b", op: "^", a, b: this.unary() }; }
    return a;
  }
  unary(): Node {
    const p = this.peek();
    if (p?.t === "op" && p.v === "-") { this.i++; return { k: "neg", a: this.unary() }; }
    return this.atom();
  }
  atom(): Node {
    const p = this.peek();
    if (!p) throw new Error("eind");
    this.i++;
    if (p.t === "num") return { k: "n", v: p.v };
    if (p.t === "id") return { k: "v", name: p.v };
    if (p.v === "(") { const e = this.expr(); const q = this.peek(); if (q?.t === "op" && q.v === ")") this.i++; return e; }
    throw new Error("onverwacht " + p.v);
  }
}

function ev(n: Node, env: Vals): number {
  switch (n.k) {
    case "n": return n.v;
    case "v": { const v = env[n.name]; if (v === undefined) throw new Error("var"); return v; }
    case "neg": return -ev(n.a, env);
    case "b": {
      const a = ev(n.a, env), b = ev(n.b, env);
      if (n.op === "+") return a + b; if (n.op === "-") return a - b; if (n.op === "*") return a * b; if (n.op === "/") return a / b; return a ** b;
    }
  }
}

function varsIn(n: Node, acc: Set<string>) {
  if (n.k === "v") acc.add(n.name);
  else if (n.k === "neg") varsIn(n.a, acc);
  else if (n.k === "b") { varsIn(n.a, acc); varsIn(n.b, acc); }
}

function mulberry(seed: number) {
  let a = seed >>> 0;
  return () => { a = (a + 0x6d2b79f5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}

export type FormuleCheck = { ok: boolean; fam?: string; reden: string };

const WOORD_X = /\s[xX]\s/g;

/** Probeer één formuleregel tegen één familie. */
function tryFam(line: string, famId: string): FormuleCheck {
  const fam = FAMILIES[famId]!;
  const toks0 = tokenize(line.replace(WOORD_X, " * "));
  if (!toks0) return { ok: false, reden: "Formule niet leesbaar." };
  // woorden/symbolen koppelen aan variabelen van de familie
  const toks: Tok[] = [];
  const unknown: string[] = [];
  for (let i = 0; i < toks0.length; i++) {
    const tk = toks0[i]!;
    if (tk.t !== "id") { toks.push(tk); continue; }
    let w = tk.v.toLowerCase().replace(/_/g, "");
    // meerdere woorden als "nuttig vermogen" samenvoegen
    const nxt = toks0[i + 1];
    if (nxt?.t === "id") {
      const combo = (w + nxt.v.toLowerCase()).replace(/_/g, "");
      const hitC = Object.entries(fam.vars).find(([, al]) => al.includes(combo));
      if (hitC) { toks.push({ t: "id", v: hitC[0] }); i++; continue; }
    }
    if (w === "g" && !("g" in fam.vars)) { toks.push({ t: "num", v: 10 }); continue; }
    if (w === "x" ) { toks.push({ t: "op", v: "*" }); continue; }
    // exacte hoofdlettergevoelige match eerst (bv. T vs t bij temp)
    const exact = Object.keys(fam.vars).find((k) => k === tk.v);
    if (exact) { toks.push({ t: "id", v: exact }); continue; }
    if (famId === "temp") w = tk.v === "T" ? "t" : tk.v === "t" ? "tc" : w;
    const hit = Object.entries(fam.vars).find(([, al]) => al.includes(w));
    if (hit) { toks.push({ t: "id", v: hit[0] }); continue; }
    const find = (x: string) => Object.entries(fam.vars).find(([k, al]) => k === x || al.includes(x.toLowerCase()))?.[0];
    // "UxI" → U * I
    const bits = tk.v.split(/x/i);
    if (bits.length > 1 && bits.every((b) => b && find(b))) {
      bits.forEach((b, bi) => { if (bi) toks.push({ t: "op", v: "*" }); toks.push({ t: "id", v: find(b)! }); });
      continue;
    }
    // "v2" → v^2
    const sq = /^(.+?)2$/.exec(tk.v);
    if (sq && famId === "ek" && find(sq[1]!) === "v") { toks.push({ t: "id", v: "v" }, { t: "op", v: "^" }, { t: "num", v: 2 }); continue; }
    unknown.push(tk.v); toks.push({ t: "id", v: "?" + tk.v });
  }
  const eq = toks.filter((t) => t.t === "op" && t.v === "=").length;
  if (eq !== 1) return { ok: false, reden: "Schrijf de formule met één isgelijkteken, bijvoorbeeld " + fam.toon + "." };
  const at = toks.findIndex((t) => t.t === "op" && t.v === "=");
  let L: Node, Rn: Node;
  try {
    const pl = new P(toks.slice(0, at)); L = pl.expr(); if (pl.i < at) throw new Error("rest");
    const pr = new P(toks.slice(at + 1)); Rn = pr.expr(); if (pr.i < toks.length - at - 1) throw new Error("rest");
  } catch {
    return { ok: false, reden: "Formule niet leesbaar." };
  }
  const used = new Set<string>(); varsIn(L, used); varsIn(Rn, used);
  if (unknown.length) return { ok: false, reden: `Onbekende grootheid: ${unknown.join(", ")}.` };
  if (used.size < 2) return { ok: false, reden: "Alleen getallen is geen formule: noteer de grootheden (bijvoorbeeld " + fam.toon + ")." };
  const r = mulberry(12345);
  for (let k = 0; k < 4; k++) {
    const env = fam.sample(r);
    let a: number, b: number;
    try { a = ev(L, env); b = ev(Rn, env); } catch { return { ok: false, reden: "Formule niet leesbaar." }; }
    const ok = Math.abs(a - b) <= 1e-6 * Math.max(1, Math.abs(a), Math.abs(b));
    // rendement: ×100% mag, maar 100 zonder % ook
    const ok100 = famId === "rend" && (Math.abs(a - b * 100) <= 1e-6 * Math.max(1, Math.abs(a)) || Math.abs(a * 100 - b) <= 1e-6 * Math.max(1, Math.abs(b)));
    if (!ok && !ok100) return { ok: false, reden: "Deze formule klopt niet. Juist is bijvoorbeeld: " + fam.toon + "." };
  }
  return { ok: true, fam: famId, reden: "Juiste formule." };
}

/** Controleer de tekst van de leerling (meerdere regels mogen) tegen één van de families. */
export function checkFormule(text: string, fams: string[]): FormuleCheck {
  const lines = text.split(/\n|;/).map((l) => l.trim()).filter((l) => l.includes("="));
  if (!lines.length) return { ok: false, reden: "Geen formule gevonden. Noteer eerst de formule met grootheden (bijvoorbeeld " + (FAMILIES[fams[0] ?? ""]?.toon ?? "") + ")." };
  let best: FormuleCheck | null = null;
  for (const raw of lines) {
    // alleen het deel tot het eerste getal-na-=, zodat "P = U · I = 230 · 5" ook telt
    const parts = raw.split("=");
    const cands = [raw];
    for (let n = 2; n < parts.length; n++) cands.push(parts.slice(0, n).join("="));
    for (let n = 1; n < parts.length - 1; n++) cands.push(parts.slice(n, n + 2).join("="));
    for (const c of cands) {
      for (const f of fams) {
        if (!FAMILIES[f]) continue;
        const res = tryFam(c, f);
        if (res.ok) return res;
        if (!best || (best.reden.startsWith("Formule niet") && !res.reden.startsWith("Formule niet"))) best = res;
      }
    }
  }
  return best ?? { ok: false, reden: "Geen juiste formule gevonden." };
}

export function formuleTonen(fam: string): string {
  return FAMILIES[fam]?.toon ?? "";
}
