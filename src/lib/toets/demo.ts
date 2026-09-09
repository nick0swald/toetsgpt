import { nlGetal } from "./format";
import { CURRICULUM, eersteHoofdstukId, hoofdstukById, vakOf } from "./stof";
import { BANK_ALIAS, PARA_ALIAS } from "./nova";
import { leesBank } from "./lees";
import { assembleMc, balanceMcLetters, mulberry32, pick, shuffled, type Rng } from "./shuffle";
import type {
  InvulQuestion,
  OpenQuestion,
  Question,
  StofTag,
  Toets,
  ToetsBron,
} from "./types";

const NAMEN = [
  "Lina",
  "Amir",
  "Tess",
  "Joost",
  "Noor",
  "Sem",
  "Daan",
  "Esmee",
  "Kai",
  "Fenna",
  "Milan",
  "Yara",
] as const;

const DENSITY_SETS = [
  { m: 180, v: 60, rho: 3 },
  { m: 240, v: 80, rho: 3 },
  { m: 150, v: 50, rho: 3 },
  { m: 400, v: 100, rho: 4 },
  { m: 200, v: 50, rho: 4 },
  { m: 270, v: 90, rho: 3 },
] as const;

const SPEED_MS = [
  { s: 8, t: 2, v: 4 },
  { s: 12, t: 3, v: 4 },
  { s: 15, t: 5, v: 3 },
  { s: 9, t: 3, v: 3 },
  { s: 20, t: 4, v: 5 },
  { s: 6, t: 2, v: 3 },
] as const;

const SPEED_KMH = [
  { km: 4.5, min: 15, v: 18 },
  { km: 6, min: 20, v: 18 },
  { km: 3, min: 10, v: 18 },
  { km: 9, min: 30, v: 18 },
  { km: 12, min: 40, v: 18 },
  { km: 5, min: 15, v: 20 },
] as const;

function tag(hoofdstukId: string, paragraafId: string, label: string): StofTag {
  return { hoofdstukId, paragraafId, label };
}

function openQ(
  qid: string,
  situation: string,
  prompt: string,
  points: number,
  modelAnswer: string,
  why: string,
  accept: OpenQuestion["accept"],
  stof: StofTag,
): OpenQuestion {
  return {
    id: qid,
    type: "open",
    situation,
    prompt,
    points,
    modelAnswer,
    why,
    accept,
    stof,
  };
}

function invulQ(
  qid: string,
  situation: string,
  prompt: string,
  modelAnswer: string,
  why: string,
  accept: InvulQuestion["accept"],
  stof: StofTag,
): InvulQuestion {
  return {
    id: qid,
    type: "invul",
    situation,
    prompt,
    points: 1,
    modelAnswer,
    why,
    accept,
    stof,
  };
}

