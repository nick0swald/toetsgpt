import { nlGetal } from "./format.ts";
import { ceOnderdeelById, type ExamenOnderdeel } from "./examenstof.ts";
import { pick, type Rng } from "./shuffle.ts";
import type { Question, StofTag } from "./types.ts";
import {
  mcFamilie,
  mcVraag,
  naamVan,
  openVraag,
  r1,
  type VraagMaker,
} from "./oefen-maak.ts";

function tag(onderdeel: ExamenOnderdeel, topicId: string, topicLabel: string): StofTag {
  return {
    hoofdstukId: onderdeel.id,
    paragraafId: topicId,
    label: `${onderdeel.code} · ${topicLabel}`,
  };
}

const k3 = ceOnderdeelById("ce-k3")!;
const k4 = ceOnderdeelById("ce-k4")!;
const k5 = ceOnderdeelById("ce-k5")!;
const k6 = ceOnderdeelById("ce-k6")!;
const k8 = ceOnderdeelById("ce-k8")!;
const k9 = ceOnderdeelById("ce-k9")!;
const v1 = ceOnderdeelById("ce-v1")!;
const v2 = ceOnderdeelById("ce-v2")!;

const T_KRING = tag(k5, "k5-kring", "Stroomkring serie/parallel");
const T_OHMS = tag(k5, "k5-ohms", "Spanning, stroom, weerstand");
const T_VERM = tag(k5, "k5-vermogen", "Vermogen en energie");
const T_DICHT = tag(k4, "k4-dichtheid", "Dichtheid · drijven/zinken");
const T_MAT = tag(k4, "k4-materialen", "Materialen en eigenschappen");
const T_WARM = tag(k6, "k6-transport", "Warmtetransport");
const T_ISO = tag(k6, "k6-isolatie", "Isolatie in huis");
const T_TOON = tag(k8, "k8-toon", "Toonhoogte en frequentie");
const T_GEHOOR = tag(k8, "k8-gehoor", "Gehoor en bescherming");
const T_SNEL = tag(k9, "k9-snelheid", "Gemiddelde snelheid");
const T_KRACHT = tag(k9, "k9-soorten", "Soorten krachten");
const T_BOTS = tag(v1, "v1-botsing", "Botsing en remweg");
const T_VEILIG = tag(v1, "v1-veiligheid", "Veiligheidsvoorzieningen");
const T_MOM = tag(v2, "v2-moment", "Moment en evenwicht");
const T_CONSTR = tag(v2, "v2-krachten", "Krachten in constructies");
const T_EENH = tag(k3, "k3-grootheden", "Grootheden en eenheden");
const T_GRAF = tag(k3, "k3-grafiek", "Tabellen en grafieken");
const T_LEES = tag(k3, "k3-bronnen", "Bronnen en vaktekst lezen");

const OHM = [
  { u: 6, i: 0.5, r: 12 },
  { u: 9, i: 1.5, r: 6 },
  { u: 12, i: 2, r: 6 },
  { u: 4, i: 0.5, r: 8 },
  { u: 10, i: 2, r: 5 },
  { u: 24, i: 3, r: 8 },
  { u: 8, i: 0.4, r: 20 },
  { u: 15, i: 3, r: 5 },
  { u: 12, i: 0.5, r: 24 },
  { u: 18, i: 2, r: 9 },
] as const;

const DENS = [
  { m: 240, v: 80, rho: 3 },
  { m: 180, v: 60, rho: 3 },
  { m: 400, v: 100, rho: 4 },
  { m: 150, v: 50, rho: 3 },
  { m: 200, v: 50, rho: 4 },
  { m: 270, v: 90, rho: 3 },
  { m: 320, v: 80, rho: 4 },
  { m: 90, v: 30, rho: 3 },
  { m: 250, v: 50, rho: 5 },
  { m: 120, v: 40, rho: 3 },
] as const;

const SPEED = [
  { s: 12, t: 3, v: 4 },
  { s: 15, t: 5, v: 3 },
  { s: 20, t: 4, v: 5 },
  { s: 18, t: 6, v: 3 },
  { s: 8, t: 2, v: 4 },
  { s: 24, t: 6, v: 4 },
  { s: 9, t: 3, v: 3 },
  { s: 30, t: 5, v: 6 },
  { s: 16, t: 4, v: 4 },
  { s: 21, t: 7, v: 3 },
] as const;

const STOP = [
  { vKm: 50, reactie: 1, rem: 12 },
  { vKm: 60, reactie: 1.2, rem: 18 },
  { vKm: 80, reactie: 1.5, rem: 24 },
  { vKm: 36, reactie: 1, rem: 10 },
  { vKm: 54, reactie: 1, rem: 15 },
  { vKm: 72, reactie: 1.5, rem: 20 },
  { vKm: 40, reactie: 1.2, rem: 8 },
  { vKm: 90, reactie: 1, rem: 30 },
  { vKm: 45, reactie: 1.5, rem: 12 },
  { vKm: 30, reactie: 1, rem: 6 },
] as const;

function stopGetal(row: (typeof STOP)[number]) {
  const vMs = r1(row.vKm / 3.6);
  const reactieAfstand = r1(vMs * row.reactie);
  const stop = r1(reactieAfstand + row.rem);
  return { vMs, reactieAfstand, stop };
}

const serieMakers = mcFamilie("ex-serie", T_KRING, [
  {
    sit: (n) => `${n} tekent een stroomkring: batterij, schakelaar en twee lampjes achter elkaar.`,
    prompt: "Hoe heten deze schakeling en wat geldt voor de stroom?",
    why: "Bij een serieschakeling is er één pad; de stroomsterkte is overal even groot.",
    correct: "Serieschakeling; de stroom is overal even groot.",
    distractors: [
      "Parallelschakeling; de stroom splitst zich over de lampjes.",
      "Serieschakeling; de spanning is overal even groot.",
      "Parallelschakeling; als één lamp uitgaat, blijven de andere branden.",
    ],
    figuurId: "circuit-serie",
    figuurBijschrift: "Figuur — serieschakeling met twee lampjes",
  },
  {
    sit: (n) => `In het lokaal zet ${n} een batterij, een schakelaar en twee lampen in één lus.`,
    prompt: "Wat is kenmerkend voor deze schakeling?",
    why: "Eén lus = serieschakeling: één pad, zelfde stroom.",
    correct: "Er is één pad; de lampen staan in serie.",
    distractors: [
      "Elke lamp heeft een eigen pad naar de batterij.",
      "De spanning over elke lamp is altijd even groot.",
      "Als één lamp uitgaat, blijft de andere branden.",
    ],
    figuurId: "circuit-serie",
    figuurBijschrift: "Figuur — één lus met twee lampen",
  },
  {
    sit: () => "Een snoer kerstverlichting gaat helemaal uit als één lampje kapot is.",
    prompt: "Welke schakeling past het best bij deze waarneming?",
    why: "In serie is er één pad: een onderbreking stopt de hele kring.",
    correct: "Serieschakeling: de kring is dan onderbroken.",
    distractors: [
      "Parallelschakeling: elke lamp heeft een eigen pad.",
      "Alleen een aardlekschakelaar kan dit veroorzaken.",
      "Dit kan alleen als de batterij leeg is.",
    ],
    figuurId: "circuit-serie",
    figuurBijschrift: "Figuur — lampen in één pad",
  },
  {
    sit: (n) => `${n} bouwt een fietslamp: twee cellen en één LED achter elkaar.`,
    prompt: "Hoe lopen de stroom en de naam van de schakeling?",
    why: "Achter elkaar = serie; stroom volgt één pad.",
    correct: "Serieschakeling; de stroom volgt één pad.",
    distractors: [
      "Parallelschakeling; de stroom splitst zich bij de LED.",
      "Geen schakeling, want er is geen schakelaar.",
      "Kortsluiting, want er staan twee cellen.",
    ],
  },
  {
    sit: () => "Een deurbel, een drukknop en een transformator staan in één gesloten pad.",
    prompt: "Wat gebeurt er als de drukknop de kring opent?",
    why: "Open kring = geen stroom in de enige tak.",
    correct: "De bel krijgt geen stroom meer.",
    distractors: [
      "De bel blijft zachtjes rinkelen via een tweede pad.",
      "De spanning in huis valt weg.",
      "Alleen de transformator wordt warmer, de bel niet.",
    ],
    figuurId: "circuit-serie",
    figuurBijschrift: "Figuur — één pad in de kring",
  },
  {
    sit: (n) => `${n} zet drie weerstanden achter elkaar tussen plus en min.`,
    prompt: "Wat geldt voor de stroomsterkte door die weerstanden?",
    why: "Serie: dezelfde stroom door alle onderdelen.",
    correct: "De stroomsterkte is door alle drie even groot.",
    distractors: [
      "De grootste weerstand krijgt de kleinste stroom, de andere meer.",
      "De stroom splitst zich evenredig over de drie weerstanden.",
      "Alleen de eerste weerstand voert stroom.",
    ],
  },
  {
    sit: () => "Een zaklamp heeft cellen, een schakelaar en een lamp in één kring.",
    prompt: "Waarom brandt de lamp niet als de schakelaar open staat?",
    why: "Open schakelaar onderbreekt het enige pad.",
    correct: "De kring is open: er is geen gesloten pad.",
    distractors: [
      "De lamp staat dan parallel en krijgt te veel spanning.",
      "De cellen wisselen van plus en min.",
      "Open schakelaar betekent kortsluiting.",
    ],
  },
  {
    sit: (n) => `${n} meet met één ampèremeter in een kring met twee lampen achter elkaar.`,
    prompt: "Waar mag die meter staan om de stroom te meten?",
    why: "In serie is de stroom overal gelijk; de meter komt in het pad.",
    correct: "Overal in het enige pad: de stroom is overal gelijk.",
    distractors: [
      "Alleen vlak bij de pluspool, elders is de stroom nul.",
      "Alleen tussen de twee lampen, nergens anders.",
      "Parallel over een lamp, anders meet je niks.",
    ],
    figuurId: "circuit-serie",
    figuurBijschrift: "Figuur — serieschakeling",
  },
  {
    sit: () => "Twee identieke lampen staan in serie op een batterij van 4,5 V.",
    prompt: "Wat is het beste te verwachten voor de spanning per lamp?",
    why: "In serie delen gelijke lampen de bronspanning.",
    correct: "Elke lamp krijgt ongeveer de helft van de bronspanning.",
    distractors: [
      "Elke lamp krijgt de volle 4,5 V.",
      "De eerste lamp krijgt alles, de tweede niets.",
      "Spanning bestaat alleen bij parallelschakeling.",
    ],
  },
  {
    sit: (n) => `Een tuinpomp, een schakelaar en een batterij zet ${n} in één lus.`,
    prompt: "Hoe noem je deze schakeling?",
    why: "Onderdelen in één lus = serieschakeling.",
    correct: "Serieschakeling",
    distractors: ["Parallelschakeling", "Kortsluiting", "Aardlekschakeling"],
    figuurId: "circuit-serie",
    figuurBijschrift: "Figuur — onderdelen in één lus",
  },
]);

