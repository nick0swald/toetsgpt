import { nlGetal } from "./format.ts";
import { pick, type Rng } from "./shuffle.ts";
import type { Question, StofTag } from "./types.ts";
import { KLAS_TOPICS, type KlasTopicId } from "./klas-oefen-topics.ts";
import {
  mcFamilie,
  mcVraag,
  naamVan,
  openVraag,
  type VraagMaker,
} from "./oefen-maak.ts";

function tag(topicId: KlasTopicId): StofTag {
  const t = KLAS_TOPICS.find((x) => x.id === topicId)!;
  return { hoofdstukId: t.hoofdstukId, paragraafId: t.id, label: t.label };
}

const T1 = tag("h10-p1");
const T2 = tag("h10-p2");
const T3 = tag("h10-p3");
const T4 = tag("h10-p4");
const T5 = tag("h14-p1");
const T6 = tag("h14-p2");
const T7 = tag("h14-p3");
const T8 = tag("h14-p4");

const FZ_M = [2, 3, 4, 5, 6, 8] as const;
const G = 10;

const SAMEN = [
  { f1: 20, f2: 15, zelfde: 35, tegen: 5 },
  { f1: 30, f2: 25, zelfde: 55, tegen: 5 },
  { f1: 40, f2: 35, zelfde: 75, tegen: 5 },
  { f1: 50, f2: 20, zelfde: 70, tegen: 30 },
  { f1: 24, f2: 18, zelfde: 42, tegen: 6 },
  { f1: 12, f2: 8, zelfde: 20, tegen: 4 },
  { f1: 45, f2: 15, zelfde: 60, tegen: 30 },
  { f1: 28, f2: 12, zelfde: 40, tegen: 16 },
  { f1: 16, f2: 16, zelfde: 32, tegen: 0 },
  { f1: 60, f2: 25, zelfde: 85, tegen: 35 },
] as const;

const HEF = [
  { f1: 20, arm1: 0.5, arm2: 1.0, f2: 10 },
  { f1: 30, arm1: 0.4, arm2: 1.2, f2: 10 },
  { f1: 40, arm1: 0.6, arm2: 2.0, f2: 12 },
  { f1: 50, arm1: 0.8, arm2: 1.0, f2: 40 },
  { f1: 25, arm1: 0.4, arm2: 1.0, f2: 10 },
  { f1: 20, arm1: 0.6, arm2: 1.5, f2: 8 },
  { f1: 15, arm1: 0.8, arm2: 1.2, f2: 10 },
  { f1: 36, arm1: 0.5, arm2: 1.5, f2: 12 },
  { f1: 18, arm1: 0.4, arm2: 0.8, f2: 9 },
  { f1: 24, arm1: 0.5, arm2: 2.0, f2: 6 },
] as const;

const TAKEL = [
  { n: 2, last: 120, trek: 60 },
  { n: 3, last: 180, trek: 60 },
  { n: 4, last: 240, trek: 60 },
  { n: 2, last: 300, trek: 150 },
  { n: 3, last: 240, trek: 80 },
  { n: 4, last: 200, trek: 50 },
  { n: 2, last: 80, trek: 40 },
  { n: 3, last: 150, trek: 50 },
  { n: 5, last: 250, trek: 50 },
  { n: 4, last: 160, trek: 40 },
] as const;

const DRUK = [
  { F: 200, klein: 4, groot: 20, pK: 50, pG: 10 },
  { F: 400, klein: 5, groot: 40, pK: 80, pG: 10 },
  { F: 600, klein: 2, groot: 50, pK: 300, pG: 12 },
  { F: 100, klein: 4, groot: 20, pK: 25, pG: 5 },
  { F: 250, klein: 5, groot: 50, pK: 50, pG: 5 },
  { F: 120, klein: 2, groot: 20, pK: 60, pG: 6 },
  { F: 80, klein: 4, groot: 40, pK: 20, pG: 2 },
  { F: 300, klein: 5, groot: 25, pK: 60, pG: 12 },
  { F: 180, klein: 3, groot: 30, pK: 60, pG: 6 },
  { F: 90, klein: 3, groot: 15, pK: 30, pG: 6 },
] as const;

const soortMakers = mcFamilie("klas-soort", T1, [
  {
    sit: (n) => `Op een tas van ${n} werkt de zwaartekracht omlaag. De riem trekt omhoog.`,
    prompt: "Hoe heten deze twee krachten?",
    why: "Zwaartekracht Fz omlaag; de riem levert spankracht Fs omhoog.",
    correct: "Zwaartekracht (Fz) en spankracht (Fs)",
    distractors: [
      "Normaalkracht (Fn) en wrijvingskracht (Fw)",
      "Magnetische kracht en elektrische kracht",
      "Drukkracht en luchtdruk alleen",
    ],
    figuurId: "fbd-hangend",
    figuurBijschrift: "Figuur — Fs omhoog, Fz omlaag",
  },
  {
    sit: (n) => `${n} hangt een plant aan een haak. De plant hangt stil.`,
    prompt: "Welke krachten werken vooral op de pot?",
    why: "Fz omlaag, Fs van het touw/haak omhoog.",
    correct: "Zwaartekracht omlaag en spankracht omhoog",
    distractors: [
      "Twee wrijvingskrachten opzij",
      "Alleen magnetische kracht",
      "Alleen luchtdruk omlaag",
    ],
    figuurId: "fbd-hangend",
    figuurBijschrift: "Figuur — hangende massa",
  },
  {
    sit: () => "Een boek ligt stil op tafel.",
    prompt: "Welke twee krachten houden elkaar in evenwicht?",
    why: "Fz omlaag, Fn van de tafel omhoog.",
    correct: "Zwaartekracht en steun-/normaalkracht",
    distractors: [
      "Spankracht en magnetische kracht",
      "Alleen wrijving vooruit en achteruit",
      "Elektrische kracht en veerkracht",
    ],
    figuurId: "fbd-tafel",
    figuurBijschrift: "Figuur — Fz en Fn op een blok",
  },
  {
    sit: (n) => `${n} trekt een slee aan een touw.`,
    prompt: "Hoe heet de kracht in het touw?",
    why: "Kracht in een touw: spankracht.",
    correct: "Spankracht (Fs)",
    distractors: ["Normaalkracht van de sneeuw op het touw", "Zwaartekracht van het touw", "Druk in N/cm²"],
  },
  {
    sit: () => "Een magneet trekt een paperclip omhoog van tafel.",
    prompt: "Welke kracht wint het van de zwaartekracht?",
    why: "Magnetische kracht omhoog groter dan Fz.",
    correct: "Magnetische kracht",
    distractors: ["Spankracht in een touw dat er niet is", "Alleen wrijving", "Normaalkracht van de lucht"],
  },
  {
    sit: (n) => `${n} duwt een doos; de doos glijdt en stopt daarna.`,
    prompt: "Welke kracht remt de doos af?",
    why: "Wrijving werkt tegen de beweging.",
    correct: "Wrijvingskracht",
    distractors: ["Magnetische kracht van de aarde", "Spankracht", "Vermogen"],
  },
  {
    sit: () => "Een veer wordt uitgerekt; ze trekt terug.",
    prompt: "Hoe heet die kracht van de veer?",
    why: "Veerkracht.",
    correct: "Veerkracht",
    distractors: ["Dichtheid", "Luchtdruk alleen", "Magnetische kracht"],
  },
  {
    sit: (n) => `${n} staat op een weegschaal.`,
    prompt: "Wat meet de schaal vooral?",
    why: "Drukkracht / Fz op de schaal.",
    correct: "De kracht van jou op de schaal (zwaartekracht/druk)",
    distractors: ["Je snelheid", "Je temperatuur", "Je weerstand in ohm"],
    figuurId: "fbd-tafel",
    figuurBijschrift: "Figuur — Fz en Fn",
  },
  {
    sit: () => "Een lamp hangt aan een snoer, stil.",
    prompt: "Wat geldt voor Fz en Fs?",
    why: "Evenwicht: even groot, tegengesteld.",
    correct: "Ze zijn even groot en tegengesteld.",
    distractors: [
      "Fz is altijd twee keer Fs.",
      "Er werkt geen zwaartekracht.",
      "Spankracht werkt omlaag.",
    ],
    figuurId: "fbd-hangend",
    figuurBijschrift: "Figuur — Fs en Fz",
  },
  {
    sit: (n) => `${n} legt een magneet tegen de zijkant van de koelkastdeur. De magneet blijft hangen.`,
    prompt: "Welke extra kracht (naast Fz) houdt de magneet op zijn plaats?",
    why: "Magnetische kracht naar de deur; wrijving kan glijden voorkomen.",
    correct: "Magnetische kracht (en wrijving tegen glijden)",
    distractors: ["Alleen zwaartekracht omhoog", "Spankracht van een touw", "Vermogen van de koelkast"],
  },
]);

