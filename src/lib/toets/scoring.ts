import { extractNumbers, normalizeText } from "./format";
import { LEES_TAG } from "./lees";
import type {
  Diagnose,
  InvulQuestion,
  OpenQuestion,
  Question,
  StofScore,
  StofTag,
  Toets,
  ToetsUitslag,
  VraagUitslag,
} from "./types";

/** Gebroken lineair: 1,0 bij 0%, 5,5 bij cesuur 55%, 10,0 bij 100%. */
export function cijferVanScore(behaald: number, totaal: number, cesuur = 0.55): number {
  if (totaal <= 0) return 1;
  const p = Math.min(1, Math.max(0, behaald / totaal));
  let g: number;
  if (p < cesuur) {
    g = 1 + (p / cesuur) * 4.5;
  } else {
    g = 5.5 + ((p - cesuur) / (1 - cesuur)) * 4.5;
  }
  return Math.round(g * 10) / 10;
}

function gradeText(question: OpenQuestion | InvulQuestion, raw: string): number {
  const text = raw.trim();
  if (!text) return 0;
  const max = question.points;
  const accept = question.accept;

  if (accept.numbers && accept.numbers.length > 0) {
    const nums = extractNumbers(text);
    if (nums.length === 0) return 0;
    const tol = accept.tolerance ?? 0.05;
    const closeEnough = (target: number, guess: number) => {
      const slack = Math.max(tol, Math.abs(target) * 0.02);
      return Math.abs(guess - target) <= slack;
    };
    const allHit = accept.numbers.every((n) => nums.some((g) => closeEnough(n, g)));
    if (allHit) return max;
    const anyHit = accept.numbers.some((n) => nums.some((g) => closeEnough(n, g)));
    if (anyHit && max >= 2) return max / 2;
    return 0;
  }

  const kws = accept.keywords ?? [];
  if (kws.length === 0) return 0;
  const hay = normalizeText(text);
  const hits = kws.filter((k) => keywordHit(hay, k));
  if (hits.length === 0) return 0;
  if (hits.length >= Math.ceil(kws.length * 0.5)) return max;
  return max >= 2 ? max / 2 : 0;
}

function keywordHit(hay: string, kw: string): boolean {
  const k = normalizeText(kw);
  if (!k) return false;
  if (k.length <= 2) {
    return hay === k || hay.split(" ").includes(k);
  }
  return hay.includes(k);
}

export function gradeQuestion(question: Question, given: string): VraagUitslag {
  const value = given.trim();
  if (question.type === "mc") {
    const correct = value.toUpperCase() === question.correctLetter;
    return {
      question,
      given: value,
      correct,
      points: correct ? 1 : 0,
      max: 1,
    };
  }
  const points = gradeText(question, value);
  return {
    question,
    given: value,
    correct: points >= question.points,
    points,
    max: question.points,
  };
}

export function diagnoseVan(perVraag: VraagUitslag[]): Diagnose {
  const map = new Map<string, { tag: StofTag; behaald: number; totaal: number }>();
  for (const v of perVraag) {
    const tag = v.question.stof;
    if (tag) {
      const cur = map.get(tag.paragraafId) ?? { tag, behaald: 0, totaal: 0 };
      cur.behaald += v.points;
      cur.totaal += v.max;
      map.set(tag.paragraafId, cur);
    }
    if (v.question.skill === "lees") {
      const cur = map.get(LEES_TAG.paragraafId) ?? { tag: LEES_TAG, behaald: 0, totaal: 0 };
      cur.behaald += v.points;
      cur.totaal += v.max;
      map.set(LEES_TAG.paragraafId, cur);
    }
  }
  const perStof: StofScore[] = [...map.values()];
  const lastig = perStof.filter((s) => s.totaal > 0 && s.behaald / s.totaal < 0.55);
  return { perStof, lastig };
}

export function gradeToets(toets: Toets, answers: Record<string, string>): ToetsUitslag {
  const perVraag = toets.questions.map((q) => gradeQuestion(q, answers[q.id] ?? ""));
  const behaald = perVraag.reduce((s, v) => s + v.points, 0);
  const totaal = perVraag.reduce((s, v) => s + v.max, 0);
  return {
    behaald,
    totaal,
    cijfer: cijferVanScore(behaald, totaal),
    perVraag,
    diagnose: diagnoseVan(perVraag),
  };
}

export function totaalPunten(toets: Toets): number {
  return toets.questions.reduce((s, q) => s + q.points, 0);
}
