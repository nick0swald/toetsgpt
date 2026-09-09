import type { Letter, McQuestion, Question } from "./types";
import { LETTERS } from "./types";

export type Rng = () => number;

export function mulberry32(seed: number): Rng {
  let a = seed >>> 0;
  return () => {
    a += 0x6d2b79f5;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function pick<T>(rng: Rng, items: readonly T[]): T {
  return items[Math.floor(rng() * items.length)] as T;
}

export function shuffleInPlace<T>(items: T[], rng: Rng): T[] {
  for (let i = items.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    const tmp = items[i] as T;
    items[i] = items[j] as T;
    items[j] = tmp;
  }
  return items;
}

export function shuffled<T>(items: readonly T[], rng: Rng): T[] {
  return shuffleInPlace([...items], rng);
}

/** Genereer eerst juist + afleiders, daarna de volgorde. Juiste letter is `slot`. */
export function placeMcOptions(
  correct: string,
  distractors: readonly string[],
  slot: Letter,
): Pick<McQuestion, "options" | "correctLetter" | "modelAnswer"> {
  const others = LETTERS.filter((l) => l !== slot);
  const wrongs = distractors.slice(0, 3);
  const byLetter: Record<Letter, string> = { A: "", B: "", C: "", D: "" };
  byLetter[slot] = correct;
  others.forEach((l, i) => {
    byLetter[l] = wrongs[i] ?? "Geen van de andere antwoorden.";
  });
  const options = LETTERS.map((letter) => ({ letter, text: byLetter[letter] }));
  return {
    options,
    correctLetter: slot,
    modelAnswer: `${slot} ${correct}`,
  };
}

export function mcCorrectText(question: McQuestion): string {
  return question.options.find((o) => o.letter === question.correctLetter)?.text ?? "";
}

export function mcDistractors(question: McQuestion): string[] {
  return question.options.filter((o) => o.letter !== question.correctLetter).map((o) => o.text);
}

/** Verdeel juiste letters zo gelijk mogelijk over A–D. Geen cluster van B. */
export function balancedSlots(mcCount: number, rng: Rng): Letter[] {
  const bag: Letter[] = [];
  while (bag.length < mcCount) {
    bag.push(...shuffled(LETTERS, rng));
  }
  return bag.slice(0, mcCount);
}

export function relocateMc(question: McQuestion, slot: Letter): McQuestion {
  const placed = placeMcOptions(mcCorrectText(question), mcDistractors(question), slot);
  return { ...question, ...placed };
}

export function balanceMcLetters(questions: Question[], rng: Rng): Question[] {
  const slots = balancedSlots(
    questions.filter((q) => q.type === "mc").length,
    rng,
  );
  let i = 0;
  return questions.map((q) => {
    if (q.type !== "mc") return q;
    const slot = slots[i] ?? pick(rng, LETTERS);
    i += 1;
    return relocateMc(q, slot);
  });
}

export function assembleMc(
  base: Omit<McQuestion, "options" | "correctLetter" | "modelAnswer" | "type" | "points"> & {
    correct: string;
    distractors: [string, string, string];
  },
  slot: Letter,
): McQuestion {
  const placed = placeMcOptions(base.correct, base.distractors, slot);
  return {
    id: base.id,
    type: "mc",
    situation: base.situation,
    prompt: base.prompt,
    why: base.why,
    stof: base.stof,
    skill: base.skill,
    points: 1,
    ...placed,
  };
}