const fzMakers: VraagMaker[] = Array.from({ length: 10 }, (_, i) => (rng: Rng) => {
  const n = naamVan(rng);
  const m = pick(rng, FZ_M);
  const fz = m * G;
  const sits = [
    `${n} tilt een krat van ${m} kg. Neem g = ${G} N/kg.`,
    `Een tas van ${m} kg hangt stil. g = ${G} N/kg.`,
    `Een blok op tafel: massa ${m} kg, g = ${G} N/kg.`,
    `${n} weegt een kist: ${m} kg. Neem g = ${G} N/kg.`,
    `Practicum: m = ${m} kg, g = ${G} N/kg.`,
    `Een emmer met zand: ${m} kg. g = ${G} N/kg.`,
    `${n} heeft een rugzak van ${m} kg. g = ${G} N/kg.`,
    `Een gewicht van ${m} kg aan een veer. g = ${G} N/kg.`,
    `Een baksteen ${m} kg. Neem g = ${G} N/kg.`,
    `Labkaart: massa ${m} kg, g = ${G} N/kg.`,
  ];
  return openVraag({
    id: `klas-fz-${i + 1}`,
    situation: sits[i]!,
    prompt: "Bereken de zwaartekracht Fz in newton.",
    points: 2,
    modelAnswer: `${fz} N`,
    why: `Fz = m · g = ${m} · ${G} = ${fz} N.`,
    accept: { numbers: [fz], tolerance: 0.5 },
    stof: T1,
    figuurId: i % 2 === 0 ? "fbd-tafel" : "fbd-hangend",
    figuurBijschrift: i % 2 === 0 ? "Figuur — Fz en Fn op een blok" : "Figuur — Fz omlaag",
  });
});

const magneetMakers = mcFamilie("klas-magneet", T1, [
  {
    sit: () => "Twee gelijke polen van een magneet worden dicht bij elkaar gehouden.",
    prompt: "Wat gebeurt er, en hoe noem je dat?",
    why: "Gelijke polen stoten elkaar af (magnetische kracht).",
    correct: "Ze stoten elkaar af (afstoten).",
    distractors: [
      "Ze trekken elkaar aan.",
      "Er is geen kracht tussen magneten.",
      "Alleen zwaartekracht speelt een rol.",
    ],
  },
  {
    sit: (n) => `${n} houdt noord tegen zuid van twee staafmagneten.`,
    prompt: "Wat gebeurt er?",
    why: "Ongelijke polen trekken elkaar aan.",
    correct: "Ze trekken elkaar aan.",
    distractors: [
      "Ze stoten elkaar altijd af.",
      "Er is geen magnetische kracht.",
      "De magneten worden elektrisch neutraal.",
    ],
  },
  {
    sit: () => "Een kompasnaald wijst (ongeveer) naar het noorden.",
    prompt: "Welke kracht speelt hier?",
    why: "Aarde is een magneet; magnetische kracht op de naald.",
    correct: "Magnetische kracht",
    distractors: ["Spankracht van een touw", "Alleen wrijving met de lucht", "Vermogen"],
  },
  {
    sit: (n) => `${n} schuift een magneet onder papier met ijzervijlsel.`,
    prompt: "Wat zie je vooral ontstaan?",
    why: "Veldlijnen-patroon door magnetische kracht.",
    correct: "Een patroon van veldlijnen in het vijlsel",
    distractors: ["Een stroomkring zonder batterij", "Dichtheid van het papier", "Een (s,t)-diagram"],
  },
  {
    sit: () => "Gelijke polen, grotere afstand.",
    prompt: "Wat gebeurt er met de magnetische kracht (kwalitatief)?",
    why: "Verder weg: zwakkere magnetische kracht.",
    correct: "De kracht wordt zwakker.",
    distractors: [
      "De kracht wordt altijd sterker.",
      "Afstand speelt geen rol.",
      "De polen wisselen van naam.",
    ],
  },
  {
    sit: (n) => `${n} merkt dat een magneet een paperclip optilt maar een houten pin niet.`,
    prompt: "Wat is de beste uitleg?",
    why: "Magnetische kracht werkt op (ferro)magnetische materialen, niet op hout.",
    correct: "Hout is niet magnetisch; de paperclip wel.",
    distractors: [
      "Hout is altijd zwaarder dan staal.",
      "Magneten werken alleen in vacuüm.",
      "Paperclips hebben geen massa.",
    ],
  },
  {
    sit: () => "Twee magneten plakken aan elkaar, N tegen Z.",
    prompt: "Hoe heten de polen in dat contact?",
    why: "Aantrekken: ongelijke polen.",
    correct: "Ongelijke polen (noord–zuid)",
    distractors: ["Twee noordpolen", "Twee zuidpolen", "Geen polen, alleen wrijving"],
  },
  {
    sit: () => "Een magneet houdt een schroef tegen een bord.",
    prompt: "Welke krachten werken op de schroef?",
    why: "Fz omlaag, magnetische kracht naar het bord, eventueel wrijving.",
    correct: "Zwaartekracht en magnetische kracht (eventueel wrijving)",
    distractors: ["Alleen spankracht", "Alleen elektrische stroom zonder magneet", "Alleen druk in ohm"],
  },
  {
    sit: (n) => `${n} breekt een magneet in tweeën.`,
    prompt: "Wat is het beste beeld?",
    why: "Elk stuk heeft weer N en Z.",
    correct: "Elk stuk heeft weer een noord- en zuidpool.",
    distractors: [
      "Het ene stuk is alleen noord, het andere alleen zuid.",
      "Magnetisme verdwijnt.",
      "Er ontstaan alleen elektrische polen.",
    ],
  },
  {
    sit: () => "Afstand tussen twee magneten halveren (zelfde polen).",
    prompt: "Wat verwacht je van de afstotende kracht?",
    why: "Dichterbij: sterkere magnetische kracht.",
    correct: "De kracht wordt sterker.",
    distractors: ["De kracht wordt nul", "De kracht wisselt naar aantrekken", "Massa verdwijnt"],
  },
]);

