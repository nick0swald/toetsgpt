/** Vast bericht tussen ToetsGPT, OswaldGPT en Toetski. Versie 1. */

export const KOPPEL = "toetsgpt-1" as const;
export const CESUUR = 0.55;

export type KoppelDoel = {
  id: string;
  vakId: string;
  hoofdstukId: string;
  paragraafId: string;
  label: string;
  behaald: number;
  totaal: number;
  rood: boolean;
};

export type KoppelBericht = {
  koppel: typeof KOPPEL;
  van: "ToetsGPT";
  voor: ["OswaldGPT", "Toetski"];
  vakId: string;
  klas?: string;
  leerjaar?: string;
  niveau?: string;
  cijfer?: number;
  feedback: string;
  doelen: KoppelDoel[];
};

function stuk(s: string): string {
  const id = s
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  return id || "stof";
}

/** Zelfde id op alle drie de apps. Voorbeeld: nask:dichtheid:dichtheid-berekenen */
export function doelId(vakId: string, hoofdstukId: string, paragraafId: string): string {
  return `${stuk(vakId)}:${stuk(hoofdstukId)}:${stuk(paragraafId)}`;
}

export function koppelVanKlas(input: {
  rijen: {
    vakId: string;
    hoofdstukId: string;
    paragraafId: string;
    label: string;
    behaald: number;
    totaal: number;
    lastig: number;
    oefeningen: number;
  }[];
  klas?: string;
}): KoppelBericht {
  const doelen = input.rijen.map((s) => {
    const doel = koppelDoel({
      vakId: s.vakId,
      hoofdstukId: s.hoofdstukId,
      paragraafId: s.paragraafId,
      label: s.label,
      behaald: s.behaald,
      totaal: s.totaal,
    });
    if (s.totaal === 0) doel.rood = s.oefeningen > 0 && s.lastig / s.oefeningen >= CESUUR;
    return doel;
  });
  const rood = doelen.filter((d) => d.rood).map((d) => d.label);
  const feedback = rood.length
    ? `De klas blijft onder de cesuur bij ${rood.slice(0, 3).join(", ")}.`
    : "Geen rode doelen in de laatste 28 dagen.";
  return {
    koppel: KOPPEL,
    van: "ToetsGPT",
    voor: ["OswaldGPT", "Toetski"],
    vakId: doelen[0]?.vakId ?? "nask",
    klas: input.klas,
    feedback,
    doelen,
  };
}

export function isRood(behaald: number, totaal: number): boolean {
  return totaal > 0 && behaald / totaal < CESUUR;
}

export function koppelDoel(input: {
  vakId: string;
  hoofdstukId: string;
  paragraafId: string;
  label: string;
  behaald: number;
  totaal: number;
}): KoppelDoel {
  return {
    id: doelId(input.vakId, input.hoofdstukId, input.paragraafId),
    vakId: input.vakId,
    hoofdstukId: input.hoofdstukId,
    paragraafId: input.paragraafId,
    label: input.label,
    behaald: input.behaald,
    totaal: input.totaal,
    rood: isRood(input.behaald, input.totaal),
  };
}
