import type { Leerjaar, Niveau } from "./types";

export type NovaSeries = "kgt12" | "gt3" | "gt4";

type NovaChapter = {
  n: number;
  title: string;
  paragraphs: { n: number; title: string }[];
};

const NIVEAUS: Niveau[] = ["BB", "KB", "GT"];

type PackedHoofdstuk = {
  id: string;
  titel: string;
  jaren: Leerjaar[];
  niveaus: Niveau[];
  paragrafen: { id: string; titel: string }[];
  bank: boolean;
  boek: boolean;
};

const KGT12: NovaChapter[] = [
  {
    n: 1,
    title: "Natuurkunde en scheikunde",
    paragraphs: [
      { n: 1, title: "Een nieuw vak" },
      { n: 2, title: "Onderzoeken" },
      { n: 3, title: "Practicum" },
      { n: 4, title: "Meten" },
    ],
  },
  {
    n: 2,
    title: "Stoffen",
    paragraphs: [
      { n: 1, title: "Stoffen in huis" },
      { n: 2, title: "Zuivere stoffen en mengsels" },
      { n: 3, title: "Massa en volume" },
      { n: 4, title: "Dichtheid" },
    ],
  },
  {
    n: 3,
    title: "Water",
    paragraphs: [
      { n: 1, title: "IJs – water – waterdamp" },
      { n: 2, title: "Temperatuur meten" },
      { n: 3, title: "Veranderen van fase" },
      { n: 4, title: "Kookpunt en smeltpunt" },
    ],
  },
  {
    n: 4,
    title: "Elektriciteit",
    paragraphs: [
      { n: 1, title: "Een stroomkring maken" },
      { n: 2, title: "Spanningsbronnen" },
      { n: 3, title: "Schakelingen" },
      { n: 4, title: "Vermogen en energie" },
    ],
  },
  {
    n: 5,
    title: "Bewegen",
    paragraphs: [
      { n: 1, title: "Bewegingen vastleggen" },
      { n: 2, title: "Gemiddelde snelheid" },
      { n: 3, title: "Soorten bewegingen" },
      { n: 4, title: "Remmen en botsen" },
    ],
  },
  {
    n: 6,
    title: "Licht",
    paragraphs: [
      { n: 1, title: "Licht en schaduw" },
      { n: 2, title: "Spiegelbeelden" },
      { n: 3, title: "Licht en kleur" },
      { n: 4, title: "Infrarode en ultraviolette straling" },
    ],
  },
  {
    n: 7,
    title: "Het heelal",
    paragraphs: [
      { n: 1, title: "De zon, de aarde en de maan" },
      { n: 2, title: "Het zonnestelsel" },
      { n: 3, title: "De planeten" },
      { n: 4, title: "De bouw van het heelal" },
    ],
  },
  {
    n: 8,
    title: "Geluid",
    paragraphs: [
      { n: 1, title: "Geluid maken en horen" },
      { n: 2, title: "Toonhoogte en frequentie" },
      { n: 3, title: "Geluidssterkte" },
      { n: 4, title: "Geluidsoverlast verminderen" },
    ],
  },
];

