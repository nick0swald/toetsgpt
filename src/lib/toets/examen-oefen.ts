import { nlGetal } from "./format";
import {
  ceOnderdeelById,
  ceOnderdelen,
  type ExamenOnderdeel,
} from "./examenstof";
import { assembleMc, balanceMcLetters, mulberry32, pick, shuffled, type Rng } from "./shuffle";
import type {
  Letter,
  OpenQuestion,
  Question,
  StofTag,
  Toets,
} from "./types";

const NAMEN = ["Lina", "Amir", "Tess", "Joost", "Noor", "Sem", "Daan", "Esmee"] as const;

function tag(onderdeel: ExamenOnderdeel, topicId: string, topicLabel: string): StofTag {
  return {
    hoofdstukId: onderdeel.id,
    paragraafId: topicId,
    label: `${onderdeel.code} · ${topicLabel}`,
  };
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
  figuurId?: string,
  figuurBijschrift?: string,
  skill?: "stof" | "lees",
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
    ...(skill ? { skill } : {}),
    ...(figuurId ? { figuurId, figuurBijschrift } : {}),
  };
}

function buildPool(rng: Rng): Question[] {
  const naam = pick(rng, NAMEN);
  const k3 = ceOnderdeelById("ce-k3")!;
  const k4 = ceOnderdeelById("ce-k4")!;
  const k5 = ceOnderdeelById("ce-k5")!;
  const k6 = ceOnderdeelById("ce-k6")!;
  const k8 = ceOnderdeelById("ce-k8")!;
  const k9 = ceOnderdeelById("ce-k9")!;
  const v1 = ceOnderdeelById("ce-v1")!;
  const v2 = ceOnderdeelById("ce-v2")!;

  const dens = pick(rng, [
    { m: 240, v: 80, rho: 3 },
    { m: 180, v: 60, rho: 3 },
    { m: 400, v: 100, rho: 4 },
    { m: 150, v: 50, rho: 3 },
  ] as const);
  const u = pick(rng, [6, 9, 12] as const);
  const i = pick(rng, [0.5, 1, 1.5, 2] as const);
  const r = Math.round((u / i) * 10) / 10;
  const s = pick(rng, [12, 15, 18, 20] as const);
  const t = pick(rng, [3, 4, 5, 6] as const);
  const v = Math.round((s / t) * 10) / 10;
  const f = pick(rng, [200, 250, 440, 500] as const);
  const db = pick(rng, [65, 75, 85, 95] as const);
  const vKm = pick(rng, [50, 60, 80] as const);
  const reactie = pick(rng, [1, 1.2, 1.5] as const);
  const rem = pick(rng, [12, 18, 24] as const);
  const reactieAfstand = Math.round(vKm / 3.6 * reactie * 10) / 10;
  const stop = Math.round((reactieAfstand + rem) * 10) / 10;
  const slot = "A" as Letter;

  const qSerie = {
    ...assembleMc(
      {
        id: "ex-serie",
        situation: `${naam} tekent een stroomkring: batterij, schakelaar en twee lampjes achter elkaar.`,
        prompt: "Hoe heten deze schakeling en wat geldt voor de stroom?",
        why: "Bij een serieschakeling is er één pad; de stroomsterkte is overal even groot.",
        stof: tag(k5, "k5-kring", "Stroomkring serie/parallel"),
        correct: "Serieschakeling; de stroom is overal even groot.",
        distractors: [
          "Parallelschakeling; de stroom splitst zich over de lampjes.",
          "Serieschakeling; de spanning is overal even groot.",
          "Parallelschakeling; als één lamp uitgaat, blijven de andere branden.",
        ],
      },
      slot,
    ),
    figuurId: "circuit-serie",
    figuurBijschrift: "Figuur 1 — serieschakeling met twee lampjes",
  };

  const qParallel = {
    ...assembleMc(
      {
        id: "ex-parallel",
        situation: "In een huis hangen twee lampen parallel op hetzelfde stopcontact.",
        prompt: "Wat gebeurt er als één lamp doorbrandt?",
        why: "In parallel heeft elke lamp een eigen pad; de andere blijft branden.",
        stof: tag(k5, "k5-kring", "Stroomkring serie/parallel"),
        correct: "De andere lamp blijft branden.",
        distractors: [
          "De andere lamp gaat ook uit.",
          "De spanning in huis valt weg.",
          "De stroom in de andere lamp wordt nul.",
        ],
      },
      slot,
    ),
    figuurId: "circuit-parallel",
    figuurBijschrift: "Figuur 2 — parallelschakeling",
  };

  const qOhm = openQ(
    "ex-ohm",
    `Over een weerstand staat ${u} V. De stroom is ${nlGetal(i, 1)} A.`,
    "Bereken de weerstand in ohm. Schrijf getal en eenheid.",
    2,
    `${nlGetal(r, 1)} Ω`,
    `R = U / I = ${u} / ${nlGetal(i, 1)} = ${nlGetal(r, 1)} Ω.`,
    { numbers: [r], tolerance: 0.15 },
    tag(k5, "k5-ohms", "Spanning, stroom, weerstand"),
  );

  const qDicht = openQ(
    "ex-dicht",
    `${naam} meet een blok: massa ${dens.m} g, volume ${dens.v} cm³.`,
    "Bereken de dichtheid in g/cm³.",
    2,
    `${nlGetal(dens.rho)} g/cm³`,
    `ρ = m / V = ${dens.m} / ${dens.v} = ${nlGetal(dens.rho)} g/cm³.`,
    { numbers: [dens.rho], tolerance: 0.08 },
    tag(k4, "k4-dichtheid", "Dichtheid · drijven/zinken"),
    "dichtheid-blokken",
    "Figuur 3 — blokken in water",
  );

  const qDrijf = {
    ...assembleMc(
      {
        id: "ex-drijf",
        situation: "Een houten blok en een stenen blok hebben ongeveer hetzelfde volume.",
        prompt: "Welk blok drijft eerder op water, en waarom?",
        why: "Hout heeft een kleinere dichtheid dan water; steen groter — steen zinkt.",
        stof: tag(k4, "k4-dichtheid", "Dichtheid · drijven/zinken"),
        correct: "Het houten blok, want de dichtheid is kleiner dan die van water.",
        distractors: [
          "Het stenen blok, want steen is zwaarder en drijft daarom beter.",
          "Beide even goed, want het volume is gelijk.",
          "Geen van beide: alleen metaal kan drijven.",
        ],
      },
      slot,
    ),
    figuurId: "dichtheid-blokken",
    figuurBijschrift: "Figuur 4 — drijven en zinken",
  };

  const qWarmte = {
    ...assembleMc(
      {
        id: "ex-warmte",
        situation: "Een metalen lepel staat in een pan met hete soep. Het handvat wordt warm.",
        prompt: "Welke vorm van warmtetransport speelt hier vooral?",
        why: "In een vaste stof verplaatst warmte zich vooral door geleiding.",
        stof: tag(k6, "k6-transport", "Warmtetransport"),
        correct: "Geleiding",
        distractors: ["Stroming", "Straling", "Convectie door lucht alleen"],
      },
      slot,
    ),
    figuurId: "thermometer-isolatie",
    figuurBijschrift: "Figuur 5 — warmte en isolatie",
  };

  const qIsolatie = openQ(
    "ex-isolatie",
    "Een thermoskan houdt thee lang warm. De binnenkant is zilverkleurig en er zit weinig lucht tussen de wanden.",
    "Noem twee manieren waarop warmteverlies hier beperkt wordt.",
    2,
    "Weinig geleiding/stroming door vacuüm of luchtlaag; zilver weerkaatst straling.",
    "Isolatie beperkt geleiding en stroming; spiegelende laag beperkt straling.",
    { keywords: ["geleiding", "stroming", "straling", "isolatie", "reflect", "lucht", "vacu"] },
    tag(k6, "k6-isolatie", "Isolatie in huis"),
    "thermometer-isolatie",
    "Figuur 6 — isoleerkan-principe",
  );

  const qGeluid = {
    ...assembleMc(
      {
        id: "ex-geluid",
        situation: `Een stemvork trilt met ${f} Hz.`,
        prompt: "Wat betekent deze waarde?",
        why: "Frequentie is het aantal trillingen per seconde; eenheid hertz (Hz).",
        stof: tag(k8, "k8-toon", "Toonhoogte en frequentie"),
        correct: `De stemvork maakt ${f} trillingen per seconde.`,
        distractors: [
          `Het geluid is ${f} dB hard.`,
          `De geluidssnelheid is ${f} m/s.`,
          `De toonhoogte is ${f} meter.`,
        ],
      },
      slot,
    ),
  };

  const qDb = openQ(
    "ex-db",
    `Bij een schoolfeest meet ${naam} ${db} dB.`,
    "Is dit veilig voor lang luisteren zonder bescherming? Licht kort toe.",
    2,
    db >= 85
      ? "Nee, vanaf ongeveer 85 dB kan lang luisteren gehoorschade geven."
      : "Matig: onder 85 dB is korter risico kleiner, maar hard geluid blijft vermoeiend.",
    "Richtlijn: langdurig geluid rond/boven 85 dB kan het gehoor beschadigen.",
    {
      keywords:
        db >= 85
          ? ["nee", "schade", "gehoor", "85", "bescherm", "hard", "lawaai"]
          : ["matig", "ok", "veilig", "risico", "gehoor", "85", "kort"],
    },
    tag(k8, "k8-gehoor", "Gehoor en bescherming"),
  );

  const qSnelheid = openQ(
    "ex-snelheid",
    `Een skateboard legt ${s} m af in ${t} s in een rechte lijn.`,
    "Bereken de gemiddelde snelheid in m/s.",
    2,
    `${nlGetal(v, 1)} m/s`,
    `v = s / t = ${s} / ${t} = ${nlGetal(v, 1)} m/s.`,
    { numbers: [v], tolerance: 0.15 },
    tag(k9, "k9-snelheid", "Gemiddelde snelheid"),
    "st-schets",
    "Figuur 7 — (s,t)-schets",
  );

  const qKracht = {
    ...assembleMc(
      {
        id: "ex-kracht",
        situation: "Op een doos op tafel werkt de zwaartekracht omlaag. De tafel duwt omhoog.",
        prompt: "Hoe heet de kracht van de tafel op de doos, en wat als die even groot is als Fz?",
        why: "Normaalkracht/steunkracht balanceert Fz → nettokracht nul → doos blijft liggen.",
        stof: tag(k9, "k9-soorten", "Soorten krachten"),
        correct: "Steun- of normaalkracht; de doos blijft in rust.",
        distractors: [
          "Wrijvingskracht; de doos versnelt omhoog.",
          "Magnetische kracht; de doos zweeft.",
          "Spankracht; de doos valt door de tafel.",
        ],
      },
      slot,
    ),
    figuurId: "kracht-doos",
    figuurBijschrift: "Figuur 8 — krachten op een doos",
  };

  const qStop = openQ(
    "ex-stop",
    `Een scooter rijdt ${vKm} km/h. Reactietijd ${nlGetal(reactie, 1)} s, remweg ${rem} m.`,
    "Bereken bij benadering de stopafstand in meters (reactieafstand + remweg).",
    2,
    `${nlGetal(stop, 1)} m`,
    `v ≈ ${nlGetal(Math.round((vKm / 3.6) * 10) / 10, 1)} m/s; reactieafstand ≈ ${nlGetal(reactieAfstand, 1)} m; stop ≈ ${nlGetal(stop, 1)} m.`,
    { numbers: [stop], tolerance: Math.max(1.5, stop * 0.12) },
    tag(v1, "v1-botsing", "Botsing en remweg"),
  );

  const qVeilig = {
    ...assembleMc(
      {
        id: "ex-veilig",
        situation: "Bij een botsproef zie je een kreukelzone en een veiligheidsgordel.",
        prompt: "Wat is het natuurkundige idee achter beide?",
        why: "Langere botsingsduur / kleinere versnelling → kleinere piekkracht op inzittenden.",
        stof: tag(v1, "v1-veiligheid", "Veiligheidsvoorzieningen"),
        correct: "De botsing duurt langer, waardoor de krachten kleiner worden.",
        distractors: [
          "De auto wordt sneller, zodat de botsing korter duurt.",
          "De massa van de inzittenden wordt groter.",
          "Zwaartekracht wordt uitgeschakeld tijdens de botsing.",
        ],
      },
      slot,
    ),
  };

  const qMoment = {
    ...assembleMc(
      {
        id: "ex-moment",
        situation: "Een kind zit verder van het draaipunt op een wip dan een volwassene.",
        prompt: "Waarom kan het kind de wip dan toch in evenwicht houden?",
        why: "Moment = F × arm; grotere arm compenseert kleinere kracht.",
        stof: tag(v2, "v2-moment", "Moment en evenwicht"),
        correct: "Door de grotere arm is het moment ongeveer even groot.",
        distractors: [
          "Omdat zwaartekracht op kinderen kleiner is per definitie.",
          "Omdat de wip geen krachten doorgeeft.",
          "Omdat massa geen rol speelt bij evenwicht.",
        ],
      },
      slot,
    ),
    figuurId: "kracht-doos",
    figuurBijschrift: "Figuur 9 — kracht en arm (schets)",
  };

  const qEenheid = {
    ...assembleMc(
      {
        id: "ex-eenheid",
        situation: "In een opgave moet je vermogen berekenen met P = U · I.",
        prompt: "Welke eenheid hoort bij vermogen?",
        why: "Vermogen heeft de eenheid watt (W); 1 W = 1 J/s.",
        stof: tag(k3, "k3-grootheden", "Grootheden en eenheden"),
        correct: "Watt (W)",
        distractors: ["Joule (J)", "Newton (N)", "Ohm (Ω)"],
      },
      slot,
    ),
  };

  const qGrafiek = openQ(
    "ex-grafiek",
    "In een (s,t)-diagram zie je een rechte lijn omhoog vanuit de oorsprong.",
    "Wat betekent de helling van die lijn? Noem ook de eenheid.",
    2,
    "Gemiddelde snelheid in m/s (of km/h).",
    "Helling Δs/Δt = snelheid; eenheid m/s als s in m en t in s.",
    { keywords: ["snelheid", "helling", "m/s", "afstand", "tijd"] },
    tag(k3, "k3-grafiek", "Tabellen en grafieken"),
    "st-schets",
    "Figuur 10 — (s,t)-diagram",
  );


  const leesTag = tag(k3, "k3-bronnen", "Bronnen en vaktekst lezen");
  // Ensure k3 has bronnen topic in stofkaart keywords via paragraafId
  const tekstElektr = `${naam} leest in een CE-achtige bron: "In een gesloten stroomkring loopt elektrische stroom van de pluspool door de componenten terug naar de minpool. Bij een serieschakeling is er één pad: de stroomsterkte is overal gelijk. Bij een parallelschakeling splitst de stroom zich. Een lamp brandt alleen als de kring gesloten is. Koper geleidt stroom goed; plastic isoleert."`;

  const qLees1 = {
    ...assembleMc(
      {
        id: "ex-lees1",
        skill: "lees",
        situation: tekstElektr,
        prompt: "Wat betekent volgens de tekst ‘gesloten stroomkring’ voor de lamp?",
        why: "De tekst: een lamp brandt alleen als de kring gesloten is — dan kan stroom lopen.",
        stof: leesTag,
        correct: "De lamp kan branden omdat er stroom kan lopen.",
        distractors: [
          "De lamp is dan altijd kapot.",
          "Er mag geen schakelaar in de kring zitten.",
          "Alleen plastic mag in de kring zitten.",
        ],
      },
      slot,
    ),
  };

  const qLees2 = {
    ...assembleMc(
      {
        id: "ex-lees2",
        skill: "lees",
        situation: tekstElektr,
        prompt: "Waar wijst in de tekst het verschil tussen serie en parallel vooral op?",
        why: "Serie: één pad, stroom gelijk; parallel: stroom splitst zich.",
        stof: leesTag,
        correct: "Of de stroom één pad volgt of zich splitst.",
        distractors: [
          "Of de batterij van plastic of koper is.",
          "Of de lamp warm of koud is.",
          "Of de pluspool boven of onder zit.",
        ],
      },
      slot,
    ),
  };

  const tekstDicht = `"Dichtheid is massa per volume. Twee blokken kunnen even groot zijn (zelfde volume). Het zwaardere blok heeft dan een grotere dichtheid. Een stof drijft op water als de dichtheid kleiner is dan die van water. Steen zinkt meestal; veel houtsoorten drijven."`;

  const qLees3 = {
    ...assembleMc(
      {
        id: "ex-lees3",
        skill: "lees",
        situation: tekstDicht,
        prompt: "Wat moet je volgens de tekst vergelijken om te weten of iets drijft?",
        why: "De tekst: drijven als de dichtheid kleiner is dan die van water.",
        stof: leesTag,
        correct: "De dichtheid van de stof met die van water.",
        distractors: [
          "Alleen de kleur van het blok.",
          "Alleen de vorm van het waterbakje.",
          "Alleen de temperatuur van de lucht.",
        ],
      },
      slot,
    ),
  };

  const tekstRem = `"Stopafstand is reactieafstand plus remweg. In de reactietijd blijft de snelheid ongeveer gelijk: de bestuurder heeft het rempedaal nog niet ingedrukt. Daarna neemt de snelheid af door de remkracht. Een kreukelzone en een gordel zorgen dat de botsing langer duurt, zodat de krachten op inzittenden kleiner worden."`;

  const qLees4 = openQ(
    "ex-lees4",
    tekstRem,
    "Leg met de tekst uit waarom een kreukelzone kan helpen bij een botsing.",
    2,
    "De botsing duurt langer, waardoor de krachten op inzittenden kleiner worden.",
    "Bron: langere botsingsduur → kleinere krachten.",
    { keywords: ["langer", "kracht", "botsing", "kleiner", "inzittend", "duur"] },
    leesTag,
    undefined,
    undefined,
    "lees",
  );

  return [
    qSerie,
    qParallel,
    qOhm,
    qDicht,
    qDrijf,
    qWarmte,
    qIsolatie,
    qGeluid,
    qDb,
    qSnelheid,
    qKracht,
    qStop,
    qVeilig,
    qMoment,
    qEenheid,
    qGrafiek,
    qLees1,
    qLees2,
    qLees3,
    qLees4,
  ];
}

