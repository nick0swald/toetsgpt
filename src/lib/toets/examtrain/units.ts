/** Eenheden normaliseren en omrekenen naar een basis (per dimensie). */

type UnitDef = { dim: string; f: number; off?: number };

const U: Record<string, UnitDef> = {
  "": { dim: "1", f: 1 },
  "%": { dim: "1", f: 0.01 },
  mm: { dim: "L", f: 1e-3 }, cm: { dim: "L", f: 1e-2 }, dm: { dim: "L", f: 0.1 }, m: { dim: "L", f: 1 }, km: { dim: "L", f: 1000 },
  mm2: { dim: "A", f: 1e-6 }, cm2: { dim: "A", f: 1e-4 }, dm2: { dim: "A", f: 1e-2 }, m2: { dim: "A", f: 1 },
  mm3: { dim: "V", f: 1e-9 }, cm3: { dim: "V", f: 1e-6 }, ml: { dim: "V", f: 1e-6 }, dm3: { dim: "V", f: 1e-3 }, l: { dim: "V", f: 1e-3 }, m3: { dim: "V", f: 1 },
  mg: { dim: "M", f: 1e-6 }, g: { dim: "M", f: 1e-3 }, kg: { dim: "M", f: 1 }, ton: { dim: "M", f: 1000 },
  ms: { dim: "T", f: 1e-3 }, µs: { dim: "T", f: 1e-6 }, s: { dim: "T", f: 1 }, min: { dim: "T", f: 60 }, h: { dim: "T", f: 3600 },
  "m/s": { dim: "v", f: 1 }, "km/h": { dim: "v", f: 1 / 3.6 },
  "m/s2": { dim: "a", f: 1 },
  N: { dim: "F", f: 1 }, kN: { dim: "F", f: 1000 },
  Pa: { dim: "p", f: 1 }, "N/m2": { dim: "p", f: 1 }, kPa: { dim: "p", f: 1000 }, "N/cm2": { dim: "p", f: 1e4 }, "N/mm2": { dim: "p", f: 1e6 }, bar: { dim: "p", f: 1e5 },
  J: { dim: "E", f: 1 }, Nm: { dim: "E", f: 1 }, kJ: { dim: "E", f: 1e3 }, MJ: { dim: "E", f: 1e6 }, Wh: { dim: "E", f: 3600 }, kWh: { dim: "E", f: 3.6e6 },
  W: { dim: "P", f: 1 }, kW: { dim: "P", f: 1e3 }, MW: { dim: "P", f: 1e6 },
  mA: { dim: "I", f: 1e-3 }, A: { dim: "I", f: 1 },
  mV: { dim: "U", f: 1e-3 }, V: { dim: "U", f: 1 }, kV: { dim: "U", f: 1e3 },
  "Ω": { dim: "R", f: 1 }, "kΩ": { dim: "R", f: 1e3 },
  Hz: { dim: "f", f: 1 }, kHz: { dim: "f", f: 1e3 }, MHz: { dim: "f", f: 1e6 },
  Ah: { dim: "Q", f: 1 }, mAh: { dim: "Q", f: 1e-3 },
  "kg/m3": { dim: "rho", f: 1 }, "g/cm3": { dim: "rho", f: 1000 }, "kg/dm3": { dim: "rho", f: 1000 }, "g/dm3": { dim: "rho", f: 1 }, "g/ml": { dim: "rho", f: 1000 }, "kg/l": { dim: "rho", f: 1000 }, "g/l": { dim: "rho", f: 1 },
  euro: { dim: "€", f: 1 }, cent: { dim: "€", f: 0.01 },
  dB: { dim: "dB", f: 1 },
  "°C": { dim: "temp", f: 1 }, K: { dim: "temp", f: 1, off: -273 },
};

const ALIAS: Record<string, string> = {
  ohm: "Ω", "Ω": "Ω", "ω": "Ω", kohm: "kΩ",
  uur: "h", u: "h", hr: "h", sec: "s", seconde: "s", seconden: "s", minuut: "min", minuten: "min",
  "km/u": "km/h", "km/uur": "km/h", kmh: "km/h", "m/sec": "m/s",
  "m/s^2": "m/s2", "m/s/s": "m/s2",
  "€": "euro", eur: "euro", euro: "euro", "euro's": "euro", eurocent: "cent", ct: "cent", cent: "cent",
  windingen: "", winding: "", keer: "", x: "", maal: "",
  graden: "°C", "graden celsius": "°C", "°c": "°C", "oc": "°C", c: "°C", celsius: "°C", kelvin: "K", k: "K",
  procent: "%", joule: "J", watt: "W", volt: "V", ampère: "A", ampere: "A", newton: "N", hertz: "Hz", pascal: "Pa",
  liter: "l", l: "l", ml: "ml", db: "dB", decibel: "dB",
};

/** Eenheid uit leerlingtekst normaliseren. Geeft null bij onbekend. */
export function normUnit(raw: string): string | null {
  let u = raw.trim().replace(/²/g, "2").replace(/³/g, "3").replace(/\s+/g, "").replace(/^\((.*)\)$/, "$1");
  u = u.replace(/·/g, "").replace(/µ/g, "µ");
  if (u in U) return u;
  const lower = u.toLowerCase();
  if (lower in ALIAS) return ALIAS[lower]!;
  if (u in ALIAS) return ALIAS[u]!;
  // hoofdletter-ongevoelig zoeken als dat eenduidig is
  const hits = Object.keys(U).filter((k) => k.toLowerCase() === lower);
  if (hits.length === 1) return hits[0]!;
  if (hits.length > 1) {
    const pref = ["MHz", "mA", "mAh", "MJ", "kWh", "Pa", "N/cm2", "J", "W", "s", "m"];
    const p = pref.find((x) => hits.includes(x));
    if (p) return p;
  }
  return null;
}

export function unitDim(u: string): string | null {
  return U[u]?.dim ?? null;
}

/** Waarde naar basis-eenheid van de dimensie. */
export function toBase(v: number, u: string): number | null {
  const d = U[u];
  if (!d) return null;
  return v * d.f + (d.off ?? 0);
}

export function fmtUnit(u: string): string {
  return u.replace(/(cm|dm|mm|m)(2|3)$/, (_m, a: string, b: string) => a + (b === "2" ? "²" : "³")).replace("m/s2", "m/s²").replace("N/cm2", "N/cm²").replace("N/m2", "N/m²").replace("kg/m3", "kg/m³").replace("g/cm3", "g/cm³").replace("kg/dm3", "kg/dm³").replace(/^euro$/, "euro");
}