const parallelMakers = mcFamilie("ex-parallel", T_KRING, [
  {
    sit: () => "In een huis hangen twee lampen parallel op hetzelfde stopcontact.",
    prompt: "Wat gebeurt er als één lamp doorbrandt?",
    why: "In parallel heeft elke lamp een eigen pad; de andere blijft branden.",
    correct: "De andere lamp blijft branden.",
    distractors: [
      "De andere lamp gaat ook uit.",
      "De spanning in huis valt weg.",
      "De stroom in de andere lamp wordt nul.",
    ],
    figuurId: "circuit-parallel",
    figuurBijschrift: "Figuur — parallelschakeling",
  },
  {
    sit: (n) => `${n} hangt twee bureaulampen parallel aan één adapter.`,
    prompt: "Wat is kenmerkend voor deze schakeling?",
    why: "Parallel: elk onderdeel heeft een eigen pad.",
    correct: "Elke lamp heeft een eigen pad; één kan uit, de andere aan.",
    distractors: [
      "Er is maar één pad; als één uitgaat, gaat de andere uit.",
      "De stroom is overal even groot, ook in beide lampen samen.",
      "De spanning over een lamp is altijd de helft van de adapter.",
    ],
    figuurId: "circuit-parallel",
    figuurBijschrift: "Figuur — twee takken parallel",
  },
  {
    sit: () => "In een klaslokaal blijven de meeste lampen branden als er één kapot is.",
    prompt: "Welke schakeling is het meest waarschijnlijk?",
    why: "Eigen paden = parallel.",
    correct: "Parallelschakeling",
    distractors: ["Serieschakeling", "Alleen een zekering, geen schakeling", "Kortsluiting in de groep"],
  },
  {
    sit: (n) => `${n} tekent twee lampen die elk een eigen lus naar dezelfde batterij hebben.`,
    prompt: "Wat geldt voor de spanning over de lampen (ideaal)?",
    why: "Parallel: dezelfde spanning over de takken.",
    correct: "Over beide lampen staat ongeveer dezelfde spanning.",
    distractors: [
      "De spanning splitst zich: de ene lamp krijgt alles.",
      "Alleen de kortste tak krijgt spanning.",
      "Spanning is alleen meetbaar in serie.",
    ],
    figuurId: "circuit-parallel",
    figuurBijschrift: "Figuur — parallel twee lampen",
  },
  {
    sit: () => "Een stoplicht heeft aparte lampen voor rood, oranje en groen, elk op een eigen tak.",
    prompt: "Waarom is parallel hier handig?",
    why: "Elke lamp kan aan of uit zonder de andere tak te openen.",
    correct: "Elke lamp kan branden zonder de andere te onderbreken.",
    distractors: [
      "Dan is de stroom in alle lampen altijd gelijk.",
      "Dan gaat bij één kapotte lamp alles uit.",
      "Dan is er geen batterij nodig.",
    ],
  },
  {
    sit: (n) => `${n} sluit een motor en een lamp parallel aan op dezelfde bron.`,
    prompt: "Wat gebeurt er met de lamp als de motor even meer stroom trekt (bron blijft 12 V)?",
    why: "Parallel houdt de spanning per tak ongeveer gelijk.",
    correct: "De lamp blijft ongeveer even fel, de spanning per tak blijft gelijk.",
    distractors: [
      "De lamp gaat altijd uit, want de motor pakt alle stroom.",
      "De lamp krijgt dan de dubbele spanning.",
      "Parallel betekent dat de lamp in serie met de motor staat.",
    ],
  },
  {
    sit: () => "Twee identieke weerstanden staan parallel. De bron is 9 V.",
    prompt: "Wat is het beste beeld van de stroom?",
    why: "De totale stroom splitst zich over de takken.",
    correct: "De stroom splitst zich over de twee takken.",
    distractors: [
      "De stroom is in elke tak gelijk aan de totale stroom.",
      "Er loopt alleen stroom in de tak met de kortste draad.",
      "In parallel loopt nooit stroom.",
    ],
    figuurId: "circuit-parallel",
    figuurBijschrift: "Figuur — parallelschakeling",
  },
  {
    sit: (n) => `Op een stekkerdoos zet ${n} een lader en een lamp, elk op een eigen contact.`,
    prompt: "Hoe staan lader en lamp t.o.v. het net?",
    why: "Elk apparaat heeft een eigen pad: parallel op het stopcontact.",
    correct: "Parallel: elk apparaat heeft een eigen pad.",
    distractors: [
      "Serie: de stroom gaat eerst door de lader, dan de lamp.",
      "Ze vormen samen één lampkring zonder splitsing.",
      "Alleen de lader staat in de kring.",
    ],
  },
  {
    sit: () => "Een leerling denkt: 'als één tak open is, stopt de hele installatie.'",
    prompt: "Voor welke schakeling klopt dat níet?",
    why: "In parallel blijven andere takken werken.",
    correct: "Parallelschakeling: andere takken blijven werken.",
    distractors: [
      "Serieschakeling: één onderbreking stopt alles.",
      "Elke schakeling stopt altijd helemaal.",
      "Alleen bij wisselstroom stopt niets.",
    ],
  },
  {
    sit: (n) => `${n} vergelijkt twee schema's: lampen achter elkaar vs. lampen naast elkaar.`,
    prompt: "Welk verschil is het belangrijkst?",
    why: "Serie: één pad; parallel: meerdere paden.",
    correct: "Serie heeft één pad, parallel meerdere paden.",
    distractors: [
      "Serie heeft altijd meer spanning per lamp.",
      "Parallel heeft nooit een schakelaar.",
      "Het verschil is alleen de kleur van de draden.",
    ],
    figuurId: "circuit-parallel",
    figuurBijschrift: "Figuur — parallel t.o.v. serie",
  },
]);

const ohmMakers: VraagMaker[] = [
  (rng) => {
    const { u, i, r } = pick(rng, OHM);
    return openVraag({
      id: "ex-ohm-1",
      situation: `Over een weerstand staat ${u} V. De stroom is ${nlGetal(i, 1)} A.`,
      prompt: "Bereken de weerstand in ohm. Schrijf getal en eenheid.",
      points: 2,
      modelAnswer: `${nlGetal(r, 1)} Ω`,
      why: `R = U / I = ${u} / ${nlGetal(i, 1)} = ${nlGetal(r, 1)} Ω.`,
      accept: { numbers: [r], tolerance: 0.15 },
      stof: T_OHMS,
    });
  },
  (rng) => {
    const n = naamVan(rng);
    const { u, i, r } = pick(rng, OHM);
    return openVraag({
      id: "ex-ohm-2",
      situation: `${n} meet ${u} V over een draadweerstand. De stroommeter wijst ${nlGetal(i, 1)} A.`,
      prompt: "Bereken R. Geef het antwoord in Ω.",
      points: 2,
      modelAnswer: `${nlGetal(r, 1)} Ω`,
      why: `R = U / I = ${u} / ${nlGetal(i, 1)} = ${nlGetal(r, 1)} Ω.`,
      accept: { numbers: [r], tolerance: 0.15 },
      stof: T_OHMS,
    });
  },
  (rng) => {
    const { u, i, r } = pick(rng, OHM);
    return openVraag({
      id: "ex-ohm-3",
      situation: `Een gloeilamp krijgt ${u} V. Er loopt ${nlGetal(i, 1)} A.`,
      prompt: "Bereken de weerstand van de lamp in ohm.",
      points: 2,
      modelAnswer: `${nlGetal(r, 1)} Ω`,
      why: `R = U / I = ${u} / ${nlGetal(i, 1)} = ${nlGetal(r, 1)} Ω.`,
      accept: { numbers: [r], tolerance: 0.15 },
      stof: T_OHMS,
    });
  },
  (rng) => {
    const n = naamVan(rng);
    const { u, i, r } = pick(rng, OHM);
    return openVraag({
      id: "ex-ohm-4",
      situation: `Op een practicumkaart van ${n} staat: U = ${u} V en I = ${nlGetal(i, 1)} A.`,
      prompt: "Bereken de weerstand met de wet van Ohm.",
      points: 2,
      modelAnswer: `${nlGetal(r, 1)} Ω`,
      why: `R = U / I = ${u} / ${nlGetal(i, 1)} = ${nlGetal(r, 1)} Ω.`,
      accept: { numbers: [r], tolerance: 0.15 },
      stof: T_OHMS,
    });
  },
  (rng) => {
    const { u, i, r } = pick(rng, OHM);
    return openVraag({
      id: "ex-ohm-5",
      situation: `Een verwarmingsspiraal staat op ${u} V. De stroom is ${nlGetal(i, 1)} A.`,
      prompt: "Bereken R in Ω.",
      points: 2,
      modelAnswer: `${nlGetal(r, 1)} Ω`,
      why: `R = U / I = ${u} / ${nlGetal(i, 1)} = ${nlGetal(r, 1)} Ω.`,
      accept: { numbers: [r], tolerance: 0.15 },
      stof: T_OHMS,
    });
  },
  (rng) => {
    const n = naamVan(rng);
    const { u, i, r } = pick(rng, OHM);
    return openVraag({
      id: "ex-ohm-6",
      situation: `${n} sluit een weerstandsdraad aan. Multimeter: ${u} V en ${nlGetal(i, 1)} A.`,
      prompt: "Bereken de weerstand. Schrijf getal en eenheid.",
      points: 2,
      modelAnswer: `${nlGetal(r, 1)} Ω`,
      why: `R = U / I = ${u} / ${nlGetal(i, 1)} = ${nlGetal(r, 1)} Ω.`,
      accept: { numbers: [r], tolerance: 0.15 },
      stof: T_OHMS,
    });
  },
  (rng) => {
    const { u, i, r } = pick(rng, OHM);
    return openVraag({
      id: "ex-ohm-7",
      situation: `Een LED-driver levert ${u} V bij ${nlGetal(i, 1)} A door een weerstand.`,
      prompt: "Bereken die weerstand in ohm.",
      points: 2,
      modelAnswer: `${nlGetal(r, 1)} Ω`,
      why: `R = U / I = ${u} / ${nlGetal(i, 1)} = ${nlGetal(r, 1)} Ω.`,
      accept: { numbers: [r], tolerance: 0.15 },
      stof: T_OHMS,
    });
  },
  (rng) => {
    const n = naamVan(rng);
    const { u, i, r } = pick(rng, OHM);
    return openVraag({
      id: "ex-ohm-8",
      situation: `${n} noteert in een tabel: spanning ${u} V, stroom ${nlGetal(i, 1)} A.`,
      prompt: "Bereken R. Antwoord in Ω.",
      points: 2,
      modelAnswer: `${nlGetal(r, 1)} Ω`,
      why: `R = U / I = ${u} / ${nlGetal(i, 1)} = ${nlGetal(r, 1)} Ω.`,
      accept: { numbers: [r], tolerance: 0.15 },
      stof: T_OHMS,
    });
  },
  (rng) => {
    const { u, i, r } = pick(rng, OHM);
    return openVraag({
      id: "ex-ohm-9",
      situation: `Over een soldeerbout-element staat ${u} V. Er loopt ${nlGetal(i, 1)} A.`,
      prompt: "Bereken de weerstand van het element.",
      points: 2,
      modelAnswer: `${nlGetal(r, 1)} Ω`,
      why: `R = U / I = ${u} / ${nlGetal(i, 1)} = ${nlGetal(r, 1)} Ω.`,
      accept: { numbers: [r], tolerance: 0.15 },
      stof: T_OHMS,
    });
  },
  (rng) => {
    const n = naamVan(rng);
    const { u, i, r } = pick(rng, OHM);
    return openVraag({
      id: "ex-ohm-10",
      situation: `Een schoolvoeding zet ${n} op ${u} V. Door de weerstand loopt ${nlGetal(i, 1)} A.`,
      prompt: "Bereken R in ohm.",
      points: 2,
      modelAnswer: `${nlGetal(r, 1)} Ω`,
      why: `R = U / I = ${u} / ${nlGetal(i, 1)} = ${nlGetal(r, 1)} Ω.`,
      accept: { numbers: [r], tolerance: 0.15 },
      stof: T_OHMS,
    });
  },
];

