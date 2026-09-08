import type { Leerjaar, Niveau } from "./types";

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
};

export type Curriculum = {
  vak: string;
  voorbeeld: boolean;
  bronLabel: string;
  hoofdstukken: Hoofdstuk[];
};

/**
 * Geladen toetsstof van de docent.
 *
 * Nu: één voorbeeldhoofdstuk NaSk, zodat de leerlingstroom werkt.
 * Later: vervang dit object door de biologiestof van Nick. Dit NaSk-hoofdstuk
 * gaat er dan uit. De rest van de app (kiezen, vragen, diagnose) blijft gelijk.
 */
export const CURRICULUM: Curriculum = {
  vak: "NaSk",
  voorbeeld: true,
  bronLabel: "Voorbeeldstof · later biologie",
  hoofdstukken: [
    {
      id: "dichtheid",
      titel: "Dichtheid",
      jaren: ["2", "3", "4"],
      niveaus: ["BB", "KB", "GT"],
      paragrafen: [
        { id: "dichtheid-massa-volume", titel: "Massa en volume" },
        { id: "dichtheid-berekenen", titel: "Dichtheid berekenen" },
        { id: "dichtheid-vergelijken", titel: "Dichtheid vergelijken" },
      ],
    },
  ],
};

export const HOOFDSTUKKEN = CURRICULUM.hoofdstukken;

export function parseKlas(klas: string): { leerjaar: Leerjaar | ""; niveau: Niveau | "" } {
  if (klas.startsWith("2")) return { leerjaar: "2", niveau: "GT" };
  if (klas.startsWith("4")) return { leerjaar: "4", niveau: "GT" };
  if (klas.startsWith("3")) return { leerjaar: "3", niveau: "GT" };
  return { leerjaar: "", niveau: "" };
}

export function hoofdstukkenVoor(leerjaar: string, niveau: string): Hoofdstuk[] {
  return HOOFDSTUKKEN.filter((h) => {
    const jaarOk = !leerjaar || h.jaren.includes(leerjaar as Leerjaar);
    const nivOk = !niveau || h.niveaus.includes(niveau as Niveau);
    return jaarOk && nivOk;
  });
}

export function hoofdstukById(id: string): Hoofdstuk | undefined {
  return HOOFDSTUKKEN.find((h) => h.id === id);
}

export function eersteHoofdstukId(leerjaar = "", niveau = ""): string {
  return hoofdstukkenVoor(leerjaar, niveau)[0]?.id ?? HOOFDSTUKKEN[0]?.id ?? "";
}
