import type { Diagnose, Leerjaar, Niveau, StofScore, ToetsBron } from "./types";

const KEY = "toetsgpt.diagnose.v1";

export type StofGeheugen = {
  hoofdstukId: string;
  paragraafId: string;
  label: string;
  behaald: number;
  totaal: number;
  updatedAt: number;
};

export type DiagnoseGeheugen = {
  v: 1;
  leerjaar?: Leerjaar | string;
  niveau?: Niveau | string;
  hoofdstukId?: string;
  vakId?: string;
  stof: StofGeheugen[];
  updatedAt: number;
};

function safeParse(raw: string | null): DiagnoseGeheugen | null {
  if (!raw) return null;
  try {
    const data = JSON.parse(raw) as DiagnoseGeheugen;
    if (!data || data.v !== 1 || !Array.isArray(data.stof)) return null;
    return data;
  } catch {
    return null;
  }
}

export function leesDiagnoseGeheugen(): DiagnoseGeheugen | null {
  if (typeof window === "undefined") return null;
  try {
    return safeParse(window.localStorage.getItem(KEY));
  } catch {
    return null;
  }
}

export function wisDiagnoseGeheugen(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(KEY);
  } catch {
    /* ignore */
  }
}

function ratio(s: { behaald: number; totaal: number }): number {
  return s.totaal > 0 ? s.behaald / s.totaal : 0;
}

/** Merge round diagnose into on-device memory + remember last choices. */
export function slaDiagnoseOp(opts: {
  diagnose: Diagnose;
  bron?: ToetsBron | null;
  leerjaar?: string;
  niveau?: string;
  hoofdstukId?: string;
  vakId?: string;
}): DiagnoseGeheugen {
  const prev = leesDiagnoseGeheugen();
  const map = new Map<string, StofGeheugen>();
  for (const s of prev?.stof ?? []) {
    map.set(s.paragraafId, { ...s });
  }
  const now = Date.now();
  for (const row of opts.diagnose.perStof) {
    const id = row.tag.paragraafId;
    const old = map.get(id);
    map.set(id, {
      hoofdstukId: row.tag.hoofdstukId,
      paragraafId: id,
      label: row.tag.label,
      behaald: (old?.behaald ?? 0) + row.behaald,
      totaal: (old?.totaal ?? 0) + row.totaal,
      updatedAt: now,
    });
  }
  const stof = [...map.values()]
    .sort((a, b) => b.updatedAt - a.updatedAt)
    .slice(0, 40);

  const next: DiagnoseGeheugen = {
    v: 1,
    leerjaar: opts.leerjaar || opts.bron?.leerjaar || prev?.leerjaar,
    niveau: opts.niveau || opts.bron?.niveau || prev?.niveau,
    hoofdstukId:
      opts.hoofdstukId ||
      opts.bron?.hoofdstukId ||
      prev?.hoofdstukId ||
      undefined,
    vakId: opts.vakId || opts.bron?.vakId || prev?.vakId || "nask",
    stof,
    updatedAt: now,
  };

  if (typeof window !== "undefined") {
    try {
      window.localStorage.setItem(KEY, JSON.stringify(next));
    } catch {
      /* ignore quota */
    }
  }
  return next;
}

export function pijnpunten(g: DiagnoseGeheugen | null, lim = 4): StofGeheugen[] {
  if (!g) return [];
  return [...g.stof]
    .filter((s) => s.totaal > 0 && ratio(s) < 0.55)
    .sort((a, b) => ratio(a) - ratio(b) || b.totaal - a.totaal)
    .slice(0, lim);
}

export function wins(g: DiagnoseGeheugen | null, lim = 3): StofGeheugen[] {
  if (!g) return [];
  return [...g.stof]
    .filter((s) => s.totaal > 0 && ratio(s) >= 0.7)
    .sort((a, b) => ratio(b) - ratio(a) || b.totaal - a.totaal)
    .slice(0, lim);
}

/** One short Dutch line for the next round. Empty if nothing useful yet. */
export function diagnoseZin(g: DiagnoseGeheugen | null): string {
  if (!g || g.stof.length === 0) return "";
  const zwak = pijnpunten(g, 2).map((s) => kortLabel(s.label));
  const sterk = wins(g, 2).map((s) => kortLabel(s.label));
  if (!zwak.length && !sterk.length) return "";
  if (zwak.length && sterk.length) {
    return `Dit ging al: ${sterk.join(", ")}. Dit nog niet: ${zwak.join(", ")}.`;
  }
  if (zwak.length) return `Dit nog niet: ${zwak.join(", ")}.`;
  return `Dit ging al: ${sterk.join(", ")}.`;
}

function kortLabel(label: string): string {
  const t = label.replace(/^\d+\.\s*/, "").trim();
  return t.length > 36 ? `${t.slice(0, 34)}…` : t;
}

export function lastigTekst(g: DiagnoseGeheugen | null): string {
  return pijnpunten(g, 5)
    .map((s) => s.label)
    .join(", ");
}

export function asStofScores(rows: StofGeheugen[]): StofScore[] {
  return rows.map((s) => ({
    tag: {
      hoofdstukId: s.hoofdstukId,
      paragraafId: s.paragraafId,
      label: s.label,
    },
    behaald: s.behaald,
    totaal: s.totaal,
  }));
}
