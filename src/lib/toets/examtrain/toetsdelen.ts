/**
 * Toetsdeel → hoofdstukken → vraagtypen (klas 4GT, Nova Nask 1), volgens het PTA VMBO TL/GL 2025-2027, leerjaar 4.
 * Nick controleert zelf welke hoofdstukken bij welk toetsdeel horen; pas alleen dit bestand aan.
 *
 * Hoofdstukken in Nova Nask 1, 4 vmbo-gt (uit de boeken in de OswaldGPT-repo; zelfde editie als de examentraining):
 *   deel A: H9 Schakelingen, H10 Krachten, H11 Energie, H12 Elektriciteit
 *   deel B: H13 Geluid, H14 Werktuigen, H15 Bewegingen, H16 Kracht en beweging
 * Let op: de oudere Nova-toetsmatrijzen in Nicks map nummeren anders (H1 Krachten, H6 Werktuigen, H10 Bewegingen,
 * H11 Kracht en beweging). Daar is "H11" dus Kracht en beweging (= H16 hier, SE4.4), niet Energie.
 * "Materie" in SE4.2 is geen 4GT-hoofdstuk (klas-3-stof: 3GT H4 Stoffen en/of H7 Materialen; nog te bevestigen).
 * SE4.5 (PO Licht, straling, het weer; weging examen 0) heeft geen 4GT-hoofdstuk en geen vraagtypen hier.
 * Per-type oefenen hangt hier NIET van af; een vraagtype mag in meerdere of geen toetsdelen staan.
 */
export const TOETSDELEN_VOORLOPIG = true;

export type Toetsdeel = {
  id: string;
  nr: number | null;
  titel: string;
  hoofdstukken: string;
  typen: string[];
  /** PTA-code (VMBO TL/GL 2025-2027). */
  pta?: string;
  /** Periode en weging uit het PTA. */
  periode?: number;
  weging?: number;
};

export const TOETSDELEN: Toetsdeel[] = [
  {
    id: "deel1", nr: 1, pta: "SE4.1", periode: 1, weging: 3,
    titel: "Krachten en werktuigen", hoofdstukken: "H10 Krachten + H14 Werktuigen",
    typen: ["K-SOORT", "K-VECT", "K-RES", "K-SCHAAL", "K-DRUK", "K-DRUKB", "K-HEF", "K-MOM", "K-ARM", "K-ZWP"],
  },
  {
    id: "deel2", nr: 2, pta: "SE4.2", periode: 1, weging: 3,
    titel: "Energie, geluid en materie", hoofdstukken: "H11 Energie + H13 Geluid + materie (klas 3) en Binas",
    typen: [
      "EN-SOORT", "EN-DUUR", "E-REND", "W-VBW", "W-VERBR", "E-EPT", "E-KOST", "E-VERM-BEGR", "B-EZEK", "G-OSC", "G-GEHOOR", "G-FREQ", "G-ECHO", "G-BEREIK", "G-DB", "G-BRON",
      // Materie (klas-3-stof, zie kop): dichtheid, fasen, stof- en materiaaleigenschappen.
      "W-DICHT", "W-DICHTB", "W-FASE", "W-MAT", "W-STOF", "W-DRIJF",
    ],
  },
  {
    id: "deel3", nr: 3, pta: "SE4.3", periode: 2, weging: 3,
    titel: "Elektriciteit", hoofdstukken: "H9 Schakelingen + H12 Elektriciteit",
    typen: ["E-COMP", "E-SERPAR", "E-SCHEMA", "E-R", "E-RV", "E-METER", "E-PUI", "E-CAP", "E-EPT", "E-KOST", "E-TRAFO", "M-TRAFO", "E-VEIL", "E-VERM-BEGR"],
  },
  {
    id: "deel4", nr: 4, pta: "SE4.4", periode: 2, weging: 3,
    titel: "Arbeid en kracht", hoofdstukken: "H15 Bewegingen + H16 Kracht en beweging",
    typen: ["B-SNEL", "B-DIAG", "B-ACC", "K-NET", "K-FMA", "B-VEIL", "B-STOP", "K-ARB", "B-EZEK"],
  },
  {
    id: "overig", nr: null, titel: "Stoffen, warmte en vaardigheden", hoofdstukken: "klas 3-stof en vaardigheden (Binas)",
    typen: ["W-DICHT", "W-DICHTB", "W-FASE", "W-MAT", "W-TRANS", "W-VEIL", "W-AFVAL", "W-CORR", "W-TEMP-C", "W-STOF", "W-DRIJF", "S-GRAF", "S-CALC-OV", "S-ONDZ", "S-AFLEZ", "S-EENH", "S-VERBAND"],
  },
];
