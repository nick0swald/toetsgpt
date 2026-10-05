import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { bouwOefentoets, looksLikeDensityOrSpeed } from "./demo";
import { parseLeerlingToets } from "./parse-paste";
import { balanceMcLetters, mulberry32, shuffled } from "./shuffle";
import type { InvulQuestion, McQuestion, OpenQuestion, Question, Toets, ToetsBron, VraagSoort } from "./types";
import { LETTERS } from "./types";
import { figuurUitJson } from "./figuren/render";
import { bioLesstof } from "./bio";
import { novaLesstof } from "./nova-boek.server";
import { CURRICULUM, hoofdstukById, vakOf } from "./stof";
import { bankIsRijp, bewaarVragen, pakVragen, zorgVoorZaad } from "./vraagbank";

const InputSchema = z.object({
  mode: z.enum(["zelf", "docent", "regen", "extra"]),
  naam: z.string().max(40).optional(),
  klas: z.string().max(12).optional(),
  lesstof: z.string().max(8000),
  count: z.number().int().min(4).max(12),
  soort: z.enum(["auto", "mix", "mc", "open", "invul", "lees"]),
  tijd: z.enum(["kort", "10", "15", "20"]),
  previousTitle: z.string().max(120).optional(),
  leerjaar: z.string().max(4).optional(),
  niveau: z.string().max(4).optional(),
  hoofdstukId: z.string().max(40).optional(),
  paragraafIds: z.array(z.string().max(40)).max(12).optional(),
  lastig: z.string().max(400).optional(),
  vakId: z.string().max(24).optional(),
});

export type GenerateInput = z.infer<typeof InputSchema>;

export type GenerateResult =
  | { ok: true; toets: Toets; usedAi: boolean }
  | { ok: false; error: string };

const AiQuestion = z.object({
  type: z.enum(["mc", "open", "invul"]),
  skill: z.enum(["stof", "lees"]).optional(),
  situation: z.string().min(8).max(1200),
  prompt: z.string().min(4).max(400),
  points: z.number().int().min(1).max(4).optional(),
  correct: z.string().min(1).max(220).optional(),
  distractors: z.array(z.string().min(1).max(220)).min(3).max(3).optional(),
  modelAnswer: z.string().min(1).max(400),
  why: z.string().min(4).max(280),
  acceptNumbers: z.array(z.number()).optional(),
  acceptKeywords: z.array(z.string()).optional(),
  stofLabel: z.string().max(80).optional(),
  paragraafId: z.string().max(40).optional(),
  figuur: z.unknown().optional(),
});

const AiToets = z.object({
  title: z.string().min(4).max(80),
  subject: z.string().min(2).max(40).optional(),
  questions: z.array(AiQuestion).min(4).max(12),
});