const vermogenMakers: VraagMaker[] = [
  (rng) => {
    const u = pick(rng, [6, 9, 12, 24] as const);
    const i = pick(rng, [0.5, 1, 2, 3] as const);
    const p = r1(u * i);
    return openVraag({
      id: "ex-verm-1",
      situation: `Een lamp krijgt ${u} V. De stroom is ${nlGetal(i, 1)} A.`,
      prompt: "Bereken het vermogen in watt.",
      points: 2,
      modelAnswer: `${nlGetal(p, 1)} W`,
      why: `P = U · I = ${u} · ${nlGetal(i, 1)} = ${nlGetal(p, 1)} W.`,
      accept: { numbers: [p], tolerance: 0.15 },
      stof: T_VERM,
    });
  },
  (rng) => {
    const n = naamVan(rng);
    const u = pick(rng, [12, 24] as const);
    const i = pick(rng, [2, 4] as const);
    const p = u * i;
    return openVraag({
      id: "ex-verm-2",
      situation: `${n} leest op een adapter: ${u} V en ${i} A.`,
      prompt: "Bereken het vermogen dat de adapter kan leveren (P = U·I).",
      points: 2,
      modelAnswer: `${p} W`,
      why: `P = U · I = ${u} · ${i} = ${p} W.`,
      accept: { numbers: [p], tolerance: 0.15 },
      stof: T_VERM,
    });
  },
  ...mcFamilie("ex-verm-mc", T_VERM, [
    {
      sit: () => "In een opgave moet je vermogen berekenen met P = U · I.",
      prompt: "Welke eenheid hoort bij vermogen?",
      why: "Vermogen heeft de eenheid watt (W); 1 W = 1 J/s.",
      correct: "Watt (W)",
      distractors: ["Joule (J)", "Newton (N)", "Ohm (Ω)"],
    },
    {
      sit: (n) => `${n} vergelijkt een lamp van 5 W met een lamp van 40 W op dezelfde spanning.`,
      prompt: "Wat betekent het grotere vermogen vooral?",
      why: "Meer vermogen: meer energie per seconde (vaak feller).",
      correct: "De 40 W-lamp zet meer energie per seconde om.",
      distractors: [
        "De 40 W-lamp heeft altijd grotere weerstand.",
        "De 5 W-lamp heeft een hogere spanning.",
        "Vermogen zegt alleen iets over de massa van de lamp.",
      ],
    },
    {
      sit: () => "Op een waterkoker staat 2000 W.",
      prompt: "Wat betekent dat getal?",
      why: "Watt is vermogen: joule per seconde.",
      correct: "De koker zet 2000 joule per seconde om.",
      distractors: [
        "De koker weegt 2000 newton.",
        "De weerstand is 2000 ohm.",
        "Er loopt altijd 2000 ampère.",
      ],
    },
  ]),
];

const eenheidMakers = mcFamilie("ex-eenheid", T_EENH, [
  {
    sit: () => "In een opgave moet je vermogen berekenen met P = U · I.",
    prompt: "Welke eenheid hoort bij vermogen?",
    why: "Vermogen heeft de eenheid watt (W).",
    correct: "Watt (W)",
    distractors: ["Joule (J)", "Newton (N)", "Ohm (Ω)"],
  },
  {
    sit: (n) => `${n} meet een kracht met een veerunster.`,
    prompt: "Welke eenheid hoort bij kracht?",
    why: "Kracht heeft de eenheid newton (N).",
    correct: "Newton (N)",
    distractors: ["Watt (W)", "Joule (J)", "Ampère (A)"],
  },
  {
    sit: () => "Dichtheid bereken je met ρ = m / V.",
    prompt: "Welke combinatie van eenheden past bij g/cm³?",
    why: "Massa in gram, volume in cm³ → g/cm³.",
    correct: "Massa in gram, volume in cm³",
    distractors: [
      "Massa in newton, volume in liter",
      "Kracht in watt, tijd in seconde",
      "Spanning in volt, stroom in ohm",
    ],
  },
  {
    sit: (n) => `${n} noteert een stroomsterkte uit de ampèremeter.`,
    prompt: "Welke eenheid hoort daarbij?",
    why: "Stroomsterkte: ampère (A).",
    correct: "Ampère (A)",
    distractors: ["Volt (V)", "Ohm (Ω)", "Hertz (Hz)"],
  },
  {
    sit: () => "Een opgave vraagt de weerstand van een draad.",
    prompt: "Welke eenheid is juist?",
    why: "Weerstand: ohm (Ω).",
    correct: "Ohm (Ω)",
    distractors: ["Watt (W)", "Pascal (Pa)", "Hertz (Hz)"],
  },
  {
    sit: () => "Frequentie van een toon wordt gemeten.",
    prompt: "Welke eenheid hoort bij frequentie?",
    why: "Frequentie: hertz (Hz), trillingen per seconde.",
    correct: "Hertz (Hz)",
    distractors: ["Decibel (dB)", "Newton (N)", "Joule (J)"],
  },
  {
    sit: (n) => `${n} rekent een afstand in meters en een tijd in seconden om naar snelheid.`,
    prompt: "Welke eenheid krijgt de snelheid dan?",
    why: "v = s/t → m/s.",
    correct: "m/s",
    distractors: ["m/s²", "N/kg", "W/s"],
  },
  {
    sit: () => "Energie in een batterij wordt vaak in joule of kWh gegeven.",
    prompt: "Wat is een eenheid van energie?",
    why: "Joule (J) is de SI-eenheid van energie; kWh ook energie.",
    correct: "Joule (J)",
    distractors: ["Newton (N)", "Ampère (A)", "Hertz (Hz)"],
  },
  {
    sit: () => "Spanning lees je af op een voltmeter.",
    prompt: "Welke eenheid hoort bij elektrische spanning?",
    why: "Spanning: volt (V).",
    correct: "Volt (V)",
    distractors: ["Ampère (A)", "Watt (W)", "Ohm (Ω)"],
  },
  {
    sit: (n) => `${n} moet massa en gewicht (zwaartekracht) uit elkaar houden.`,
    prompt: "Welke combinatie klopt?",
    why: "Massa in kg; zwaartekracht in N.",
    correct: "Massa in kg, zwaartekracht in N",
    distractors: [
      "Massa in N, zwaartekracht in kg",
      "Beide in watt",
      "Beide in m/s",
    ],
  },
]);

const dichtMakers: VraagMaker[] = Array.from({ length: 10 }, (_, i) => (rng: Rng) => {
  const n = naamVan(rng);
  const dens = pick(rng, DENS);
  const sits = [
    `${n} meet een blok: massa ${dens.m} g, volume ${dens.v} cm³.`,
    `Een steen heeft massa ${dens.m} g en volume ${dens.v} cm³.`,
    `Op het practicum weegt ${n} een metalen cilinder: ${dens.m} g. Volume ${dens.v} cm³.`,
    `Een houtmonster: ${dens.m} g en ${dens.v} cm³.`,
    `In een tabel staat m = ${dens.m} g en V = ${dens.v} cm³.`,
    `${n} duwt een voorwerp onder water. Massa ${dens.m} g, volume ${dens.v} cm³.`,
    `Een kunststof blok: massa ${dens.m} g, ingedompeld volume ${dens.v} cm³.`,
    `Labkaart: m = ${dens.m} g, V = ${dens.v} cm³ (maatcilinder).`,
    `${n} heeft een staaf van ${dens.m} g. Het volume is ${dens.v} cm³.`,
    `Een baksteen-fragment: ${dens.m} g en ${dens.v} cm³.`,
  ];
  return openVraag({
    id: `ex-dicht-${i + 1}`,
    situation: sits[i]!,
    prompt: "Bereken de dichtheid in g/cm³.",
    points: 2,
    modelAnswer: `${nlGetal(dens.rho)} g/cm³`,
    why: `ρ = m / V = ${dens.m} / ${dens.v} = ${nlGetal(dens.rho)} g/cm³.`,
    accept: { numbers: [dens.rho], tolerance: 0.08 },
    stof: T_DICHT,
    figuurId: i % 2 === 0 ? "dichtheid-blokken" : undefined,
    figuurBijschrift: i % 2 === 0 ? "Figuur — blokken in water" : undefined,
  });
});

const drijfMakers = mcFamilie("ex-drijf", T_DICHT, [
  {
    sit: () => "Een houten blok en een stenen blok hebben ongeveer hetzelfde volume.",
    prompt: "Welk blok drijft eerder op water, en waarom?",
    why: "Hout heeft een kleinere dichtheid dan water; steen groter — steen zinkt.",
    correct: "Het houten blok, want de dichtheid is kleiner dan die van water.",
    distractors: [
      "Het stenen blok, want steen is zwaarder en drijft daarom beter.",
      "Beide even goed, want het volume is gelijk.",
      "Geen van beide: alleen metaal kan drijven.",
    ],
    figuurId: "dichtheid-blokken",
    figuurBijschrift: "Figuur — drijven en zinken",
  },
  {
    sit: (n) => `${n} legt een dichte kunststof dop en een glazen knikker in een bak water. Beide zijn klein.`,
    prompt: "Wat bepaalt vooral of ze drijven of zinken?",
    why: "Vergelijk dichtheid met water, niet alleen de grootte.",
    correct: "De dichtheid vergeleken met die van water.",
    distractors: [
      "Alleen de kleur van het voorwerp.",
      "Alleen of het voorwerp hol lijkt.",
      "Alleen de vorm van de bak.",
    ],
    figuurId: "dichtheid-blokken",
    figuurBijschrift: "Figuur — drijven en zinken",
  },
  {
    sit: () => "IJs drijft op water. Massief ijzer zinkt.",
    prompt: "Welke uitleg is het best?",
    why: "Dichtheid ijs < water; dichtheid ijzer > water.",
    correct: "IJs heeft een kleinere dichtheid dan water, ijzer een grotere.",
    distractors: [
      "IJs is altijd lichter in newton, daarom drijft alles wat koud is.",
      "IJzer drijft niet omdat metaal geen volume heeft.",
      "Alleen de temperatuur van het water telt.",
    ],
  },
  {
    sit: (n) => `${n} heeft twee blokken van gelijk volume. Blok A is zwaarder dan blok B.`,
    prompt: "Wat weet je over de dichtheid?",
    why: "Zelfde V, grotere m → grotere ρ.",
    correct: "Blok A heeft een grotere dichtheid dan blok B.",
    distractors: [
      "Blok B heeft een grotere dichtheid, want het is lichter.",
      "De dichtheid is gelijk, want het volume is gelijk.",
      "Dichtheid hangt alleen van de kleur af.",
    ],
  },
  {
    sit: () => "Een boot van staal drijft, een massief stalen kogel zinkt.",
    prompt: "Wat is de beste verklaring?",
    why: "De boot heeft groot volume (lucht); gemiddelde dichtheid < water.",
    correct: "De boot heeft (met lucht) een kleinere gemiddelde dichtheid dan water.",
    distractors: [
      "Staal drijft altijd, kogels zijn een uitzondering zonder reden.",
      "Kogels hebben geen massa.",
      "Alleen de verf op de boot zorgt voor drijven.",
    ],
  },
  {
    sit: (n) => `${n} laat een appel in water zakken: de appel drijft half boven.`,
    prompt: "Wat zegt dat over de dichtheid van de appel?",
    why: "Drijven: dichtheid kleiner dan of vergelijkbaar met water; half boven ≈ iets kleiner.",
    correct: "De dichtheid is iets kleiner dan die van water.",
    distractors: [
      "De dichtheid is veel groter dan die van water.",
      "De appel heeft geen dichtheid.",
      "Drijven betekent dat de massa nul is.",
    ],
    figuurId: "dichtheid-blokken",
    figuurBijschrift: "Figuur — voorwerp in water",
  },
  {
    sit: () => "Olie drijft als een laag op water.",
    prompt: "Wat volgt daaruit voor de dichtheid van olie?",
    why: "Drijven op water: ρ_olie < ρ_water.",
    correct: "Olie heeft een kleinere dichtheid dan water.",
    distractors: [
      "Olie heeft een grotere dichtheid dan water.",
      "Olie en water hebben altijd dezelfde dichtheid.",
      "Dichtheid speelt geen rol bij vloeistoffen.",
    ],
  },
  {
    sit: (n) => `${n} meet: blok 80 g en 20 cm³. Water is ongeveer 1 g/cm³.`,
    prompt: "Zinkt dit blok in water?",
    why: "ρ = 4 g/cm³ > 1 → zinkt.",
    correct: "Ja, de dichtheid is groter dan die van water.",
    distractors: [
      "Nee, 80 g is te weinig om te zinken.",
      "Ja, omdat het volume groot is.",
      "Nee, alles van 20 cm³ drijft.",
    ],
  },
  {
    sit: () => "Twee blokken even zwaar. Het ene heeft groter volume.",
    prompt: "Welk blok heeft de kleinere dichtheid?",
    why: "ρ = m/V; groter V bij zelfde m → kleinere ρ.",
    correct: "Het blok met het grotere volume.",
    distractors: [
      "Het blok met het kleinere volume.",
      "Ze hebben dezelfde dichtheid, want de massa is gelijk.",
      "Je kunt dichtheid niet vergelijken zonder kleur.",
    ],
  },
  {
    sit: (n) => `${n} ziet een kurk drijven en een steen zinken in dezelfde bak.`,
    prompt: "Welke grootheid verklaart het verschil het best?",
    why: "Dichtheid t.o.v. water.",
    correct: "Dichtheid (massa per volume) vergeleken met water.",
    distractors: [
      "Alleen de temperatuur van de steen.",
      "Alleen de vorm van de bak.",
      "Alleen of het licht aan is.",
    ],
    figuurId: "dichtheid-blokken",
    figuurBijschrift: "Figuur — drijven en zinken",
  },
]);

