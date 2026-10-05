import { grafiekSvg } from "./grafiek";
import { krachtenSvg } from "./krachten";
import { maatcilinderSvg } from "./maatcilinder";
import { meterSvg } from "./meter";
import { oscilloscoopSvg } from "./oscilloscoop";
import { schakelschemaSvg } from "./schakelschema";
import type {
  As,
  FiguurSpec,
  GrafiekFiguur,
  KrachtenFiguur,
  Maatcilinder,
  MaatcilinderFiguur,
  MeterFiguur,
  NenSoort,
  Onderdeel,
  OscilloscoopFiguur,
  Pijl,
  Reeks,
  SchakelschemaFiguur,
} from "./types";

const VEILIG = /^<svg\b[^>]*>[\s\S]*<\/svg>$/;

/** Spec → SVG. Ongeldige spec: geen plaatje. */
export function renderFiguur(f: FiguurSpec | undefined): string | null {
  if (!f) return null;
  try {
    const svg =
      f.type === "maatcilinder"
        ? maatcilinderSvg(f)
        : f.type === "grafiek"
          ? grafiekSvg(f)
          : f.type === "krachten"
            ? krachtenSvg(f)
            : f.type === "meter"
              ? meterSvg(f)
              : f.type === "schakelschema"
                ? schakelschemaSvg(f)
                : f.type === "oscilloscoop"
                  ? oscilloscoopSvg(f)
                  : null;
    if (!svg || !VEILIG.test(svg) || /<script|on\w+=/i.test(svg)) return null;
    return svg;
  } catch {
    return null;
  }
}

function num(v: unknown): number | null {
  if (typeof v === "number" && Number.isFinite(v)) return v;
  if (typeof v === "string" && v.trim() && Number.isFinite(Number(v.replace(",", ".")))) {
    return Number(v.replace(",", "."));
  }
  return null;
}