function systemPrompt(vakTitel: string): string {
  return `Je maakt een korte oefentoets voor VMBO-leerlingen (BB/KB/GT), vak ${vakTitel}. Noem nooit een schoolnaam, merknaam of "ToetsGPT"/"Grok" in de vragen.

VORM
- Cito-stijl: EERST een situatieschets, DAARNA de vraag. Nooit andersom.
- Taal: kort, nuchter, VMBO. Geen emoji. Geen knipoog. Geen grappen.
- Vragen nooit 1:1 uit een boek. Andere namen, andere getallen, andere situaties.
- Niet luguber. Niemand valt, botst of raakt gewond. Gebruik een steen, bal of kist.

VRAAGTYPES
- Mix: meerkeuze, open/bereken, invul, én vakgerichte LEESVRAGEN.
- Bij mix: minstens een kwart leesvragen (bij 8 vragen: 2). Bij biologie: minstens een derde.
- Leesvraag: situation is een korte vaktekst (5–8 zinnen, VMBO). Daarna ÉÉN vraag over betekenis van een vakwoord, waar dit/daardoor naar verwijst, de hoofdzaak, of een gegeven uit de tekst. Geen rekenen. skill "lees".
- Andere vragen: skill "stof".
- Meerkeuze: geef "correct" (juiste tekst) en "distractors" (precies 3 foute teksten). GEEN letters A–D. De volgorde wordt later bepaald.
- MC max 1 punt. Invul 1 punt. Open 2 punten.
- Invul: prompt bevat precies één ___.
- why: ÉÉN korte zin.
- Bij NaSk heeft minstens de helft van de stofvragen een "figuur". Bouw dat figuur voor déze vraag, niet uit een vast sjabloon. Het getal dat de leerling moet aflezen staat alleen in het figuur, niet nog eens in de tekst. Teken het antwoord niet: geen rode pijl, geen resultante als de leerling die moet vinden.
  maatcilinder: {"type":"maatcilinder","max":100,"streep":2,"getalElke":20,"cilinders":[{"niveau":40,"label":"vóór"},{"niveau":62,"label":"ná","voorwerp":true}]}
  grafiek: {"type":"grafiek","x":{"label":"tijd (min)","min":0,"max":14,"stap":2},"y":{"label":"temperatuur (°C)","min":0,"max":80,"stap":10},"reeksen":[{"vorm":"lijn","punten":[[0,20],[4,44],[10,44],[14,70]]}]} vorm is lijn, vloeiend of punten.
  krachten: {"type":"krachten","voorwerp":"bloempot","schaalN":20,"puntLabel":"Z","pijlen":[{"naam":"Fz","grootteN":40,"hoek":270,"label":"Fz"}]} voorwerp is bloempot, boomstam, krat of geen. hoek 0 = rechts, 90 = omhoog, 270 = omlaag. Lege pijlen mag, als de leerling ze zelf moet bedenken.
  meter: {"type":"meter","soort":"wijzer","eenheid":"V","min":0,"max":10,"streep":1,"waarde":4.5} of {"type":"meter","soort":"kwh","waarde":1234.5,"cijfers":5,"decimalen":1}
  schakelschema: {"type":"schakelschema","bron":{"soort":"cel","label":"6 V"},"takken":[{"onderdelen":[{"soort":"lamp","label":"L1"}]},{"onderdelen":[{"soort":"schakelaar","label":"S"},{"soort":"lamp","label":"L2"}]}]} soort is lamp, schakelaar, weerstand, variabele-weerstand, spanningsmeter, stroommeter, motor, diode, led, zekering, cel of wisselbron. Hoogstens 4 takken, 3 onderdelen per tak.
  oscilloscoop: {"type":"oscilloscoop","hokjesX":8,"hokjesY":6,"notitie":"zelfde instelling","panelen":[{"label":"P","amplitude":1,"trillingstijd":4},{"label":"C","amplitude":2,"trillingstijd":2}]} amplitude in hokjes, trillingstijd in hokjes.
- Leesvragen: geen figuur. Nooit een foto.

OUTPUT
- Alleen JSON.
- { "title", "subject": "${vakTitel}", "questions": [{
    "type": "mc"|"open"|"invul",
    "skill": "stof"|"lees",
    "situation", "prompt",
    "correct": string,                 // mc: juiste optie-tekst
    "distractors": [string, string, string],
    "modelAnswer", "why",
    "acceptNumbers": number[],
    "acceptKeywords": string[],
    "stofLabel": string,
    "paragraafId": string,
    "figuur": object of null
  }] }`;
}