const GT3: NovaChapter[] = [
  {
    n: 1,
    title: "Elektriciteit",
    paragraphs: [
      { n: 1, title: "Elektrische stroom" },
      { n: 2, title: "Elektriciteit in huis" },
      { n: 3, title: "Vermogen en energie" },
      { n: 4, title: "Elektriciteit en veiligheid" },
    ],
  },
  {
    n: 2,
    title: "Het weer",
    paragraphs: [
      { n: 1, title: "Het deeltjesmodel" },
      { n: 2, title: "Luchtdruk" },
      { n: 3, title: "Temperatuur" },
      { n: 4, title: "Wolken en onweer" },
    ],
  },
  {
    n: 3,
    title: "Krachten",
    paragraphs: [
      { n: 1, title: "Krachten herkennen" },
      { n: 2, title: "Krachten meten" },
      { n: 3, title: "Nettokracht" },
      { n: 4, title: "Krachten in werktuigen" },
    ],
  },
  {
    n: 4,
    title: "Stoffen",
    paragraphs: [
      { n: 1, title: "Stofeigenschappen" },
      { n: 2, title: "Smeltpunt en kookpunt" },
      { n: 3, title: "Veilig werken met stoffen" },
      { n: 4, title: "Chemische reacties" },
    ],
  },
  {
    n: 5,
    title: "Licht",
    paragraphs: [
      { n: 1, title: "Licht, schaduw en spiegels" },
      { n: 2, title: "Van infrarood tot ultraviolet" },
      { n: 3, title: "Beelden maken met een lens" },
      { n: 4, title: "Oog en bril" },
    ],
  },
  {
    n: 6,
    title: "Warmte",
    paragraphs: [
      { n: 1, title: "Warmte en temperatuur" },
      { n: 2, title: "Brandstoffen en verbranden" },
      { n: 3, title: "Warmtetransport" },
      { n: 4, title: "Isoleren" },
    ],
  },
  {
    n: 7,
    title: "Materialen",
    paragraphs: [
      { n: 1, title: "Materialen toepassen" },
      { n: 2, title: "Van grondstof tot product" },
      { n: 3, title: "Afvalverwerking" },
      { n: 4, title: "Dichtheid" },
    ],
  },
  {
    n: 8,
    title: "Atomen en straling",
    paragraphs: [
      { n: 1, title: "Atomen als stralingsbron" },
      { n: 2, title: "Radioactief verval" },
      { n: 3, title: "Straling gebruiken" },
      { n: 4, title: "Bescherming tegen straling" },
    ],
  },
];

const GT4: NovaChapter[] = [
  {
    n: 9,
    title: "Schakelingen",
    paragraphs: [
      { n: 1, title: "Weerstanden" },
      { n: 2, title: "LDR en NTC" },
      { n: 3, title: "Schakelen met een relais" },
      { n: 4, title: "Elektronische schakelingen" },
    ],
  },
  {
    n: 10,
    title: "Krachten",
    paragraphs: [
      { n: 1, title: "Soorten krachten" },
      { n: 2, title: "Krachten in constructies" },
      { n: 3, title: "Krachten samenstellen" },
      { n: 4, title: "Krachten ontbinden" },
    ],
  },
  {
    n: 11,
    title: "Energie",
    paragraphs: [
      { n: 1, title: "Fossiele brandstoffen" },
      { n: 2, title: "Zonne-energie" },
      { n: 3, title: "Windenergie" },
      { n: 4, title: "Waterkracht" },
      { n: 5, title: "Energie besparen" },
    ],
  },
  {
    n: 12,
    title: "Elektriciteit",
    paragraphs: [
      { n: 1, title: "Stroom en spanning" },
      { n: 2, title: "Spanning transformeren" },
      { n: 3, title: "Serie- en parallelschakeling" },
      { n: 4, title: "Elektriciteit en veiligheid" },
    ],
  },
  {
    n: 13,
    title: "Geluid",
    paragraphs: [
      { n: 1, title: "Geluidsbronnen" },
      { n: 2, title: "Toonhoogte" },
      { n: 3, title: "Geluidssterkte" },
      { n: 4, title: "Geluidshinder" },
    ],
  },
  {
    n: 14,
    title: "Werktuigen",
    paragraphs: [
      { n: 1, title: "Werken met hefbomen" },
      { n: 2, title: "Hefbomen en zwaartekracht" },
      { n: 3, title: "Katrollen en takels" },
      { n: 4, title: "Druk" },
    ],
  },
  {
    n: 15,
    title: "Bewegingen",
    paragraphs: [
      { n: 1, title: "Bewegingen onderzoeken" },
      { n: 2, title: "Snelheid en versnelling" },
      { n: 3, title: "Eenparig versneld" },
      { n: 4, title: "Eenparig vertraagd" },
    ],
  },
  {
    n: 16,
    title: "Kracht en beweging",
    paragraphs: [
      { n: 1, title: "Voortstuwen en tegenwerken" },
      { n: 2, title: "Optrekken en afremmen" },
      { n: 3, title: "Veiligheid in het verkeer" },
      { n: 4, title: "Kracht en arbeid" },
    ],
  },
];