const constructieMakers = mcFamilie("klas-constructie", T2, [
  {
    sit: () => "Een brugdeel van staal wordt uit elkaar getrokken. Een bakstenen pilaar wordt samengedrukt.",
    prompt: "Welke krachten horen hierbij?",
    why: "Trek trekt uit elkaar; druk duwt samen. Staal is sterk op trek, baksteen vooral op druk.",
    correct: "Trek in het staal, druk in de baksteen.",
    distractors: [
      "Druk in het staal, trek in de baksteen.",
      "Alleen wrijving in beide materialen.",
      "Alleen zwaartekracht, geen trek of druk.",
    ],
    figuurId: "trek-druk",
    figuurBijschrift: "Figuur — trek vs druk in staven",
  },
  {
    sit: (n) => `${n} trekt aan een touw; het touw wordt strak.`,
    prompt: "Welke kracht zit in het touw?",
    why: "Touw neemt trek/spankracht op.",
    correct: "Trek (spankracht)",
    distractors: ["Druk zoals in een pilaar", "Alleen wrijving in de vezels zonder trek", "Vermogen"],
  },
  {
    sit: () => "Een tafelpoot draagt een blad: de poot wordt korter gedrukt (heel weinig).",
    prompt: "Welke kracht in de poot?",
    why: "Samendrukken: druk.",
    correct: "Druk",
    distractors: ["Trek die de poot uitrekt", "Magnetische kracht", "Frequentie"],
    figuurId: "trek-druk",
    figuurBijschrift: "Figuur — druk in een staaf",
  },
  {
    sit: () => "Hangbrug: kabels boven, pijlers onder.",
    prompt: "Wat is het beste plaatje?",
    why: "Kabels trek, pijlers druk.",
    correct: "Kabels op trek, pijlers op druk",
    distractors: [
      "Kabels op druk, pijlers op trek",
      "Beide alleen op wrijving",
      "Geen krachten in kabels",
    ],
  },
  {
    sit: (n) => `${n} duwt twee stenen tegen elkaar.`,
    prompt: "Welke kracht in het contactvlak?",
    why: "Samendrukken: druk.",
    correct: "Drukkracht",
    distractors: ["Spankracht in een touw", "Alleen zwaartekracht opzij", "Ohmse weerstand"],
  },
  {
    sit: () => "Een elastiekje wordt langer als je trekt.",
    prompt: "Welke kracht in het elastiek?",
    why: "Uit elkaar: trek.",
    correct: "Trek",
    distractors: ["Druk die het korter maakt", "Alleen magnetisme", "Dichtheid"],
  },
  {
    sit: () => "Betonnen kolom onder een balkon.",
    prompt: "Vooral welke belasting?",
    why: "Kolom wordt samengedrukt: druk.",
    correct: "Druk",
    distractors: ["Alleen trek zoals een kabel", "Alleen geluid", "Alleen straling"],
  },
  {
    sit: (n) => `${n} ziet een fietsframe: dunne buizen, driehoeken.`,
    prompt: "Waarom driehoeken in frames?",
    why: "Driehoek blijft in vorm; staven op trek/druk.",
    correct: "Driehoeken blijven beter in vorm (staven op trek of druk).",
    distractors: [
      "Driehoeken zijn altijd zwaarder, daarom sterker.",
      "Buizen mogen nooit kracht opnemen.",
      "Alleen de kleur maakt het stabiel.",
    ],
    figuurId: "constructie-driehoek",
    figuurBijschrift: "Figuur — driehoekframe",
  },
  {
    sit: () => "Een muur wordt in elkaar gedrukt door het dak.",
    prompt: "Krachtsoort in de muur?",
    why: "Druk.",
    correct: "Druk",
    distractors: ["Trek in een kabel-zin", "Frequentie", "Spanning in volt"],
  },
  {
    sit: () => "Hijskraan-kabel tilt een pallet.",
    prompt: "Krachtsoort in de kabel?",
    why: "Kabel: trek.",
    correct: "Trek",
    distractors: ["Druk in de kabel", "Alleen wrijving met lucht", "Moment zonder kracht"],
    figuurId: "trek-druk",
    figuurBijschrift: "Figuur — trek in een kabel",
  },
]);

const driehoekMakers = mcFamilie("klas-driehoek", T2, [
  {
    sit: () => "Een frame van staven kan een rechthoek of een driehoek vormen.",
    prompt: "Welke vorm is stabieler tegen vervormen, en waarom?",
    why: "Een driehoek kan niet scheef zakken zonder staven te verlengen/verkorten; een rechthoek wel.",
    correct: "De driehoek: die blijft beter in vorm.",
    distractors: [
      "De rechthoek: die heeft meer hoeken.",
      "Beide even stabiel bij dezelfde lengte.",
      "Alleen houten frames zijn stabiel.",
    ],
    figuurId: "constructie-driehoek",
    figuurBijschrift: "Figuur — driehoek vs rechthoek",
  },
  {
    sit: (n) => `${n} zet een extra schuine staaf in een rechthoekig hek.`,
    prompt: "Wat is het doel van die schuine staaf?",
    why: "Maakt driehoeken; voorkomt scheefzakken.",
    correct: "Driehoeken maken zodat het hek niet scheef zakt.",
    distractors: [
      "De staaf maakt het hek magnetisch.",
      "De staaf verlaagt de zwaartekracht.",
      "Schuin betekent minder kracht in alle staven altijd.",
    ],
    figuurId: "constructie-driehoek",
    figuurBijschrift: "Figuur — schoor in een rechthoek",
  },
  {
    sit: () => "Een kartonnen doos zonder deksel vervormt makkelijker dan een driehoekig rek.",
    prompt: "Welke uitleg is het best?",
    why: "Rechthoek kan parallellogram worden; driehoek niet.",
    correct: "De rechthoek kan scheef, de driehoek niet zonder staaf te rekken.",
    distractors: [
      "Karton heeft geen massa.",
      "Driehoeken hebben geen hoeken.",
      "Alleen de kleur telt.",
    ],
  },
  {
    sit: () => "Vakwerkbrug: veel driehoeken.",
    prompt: "Waarom?",
    why: "Stabiele vorm, staven op trek of druk.",
    correct: "Driehoeken zijn vormvast; staven op trek of druk.",
    distractors: [
      "Driehoeken zijn mooier, geen natuurkunde.",
      "Cirkels zouden lichter zijn en even star.",
      "Bruggen mogen geen druk opnemen.",
    ],
    figuurId: "constructie-driehoek",
    figuurBijschrift: "Figuur — driehoek vs rechthoek",
  },
  {
    sit: (n) => `${n} duwt op de hoek van een rechthoek van rietjes en tape.`,
    prompt: "Wat gebeurt er vaak?",
    why: "Rechthoek klapt scheef tot parallellogram.",
    correct: "Het frame zakt scheef.",
    distractors: [
      "Het wordt altijd een vollere driehoek vanzelf.",
      "Rietjes worden magnetisch.",
      "De zwaartekracht valt weg.",
    ],
  },
  {
    sit: () => "Zet een dwarsbalk in een rechthoek (van hoek naar hoek).",
    prompt: "Hoeveel driehoeken ontstaan er?",
    why: "Eén diagonaal → twee driehoeken.",
    correct: "Twee driehoeken",
    distractors: ["Nul", "Vier cirkels", "Alleen één rechthoek zonder driehoek"],
    figuurId: "constructie-driehoek",
    figuurBijschrift: "Figuur — diagonaal",
  },
  {
    sit: () => "Waarom is een driehoek star zonder extra scharnieren te blokkeren?",
    prompt: "Kies de beste reden.",
    why: "Zijden bepalen de vorm uniek (geen extra vrijheidsgraad).",
    correct: "De drie zijden leggen de vorm vast.",
    distractors: [
      "Driehoeken hebben geen krachten.",
      "Een driehoek heeft meer hoeken dan een rechthoek.",
      "Starheid komt alleen door lijm, niet door vorm.",
    ],
  },
  {
    sit: (n) => `${n} vergelijkt een IKEA-achtig rek: met en zonder schuine steun.`,
    prompt: "Welke versie blijft beter staan bij een zijdelingse duw?",
    why: "Schoor → driehoek → star.",
    correct: "De versie met schuine steun",
    distractors: [
      "Zonder steun, want minder massa.",
      "Beide even, vorm telt niet.",
      "Alleen als het rek van metaal is.",
    ],
  },
  {
    sit: () => "Een vierkant van staven met scharnierende hoeken.",
    prompt: "Wat ontbreekt voor starheid?",
    why: "Diagonaal of vaste hoeken.",
    correct: "Een diagonaal (of vaste hoeken) tegen scheefzakken",
    distractors: ["Een extra scharnier in het midden zonder staaf", "Minder staven", "Alleen verf"],
  },
  {
    sit: () => "Fiets: voorvork en frame gebruiken driehoeken.",
    prompt: "Wat is het constructie-idee?",
    why: "Vormvast bij weinig materiaal.",
    correct: "Licht en toch vormvast door driehoeken",
    distractors: [
      "Driehoeken maken de fiets zwaarder zonder reden.",
      "Wielen mogen geen ronde vorm hebben.",
      "Alleen de bel houdt het frame.",
    ],
    figuurId: "constructie-driehoek",
    figuurBijschrift: "Figuur — vormvast frame",
  },
]);

