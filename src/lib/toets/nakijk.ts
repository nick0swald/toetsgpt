import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import type { Nakijk, Question, Toets, ToetsUitslag } from "./types";

const VraagIn = z.object({
  paragraafId: z.string().max(40),
  label: z.string().max(80),
  lees: z.boolean(),
  vraag: z.string().max(280),
  juist: z.string().max(180),
  antwoord: z.string().max(180),
  punten: z.number(),
  max: z.number(),
});

const Input = z.object({
  vak: z.string().max(40),
  vragen: z.array(VraagIn).min(1).max(12),
});

const Out = z.object({
  zinnen: z.string().min(8).max(420),
  volgende: z.enum(["stof", "lees"]),
  lastigIds: z.array(z.string().max(40)).max(3),
});

export type NakijkIn = z.infer<typeof Input>;
export type NakijkResult = { ok: true; nakijk: Nakijk } | { ok: false };

function kort(text: string, max: number): string {
  const clean = text.replace(/\s+/g, " ").trim();
  if (clean.length <= max) return clean;
  return `${clean.slice(0, max - 1)}…`;
}

function antwoordVan(question: Question, given: string): string {
  const value = given.trim();
  if (!value) return "(leeg)";
  if (question.type !== "mc") return kort(value, 180);
  const opt = question.options.find((o) => o.letter === value.toUpperCase());
  return kort(opt ? `${value}: ${opt.text}` : value, 180);
}

export function pakketVan(toets: Toets, uitslag: ToetsUitslag): NakijkIn {
  const ranked = [...uitslag.perVraag].sort((a, b) => a.points / a.max - b.points / b.max);
  return {
    vak: toets.subject || toets.bron.vakId || "oefentoets",
    vragen: ranked.slice(0, 12).map((v) => ({
      paragraafId: v.question.stof?.paragraafId || (v.question.skill === "lees" ? "lees-vaktekst" : "stof"),
      label: v.question.stof?.label || (v.question.skill === "lees" ? "Vaktekst lezen" : "Stof"),
      lees: v.question.skill === "lees",
      vraag: kort(`${v.question.situation} ${v.question.prompt}`, 280),
      juist: kort(v.question.modelAnswer || v.question.why, 180),
      antwoord: antwoordVan(v.question, v.given),
      punten: v.points,
      max: v.max,
    })),
  };
}

export function nakijkUit(raw: unknown, ids: Set<string>): Nakijk | null {
  const parsed = Out.safeParse(raw);
  if (!parsed.success) return null;
  const lastigIds = parsed.data.lastigIds.filter((id) => ids.has(id) && id !== "lees-vaktekst").slice(0, 3);
  return { zinnen: parsed.data.zinnen.trim(), volgende: parsed.data.volgende, lastigIds };
}

function systeem(): string {
  return `Je kijkt één gemaakte oefentoets van een vmbo-leerling na. De punten staan vast. Die reken je niet opnieuw uit.

SCHEID
- stof: de leerling las de vraag, maar de kennis klopt niet of is te dun.
- lees: de leerling las de vraag of de tekst niet. Het antwoord gaat over iets anders, of het is alleen een overgeschreven woord.

VOLGENDE
- "lees" als mislezen vaker of erger is dan een kennishiaat.
- "stof" als de leerling de vraag snapte maar de stof miste.

lastigIds: alleen paragraafIds uit de input, waar de stof niet zit. Maximaal 3. Geen lees-id.
zinnen: 2 of 3 korte zinnen tegen de leerling (je). Wat goed ging, wat nog niet, en wat de volgende ronde is. Geen puntenlijst. Geen volledig juist antwoord. Geen schoolnaam.

Antwoord alleen als JSON {"zinnen":"...","volgende":"stof" of "lees","lastigIds":["..."]}.`;
}

async function grok(apiKey: string, body: unknown): Promise<Response> {
  return fetch("https://api.x.ai/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(16_000),
  });
}

export const nakijkRonde = createServerFn({ method: "POST" })
  .validator((input: unknown) => Input.parse(input))
  .handler(async ({ data }): Promise<NakijkResult> => {
    const apiKey = process.env.XAI_API_KEY?.trim();
    if (!apiKey) return { ok: false };
    const ids = new Set(data.vragen.map((v) => v.paragraafId));
    const payload = {
      model: "grok-4.5",
      temperature: 0.2,
      max_tokens: 320,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: systeem() },
        { role: "user", content: JSON.stringify({ vak: data.vak, vragen: data.vragen }) },
      ],
    };
    try {
      let res = await grok(apiKey, payload);
      if (!res.ok && res.status >= 500) res = await grok(apiKey, payload);
      if (!res.ok) return { ok: false };
      const body = (await res.json()) as { choices?: { message?: { content?: string } }[] };
      const text = body.choices?.[0]?.message?.content ?? "";
      const m = /\{[\s\S]*\}/.exec(text);
      if (!m) return { ok: false };
      const nakijk = nakijkUit(JSON.parse(m[0]), ids);
      return nakijk ? { ok: true, nakijk } : { ok: false };
    } catch {
      return { ok: false };
    }
  });