function userPrompt(data: GenerateInput): string {
  const soortLine =
    data.soort === "mc"
      ? "Alleen meerkeuze over de stof. Geen leesvragen."
      : data.soort === "open"
        ? "Alleen open vragen."
        : data.soort === "invul"
          ? "Alleen invulvragen met ___."
          : data.soort === "lees"
            ? "ALLEEN leesvragen. Elke vraag: eerst een korte vaktekst (5–8 zinnen), daarna één vraag over woord, verwijzing of hoofdzaak. Geen rekenen."
            : "Mix: meerkeuze, een paar open, een paar invul, én minstens een kwart leesvragen bij een vaktekst.";
  const klas = data.klas ? `Klas ${data.klas}.` : "";
  const niveau = [data.leerjaar ? `leerjaar ${data.leerjaar}` : "", data.niveau ? `niveau ${data.niveau}` : ""]
    .filter(Boolean)
    .join(", ");
  const h = data.hoofdstukId ? hoofdstukById(data.hoofdstukId) : undefined;
  const stof = h
    ? `Hoofdstuk: ${h.titel}. Paragrafen: ${
        (data.paragraafIds ?? [])
          .map((id) => h.paragrafen.find((p) => p.id === id)?.titel ?? id)
          .join(", ") || "alle"
      }.`
    : "";
  const lastig = data.lastig ? `De leerling vindt dit lastig: ${data.lastig}. Zet daar extra vragen op.` : "";
  const extra =
    data.mode === "extra"
      ? `Dit is extra oefening op zwakke stof. Andere getallen. Focus op: ${data.lastig || data.lesstof}.`
      : "";
  const regen =
    data.mode === "regen"
      ? `Nieuwe oefentoets over dezelfde stof. Andere getallen dan: ${data.previousTitle ?? "de vorige"}.`
      : "";
  if (data.mode === "docent") {
    return `${klas} ${niveau}
Maak een nakijksleutel bij deze LEERLINGTOETS. Behoud vragen en opties letterlijk.
Bij MC: zet de juiste optie-tekst in "correct" en de drie andere in "distractors".
${soortLine}

LEERLINGTOETS:
${data.lesstof}`;
  }
  const nova = novaLesstof(data.hoofdstukId, data.paragraafIds);
  const bio = bioLesstof(data.hoofdstukId);
  const boekstof = nova || bio;
  const bron = boekstof
    ? `LESSTOF (niet letterlijk overnemen; andere namen. Geen boekopdracht en geen uitwerking. Leesvragen: herschrijf een kort stuk vaktekst):\n${boekstof}`
    : `Lesstof of onderwerp:\n${data.lesstof || h?.titel || "dichtheid en snelheid"}`;
  const extraPlak = !boekstof && data.lesstof ? "" : data.lesstof && boekstof ? `\nExtra van de leerling:\n${data.lesstof}` : "";
  return `${klas} ${niveau} ${stof} ${lastig} ${extra} ${regen}
Maak ${data.count} vragen. ${soortLine}
${bron}${extraPlak}`;
}

function toQuestions(raw: z.infer<typeof AiToets>, data: GenerateInput): Question[] {
  return raw.questions.map((q, i) => {
    const stof = {
      hoofdstukId: data.hoofdstukId || "stof",
      paragraafId: q.paragraafId || data.paragraafIds?.[0] || "algemeen",
      label: q.stofLabel || hoofdstukById(data.hoofdstukId ?? "")?.titel || CURRICULUM.titel,
    };
    const figuur =
      q.skill === "lees" || data.vakId === "lees" || data.vakId === "biologie"
        ? undefined
        : (figuurUitJson(q.figuur) ?? undefined);
    if (q.type === "mc") {
      const correct = q.correct ?? q.modelAnswer;
      const distractors = (q.distractors ?? ["-", "-", "-"]) as [string, string, string];
      const mq: McQuestion = {
        id: `q${i + 1}`,
        type: "mc",
        situation: q.situation.trim(),
        prompt: q.prompt.trim(),
        points: 1,
        options: LETTERS.map((letter, j) => ({
          letter,
          text: j === 0 ? correct : distractors[j - 1] ?? "-",
        })),
        correctLetter: "A",
        modelAnswer: `A ${correct}`,
        why: q.why.trim(),
        skill: q.skill === "lees" ? "lees" : "stof",
        stof,
        ...(figuur ? { figuur } : {}),
      };
      return mq;
    }
    if (q.type === "invul") {
      const iq: InvulQuestion = {
        id: `q${i + 1}`,
        type: "invul",
        situation: q.situation.trim(),
        prompt: q.prompt.includes("___") ? q.prompt.trim() : `${q.prompt.trim()} ___`,
        points: 1,
        modelAnswer: q.modelAnswer.trim(),
        why: q.why.trim(),
        accept: {
          numbers: q.acceptNumbers,
          keywords: q.acceptKeywords,
          tolerance: 0.08,
        },
        skill: q.skill === "lees" ? "lees" : "stof",
        stof,
        ...(figuur ? { figuur } : {}),
      };
      return iq;
    }
    const oq: OpenQuestion = {
      id: `q${i + 1}`,
      type: "open",
      situation: q.situation.trim(),
      prompt: q.prompt.trim(),
      points: 2,
      modelAnswer: q.modelAnswer.trim(),
      why: q.why.trim(),
      accept: {
        numbers: q.acceptNumbers,
        keywords: q.acceptKeywords,
        tolerance: 0.08,
      },
      skill: q.skill === "lees" ? "lees" : "stof",
      stof,
      ...(figuur ? { figuur } : {}),
    };
    return oq;
  });
}

