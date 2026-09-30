/**
 * Examenvraagtypen (frequentie uit CSE NaSk1 2014-2026). Los van de toetsdelen:
 * per-type oefenen werkt ook als toetsdelen.ts leeg of anders is.
 */
export type Leerweg = "BB" | "KB" | "GT";

/** Examenvraagtypen, gesorteerd op frequentie (CSE NaSk1 2014-2026), met aantal per leerweg. */
export const TYPEN: { id: string; naam: string; freq: Record<Leerweg, number> }[] = [
  { id: "E-COMP", naam: "Elektronische componenten en sensoren", freq: { BB: 9, KB: 31, GT: 46 } },
  { id: "K-SOORT", naam: "Soorten krachten", freq: { BB: 11, KB: 14, GT: 45 } },
  { id: "G-OSC", naam: "Oscilloscoopbeeld: toonhoogte en luidheid", freq: { BB: 9, KB: 13, GT: 45 } },
  { id: "G-GEHOOR", naam: "Gehoor en gehoorschade", freq: { BB: 7, KB: 9, GT: 40 } },
  { id: "W-DICHT", naam: "Dichtheid berekenen (ρ = m / V)", freq: { BB: 9, KB: 14, GT: 30 } },
  { id: "W-FASE", naam: "Faseovergangen", freq: { BB: 5, KB: 16, GT: 30 } },
  { id: "M-TRAFO", naam: "Transformator, elektromagneet, motor, dynamo", freq: { BB: 2, KB: 16, GT: 32 } },
  { id: "B-SNEL", naam: "Snelheid, afstand, tijd (s = v · t)", freq: { BB: 13, KB: 11, GT: 25 } },
  { id: "E-SERPAR", naam: "Serie- en parallelschakeling", freq: { BB: 3, KB: 10, GT: 34 } },
  { id: "EN-SOORT", naam: "Energiesoorten en omzettingen", freq: { BB: 1, KB: 15, GT: 29 } },
  { id: "W-MAT", naam: "Materiaaleigenschappen", freq: { BB: 6, KB: 14, GT: 24 } },
  { id: "B-EZEK", naam: "Zwaarte- en bewegingsenergie berekenen", freq: { BB: 0, KB: 11, GT: 32 } },
  { id: "B-VEIL", naam: "Verkeersveiligheid", freq: { BB: 9, KB: 20, GT: 10 } },
  { id: "E-PUI", naam: "Vermogen berekenen (P = U · I)", freq: { BB: 6, KB: 13, GT: 20 } },
  { id: "E-R", naam: "Weerstand berekenen (U = I · R)", freq: { BB: 6, KB: 11, GT: 21 } },
  { id: "K-NET", naam: "Nettokracht en beweging", freq: { BB: 8, KB: 10, GT: 19 } },
  { id: "E-CAP", naam: "Capaciteit accu (C = I · t)", freq: { BB: 5, KB: 11, GT: 20 } },
  { id: "W-DICHTB", naam: "Dichtheid vergelijken en meten", freq: { BB: 2, KB: 7, GT: 27 } },
  { id: "K-DRUK", naam: "Druk berekenen (p = F / A)", freq: { BB: 6, KB: 12, GT: 15 } },
  { id: "W-TRANS", naam: "Warmtetransport en isolatie", freq: { BB: 1, KB: 11, GT: 18 } },
  { id: "K-DRUKB", naam: "Druk: groter of kleiner oppervlak", freq: { BB: 7, KB: 10, GT: 13 } },
  { id: "G-FREQ", naam: "Frequentie en trillingstijd (f = 1 / T)", freq: { BB: 0, KB: 10, GT: 20 } },
  { id: "E-REND", naam: "Rendement berekenen", freq: { BB: 1, KB: 10, GT: 18 } },
  { id: "G-ECHO", naam: "Geluidssnelheid en echo", freq: { BB: 4, KB: 7, GT: 17 } },
  { id: "E-EPT", naam: "Energie berekenen (E = P · t)", freq: { BB: 3, KB: 7, GT: 18 } },
  { id: "E-TRAFO", naam: "Transformator berekenen", freq: { BB: 2, KB: 8, GT: 18 } },
  { id: "W-AFVAL", naam: "Afval scheiden en recyclen", freq: { BB: 4, KB: 12, GT: 11 } },
  { id: "S-CALC-OV", naam: "Overige berekening", freq: { BB: 8, KB: 6, GT: 12 } },
  { id: "G-BEREIK", naam: "Gehoorbereik en geluidsvoortplanting", freq: { BB: 5, KB: 8, GT: 12 } },
  { id: "K-MOM", naam: "Momentenwet", freq: { BB: 0, KB: 2, GT: 22 } },
  { id: "K-FMA", naam: "Kracht en versnelling (F = m · a)", freq: { BB: 2, KB: 1, GT: 18 } },
  { id: "B-ACC", naam: "Versnelling berekenen", freq: { BB: 2, KB: 0, GT: 19 } },
  { id: "E-VERM-BEGR", naam: "Vermogen en energieverbruik vergelijken", freq: { BB: 6, KB: 2, GT: 9 } },
  { id: "EN-DUUR", naam: "Duurzame energie en milieu", freq: { BB: 1, KB: 6, GT: 10 } },
  { id: "S-EENH", naam: "Eenheden omrekenen", freq: { BB: 3, KB: 10, GT: 3 } },
  { id: "G-DB", naam: "Geluidssterkte (dB) en afstand", freq: { BB: 2, KB: 3, GT: 11 } },
  { id: "E-VEIL", naam: "Veilig omgaan met elektriciteit", freq: { BB: 3, KB: 1, GT: 11 } },
  { id: "S-VERBAND", naam: "Verband in tabel of grafiek", freq: { BB: 1, KB: 3, GT: 10 } },
  { id: "K-ARB", naam: "Arbeid berekenen (W = F · s)", freq: { BB: 0, KB: 0, GT: 14 } },
  { id: "G-BRON", naam: "Geluidsoverlast beperken", freq: { BB: 4, KB: 2, GT: 6 } },
  { id: "W-VERBR", naam: "Verbranding", freq: { BB: 2, KB: 3, GT: 7 } },
  { id: "W-CORR", naam: "Corrosie", freq: { BB: 2, KB: 5, GT: 5 } },
  { id: "W-TEMP-C", naam: "Temperatuur °C en kelvin", freq: { BB: 0, KB: 2, GT: 10 } },
  { id: "E-KOST", naam: "Energiekosten berekenen", freq: { BB: 0, KB: 1, GT: 8 } },
  { id: "W-STOF", naam: "Stofeigenschappen en mengsels", freq: { BB: 0, KB: 1, GT: 7 } },
  { id: "B-STOP", naam: "Stopafstand en reactieafstand", freq: { BB: 2, KB: 2, GT: 3 } },
  { id: "E-RV", naam: "Vervangingsweerstand", freq: { BB: 0, KB: 2, GT: 5 } },
  { id: "W-DRIJF", naam: "Drijven, zweven, zinken", freq: { BB: 0, KB: 2, GT: 4 } },
];

/** Welke bank-leerwegen tellen mee: je eigen leerweg + één lager (ook oefenwaardig). */
export function leerwegenVoor(lw: Leerweg): Leerweg[] {
  return lw === "BB" ? ["BB"] : lw === "KB" ? ["KB", "BB"] : ["GT", "KB"];
}
