export function nlGetal(n: number, digits?: number): string {
  const d =
    digits ?? (Number.isInteger(n) ? 0 : Math.abs(n) >= 10 ? 1 : 1);
  const raw = d === 0 && Number.isInteger(n) ? String(n) : n.toFixed(d);
  return raw.replace(".", ",");
}

export function nlCijfer(n: number): string {
  return n.toFixed(1).replace(".", ",");
}

export function parseNlGetal(raw: string): number | null {
  const cleaned = raw.trim().replace(/\s/g, "").replace(",", ".");
  if (!cleaned) return null;
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : null;
}

export function extractNumbers(raw: string): number[] {
  const matches = raw.match(/-?\d+(?:[.,]\d+)?/g) ?? [];
  return matches
    .map((m) => Number(m.replace(",", ".")))
    .filter((n) => Number.isFinite(n));
}

export function normalizeText(raw: string): string {
  return raw
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

export function naamOk(naam: string): boolean {
  if (!naam) return true;
  return /^[A-Za-zÀ-ÿ][A-Za-zÀ-ÿ \-']*$/.test(naam.trim());
}

export function duurMinuten(tijd: "kort" | "10" | "15" | "20"): number | null {
  if (tijd === "kort") return null;
  return Number(tijd);
}

export function formatTijd(seconds: number): string {
  const s = Math.max(0, Math.floor(seconds));
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${m}:${String(r).padStart(2, "0")}`;
}
