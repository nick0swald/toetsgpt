/**
 * Examenstof-kaart NaSk I VMBO GT — onderwerpen uit de officiële CE-syllabus.
 * Alleen topics/keywords; geen letterlijke examenvragen.
 */

export type ExamenTopic = {
  id: string;
  label: string;
  keywords: string[];
};

export type ExamenOnderdeel = {
  id: string;
  code: string;
  titel: string;
  ce: boolean;
  topics: ExamenTopic[];
  /** Optionele koppeling naar Nova/oefenbank-thema's. */
  bankAliases?: string[];
};

export const EXAMENSTOF_META = {
  bron: "Syllabus natuur- en scheikunde I vmbo 2025/2026 (CvTE/examenblad)",
  note: "Topics only — geen letterlijke examenvragen",
  vak: "nask",
  leerweg: "GT",
} as const;

export const EXAMEN_ONDERDELEN: ExamenOnderdeel[] = [
  {
    id: "ce-k3",
    code: "K/3",
    titel: "Leervaardigheden",
    ce: true,
    bankAliases: [],
    topics: [
      {
        id: "k3-grootheden",
        label: "Grootheden en eenheden",
        keywords: ["grootheid", "eenheid", "si", "omrekenen", "prefix", "voorvoegsel"],
      },
      {
        id: "k3-formules",
        label: "Formules en berekeningen",
        keywords: ["formule", "bereken", "invullen", "herleiden"],
      },
      {
        id: "k3-grafiek",
        label: "Tabellen en grafieken",
        keywords: ["grafiek", "tabel", "diagram", "aflezen", "assen"],
      },
      {
        id: "k3-onderzoek",
        label: "Onderzoek en ontwerp",
        keywords: ["onderzoek", "meting", "conclusie", "ontwerp", "veilig"],
      },
      {
        id: "k3-bronnen",
        label: "Bronnen en vaktekst lezen",
        keywords: ["bron", "vaktekst", "lees", "tekst", "verwijzing", "hoofdzaak", "leesvaardigheid"],
      },
    ],
  },
  {
    id: "ce-k4",
    code: "K/4",
    titel: "Stoffen en materialen",
    ce: true,
    bankAliases: ["stoffen", "dichtheid"],
    topics: [
      {
        id: "k4-materialen",
        label: "Materialen en eigenschappen",
        keywords: ["hout", "metaal", "kunststof", "geleiding", "corrosie", "materiaal"],
      },
      {
        id: "k4-dichtheid",
        label: "Dichtheid · drijven/zinken",
        keywords: ["dichtheid", "massa", "volume", "drijven", "zinken", "zweven", "rho"],
      },
      {
        id: "k4-stoffeigenschappen",
        label: "Stofeigenschappen",
        keywords: ["smeltpunt", "kookpunt", "fase", "oplosbaarheid", "stof"],
      },
      {
        id: "k4-veiligheid",
        label: "Veiligheid en pictogrammen",
        keywords: ["pictogram", "giftig", "bijtend", "brandbaar", "veiligheidskaart"],
      },
      {
        id: "k4-milieu",
        label: "Milieu en afval",
        keywords: ["recycling", "afval", "milieu", "scheiden", "duurzaam"],
      },
    ],
  },
  {
    id: "ce-k5",
    code: "K/5",
    titel: "Elektrische energie",
    ce: true,
    bankAliases: ["elektra"],
    topics: [
      {
        id: "k5-kring",
        label: "Stroomkring serie/parallel",
        keywords: ["stroomkring", "serie", "parallel", "schakeling", "gesloten"],
      },
      {
        id: "k5-componenten",
        label: "Componenten en symbolen",
        keywords: ["weerstand", "lamp", "schakelaar", "led", "schema", "symbool"],
      },
      {
        id: "k5-ohms",
        label: "Spanning, stroom, weerstand",
        keywords: ["spanning", "stroom", "ohm", "volt", "ampere", "u/i", "r=u/i"],
      },
      {
        id: "k5-vermogen",
        label: "Vermogen en energie",
        keywords: ["vermogen", "watt", "kwh", "energie", "p=u*i", "batterij"],
      },
      {
        id: "k5-beveiliging",
        label: "Beveiliging huisinstallatie",
        keywords: ["zekering", "aardlek", "randaarde", "isolatie", "veilig"],
      },
    ],
  },
  {
    id: "ce-k6",
    code: "K/6",
    titel: "Verbranden en verwarmen",
    ce: true,
    bankAliases: ["warmte"],
    topics: [
      {
        id: "k6-transport",
        label: "Warmtetransport",
        keywords: ["geleiding", "stroming", "straling", "warmte", "isolatie"],
      },
      {
        id: "k6-temperatuur",
        label: "Temperatuur en schalen",
        keywords: ["temperatuur", "celsius", "kelvin", "thermometer"],
      },
      {
        id: "k6-isolatie",
        label: "Isolatie in huis",
        keywords: ["spouw", "dubbel glas", "isoleerkan", "radiatorfolie", "isolatie"],
      },
      {
        id: "k6-energie",
        label: "Energieomzetting en rendement",
        keywords: ["rendement", "energievorm", "verbranding", "chemische energie"],
      },
    ],
  },
  {
    id: "ce-k8",
    code: "K/8",
    titel: "Geluid",
    ce: true,
    bankAliases: ["geluid"],
    topics: [
      {
        id: "k8-toon",
        label: "Toonhoogte en frequentie",
        keywords: ["frequentie", "toonhoogte", "hertz", "trilling"],
      },
      {
        id: "k8-sterkte",
        label: "Geluidssterkte",
        keywords: ["geluidssterkte", "decibel", "db", "luid"],
      },
      {
        id: "k8-snelheid",
        label: "Voortplantingssnelheid",
        keywords: ["geluidssnelheid", "echo", "medium", "lucht", "water"],
      },
      {
        id: "k8-gehoor",
        label: "Gehoor en bescherming",
        keywords: ["gehoor", "oorbescherming", "lawaai", "schade"],
      },
    ],
  },
  {
    id: "ce-k9",
    code: "K/9",
    titel: "Kracht en veiligheid",
    ce: true,
    bankAliases: ["kracht", "snelheid"],
    topics: [
      {
        id: "k9-soorten",
        label: "Soorten krachten",
        keywords: ["zwaartekracht", "wrijving", "veer", "spierkracht", "spankracht", "newton"],
      },
      {
        id: "k9-hefboom",
        label: "Hefboom en katrol",
        keywords: ["hefboom", "katrol", "moment", "evenwicht", "arm"],
      },
      {
        id: "k9-snelheid",
        label: "Gemiddelde snelheid",
        keywords: ["snelheid", "afstand", "tijd", "m/s", "km/h", "vgem"],
      },
      {
        id: "k9-diagram",
        label: "(s,t) en (v,t) diagrammen",
        keywords: ["s-t", "v-t", "diagram", "constante snelheid", "vertraging"],
      },
    ],
  },
  {
    id: "ce-v1",
    code: "V/1",
    titel: "Veiligheid verkeer",
    ce: true,
    bankAliases: ["snelheid", "kracht"],
    topics: [
      {
        id: "v1-botsing",
        label: "Botsing en remweg",
        keywords: ["remweg", "reactieafstand", "stopafstand", "botsing", "vertraging"],
      },
      {
        id: "v1-veiligheid",
        label: "Veiligheidsvoorzieningen",
        keywords: ["gordel", "airbag", "helm", "kreukelzone", "kooiconstructie"],
      },
      {
        id: "v1-energie",
        label: "Bewegingsenergie verkeer",
        keywords: ["bewegingsenergie", "kinetisch", "arbeid", "vermogen"],
      },
    ],
  },
  {
    id: "ce-v2",
    code: "V/2",
    titel: "Constructies",
    ce: true,
    bankAliases: ["kracht"],
    topics: [
      {
        id: "v2-krachten",
        label: "Krachten in constructies",
        keywords: ["trek", "druk", "spankracht", "nettokracht", "vector"],
      },
      {
        id: "v2-moment",
        label: "Moment en evenwicht",
        keywords: ["moment", "evenwicht", "zwaartepunt", "massamiddelpunt"],
      },
      {
        id: "v2-context",
        label: "Bruggen en ophanging",
        keywords: ["brug", "ophanging", "balk", "constructie", "woningbouw"],
      },
    ],
  },
  {
    id: "ce-v4",
    code: "V/4",
    titel: "Vaardigheden in samenhang",
    ce: true,
    bankAliases: [],
    topics: [
      {
        id: "v4-samenhang",
        label: "Stof combineren",
        keywords: ["samenhang", "combinatie", "meerdere onderdelen", "context"],
      },
    ],
  },
  // SE-only (niet op CE GT)
  {
    id: "se-k7",
    code: "K/7",
    titel: "Licht en beeld",
    ce: false,
    bankAliases: [],
    topics: [
      {
        id: "k7-licht",
        label: "Licht en spiegels",
        keywords: ["licht", "spiegel", "lens", "beeld", "reflectie"],
      },
    ],
  },
  {
    id: "se-k10",
    code: "K/10",
    titel: "Bouw van de materie",
    ce: false,
    bankAliases: ["stoffen"],
    topics: [
      {
        id: "k10-bouw",
        label: "Atomen en moleculen",
        keywords: ["atoom", "molecuul", "deeltjes", "materie"],
      },
    ],
  },
  {
    id: "se-k11",
    code: "K/11",
    titel: "Straling",
    ce: false,
    bankAliases: [],
    topics: [
      {
        id: "k11-straling",
        label: "Straling en bescherming",
        keywords: ["straling", "radioactief", "rontgen", "bescherming"],
      },
    ],
  },
  {
    id: "se-k12",
    code: "K/12",
    titel: "Het weer",
    ce: false,
    bankAliases: [],
    topics: [
      {
        id: "k12-weer",
        label: "Weer en klimaat",
        keywords: ["weer", "luchtvochtigheid", "druk", "neerslag", "wind"],
      },
    ],
  },
  {
    id: "se-k1",
    code: "K/1",
    titel: "Oriëntatie op leren en werken",
    ce: false,
    topics: [
      {
        id: "k1-orientatie",
        label: "Oriëntatie",
        keywords: ["beroep", "orientatie", "werken"],
      },
    ],
  },
  {
    id: "se-k2",
    code: "K/2",
    titel: "Basisvaardigheden",
    ce: false,
    topics: [
      {
        id: "k2-basis",
        label: "Basisvaardigheden",
        keywords: ["basisvaardigheden", "algemeen"],
      },
    ],
  },
  {
    id: "se-v3",
    code: "V/3",
    titel: "Informatie verwerven",
    ce: false,
    topics: [
      {
        id: "v3-info",
        label: "Informatie verwerken",
        keywords: ["informatie", "bron", "verwerken"],
      },
    ],
  },
];

