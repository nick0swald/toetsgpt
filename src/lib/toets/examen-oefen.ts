import { bouwExamenBank } from "./examen-bank.ts";
import { ceOnderdeelById, ceOnderdelen } from "./examenstof.ts";
import { familieVan, neemMix } from "./oefen-maak.ts";
import { balanceMcLetters, mulberry32, shuffled } from "./shuffle.ts";
import type { Question, Toets } from "./types.ts";

function filterFocus(pool: Question[], focusIds?: string[]): Question[] {
  if (!focusIds?.length) return pool;
  const set = new Set(focusIds);
  const hit = pool.filter((q) => q.stof && set.has(q.stof.hoofdstukId));
  return hit.length >= 4 ? hit : pool;
}

/** CE-stijl oefentoets (~10 vragen) uit een grote originele bank. Geen letterlijke examenblad-items. */
export function bouwExamenOefening(opts: {
  niveau: string;
  seed?: number;
  focusOnderdeelIds?: string[];
}): Toets {
  const seed = opts.seed ?? Date.now() % 1_000_000;
  const rng = mulberry32(seed);
  const count = 10;
  const full = bouwExamenBank(rng);
  const leesPool = full.filter((q) => q.skill === "lees");
  const stofPool = filterFocus(
    full.filter((q) => q.skill !== "lees"),
    opts.focusOnderdeelIds,
  );
  const leesN = Math.min(3, Math.max(2, leesPool.length ? 2 + (rng() > 0.5 ? 1 : 0) : 0));
  const leesPicked = neemMix(leesPool, leesN, rng);
  const stofN = count - leesPicked.length;
  const stofPicked = neemMix(stofPool, stofN, rng);
  const picked: Question[] = [...stofPicked, ...leesPicked];
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
        if (picked.some((p) => familieVan(p.id) === familieVan(q.id))) continue;
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
