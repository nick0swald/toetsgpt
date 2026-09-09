import gt3a from "./nova-books/gt3-a.json";

type NovaPage = {
  p: number;
  h: number | null;
  s: number | null;
  t: string;
};

type NovaBookFile = {
  id: string;
  book: string;
  pages: NovaPage[];
};

const GT3_A = gt3a as NovaBookFile;

/** Alleen Nova 3GT deel A (H1–H4). */
export function hoofdstukHeeftBoek(id: string | undefined): boolean {
  return Boolean(id && /^gt3-[1-4]$/.test(id));
}

function paraNummers(hoofdstukId: string, paragraafIds?: string[]): number[] {
  const prefix = `${hoofdstukId}-`;
  return (paragraafIds ?? [])
    .map((id) => (id.startsWith(prefix) ? Number(id.slice(prefix.length)) : NaN))
    .filter((n) => Number.isFinite(n) && n > 0);
}

/** Korte lesstof uit het geladen Nova-deel, voor de vragenmaker. */
export function novaLesstof(hoofdstukId?: string, paragraafIds?: string[], max = 6000): string {
  if (!hoofdstukHeeftBoek(hoofdstukId) || !hoofdstukId) return "";
  const h = Number(hoofdstukId.slice(4));
  const want = paraNummers(hoofdstukId, paragraafIds);
  const pages = GT3_A.pages.filter((p) => p.h === h);
  const gekozen =
    want.length > 0
      ? pages.filter((p) => p.s != null && want.includes(p.s))
      : pages.filter((p) => p.s != null).concat(pages.filter((p) => p.s == null));
  if (gekozen.length === 0) return "";

  const stukken: string[] = [`Bron: ${GT3_A.book}. Hoofdstuk ${h}.`];
  let n = stukken[0]!.length;
  for (const page of gekozen) {
    const body = (page.t ?? "").replace(/\s+\n/g, "\n").trim();
    if (!body) continue;
    const kop = page.s ? `§${page.s} (p. ${page.p})` : `(p. ${page.p})`;
    const block = `${kop}\n${body}`;
    if (n + block.length + 2 > max) {
      const ruimte = max - n - kop.length - 8;
      if (ruimte > 200) stukken.push(`${kop}\n${body.slice(0, ruimte)}…`);
      break;
    }
    stukken.push(block);
    n += block.length + 2;
  }
  return stukken.join("\n\n");
}