const materiaalMakers = mcFamilie("ex-mat", T_MAT, [
  {
    sit: () => "Een pansteel van hout voelt minder heet aan dan een steel van metaal in dezelfde pan.",
    prompt: "Wat is de beste uitleg?",
    why: "Metaal geleidt warmte beter dan hout.",
    correct: "Metaal geleidt warmte beter dan hout.",
    distractors: [
      "Hout heeft altijd een hogere temperatuur.",
      "Metaal is lichter, daarom voelt het heter.",
      "Hout geleidt elektriciteit beter, daarom voelt het koud.",
    ],
  },
  {
    sit: (n) => `${n} kiest een plastic liniaal en een stalen liniaal van dezelfde lengte.`,
    prompt: "Welke eigenschap klopt het best?",
    why: "Staal geleidt elektriciteit en warmte beter dan plastic.",
    correct: "Staal geleidt stroom en warmte beter dan plastic.",
    distractors: [
      "Plastic is altijd zwaarder dan staal.",
      "Plastic geleidt stroom beter.",
      "Staal isoleert beter dan plastic.",
    ],
  },
  {
    sit: () => "Koperdraden in huis, kunststof mantel eromheen.",
    prompt: "Welke rol speelt de mantel vooral?",
    why: "Kunststof isoleert, koper geleidt.",
    correct: "Isoleren: voorkomen dat stroom onbedoeld wegloopt.",
    distractors: [
      "De mantel geleidt de stroom beter dan koper.",
      "De mantel maakt de draad magnetisch.",
      "De mantel verhoogt de spanning.",
    ],
  },
]);

const warmteMakers = mcFamilie("ex-warmte", T_WARM, [
  {
    sit: () => "Een metalen lepel staat in een pan met hete soep. Het handvat wordt warm.",
    prompt: "Welke vorm van warmtetransport speelt hier vooral?",
    why: "In een vaste stof verplaatst warmte zich vooral door geleiding.",
    correct: "Geleiding",
    distractors: ["Stroming", "Straling", "Convectie door lucht alleen"],
    figuurId: "thermometer-isolatie",
    figuurBijschrift: "Figuur — warmte en isolatie",
  },
  {
    sit: (n) => `${n} voelt warme lucht opstijgen boven een radiator.`,
    prompt: "Welke vorm van warmtetransport is dat vooral?",
    why: "Warme lucht beweegt: stroming (convectie).",
    correct: "Stroming",
    distractors: ["Geleiding door de muur alleen", "Straling zonder lucht", "Alleen verdamping"],
  },
  {
    sit: () => "Je voelt de warmte van een kampvuur op afstand, zonder de luchtstroom aan te raken.",
    prompt: "Welke vorm is dat vooral?",
    why: "Warmte door elektromagnetische straling.",
    correct: "Straling",
    distractors: ["Geleiding door de grond", "Stroming in het hout", "Alleen geleiding via rook"],
  },
  {
    sit: (n) => `${n} houdt een metalen staaf in heet water: het andere eind wordt later warm.`,
    prompt: "Hoe heet dit transport in de staaf?",
    why: "Vaste stof: geleiding.",
    correct: "Geleiding",
    distractors: ["Stroming van metaalatomen als vloeistof", "Straling binnenin het metaal alleen", "Isolatie"],
    figuurId: "thermometer-isolatie",
    figuurBijschrift: "Figuur — warmte in vaste stof",
  },
  {
    sit: () => "In een pan soep zie je belletjes en beweging van vloeistof bij verwarmen.",
    prompt: "Welke vorm speelt in de vloeistof een grote rol?",
    why: "Vloeistof in beweging: stroming.",
    correct: "Stroming",
    distractors: ["Alleen geleiding, vloeistof beweegt nooit", "Alleen straling van de deksel", "Magnetisme"],
  },
  {
    sit: () => "Zonnewarmte bereikt de aarde door de ruimte.",
    prompt: "Welke vorm moet dat vooral zijn?",
    why: "In vacuüm geen geleiding/stroming; wel straling.",
    correct: "Straling",
    distractors: ["Stroming van lucht in de ruimte", "Geleiding via een koperdraad naar de zon", "Convectie in vacuüm"],
  },
  {
    sit: (n) => `${n} merkt dat een zwart dashboard in de zon heter wordt dan een licht dashboard.`,
    prompt: "Welke vorm van warmtetransport is hier het belangrijkst vanaf de zon?",
    why: "Zonnewarmte: straling; donker absorbeert meer.",
    correct: "Straling",
    distractors: ["Geleiding door de lucht alleen", "Stroming vanuit de motor", "Alleen wrijving van de banden"],
  },
  {
    sit: () => "Dubbel glas heeft lucht (of gas) tussen de ruiten.",
    prompt: "Welke transportvorm wordt daardoor vooral beperkt t.o.v. één dikke ruit van glas?",
    why: "Lucht geleidt slecht; minder geleiding door de spouw.",
    correct: "Geleiding door het glas/spouw",
    distractors: ["Straling van de zon verdwijnt volledig", "Stroming in de kamer stopt", "Geluid verdwijnt altijd"],
    figuurId: "thermometer-isolatie",
    figuurBijschrift: "Figuur — isolatie",
  },
  {
    sit: (n) => `${n} voelt de zijkant van een oven: de lucht vlakbij is warm en beweegt omhoog.`,
    prompt: "Welke twee vormen spelen hier samen een rol?",
    why: "Wand: geleiding; lucht: stroming.",
    correct: "Geleiding in de wand en stroming in de lucht",
    distractors: [
      "Alleen straling, lucht beweegt nooit",
      "Alleen magnetisme",
      "Alleen isolatie zonder transport",
    ],
  },
  {
    sit: () => "Een thermoskan heeft een glanzende binnenwand.",
    prompt: "Welke vorm van warmtetransport beperkt die glans vooral?",
    why: "Spiegelende laag weerkaatst straling.",
    correct: "Straling",
    distractors: ["Alleen stroming van thee", "Geleiding via de dop verdwijnt volledig", "Zwaartekracht"],
    figuurId: "thermometer-isolatie",
    figuurBijschrift: "Figuur — isoleerkan-principe",
  },
]);

const isolatieMakers: VraagMaker[] = [
  (rng) => {
    const n = naamVan(rng);
    const sits = [
      "Een thermoskan houdt thee lang warm. De binnenkant is zilverkleurig en er zit weinig lucht tussen de wanden.",
      `${n} bekijkt een isoleerkan: vacuüm tussen de wanden en een spiegelende laag.`,
      "Dubbel glas: twee ruiten met een gaslaag ertussen.",
      "Spouwmuur met isolatiemateriaal tussen binnen- en buitenblad.",
      `${n} plakt radiatorfolie achter de verwarming, tegen de muur.`,
      "Een koelbox heeft dikke schuimwanden.",
      "Een winterjas met dons houdt lucht vast.",
      "Dakisolatie van glaswol in een zolder.",
      `${n} ziet bij een practicum twee bekers: één met aluminiumfolie, één zonder.`,
      "Een vacuümkan zonder lucht tussen de wanden.",
    ];
    const i = Math.floor(rng() * sits.length);
    return openVraag({
      id: `ex-iso-${i + 1}`,
      situation: sits[i]!,
      prompt: "Noem twee manieren waarop warmteverlies hier beperkt wordt.",
      points: 2,
      modelAnswer: "Weinig geleiding/stroming door luchtlaag, vacuüm of isolatie; glans of folie beperkt straling.",
      why: "Isolatie beperkt geleiding en stroming; spiegelende laag beperkt straling.",
      accept: { keywords: ["geleiding", "stroming", "straling", "isolatie", "reflect", "lucht", "vacu", "folie", "wol"] },
      stof: T_ISO,
      figuurId: "thermometer-isolatie",
      figuurBijschrift: "Figuur — isolatie",
    });
  },
  ...mcFamilie("ex-iso-mc", T_ISO, [
    {
      sit: () => "Waarom isoleert een luchtlaag in dubbel glas?",
      prompt: "Wat is de beste reden?",
      why: "Lucht geleidt warmte slecht; weinig stroming in een smalle spouw.",
      correct: "Lucht geleidt slecht en er is weinig stroming in de smalle spouw.",
      distractors: [
        "Lucht is een betere geleider dan glas.",
        "De luchtlaag verhoogt de temperatuur van de zon.",
        "Glas zonder lucht isoleert altijd beter.",
      ],
      figuurId: "thermometer-isolatie",
      figuurBijschrift: "Figuur — isolatie",
    },
    {
      sit: (n) => `${n} hoort: 'wol isoleert omdat er lucht in vastzit.'`,
      prompt: "Klopt dat, en waarom?",
      why: "Stilstaande lucht geleidt slecht.",
      correct: "Ja: stilstaande lucht geleidt warmte slecht.",
      distractors: [
        "Nee: wol geleidt beter dan metaal.",
        "Ja, omdat wol elektriciteit geleidt.",
        "Nee: isolatie werkt alleen met vacuüm in de ruimte.",
      ],
    },
    {
      sit: () => "Een zilverkleurige binnenkant van een kan.",
      prompt: "Welke transportvorm beperkt dat vooral?",
      why: "Reflectie van straling.",
      correct: "Straling (weerkaatsen)",
      distractors: ["Alleen stroming van de thee", "Zwaartekracht", "Magnetische kracht"],
    },
    {
      sit: () => "Tocht onder een deur maakt een kamer sneller koud.",
      prompt: "Welke vorm van warmtetransport is dat vooral?",
      why: "Lucht die beweegt: stroming.",
      correct: "Stroming van lucht",
      distractors: ["Geleiding door vacuüm", "Straling van de deurknop alleen", "Dichtheid van de vloer"],
    },
  ]),
];