const samenMakers: VraagMaker[] = Array.from({ length: 10 }, (_, i) => (rng: Rng) => {
  const n = naamVan(rng);
  const row = pick(rng, SAMEN);
  const sits = [
    `Twee krachten wijzen dezelfde kant op: ${row.f1} N en ${row.f2} N.`,
    `${n} duwt met ${row.f1} N, een klasgenoot duwt dezelfde kant op met ${row.f2} N.`,
    `Op een kist werken ${row.f1} N en ${row.f2} N in dezelfde richting.`,
    `Twee trekkrachten aan één oog: ${row.f1} N en ${row.f2} N, zelfde zin.`,
    `Lab: F1 = ${row.f1} N, F2 = ${row.f2} N, pijlen dezelfde kant.`,
    `${n} ziet twee pijlen mee: ${row.f1} N en ${row.f2} N.`,
    `Sleep: ${row.f1} N plus ${row.f2} N dezelfde kant.`,
    `Schema: twee vectoren gelijk gericht, ${row.f1} N en ${row.f2} N.`,
    `Een kar: duw ${row.f1} N en extra duw ${row.f2} N mee.`,
    `Opgave: krachten ${row.f1} N en ${row.f2} N, zelfde richting.`,
  ];
  return openVraag({
    id: `klas-samen-${i + 1}`,
    situation: sits[i]!,
    prompt: "Bereken de resultante in newton.",
    points: 2,
    modelAnswer: `${row.zelfde} N`,
    why: `In dezelfde richting: R = ${row.f1} + ${row.f2} = ${row.zelfde} N.`,
    accept: { numbers: [row.zelfde], tolerance: 0.5 },
    stof: T3,
    figuurId: "krachten-zelfde",
    figuurBijschrift: "Figuur — krachten in dezelfde richting",
  });
});

const tegenMakers: VraagMaker[] = Array.from({ length: 10 }, (_, i) => (rng: Rng) => {
  const n = naamVan(rng);
  const row = pick(rng, SAMEN);
  const sits = [
    `Links werkt ${row.f1} N, rechts werkt ${row.f2} N (tegengestelde richting).`,
    `${n} trekt links ${row.f1} N, iemand rechts ${row.f2} N.`,
    `Twee touwen tegengesteld: ${row.f1} N en ${row.f2} N.`,
    `Op een balk: ${row.f1} N naar links, ${row.f2} N naar rechts.`,
    `Vectoren tegengesteld: ${row.f1} N vs ${row.f2} N.`,
    `Sleepoorlog: ${row.f1} N tegen ${row.f2} N.`,
    `Kist: duw ${row.f1} N, wrijving ${row.f2} N tegengesteld (startvraag: resultante van die twee).`,
    `${n} noteert F→ = ${row.f1} N en F← = ${row.f2} N.`,
    `Schema met twee pijlen tegen elkaar: ${row.f1} N en ${row.f2} N.`,
    `Opgave: tegengesteld ${row.f1} N en ${row.f2} N.`,
  ];
  const richting =
    row.tegen === 0
      ? "0 N, evenwicht"
      : `${row.tegen} N, in de richting van de grootste kracht`;
  const distractA = `${row.zelfde} N, altijd naar rechts.`;
  return mcVraag({
    id: `klas-tegen-${i + 1}`,
    situation: sits[i]!,
    prompt: "Hoe groot is de resultante, en welke kant op als de grootste wint?",
    why:
      row.tegen === 0
        ? "Tegengesteld en even groot: R = 0."
        : `Tegengesteld: R = |F1 − F2| = ${row.tegen} N, richting van de grootste.`,
    stof: T3,
    correct: richting,
    distractors: [
      distractA,
      `${row.f1} N, want de andere telt niet.`,
      row.tegen === 0 ? `8 N, altijd een restkracht.` : `0 N, want krachten heffen altijd op.`,
    ],
    figuurId: "krachten-tegengesteld",
    figuurBijschrift: "Figuur — tegengestelde krachten",
  });
});

