/** NaSk-figuren zoals Toetski stap 0: een specificatie, daarna een vaste SVG. Geen foto. */

export interface FiguurControle {
  meting: string;
  waarde?: number;
  parameter?: string;
}

export interface Maatcilinder {
  niveau: number;
  label?: string;
  voorwerp?: boolean;
}

export interface MaatcilinderFiguur {
  type: "maatcilinder";
  cilinders: Maatcilinder[];
  max: number;
  streep: number;
  getalElke: number;
  breedteCm: number;
  controle?: FiguurControle[];
}

export type NenSoort =
  | "weerstand"
  | "variabele-weerstand"
  | "lamp"
  | "spanningsmeter"
  | "stroommeter"
  | "motor"
  | "cel"
  | "wisselbron"
  | "schakelaar"
  | "diode"
  | "led"
  | "zekering";

export interface Onderdeel {
  soort: NenSoort;
  label?: string;
  rood?: boolean;
}

export interface SchakelschemaFiguur {
  type: "schakelschema";
  bron: { soort: "cel" | "wisselbron"; label?: string };
  takken: { onderdelen: Onderdeel[]; rood?: boolean }[];
  vrijeRuimte?: boolean;
  breedteCm: number;
  controle?: FiguurControle[];
}

export interface As {
  label: string;
  min: number;
  max: number;
  stap: number;
  fijn?: number;
  zonderGetallen?: boolean;
}

export interface Reeks {
  punten: [number, number][];
  vorm: "lijn" | "vloeiend" | "punten";
  rood?: boolean;
}

export interface GrafiekFiguur {
  type: "grafiek";
  x: As;
  y: As;
  reeksen: Reeks[];
  panelen?: { label: string; punten: [number, number][] }[];
  breedteCm: number;
  controle?: FiguurControle[];
}

export interface Pijl {
  naam: string;
  grootteN: number;
  hoek: number;
  label?: string;
  rood?: boolean;
}

export interface KrachtenFiguur {
  type: "krachten";
  breedteCm: number;
  hoogteCm: number;
  schaalN: number;
  voorwerp: "bloempot" | "boomstam" | "krat" | "geen";
  punt: [number, number];
  puntLabel?: string;
  pijlen: Pijl[];
  resultante?: { label?: string };
  controle?: FiguurControle[];
}

export interface MeterFiguur {
  type: "meter";
  soort: "wijzer" | "kwh";
  eenheid: string;
  min?: number;
  max?: number;
  streep?: number;
  getalElke?: number;
  waarde: number;
  cijfers?: number;
  decimalen?: number;
  label?: string;
  breedteCm: number;
  controle?: FiguurControle[];
}

export interface OscPaneel {
  label?: string;
  amplitude: number;
  trillingstijd: number;
}

export interface OscilloscoopFiguur {
  type: "oscilloscoop";
  hokjesX: number;
  hokjesY: number;
  panelen: OscPaneel[];
  onderschrift?: string;
  notitie?: string;
  breedteCm: number;
  controle?: FiguurControle[];
}

export type FiguurSpec =
  | MaatcilinderFiguur
  | SchakelschemaFiguur
  | GrafiekFiguur
  | KrachtenFiguur
  | MeterFiguur
  | OscilloscoopFiguur;