function filterFocus(pool: Question[], focusIds?: string[]): Question[] {
  if (!focusIds?.length) return pool;
  const set = new Set(focusIds);
  const hit = pool.filter((q) => q.stof && set.has(q.stof.hoofdstukId));
  return hit.length >= 4 ? hit : pool;
}

function neemMix(items: Question[], n: number, rng: Rng): Question[] {
  const mc = shuffled(
    items.filter((q) => q.type === "mc"),
    rng,
  );
  const open = shuffled(
    items.filter((q) => q.type === "open"),
    rng,
  );
  const out: Question[] = [];
  let i = 0;
  let j = 0;
  while (out.length < n && (i < mc.length || j < open.length)) {
    if (out.length % 2 === 0 && i < mc.length) {
      out.push(mc[i++]!);
    } else if (j < open.length) {
      out.push(open[j++]!);
    } else if (i < mc.length) {
      out.push(mc[i++]!);
    } else break;
  }
  return out;
}

/** Originele CE-stijl oefentoets (~10 vragen). Geen letterlijke examenblad-items. */
export function bouwExamenOefening(opts: {
  niveau: string;
  seed?: number;
  focusOnderdeelIds?: string[];
}): Toets {
  const seed = opts.seed ?? Date.now() % 1_000_000;
  const rng = mulberry32(seed);
  const count = 10;
  const full = buildPool(rng);
  // Leesvaardigheid altijd mee (CE-bronnen), ook bij stof-focus.
  const leesPool = full.filter((q) => q.skill === "lees");
  const stofPool = filterFocus(
    full.filter((q) => q.skill !== "lees"),
    opts.focusOnderdeelIds,
  );
  const leesN = Math.min(3, Math.max(2, leesPool.length ? 2 + (rng() > 0.5 ? 1 : 0) : 0));
  const leesPicked = shuffled(leesPool, rng).slice(0, leesN);
  const stofN = count - leesPicked.length;
  const stofPicked = neemMix(stofPool, stofN, rng);
  const picked: Question[] = [...stofPicked, ...leesPicked];
  // Diversiteit stof: minstens enkele CE-onderdelen
  if (!opts.focusOnderdeelIds?.length) {
    const have = new Set(
      picked.filter((q) => q.skill !== "lees").map((q) => q.stof?.hoofdstukId).filter(Boolean),
    );
    if (have.size < 4) {
      const extra = shuffled(stofPool, rng).filter((q) => q.stof && !have.has(q.stof.hoofdstukId));
      for (const q of extra) {
        const idx = picked.findIndex((p) => p.skill !== "lees");
        if (idx < 0) break;
        if (picked.some((p) => p.id === q.id)) continue;
        picked[idx] = q;
        have.add(q.stof!.hoofdstukId);
        if (have.size >= 4) break;
      }
    }
  }

  const questions = balanceMcLetters(
    shuffled(picked, rng)
      .slice(0, count)
      .map((q, i) => ({ ...q, id: `ex${i + 1}` })),
    rng,
  );

  const focusLabels = (opts.focusOnderdeelIds ?? [])
    .map((id) => ceOnderdeelById(id))
    .filter(Boolean)
    .map((o) => o!.code);
  const topic =
    focusLabels.length > 0
      ? `Examen oefenen · ${focusLabels.join(", ")}`
      : "Examen oefenen";

  return {
    title: `Examen oefenen · ${opts.niveau}`,
    subject: "NaSk",
    questions,
    bron: {
      kind: "zelf",
      topic,
      tijd: "20",
      count: questions.length,
      soort: "mix",
      leerjaar: "4",
      niveau: opts.niveau,
      vakId: "nask",
      hoofdstukId: opts.focusOnderdeelIds?.[0],
      paragraafIds: opts.focusOnderdeelIds,
      lastig: focusLabels.length ? focusLabels.join(", ") : undefined,
    },
  };
}

export function examenOnderdeelChips() {
  return ceOnderdelen().map((o) => ({
    id: o.id,
    label: `${o.code} ${o.titel}`,
    code: o.code,
  }));
}