const ontbindMakers = mcFamilie("klas-ontbind", T4, [
  {
    sit: (n) => `${n} tilt een krat schuin omhoog aan een touw. Het touw trekt schuin.`,
    prompt: "Waarin kun je die spankracht ontbinden voor de constructie/hand?",
    why: "Een schuine kracht ontbind je in een verticale (omhoog tillen) en een horizontale component.",
    correct: "In een verticale en een horizontale component.",
    distractors: [
      "Alleen in zwaartekracht en wrijving.",
      "Alleen in massa en volume.",
      "Niet mogelijk: krachten kun je nooit ontbinden.",
    ],
    figuurId: "ontbinden-schuin",
    figuurBijschrift: "Figuur — schuine kracht ontbinden",
  },
  {
    sit: () => "Een slee wordt schuin omhoog aan een touw getrokken.",
    prompt: "Welke component tillt (tegen Fz in)?",
    why: "De verticale component van Fs.",
    correct: "De verticale component van de spankracht",
    distractors: [
      "Alleen de horizontale component",
      "De massa in kg",
      "De kleur van het touw",
    ],
    figuurId: "ontbinden-schuin",
    figuurBijschrift: "Figuur — Fx en Fy",
  },
  {
    sit: (n) => `${n} duwt een krat schuin: de duw heeft een deel naar voren en een deel omlaag.`,
    prompt: "Wat doet de horizontale component vooral?",
    why: "Horizontaal: versnellen/verschuiven over de vloer.",
    correct: "De krat over de vloer voortbewegen",
    distractors: [
      "De zwaartekracht uitschakelen",
      "De massa verkleinen",
      "Alleen de temperatuur verhogen",
    ],
  },
  {
    sit: () => "Een vliegerlijn staat schuin. Wind en Fz werken op de vlieger.",
    prompt: "Waarom ontbinden we de spankracht?",
    why: "Om evenwicht per richting (horizontaal/verticaal) te bekijken.",
    correct: "Om horizontale en verticale evenwichten apart te zien",
    distractors: [
      "Omdat schuine krachten geen newton hebben",
      "Omdat ontbinden de kracht groter maakt",
      "Omdat vliegers geen massa hebben",
    ],
    figuurId: "ontbinden-schuin",
    figuurBijschrift: "Figuur — schuine F",
  },
  {
    sit: () => "Een ladder tegen de muur: de vloer duwt schuin (Fn + wrijving samen).",
    prompt: "Welke ontbinding is nuttig?",
    why: "Horizontaal tegen de muur, verticaal tegen Fz.",
    correct: "Horizontaal en verticaal",
    distractors: ["Alleen in watt en joule", "Alleen in Hz", "Niet ontbinden, alleen optellen als scalaire kg"],
  },
  {
    sit: (n) => `${n} tekent een schuine pijl van 10 N onder 45°.`,
    prompt: "Wat zijn Fx en Fy (schets-idee, even groot)?",
    why: "45°: componenten even groot, kleiner dan 10 N.",
    correct: "Twee even grote componenten, elk kleiner dan 10 N",
    distractors: [
      "Fx = 10 N en Fy = 10 N",
      "Fx = 0, Fy = 0",
      "Componenten zijn groter dan 10 N allebei",
    ],
    figuurId: "ontbinden-schuin",
    figuurBijschrift: "Figuur — ontbinden",
  },
  {
    sit: () => "Samenstellen vs ontbinden.",
    prompt: "Wat is ontbinden?",
    why: "Eén kracht splitsen in componenten.",
    correct: "Eén kracht splitsen in (meestal loodrechte) componenten",
    distractors: [
      "Twee krachten optellen tot één resultante (dat is samenstellen)",
      "De massa delen door g",
      "De eenheid van kracht veranderen",
    ],
  },
  {
    sit: () => "Een schuine F op een wagentje: geen beweging omhoog, wel vooruit.",
    prompt: "Welke component is dan vooral ‘aan het werk’ voor de beweging?",
    why: "Horizontale component.",
    correct: "De horizontale component",
    distractors: ["Alleen Fz", "Alleen de verticale component", "De temperatuur"],
  },
  {
    sit: (n) => `${n} trekt een koffer schuin; de koffer blijft op de grond.`,
    prompt: "Wat moet gelden voor de verticale component t.o.v. Fz?",
    why: "Fy < Fz, anders zou de koffer opgetild worden.",
    correct: "De verticale component is kleiner dan Fz",
    distractors: [
      "De verticale component is groter dan Fz",
      "Er is geen Fz op een koffer",
      "Verticale component is altijd 0",
    ],
  },
  {
    sit: () => "Rekenregel-idee: componenten staan loodrecht.",
    prompt: "Waarom loodrecht kiezen?",
    why: "Dan beïnvloeden ze elkaar niet; Pythagoreisch / evenwicht per as.",
    correct: "Dan kun je per richting (as) evenwicht of beweging bekijken",
    distractors: [
      "Loodrecht is verplicht in de wet van Ohm",
      "Dan verdwijnt de oorspronkelijke kracht",
      "Componenten mogen nooit loodrecht",
    ],
    figuurId: "ontbinden-schuin",
    figuurBijschrift: "Figuur — Fx en Fy loodrecht",
  },
]);

const hefboomMakers: VraagMaker[] = Array.from({ length: 10 }, (_, i) => (rng: Rng) => {
  const n = naamVan(rng);
  const row = pick(rng, HEF);
  const sits = [
    `Een hefboom: F₁ = ${row.f1} N op arm ${nlGetal(row.arm1, 1)} m. Draaipunt P. Aan de andere kant arm ${nlGetal(row.arm2, 1)} m.`,
    `${n} zet ${row.f1} N op ${nlGetal(row.arm1, 1)} m van P. Andere arm ${nlGetal(row.arm2, 1)} m.`,
    `Wip: ${row.f1} N, arm ${nlGetal(row.arm1, 1)} m. Overkant arm ${nlGetal(row.arm2, 1)} m.`,
    `Sleutel: ${row.f1} N op ${nlGetal(row.arm1, 1)} m. Weerstandszijde ${nlGetal(row.arm2, 1)} m.`,
    `Lab: F1 = ${row.f1} N, a1 = ${nlGetal(row.arm1, 1)} m, a2 = ${nlGetal(row.arm2, 1)} m.`,
    `Balk met P: ${row.f1} N links op ${nlGetal(row.arm1, 1)} m, rechts ${nlGetal(row.arm2, 1)} m.`,
    `${n} rekent evenwicht: ${row.f1} N × ${nlGetal(row.arm1, 1)} m = F2 × ${nlGetal(row.arm2, 1)} m.`,
    `Kraanmodel: ${row.f1} N, arm ${nlGetal(row.arm1, 1)} m tegen arm ${nlGetal(row.arm2, 1)} m.`,
    `Tang: ${row.f1} N in de greep op ${nlGetal(row.arm1, 1)} m, bek op ${nlGetal(row.arm2, 1)} m.`,
    `Opgave hefboom: ${row.f1} N, ${nlGetal(row.arm1, 1)} m en ${nlGetal(row.arm2, 1)} m.`,
  ];
  return openVraag({
    id: `klas-hefboom-${i + 1}`,
    situation: sits[i]!,
    prompt: "Bereken welke kracht F₂ nodig is voor evenwicht (momentevenwicht). Schrijf het getal in N.",
    points: 2,
    modelAnswer: `${nlGetal(row.f2, 1)} N`,
    why: `Moment: F₁·arm₁ = F₂·arm₂ → F₂ = (${row.f1}·${nlGetal(row.arm1, 1)}) / ${nlGetal(row.arm2, 1)} = ${nlGetal(row.f2, 1)} N.`,
    accept: { numbers: [row.f2], tolerance: Math.max(0.3, row.f2 * 0.08) },
    stof: T5,
    figuurId: "hefboom-evenwicht",
    figuurBijschrift: "Figuur — hefboom met draaipunt P",
  });
});

