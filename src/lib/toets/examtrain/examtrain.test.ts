import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { checkFormule, FAMILIES } from "./formula.ts";
import { nakijkenReken, nakijkenMc, parseAntwoord, vergelijk, type BankItem, type RekenItem } from "./grade.ts";
import { maakSet, telPerDeel } from "./pick.ts";
import { TYPEN } from "./nav.ts";
import { TOETSDELEN } from "./toetsdelen.ts";

const bank = JSON.parse(readFileSync(new URL("./bank.json", import.meta.url), "utf8")) as BankItem[];
const fmt = (v: number) => String(Number(v.toPrecision(6))).replace(".", ",");

describe("examentraining bank", () => {
  it("heeft unieke ids en geldige mc-sleutels", () => {
    const ids = new Set(bank.map((b) => b.id));
    assert.equal(ids.size, bank.length);
    for (const b of bank) {
      if (b.vorm === "mc") {
        assert.ok(b.sleutel >= 0 && b.sleutel < b.opties.length, b.id);
        assert.equal(new Set(b.opties).size, b.opties.length, b.id);
      }
      assert.ok(!/afbeelding|uitwerkbijlage|hiernaast|binas/i.test(b.intro + b.lead + b.vraag), b.id);
    }
  });
  it("per-type werkt los van toetsdelen; toetsdelen (voorlopig) hebben vragen", () => {
    const bekend = new Set(TYPEN.map((t) => t.id));
    for (const b of bank) assert.ok(bekend.has(b.type), b.type);
    for (const d of telPerDeel(bank, "GT")) assert.ok(d.n > 0, d.id);
  });
  it("toetsdelen volgen het PTA 4GT 2025-2027 (SE4.1–SE4.4) ; materie-typen in deel 2", () => {
    const bekend = new Set(TYPEN.map((t) => t.id));
    const se = TOETSDELEN.filter((d) => d.nr);
    assert.deepEqual(se.map((d) => d.pta), ["SE4.1", "SE4.2", "SE4.3", "SE4.4"]);
    assert.deepEqual(se.map((d) => d.periode), [1, 1, 2, 2]);
    assert.ok(se.every((d) => d.weging === 3));
    assert.match(se[1]!.hoofdstukken, /H11 Energie \+ H13 Geluid/);
    for (const t of ["W-DICHT", "W-DICHTB", "W-FASE", "W-MAT", "W-STOF", "W-DRIJF"]) assert.ok(bekend.has(t) && se[1]!.typen.includes(t), t);
  });
  it("elk rekenitem: juiste uitwerking = alle punten", () => {
    for (const b of bank) {
      if (b.vorm !== "reken") continue;
      const formule = b.fam.map((f) => FAMILIES[f]!.toon).join("\n");
      const werk = b.steps.flatMap((s) => (s.k === "N" ? [`${fmt(s.vals[0]!.v)} ${s.vals[0]!.u}`] : [])).join("\n");
      const antwoorden = b.parts.map((p) => `${fmt(p[0]!.v)} ${p[0]!.u}`);
      const conclusie = b.steps.flatMap((s) => (s.k === "C" ? s.kw : [])).join(" ");
      const u = nakijkenReken(b, { formule, werk, antwoorden, conclusie });
      assert.equal(u.punten, u.max, `${b.id}: ${JSON.stringify(u.stappen.filter((s) => !s.ok))}`);
    }
  });
  it("eenheid vergeten kost 1 punt, rekenfout + eenheidsfout samen ook max 1", () => {
    const b = bank.find((x) => x.id === "KB-2024-1-14") as RekenItem;
    const goed = nakijkenReken(b, { formule: "P = U · I", werk: "36 × 11", antwoorden: ["396 W"] });
    assert.equal(goed.punten, 2);
    const eenheid = nakijkenReken(b, { formule: "P = U · I", werk: "", antwoorden: ["396"] });
    assert.equal(eenheid.punten, 1);
    const beide = nakijkenReken(b, { formule: "P = U · I", werk: "", antwoorden: ["400 A"] });
    assert.equal(beide.punten, 1);
  });
  it("alleen getallen overschrijven geeft geen formulepunt", () => {
    const b = bank.find((x) => x.id === "KB-2024-1-14") as RekenItem;
    const u = nakijkenReken(b, { formule: "= 36 × 11", werk: "", antwoorden: ["396 W"] });
    assert.equal(u.punten, 1);
    assert.equal(checkFormule("P = 36 x 11", ["pui"]).ok, false);
  });
  it("formules in woorden, omgeschreven en met x", () => {
    assert.ok(checkFormule("volume = massa : dichtheid", ["rho"]).ok);
    assert.ok(checkFormule("V = m / ρ", ["rho"]).ok);
    assert.ok(checkFormule("I = P / U", ["pui"]).ok);
    assert.ok(checkFormule("P = U x I", ["pui"]).ok);
    assert.ok(checkFormule("Ebew = ½ · m · v²", ["ek"]).ok);
    assert.ok(checkFormule("Ek = 0,5 x m x v2", ["ek"]).ok);
    assert.ok(checkFormule("η = Paf / Pop × 100%", ["rend"]).ok);
    assert.ok(checkFormule("Up / Us = np / ns", ["trafo"]).ok);
    assert.ok(checkFormule("1/Rv = 1/R1 + 1/R2", ["rvp"]).ok);
    assert.ok(checkFormule("T = t + 273", ["temp"]).ok);
    assert.ok(checkFormule("F1 · l1 = F2 · l2", ["mom"]).ok);
    assert.equal(checkFormule("P = U / I", ["pui"]).ok, false);
    assert.equal(checkFormule("s = v / t", ["svt"]).ok, false);
  });
  it("factor 2 vergeten bij echo kost alleen die stap", () => {
    const b = bank.find((x) => x.id === "KB-2015-2-14") as RekenItem;
    const u = nakijkenReken(b, { formule: "s = v · t", werk: "1480 × 0,05", antwoorden: ["74 m"] });
    assert.equal(u.punten, u.max - 1);
  });
  it("getallen en eenheden lezen", () => {
    assert.deepEqual(parseAntwoord("3,5 · 10^3 kg"), { v: 3500, unit: "kg" });
    assert.deepEqual(parseAntwoord("4 498 kg"), { v: 4498, unit: "kg" });
    assert.equal(vergelijk({ v: 3.51, unit: "ton" }, [{ v: 3510, u: "kg" }], 0.025), "goed");
    assert.equal(vergelijk({ v: 25, unit: "km/u" }, [{ v: 25, u: "km/h" }], 0.025), "goed");
    assert.equal(vergelijk({ v: 0.65, unit: "" }, [{ v: 65, u: "%" }], 0.025), "goed");
    assert.equal(vergelijk({ v: 46, unit: "ohm" }, [{ v: 46, u: "Ω" }], 0.025), "goed");
    assert.equal(vergelijk({ v: 6.21, unit: "€" }, [{ v: 6.21, u: "euro" }], 0.025), "goed");
  });
  it("mc en sets", () => {
    const mc = bank.find((b) => b.vorm === "mc")!;
    if (mc.vorm === "mc") assert.equal(nakijkenMc(mc, mc.sleutel).punten, 1);
    for (const lw of ["BB", "KB", "GT"] as const) {
      const s = maakSet(bank, lw, { n: 10, seed: 7 });
      assert.equal(s.length, 10);
      assert.ok(s.filter((b) => b.vorm === "open" && b.ai).length <= 2);
    }
  });
});