function bank(rng: Rng): Question[] {
  const naam1 = pick(rng, NAMEN);
  const naam2 = pick(
    rng,
    NAMEN.filter((n) => n !== naam1),
  );
  const dens = pick(rng, DENSITY_SETS);
  const dens2 = pick(
    rng,
    DENSITY_SETS.filter((d) => d !== dens),
  );
  const spd = pick(rng, SPEED_MS);
  const spd2 = pick(
    rng,
    SPEED_MS.filter((s) => s !== spd),
  );
  const bike = pick(rng, SPEED_KMH);
  const sameVolumeHeavy = pick(rng, ["zand", "water", "grind"] as const);
  const sameVolumeLight = pick(rng, ["piepschuim", "lucht", "houtwol"] as const);
  const dummySlot = "A" as const;

  const dVerg = tag("dichtheid", "dichtheid-vergelijken", "Dichtheid · vergelijken");
  const dBer = tag("dichtheid", "dichtheid-berekenen", "Dichtheid · berekenen");
  const dMv = tag("dichtheid", "dichtheid-massa-volume", "Dichtheid · massa en volume");
  const sGem = tag("snelheid", "snelheid-gemiddeld", "Snelheid · gemiddelde snelheid");
  const sEen = tag("snelheid", "snelheid-eenheden", "Snelheid · m/s en km/h");
  const sAfst = tag("snelheid", "snelheid-afstand", "Snelheid · afstand en tijd");
  const kSoort = tag("kracht", "kracht-soorten", "Kracht · soorten");
  const kZwaar = tag("kracht", "kracht-zwaarte", "Kracht · zwaartekracht");
  const eKring = tag("elektra", "elektra-kring", "Elektriciteit · stroomkring");
  const eGel = tag("elektra", "elektra-geleider", "Elektriciteit · geleider");

  const q1 = assembleMc(
    {
      id: "d1",
      situation: `Op de werkbank staan twee kisten met hetzelfde volume. In de ene kist zit ${sameVolumeHeavy}. In de andere kist zit ${sameVolumeLight}.`,
      prompt: "Welke kist heeft de grootste massa?",
      why: "Bij gelijk volume heeft de stof met de grootste dichtheid de grootste massa.",
      stof: dVerg,
      correct: `De kist met ${sameVolumeHeavy}, want die stof heeft een grotere dichtheid.`,
      distractors: [
        `De kist met ${sameVolumeLight}, want die stof neemt meer ruimte in.`,
        "Ze zijn even zwaar, want het volume is gelijk.",
        `De kist met ${sameVolumeLight}, want lichte stoffen wegen meer per kist.`,
      ],
    },
    dummySlot,
  );

  const q2 = openQ(
    "d2",
    `${naam1} weegt een steen. De massa is ${dens.m} g. Met een maatcilinder blijkt het volume ${dens.v} cm³.`,
    "Bereken de dichtheid van de steen in g/cm³. Schrijf alleen het getal en de eenheid.",
    2,
    `${nlGetal(dens.rho)} g/cm³`,
    `Dichtheid = massa / volume = ${dens.m} / ${dens.v} = ${nlGetal(dens.rho)} g/cm³.`,
    { numbers: [dens.rho], tolerance: 0.08 },
    dBer,
  );

  const q3 = assembleMc(
    {
      id: "v1",
      situation: `Een bal rolt in een rechte lijn over de gymvloer. De bal legt ${nlGetal(spd.s, 1)} m af in ${nlGetal(spd.t, 1)} s.`,
      prompt: "Wat is de gemiddelde snelheid van de bal?",
      why: `Gemiddelde snelheid = afstand / tijd = ${nlGetal(spd.s, 1)} / ${nlGetal(spd.t, 1)} = ${nlGetal(spd.v, 1)} m/s.`,
      stof: sGem,
      correct: `${nlGetal(spd.v, 1)} m/s`,
      distractors: [
        `${nlGetal(spd.s * spd.t)} m/s`,
        `${nlGetal(spd.s + spd.t)} m/s`,
        `${nlGetal(spd.t / spd.s, 2)} m/s`,
      ],
    },
    dummySlot,
  );

  const q4 = openQ(
    "v2",
    `${naam2} fietst ${nlGetal(bike.km, 1)} km naar school. Dat duurt ${bike.min} minuten.`,
    "Bereken de gemiddelde snelheid in km/h.",
    2,
    `${nlGetal(bike.v)} km/h`,
    `${nlGetal(bike.km, 1)} km in ${bike.min} min = ${nlGetal(bike.min / 60, 2)} uur. Snelheid = ${nlGetal(bike.km, 1)} / ${nlGetal(bike.min / 60, 2)} = ${nlGetal(bike.v)} km/h.`,
    { numbers: [bike.v], tolerance: 0.2 },
    sGem,
  );

  const q5 = assembleMc(
    {
      id: "d3",
      situation: `In een tabel staat de dichtheid van een metaal: ${nlGetal(dens2.rho, 1)} g/cm³.`,
      prompt: "Wat betekent deze waarde?",
      why: `Dichtheid is massa per volume. ${nlGetal(dens2.rho, 1)} g/cm³ betekent ${nlGetal(dens2.rho, 1)} gram per kubieke centimeter.`,
      stof: dMv,
      correct: `1 cm³ van dit metaal heeft een massa van ${nlGetal(dens2.rho, 1)} g.`,
      distractors: [
        `Het metaal weegt ${nlGetal(dens2.rho, 1)} g, ongeacht het volume.`,
        `Het volume is altijd ${nlGetal(dens2.rho, 1)} cm³.`,
        `De massa is ${nlGetal(dens2.rho, 1)} keer zo groot als bij water, altijd.`,
      ],
    },
    dummySlot,
  );

  const time = spd2.s / spd2.v;
  const q6 = assembleMc(
    {
      id: "v3",
      situation: `Een kist wordt over de vloer geschoven met een constante snelheid van ${nlGetal(spd2.v, 1)} m/s. De kist legt ${nlGetal(spd2.s, 1)} m af.`,
      prompt: "Hoe lang duurt dat?",
      why: `Tijd = afstand / snelheid = ${nlGetal(spd2.s, 1)} / ${nlGetal(spd2.v, 1)} = ${nlGetal(time, 1)} s.`,
      stof: sAfst,
      correct: `${nlGetal(time, 1)} s`,
      distractors: [
        `${nlGetal(spd2.s * spd2.v)} s`,
        `${nlGetal(spd2.s + spd2.v)} s`,
        `${nlGetal(spd2.v / spd2.s, 2)} s`,
      ],
    },
    dummySlot,
  );

  const q7 = assembleMc(
    {
      id: "d4",
      situation: "Twee stenen hebben dezelfde massa. Steen P heeft een klein volume. Steen Q heeft een groot volume.",
      prompt: "Welke steen heeft de grootste dichtheid?",
      why: "Dichtheid = massa / volume. Bij gelijke massa is de dichtheid groter als het volume kleiner is.",
      stof: dVerg,
      correct: "Steen P, want dezelfde massa in een kleiner volume.",
      distractors: [
        "Steen Q, want een groter volume betekent meer stof.",
        "Ze zijn gelijk, want de massa is gelijk.",
        "Dat kun je niet weten zonder de kleur van de steen.",
      ],
    },
    dummySlot,
  );

  const q8 = openQ(
    "d5",
    "Een houten kist en een ijzeren kist zijn even groot.",
    "Waarom heeft de ijzeren kist een grotere massa? Antwoord in één zin.",
    2,
    "IJzer heeft een grotere dichtheid, dus bij hetzelfde volume een grotere massa.",
    "Bij gelijk volume bepaalt de dichtheid de massa. IJzer is dichter dan hout.",
    { keywords: ["dichtheid", "volume", "massa"] },
    dVerg,
  );

  const kmhFromMs = spd.v * 3.6;
  const q9 = assembleMc(
    {
      id: "v4",
      situation: `Op een display staat de snelheid van een bal: ${nlGetal(spd.v, 1)} m/s.`,
      prompt: "Wat is dat in km/h?",
      why: `1 m/s = 3,6 km/h. Dus ${nlGetal(spd.v, 1)} × 3,6 = ${nlGetal(kmhFromMs, 1)} km/h.`,
      stof: sEen,
      correct: `${nlGetal(kmhFromMs, 1)} km/h`,
      distractors: [
        `${nlGetal(spd.v / 3.6, 2)} km/h`,
        `${nlGetal(spd.v * 36)} km/h`,
        `${nlGetal(spd.v)} km/h`,
      ],
    },
    dummySlot,
  );

  const massKg = dens.m / 1000;
  const volDm3 = dens.v / 1000;
  const q10 = openQ(
    "d6",
    `${naam1} heeft een kist met massa ${nlGetal(massKg, 2)} kg. Het volume is ${nlGetal(volDm3, 2)} dm³.`,
    "Bereken de dichtheid in kg/dm³.",
    2,
    `${nlGetal(dens.rho)} kg/dm³`,
    `Dichtheid = ${nlGetal(massKg, 2)} / ${nlGetal(volDm3, 2)} = ${nlGetal(dens.rho)} kg/dm³.`,
    { numbers: [dens.rho], tolerance: 0.08 },
    dBer,
  );

  const q11 = assembleMc(
    {
      id: "v5",
      situation: `${naam2} loopt een rechte gang van 24 m. De gemiddelde snelheid is 1,5 m/s.`,
      prompt: "Welke formule gebruik je voor de tijd?",
      why: "Uit v = s / t volgt t = s / v.",
      stof: sAfst,
      correct: "t = s / v",
      distractors: ["t = s × v", "t = v / s", "t = s + v"],
    },
    dummySlot,
  );

  const q12 = assembleMc(
    {
      id: "d7",
      situation: `Een maatcilinder bevat 40 cm³ water. ${naam1} laat een steen zakken. Het water komt tot 55 cm³. De steen heeft een massa van 45 g.`,
      prompt: "Wat is de dichtheid van de steen?",
      why: "Volume van de steen = 55 − 40 = 15 cm³. Dichtheid = 45 / 15 = 3 g/cm³.",
      stof: dBer,
      correct: "3 g/cm³",
      distractors: ["1,1 g/cm³", "45 g/cm³", "0,82 g/cm³"],
    },
    dummySlot,
  );

  const q13 = invulQ(
    "d8",
    "In NaSk gebruik je voor dichtheid de formule ρ = m / V.",
    "Dichtheid is massa gedeeld door ___.",
    "volume",
    "ρ = m / V. V is het volume.",
    { keywords: ["volume", "inhoud"] },
    dMv,
  );

  const q14 = invulQ(
    "v6",
    "Gemiddelde snelheid bereken je met afstand en tijd.",
    "v = s / ___.",
    "t",
    "v = s / t. t is de tijd.",
    { keywords: ["t", "tijd"] },
    sGem,
  );

  const q15 = invulQ(
    "v7",
    "Je rekent een snelheid om van m/s naar km/h.",
    "1 m/s is gelijk aan ___ km/h.",
    "3,6",
    "1 m/s = 3,6 km/h.",
    { numbers: [3.6], tolerance: 0.05, keywords: ["3,6", "3.6"] },
    sEen,
  );

  const q16 = invulQ(
    "d9",
    `${naam1} vergelijkt twee stenen met hetzelfde volume.`,
    "De steen met de grootste dichtheid heeft de grootste ___.",
    "massa",
    "Bij gelijk volume betekent grotere dichtheid grotere massa.",
    { keywords: ["massa", "gewicht"] },
    dVerg,
  );

  const q17 = assembleMc(
    {
      id: "k1",
      situation: "Een kist staat stil op de vloer van het lokaal.",
      prompt: "Welke kracht trekt de kist naar de aarde?",
      why: "Zwaartekracht trekt elk voorwerp naar de aarde.",
      stof: kZwaar,
      correct: "De zwaartekracht",
      distractors: ["De wrijvingskracht", "De veerkracht", "De spankracht"],
    },
    dummySlot,
  );

  const q18 = assembleMc(
    {
      id: "k2",
      situation: `${naam2} duwt een kist over de vloer. De kist gaat steeds langzamer.`,
      prompt: "Welke kracht werkt tegen de beweging in?",
      why: "Wrijving werkt tegen de bewegingsrichting in en maakt de kist trager.",
      stof: kSoort,
      correct: "Wrijvingskracht",
      distractors: ["Zwaartekracht", "Magnetische kracht", "Spankracht van een touw"],
    },
    dummySlot,
  );

  const q19 = invulQ(
    "k3",
    "Op aarde heeft elk voorwerp gewicht door de aarde.",
    "De kracht van de aarde op een voorwerp heet ___.",
    "zwaartekracht",
    "Die kracht heet zwaartekracht.",
    { keywords: ["zwaartekracht", "zwaarte"] },
    kZwaar,
  );

  const q20 = assembleMc(
    {
      id: "e1",
      situation: "Op de tafel liggen een lamp, een batterij en draden.",
      prompt: "Wanneer brandt de lamp?",
      why: "Een lamp brandt als de stroomkring gesloten is.",
      stof: eKring,
      correct: "Als de stroomkring gesloten is.",
      distractors: [
        "Als er alleen een batterij op tafel ligt.",
        "Als de lamp los naast de batterij ligt.",
        "Als een draad is onderbroken.",
      ],
    },
    dummySlot,
  );

  const q21 = assembleMc(
    {
      id: "e2",
      situation: `${naam1} heeft een stuk koperdraad en een stuk plastic.`,
      prompt: "Welk materiaal is een geleider?",
      why: "Koper geleidt stroom. Plastic is een isolator.",
      stof: eGel,
      correct: "Koper",
      distractors: ["Plastic", "Rubber", "Droog hout"],
    },
    dummySlot,
  );

  const q22 = invulQ(
    "e3",
    "In een stroomkring zit een schakelaar.",
    "Een materiaal dat geen stroom doorlaat heet een ___.",
    "isolator",
    "Een isolator laat geen stroom door, bijvoorbeeld plastic.",
    { keywords: ["isolator"] },
    eGel,
  );

  const q23 = openQ(
    "k4",
    "Een kist staat stil op de vloer. Niemand duwt.",
    "Noem twee krachten die op de kist werken. Schrijf ze onder elkaar of in één zin.",
    2,
    "Zwaartekracht en normaalkracht (de vloer duwt terug).",
    "Op een stilstaande kist werkt zwaartekracht naar beneden en de vloer duwt terug.",
    { keywords: ["zwaartekracht", "normaal", "vloer"] },
    kZwaar,
  );

  const q24 = invulQ(
    "k5",
    "Kracht heeft een eigen eenheid.",
    "De eenheid van kracht is de ___.",
    "newton",
    "Kracht druk je uit in newton (N).",
    { keywords: ["newton"] },
    kSoort,
  );

  const q25 = openQ(
    "e4",
    "In een kring zitten een batterij, een lamp en een schakelaar. De schakelaar staat open.",
    "Waarom brandt de lamp niet? Antwoord in één zin.",
    2,
    "De stroomkring is open, dus er loopt geen stroom.",
    "Bij een open schakelaar is de kring onderbroken.",
    { keywords: ["open", "kring", "stroom"] },
    eKring,
  );

  const q26 = assembleMc(
    {
      id: "e5",
      situation: "Op tafel liggen een batterij, twee draden en een lamp.",
      prompt: "Wat moet je doen om de lamp te laten branden?",
      why: "De lamp brandt alleen in een gesloten kring van batterij, draden en lamp.",
      stof: eKring,
      correct: "Alles aansluiten tot een gesloten kring.",
      distractors: [
        "Alleen de lamp tegen de batterij houden zonder draden.",
        "De lamp in water leggen.",
        "Eén draad weglaten zodat er lucht bij kan.",
      ],
    },
    dummySlot,
  );

  return [
    q1, q2, q3, q4, q5, q6, q7, q8, q9, q10, q11, q12, q13, q14, q15, q16, q17, q18, q19, q20, q21,
    q22, q23, q24, q25, q26,
    ...leesBank(rng),
  ];
}