const geluidMakers: VraagMaker[] = [
  ...Array.from({ length: 10 }, (_, i) => (rng: Rng) => {
    const n = naamVan(rng);
    const f = pick(rng, [200, 250, 440, 500, 256, 512, 1000, 330] as const);
    const sits = [
      `Een stemvork trilt met ${f} Hz.`,
      `${n} ziet op een toongenerator ${f} Hz.`,
      `Een gitaarsnaar klinkt op ${f} Hz.`,
      `Een fluitton heeft frequentie ${f} Hz.`,
      `In een app meet ${n} ${f} Hz bij een piep.`,
      `Een luidspreker trilt ${f} keer per seconde.`,
      `Een labbron staat ingesteld op ${f} Hz.`,
      `Een bromtoon van ${f} Hz klinkt uit een speaker.`,
      `${n} leest 'frequentie ${f} Hz' bij een toon.`,
      `Een stemvork is gestemd op ${f} Hz.`,
    ];
    return mcVraag({
      id: `ex-geluid-${i + 1}`,
      situation: sits[i]!,
      prompt: "Wat betekent deze waarde?",
      why: "Frequentie is het aantal trillingen per seconde; eenheid hertz (Hz).",
      stof: T_TOON,
      correct: `Er zijn ${f} trillingen per seconde.`,
      distractors: [
        `Het geluid is ${f} dB hard.`,
        `De geluidssnelheid is ${f} m/s.`,
        `De toonhoogte is ${f} meter.`,
      ],
    });
  }),
];

const dbMakers: VraagMaker[] = Array.from({ length: 10 }, (_, i) => (rng: Rng) => {
  const n = naamVan(rng);
  const db = pick(rng, [65, 75, 85, 95, 70, 90, 100, 60] as const);
  const sits = [
    `Bij een schoolfeest meet ${n} ${db} dB.`,
    `Een stofzuiger in een kamer: ${db} dB.`,
    `Langs een drukke weg meet ${n} ${db} dB.`,
    `Een koptelefoon op 'hard': ${db} dB.`,
    `In de gymzaal tijdens een wedstrijd: ${db} dB.`,
    `${n} meet ${db} dB bij een grasmaaier.`,
    `Een concertpassage: ${db} dB.`,
    `In de kantine is het ${db} dB.`,
    `Een boormachine: ${db} dB vlakbij.`,
    `${n} staat naast een speaker: ${db} dB.`,
  ];
  const hard = db >= 85;
  return openVraag({
    id: `ex-db-${i + 1}`,
    situation: sits[i]!,
    prompt: "Is dit veilig voor lang luisteren zonder bescherming? Licht kort toe.",
    points: 2,
    modelAnswer: hard
      ? "Nee, vanaf ongeveer 85 dB kan lang luisteren gehoorschade geven."
      : "Matig: onder 85 dB is het risico kleiner, maar hard geluid blijft vermoeiend.",
    why: "Richtlijn: langdurig geluid rond/boven 85 dB kan het gehoor beschadigen.",
    accept: {
      keywords: hard
        ? ["nee", "schade", "gehoor", "85", "bescherm", "hard", "lawaai"]
        : ["matig", "ok", "veilig", "risico", "gehoor", "85", "kort"],
    },
    stof: T_GEHOOR,
  });
});

const snelheidMakers: VraagMaker[] = Array.from({ length: 10 }, (_, i) => (rng: Rng) => {
  const n = naamVan(rng);
  const row = pick(rng, SPEED);
  const sits = [
    `Een skateboard legt ${row.s} m af in ${row.t} s in een rechte lijn.`,
    `${n} fietst ${row.s} m in ${row.t} s op een recht pad.`,
    `Een robot rijdt ${row.s} m in ${row.t} s.`,
    `Op de gang loopt ${n} ${row.s} m in ${row.t} s.`,
    `Een autootje op batterij: ${row.s} m in ${row.t} s.`,
    `Een bal rolt ${row.s} m in ${row.t} s over gladde vloer.`,
    `In een (s,t)-meting: Δs = ${row.s} m, Δt = ${row.t} s.`,
    `${n} zwemt ${row.s} m in ${row.t} s in een rechte baan.`,
    `Een kart legt ${row.s} m af in ${row.t} s.`,
    `Practicum: afstand ${row.s} m, tijd ${row.t} s.`,
  ];
  return openVraag({
    id: `ex-snel-${i + 1}`,
    situation: sits[i]!,
    prompt: "Bereken de gemiddelde snelheid in m/s.",
    points: 2,
    modelAnswer: `${nlGetal(row.v, 1)} m/s`,
    why: `v = s / t = ${row.s} / ${row.t} = ${nlGetal(row.v, 1)} m/s.`,
    accept: { numbers: [row.v], tolerance: 0.15 },
    stof: T_SNEL,
    figuurId: i % 3 === 0 ? "st-schets" : undefined,
    figuurBijschrift: i % 3 === 0 ? "Figuur — (s,t)-schets" : undefined,
  });
});

const krachtMakers = mcFamilie("ex-kracht", T_KRACHT, [
  {
    sit: () => "Op een doos op tafel werkt de zwaartekracht omlaag. De tafel duwt omhoog.",
    prompt: "Hoe heet de kracht van de tafel op de doos, en wat als die even groot is als Fz?",
    why: "Normaalkracht/steunkracht balanceert Fz → nettokracht nul → doos blijft liggen.",
    correct: "Steun- of normaalkracht; de doos blijft in rust.",
    distractors: [
      "Wrijvingskracht; de doos versnelt omhoog.",
      "Magnetische kracht; de doos zweeft.",
      "Spankracht; de doos valt door de tafel.",
    ],
    figuurId: "kracht-doos",
    figuurBijschrift: "Figuur — krachten op een doos",
  },
  {
    sit: (n) => `${n} hangt een tas aan een haak. De tas hangt stil.`,
    prompt: "Welke twee krachten houden elkaar in evenwicht?",
    why: "Fz omlaag, Fs van het hengsel/haak omhoog.",
    correct: "Zwaartekracht omlaag en spankracht omhoog.",
    distractors: [
      "Alleen wrijving, geen zwaartekracht.",
      "Twee magnetische krachten opzij.",
      "Alleen luchtdruk omhoog.",
    ],
    figuurId: "kracht-doos",
    figuurBijschrift: "Figuur — krachten in evenwicht",
  },
  {
    sit: () => "Een boek glijdt over een tafel en komt tot stilstand.",
    prompt: "Welke kracht is vooral verantwoordelijk voor het afremmen?",
    why: "Wrijving werkt tegen de beweging.",
    correct: "Wrijvingskracht",
    distractors: ["Magnetische kracht van de aarde", "Spankracht van een touw", "Normaalkracht naar voren"],
  },
  {
    sit: (n) => `${n} trekt een slee aan een touw over sneeuw.`,
    prompt: "Hoe heet de kracht in het touw?",
    why: "Kracht in een touw: spankracht.",
    correct: "Spankracht",
    distractors: ["Normaalkracht van de sneeuw op het touw", "Zwaartekracht van het touw op de slee", "Druk in newton per cm²"],
  },
  {
    sit: () => "Een magneet trekt een paperclip aan.",
    prompt: "Welke kracht speelt hier, naast de zwaartekracht?",
    why: "Magnetische kracht.",
    correct: "Magnetische kracht",
    distractors: ["Spankracht in een touw", "Alleen wrijving", "Normaalkracht van de lucht"],
  },
  {
    sit: () => "Iemand duwt een krat over de vloer met constante snelheid.",
    prompt: "Wat weet je over de nettokracht (ideaal, rechte lijn)?",
    why: "Constante snelheid → nettokracht nul; duw en wrijving even groot.",
    correct: "De nettokracht is ongeveer nul.",
    distractors: [
      "Er is een grote nettokracht vooruit.",
      "Zwaartekracht is dan uitgeschakeld.",
      "Wrijving is altijd nul bij duwen.",
    ],
  },
  {
    sit: (n) => `${n} legt een blok op een weegschaal.`,
    prompt: "Wat meet de weegschaal vooral?",
    why: "De schaal meet de drukkracht / Fz (in N of omgerekend naar kg).",
    correct: "De kracht van het blok op de schaal (zwaartekracht/druk).",
    distractors: ["De snelheid van het blok", "De temperatuur van het blok", "De weerstand in ohm"],
    figuurId: "kracht-doos",
    figuurBijschrift: "Figuur — blok en steun",
  },
  {
    sit: () => "Veer van een schoolveer: hoe verder je trekt, hoe groter de kracht.",
    prompt: "Hoe heet die kracht van de veer?",
    why: "Veerkracht; groter bij grotere uitrekking.",
    correct: "Veerkracht",
    distractors: ["Magnetische kracht", "Luchtdruk alleen", "Dichtheid"],
  },
  {
    sit: () => "Op een hangende lamp werken Fz en de spankracht van het snoer.",
    prompt: "Als de lamp stilhangt, wat geldt?",
    why: "Evenwicht: krachten even groot, tegengesteld.",
    correct: "De krachten zijn even groot en tegengesteld.",
    distractors: [
      "Fz is altijd twee keer zo groot als Fs.",
      "Er werkt geen zwaartekracht op een lamp.",
      "Spankracht werkt omlaag.",
    ],
  },
  {
    sit: (n) => `${n} duwt een kast tegen een muur. De kast beweegt niet.`,
    prompt: "Welke kracht van de muur werkt op de kast?",
    why: "De muur levert een steunkracht/normaalkracht terug.",
    correct: "Steun- of normaalkracht van de muur",
    distractors: ["Spankracht van een touw in de muur", "Alleen zwaartekracht opzij", "Vermogen in watt"],
  },
]);

const stopMakers: VraagMaker[] = Array.from({ length: 10 }, (_, i) => (rng: Rng) => {
  const n = naamVan(rng);
  const row = pick(rng, STOP);
  const g = stopGetal(row);
  const sits = [
    `Een scooter rijdt ${row.vKm} km/h. Reactietijd ${nlGetal(row.reactie, 1)} s, remweg ${row.rem} m.`,
    `${n} fietst ${row.vKm} km/h. Reactietijd ${nlGetal(row.reactie, 1)} s, remweg ${row.rem} m.`,
    `Een auto: ${row.vKm} km/h, reactie ${nlGetal(row.reactie, 1)} s, remweg ${row.rem} m.`,
    `Brommer ${row.vKm} km/h. Reactietijd ${nlGetal(row.reactie, 1)} s. Remweg ${row.rem} m.`,
    `In een opgave: v = ${row.vKm} km/h, t_reactie = ${nlGetal(row.reactie, 1)} s, remweg = ${row.rem} m.`,
    `${n} rijdt ${row.vKm} km/h in de les-simulatie. Reactie ${nlGetal(row.reactie, 1)} s, rem ${row.rem} m.`,
    `Een bus: ${row.vKm} km/h, reactietijd ${nlGetal(row.reactie, 1)} s, remweg ${row.rem} m.`,
    `E-bike ${row.vKm} km/h. Reactie ${nlGetal(row.reactie, 1)} s, remweg ${row.rem} m.`,
    `Practicumkaart: ${row.vKm} km/h, ${nlGetal(row.reactie, 1)} s, remweg ${row.rem} m.`,
    `Een step met motor: ${row.vKm} km/h, reactie ${nlGetal(row.reactie, 1)} s, rem ${row.rem} m.`,
  ];
  return openVraag({
    id: `ex-stop-${i + 1}`,
    situation: sits[i]!,
    prompt: "Bereken bij benadering de stopafstand in meters (reactieafstand + remweg).",
    points: 2,
    modelAnswer: `${nlGetal(g.stop, 1)} m`,
    why: `v ≈ ${nlGetal(g.vMs, 1)} m/s; reactieafstand ≈ ${nlGetal(g.reactieAfstand, 1)} m; stop ≈ ${nlGetal(g.stop, 1)} m.`,
    accept: { numbers: [g.stop], tolerance: Math.max(1.5, g.stop * 0.12) },
    stof: T_BOTS,
  });
});

