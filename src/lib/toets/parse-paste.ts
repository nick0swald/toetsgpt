import { extractNumbers, parseNlGetal } from "./format";
import { CURRICULUM } from "./stof";
import type { Letter, McQuestion, OpenQuestion, Question, Toets, ToetsBron } from "./types";
import { LETTERS } from "./types";

const SLEUTEL_RE = /\n\s*(?:SLEUTEL|ANTWOORDEN|NAKLIJKMODEL|NAKIJKSLEUTEL)\s*:?\s*\n/i;

type ParsedBlock = {
  n: number;
  body: string;
};

function splitSleutel(raw: string): { blad: string; sleutel: string | null } {
  const m = raw.search(SLEUTEL_RE);
  if (m === -1) return { blad: raw.trim(), sleutel: null };
  return {
    blad: raw.slice(0, m).trim(),
    sleutel: raw.slice(m).replace(SLEUTEL_RE, "").trim(),
  };
}

function splitVragen(blad: string): ParsedBlock[] {
  const lines = blad.replace(/\r\n/g, "\n").trim();
  const re = /(?:^|\n)\s*(?:vraag\s*)?(\d{1,2})[.)]\s+/gi;
  const idxs: { n: number; start: number; bodyAt: number }[] = [];
  let m: RegExpExecArray | null;
  while ((m = re.exec(lines))) {
    idxs.push({
      n: Number(m[1]),
      start: m.index + (m[0].startsWith("\n") ? 1 : 0),
      bodyAt: m.index + m[0].length,
    });
  }
  if (idxs.length === 0) return [];
  return idxs.map((item, i) => {
    const end = idxs[i + 1]?.start ?? lines.length;
    return { n: item.n, body: lines.slice(item.bodyAt, end).trim() };
  });
}

function parseOptions(body: string): { stem: string; options: { letter: Letter; text: string }[] } {
  const optRe = /(?:^|\n)\s*([A-D])(?:[.)]\s+|\s{1,3})(.+)/g;
  const options: { letter: Letter; text: string }[] = [];
  let firstOpt = -1;
  let m: RegExpExecArray | null;
  const src = body.trim();
  while ((m = optRe.exec(src))) {
    if (firstOpt === -1) firstOpt = m.index + (m[0].startsWith("\n") ? 1 : 0);
    options.push({ letter: m[1] as Letter, text: m[2].trim() });
  }
  if (options.length >= 2) {
    const stem = src.slice(0, Math.max(0, firstOpt)).trim();
    return { stem, options: options.slice(0, 4) };
  }
  return { stem: src, options: [] };
}

function splitSituation(stem: string): { situation: string; prompt: string } {
  const text = stem.replace(/\n{2,}/g, "\n").trim();
  const parts = text.split(/\n+/).map((p) => p.trim()).filter(Boolean);
  if (parts.length >= 2) {
    return {
      situation: parts.slice(0, -1).join(" "),
      prompt: parts[parts.length - 1] ?? text,
    };
  }
  const sentences = text.split(/(?<=[.?!])\s+/);
  if (sentences.length >= 2) {
    return {
      situation: sentences.slice(0, -1).join(" "),
      prompt: sentences[sentences.length - 1] ?? text,
    };
  }
  return { situation: text, prompt: "Beantwoord de vraag." };
}

function parseSleutelMap(sleutel: string | null): Map<number, string> {
  const map = new Map<number, string>();
  if (!sleutel) return map;
  const re = /(\d{1,2})[.)]?\s*[:.]?\s*([A-D]|[^\n]+)/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(sleutel))) {
    map.set(Number(m[1]), m[2].trim());
  }
  return map;
}

function letterFromKey(raw: string): Letter | null {
  const t = raw.trim().toUpperCase();
  const hit = t.match(/^([A-D])\b/);
  if (hit) return hit[1] as Letter;
  return null;
}

export function parseLeerlingToets(
  raw: string,
  bron: ToetsBron,
): { toets: Toets; missingKey: number[] } | null {
  const { blad, sleutel } = splitSleutel(raw);
  const blocks = splitVragen(blad);
  if (blocks.length === 0) return null;
  const keys = parseSleutelMap(sleutel);
  const missingKey: number[] = [];

  const questions: Question[] = blocks.map((b, i) => {
    const { stem, options } = parseOptions(b.body);
    const { situation, prompt } = splitSituation(stem);
    const keyRaw = keys.get(b.n) ?? "";
    if (options.length >= 2) {
      const padded = [...options];
      while (padded.length < 4) {
        padded.push({
          letter: LETTERS[padded.length] as Letter,
          text: "Geen van de andere antwoorden.",
        });
      }
      const givenLetter = letterFromKey(keyRaw);
      const correctLetter = givenLetter ?? "A";
      if (!givenLetter) missingKey.push(b.n);
      const correctOpt = padded.find((o) => o.letter === correctLetter);
      const q: McQuestion = {
        id: `q${i + 1}`,
        type: "mc",
        situation,
        prompt,
        points: 1,
        options: padded.slice(0, 4),
        correctLetter,
        modelAnswer: correctOpt ? `${correctLetter} ${correctOpt.text}` : correctLetter,
        why: givenLetter
          ? `Het juiste alternatief is ${givenLetter}.`
          : "Geen sleutel bij deze vraag.",
      };
      return q;
    }

    const nums = extractNumbers(keyRaw);
    const open: OpenQuestion = {
      id: `q${i + 1}`,
      type: "open",
      situation,
      prompt,
      points: 2,
      modelAnswer: keyRaw || "Zie je uitwerking.",
      why: keyRaw
        ? `Het gevraagde antwoord is ${keyRaw}.`
        : "Geen sleutel bij deze vraag.",
      accept: nums.length
        ? { numbers: nums, tolerance: 0.08 }
        : { keywords: keyRaw ? keyRaw.split(/\s+/).filter((w) => w.length > 3) : [] },
    };
    if (!keyRaw) missingKey.push(b.n);
    return open;
  });

  const firstLine = blad.split("\n")[0]?.trim() ?? "Oefentoets";
  const title =
    firstLine.length > 4 && firstLine.length < 80 ? firstLine : "Toets van de docent";

  return {
    toets: {
      title,
      subject: CURRICULUM.vak,
      questions,
      bron: { ...bron, raw: blad, kind: "docent", count: questions.length },
    },
    missingKey,
  };
}

export function sleutelInvullen(toets: Toets, keys: Record<string, string>): Toets {
  return {
    ...toets,
    questions: toets.questions.map((q) => {
      const k = keys[q.id];
      if (!k) return q;
      if (q.type === "mc") {
        const letter = letterFromKey(k);
        if (!letter) return q;
        const opt = q.options.find((o) => o.letter === letter);
        return {
          ...q,
          correctLetter: letter,
          modelAnswer: opt ? `${letter} ${opt.text}` : letter,
          why: q.why || `Het juiste alternatief is ${letter}.`,
        };
      }
      const n = parseNlGetal(k);
      return {
        ...q,
        modelAnswer: k,
        why: q.why || `Het gevraagde antwoord is ${k}.`,
        accept: n !== null ? { numbers: [n], tolerance: 0.08 } : { keywords: [k] },
      };
    }),
  };
}
