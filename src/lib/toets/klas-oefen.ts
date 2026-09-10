import { nlGetal } from "./format";
import { assembleMc, balanceMcLetters, mulberry32, pick, shuffled, type Rng } from "./shuffle";
import type { Letter, OpenQuestion, Question, StofTag, Toets } from "./types";

const NAMEN = ["Lina", "Amir", "Tess", "Joost", "Noor", "Sem", "Daan", "Esmee"] as const;

/** Zet true pas nadat Nick figuren OK heeft gegeven. */
export const SHOW_KLAS_FIGUREN = false;

export const KLAS_TOPICS = [
  { id: "h10-p1", hoofdstukId: "h10", label: "H10 §1 Soorten krachten" },
  { id: "h10-p2", hoofdstukId: "h10", label: "H10 §2 Krachten in constructies" },
  { id: "h10-p3", hoofdstukId: "h10", label: "H10 §3 Krachten samenstellen" },
  { id: "h10-p4", hoofdstukId: "h10", label: "H10 §4 Krachten ontbinden" },
  { id: "h14-p1", hoofdstukId: "h14", label: "H14 §1 Werken met hefbomen" },
  { id: "h14-p2", hoofdstukId: "h14", label: "H14 §2 Hefbomen en zwaartekracht" },
  { id: "h14-p3", hoofdstukId: "h14", label: "H14 §3 Katrollen en takels" },
  { id: "h14-p4", hoofdstukId: "h14", label: "H14 §4 Druk" },
] as const;

export type KlasTopicId = (typeof KLAS_TOPICS)[number]["id"];

function tag(topicId: KlasTopicId): StofTag {
  const t = KLAS_TOPICS.find((x) => x.id === topicId)!;
  return { hoofdstukId: t.hoofdstukId, paragraafId: t.id, label: t.label };
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
    ...(figuurId ? { figuurId, figuurBijschrift } : {}),
  };
}