function treftLastig(q: Question, lastig: string): boolean {
  if (!lastig.trim()) return false;
  const t = lastig.toLowerCase();
  const hay = `${q.stof?.label ?? ""} ${q.prompt} ${q.situation}`.toLowerCase();
  return t.split(/[,;/]+|\s+/).filter((w) => w.length > 2).some((w) => hay.includes(w));
}

function rankLaag(list: Question[], lastig: string, rng: Rng): Question[] {
  const mixed = shuffled(list, rng);
  if (!lastig.trim()) return mixed;
  return mixed.sort((a, b) => Number(treftLastig(b, lastig)) - Number(treftLastig(a, lastig)));
}

function neemMix(source: Question[], count: number, rng: Rng): Question[] {
  if (count <= 0 || source.length === 0) return [];
  const leesQs = shuffled(source.filter((q) => q.skill === "lees"), rng);
  const stofBron = source.filter((q) => q.skill !== "lees");
  const leesCount = Math.min(leesQs.length, Math.max(1, Math.round(count * 0.25)));
  const restCount = Math.max(0, count - leesCount);
  const mcQs = shuffled(stofBron.filter((q) => q.type === "mc"), rng);
  const openQs = shuffled(stofBron.filter((q) => q.type === "open"), rng);
  const invulQs = shuffled(stofBron.filter((q) => q.type === "invul"), rng);
  const invulCount = Math.min(invulQs.length, Math.round(restCount * 0.25));
  const openCount = Math.min(openQs.length, Math.round(restCount * 0.25));
  const mcCount = Math.min(mcQs.length, Math.max(0, restCount - openCount - invulCount));
  const picked: Question[] = [
    ...leesQs.slice(0, leesCount),
    ...mcQs.slice(0, mcCount),
    ...openQs.slice(0, openCount),
    ...invulQs.slice(0, invulCount),
  ];
  for (const q of shuffled(source, rng)) {
    if (picked.length >= count) break;
    if (!picked.includes(q)) picked.push(q);
  }
  return picked.slice(0, count);
}

