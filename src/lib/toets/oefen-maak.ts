import { assembleMc, pick, shuffled, type Rng } from "./shuffle.ts";
import type { Letter, OpenQuestion, Question, StofTag } from "./types.ts";

export const OEFEN_NAMEN = [
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
  "Omar",
  "Sara",
  "Luca",
  "Nienke",
] as const;

export type VraagMaker = (rng: Rng) => Question;

export function naamVan(rng: Rng): string {
  return pick(rng, OEFEN_NAMEN);
}

export function r1(n: number): number {
  return Math.round(n * 10) / 10;
}

export function mcVraag(opts: {
  id: string;
  situation: string;
  prompt: string;
  why: string;
  stof: StofTag;
  correct: string;
  distractors: [string, string, string];
  figuurId?: string;
  figuurBijschrift?: string;
  skill?: "stof" | "lees";
}): Question {
  const q = assembleMc(
    {
      id: opts.id,
      situation: opts.situation,
      prompt: opts.prompt,
      why: opts.why,
      stof: opts.stof,
      skill: opts.skill,
      correct: opts.correct,
      distractors: opts.distractors,
    },
    "A" as Letter,
  );
  if (!opts.figuurId) return q;
  return { ...q, figuurId: opts.figuurId, figuurBijschrift: opts.figuurBijschrift };
}

export function openVraag(opts: {
  id: string;
  situation: string;
  prompt: string;
  points: number;
  modelAnswer: string;
  why: string;
  accept: OpenQuestion["accept"];
  stof: StofTag;
  figuurId?: string;
  figuurBijschrift?: string;
  skill?: "stof" | "lees";
}): OpenQuestion {
  return {
    id: opts.id,
    type: "open",
    situation: opts.situation,
    prompt: opts.prompt,
    points: opts.points,
    modelAnswer: opts.modelAnswer,
    why: opts.why,
    accept: opts.accept,
    stof: opts.stof,
    ...(opts.skill ? { skill: opts.skill } : {}),
    ...(opts.figuurId ? { figuurId: opts.figuurId, figuurBijschrift: opts.figuurBijschrift } : {}),
  };
}

export function familieVan(id: string): string {
  return id.replace(/-\d+$/, "");
}

/** Mix MC/open; hoogstens één item per vraagfamilie (prefix zonder volgnummer). */
export function neemMix(items: Question[], n: number, rng: Rng): Question[] {
  const uniq = (list: Question[]) => {
    const seen = new Set<string>();
    return list.filter((q) => {
      const f = familieVan(q.id);
      if (seen.has(f)) return false;
      seen.add(f);
      return true;
    });
  };
  const mc = uniq(
    shuffled(
      items.filter((q) => q.type === "mc"),
      rng,
    ),
  );
  const open = uniq(
    shuffled(
      items.filter((q) => q.type === "open"),
      rng,
    ),
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
  if (out.length < n) {
    const have = new Set(out.map((q) => q.id));
    for (const q of shuffled(items, rng)) {
      if (out.length >= n) break;
      if (have.has(q.id)) continue;
      out.push(q);
      have.add(q.id);
    }
  }
  return out;
}

export function mcFamilie(
  prefix: string,
  stof: StofTag,
  rows: ReadonlyArray<{
    sit: (n: string) => string;
    prompt: string;
    why: string;
    correct: string;
    distractors: [string, string, string];
    figuurId?: string;
    figuurBijschrift?: string;
    skill?: "stof" | "lees";
  }>,
): VraagMaker[] {
  return rows.map((row, i) => (rng) =>
    mcVraag({
      id: `${prefix}-${i + 1}`,
      situation: row.sit(naamVan(rng)),
      prompt: row.prompt,
      why: row.why,
      stof,
      correct: row.correct,
      distractors: row.distractors,
      figuurId: row.figuurId,
      figuurBijschrift: row.figuurBijschrift,
      skill: row.skill,
    }),
  );
}