export function ceOnderdelen(): ExamenOnderdeel[] {
  return EXAMEN_ONDERDELEN.filter((o) => o.ce);
}

export function ceOnderdeelById(id: string): ExamenOnderdeel | undefined {
  return EXAMEN_ONDERDELEN.find((o) => o.id === id);
}

export function onderdeelLabel(idOrCode: string): string {
  const o =
    ceOnderdeelById(idOrCode) ||
    EXAMEN_ONDERDELEN.find(
      (x) => x.code === idOrCode || x.code.replace("/", "") === idOrCode.replace("/", ""),
    );
  if (!o) return idOrCode;
  return `${o.code} ${o.titel}`;
}

type MatchInput =
  | string
  | { hoofdstukId?: string; paragraafId?: string; label?: string }
  | null
  | undefined;

/** Match tekst of stof-tag op CE/SE-onderdeel via id, code of keywords. */
export function matchOnderdeel(input: MatchInput): ExamenOnderdeel | undefined {
  if (!input) return undefined;
  if (typeof input === "object") {
    const byId =
      (input.hoofdstukId && ceOnderdeelById(input.hoofdstukId)) ||
      (input.hoofdstukId && EXAMEN_ONDERDELEN.find((o) => o.id === input.hoofdstukId)) ||
      (input.paragraafId &&
        EXAMEN_ONDERDELEN.find((o) => o.topics.some((t) => t.id === input.paragraafId)));
    if (byId) return byId;
    const blob = [input.hoofdstukId, input.paragraafId, input.label].filter(Boolean).join(" ");
    return matchOnderdeel(blob);
  }

  const raw = input.trim().toLowerCase();
  if (!raw) return undefined;

  const direct = EXAMEN_ONDERDELEN.find(
    (o) =>
      o.id === raw ||
      o.id.toLowerCase() === raw ||
      o.code.toLowerCase() === raw ||
      `nask1/${o.code.toLowerCase()}` === raw ||
      o.titel.toLowerCase() === raw,
  );
  if (direct) return direct;

  let best: { o: ExamenOnderdeel; score: number } | null = null;
  for (const o of EXAMEN_ONDERDELEN) {
    let score = 0;
    for (const t of o.topics) {
      for (const kw of t.keywords) {
        if (raw.includes(kw.toLowerCase())) score += 1;
      }
      if (raw.includes(t.label.toLowerCase())) score += 2;
    }
    for (const alias of o.bankAliases ?? []) {
      if (raw.includes(alias.toLowerCase())) score += 2;
    }
    if (score > 0 && (!best || score > best.score)) best = { o, score };
  }
  return best?.o;
}

export function topicById(topicId: string): { onderdeel: ExamenOnderdeel; topic: ExamenTopic } | undefined {
  for (const o of EXAMEN_ONDERDELEN) {
    const t = o.topics.find((x) => x.id === topicId);
    if (t) return { onderdeel: o, topic: t };
  }
  return undefined;
}