function tekst(v: unknown, max: number): string | undefined {
  if (typeof v !== "string") return undefined;
  const s = v.replace(/[<>&"]/g, "").replace(/\s+/g, " ").trim().slice(0, max);
  return s || undefined;
}

function klaar(spec: FiguurSpec): FiguurSpec | null {
  return renderFiguur(spec) ? spec : null;
}

const NEN = new Set<NenSoort>([
  "weerstand",
  "variabele-weerstand",
  "lamp",
  "spanningsmeter",
  "stroommeter",
  "motor",
  "cel",
  "wisselbron",
  "schakelaar",
  "diode",
  "led",
  "zekering",
]);

function asUit(v: unknown, fallbackLabel: string): As | null {
  if (!v || typeof v !== "object") return null;
  const o = v as Record<string, unknown>;
  const min = num(o.min) ?? 0;
  const max = num(o.max);
  const stap = num(o.stap);
  if (max == null || stap == null || !(max > min) || stap <= 0 || (max - min) / stap > 24) return null;
  return {
    label: tekst(o.label, 32) ?? fallbackLabel,
    min,
    max,
    stap,
    ...(o.zonderGetallen === true ? { zonderGetallen: true } : {}),
  };
}

function puntenUit(v: unknown, x: As, y: As): [number, number][] | null {
  if (!Array.isArray(v) || v.length < 2 || v.length > 12) return null;
  const uit: [number, number][] = [];
  for (const p of v) {
    if (!Array.isArray(p) || p.length < 2) return null;
    const px = num(p[0]);
    const py = num(p[1]);
    if (px == null || py == null) return null;
    if (px < x.min - 1e-6 || px > x.max + 1e-6 || py < y.min - 1e-6 || py > y.max + 1e-6) return null;
    uit.push([px, py]);
  }
  return uit;
}

function maatcilinderUit(o: Record<string, unknown>): FiguurSpec | null {
  const lijst: Maatcilinder[] = [];
  if (Array.isArray(o.cilinders)) {
    for (const c of o.cilinders.slice(0, 3)) {
      if (!c || typeof c !== "object") return null;
      const row = c as Record<string, unknown>;
      const niveau = num(row.niveau);
      if (niveau == null || niveau < 0) return null;
      lijst.push({
        niveau,
        ...(tekst(row.label, 16) ? { label: tekst(row.label, 16) } : {}),
        ...(row.voorwerp === true ? { voorwerp: true } : {}),
      });
    }
  } else {
    const niveau = num(o.niveau);
    if (niveau == null || niveau < 0) return null;
    lijst.push({ niveau, ...(o.voorwerp === true ? { voorwerp: true } : {}) });
  }
  if (lijst.length < 1) return null;
  const hoogste = Math.max(...lijst.map((c) => c.niveau));
  const max = num(o.max) ?? Math.max(50, Math.ceil(hoogste / 10) * 10);
  if (!(max > 0) || max > 500 || hoogste > max * 1.05) return null;
  const spec: MaatcilinderFiguur = {
    type: "maatcilinder",
    max,
    streep: num(o.streep) ?? (max <= 50 ? 1 : 2),
    getalElke: num(o.getalElke) ?? (max <= 50 ? 10 : 20),
    breedteCm: lijst.length > 1 ? 10 : 6,
    cilinders: lijst,
  };
  if (spec.streep <= 0 || spec.getalElke <= 0 || max / spec.streep > 80) return null;
  return klaar(spec);
}

function grafiekUit(o: Record<string, unknown>): FiguurSpec | null {
  if (o.x && typeof o.x === "object") {
    const x = asUit(o.x, "tijd (s)");
    const y = asUit(o.y, "afstand (m)");
    if (!x || !y) return null;
    const reeksen: Reeks[] = [];
    if (Array.isArray(o.reeksen)) {
      for (const r of o.reeksen.slice(0, 3)) {
        if (!r || typeof r !== "object") continue;
        const row = r as Record<string, unknown>;
        const punten = puntenUit(row.punten, x, y);
        const vorm = row.vorm === "vloeiend" || row.vorm === "punten" ? row.vorm : "lijn";
        if (punten) reeksen.push({ punten, vorm });
      }
    }
    const panelen: { label: string; punten: [number, number][] }[] = [];
    if (Array.isArray(o.panelen)) {
      for (const p of o.panelen.slice(0, 6)) {
        if (!p || typeof p !== "object") continue;
        const row = p as Record<string, unknown>;
        const punten = puntenUit(row.punten, x, y);
        if (!punten) continue;
        panelen.push({ label: tekst(row.label, 8) ?? String.fromCharCode(65 + panelen.length), punten });
      }
    }
    if (reeksen.length < 1 && panelen.length < 2) return null;
    const spec: GrafiekFiguur = {
      type: "grafiek",
      breedteCm: panelen.length ? 14 : 11,
      x,
      y,
      reeksen,
      ...(panelen.length >= 2 ? { panelen } : {}),
    };
    return klaar(spec);
  }
  const xMax = num(o.xMax);
  const yMax = num(o.yMax);
  const xEind = num(o.x);
  const yEind = num(o.y);
  if (xMax == null || yMax == null || xEind == null || yEind == null) return null;
  if (xMax <= 0 || yMax <= 0 || xEind < 0 || yEind < 0 || xEind > xMax || yEind > yMax) return null;
  return klaar({
    type: "grafiek",
    breedteCm: 10,
    x: { label: tekst(o.xLabel, 32) ?? "tijd (s)", min: 0, max: xMax, stap: num(o.xStap) ?? 1 },
    y: { label: tekst(o.yLabel, 32) ?? "afstand (m)", min: 0, max: yMax, stap: num(o.yStap) ?? 1 },
    reeksen: [{ vorm: "lijn", punten: [[0, 0], [xEind, yEind]] }],
  });
}

function krachtenUit(o: Record<string, unknown>): FiguurSpec | null {
  const voorwerpen = new Set(["bloempot", "boomstam", "krat", "geen"]);
  const volledig = Array.isArray(o.pijlen) || typeof o.voorwerp === "string";
  if (!volledig) {
    const n = num(o.newton);
    if (n == null || n <= 0 || n > 200) return null;
    return klaar({
      type: "krachten",
      breedteCm: 8,
      hoogteCm: 8,
      schaalN: 10,
      voorwerp: "krat",
      punt: [4, 4.2],
      pijlen: [{ naam: "Fz", grootteN: n, hoek: 270, label: "Fz" }],
    });
  }
  const voorwerp = voorwerpen.has(String(o.voorwerp)) ? (String(o.voorwerp) as KrachtenFiguur["voorwerp"]) : "geen";
  const schaalN = num(o.schaalN) ?? 10;
  if (!(schaalN > 0) || schaalN > 100) return null;
  const pijlen: Pijl[] = [];
  if (Array.isArray(o.pijlen)) {
    for (const p of o.pijlen.slice(0, 4)) {
      if (!p || typeof p !== "object") continue;
      const row = p as Record<string, unknown>;
      const grootteN = num(row.grootteN);
      const hoek = num(row.hoek);
      if (grootteN == null || hoek == null || grootteN <= 0 || grootteN > 400) continue;
      pijlen.push({
        naam: tekst(row.naam, 8) ?? "F",
        grootteN,
        hoek,
        ...(tekst(row.label, 24) ? { label: tekst(row.label, 24) } : {}),
      });
    }
  }
  const spec: KrachtenFiguur = {
    type: "krachten",
    breedteCm: num(o.breedteCm) && num(o.breedteCm)! >= 6 && num(o.breedteCm)! <= 14 ? num(o.breedteCm)! : 9,
    hoogteCm: num(o.hoogteCm) && num(o.hoogteCm)! >= 6 && num(o.hoogteCm)! <= 14 ? num(o.hoogteCm)! : 10,
    schaalN,
    voorwerp,
    punt: [4, voorwerp === "bloempot" ? 3.2 : 4.2],
    ...(tekst(o.puntLabel, 4) ? { puntLabel: tekst(o.puntLabel, 4) } : {}),
    pijlen,
  };
  return klaar(spec);
}

function meterUit(o: Record<string, unknown>): FiguurSpec | null {
  const waarde = num(o.waarde);
  if (waarde == null || waarde < 0) return null;
  if (o.soort === "kwh") {
    const spec: MeterFiguur = {
      type: "meter",
      soort: "kwh",
      eenheid: "kWh",
      waarde,
      cijfers: Math.min(6, Math.max(3, Math.round(num(o.cijfers) ?? 5))),
      decimalen: Math.min(2, Math.max(0, Math.round(num(o.decimalen) ?? 1))),
      breedteCm: 8,
      ...(tekst(o.label, 24) ? { label: tekst(o.label, 24) } : {}),
    };
    return klaar(spec);
  }
  const max = num(o.max) ?? 10;
  const min = num(o.min) ?? 0;
  if (!(max > min) || waarde > max || waarde < min) return null;
  const spec: MeterFiguur = {
    type: "meter",
    soort: "wijzer",
    eenheid: tekst(o.eenheid, 8) ?? "V",
    min,
    max,
    waarde,
    ...(num(o.streep) && num(o.streep)! > 0 ? { streep: num(o.streep)! } : {}),
    breedteCm: 7,
    ...(tekst(o.label, 24) ? { label: tekst(o.label, 24) } : {}),
  };
  return klaar(spec);
}

function schakelschemaUit(o: Record<string, unknown>): FiguurSpec | null {
  if (!Array.isArray(o.takken)) {
    return klaar({
      type: "schakelschema",
      breedteCm: 8,
      bron: { soort: "cel", label: tekst(o.label, 12) ?? "1,5 V" },
      takken: [{ onderdelen: [{ soort: "schakelaar", label: "S" }, { soort: "lamp", label: "L" }] }],
    });
  }
  const bron = o.bron && typeof o.bron === "object" ? (o.bron as Record<string, unknown>) : {};
  const soort = bron.soort === "wisselbron" ? "wisselbron" : "cel";
  const takken: SchakelschemaFiguur["takken"] = [];
  for (const t of o.takken.slice(0, 4)) {
    if (!t || typeof t !== "object") continue;
    const row = t as Record<string, unknown>;
    const onderdelen: Onderdeel[] = [];
    if (!Array.isArray(row.onderdelen)) continue;
    for (const d of row.onderdelen.slice(0, 3)) {
      if (!d || typeof d !== "object") continue;
      const deel = d as Record<string, unknown>;
      if (!NEN.has(deel.soort as NenSoort)) continue;
      onderdelen.push({
        soort: deel.soort as NenSoort,
        ...(tekst(deel.label, 16) ? { label: tekst(deel.label, 16) } : {}),
      });
    }
    if (onderdelen.length) takken.push({ onderdelen });
  }
  if (!takken.length) return null;
  const spec: SchakelschemaFiguur = {
    type: "schakelschema",
    breedteCm: takken.length > 1 ? 12 : 8,
    bron: { soort, ...(tekst(bron.label, 12) ? { label: tekst(bron.label, 12) } : {}) },
    takken,
  };
  return klaar(spec);
}

function oscilloscoopUit(o: Record<string, unknown>): FiguurSpec | null {
  if (!Array.isArray(o.panelen) || o.panelen.length < 1) return null;
  const hokjesX = Math.min(12, Math.max(4, Math.round(num(o.hokjesX) ?? 8)));
  const hokjesY = Math.min(8, Math.max(4, Math.round(num(o.hokjesY) ?? 6)));
  const panelen: OscilloscoopFiguur["panelen"] = [];
  for (const p of o.panelen.slice(0, 6)) {
    if (!p || typeof p !== "object") continue;
    const row = p as Record<string, unknown>;
    const amplitude = num(row.amplitude);
    const trillingstijd = num(row.trillingstijd);
    if (amplitude == null || trillingstijd == null) continue;
    if (amplitude <= 0 || amplitude > hokjesY / 2 || trillingstijd <= 0 || trillingstijd > hokjesX) continue;
    panelen.push({
      amplitude,
      trillingstijd,
      ...(tekst(row.label, 8) ? { label: tekst(row.label, 8) } : {}),
    });
  }
  if (!panelen.length) return null;
  const spec: OscilloscoopFiguur = {
    type: "oscilloscoop",
    hokjesX,
    hokjesY,
    panelen,
    breedteCm: panelen.length > 1 ? 14 : 8,
    ...(tekst(o.notitie, 80) ? { notitie: tekst(o.notitie, 80) } : {}),
  };
  return klaar(spec);
}

/** Losse JSON van het model → figuurspec, of null. Volledige tekening of een korte vorm. */
export function figuurUitJson(raw: unknown): FiguurSpec | null {
  if (!raw || typeof raw !== "object") return null;
  const o = raw as Record<string, unknown>;
  if (o.type === "maatcilinder") return maatcilinderUit(o);
  if (o.type === "grafiek") return grafiekUit(o);
  if (o.type === "krachten") return krachtenUit(o);
  if (o.type === "meter") return meterUit(o);
  if (o.type === "schakelschema") return schakelschemaUit(o);
  if (o.type === "oscilloscoop") return oscilloscoopUit(o);
  return null;
}