const SERIES: Record<NovaSeries, { boek: string; jaar: Leerjaar; chapters: NovaChapter[] }> = {
  kgt12: { boek: "Nova NaSk 1|2 VMBO-KGT", jaar: "2", chapters: KGT12 },
  gt3: { boek: "Nova Nask 1, 3 VMBO-GT", jaar: "3", chapters: GT3 },
  gt4: { boek: "Nova Nask 1, 4 VMBO-GT", jaar: "4", chapters: GT4 },
};

/** Lokale oefenvragen (dichtheid/snelheid/kracht/elektra) → Nova-hoofdstuk. */
export const BANK_ALIAS: Record<string, string[]> = {
  "kgt12-2": ["dichtheid"],
  "kgt12-4": ["elektra"],
  "kgt12-5": ["snelheid"],
  "gt3-1": ["elektra"],
  "gt3-3": ["kracht"],
  "gt3-7": ["dichtheid"],
  "gt4-10": ["kracht"],
  "gt4-12": ["elektra"],
  "gt4-15": ["snelheid"],
};

export const PARA_ALIAS: Record<string, string[]> = {
  "kgt12-2-3": ["dichtheid-massa-volume"],
  "kgt12-2-4": ["dichtheid-berekenen", "dichtheid-vergelijken"],
  "gt3-7-4": ["dichtheid-berekenen", "dichtheid-vergelijken", "dichtheid-massa-volume"],
  "kgt12-5-2": ["snelheid-gemiddeld"],
  "kgt12-5-1": ["snelheid-afstand"],
  "kgt12-5-3": ["snelheid-eenheden"],
  "gt4-15-2": ["snelheid-gemiddeld", "snelheid-eenheden"],
  "kgt12-4-1": ["elektra-kring"],
  "gt3-1-1": ["elektra-kring"],
  "gt4-12-1": ["elektra-kring"],
  "gt3-3-1": ["kracht-soorten"],
  "gt4-10-1": ["kracht-soorten", "kracht-zwaarte"],
};

/** Tijdelijk: alle klassen/jaren → Nova 3GT deel A (test met één PDF). */
export function seriesForKlas(_klas: string, _leerjaar = ""): NovaSeries {
  return "gt3";
}

export function boekVoor(_klas: string, _leerjaar = ""): string {
  return "Nova Nask 1, 3 VMBO-GT deel A · H1–H4";
}

export function hoofdstukHeeftBoek(id: string | undefined): boolean {
  return Boolean(id && /^gt3-[1-4]$/.test(id));
}

function toHoofdstuk(series: NovaSeries, jaar: Leerjaar, ch: NovaChapter): PackedHoofdstuk {
  const id = `${series}-${ch.n}`;
  return {
    id,
    titel: `${ch.n}. ${ch.title}`,
    jaren: [jaar],
    niveaus: NIVEAUS,
    paragrafen: ch.paragraphs.map((p) => ({
      id: `${id}-${p.n}`,
      titel: `${p.n}. ${p.title}`,
    })),
    bank: Boolean(BANK_ALIAS[id]),
    boek: series === "gt3" && ch.n <= 4,
  };
}

/** Tijdelijk: alleen geladen hoofdstukken (3GT H1–H4). */
export function novaHoofdstukken(): PackedHoofdstuk[] {
  const s = SERIES.gt3;
  return s.chapters.filter((ch) => ch.n <= 4).map((ch) => toHoofdstuk("gt3", s.jaar, ch));
}

export function novaHoofdstukkenVoor(_klas: string, _leerjaar = ""): PackedHoofdstuk[] {
  return novaHoofdstukken();
}
