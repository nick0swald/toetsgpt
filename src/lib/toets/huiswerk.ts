import { downloadTekst, gegevenAntwoord, juistAntwoord } from "./export-toets";
import { nlCijfer } from "./format";
import type { Toets, ToetsUitslag } from "./types";

const FLAG_KEY = "toetsgpt-huiswerk-actief";
const LOG_KEY = "toetsgpt-huiswerk-log";

export type HuiswerkVraagLog = {
  prompt: string;
  given: string;
  correct: string;
  points: number;
  max: number;
  stof?: string;
};

export type HuiswerkRonde = {
  title: string;
  behaald: number;
  totaal: number;
  cijfer: number;
  startedAt: number | null;
  submittedAt: number;
  vragen: HuiswerkVraagLog[];
};

export type HuiswerkLog = {
  naam: string;
  startedAt: number;
  rondes: HuiswerkRonde[];
};

/** Publieke env-gate: aan bij `1` of `true` (case-insensitive). */
export function isHuiswerkModusBeschikbaar(): boolean {
  const env = import.meta.env as Record<string, string | boolean | undefined>;
  const raw = env.VITE_HUISWERK_MODUS;
  if (raw == null) return false;
  const v = String(raw).trim().toLowerCase();
  return v === "1" || v === "true";
}

export function isHuiswerkActief(): boolean {
  if (!isHuiswerkModusBeschikbaar()) return false;
  try {
    return sessionStorage.getItem(FLAG_KEY) === "1";
  } catch {
    return false;
  }
}

export function leesHuiswerkLog(): HuiswerkLog | null {
  try {
    const raw = sessionStorage.getItem(LOG_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as HuiswerkLog;
    if (!parsed || !Array.isArray(parsed.rondes)) return null;
    return parsed;
  } catch {
    return null;
  }
}

function schrijfLog(log: HuiswerkLog): void {
  sessionStorage.setItem(LOG_KEY, JSON.stringify(log));
}

/** Zet huiswerkmodus aan/uit. Aan starten legt een lege sessielog aan. */
export function setHuiswerkActief(on: boolean, naam = ""): void {
  try {
    if (on) {
      sessionStorage.setItem(FLAG_KEY, "1");
      const bestaand = leesHuiswerkLog();
      if (!bestaand) {
        schrijfLog({
          naam: naam.trim(),
          startedAt: Date.now(),
          rondes: [],
        });
      } else if (naam.trim() && !bestaand.naam) {
        schrijfLog({ ...bestaand, naam: naam.trim() });
      }
    } else {
      sessionStorage.removeItem(FLAG_KEY);
    }
  } catch {
    /* sessionStorage mag falen */
  }
}

export function voegHuiswerkRondeToe(
  toets: Toets,
  uitslag: ToetsUitslag,
  meta: { naam?: string; startedAt?: number | null; submittedAt?: number },
): void {
  if (!isHuiswerkActief()) return;
  try {
    const nu = meta.submittedAt ?? Date.now();
    let log = leesHuiswerkLog();
    if (!log) {
      log = { naam: (meta.naam ?? "").trim(), startedAt: meta.startedAt ?? nu, rondes: [] };
    } else if (meta.naam?.trim() && !log.naam) {
      log = { ...log, naam: meta.naam.trim() };
    }
    const ronde: HuiswerkRonde = {
      title: toets.title || "Oefentoets",
      behaald: uitslag.behaald,
      totaal: uitslag.totaal,
      cijfer: uitslag.cijfer,
      startedAt: meta.startedAt ?? null,
      submittedAt: nu,
      vragen: uitslag.perVraag.map((v) => ({
        prompt: v.question.prompt.trim(),
        given: gegevenAntwoord(v.question, v.given),
        correct: juistAntwoord(v.question),
        points: v.points,
        max: v.max,
        stof: v.question.stof?.label,
      })),
    };
    schrijfLog({ ...log, rondes: [...log.rondes, ronde] });
  } catch {
    /* sessionStorage mag falen */
  }
}

function punten(n: number): string {
  return Number.isInteger(n) ? String(n) : String(n).replace(".", ",");
}

function stamp(ms: number): string {
  try {
    return new Date(ms).toLocaleString("nl-NL", {
      dateStyle: "short",
      timeStyle: "short",
    });
  } catch {
    return new Date(ms).toISOString();
  }
}

function slugNaam(naam: string): string {
  const s = naam
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 24);
  return s || "leerling";
}

export function sessielogBestandsnaam(naam?: string): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `toetsgpt-huiswerk-${y}-${m}-${day}-${slugNaam(naam ?? "")}.txt`;
}

/** Plain-text sessielog over de hele huiswerkperiode (meerdere rondes). */
export function sessielogTekst(log: HuiswerkLog): string {
  const regels: string[] = [
    "ToetsGPT · Huiswerk sessielog",
    log.naam ? `Leerling: ${log.naam}` : "Leerling: (geen naam)",
    `Gestart: ${stamp(log.startedAt)}`,
    `Rondes: ${log.rondes.length}`,
    "",
  ];

  log.rondes.forEach((ronde, ri) => {
    regels.push(`=== Ronde ${ri + 1}: ${ronde.title} ===`);
    if (ronde.startedAt) regels.push(`Begonnen: ${stamp(ronde.startedAt)}`);
    regels.push(`Ingeleverd: ${stamp(ronde.submittedAt)}`);
    regels.push(`Punten: ${punten(ronde.behaald)} / ${punten(ronde.totaal)}`);
    regels.push(`Oefenscore: ${nlCijfer(ronde.cijfer)} (geen echt cijfer)`);
    regels.push("");
    ronde.vragen.forEach((v, vi) => {
      regels.push(`Vraag ${vi + 1} · ${punten(v.points)} / ${punten(v.max)}`);
      if (v.stof) regels.push(`Stof: ${v.stof}`);
      regels.push(v.prompt);
      regels.push(`Jouw antwoord: ${v.given}`);
      regels.push(`Juist: ${v.correct}`);
      regels.push("");
    });
  });

  if (log.rondes.length === 0) {
    regels.push("(Nog geen afgeronde toetsen in deze sessie.)");
    regels.push("");
  }

  regels.push("Mail of upload dit bestand naar je docent.");
  regels.push("Oefenscore. Geen officieel cijfer.");
  regels.push("");
  return regels.join("\n");
}

export function heeftHuiswerkRondes(): boolean {
  const log = leesHuiswerkLog();
  return !!log && log.rondes.length > 0;
}

export function downloadSessielog(naam?: string): boolean {
  const log = leesHuiswerkLog();
  if (!log || log.rondes.length === 0) return false;
  const wie = (naam ?? log.naam ?? "").trim();
  const tekst = sessielogTekst(wie && !log.naam ? { ...log, naam: wie } : log);
  downloadTekst(sessielogBestandsnaam(wie || log.naam), tekst);
  return true;
}
