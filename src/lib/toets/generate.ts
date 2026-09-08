import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { bouwOefentoets, looksLikeDensityOrSpeed } from "./demo";
import { parseLeerlingToets } from "./parse-paste";
import { balanceMcLetters, mulberry32, shuffled } from "./shuffle";
import type { InvulQuestion, McQuestion, OpenQuestion, Question, Toets, ToetsBron, VraagSoort } from "./types";
import { LETTERS } from "./types";
import { CURRICULUM, hoofdstukById } from "./stof";

const InputSchema = z.object({
  mode: z.enum(["zelf", "docent", "regen", "extra"]),
  naam: z.string().max(40).optional(),
  klas: z.string().max(12).optional(),
  lesstof: z.string().max(8000),
  count: z.number().int().min(4).max(12),
  soort: z.enum(["auto", "mix", "mc", "open", "invul"]),
  tijd: z.enum(["kort", "10", "15", "20"]),
  previousTitle: z.string().max(120).optional(),
  leerjaar: z.string().max(4).optional(),
  niveau: z.string().max(4).optional(),
  hoofdstukId: z.string().max(40).optional(),
  paragraafIds: z.array(z.string().max(40)).max(12).optional(),
  lastig: z.string().max(400).optional(),
});

export type GenerateInput = z.infer<typeof InputSchema>;

export type GenerateResult =
  | { ok: true; toets: Toets; usedAi: boolean }
  | { ok: false; error: string };

const AiQuestion = z.object({
  type: z.enum(["mc", "open", "invul"]),
  situation: z.string().min(8).max(600),
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
});

const AiToets = z.object({
  title: z.string().min(4).max(80),
  subject: z.string().min(2).max(40).optional(),
  questions: z.array(AiQuestion).min(4).max(12),
});

function systemPrompt(): string {
  return `Je maakt een korte oefentoets voor VMBO-leerlingen (BB/KB/GT) van Ares058 in Leeuwarden, vak ${CURRICULUM.vak}. Docent: Nick Oswald.

VORM
- Cito-stijl: EERST een situatieschets, DAARNA de vraag. Nooit andersom.
- Taal: kort, nuchter, VMBO. Geen emoji. Geen knipoog. Geen grappen.
- Vragen nooit 1:1 uit een boek. Andere namen, andere getallen, andere situaties.
- Niet luguber. Niemand valt, botst of raakt gewond. Gebruik een steen, bal of kist.

VRAAGTYPES
- Mix: meerkeuze, open/bereken, en invul (één gat ___ in een korte zin).
- Meerkeuze: geef "correct" (juiste tekst) en "distractors" (precies 3 foute teksten). GEEN letters A–D. De volgorde wordt later bepaald.
- MC max 1 punt. Invul 1 punt. Open 2 punten.
- Invul: prompt bevat precies één ___.
- why: ÉÉN korte zin.

OUTPUT
- Alleen JSON.
- { "title", "subject": "${CURRICULUM.vak}", "questions": [{
    "type": "mc"|"open"|"invul",
    "situation", "prompt",
    "correct": string,                 // mc: juiste optie-tekst
    "distractors": [string, string, string],
    "modelAnswer", "why",
    "acceptNumbers": number[],
    "acceptKeywords": string[],
    "stofLabel": string,
    "paragraafId": string
  }] }`;
}

function userPrompt(data: GenerateInput): string {
  const soortLine =
    data.soort === "mc"
      ? "Alleen meerkeuze."
      : data.soort === "open"
        ? "Alleen open vragen."
        : data.soort === "invul"
          ? "Alleen invulvragen met ___."
          : "Mix: meerkeuze, een paar open, een paar invul.";
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
  return `${klas} ${niveau} ${stof} ${lastig} ${extra} ${regen}
Maak ${data.count} vragen. ${soortLine}
Lesstof of onderwerp:
${data.lesstof || h?.titel || "dichtheid en snelheid"}`;
}

function toQuestions(raw: z.infer<typeof AiToets>, data: GenerateInput): Question[] {
  return raw.questions.map((q, i) => {
    const stof = {
      hoofdstukId: data.hoofdstukId || "stof",
      paragraafId: q.paragraafId || data.paragraafIds?.[0] || "algemeen",
      label: q.stofLabel || hoofdstukById(data.hoofdstukId ?? "")?.titel || CURRICULUM.vak,
    };
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
        stof,
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
        stof,
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
      stof,
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
    topic: data.lesstof.slice(0, 80) || CURRICULUM.vak,
    raw: data.lesstof,
    count,
    soort: data.soort as VraagSoort,
    tijd: data.tijd,
    hoofdstukId: data.hoofdstukId,
    paragraafIds: data.paragraafIds,
    lastig: data.lastig,
    leerjaar: data.leerjaar,
    niveau: data.niveau,
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
      temperature: 0.7,
      max_tokens: 3500,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: systemPrompt() },
        { role: "user", content: userPrompt(data) },
      ],
    }),
    signal: AbortSignal.timeout(12_000),
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
  if (data.soort === "mc") questions = questions.filter((q) => q.type === "mc");
  if (data.soort === "open") questions = questions.filter((q) => q.type === "open");
  if (data.soort === "invul") questions = questions.filter((q) => q.type === "invul");
  if (data.mode !== "docent") {
    questions = shuffled(questions, rng).slice(0, data.count);
    questions = balanceMcLetters(questions, rng);
  }
  if (questions.length < 1) return null;
  questions = questions.map((q, i) => ({ ...q, id: `q${i + 1}` }));
  return {
    title: parsed.title,
    subject: parsed.subject ?? CURRICULUM.vak,
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
      topic: data.lesstof.trim() || data.hoofdstukId || CURRICULUM.vak,
      hoofdstukId: data.hoofdstukId,
      paragraafIds: data.paragraafIds,
      lastig: data.lastig,
      leerjaar: data.leerjaar,
      niveau: data.niveau,
    });
  }
  return null;
}

export const generateToets = createServerFn({ method: "POST" })
  .validator((input: unknown) => InputSchema.parse(input))
  .handler(async ({ data }): Promise<GenerateResult> => {
    try {
      const ai = await callGrok(data);
      if (ai) return { ok: true, toets: ai, usedAi: true };
    } catch {
      // val terug
    }
    const local = localFallback(data);
    if (local) return { ok: true, toets: local, usedAi: false };
    return {
      ok: false,
      error:
        "Deze stof kan nu niet omgezet worden. Kies een hoofdstuk of start de demo.",
    };
  });