export function bouwOefentoets(opts: {
  count?: number;
  soort?: ToetsBron["soort"];
  tijd?: ToetsBron["tijd"];
  seed?: number;
  kind?: ToetsBron["kind"];
  topic?: string;
  hoofdstukId?: string;
  paragraafIds?: string[];
  lastig?: string;
  leerjaar?: string;
  niveau?: string;
  vakId?: string;
}): Toets {
  const count = opts.count ?? 8;
  const soort = opts.vakId === "lees" ? "lees" : (opts.soort ?? "auto");
  const seed = opts.seed ?? Date.now() % 1_000_000;
  const rng = mulberry32(seed);
  const alias = opts.hoofdstukId ? (BANK_ALIAS[opts.hoofdstukId] ?? []) : [];
  const stofIds = new Set<string>([opts.hoofdstukId ?? "", ...alias].filter(Boolean));
  const all = bank(rng).filter((q) => {
    const bio = q.stof?.hoofdstukId.startsWith("bio-");
    if ((opts.vakId ?? "nask") === "lees") return q.skill === "lees";
    if ((opts.vakId ?? "nask") === "biologie") return Boolean(bio);
    return !bio;
  });
  const paras = opts.paragraafIds?.filter(Boolean) ?? [];
  const paraIds = new Set(paras.flatMap((p) => [p, ...(PARA_ALIAS[p] ?? [])]));
  const lastig = opts.lastig ?? "";

  let voorkeur = all;
  if (opts.hoofdstukId) {
    const tagged = all.filter((q) => q.stof && stofIds.has(q.stof.hoofdstukId));
    if (tagged.length) voorkeur = tagged;
  }
  if (paraIds.size) {
    const tagged = voorkeur.filter((q) => q.stof && paraIds.has(q.stof.paragraafId));
    if (tagged.length) voorkeur = tagged;
  }
  if (soort === "mc") voorkeur = voorkeur.filter((q) => q.type === "mc" && q.skill !== "lees");
  if (soort === "open") voorkeur = voorkeur.filter((q) => q.type === "open");
  if (soort === "invul") voorkeur = voorkeur.filter((q) => q.type === "invul");
  if (soort === "lees") voorkeur = voorkeur.filter((q) => q.skill === "lees");

  const rest = all.filter((q) => !voorkeur.includes(q));
  const zelfdeHoofdstuk = rest.filter(
    (q) => !opts.hoofdstukId || (q.stof && stofIds.has(q.stof.hoofdstukId)),
  );
  const overig = rest.filter((q) => !zelfdeHoofdstuk.includes(q));
  const lagen = [voorkeur, zelfdeHoofdstuk, overig].map((laag) => {
    let items = laag;
    if (soort === "mc") items = items.filter((q) => q.type === "mc" && q.skill !== "lees");
    if (soort === "open") items = items.filter((q) => q.type === "open");
    if (soort === "invul") items = items.filter((q) => q.type === "invul");
    if (soort === "lees") items = items.filter((q) => q.skill === "lees");
    return rankLaag(items, lastig, rng);
  });

  const picked: Question[] = [];
  for (const laag of lagen) {
    if (picked.length >= count) break;
    const beschikbaar = laag.filter((q) => !picked.includes(q));
    const nodig = count - picked.length;
    if (soort === "auto" || soort === "mix") {
      picked.push(...neemMix(beschikbaar, nodig, rng));
    } else if (soort === "lees") {
      picked.push(...shuffled(beschikbaar.filter((q) => q.skill === "lees"), rng).slice(0, nodig));
    } else {
      picked.push(...beschikbaar.slice(0, nodig));
    }
  }

  const questions = balanceMcLetters(
    shuffled(picked, rng)
      .slice(0, count)
      .map((q, i) => ({ ...q, id: `q${i + 1}` })),
    rng,
  );

  const vak = vakOf(opts.vakId);
  const h = hoofdstukById(opts.hoofdstukId ?? "", opts.vakId);
  const titel =
    vak.id === "lees"
      ? "Oefening lezen"
      : h
        ? `Oefentoets ${h.titel.toLowerCase()}`
        : `Oefentoets ${vak.titel}`;

  return {
    title: opts.kind === "extra" ? `Extra oefening · ${h?.titel.toLowerCase() ?? vak.titel}` : titel,
    subject: vak.titel,
    questions,
    bron: {
      kind: opts.kind ?? "zelf",
      topic: opts.topic ?? titel,
      count,
      soort,
      tijd: opts.tijd ?? "kort",
      hoofdstukId: opts.hoofdstukId,
      paragraafIds: paras.length ? paras : undefined,
      lastig: lastig || undefined,
      leerjaar: opts.leerjaar,
      niveau: opts.niveau,
      vakId: opts.vakId ?? "nask",
    },
  };
}