const veiligMakers = mcFamilie("ex-veilig", T_VEILIG, [
  {
    sit: () => "Bij een botsproef zie je een kreukelzone en een veiligheidsgordel.",
    prompt: "Wat is het natuurkundige idee achter beide?",
    why: "Langere botsingsduur / kleinere versnelling → kleinere piekkracht op inzittenden.",
    correct: "De botsing duurt langer, waardoor de krachten kleiner worden.",
    distractors: [
      "De auto wordt sneller, zodat de botsing korter duurt.",
      "De massa van de inzittenden wordt groter.",
      "Zwaartekracht wordt uitgeschakeld tijdens de botsing.",
    ],
  },
  {
    sit: (n) => `${n} leest dat een airbag de botsing 'verlengt'.`,
    prompt: "Wat betekent dat voor de kracht op de inzittende?",
    why: "Zelfde impulsverandering over langere tijd → kleinere kracht.",
    correct: "De gemiddelde kracht wordt kleiner.",
    distractors: [
      "De kracht wordt groter omdat het volume groter is.",
      "De snelheid van de auto neemt toe door de airbag.",
      "Massa verdwijnt tijdens de botsing.",
    ],
  },
  {
    sit: () => "Een helm bij de fiets: dik schuim binnenin.",
    prompt: "Wat is het idee?",
    why: "Langere tijd/weg om af te remmen → kleinere piekkracht op het hoofd.",
    correct: "Het hoofd botst over een langere weg/tijd, de piekkracht is kleiner.",
    distractors: [
      "De helm maakt het hoofd zwaarder, daarom veiliger.",
      "Schuim verhoogt de snelheid, dus minder schade.",
      "Een helm schakelt de zwaartekracht uit.",
    ],
  },
  {
    sit: () => "Gordel houdt je vast bij een noodstop.",
    prompt: "Wat voorkomt de gordel vooral?",
    why: "Zonder gordel blijf je met dezelfde snelheid vooruit gaan (traagheid).",
    correct: "Dat je met je snelheid tegen het dashboard of de ruit gaat.",
    distractors: [
      "Dat de auto lichter wordt.",
      "Dat de remweg nul wordt.",
      "Dat er geen wrijving meer is.",
    ],
  },
  {
    sit: (n) => `${n} ziet een kooiconstructie rond het interieur.`,
    prompt: "Wat is het doel?",
    why: "De kooi blijft stevig; kreukelzones eromheen nemen energie op.",
    correct: "Een stevige ruimte om de inzittenden, terwijl zones eromheen kunnen kreukelen.",
    distractors: [
      "De hele auto moet zo slap mogelijk zijn.",
      "De kooi maakt de botsing korter.",
      "De kooi verhoogt de massa van de inzittenden.",
    ],
  },
  {
    sit: () => "Headrest (hoofdsteun) bij een aanrijding van achteren.",
    prompt: "Wat beperkt die vooral?",
    why: "Het hoofd beweegt minder hard naar achteren t.o.v. de romp.",
    correct: "Te grote beweging van het hoofd naar achteren.",
    distractors: ["De remweg van de auto", "De dichtheid van de brandstof", "De weerstand van de verlichting"],
  },
  {
    sit: () => "Cruciale zin: 'dezelfde snelheidsverandering, langere tijd.'",
    prompt: "Wat volgt voor de kracht?",
    why: "F ≈ Δp / Δt; grotere Δt → kleinere F.",
    correct: "De kracht wordt kleiner.",
    distractors: ["De kracht wordt groter", "De massa wordt negatief", "De tijd verdwijnt uit de formule"],
  },
  {
    sit: (n) => `${n} vergelijkt een stoeprand-sprong met en zonder zachte zolen.`,
    prompt: "Waarom voelt zachte zool prettiger (natuurkunde)?",
    why: "Langere indrukkingstijd → kleinere piekkracht.",
    correct: "De afremming duurt langer, de piekkracht is kleiner.",
    distractors: [
      "De zool maakt je massa kleiner.",
      "Zachte zolen verhogen de valversnelling.",
      "Er is dan geen zwaartekracht.",
    ],
  },
  {
    sit: () => "Kreukelzone neemt kinetische energie op door vervorming.",
    prompt: "Wat is het gevolg voor de inzittenden (goed ontwerp)?",
    why: "Energie in vervorming + langere duur → kleinere krachten op mensen.",
    correct: "Minder piekkracht op de inzittenden.",
    distractors: [
      "Meer snelheid na de botsing.",
      "De gordel wordt overbodig en mag weg.",
      "De auto botst korter, dus harder.",
    ],
  },
  {
    sit: () => "Waarom is een stijve, korte botsing gevaarlijker?",
    prompt: "Kies de beste reden.",
    why: "Korte Δt → grote F.",
    correct: "De snelheid verandert in korte tijd, dus grote kracht.",
    distractors: [
      "Stijf betekent altijd minder massa.",
      "Korte botsing betekent lagere snelheid.",
      "Kracht hangt alleen van de kleur van de auto af.",
    ],
  },
]);

const momentMakers = mcFamilie("ex-moment", T_MOM, [
  {
    sit: () => "Een kind zit verder van het draaipunt op een wip dan een volwassene.",
    prompt: "Waarom kan het kind de wip dan toch in evenwicht houden?",
    why: "Moment = F × arm; grotere arm compenseert kleinere kracht.",
    correct: "Door de grotere arm is het moment ongeveer even groot.",
    distractors: [
      "Omdat zwaartekracht op kinderen kleiner is per definitie.",
      "Omdat de wip geen krachten doorgeeft.",
      "Omdat massa geen rol speelt bij evenwicht.",
    ],
    figuurId: "kracht-doos",
    figuurBijschrift: "Figuur — kracht en arm (schets)",
  },
  {
    sit: (n) => `${n} draait een moer vast: lange steeksleutel.`,
    prompt: "Wat doet een langere arm (zelfde kracht)?",
    why: "Grotere arm → groter moment.",
    correct: "Het moment wordt groter.",
    distractors: [
      "Het moment wordt kleiner.",
      "Moment bestaat alleen bij wippen.",
      "De kracht in newton verdwijnt.",
    ],
  },
  {
    sit: () => "Twee even grote krachten, maar één grijpt dichter bij het scharnier.",
    prompt: "Welke kracht levert het kleinere moment?",
    why: "M = F × arm; kleinere arm → kleiner moment.",
    correct: "De kracht dichter bij het scharnier.",
    distractors: [
      "De kracht verder van het scharnier.",
      "Ze zijn altijd gelijk, arm telt niet.",
      "Alleen de kleur van de deur telt.",
    ],
  },
  {
    sit: () => "Evenwicht op een wip: momenten links en rechts even groot.",
    prompt: "Wat moet kloppen?",
    why: "Momentevenwicht: F1·arm1 = F2·arm2.",
    correct: "F × arm is links en rechts even groot.",
    distractors: [
      "Alleen de krachten zijn gelijk, armen niet nodig.",
      "Alleen de armen zijn gelijk, krachten niet nodig.",
      "Evenwicht bestaat alleen zonder zwaartekracht.",
    ],
    figuurId: "hefboom-evenwicht",
    figuurBijschrift: "Figuur — hefboom met draaipunt",
  },
  {
    sit: (n) => `${n} opent een zware deur bij de klink, niet bij de scharnieren.`,
    prompt: "Waarom is dat makkelijker?",
    why: "Grotere arm t.o.v. de scharnieren.",
    correct: "De arm is groter, dus het moment is groter bij dezelfde duw.",
    distractors: [
      "Bij de klink is de zwaartekracht uit.",
      "Scharnieren hebben geen draaipunt.",
      "Dichtbij de scharnieren is de arm groter.",
    ],
  },
  {
    sit: () => "Een balk in evenwicht: steunpunt niet in het midden.",
    prompt: "Wat moet je meenemen als het zwaartepunt niet op het steunpunt ligt?",
    why: "Fz van de balk levert dan ook een moment.",
    correct: "Het moment van de zwaartekracht van de balk zelf.",
    distractors: [
      "Niets: balken hebben geen zwaartekracht.",
      "Alleen de kleur van de balk.",
      "Alleen de temperatuur.",
    ],
  },
  {
    sit: () => "Formule-idee: moment = kracht × loodrechte arm.",
    prompt: "Wat is 'arm' hier?",
    why: "Loodrechte afstand van draaipunt tot werklijn van F.",
    correct: "De loodrechte afstand van het draaipunt tot de werklijn van de kracht.",
    distractors: [
      "De massa in kilogram.",
      "De snelheid in m/s.",
      "De spanning in volt.",
    ],
  },
  {
    sit: (n) => `${n} hangt 2 kg op 40 cm en 4 kg op 20 cm van het midden (g = 10 N/kg, verticale F).`,
    prompt: "Wat kun je over de momenten zeggen (ideaal)?",
    why: "20 N × 0,40 m = 8 Nm; 40 N × 0,20 m = 8 Nm.",
    correct: "De momenten zijn even groot: de balk kan in evenwicht zijn.",
    distractors: [
      "Het zwaardere gewicht wint altijd, arm telt niet.",
      "Het lichtere gewicht wint altijd.",
      "Momenten kun je niet vergelijken.",
    ],
  },
  {
    sit: () => "Een kraanarm tilt een last ver van de mast.",
    prompt: "Waarom is dat zwaar voor de constructie?",
    why: "Grote arm → groot moment, grote krachten in de mast.",
    correct: "De grote arm geeft een groot moment.",
    distractors: [
      "Ver weg is de zwaartekracht kleiner.",
      "Moment is dan nul.",
      "Alleen de kleur van de last telt.",
    ],
  },
  {
    sit: () => "Je kunt een emmer tillen met een lange steel (hefboom).",
    prompt: "Wat is het voordeel van de lange steel?",
    why: "Grotere arm → kleinere kracht nodig voor hetzelfde moment.",
    correct: "Je hebt minder kracht nodig voor hetzelfde moment.",
    distractors: [
      "De last wordt lichter in massa.",
      "Zwaartekracht verdwijnt.",
      "De arm wordt kleiner.",
    ],
  },
]);

const constrMakers = mcFamilie("ex-constr", T_CONSTR, [
  {
    sit: () => "Een stalen kabel van een hangbrug wordt uit elkaar getrokken. Een pilaar wordt samengedrukt.",
    prompt: "Welke krachten horen hierbij?",
    why: "Kabel: trek; pilaar: druk.",
    correct: "Trek in de kabel, druk in de pilaar.",
    distractors: [
      "Druk in de kabel, trek in de pilaar.",
      "Alleen wrijving, geen trek of druk.",
      "Alleen zwaartekracht zonder richting.",
    ],
    figuurId: "trek-druk",
    figuurBijschrift: "Figuur — trek vs druk",
  },
  {
    sit: (n) => `${n} vergelijkt een driehoekframe en een rechthoekframe.`,
    prompt: "Welke vorm is stabieler tegen scheefzakken?",
    why: "Driehoek kan niet scheef zonder staaflengte te veranderen.",
    correct: "De driehoek: die blijft beter in vorm.",
    distractors: [
      "De rechthoek: die heeft meer hoeken.",
      "Beide even stabiel bij dezelfde staaflengte.",
      "Alleen houten frames zijn stabiel.",
    ],
    figuurId: "constructie-driehoek",
    figuurBijschrift: "Figuur — driehoek vs rechthoek",
  },
  {
    sit: () => "Een taut touw tussen twee palen hangt door onder een tas in het midden.",
    prompt: "Welke kracht zit vooral in het touw?",
    why: "Touw kan vooral trek (spankracht) opnemen.",
    correct: "Trek (spankracht)",
    distractors: ["Druk zoals in een pilaar", "Alleen magnetisme", "Vermogen"],
  },
]);