function buildPool(rng: Rng): Question[] {
  const naam = pick(rng, NAMEN);
  const slot = "A" as Letter;
  const m = pick(rng, [2, 3, 4, 5] as const);
  const g = 10;
  const fz = m * g;
  const f1 = pick(rng, [20, 30, 40, 50] as const);
  const f2 = pick(rng, [15, 25, 35] as const);
  const arm1 = pick(rng, [0.4, 0.5, 0.6, 0.8] as const);
  const arm2 = pick(rng, [1.0, 1.2, 1.5, 2.0] as const);
  const moment1 = Math.round(f1 * arm1 * 10) / 10;
  const fEvenwicht = Math.round((moment1 / arm2) * 10) / 10;
  const takelN = pick(rng, [2, 3, 4] as const);
  const lastF = pick(rng, [120, 180, 240, 300] as const);
  const trekF = Math.round((lastF / takelN) * 10) / 10;
  const drukF = pick(rng, [200, 400, 600] as const);
  const areaKlein = pick(rng, [2, 4, 5] as const);
  const areaGroot = pick(rng, [20, 40, 50] as const);
  const pKlein = Math.round((drukF / areaKlein) * 10) / 10;
  const pGroot = Math.round((drukF / areaGroot) * 10) / 10;
  const resZelfde = f1 + f2;
  const resTegen = Math.abs(f1 - f2);

  const qSoort = {
    ...assembleMc(
      {
        id: "klas-soort",
        situation: `Op een tas van ${naam} werkt de zwaartekracht omlaag. De riem trekt omhoog.`,
        prompt: "Hoe heten deze twee krachten?",
        why: "Zwaartekracht Fz omlaag; de riem levert spankracht Fs omhoog.",
        stof: tag("h10-p1"),
        correct: "Zwaartekracht (Fz) en spankracht (Fs)",
        distractors: [
          "Normaalkracht (Fn) en wrijvingskracht (Fw)",
          "Magnetische kracht en elektrische kracht",
          "Drukkracht en luchtdruk alleen",
        ],
      },
      slot,
    ),
    figuurId: "kracht-vectoren",
    figuurBijschrift: "Figuur — krachten op een tas (schets)",
  };

  const qFz = openQ(
    "klas-fz",
    `${naam} tilt een krat van ${m} kg. Neem g = ${g} N/kg.`,
    "Bereken de zwaartekracht Fz in newton.",
    2,
    `${fz} N`,
    `Fz = m · g = ${m} · ${g} = ${fz} N.`,
    { numbers: [fz], tolerance: 0.5 },
    tag("h10-p1"),
    "kracht-doos",
    "Figuur — zwaartekracht op een voorwerp",
  );

  const qMagneet = {
    ...assembleMc(
      {
        id: "klas-magneet",
        situation: "Twee gelijke poolen van een magneet worden dicht bij elkaar gehouden.",
        prompt: "Wat gebeurt er, en hoe noem je dat?",
        why: "Gelijke polen stoten elkaar af (magnetische kracht).",
        stof: tag("h10-p1"),
        correct: "Ze stoten elkaar af (afstoten).",
        distractors: [
          "Ze trekken elkaar aan.",
          "Er is geen kracht tussen magneten.",
          "Alleen zwaartekracht speelt een rol.",
        ],
      },
      slot,
    ),
  };

  const qConstructie = {
    ...assembleMc(
      {
        id: "klas-constructie",
        situation: "Een brugdeel van staal wordt uit elkaar getrokken. Een bakstenen pilaar wordt samengedrukt.",
        prompt: "Welke krachten horen hierbij?",
        why: "Trek trekt uit elkaar; druk duwt samen. Staal is sterk op trek, baksteen vooral op druk.",
        stof: tag("h10-p2"),
        correct: "Trek in het staal, druk in de baksteen.",
        distractors: [
          "Druk in het staal, trek in de baksteen.",
          "Alleen wrijving in beide materialen.",
          "Alleen zwaartekracht, geen trek of druk.",
        ],
      },
      slot,
    ),
  };

  const qDriehoek = {
    ...assembleMc(
      {
        id: "klas-driehoek",
        situation: "Een frame van staven kan een rechthoek of een driehoek vormen.",
        prompt: "Welke vorm is stabieler tegen vervormen, en waarom?",
        why: "Een driehoek kan niet scheef zakken zonder staven te verlengen/verkorten; een rechthoek wel.",
        stof: tag("h10-p2"),
        correct: "De driehoek: die blijft beter in vorm.",
        distractors: [
          "De rechthoek: die heeft meer hoeken.",
          "Beide even stabiel bij dezelfde lengte.",
          "Alleen houten frames zijn stabiel.",
        ],
      },
      slot,
    ),
  };

  const qSamen = openQ(
    "klas-samen",
    `Twee krachten wijzen dezelfde kant op: ${f1} N en ${f2} N.`,
    "Bereken de resultante in newton.",
    2,
    `${resZelfde} N`,
    `In dezelfde richting: R = ${f1} + ${f2} = ${resZelfde} N.`,
    { numbers: [resZelfde], tolerance: 0.5 },
    tag("h10-p3"),
    "kracht-vectoren",
    "Figuur — krachten in dezelfde richting",
  );

  const qTegen = {
    ...assembleMc(
      {
        id: "klas-tegen",
        situation: `Links werkt ${f1} N, rechts werkt ${f2} N (tegengestelde richting).`,
        prompt: "Hoe groot is de resultante, en welke kant op als de grootste wint?",
        why: "Tegengesteld: R = |F1 − F2|, richting van de grootste kracht.",
        stof: tag("h10-p3"),
        correct: `${resTegen} N, in de richting van de grootste kracht.`,
        distractors: [
          `${resZelfde} N, altijd naar rechts.`,
          `${f1} N, want de andere telt niet.`,
          `0 N, want krachten heffen altijd op.`,
        ],
      },
      slot,
    ),
    figuurId: "kracht-vectoren",
    figuurBijschrift: "Figuur — tegengestelde krachten",
  };

  const qOntbind = {
    ...assembleMc(
      {
        id: "klas-ontbind",
        situation: `${naam} tilt een krat schuin omhoog aan een touw. Het touw trekt schuin.`,
        prompt: "Waarin kun je die spankracht ontbinden voor de constructie/hand?",
        why: "Een schuine kracht ontbind je in een verticale (omhoog tillen) en een horizontale component.",
        stof: tag("h10-p4"),
        correct: "In een verticale en een horizontale component.",
        distractors: [
          "Alleen in zwaartekracht en wrijving.",
          "Alleen in massa en volume.",
          "Niet mogelijk: krachten kun je nooit ontbinden.",
        ],
      },
      slot,
    ),
    figuurId: "kracht-vectoren",
    figuurBijschrift: "Figuur — schuine kracht ontbinden",
  };

  const qHefboom = openQ(
    "klas-hefboom",
    `Een hefboom: F₁ = ${f1} N op arm ${nlGetal(arm1, 1)} m. Draaipunt P. Aan de andere kant arm ${nlGetal(arm2, 1)} m.`,
    "Bereken welke kracht F₂ nodig is voor evenwicht (momentevenwicht). Schrijf het getal in N.",
    2,
    `${nlGetal(fEvenwicht, 1)} N`,
    `Moment: F₁·arm₁ = F₂·arm₂ → F₂ = (${f1}·${nlGetal(arm1, 1)}) / ${nlGetal(arm2, 1)} = ${nlGetal(fEvenwicht, 1)} N.`,
    { numbers: [fEvenwicht], tolerance: Math.max(0.3, fEvenwicht * 0.08) },
    tag("h14-p1"),
    "hefboom-moment",
    "Figuur — hefboom met draaipunt P",
  );

  const qMoment = {
    ...assembleMc(
      {
        id: "klas-moment",
        situation: "Op een hefboom werkt een kracht verder van het draaipunt.",
        prompt: "Wat gebeurt er met het moment als de arm groter wordt (zelfde F)?",
        why: "Moment = F · arm; grotere arm → groter moment.",
        stof: tag("h14-p1"),
        correct: "Het moment wordt groter.",
        distractors: [
          "Het moment wordt kleiner.",
          "Het moment blijft altijd gelijk.",
          "Moment bestaat alleen bij katrollen.",
        ],
      },
      slot,
    ),
    figuurId: "hefboom-moment",
    figuurBijschrift: "Figuur — kracht en arm",
  };

  const qZwaartepunt = {
    ...assembleMc(
      {
        id: "klas-zwaartepunt",
        situation: "Een zware metalen staaf dient als hefboom. Het zwaartepunt ligt niet op het draaipunt.",
        prompt: "Wanneer moet je Fz van de hefboom zelf meerekenen?",
        why: "Als het zwaartepunt niet op P ligt, levert Fz van de staaf ook een moment.",
        stof: tag("h14-p2"),
        correct: "Als het zwaartepunt niet op het draaipunt ligt.",
        distractors: [
          "Nooit: hefbomen hebben geen zwaartekracht.",
          "Alleen als de staaf van hout is.",
          "Alleen bij dubbele hefbomen.",
        ],
      },
      slot,
    ),
  };

  const qKatrol = openQ(
    "klas-katrol",
    `Met een takel van ${takelN} kabels hijst ${naam} een last van ${lastF} N (ideale takel, geen wrijving).`,
    "Bereken bij benadering de trekkracht in één kabel in newton.",
    2,
    `${nlGetal(trekF, 1)} N`,
    `Ideale takel: F_trek ≈ F_last / n = ${lastF} / ${takelN} = ${nlGetal(trekF, 1)} N.`,
    { numbers: [trekF], tolerance: Math.max(1, trekF * 0.1) },
    tag("h14-p3"),
    "katrol-takel",
    "Figuur — eenvoudige takel",
  );

  const qTakel = {
    ...assembleMc(
      {
        id: "klas-takel",
        situation: "Een takel heeft meer kabels die de last dragen.",
        prompt: "Wat is het voordeel van zo'n takel?",
        why: "Meer kabels → kleinere trekkracht nodig (ideale rekenregel F ≈ last/n).",
        stof: tag("h14-p3"),
        correct: "Je hebt minder trekkracht nodig om dezelfde last te hijsen.",
        distractors: [
          "De last wordt zwaarder, dus sneller.",
          "Zwaartekracht verdwijnt in de katrol.",
          "Je hebt altijd meer trekkracht nodig.",
        ],
      },
      slot,
    ),
    figuurId: "katrol-takel",
    figuurBijschrift: "Figuur — katrol / takel",
  };

  const qDruk = openQ(
    "klas-druk",
    `Een kracht van ${drukF} N werkt op een klein oppervlak van ${areaKlein} cm².`,
    "Bereken de druk in N/cm².",
    2,
    `${nlGetal(pKlein, 1)} N/cm²`,
    `p = F / A = ${drukF} / ${areaKlein} = ${nlGetal(pKlein, 1)} N/cm².`,
    { numbers: [pKlein], tolerance: Math.max(0.2, pKlein * 0.08) },
    tag("h14-p4"),
    "druk-oppervlak",
    "Figuur —zelfde kracht, klein vs groot oppervlak",
  );

  const qDrukVergelijk = {
    ...assembleMc(
      {
        id: "klas-druk-vgl",
        situation: `Zelfde kracht ${drukF} N: eerst op ${areaKlein} cm², daarna op ${areaGroot} cm².`,
        prompt: "Waar is de druk groter, en waarom?",
        why: `p = F/A; kleiner oppervlak → grotere druk (${nlGetal(pKlein, 1)} vs ${nlGetal(pGroot, 1)} N/cm²).`,
        stof: tag("h14-p4"),
        correct: "Op het kleine oppervlak: druk is kracht per oppervlakte.",
        distractors: [
          "Op het grote oppervlak: meer cm² betekent meer druk.",
          "Overal gelijk: de kracht is hetzelfde.",
          "Druk hangt alleen af van de massa, niet van A.",
        ],
      },
      slot,
    ),
    figuurId: "druk-oppervlak",
    figuurBijschrift: "Figuur — klein vs breed steunvlak",
  };

  const qScherp = {
    ...assembleMc(
      {
        id: "klas-scherp",
        situation: "Een scherpe spijker en een brede schoenzool: zelfde aandrukkracht.",
        prompt: "Wat klopt over de druk?",
        why: "Scherpe tip = klein A → hoge druk; brede zool = groot A → lage druk.",
        stof: tag("h14-p4"),
        correct: "De spijker geeft grotere druk door het kleine oppervlak.",
        distractors: [
          "De schoenzool geeft altijd meer druk.",
          "Druk is bij beide nul zonder magneten.",
          "Alleen het gewicht telt, niet het oppervlak.",
        ],
      },
      slot,
    ),
  };

  return [
    qSoort,
    qFz,
    qMagneet,
    qConstructie,
    qDriehoek,
    qSamen,
    qTegen,
    qOntbind,
    qHefboom,
    qMoment,
    qZwaartepunt,
    qKatrol,
    qTakel,
    qDruk,
    qDrukVergelijk,
    qScherp,
  ];
}