const momentMcMakers = mcFamilie("klas-moment", T5, [
  {
    sit: () => "Op een hefboom werkt een kracht verder van het draaipunt.",
    prompt: "Wat gebeurt er met het moment als de arm groter wordt (zelfde F)?",
    why: "Moment = F · arm; grotere arm → groter moment.",
    correct: "Het moment wordt groter.",
    distractors: [
      "Het moment wordt kleiner.",
      "Het moment blijft altijd gelijk.",
      "Moment bestaat alleen bij katrollen.",
    ],
    figuurId: "hefboom-proef",
    figuurBijschrift: "Figuur — momentenproef met gewichten",
  },
  {
    sit: (n) => `${n} opent een deur bij de klink, niet bij de scharnieren.`,
    prompt: "Waarom is dat makkelijker?",
    why: "Grotere arm → groter moment bij dezelfde duw.",
    correct: "De arm is groter, dus het moment is groter.",
    distractors: [
      "Bij de klink is Fz uit.",
      "Scharnieren hebben geen draaipunt.",
      "Dichtbij de scharnieren is de arm groter.",
    ],
  },
  {
    sit: () => "Zelfde moment, grotere arm.",
    prompt: "Wat mag er met F gebeuren?",
    why: "M = F×arm vast → grotere arm, kleinere F.",
    correct: "De kracht mag kleiner zijn.",
    distractors: [
      "De kracht moet groter zijn.",
      "Kracht verdwijnt.",
      "Arm telt niet bij moment.",
    ],
    figuurId: "hefboom-evenwicht",
    figuurBijschrift: "Figuur — hefboom",
  },
  {
    sit: () => "Een moersleutel is langer.",
    prompt: "Effect op het moment (zelfde handkracht)?",
    why: "Langere arm, groter moment.",
    correct: "Groter moment op de moer",
    distractors: ["Kleiner moment", "Moment nul", "Alleen de kleur telt"],
  },
  {
    sit: (n) => `${n} hangt gewichten op een momentenstang.`,
    prompt: "Wanneer is er evenwicht?",
    why: "Momenten links = momenten rechts.",
    correct: "Als de momenten links en rechts even groot zijn",
    distractors: [
      "Als alleen de massa's gelijk zijn, armen niet nodig",
      "Als P in het midden ligt, altijd, ongeacht F",
      "Evenwicht bestaat niet bij hefbomen",
    ],
    figuurId: "hefboom-proef",
    figuurBijschrift: "Figuur — momentenproef",
  },
  {
    sit: () => "Arm is de loodrechte afstand tot de werklijn.",
    prompt: "Wat als F evenwijdig aan de balk door P gaat?",
    why: "Arm = 0 → moment 0.",
    correct: "Het moment is nul",
    distractors: ["Het moment is maximaal", "F bestaat niet", "P verdwijnt"],
  },
  {
    sit: () => "Kind ver op de wip, volwassene dichtbij P.",
    prompt: "Hoe kan het evenwicht?",
    why: "Kleine F × grote arm.",
    correct: "De grotere arm van het kind maakt het moment gelijk.",
    distractors: [
      "Kinderen hebben geen zwaartekracht.",
      "De wip geleidt geen kracht.",
      "Massa telt niet.",
    ],
  },
  {
    sit: (n) => `${n} gebruikt een koevoet: lange arm, last dicht bij P.`,
    prompt: "Wat is het voordeel?",
    why: "Grote arm aan jouw kant → kleine F nodig.",
    correct: "Je hebt minder kracht nodig voor hetzelfde moment.",
    distractors: [
      "De last wordt lichter in kg.",
      "P ligt dan oneindig ver.",
      "Moment is dan verboden.",
    ],
    figuurId: "hefboom-evenwicht",
    figuurBijschrift: "Figuur — hefboom",
  },
  {
    sit: () => "Twee gelijke F, verschillende armen.",
    prompt: "Welke geeft het grotere moment?",
    why: "Grotere arm wint.",
    correct: "De kracht met de grotere arm",
    distractors: [
      "De kracht met de kleinere arm",
      "Ze zijn altijd gelijk",
      "Alleen de linker kracht telt",
    ],
  },
  {
    sit: () => "Eenheid van moment in deze oefening (F in N, arm in m).",
    prompt: "Welke eenheid?",
    why: "N·m (newtonmeter).",
    correct: "Newtonmeter (N·m)",
    distractors: ["Watt", "Hertz", "Ohm"],
  },
]);

const zwaartepuntMakers = mcFamilie("klas-zwaartepunt", T6, [
  {
    sit: () => "Een zware metalen staaf dient als hefboom. Het zwaartepunt ligt niet op het draaipunt.",
    prompt: "Wanneer moet je Fz van de hefboom zelf meerekenen?",
    why: "Als het zwaartepunt niet op P ligt, levert Fz van de staaf ook een moment.",
    correct: "Als het zwaartepunt niet op het draaipunt ligt.",
    distractors: [
      "Nooit: hefbomen hebben geen zwaartekracht.",
      "Alleen als de staaf van hout is.",
      "Alleen bij dubbele hefbomen.",
    ],
    figuurId: "zwaartepunt-balk",
    figuurBijschrift: "Figuur — zwaartepunt Z en draaipunt P",
  },
  {
    sit: (n) => `${n} verschuift P onder het midden van een homogene balk.`,
    prompt: "Wat gebeurt er zonder extra gewichten?",
    why: "Z ligt in het midden; Fz geeft een moment, de balk kantelt.",
    correct: "De balk kantelt: Fz heeft een arm t.o.v. P.",
    distractors: [
      "Niets: zwaartepunt telt nooit.",
      "De balk zweeft.",
      "P trekt de balk omhoog met Fs.",
    ],
    figuurId: "zwaartepunt-balk",
    figuurBijschrift: "Figuur — Z en P",
  },
  {
    sit: () => "Homogene balk, P precies onder Z.",
    prompt: "Moment van Fz van de balk?",
    why: "Arm = 0.",
    correct: "Nul, de arm is nul",
    distractors: ["Maximaal", "Oneindig", "Gelijk aan de massa in kg"],
  },
  {
    sit: () => "Een hamer: kop zwaar, steel licht. Z ligt dichter bij de kop.",
    prompt: "Waar ligt het zwaartepunt vooral?",
    why: "Meer massa bij de kop.",
    correct: "Dichter bij de kop",
    distractors: ["Precies in het midden van de steel altijd", "In de lucht naast de hamer", "Bij het lichtste punt"],
  },
  {
    sit: (n) => `${n} balanceert een liniaal op een vinger.`,
    prompt: "Waar ligt de vinger t.o.v. Z?",
    why: "Onder het zwaartepunt.",
    correct: "Onder het zwaartepunt",
    distractors: ["Altijd aan het lichtste uiteinde", "Boven de liniaal in de lucht", "Bij 0 cm, altijd"],
  },
  {
    sit: () => "Zwaartekracht grijpt aan in Z.",
    prompt: "Wat is Z?",
    why: "Aangrijpingspunt van de resulterende Fz.",
    correct: "Het aangrijpingspunt van de (resulterende) zwaartekracht",
    distractors: ["Het draaipunt van elke hefboom altijd", "De eenheid van moment", "De noordpool van een magneet"],
    figuurId: "zwaartepunt-balk",
    figuurBijschrift: "Figuur — Fz in Z",
  },
  {
    sit: () => "Een L-vormig voorwerp.",
    prompt: "Ligt Z altijd in het midden van een been?",
    why: "Bij onregelmatige vorm niet per se in een ‘midden’ van één been.",
    correct: "Nee, Z hangt van de massaverdeling af",
    distractors: ["Ja, altijd in het geometrisch midden van alles", "Z bestaat alleen bij balken", "Z ligt altijd buiten het voorwerp"],
  },
  {
    sit: (n) => `${n} legt een extra gewicht op het rechter uiteinde van een balk op P in het midden.`,
    prompt: "Wat gebeurt er met het evenwicht?",
    why: "Extra moment rechts.",
    correct: "Rechts draait omlaag (extra moment)",
    distractors: ["Niets, extra massa telt niet", "Links wordt zwaarder vanzelf", "P verdwijnt"],
    figuurId: "hefboom-proef",
    figuurBijschrift: "Figuur — gewichten op een balk",
  },
  {
    sit: () => "Waarom telt Fz van de balk mee als Z ≠ P?",
    prompt: "Kies de formule-reden.",
    why: "M = Fz × arm, arm ≠ 0.",
    correct: "Fz heeft dan een arm, dus een moment",
    distractors: ["Fz is dan nul", "g wordt 0", "Moment bestaat alleen bij katrollen"],
  },
  {
    sit: () => "Steunpunt onder Z, extra gelijke gewichten op gelijke armen.",
    prompt: "Evenwicht?",
    why: "Moment balk 0; extra momenten gelijk.",
    correct: "Ja, als de extra momenten gelijk zijn",
    distractors: ["Nee, balken kunnen nooit in evenwicht", "Alleen als g = 0", "Alleen bij magneten"],
  },
]);