const grafiekMakers: VraagMaker[] = [
  ...Array.from({ length: 6 }, (_, i) => (rng: Rng) => {
    const n = naamVan(rng);
    const sits = [
      "In een (s,t)-diagram zie je een rechte lijn omhoog vanuit de oorsprong.",
      `${n} tekent s tegen t: een rechte lijn, s neemt regelmatig toe.`,
      "Een (s,t)-grafiek is een rechte door de oorsprong.",
      "Practicum: afstand-tijd is een rechte lijn omhoog.",
      "In het CE-achtige diagram loopt s lineair met t.",
      `${n} ziet een rechte (s,t)-lijn, geen knik.`,
    ];
    return openVraag({
      id: `ex-grafiek-${i + 1}`,
      situation: sits[i]!,
      prompt: "Wat betekent de helling van die lijn? Noem ook de eenheid.",
      points: 2,
      modelAnswer: "Gemiddelde snelheid in m/s (of km/h).",
      why: "Helling Δs/Δt = snelheid; eenheid m/s als s in m en t in s.",
      accept: { keywords: ["snelheid", "helling", "m/s", "afstand", "tijd"] },
      stof: T_GRAF,
      figuurId: "st-schets",
      figuurBijschrift: "Figuur — (s,t)-diagram",
    });
  }),
  ...mcFamilie("ex-grafiek-mc", T_GRAF, [
    {
      sit: () => "Een (s,t)-diagram is een horizontale lijn.",
      prompt: "Wat betekent dat?",
      why: "s verandert niet: stilstand (v = 0).",
      correct: "De afstand blijft gelijk: stilstand.",
      distractors: [
        "Constante, grote snelheid.",
        "Versnelling omhoog.",
        "De tijd staat stil.",
      ],
      figuurId: "st-schets",
      figuurBijschrift: "Figuur — (s,t)-diagram",
    },
    {
      sit: (n) => `${n} ziet in een (v,t)-diagram een horizontale lijn boven de as.`,
      prompt: "Wat geldt voor de beweging?",
      why: "v constant en niet nul: eenparige beweging.",
      correct: "De snelheid is constant (niet nul).",
      distractors: [
        "Het voorwerp staat stil.",
        "De afstand is altijd nul.",
        "Er is geen tijd.",
      ],
    },
    {
      sit: () => "Helling in een (v,t)-diagram.",
      prompt: "Wat stelt die helling voor?",
      why: "Δv/Δt = versnelling.",
      correct: "Versnelling (of vertraging) in m/s²",
      distractors: ["Afstand in meters", "Massa in kg", "Spanning in volt"],
    },
    {
      sit: () => "In een tabel neemt s elke 2 s met 8 m toe.",
      prompt: "Wat is de gemiddelde snelheid?",
      why: "v = 8/2 = 4 m/s.",
      correct: "4 m/s",
      distractors: ["8 m/s", "2 m/s", "16 m/s"],
    },
  ]),
];

const leesTeksten = [
  {
    tekst: (n: string) =>
      `${n} leest in een CE-achtige bron: "In een gesloten stroomkring loopt elektrische stroom van de pluspool door de componenten terug naar de minpool. Bij een serieschakeling is er één pad: de stroomsterkte is overal gelijk. Bij een parallelschakeling splitst de stroom zich. Een lamp brandt alleen als de kring gesloten is. Koper geleidt stroom goed; plastic isoleert."`,
    prompt: "Wat betekent volgens de tekst ‘gesloten stroomkring’ voor de lamp?",
    why: "De tekst: een lamp brandt alleen als de kring gesloten is — dan kan stroom lopen.",
    correct: "De lamp kan branden omdat er stroom kan lopen.",
    distractors: [
      "De lamp is dan altijd kapot.",
      "Er mag geen schakelaar in de kring zitten.",
      "Alleen plastic mag in de kring zitten.",
    ] as [string, string, string],
  },
  {
    tekst: () =>
      `"In een gesloten stroomkring loopt elektrische stroom van de pluspool door de componenten terug naar de minpool. Bij een serieschakeling is er één pad: de stroomsterkte is overal gelijk. Bij een parallelschakeling splitst de stroom zich. Een lamp brandt alleen als de kring gesloten is. Koper geleidt stroom goed; plastic isoleert."`,
    prompt: "Waar wijst in de tekst het verschil tussen serie en parallel vooral op?",
    why: "Serie: één pad, stroom gelijk; parallel: stroom splitst zich.",
    correct: "Of de stroom één pad volgt of zich splitst.",
    distractors: [
      "Of de batterij van plastic of koper is.",
      "Of de lamp warm of koud is.",
      "Of de pluspool boven of onder zit.",
    ] as [string, string, string],
  },
  {
    tekst: () =>
      `"Dichtheid is massa per volume. Twee blokken kunnen even groot zijn (zelfde volume). Het zwaardere blok heeft dan een grotere dichtheid. Een stof drijft op water als de dichtheid kleiner is dan die van water. Steen zinkt meestal; veel houtsoorten drijven."`,
    prompt: "Wat moet je volgens de tekst vergelijken om te weten of iets drijft?",
    why: "De tekst: drijven als de dichtheid kleiner is dan die van water.",
    correct: "De dichtheid van de stof met die van water.",
    distractors: [
      "Alleen de kleur van het blok.",
      "Alleen de vorm van het waterbakje.",
      "Alleen de temperatuur van de lucht.",
    ] as [string, string, string],
  },
  {
    tekst: () =>
      `"Dichtheid is massa per volume. Twee blokken kunnen even groot zijn (zelfde volume). Het zwaardere blok heeft dan een grotere dichtheid. Een stof drijft op water als de dichtheid kleiner is dan die van water. Steen zinkt meestal; veel houtsoorten drijven."`,
    prompt: "Wat volgt uit de tekst als twee blokken hetzelfde volume hebben en A zwaarder is?",
    why: "Zwaarder bij zelfde volume → grotere dichtheid.",
    correct: "Blok A heeft een grotere dichtheid.",
    distractors: [
      "Blok A heeft een kleiner volume.",
      "Dichtheid hangt alleen van de kleur af.",
      "A drijft altijd, B zinkt altijd.",
    ] as [string, string, string],
  },
  {
    tekst: () =>
      `"Stopafstand is reactieafstand plus remweg. In de reactietijd blijft de snelheid ongeveer gelijk: de bestuurder heeft het rempedaal nog niet ingedrukt. Daarna neemt de snelheid af door de remkracht. Een kreukelzone en een gordel zorgen dat de botsing langer duurt, zodat de krachten op inzittenden kleiner worden."`,
    prompt: "Uit welke twee stukken bestaat de stopafstand volgens de tekst?",
    why: "Stopafstand = reactieafstand + remweg.",
    correct: "Reactieafstand plus remweg.",
    distractors: [
      "Alleen de remweg.",
      "Massa plus vermogen.",
      "Spanning plus stroom.",
    ] as [string, string, string],
  },
  {
    tekst: () =>
      `"Warmte gaat op drie manieren: geleiding in een vaste stof, stroming in een vloeistof of gas, en straling die ook door vacuüm kan. Isolatie beperkt geleiding en stroming. Een glanzende laag weerkaatst straling. Dubbel glas heeft een luchtlaag; lucht geleidt slecht."`,
    prompt: "Welke vorm kan volgens de tekst ook door vacuüm?",
    why: "De tekst noemt straling die door vacuüm kan.",
    correct: "Straling",
    distractors: ["Stroming van lucht in vacuüm", "Geleiding via een vacuümdraad", "Alleen convectie"] as [
      string,
      string,
      string,
    ],
  },
  {
    tekst: (n: string) =>
      `${n} leest: "Frequentie is het aantal trillingen per seconde, eenheid hertz. Een hoge toon heeft een hoge frequentie. Geluidssterkte druk je uit in decibel. Langdurig geluid vanaf ongeveer 85 dB kan het gehoor beschadigen. Oordoppen verlagen de sterkte die het oor bereikt."`,
    prompt: "Wat is volgens de tekst het risico vanaf ongeveer 85 dB?",
    why: "Langdurig geluid vanaf ±85 dB kan gehoorschade geven.",
    correct: "Gehoorschade bij lang luisteren.",
    distractors: [
      "De toonhoogte wordt automatisch lager.",
      "De frequentie wordt 0 Hz.",
      "Decibel verdwijnt als eenheid.",
    ] as [string, string, string],
  },
  {
    tekst: () =>
      `"Kracht heeft de eenheid newton. Zwaartekracht trekt naar de aarde. Een tafel kan een steunkracht omhoog leveren. Wrijving werkt tegen glijden. In een touw zit spankracht. Als de nettokracht nul is, blijft de snelheid constant — ook nul."`,
    prompt: "Wat volgt uit de tekst als de nettokracht nul is?",
    why: "Nettokracht nul → constante snelheid (ook stilstand).",
    correct: "De snelheid blijft constant (ook 0).",
    distractors: [
      "Het voorwerp versnelt altijd.",
      "Er werkt geen zwaartekracht meer.",
      "Wrijving wordt oneindig.",
    ] as [string, string, string],
  },
  {
    tekst: () =>
      `"Moment is kracht maal arm. De arm is de loodrechte afstand van het draaipunt tot de werklijn van de kracht. Een kleine kracht ver van het draaipunt kan hetzelfde moment geven als een grote kracht dichtbij. Bij evenwicht zijn de momenten met de klok mee en tegen de klok in even groot."`,
    prompt: "Wat is volgens de tekst de arm?",
    why: "Loodrechte afstand draaipunt–werklijn.",
    correct: "De loodrechte afstand van het draaipunt tot de werklijn van de kracht.",
    distractors: [
      "De massa van het voorwerp in kg.",
      "De snelheid van de wip.",
      "De spanning over een lamp.",
    ] as [string, string, string],
  },
  {
    tekst: (n: string) =>
      `${n} leest over vermogen: "Vermogen is energie per tijd, eenheid watt. P = U · I bij elektrische apparaten. Een apparaat van 2000 W zet meer energie per seconde om dan een apparaat van 100 W. Energie kun je ook in kWh meten: vermogen maal tijd."`,
    prompt: "Wat is vermogen volgens de tekst?",
    why: "Energie per tijd, eenheid watt.",
    correct: "Energie per tijd, eenheid watt.",
    distractors: ["Massa per volume", "Kracht maal arm", "Trillingen per seconde"] as [string, string, string],
  },
  {
    tekst: () =>
      `"In een (s,t)-diagram zet je afstand tegen tijd. Een rechte lijn omhoog betekent constante snelheid. De helling is Δs/Δt. Een horizontale lijn betekent stilstand. In een (v,t)-diagram is de helling de versnelling."`,
    prompt: "Wat betekent een horizontale lijn in een (s,t)-diagram volgens de tekst?",
    why: "Horizontaal: s verandert niet → stilstand.",
    correct: "Stilstand.",
    distractors: ["Constante, grote snelheid", "Grote versnelling", "Negatieve massa"] as [string, string, string],
  },
  {
    tekst: () =>
      `"Ohm: R = U / I. Spanning in volt, stroom in ampère, weerstand in ohm. In serie is de stroom overal gelijk. In parallel is de spanning over de takken gelijk. Een zekering onderbreekt de kring bij te grote stroom."`,
    prompt: "Welke formule geeft de tekst voor weerstand?",
    why: "R = U / I.",
    correct: "R = U / I",
    distractors: ["R = U · I", "R = I / U", "R = P · t"] as [string, string, string],
  },
  {
    tekst: (n: string) =>
      `${n} leest: "Een takel verdeelt de last over meer kabels. Ideaal is de trekkracht ongeveer last gedeeld door het aantal kabels. Wrijving maakt de trekkracht groter. Een vaste katrol verandert vooral de richting van de kracht."`,
    prompt: "Wat doet een vaste katrol volgens de tekst vooral?",
    why: "Richting van de kracht veranderen.",
    correct: "De richting van de kracht veranderen.",
    distractors: [
      "De last lichter maken in massa.",
      "De zwaartekracht uitschakelen.",
      "De stroom in een lamp verhogen.",
    ] as [string, string, string],
  },
  {
    tekst: () =>
      `"Druk is kracht per oppervlakte. Dezelfde kracht op een klein oppervlak geeft grotere druk. Daarom zakt een scherpe spijker eerder in hout dan een stompe. Ski's verdelen het gewicht over een groot oppervlak, zodat je minder wegzakt."`,
    prompt: "Waarom zakt een scherpe spijker eerder in volgens de tekst?",
    why: "Klein oppervlak → grote druk.",
    correct: "Klein oppervlak, dus grotere druk.",
    distractors: [
      "De spijker heeft minder massa, dus meer druk.",
      "Druk hangt alleen van de kleur af.",
      "Een spijker heeft geen kracht.",
    ] as [string, string, string],
  },
  {
    tekst: () =>
      `"Geluidsnelheid in lucht is ongeveer 340 m/s. In water is geluid sneller. Echo: geluid heen en terug. Afstand ≈ (snelheid × tijd) / 2. Zonder medium (vacuüm) plant geluid zich niet voort; licht wel."`,
    prompt: "Wat gebeurt er met geluid in vacuüm volgens de tekst?",
    why: "Zonder medium plant geluid zich niet voort.",
    correct: "Geluid plant zich daar niet voort.",
    distractors: [
      "Geluid wordt sneller dan licht.",
      "De echo wordt twee keer zo hard.",
      "De frequentie wordt 340 Hz vast.",
    ] as [string, string, string],
  },
  {
    tekst: (n: string) =>
      `${n} leest over isolatie: "Stilstaande lucht geleidt slecht. Wol en piepschuim houden lucht vast. Een vacuüm tussen wanden stopt stroming en beperkt geleiding. Spiegelende folie weerkaatst straling. Tocht is stroming van lucht en koelt een kamer."`,
    prompt: "Wat is tocht volgens de tekst?",
    why: "Stroming van lucht die koelt.",
    correct: "Stroming van lucht die een kamer koelt.",
    distractors: ["Geleiding in koper", "Straling van de zon alleen", "Dichtheid van steen"] as [string, string, string],
  },
  {
    tekst: () =>
      `"Bij een botsing verandert de snelheid. Impuls heeft te maken met massa en snelheid. Als de verandering langer duurt, is de piekkracht kleiner. Kreukelzone, airbag en helm maken de botsing 'zachter' door die tijd of weg te verlengen."`,
    prompt: "Waarom noemt de tekst een airbag 'zachter'?",
    why: "Langere tijd → kleinere piekkracht.",
    correct: "De verandering duurt langer, de piekkracht is kleiner.",
    distractors: [
      "De massa van de inzittende wordt groter.",
      "De auto rijdt daarna sneller.",
      "Zwaartekracht valt weg.",
    ] as [string, string, string],
  },
  {
    tekst: () =>
      `"Eenheid van kracht is newton, van energie joule, van vermogen watt. 1 W = 1 J/s. Temperatuur meet je in °C. Frequentie in Hz. Druk kun je in N/cm² of pascal opgeven. Verwissel deze eenheden niet in een berekening."`,
    prompt: "Wat is 1 watt volgens de tekst?",
    why: "1 W = 1 J/s.",
    correct: "1 joule per seconde",
    distractors: ["1 newton per kilogram", "1 trilling per minuut", "1 volt per ohm"] as [string, string, string],
  },
  {
    tekst: (n: string) =>
      `${n} leest: "In serie delen weerstanden de bronspanning. In parallel krijgt elke tak de bronspanning. Een ampèremeter zet je in serie, een voltmeter parallel. Kortsluiting: een pad met heel kleine weerstand, grote stroom, zekering kan springen."`,
    prompt: "Hoe zet je volgens de tekst een voltmeter?",
    why: "Voltmeter parallel.",
    correct: "Parallel",
    distractors: ["In serie met de bron alleen", "Los van de kring in vacuüm", "Altijd na de zekering in serie met alles"] as [
      string,
      string,
      string,
    ],
  },
  {
    tekst: () =>
      `"Materialen: metalen geleiden warmte en stroom vaak goed. Kunststoffen isoleren. Hout geleidt warmte matig. Corrosie treft vooral sommige metalen. Voor een pansteel kies je een isolator, voor een draad een geleider."`,
    prompt: "Wat kies je volgens de tekst voor een pansteel?",
    why: "Isolator, zodat het handvat minder heet wordt.",
    correct: "Een isolator",
    distractors: ["Een goede elektrische geleider zoals blank koper", "Alleen een magneet", "Een vacuüm zonder steel"] as [
      string,
      string,
      string,
    ],
  },
];

