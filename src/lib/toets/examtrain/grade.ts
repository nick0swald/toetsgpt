/**
 * Nakijken in Nick's stijl:
 * - 1 punt per echte stap (formule, tussenstap, rest van de berekening).
 * - Formulepunt alleen met benoemde grootheden + juiste formule (niet voor gegevens overschrijven).
 * - Rekenfout en eenheidsfout samen kosten maximaal 1 punt (beide vallen onder "rest van de berekening").
 * - Bekende doorwerkfouten (bv. factor 2 vergeten) kosten alleen de stap waar het misging.
 */
import { checkFormule, formuleTonen } from "./formula.ts";
import { fmtUnit, normUnit, toBase, unitDim } from "./units.ts";

export type Waarde = { v: number; u: string };
export type Stap =
  | { k: "F"; label: string }
  | { k: "N"; label: string; vals: Waarde[] }
  | { k: "C"; label: string; kw: string[] }
  | { k: "R"; label: string; part: number };

type Basis = { id: string; type: string; leerweg: "BB" | "KB" | "GT"; bron: string; titel: string; intro: string; lead: string; vraag: string; p: number };
export type McItem = Basis & { vorm: "mc"; opties: string[]; sleutel: number };
export type RekenItem = Basis & {
  vorm: "reken";
  fam: string[];
  parts: Waarde[][];
  tol: number;
  steps: Stap[];
  fouten: { v: number; u: string; verlies: number[]; uitleg: string }[];
  uitwerking: string;
  note?: string | null;
};
export type OpenItem = Basis & { vorm: "open"; cv: string; kw: string[][]; kwMax?: number | null; ai: boolean };
export type BankItem = McItem | RekenItem | OpenItem;

export type StapUitslag = { label: string; ok: boolean; uitleg: string };
export type Uitslag = { punten: number; max: number; stappen: StapUitslag[]; voorlopig?: boolean };

// ---------- getallen ----------
/** Leest "3,5 · 10^3 kg", "4 498 kg", "0,20", "-196 °C". */
export function parseAntwoord(raw: string): { v: number; unit: string } | null {
  let s = raw.trim().replace(/[−–]/g, "-").replace(/(\d)\s+(?=\d{3}\b)/g, "$1");
  s = s.replace(/^[A-Za-zΔηρ_ ()]*=\s*/, ""); // "v = ..." weghalen
  const m = /^(-?\d+(?:[.,]\d+)?)(?:\s*(?:[x×·∙*]|keer)\s*10\s*(?:\^|\*\*)?\s*([-−]?\d+))?(?:\s*[eE]([-]?\d+))?\s*(.*)$/.exec(s);
  if (!m) return null;
  let v = Number(m[1]!.replace(",", "."));
  if (m[2]) v *= 10 ** Number(m[2].replace("−", "-"));
  if (m[3]) v *= 10 ** Number(m[3]);
  if (!Number.isFinite(v)) return null;
  return { v, unit: (m[4] ?? "").trim().replace(/[.]$/, "") };
}

/** Alle getallen uit een werk-tekst, met eventuele eenheid erachter. */
export function getallenIn(text: string): { v: number; unit: string | null }[] {
  const out: { v: number; unit: string | null }[] = [];
  const re = /(-?\d+(?:[.,]\d+)?)(?:\s*(?:[x×·∙*])\s*10\s*\^?\s*([-−]?\d+))?\s*([A-Za-zΩµ°€%²³/]+[23]?)?/g;
  const t = text.replace(/(\d)\s+(?=\d{3}\b)/g, "$1");
  let m: RegExpExecArray | null;
  while ((m = re.exec(t))) {
    let v = Number(m[1]!.replace(",", "."));
    if (m[2]) v *= 10 ** Number(m[2].replace("−", "-"));
    const u = m[3] ? normUnit(m[3]) : null;
    out.push({ v, unit: u });
  }
  return out;
}

function close(a: number, b: number, tol: number) {
  if (b === 0) return Math.abs(a) < 1e-9;
  return Math.abs(a - b) <= Math.abs(b) * tol + 1e-12;
}

/** Klopt waarde+eenheid met een van de alternatieven? */
export function vergelijk(ant: { v: number; unit: string }, alts: Waarde[], tol: number): "goed" | "eenheid" | "fout" {
  const nu = normUnit(ant.unit);
  let getalGoed = false;
  for (const alt of alts) {
    const altDim = unitDim(alt.u);
    if (nu !== null && unitDim(nu) === altDim) {
      const a = toBase(ant.v, nu)!, b = toBase(alt.v, alt.u)!;
      if (close(a, b, tol) || (altDim === "1" && close(a * 100, b, tol))) return "goed";
    }
    // getal klopt met exact deze eenheid, maar leerling noteert iets anders/niets
    if (close(ant.v, alt.v, tol)) getalGoed = true;
  }
  if (getalGoed) {
    // dimensieloos: geen eenheid nodig
    if (alts.some((a) => unitDim(a.u) === "1") && (nu === "" || nu === null)) return "goed";
    return "eenheid";
  }
  return "fout";
}