function extractJson(text: string): unknown {
  const trimmed = text.trim();
  const fence = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/);
  const body = fence ? fence[1].trim() : trimmed;
  const start = body.indexOf("{");
  const end = body.lastIndexOf("}");
  if (start === -1 || end === -1) throw new Error("Geen JSON");
  return JSON.parse(body.slice(start, end + 1));
}

function bronVan(data: GenerateInput, count: number): ToetsBron {
  return {
    kind: data.mode === "docent" ? "docent" : data.mode === "extra" ? "extra" : "zelf",
    topic: data.lesstof.slice(0, 80) || CURRICULUM.titel,
    raw: data.lesstof,
    count,
    soort: data.soort as VraagSoort,
    tijd: data.tijd,
    hoofdstukId: data.hoofdstukId,
    paragraafIds: data.paragraafIds,
    lastig: data.lastig,
    leerjaar: data.leerjaar,
    niveau: data.niveau,
    vakId: data.vakId,
  };
}

async function callGrok(data: GenerateInput): Promise<Toets | null> {
  const apiKey = process.env.XAI_API_KEY?.trim();
  if (!apiKey) return null;

  const res = await fetch("https://api.x.ai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "grok-4.5",
      temperature: 0.5,
      max_tokens: 6000,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: systemPrompt(vakOf(data.vakId).titel) },
        { role: "user", content: userPrompt(data) },
      ],
    }),
    signal: AbortSignal.timeout(22_000),
  });
  if (!res.ok) return null;
  const body = (await res.json()) as {
    choices?: { message?: { content?: string } }[];
  };
  const text = body.choices?.[0]?.message?.content ?? "";
  if (!text) return null;
  const parsed = AiToets.parse(extractJson(text));
  const rng = mulberry32(Date.now() % 1_000_000);
  let questions = toQuestions(parsed, data);
  if (data.soort === "mc") questions = questions.filter((q) => q.type === "mc" && q.skill !== "lees");
  if (data.soort === "open") questions = questions.filter((q) => q.type === "open");
  if (data.soort === "invul") questions = questions.filter((q) => q.type === "invul");
  if (data.soort === "lees") questions = questions.filter((q) => q.skill === "lees");
  if (data.mode !== "docent") {
    questions = shuffled(questions, rng).slice(0, data.count);
    questions = balanceMcLetters(questions, rng);
  }
  if (questions.length < 1) return null;
  questions = questions.map((q, i) => ({ ...q, id: `q${i + 1}` }));
  return {
    title: parsed.title,
    subject: parsed.subject ?? CURRICULUM.titel,
    questions,
    bron: bronVan(data, questions.length),
  };
}

