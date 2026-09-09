import type { Leerjaar, Niveau } from "./types";
import { boekVoor, hoofdstukHeeftBoek, novaHoofdstukken, novaHoofdstukkenVoor } from "./nova";

export type Paragraaf = {
  id: string;
  titel: string;
};

export type Hoofdstuk = {
  id: string;
  titel: string;
  jaren: Leerjaar[];
  niveaus: Niveau[];
  paragrafen: Paragraaf[];
  bank: boolean;
  boek?: boolean;
};

export type VakStatus = "live" | "binnenkort";

export type Vak = {
  id: string;
  titel: string;
  status: VakStatus;
  boek: string;
  bronLabel: string;
  hoofdstukken: Hoofdstuk[];
  tijdelijk?: boolean;
};

const NASK: Vak = {
  id: "nask",
  titel: "NaSk",
  status: "live",
  boek: "Nova NaSk",
  bronLabel: "Nova 3GT deel A geladen (H1–H4). Rest volgt.",
  hoofdstukken: novaHoofdstukken(),
};

const BIOLOGIE: Vak = {
  id: "biologie",
  titel: "Biologie",
  status: "binnenkort",
  boek: "Biologie VMBO",
  bronLabel: "Volgt: volledig curriculum biologie van Nick.",
  hoofdstukken: [],
};

const LEZEN: Vak = {
  id: "lees",
  titel: "Leesvaardigheid",
  status: "live",
  boek: "Vakteksten",
  bronLabel: "Tijdelijk. Alleen leesvragen bij een vaktekst.",
  tijdelijk: true,
  hoofdstukken: [],
};

export const VAKKEN: Vak[] = [NASK, LEZEN, BIOLOGIE];

export const DEFAULT_VAK_ID = "nask";

export const CURRICULUM = NASK;

export const HOOFDSTUKKEN = NASK.hoofdstukken;

export function vakById(id: string): Vak | undefined {
  return VAKKEN.find((v) => v.id === id);
}

export function vakOf(id?: string): Vak {
  return vakById(id ?? "") ?? NASK;
}

export function parseKlas(klas: string): { leerjaar: Leerjaar | ""; niveau: Niveau | "" } {
  if (klas === "3HGL") return { leerjaar: "4", niveau: "GT" };
  if (klas.startsWith("2")) return { leerjaar: "2", niveau: "GT" };
  if (klas.startsWith("4")) return { leerjaar: "4", niveau: "GT" };
  if (klas.startsWith("3")) return { leerjaar: "3", niveau: "GT" };
  return { leerjaar: "", niveau: "" };
}

export function hoofdstukkenVoor(
  leerjaar: string,
  niveau: string,
  vakId = DEFAULT_VAK_ID,
  klas = "",
): Hoofdstuk[] {
  if (vakOf(vakId).id === "lees") return [];
  if (vakOf(vakId).id !== "nask") {
    return vakOf(vakId).hoofdstukken.filter((h) => {
      const jaarOk = !leerjaar || h.jaren.includes(leerjaar as Leerjaar);
      const nivOk = !niveau || h.niveaus.includes(niveau as Niveau);
      return jaarOk && nivOk;
    });
  }
  const lijst = novaHoofdstukkenVoor(klas, leerjaar);
  return lijst.filter((h) => {
    const jaarOk = !leerjaar || h.jaren.includes(leerjaar as Leerjaar) || Boolean(klas);
    const nivOk = !niveau || h.niveaus.includes(niveau as Niveau);
    return jaarOk && nivOk;
  });
}

export function hoofdstukById(id: string, vakId = DEFAULT_VAK_ID): Hoofdstuk | undefined {
  return vakOf(vakId).hoofdstukken.find((h) => h.id === id) ?? HOOFDSTUKKEN.find((h) => h.id === id);
}

export function eersteHoofdstukId(
  leerjaar = "",
  niveau = "",
  vakId = DEFAULT_VAK_ID,
  klas = "",
): string {
  return (
    hoofdstukkenVoor(leerjaar, niveau, vakId, klas)[0]?.id ?? vakOf(vakId).hoofdstukken[0]?.id ?? ""
  );
}

export function paragraafLabel(hoofdstukId: string, paragraafId: string): string {
  const h = hoofdstukById(hoofdstukId);
  const p = h?.paragrafen.find((x) => x.id === paragraafId);
  if (h && p) return `${h.titel} · ${p.titel}`;
  return p?.titel ?? h?.titel ?? paragraafId;
}

export function boekLabel(klas: string, leerjaar = ""): string {
  return boekVoor(klas, leerjaar);
}

export { hoofdstukHeeftBoek };