import { leeg, maakSlimSet, maakStartmeting, registreer, resetLeerweg, statusVan, typeInfo } from "./progress.ts";

describe("adaptief oefenen", () => {
  it("startmeting: 15 verschillende frequente typen, geen AI", () => {
    for (const lw of ["BB", "KB", "GT"] as const) {
      const s = maakStartmeting(bank, lw, 3);
      assert.equal(s.length, 15);
      assert.equal(new Set(s.map((b) => b.type)).size, 15);
      assert.ok(!s.some((b) => b.vorm === "open" && b.ai));
    }
  });
  it("beheerst na 3 van de laatste 4 goed", () => {
    const item = bank.find((b) => b.type === "E-PUI" && b.leerweg === "GT")!;
    let v = leeg();
    assert.equal(typeInfo(v, "GT", "E-PUI").status, "nieuw");
    for (const g of [false, true, true]) v = registreer(v, "GT", item, g);
    assert.equal(typeInfo(v, "GT", "E-PUI").status, "oefenen");
    v = registreer(v, "GT", item, true);
    assert.equal(typeInfo(v, "GT", "E-PUI").status, "beheerst");
    assert.equal(statusVan({ hist: [true, true, false, false], n: 4 }), "oefenen");
    assert.equal(typeInfo(resetLeerweg(v, "GT"), "GT", "E-PUI").status, "nieuw");
  });
  it("slim oefenen: zwakke typen vaker, recente vragen vermeden", () => {
    let v = leeg();
    const pui = bank.filter((b) => b.type === "E-PUI" && b.leerweg === "GT");
    for (const b of pui.slice(0, 2)) v = registreer(v, "GT", b, false);
    const beheerst = bank.find((b) => b.type === "E-COMP" && b.leerweg === "GT")!;
    for (let i = 0; i < 4; i++) v = registreer(v, "GT", beheerst, true);
    let pc = 0, comp = 0;
    for (let s = 1; s <= 40; s++) {
      const set = maakSlimSet(bank, "GT", v, s);
      assert.equal(set.length, 10);
      assert.equal(new Set(set.map((b) => b.id)).size, 10);
      assert.ok(!set.some((b) => b.id === pui[0]!.id || b.id === pui[1]!.id));
      pc += set.filter((b) => b.type === "E-PUI").length;
      comp += set.filter((b) => b.type === "E-COMP").length;
    }
    assert.ok(pc > comp * 2, `${pc} vs ${comp}`);
  });
});

describe("branding niet in vraaginhoud", () => {
  it("bank bevat geen tagline of schoolnaam", () => {
    const raw = readFileSync(new URL("./bank.json", import.meta.url), "utf8");
    assert.ok(!/Nicko|Powered by|Ares058|Leeuwarden|ToetsGPT/i.test(raw));
  });
});