function localFallback(data: GenerateInput): Toets | null {
  if (data.mode === "docent") {
    const parsed = parseLeerlingToets(data.lesstof, bronVan(data, data.count));
    if (!parsed) return null;
    if (parsed.missingKey.length === parsed.toets.questions.length) return null;
    return parsed.toets;
  }
  if (data.hoofdstukId || looksLikeDensityOrSpeed(data.lesstof) || data.lastig) {
    return bouwOefentoets({
      count: data.count,
      soort: data.soort,
      tijd: data.tijd,
      seed: Date.now() % 1_000_000,
      kind: data.mode === "extra" ? "extra" : "zelf",
      topic: data.lesstof.trim() || data.hoofdstukId || CURRICULUM.titel,
      hoofdstukId: data.hoofdstukId,
      paragraafIds: data.paragraafIds,
      lastig: data.lastig,
      leerjaar: data.leerjaar,
      niveau: data.niveau,
      vakId: data.vakId,
    });
  }
  return null;
}

function uitBank(vragen: Question[], data: GenerateInput): Toets {
  const rng = mulberry32(Date.now() % 1_000_000);
  let gekozen = shuffled(vragen, rng);
  if (data.soort === "mc") gekozen = gekozen.filter((q) => q.type === "mc" && q.skill !== "lees");
  if (data.soort === "open") gekozen = gekozen.filter((q) => q.type === "open");
  if (data.soort === "invul") gekozen = gekozen.filter((q) => q.type === "invul");
  if (data.soort === "lees") gekozen = gekozen.filter((q) => q.skill === "lees");
  gekozen = balanceMcLetters(gekozen.slice(0, data.count), rng).map((q, i) => ({ ...q, id: `q${i + 1}` }));
  const titel = hoofdstukById(data.hoofdstukId ?? "", data.vakId)?.titel;
  return {
    title: titel ? `Oefentoets ${titel}` : "Oefentoets",
    subject: vakOf(data.vakId).titel,
    questions: gekozen,
    bron: bronVan(data, gekozen.length),
  };
}

export const generateToets = createServerFn({ method: "POST" })
  .validator((input: unknown) => InputSchema.parse(input))
  .handler(async ({ data }): Promise<GenerateResult> => {
    const vakId = data.vakId || "nask";
    if (vakId === "biologie" && data.mode !== "docent") {
      const lokaal = localFallback(data);
      if (lokaal && lokaal.questions.length >= Math.min(4, data.count)) {
        return { ok: true, toets: lokaal, usedAi: false };
      }
    }
    const magBank = data.mode !== "docent" && vakId !== "lees";
    let voorraad: Question[] = [];
    if (magBank) {
      try {
        await zorgVoorZaad();
        voorraad = await pakVragen({
          vakId,
          hoofdstukId: data.hoofdstukId,
          paragraafIds: data.paragraafIds,
          soort: data.soort,
        });
        if (bankIsRijp(voorraad.length)) {
          const toets = uitBank(voorraad, data);
          if (toets.questions.length >= Math.min(4, data.count)) {
            return { ok: true, toets, usedAi: false };
          }
        }
      } catch {
        voorraad = [];
      }
    }
    try {
      const ai = await callGrok(data);
      if (ai) {
        if (magBank) {
          void bewaarVragen(ai.questions, "ai", vakId).catch(() => undefined);
        }
        return { ok: true, toets: ai, usedAi: true };
      }
    } catch {
      // val terug
    }
    if (voorraad.length >= Math.min(4, data.count)) {
      return { ok: true, toets: uitBank(voorraad, data), usedAi: false };
    }
    const local = localFallback(data);
    if (local) {
      if (magBank) void bewaarVragen(local.questions, "demo", vakId).catch(() => undefined);
      return { ok: true, toets: local, usedAi: false };
    }
    return {
      ok: false,
      error:
        "Deze stof kan nu niet omgezet worden. Kies een hoofdstuk of start de demo.",
    };
  });
