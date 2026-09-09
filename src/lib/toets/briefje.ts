import { nlCijfer } from "./format";
import { CURRICULUM, hoofdstukById } from "./stof";
import type { Diagnose, StofScore, Toets, ToetsUitslag } from "./types";

export type OefenBriefje = {
  v: 1;
  app: "ToetsGPT";
  feedback: string;
  vak: string;
  leerjaar?: string;
  niveau?: string;
  hoofdstukId?: string;
  paragraafIds?: string[];
  lastig?: string;
  topic?: string;
  cijfer?: number;
};

const MARKER = "---toetsgpt---";

export function kortLabel(label: string): string {
  return label.replace(/\s*·\s*/g, " ").trim();
}

function enLijst(items: string[]): string {
  if (items.length === 0) return "";
  if (items.length === 1) return items[0]!;
  if (items.length === 2) return `${items[0]} en ${items[1]}`;
  return `${items.slice(0, -1).join(", ")} en ${items[items.length - 1]}`;
}

function labelsVan(scores: StofScore[]): string[] {
  return scores.map((s) => kortLabel(s.tag.label).toLowerCase());
}

export function schrijfFeedback(diagnose: Diagnose, behaald: number, totaal: number): string {
  const lastig = diagnose.lastig;
  const sterk = diagnose.perStof.filter((s) => s.totaal > 0 && s.behaald / s.totaal >= 0.55);
  const zinnen: string[] = [];
  const pct = totaal > 0 ? behaald / totaal : 0;

  if (lastig.length > 0) {
    zinnen.push(`Oefen extra op ${enLijst(labelsVan(lastig))}.`);
    if (sterk.length > 0) {
      zinnen.push(`${enLijst(labelsVan(sterk))} ging beter.`);
    } else if (pct < 0.55) {
      zinnen.push("Neem de formules en eenheden nog een keer door.");
    }
    zinnen.push(`Start een extra oefening op ${labelsVan(lastig)[0]}.`);
  } else if (diagnose.perStof.length > 0) {
    zinnen.push("Deze stof zit op of boven de cesuur.");
    if (sterk.length > 0) {
      zinnen.push(`${enLijst(labelsVan(sterk))} ging beter.`);
    }
    zinnen.push("Nog een oefentoets houdt het scherp.");
  } else if (pct < 0.55) {
    zinnen.push("Deze oefening zat onder de cesuur.");
    zinnen.push("Kijk de vragen hieronder na.");
    zinnen.push("Maak daarna nog een oefentoets.");
  } else {
    zinnen.push("Deze oefening zat op of boven de cesuur.");
    zinnen.push("Kijk kort na waar punten wegvielen.");
    zinnen.push("Nog een oefentoets houdt het scherp.");
  }

  return zinnen.slice(0, 3).join(" ");
}

export function briefjeVan(toets: Toets, uitslag: ToetsUitslag): OefenBriefje {
  const d = uitslag.diagnose;
  const lastigTags = d.lastig.length ? d.lastig : [];
  const paras = lastigTags.map((s) => s.tag.paragraafId);
  const hoofdstukken = new Set(lastigTags.map((s) => s.tag.hoofdstukId));
  const hoofdstukId =
    hoofdstukken.size === 1
      ? [...hoofdstukken][0]
      : toets.bron.hoofdstukId;
  return {
    v: 1,
    app: "ToetsGPT",
    feedback: schrijfFeedback(d, uitslag.behaald, uitslag.totaal),
    vak: toets.subject || CURRICULUM.titel,
    leerjaar: toets.bron.leerjaar,
    niveau: toets.bron.niveau,
    hoofdstukId,
    paragraafIds: paras.length ? paras : toets.bron.paragraafIds,
    lastig:
      lastigTags.map((s) => kortLabel(s.tag.label)).join(", ") || toets.bron.lastig,
    topic: toets.bron.topic,
    cijfer: uitslag.cijfer,
  };
}