const leesMcMakers: VraagMaker[] = leesTeksten.map((row, i) => (rng) =>
  mcVraag({
    id: `ex-lees-mc-${i + 1}`,
    situation: row.tekst(naamVan(rng)),
    prompt: row.prompt,
    why: row.why,
    stof: T_LEES,
    skill: "lees",
    correct: row.correct,
    distractors: row.distractors,
  }),
);

const leesOpenBronnen = [
  {
    tekst: `"Stopafstand is reactieafstand plus remweg. In de reactietijd blijft de snelheid ongeveer gelijk: de bestuurder heeft het rempedaal nog niet ingedrukt. Daarna neemt de snelheid af door de remkracht. Een kreukelzone en een gordel zorgen dat de botsing langer duurt, zodat de krachten op inzittenden kleiner worden."`,
    prompt: "Leg met de tekst uit waarom een kreukelzone kan helpen bij een botsing.",
    model: "De botsing duurt langer, waardoor de krachten op inzittenden kleiner worden.",
    why: "Bron: langere botsingsduur → kleinere krachten.",
    kw: ["langer", "kracht", "botsing", "kleiner", "inzittend", "duur"],
  },
  {
    tekst: `"Isolatie beperkt geleiding en stroming. Een glanzende laag weerkaatst straling. Dubbel glas heeft een luchtlaag; lucht geleidt slecht. Tocht is luchtstroming en koelt een ruimte."`,
    prompt: "Noem uit de tekst twee manieren waarop een huis warmte kan vasthouden.",
    model: "Isolatie (luchtlaag/dubbel glas) en een glanzende laag tegen straling; tocht vermijden.",
    why: "Tekst: isolatie + reflectie; tocht is stroming.",
    kw: ["isolatie", "lucht", "straling", "glas", "tocht", "geleiding"],
  },
  {
    tekst: `"Dichtheid is massa per volume. Een stof drijft als de dichtheid kleiner is dan die van water. Twee blokken met hetzelfde volume: het zwaardere heeft de grotere dichtheid."`,
    prompt: "Leg met de tekst uit hoe je twee blokken van gelijk volume op dichtheid vergelijkt.",
    model: "Het zwaardere blok heeft de grotere dichtheid.",
    why: "Zelfde V: grotere m → grotere ρ.",
    kw: ["zwaarder", "dichtheid", "volume", "massa"],
  },
  {
    tekst: `"In serie is er één pad. Een onderbreking stopt de hele kring. In parallel blijven andere takken werken als één lamp uitvalt. Koper geleidt, plastic isoleert."`,
    prompt: "Leg met de tekst uit waarom huisverlichting meestal parallel is.",
    model: "Als één lamp uitvalt, blijven andere takken werken.",
    why: "Parallel: eigen paden.",
    kw: ["parallel", "tak", "lamp", "uit", "andere"],
  },
  {
    tekst: `"Moment = F × arm. Een kleine kracht ver van het draaipunt kan hetzelfde moment geven als een grote kracht dichtbij. Bij evenwicht zijn de momenten even groot."`,
    prompt: "Leg met de tekst uit hoe een kind verder op de wip een volwassene in evenwicht houdt.",
    model: "Grotere arm, dus het moment kan even groot zijn bij kleinere kracht.",
    why: "Tekst: kleine F × grote arm.",
    kw: ["arm", "moment", "kracht", "evenwicht"],
  },
  {
    tekst: `"Langdurig geluid vanaf ongeveer 85 dB kan het gehoor beschadigen. Oordoppen verlagen de sterkte die het oor bereikt. Frequentie is toonhoogte, decibel is sterkte."`,
    prompt: "Leg met de tekst uit waarom oordoppen bij hard geluid zinvol zijn.",
    model: "Ze verlagen de geluidssterkte die het oor bereikt, risico op schade daalt.",
    why: "Tekst: oordoppen verlagen sterkte.",
    kw: ["oordop", "sterkte", "gehoor", "schade", "db", "verlaag"],
  },
  {
    tekst: `"P = U · I. Vermogen is energie per seconde. Een apparaat van 2000 W zet meer energie per seconde om dan 100 W. Energie = vermogen × tijd."`,
    prompt: "Leg met de tekst uit wat een groter vermogen betekent.",
    model: "Meer energie per seconde.",
    why: "Vermogen = energie per tijd.",
    kw: ["energie", "seconde", "vermogen", "tijd", "watt"],
  },
  {
    tekst: `"Druk is kracht per oppervlakte. Zelfde F, kleiner A → grotere druk. Ski's verdelen gewicht over een groot oppervlak."`,
    prompt: "Leg met de tekst uit waarom ski's minder wegzakken in sneeuw.",
    model: "Groot oppervlak, dus kleinere druk bij hetzelfde gewicht.",
    why: "p = F/A.",
    kw: ["oppervlak", "druk", "kracht", "verdeel", "ski"],
  },
  {
    tekst: `"Een vaste katrol verandert vooral de richting. Een takel verdeelt de last over meer kabels: F_trek ≈ last / n (ideaal). Wrijving maakt F_trek groter."`,
    prompt: "Leg met de tekst het voordeel van meer kabels bij een takel uit.",
    model: "Kleinere trekkracht nodig (ongeveer last/n).",
    why: "Tekst: last gedeeld door aantal kabels.",
    kw: ["trek", "kabel", "last", "kleiner", "takel"],
  },
  {
    tekst: `"Helling in (s,t) is snelheid. Horizontaal in (s,t) is stilstand. Helling in (v,t) is versnelling. Reken met de eenheden op de assen."`,
    prompt: "Leg met de tekst uit wat je afleest uit de helling van een (s,t)-lijn.",
    model: "De snelheid (Δs/Δt).",
    why: "Tekst: helling is snelheid.",
    kw: ["snelheid", "helling", "afstand", "tijd"],
  },
];

const leesOpenMakers: VraagMaker[] = leesOpenBronnen.map((row, i) => () =>
  openVraag({
    id: `ex-lees-open-${i + 1}`,
    situation: row.tekst,
    prompt: row.prompt,
    points: 2,
    modelAnswer: row.model,
    why: row.why,
    accept: { keywords: row.kw },
    stof: T_LEES,
    skill: "lees",
  }),
);

const EXAMEN_MAKERS: VraagMaker[] = [
  ...serieMakers,
  ...parallelMakers,
  ...ohmMakers,
  ...vermogenMakers,
  ...eenheidMakers,
  ...dichtMakers,
  ...drijfMakers,
  ...materiaalMakers,
  ...warmteMakers,
  ...isolatieMakers,
  ...geluidMakers,
  ...dbMakers,
  ...snelheidMakers,
  ...krachtMakers,
  ...stopMakers,
  ...veiligMakers,
  ...momentMakers,
  ...constrMakers,
  ...grafiekMakers,
  ...leesMcMakers,
  ...leesOpenMakers,
];

export function bouwExamenBank(rng: Rng): Question[] {
  return EXAMEN_MAKERS.map((make) => make(rng));
}

export function examenBankGrootte(): number {
  return EXAMEN_MAKERS.length;
}