const katrolMakers: VraagMaker[] = Array.from({ length: 10 }, (_, i) => (rng: Rng) => {
  const n = naamVan(rng);
  const row = pick(rng, TAKEL);
  const sits = [
    `Met een takel van ${row.n} kabels hijst ${n} een last van ${row.last} N (ideale takel, geen wrijving).`,
    `Ideale takel, ${row.n} strengen, last ${row.last} N.`,
    `${n} hijst ${row.last} N met ${row.n} kabels (geen wrijving).`,
    `Schooltakel: n = ${row.n}, F_last = ${row.last} N, ideaal.`,
    `Een blok met ${row.n} kabels draagt ${row.last} N.`,
    `Practicum takel ${row.n} strengen, last ${row.last} N.`,
    `Hijs: ${row.last} N, ${row.n} kabels, wrijving verwaarlozen.`,
    `${n} telt ${row.n} draden naar de last van ${row.last} N.`,
    `Model: F_last ${row.last} N, n = ${row.n}.`,
    `Opgave: takel ${row.n} kabels, last ${row.last} N.`,
  ];
  return openVraag({
    id: `klas-katrol-${i + 1}`,
    situation: sits[i]!,
    prompt: "Bereken bij benadering de trekkracht in één kabel in newton.",
    points: 2,
    modelAnswer: `${nlGetal(row.trek, 1)} N`,
    why: `Ideale takel: F_trek ≈ F_last / n = ${row.last} / ${row.n} = ${nlGetal(row.trek, 1)} N.`,
    accept: { numbers: [row.trek], tolerance: Math.max(1, row.trek * 0.1) },
    stof: T7,
    figuurId: row.n === 2 ? "takel-2" : "katrol-vast",
    figuurBijschrift: row.n === 2 ? "Figuur — eenvoudige takel" : "Figuur — katrol / takel",
  });
});

const takelMcMakers = mcFamilie("klas-takel", T7, [
  {
    sit: () => "Een takel heeft meer kabels die de last dragen.",
    prompt: "Wat is het voordeel van zo'n takel?",
    why: "Meer kabels → kleinere trekkracht nodig (ideale rekenregel F ≈ last/n).",
    correct: "Je hebt minder trekkracht nodig om dezelfde last te hijsen.",
    distractors: [
      "De last wordt zwaarder, dus sneller.",
      "Zwaartekracht verdwijnt in de katrol.",
      "Je hebt altijd meer trekkracht nodig.",
    ],
    figuurId: "takel-2",
    figuurBijschrift: "Figuur — takel met 2 strengen",
  },
  {
    sit: () => "Een enkele vaste katrol.",
    prompt: "Wat verandert die vooral?",
    why: "Richting van de kracht, MA ≈ 1.",
    correct: "De richting van de kracht (trekkracht ≈ last)",
    distractors: [
      "De last wordt twee keer zo licht in kg",
      "g wordt 0",
      "De stroom in een lamp",
    ],
    figuurId: "katrol-vast",
    figuurBijschrift: "Figuur — vaste katrol",
  },
  {
    sit: (n) => `${n} hijst met 4 strengen, ideaal.`,
    prompt: "Wat is F_trek t.o.v. de last?",
    why: "Ongeveer een kwart.",
    correct: "Ongeveer een kwart van de last",
    distractors: ["Vier keer de last", "Gelijk aan de last altijd", "Nul"],
  },
  {
    sit: () => "Wrijving in een echte takel.",
    prompt: "Wat doet dat met F_trek t.o.v. ideaal?",
    why: "Wrijving: je moet harder trekken.",
    correct: "F_trek wordt groter dan de ideale last/n",
    distractors: ["F_trek wordt kleiner dan ideaal", "De last verdwijnt", "n wordt 0"],
  },
  {
    sit: () => "Bewegende katrol + vaste katrol (eenvoudige takel).",
    prompt: "Wat is het idee van de bewegende katrol?",
    why: "Last verdeeld over twee strengen.",
    correct: "De last wordt over meer strengen verdeeld",
    distractors: [
      "De katrol maakt de massa van de last kleiner",
      "Er is geen Fz meer",
      "Alleen de kleur van het touw telt",
    ],
    figuurId: "takel-2",
    figuurBijschrift: "Figuur — takel",
  },
  {
    sit: (n) => `${n} trekt het vrije eind naar beneden bij een vaste katrol.`,
    prompt: "Wat is het praktische nut?",
    why: "Je trekt omlaag, last gaat omhoog.",
    correct: "Je kunt omlaag trekken terwijl de last omhoog gaat",
    distractors: [
      "De last gaat vanzelf omlaag harder",
      "De katrol verdubbelt g",
      "Er is geen kracht meer nodig",
    ],
    figuurId: "katrol-vast",
    figuurBijschrift: "Figuur — vaste katrol",
  },
  {
    sit: () => "Ideale takel, n verdubbelen, zelfde last.",
    prompt: "F_trek?",
    why: "Helft (ideaal).",
    correct: "Ongeveer de helft",
    distractors: ["Twee keer zo groot", "Onveranderd", "Oneindig"],
  },
  {
    sit: () => "Touw slijt: één streng extra, maar meer wrijving.",
    prompt: "Wat is eerlijk om te zeggen?",
    why: "Ideaal kleiner F, wrijving werkt tegen.",
    correct: "Ideaal daalt F_trek, wrijving werkt dat deels tegen",
    distractors: ["Wrijving verlaagt F_trek altijd", "n telt niet", "Last in N wordt 0"],
  },
  {
    sit: () => "Waarom tel je het aantal kabels naar de last?",
    prompt: "Wat is n in F ≈ last/n?",
    why: "Aantal strengen dat de last draagt.",
    correct: "Het aantal strengen dat de last draagt",
    distractors: ["Het aantal wielen in de klas", "De massa in kg", "De arm in meters"],
  },
  {
    sit: (n) => `${n} vergelijkt vaste katrol en takel met 2 strengen.`,
    prompt: "Waar is F_trek kleiner (ideaal, zelfde last)?",
    why: "Takel n=2.",
    correct: "Bij de takel met 2 strengen",
    distractors: [
      "Bij de vaste katrol",
      "Altijd gelijk",
      "Bij geen van beide bestaat F_trek",
    ],
    figuurId: "takel-2",
    figuurBijschrift: "Figuur — takel vs vaste katrol",
  },
]);

const drukMakers: VraagMaker[] = Array.from({ length: 10 }, (_, i) => (rng: Rng) => {
  const n = naamVan(rng);
  const row = pick(rng, DRUK);
  const sits = [
    `Een kracht van ${row.F} N werkt op een klein oppervlak van ${row.klein} cm².`,
    `${n} duwt ${row.F} N op ${row.klein} cm².`,
    `Spijker: F = ${row.F} N, A = ${row.klein} cm².`,
    `Labdruk: ${row.F} N op ${row.klein} cm².`,
    `Een stempel ${row.F} N, vlak ${row.klein} cm².`,
    `Opgave: F = ${row.F} N, A = ${row.klein} cm².`,
    `${n} zet ${row.F} N op een dop van ${row.klein} cm².`,
    `Pers: ${row.F} N, oppervlak ${row.klein} cm².`,
    `Schouder: ${row.F} N verdeeld? Nee, hier A = ${row.klein} cm².`,
    `Berekening druk: ${row.F} N / ${row.klein} cm².`,
  ];
  return openVraag({
    id: `klas-druk-${i + 1}`,
    situation: sits[i]!,
    prompt: "Bereken de druk in N/cm².",
    points: 2,
    modelAnswer: `${nlGetal(row.pK, 1)} N/cm²`,
    why: `p = F / A = ${row.F} / ${row.klein} = ${nlGetal(row.pK, 1)} N/cm².`,
    accept: { numbers: [row.pK], tolerance: Math.max(0.2, row.pK * 0.08) },
    stof: T8,
    figuurId: "druk-oppervlak",
    figuurBijschrift: "Figuur —zelfde kracht, klein vs groot oppervlak",
  });
});

