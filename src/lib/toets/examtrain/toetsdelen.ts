/**
 * VOORLOPIG — toetsdeel → hoofdstukken → vraagtypen (klas 4GT, Nova Nask 1).
 * Nick controleert zelf welke hoofdstukken bij welk toetsdeel horen; pas alleen dit bestand aan.
 *
 * Hoofdstukken in Nova Nask 1, 4 vmbo-gt (uit de boeken in de OswaldGPT-repo):
 *   deel A: H9 Schakelingen, H10 Krachten, H11 Energie, H12 Elektriciteit
 *   deel B: H13 Geluid, H14 Werktuigen, H15 Bewegingen, H16 Kracht en beweging
 * Per-type oefenen hangt hier NIET van af; een vraagtype mag in meerdere of geen toetsdelen staan.
 */
export const TOETSDELEN_VOORLOPIG = true;

export type Toetsdeel = {
  id: string;
  nr: number | null;
  titel: string;
  hoofdstukken: string;
  typen: string[];
};

export const TOETSDELEN: Toetsdeel[] = [
  {
    id: "deel1", nr: 1, titel: "Krachten en werktuigen", hoofdstukken: "H10 Krachten + H14 Werktuigen",
    typen: ["K-SOORT", "K-VECT", "K-RES", "K-SCHAAL", "K-DRUK", "K-DRUKB", "K-HEF", "K-MOM", "K-ARM", "K-ZWP"],
  },
  {
    id: "deel2", nr: 2, titel: "Energie en geluid", hoofdstukken: "H11 Energie + H13 Geluid",
    typen: ["EN-SOORT", "EN-DUUR", "E-REND", "W-VBW", "W-VERBR", "E-EPT", "E-KOST", "E-VERM-BEGR", "B-EZEK", "G-OSC", "G-GEHOOR", "G-FREQ", "G-ECHO", "G-BEREIK", "G-DB", "G-BRON"],
  },
  {
    id: "deel3", nr: 3, titel: "Elektriciteit en schakelingen", hoofdstukken: "H9 Schakelingen + H12 Elektriciteit",
    typen: ["E-COMP", "E-SERPAR", "E-SCHEMA", "E-R", "E-RV", "E-METER", "E-PUI", "E-CAP", "E-EPT", "E-KOST", "E-TRAFO", "M-TRAFO", "E-VEIL", "E-VERM-BEGR"],
  },
  {
    id: "deel4", nr: 4, titel: "Arbeid en beweging", hoofdstukken: "H15 Bewegingen + H16 Kracht en beweging",
    typen: ["B-SNEL", "B-DIAG", "B-ACC", "K-NET", "K-FMA", "B-VEIL", "B-STOP", "K-ARB", "B-EZEK"],
  },
  {
    id: "overig", nr: null, titel: "Stoffen, warmte en vaardigheden", hoofdstukken: "klas 3-stof en vaardigheden",
    typen: ["W-DICHT", "W-DICHTB", "W-FASE", "W-MAT", "W-TRANS", "W-VEIL", "W-AFVAL", "W-CORR", "W-TEMP-C", "W-STOF", "W-DRIJF", "S-GRAF", "S-CALC-OV", "S-ONDZ", "S-AFLEZ", "S-EENH", "S-VERBAND"],
  },
];