function inWerk(werk: string, vals: Waarde[], tol: number): boolean {
  const g = getallenIn(werk);
  for (const w of vals) {
    for (const x of g) {
      if (x.unit && unitDim(x.unit) === unitDim(w.u)) {
        if (close(toBase(x.v, x.unit)!, toBase(w.v, w.u)!, tol)) return true;
      } else if (close(x.v, w.v, tol)) return true;
    }
  }
  return false;
}

export type RekenInvoer = { formule: string; werk: string; antwoorden: string[]; conclusie?: string };

export function nakijkenReken(item: RekenItem, inv: RekenInvoer): Uitslag {
  const tol = Math.max(item.tol ?? 0.025, 0.02);
  const alles = `${inv.formule}\n${inv.werk}`;
  const res: ("goed" | "eenheid" | "fout" | "leeg")[] = item.parts.map((alts, i) => {
    const raw = inv.antwoorden[i] ?? "";
    if (!raw.trim()) return "leeg";
    const a = parseAntwoord(raw);
    if (!a) return "fout";
    return vergelijk(a, alts, tol);
  });
  // bekende fout (doorwerkfout)
  let bekend: RekenItem["fouten"][number] | null = null;
  if (res[0] === "fout" || res[0] === "eenheid") {
    const a = parseAntwoord(inv.antwoorden[0] ?? "");
    if (a) for (const f of item.fouten) if (vergelijk(a, [{ v: f.v, u: f.u }], tol) !== "fout") bekend = f;
  }
  const iets = res.some((r) => r !== "leeg");
  const stappen: StapUitslag[] = item.steps.map((st, idx) => {
    if (bekend && bekend.verlies.includes(idx)) return { label: st.label, ok: false, uitleg: bekend.uitleg };
    switch (st.k) {
      case "F": {
        const c = checkFormule(alles, item.fam);
        return { label: st.label, ok: c.ok, uitleg: c.ok ? `Juist: ${formuleTonen(c.fam!)}` : c.reden };
      }
      case "N": {
        const ok = res.some((r) => r === "goed") || inWerk(alles, st.vals, tol) || (bekend !== null);
        const toon = st.vals.map((w) => `${String(w.v).replace(".", ",")} ${fmtUnit(w.u)}`.trim()).join(" of ");
        return { label: st.label, ok, uitleg: ok ? "Deze tussenstap klopt." : `Deze tussenstap zie ik niet terug. Verwacht: ${toon}.` };
      }
      case "C": {
        const t = (inv.conclusie ?? "").toLowerCase();
        const ok = iets && st.kw.some((k) => t.includes(k.toLowerCase()));
        return { label: st.label, ok, uitleg: ok ? "Conclusie klopt." : !iets ? "Een conclusie telt alleen als je eerst iets hebt berekend." : "Conclusie ontbreekt of klopt niet." };
      }
      case "R": {
        const r = res[st.part] ?? "leeg";
        if (bekend && st.part === 0) {
          return { label: st.label, ok: true, uitleg: "Consequent doorgerekend met je eerdere fout: dit punt krijg je wel." };
        }
        const alt = item.parts[st.part]![0]!;
        const juist = `${String(alt.v).replace(".", ",")} ${fmtUnit(alt.u)}`.trim();
        if (r === "goed") return { label: st.label, ok: true, uitleg: "Antwoord en eenheid kloppen." };
        if (r === "eenheid") return { label: st.label, ok: false, uitleg: `Het getal klopt, maar de eenheid ontbreekt of klopt niet (verwacht: ${juist}). Eenheidsfout: −1.` };
        if (r === "leeg") return { label: st.label, ok: false, uitleg: "Geen antwoord ingevuld." };
        return { label: st.label, ok: false, uitleg: `Rekenfout: het antwoord moet ongeveer ${juist} zijn. Rekenfout en eenheidsfout samen kosten maximaal 1 punt.` };
      }
    }
  });
  const punten = stappen.filter((s) => s.ok).length;
  return { punten, max: item.steps.length, stappen };
}

export function nakijkenMc(item: McItem, gekozen: number | null): Uitslag {
  const ok = gekozen === item.sleutel;
  const L = "ABCDEF";
  return {
    punten: ok ? 1 : 0,
    max: 1,
    stappen: [{ label: "Juiste keuze", ok, uitleg: ok ? "Goed." : `Het juiste antwoord is ${L[item.sleutel]}: ${item.opties[item.sleutel]}` }],
  };
}

/** Lokale trefwoordcontrole voor open vragen (voorlopig als AI nodig is). */
export function nakijkenOpenLokaal(item: OpenItem, antwoord: string): Uitslag {
  const t = antwoord.toLowerCase();
  const groepen = item.kw.map((g) => g.some((k) => t.includes(k.toLowerCase())));
  let punten = groepen.filter(Boolean).length;
  if (item.kwMax) punten = Math.min(punten, item.kwMax);
  punten = Math.min(punten, item.p);
  const stappen: StapUitslag[] = [];
  for (let i = 0; i < item.p; i++) stappen.push({ label: `punt ${i + 1}`, ok: i < punten, uitleg: "" });
  return { punten, max: item.p, stappen, voorlopig: item.ai };
}