const drukVglMakers: VraagMaker[] = Array.from({ length: 10 }, (_, i) => (rng: Rng) => {
  const n = naamVan(rng);
  const row = pick(rng, DRUK);
  const sits = [
    `Zelfde kracht ${row.F} N: eerst op ${row.klein} cm², daarna op ${row.groot} cm².`,
    `${n} vergelijkt ${row.F} N op ${row.klein} cm² en op ${row.groot} cm².`,
    `Spijker ${row.klein} cm² vs zool ${row.groot} cm², F = ${row.F} N.`,
    `Twee vlakken: ${row.klein} en ${row.groot} cm², zelfde F ${row.F} N.`,
    `Schema druk: F ${row.F} N, A1 ${row.klein} cm², A2 ${row.groot} cm².`,
    `Practicum: ${row.F} N, klein ${row.klein} cm², groot ${row.groot} cm².`,
    `Sneeuw: ${row.F} N op ${row.klein} cm² vs ${row.groot} cm².`,
    `${n} zet een doos ${row.F} N op een poot van ${row.klein} cm² of een plaat van ${row.groot} cm².`,
    `Opgave vergelijk: ${row.F} N, ${row.klein} vs ${row.groot} cm².`,
    `p = F/A met F = ${row.F} N, A klein ${row.klein}, A groot ${row.groot}.`,
  ];
  return mcVraag({
    id: `klas-druk-vgl-${i + 1}`,
    situation: sits[i]!,
    prompt: "Waar is de druk groter, en waarom?",
    why: `p = F/A; kleiner oppervlak → grotere druk (${nlGetal(row.pK, 1)} vs ${nlGetal(row.pG, 1)} N/cm²).`,
    stof: T8,
    correct: "Op het kleine oppervlak: druk is kracht per oppervlakte.",
    distractors: [
      "Op het grote oppervlak: meer cm² betekent meer druk.",
      "Overal gelijk: de kracht is hetzelfde.",
      "Druk hangt alleen af van de massa, niet van A.",
    ],
    figuurId: "druk-oppervlak",
    figuurBijschrift: "Figuur — klein vs breed steunvlak",
  });
});

const scherpMakers = mcFamilie("klas-scherp", T8, [
  {
    sit: () => "Een scherpe spijker en een brede schoenzool: zelfde aandrukkracht.",
    prompt: "Wat klopt over de druk?",
    why: "Scherpe tip = klein A → hoge druk; brede zool = groot A → lage druk.",
    correct: "De spijker geeft grotere druk door het kleine oppervlak.",
    distractors: [
      "De schoenzool geeft altijd meer druk.",
      "Druk is bij beide nul zonder magneten.",
      "Alleen het gewicht telt, niet het oppervlak.",
    ],
  },
  {
    sit: (n) => `${n} zakt met naaldhakken in het gras, niet met platte zolen (zelfde persoon).`,
    prompt: "Waarom?",
    why: "Kleinere A, grotere p.",
    correct: "Kleinere oppervlakte, grotere druk",
    distractors: [
      "De massa is groter op hakken",
      "g is groter op hakken",
      "Platte zolen hebben geen Fz",
    ],
    figuurId: "druk-oppervlak",
    figuurBijschrift: "Figuur — klein vs groot A",
  },
  {
    sit: () => "Ski's op sneeuw.",
    prompt: "Waarom zak je minder weg?",
    why: "Groot A, kleine p.",
    correct: "Het gewicht is verdeeld over een groot oppervlak",
    distractors: [
      "Ski's maken je lichter in kg",
      "Sneeuw heeft geen druk",
      "Ski's schakelen Fz uit",
    ],
  },
  {
    sit: () => "Mes snijdt beter als het scherper is (zelfde duw).",
    prompt: "Natuurkunde?",
    why: "Kleiner A, grotere druk.",
    correct: "Kleiner snijvlak, grotere druk",
    distractors: ["Het mes wordt zwaarder", "Druk hangt alleen van de kleur af", "Scherpe messen hebben geen kracht"],
  },
  {
    sit: (n) => `${n} legt een plank onder de poot van een kast op een zacht tapijt.`,
    prompt: "Wat doet de plank?",
    why: "Groter A, kleinere p, minder inzakt.",
    correct: "Oppervlak groter, druk kleiner, minder inzakt",
    distractors: [
      "De kast wordt lichter",
      "De plank verhoogt de druk",
      "Tapijt heeft geen oppervlak",
    ],
  },
  {
    sit: () => "Formule p = F / A. A verdubbelen, F gelijk.",
    prompt: "Druk?",
    why: "Helft.",
    correct: "De druk wordt de helft",
    distractors: ["De druk verdubbelt", "De druk blijft gelijk", "De druk wordt nul"],
  },
  {
    sit: () => "F verdubbelen, A gelijk.",
    prompt: "Druk?",
    why: "Verdubbelt.",
    correct: "De druk verdubbelt",
    distractors: ["De druk wordt de helft", "A verdwijnt", "Druk is onafhankelijk van F"],
  },
  {
    sit: () => "Een olifant vs een naald: F olifant groter, maar A ook veel groter.",
    prompt: "Wat kun je zeggen?",
    why: "p hangt van F én A af; naald kan grotere p hebben.",
    correct: "Druk hangt van F en A af; een naald kan hogere druk hebben",
    distractors: [
      "De olifant heeft altijd de hoogste druk",
      "Naalden hebben F = 0",
      "Oppervlak telt niet",
    ],
  },
  {
    sit: (n) => `${n} duwt met dezelfde F op een gum en op een punt van een passer.`,
    prompt: "Waar is p groter?",
    why: "Punt: klein A.",
    correct: "Op de passer-punt",
    distractors: ["Op de gum", "Overal gelijk", "Nergens, druk bestaat niet"],
  },
  {
    sit: () => "Eenheid in deze oefening: N/cm².",
    prompt: "Wat betekent dat?",
    why: "Newton per vierkante centimeter.",
    correct: "Kracht in newton per cm² oppervlak",
    distractors: ["Massa per seconde", "Spanning in volt", "Frequentie"],
    figuurId: "druk-oppervlak",
    figuurBijschrift: "Figuur — druk = F/A",
  },
]);

const KLAS_MAKERS: VraagMaker[] = [
  ...soortMakers,
  ...fzMakers,
  ...magneetMakers,
  ...constructieMakers,
  ...driehoekMakers,
  ...samenMakers,
  ...tegenMakers,
  ...ontbindMakers,
  ...hefboomMakers,
  ...momentMcMakers,
  ...zwaartepuntMakers,
  ...katrolMakers,
  ...takelMcMakers,
  ...drukMakers,
  ...drukVglMakers,
  ...scherpMakers,
];

export function bouwKlasBank(rng: Rng): Question[] {
  return KLAS_MAKERS.map((make) => make(rng));
}

export function klasBankGrootte(): number {
  return KLAS_MAKERS.length;
}
