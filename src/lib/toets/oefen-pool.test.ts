import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { bouwExamenBank, examenBankGrootte } from "./examen-bank.ts";
import { bouwExamenOefening } from "./examen-oefen.ts";
import { bouwKlasBank, klasBankGrootte } from "./klas-bank.ts";
import { bouwKlasOefening } from "./klas-oefen.ts";
import { KLAS_FIGUUR_BANK } from "./klas-figuren.ts";
import { mulberry32 } from "./shuffle.ts";
import type { Question, Toets } from "./types.ts";

const EXAMEN_FIGUUR_IDS = new Set([
  "circuit-serie",
  "circuit-parallel",
  "st-schets",
  "dichtheid-blokken",
  "thermometer-isolatie",
  "kracht-doos",
  "kracht-vectoren",
  "hefboom-moment",
  "katrol-takel",
  ...KLAS_FIGUUR_BANK.map((f) => f.id),
]);

function sleutel(q: Question): string {
  return `${q.situation}|${q.prompt}`;
}

function overlap(a: Toets, b: Toets): number {
  const bKeys = new Set(b.questions.map(sleutel));
  return a.questions.filter((q) => bKeys.has(sleutel(q))).length;
}

describe("oefenbanken (~10×, origineel, shuffle)", () => {
  it("examenbank is ongeveer 10× de oude ~20 vragen", () => {
    assert.ok(examenBankGrootte() >= 160, `examen makers: ${examenBankGrootte()}`);
    assert.equal(bouwExamenBank(mulberry32(1)).length, examenBankGrootte());
  });

  it("klasbank is ongeveer 10× de oude ~16 vragen", () => {
    assert.ok(klasBankGrootte() >= 140, `klas makers: ${klasBankGrootte()}`);
    assert.equal(bouwKlasBank(mulberry32(1)).length, klasBankGrootte());
  });

  it("twee examenrondes met andere seed overlappen weinig", () => {
    const a = bouwExamenOefening({ niveau: "GT", seed: 11 });
    const b = bouwExamenOefening({ niveau: "GT", seed: 22 });
    assert.equal(a.questions.length, 10);
    assert.equal(b.questions.length, 10);
    assert.ok(overlap(a, b) <= 3, `overlap ${overlap(a, b)}`);
    assert.ok(a.questions.some((q) => q.type === "mc"));
    assert.ok(a.questions.some((q) => q.type === "open"));
    assert.ok(a.questions.some((q) => q.skill === "lees"));
  });

  it("twee klasrondes met andere seed overlappen weinig", () => {
    const a = bouwKlasOefening({ niveau: "GT", seed: 11 });
    const b = bouwKlasOefening({ niveau: "GT", seed: 22 });
    assert.equal(a.questions.length, 10);
    assert.equal(b.questions.length, 10);
    assert.ok(overlap(a, b) <= 3, `overlap ${overlap(a, b)}`);
    assert.ok(a.questions.some((q) => q.type === "mc"));
    assert.ok(a.questions.some((q) => q.type === "open"));
    assert.ok(
      new Set(a.questions.map((q) => q.prompt)).size >= 8,
      "klasronde moet gevarieerde prompts hebben",
    );
  });

  it("figuur-ids bestaan in de SVG-bank", () => {
    const exam = bouwExamenBank(mulberry32(7));
    const klas = bouwKlasBank(mulberry32(7));
    for (const q of [...exam, ...klas]) {
      if (!q.figuurId) continue;
      assert.ok(EXAMEN_FIGUUR_IDS.has(q.figuurId), `onbekende figuur ${q.figuurId}`);
    }
    assert.ok(exam.some((q) => q.figuurId));
    assert.ok(klas.some((q) => q.figuurId));
  });

  it("focus CE-onderdeel en H10-paragraaf blijven gevuld", () => {
    const ex = bouwExamenOefening({
      niveau: "GT",
      seed: 3,
      focusOnderdeelIds: ["ce-k5"],
    });
    assert.equal(ex.questions.length, 10);
    const stof = ex.questions.filter((q) => q.skill !== "lees");
    assert.ok(stof.every((q) => q.stof?.hoofdstukId === "ce-k5"));

    const klas = bouwKlasOefening({
      niveau: "GT",
      seed: 3,
      focusTopicIds: ["h10-p1"],
      count: 7,
    });
    assert.equal(klas.questions.length, 7);
    assert.ok(klas.questions.every((q) => q.stof?.paragraafId === "h10-p1"));
  });

  it("bank-ids zijn uniek per ronde-seed", () => {
    const exam = bouwExamenBank(mulberry32(99));
    const klas = bouwKlasBank(mulberry32(99));
    assert.equal(new Set(exam.map((q) => q.id)).size, exam.length);
    assert.equal(new Set(klas.map((q) => q.id)).size, klas.length);
  });
});