export function serializeBriefje(briefje: OefenBriefje): string {
  const titel = briefje.hoofdstukId
    ? hoofdstukById(briefje.hoofdstukId)?.titel ?? briefje.topic
    : briefje.topic;
  const score =
    typeof briefje.cijfer === "number" ? `Oefenscore ${nlCijfer(briefje.cijfer)}.` : "";
  const payload = JSON.stringify({
    v: 1,
    app: "ToetsGPT",
    vak: briefje.vak,
    leerjaar: briefje.leerjaar,
    niveau: briefje.niveau,
    hoofdstukId: briefje.hoofdstukId,
    paragraafIds: briefje.paragraafIds,
    lastig: briefje.lastig,
    topic: briefje.topic,
  });
  return [
    "ToetsGPT oefenbriefje",
    titel ? `Stof: ${titel}` : "",
    score,
    "",
    briefje.feedback,
    "",
    MARKER,
    payload,
    "",
  ]
    .filter((line, i, all) => !(line === "" && all[i - 1] === ""))
    .join("\n")
    .trim() + "\n";
}

export function parseBriefje(raw: string): OefenBriefje | null {
  const text = raw.trim();
  if (!text) return null;
  const idx = text.indexOf(MARKER);
  const jsonPart = idx >= 0 ? text.slice(idx + MARKER.length).trim() : text;
  const feedbackPart =
    idx >= 0
      ? text
          .slice(0, idx)
          .replace(/^ToetsGPT oefenbriefje\s*/i, "")
          .replace(/^Stof:.*$/m, "")
          .replace(/^Oefenscore.*$/m, "")
          .trim()
      : "";
  try {
    const data = JSON.parse(jsonPart) as Partial<OefenBriefje>;
    if (data && typeof data === "object" && (data.v === 1 || data.app === "ToetsGPT" || data.hoofdstukId || data.lastig || data.paragraafIds)) {
      const paragraafIds = Array.isArray(data.paragraafIds)
        ? data.paragraafIds.filter((x): x is string => typeof x === "string").slice(0, 12)
        : undefined;
      return {
        v: 1,
        app: "ToetsGPT",
        feedback: (typeof data.feedback === "string" && data.feedback.trim()) || feedbackPart || "",
        vak: typeof data.vak === "string" ? data.vak : CURRICULUM.titel,
        leerjaar: typeof data.leerjaar === "string" ? data.leerjaar : undefined,
        niveau: typeof data.niveau === "string" ? data.niveau : undefined,
        hoofdstukId: typeof data.hoofdstukId === "string" ? data.hoofdstukId : undefined,
        paragraafIds,
        lastig: typeof data.lastig === "string" ? data.lastig : undefined,
        topic: typeof data.topic === "string" ? data.topic : undefined,
      };
    }
  } catch {
    return null;
  }
  return null;
}

export function briefjeBestandsnaam(briefje: OefenBriefje): string {
  const slug = (briefje.hoofdstukId || "oefening").replace(/[^a-z0-9-]+/gi, "-").toLowerCase();
  return `toetsgpt-${slug}.txt`;
}

export async function bewaarBriefje(briefje: OefenBriefje): Promise<"gedeeld" | "gedownload"> {
  const text = serializeBriefje(briefje);
  const name = briefjeBestandsnaam(briefje);
  const file = new File([text], name, { type: "text/plain" });
  const payload = { files: [file], title: "ToetsGPT oefenbriefje", text: briefje.feedback };
  const nav = navigator as Navigator & {
    canShare?: (data: ShareData) => boolean;
    share?: (data: ShareData) => Promise<void>;
  };
  if (nav.share && (!nav.canShare || nav.canShare(payload))) {
    try {
      await nav.share(payload);
      return "gedeeld";
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") return "gedeeld";
    }
  }
  const url = URL.createObjectURL(file);
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.rel = "noopener";
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1500);
  return "gedownload";
}
