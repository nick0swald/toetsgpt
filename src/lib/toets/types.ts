export const KLASSEN = ["2.5G", "2.6G", "3.5G", "3.6G", "4GT", "3HGL"] as const;
export type Klas = (typeof KLASSEN)[number];

export const LEERJAREN = ["1", "2", "3", "4"] as const;
export type Leerjaar = (typeof LEERJAREN)[number];

export const NIVEAUS = ["BB", "KB", "GT"] as const;
export type Niveau = (typeof NIVEAUS)[number];

export const VRAAG_AANTALLEN = [4, 6, 8, 10, 12] as const;
export type VraagAantal = (typeof VRAAG_AANTALLEN)[number];

export type VraagSoort = "auto" | "mix" | "mc" | "open" | "invul" | "lees";
export type TijdKeuze = "kort" | "10" | "15" | "20";

export type Letter = "A" | "B" | "C" | "D";
export const LETTERS: Letter[] = ["A", "B", "C", "D"];

export type McOption = {
  letter: Letter;
  text: string;
};

export type OpenAccept = {
  numbers?: number[];
  tolerance?: number;
  keywords?: string[];
};

export type StofTag = {
  hoofdstukId: string;
  paragraafId: string;
  label: string;
};

type VraagBasis = {
  id: string;
  situation: string;
  prompt: string;
  why: string;
  modelAnswer: string;
  stof?: StofTag;
  /** stof = rekenen/kennis; lees = vaktekst lezen */
  skill?: "stof" | "lees";
};

export type McQuestion = VraagBasis & {
  type: "mc";
  points: 1;
  options: McOption[];
  correctLetter: Letter;
};

export type OpenQuestion = VraagBasis & {
  type: "open";
  points: number;
  accept: OpenAccept;
};

export type InvulQuestion = VraagBasis & {
  type: "invul";
  points: 1;
  accept: OpenAccept;
};

export type Question = McQuestion | OpenQuestion | InvulQuestion;

export type ToetsBron = {
  kind: "zelf" | "docent" | "demo" | "extra";
  topic: string;
  raw?: string;
  count: number;
  soort: VraagSoort;
  tijd: TijdKeuze;
  hoofdstukId?: string;
  paragraafIds?: string[];
  lastig?: string;
  leerjaar?: string;
  niveau?: string;
  vakId?: string;
};

export type Toets = {
  title: string;
  subject: string;
  questions: Question[];
  bron: ToetsBron;
};

export type VraagUitslag = {
  question: Question;
  given: string;
  correct: boolean;
  points: number;
  max: number;
};

export type StofScore = {
  tag: StofTag;
  behaald: number;
  totaal: number;
};

export type Diagnose = {
  perStof: StofScore[];
  lastig: StofScore[];
};

export type ToetsUitslag = {
  behaald: number;
  totaal: number;
  cijfer: number;
  perVraag: VraagUitslag[];
  diagnose: Diagnose;
};

export type Screen = "start" | "vandaag" | "zelf" | "docent" | "exam" | "results" | "overzicht";