export function bouwDemoToets(opts: Parameters<typeof bouwOefentoets>[0]): Toets {
  const id = opts.hoofdstukId ?? eersteHoofdstukId(opts.leerjaar, opts.niveau);
  return bouwOefentoets({
    ...opts,
    hoofdstukId: id,
    kind: opts.kind ?? "demo",
    topic: opts.topic ?? hoofdstukById(id)?.titel ?? CURRICULUM.titel,
  });
}

export const VOORBEELD_DOC_TOETS = `NaSk — oefentoets snelheid en dichtheid
Klas: 3.5G

1. Een kist schuift over de vloer. In 5,0 s legt de kist 10,0 m af.

Bereken de gemiddelde snelheid in m/s.

2. Tess fietst 6,0 km. Ze doet daar 20 minuten over.

Wat is haar gemiddelde snelheid?
A 0,30 km/h
B 12 km/h
C 18 km/h
D 120 km/h

3. Op de werkbank staan twee even grote kisten. Kist A is gevuld met zand. Kist B is gevuld met piepschuim.

Welke kist heeft de grootste massa?
A Kist A
B Kist B
C Ze zijn even zwaar
D Dat hangt af van de kleur van de kist

4. Sem weegt een steen. De massa is 240 g. Het volume is 80 cm³.

Bereken de dichtheid in g/cm³.

5. Een bal rolt 12 m in 3,0 s.

Wat is de gemiddelde snelheid?
A 4,0 m/s
B 9,0 m/s
C 15 m/s
D 36 m/s

6. Twee stenen hebben dezelfde massa. Steen P is klein. Steen Q is groot.

Welke steen heeft de grootste dichtheid?
A Steen P
B Steen Q
C Gelijk
D Alleen te zeggen met een thermometer

SLEUTEL
1 2,0
2 C
3 A
4 3
5 A
6 A
`;

export function looksLikeDensityOrSpeed(text: string): boolean {
  const t = text.toLowerCase();
  if (!t.trim()) return true;
  return /dichtheid|snelheid|massa|volume|m\/s|km\/h|g\/cm|steen|kist|bal|fietst|kracht|stroom|geleider/.test(
    t,
  );
}