function filterFocus(pool: Question[], focusIds?: string[]): Question[] {
  if (!focusIds?.length) return pool;
  const set = new Set(focusIds);
  const hit = pool.filter(
    (q) => q.stof && (set.has(q.stof.paragraafId) || set.has(q.stof.hoofdstukId)),
  );
  return hit.length >= 3 ? hit : pool;
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
    if (out.length % 2 === 0 && i < mc.length) out.push(mc[i++]!);
    else if (j < open.length) out.push(open[j++]!);
    else if (i < mc.length) out.push(mc[i++]!);
    else break;
  }
  return out;
}

/** Tijdelijke klasoefening H10 + H14 (~10 vragen). Origineel; figuren uit tot Nick OK. */
export function bouwKlasOefening(opts: {
  niveau: string;
  seed?: number;
  /** Paragraaf-ids (h10-p1…) of hoofdstuk-ids (h10/h14) voor reparatie. */
  focusTopicIds?: string[];
  /** Reparatie: 6–8 vragen; normaal: 10. */
  count?: number;
}): Toets {
  const seed = opts.seed ?? Date.now() % 1_000_000;
  const rng = mulberry32(seed);
  const isReparatie = Boolean(opts.focusTopicIds?.length);
  const count = opts.count ?? (isReparatie ? 7 : 10);
  const pool = filterFocus(buildPool(rng), opts.focusTopicIds);
  let picked = neemMix(pool, count, rng);

  if (!isReparatie) {
    const have = new Set(picked.map((q) => q.stof?.paragraafId).filter(Boolean));
    if (have.size < 5) {
      const extra = shuffled(pool, rng).filter((q) => q.stof && !have.has(q.stof.paragraafId));
      for (const q of extra) {
        const idx = picked.findIndex((p) => p.stof?.paragraafId === picked[0]?.stof?.paragraafId);
        if (picked.some((p) => p.id === q.id)) continue;
        if (idx >= 0) picked[idx] = q;
        else picked.push(q);
        have.add(q.stof!.paragraafId);
        if (have.size >= 5 && picked.length >= count) break;
      }
      picked = picked.slice(0, count);
    }
  }

  const questions = balanceMcLetters(
    shuffled(picked, rng)
      .slice(0, count)
      .map((q, i) => {
        const next = { ...q, id: `klas${i + 1}` };
        if (!SHOW_KLAS_FIGUREN) {
          const { figuurId: _f, figuurBijschrift: _b, ...rest } = next as typeof next & {
            figuurId?: string;
            figuurBijschrift?: string;
          };
          return rest;
        }
        return next;
      }),
    rng,
  );

  const focusLabels = (opts.focusTopicIds ?? [])
    .map((id) => KLAS_TOPICS.find((t) => t.id === id || t.hoofdstukId === id)?.label ?? id)
    .filter(Boolean);
  const topic = isReparatie
    ? `Reparatie H10 & H14 · ${focusLabels.slice(0, 3).join(", ")}`
    : "Klas oefenen · H10 & H14";

  return {
    title: isReparatie
      ? `Reparatie H10 & H14 · ${opts.niveau}`
      : `Oefenen H10 & H14 · ${opts.niveau}`,
    subject: "NaSk",
    questions,
    bron: {
      kind: "zelf",
      topic,
      tijd: isReparatie ? "15" : "20",
      count: questions.length,
      soort: "mix",
      leerjaar: "4",
      niveau: opts.niveau,
      vakId: "nask",
      hoofdstukId: "h10",
      paragraafIds: opts.focusTopicIds,
      lastig: focusLabels.length ? focusLabels.join(", ") : "H10 Krachten · H14 Werktuigen",
    },
  };
}

export function klasTopicLabel(id: string): string {
  return KLAS_TOPICS.find((t) => t.id === id || t.hoofdstukId === id)?.label ?? id;
}
