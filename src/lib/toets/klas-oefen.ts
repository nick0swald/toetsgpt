import { bouwKlasBank } from "./klas-bank.ts";
import { SHOW_KLAS_FIGUREN } from "./klas-figuren-flag.ts";
import { KLAS_TOPICS } from "./klas-oefen-topics.ts";
import { familieVan, neemMix } from "./oefen-maak.ts";
import { balanceMcLetters, mulberry32, shuffled } from "./shuffle.ts";
import type { Question, Toets } from "./types.ts";

export { SHOW_KLAS_FIGUREN } from "./klas-figuren-flag.ts";
export { KLAS_TOPICS, type KlasTopicId } from "./klas-oefen-topics.ts";

function filterFocus(pool: Question[], focusIds?: string[]): Question[] {
  if (!focusIds?.length) return pool;
  const set = new Set(focusIds);
  const hit = pool.filter(
    (q) => q.stof && (set.has(q.stof.paragraafId) || set.has(q.stof.hoofdstukId)),
  );
  return hit.length >= 3 ? hit : pool;
}

/** Klasoefening H10 + H14 (~10 vragen) uit een grote originele bank. */
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
  const pool = filterFocus(bouwKlasBank(rng), opts.focusTopicIds);
  let picked = neemMix(pool, count, rng);

  if (!isReparatie) {
    const have = new Set(picked.map((q) => q.stof?.paragraafId).filter(Boolean));
    if (have.size < 5) {
      const extra = shuffled(pool, rng).filter((q) => q.stof && !have.has(q.stof.paragraafId));
      for (const q of extra) {
        const idx = picked.findIndex((p) => p.stof?.paragraafId === picked[0]?.stof?.paragraafId);
        if (picked.some((p) => p.id === q.id)) continue;
        if (picked.some((p) => familieVan(p.id) === familieVan(q.id))) continue;
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
