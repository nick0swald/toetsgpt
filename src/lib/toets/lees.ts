import { assembleMc, pick, type Rng } from "./shuffle";
import type { Question, StofTag } from "./types";

const NAMEN = ["Lina", "Amir", "Tess", "Joost", "Noor", "Sem", "Daan", "Esmee"] as const;

function tag(hoofdstukId: string, paragraafId: string, label: string): StofTag {
  return { hoofdstukId, paragraafId, label };
}

/** Vakgerichte leesvragen: korte tekst, daarna woord / verwijzing / hoofdzaak. */
export function leesBank(rng: Rng): Question[] {
  const naam = pick(rng, NAMEN);
  const dummy = "A" as const;

  const dBer = tag("dichtheid", "dichtheid-berekenen", "Dichtheid · vaktekst");
  const sGem = tag("snelheid", "snelheid-gemiddeld", "Snelheid · vaktekst");
  const kSoort = tag("kracht", "kracht-soorten", "Kracht · vaktekst");
  const eKring = tag("elektra", "elektra-kring", "Elektriciteit · vaktekst");
  const dMv = tag("dichtheid", "dichtheid-massa-volume", "Dichtheid · vaktekst");
  const sEen = tag("snelheid", "snelheid-eenheden", "Snelheid · vaktekst");
  const bioCel = tag("bio-cel", "bio-cel-bouw", "Cel · vaktekst");
  const bioFoto = tag("bio-foto", "bio-foto-plant", "Fotosynthese · vaktekst");
  const bioSpijs = tag("bio-spijs", "bio-spijs-mond", "Spijsvertering · vaktekst");

  const l1 = assembleMc(
    {
      id: "lees-d1",
      skill: "lees",
      stof: dBer,
      situation: `${naam} leest in het boek: "Dichtheid is de massa per volume. Een steen en een stuk piepschuim kunnen even groot zijn. Toch is de steen zwaarder. De steen heeft dan een grotere dichtheid. Je berekent dichtheid door de massa te delen door het volume."`,
      prompt: "Wat betekent ‘dichtheid’ in deze tekst?",
      why: "De tekst zegt: dichtheid is de massa per volume.",
      correct: "Hoeveel massa er in een bepaalde ruimte zit.",
      distractors: [
        "Hoe groot een voorwerp is.",
        "Hoe lang een voorwerp is.",
        "Hoe snel een voorwerp zakt.",
      ],
    },
    dummy,
  );

  const l2 = assembleMc(
    {
      id: "lees-d2",
      skill: "lees",
      stof: dBer,
      situation: `"Twee kisten hebben hetzelfde volume. Kist A is zwaarder dan kist B. De stof in kist A heeft dus een grotere dichtheid. Daardoor weegt kist A meer, ook al is de ruimte even groot."`,
      prompt: "Waar wijst het woord ‘daardoor’ op?",
      why: "Daardoor slaat terug op de grotere dichtheid.",
      correct: "Op de grotere dichtheid van de stof in kist A.",
      distractors: [
        "Op het volume van kist B.",
        "Op de kleur van de kisten.",
        "Op de plaats van de kisten.",
      ],
    },
    dummy,
  );

  const l3 = assembleMc(
    {
      id: "lees-s1",
      skill: "lees",
      stof: sGem,
      situation: `"Gemiddelde snelheid is de afgelegde afstand gedeeld door de tijd. ${naam} fietst vijf kilometer. Dat duurt twintig minuten. De gemiddelde snelheid is dan lager dan bij dezelfde afstand in tien minuten. De formule is v = s / t."`,
      prompt: "Wat moet je volgens de tekst delen om de gemiddelde snelheid te krijgen?",
      why: "De tekst: afstand gedeeld door de tijd.",
      correct: "De afstand door de tijd.",
      distractors: [
        "De tijd door de afstand.",
        "De massa door het volume.",
        "De kracht door de tijd.",
      ],
    },
    dummy,
  );

  const l4 = assembleMc(
    {
      id: "lees-s2",
      skill: "lees",
      stof: sGem,
      situation: `"In de les gebruiken we meters per seconde. In het verkeer zie je kilometers per uur. Dat is dezelfde soort grootheid: snelheid. Alleen de eenheid is anders. 1 m/s is hetzelfde als 3,6 km/h."`,
      prompt: "Wat is volgens de tekst het verschil tussen m/s en km/h?",
      why: "Het is dezelfde grootheid, een andere eenheid.",
      correct: "Alleen de eenheid is anders.",
      distractors: [
        "Het is een andere grootheid.",
        "km/h is een kracht.",
        "m/s is alleen voor auto’s.",
      ],
    },
    dummy,
  );

  const l5 = assembleMc(
    {
      id: "lees-k1",
      skill: "lees",
      stof: kSoort,
      situation: `"Een kracht kan een voorwerp van vorm veranderen of van snelheid. Duwen en trekken zijn krachten. Zwaartekracht trekt alles naar de aarde. Op een kist op tafel werken minstens twee krachten: de zwaartekracht naar beneden en de tafel die terugduwt."`,
      prompt: "Wat doet een kracht volgens deze tekst?",
      why: "De eerste zin: vorm of snelheid veranderen.",
      correct: "Een voorwerp van vorm of van snelheid veranderen.",
      distractors: [
        "Alleen de kleur van een voorwerp veranderen.",
        "Alleen de temperatuur meten.",
        "De massa van de aarde berekenen.",
      ],
    },
    dummy,
  );

  const l6 = assembleMc(
    {
      id: "lees-e1",
      skill: "lees",
      stof: eKring,
      situation: `"Een lamp brandt alleen als de stroomkring gesloten is. Stroom loopt van de batterij door de draden naar de lamp en weer terug. Een schakelaar kan de kring openen. Dan stopt de stroom en gaat de lamp uit. Koper geleidt stroom. Plastic doet dat niet."`,
      prompt: "Wanneer gaat de lamp volgens de tekst uit?",
      why: "Als de schakelaar de kring opent, stopt de stroom.",
      correct: "Als de stroomkring open is.",
      distractors: [
        "Als de kring van koper is.",
        "Als de batterij in de kring zit.",
        "Als de lamp van glas is.",
      ],
    },
    dummy,
  );

  const l6b = assembleMc(
    {
      id: "lees-d3",
      skill: "lees",
      stof: dMv,
      situation: `"Massa is hoeveel stof er is. Volume is hoeveel ruimte die stof inneemt. Een liter water heeft een massa van ongeveer een kilogram. Dezelfde liter olie is lichter. De massa is dus niet hetzelfde als het volume. Je mag die twee niet door elkaar halen."`,
      prompt: "Wat is volgens de tekst het verschil tussen massa en volume?",
      why: "Massa = hoeveel stof. Volume = hoeveel ruimte.",
      correct: "Massa is hoeveel stof, volume is hoeveel ruimte.",
      distractors: [
        "Massa en volume zijn hetzelfde.",
        "Volume is hoe zwaar iets is.",
        "Massa is alleen voor water.",
      ],
    },
    dummy,
  );

  const l6c = assembleMc(
    {
      id: "lees-s3",
      skill: "lees",
      stof: sEen,
      situation: `"${naam} meet 10 meter in 2 seconden. Dat is 5 m/s. In het verkeer zou je dat omrekenen naar km/h. Sommige leerlingen vergeten de eenheid. Zonder eenheid weet je niet of het om meters per seconde of kilometers per uur gaat. Schrijf de eenheid er altijd bij."`,
      prompt: "Waarom moet je volgens de tekst de eenheid erbij schrijven?",
      why: "Zonder eenheid weet je niet welke snelheid het is.",
      correct: "Anders weet je niet of het m/s of km/h is.",
      distractors: [
        "Anders telt de docent extra punten.",
        "Anders wordt de massa fout.",
        "Anders brandt de lamp niet.",
      ],
    },
    dummy,
  );

  const l7 = assembleMc(
    {
      id: "lees-b1",
      skill: "lees",
      stof: bioCel,
      situation: `"Elk levend wezen bestaat uit cellen. Een plantencel heeft een celwand en een bladgroenkorrel. Een dierlijke cel heeft die niet. In de kern zit het erfelijk materiaal. Het cytoplasma is de vloeistof in de cel. Zonder kern kan de cel zich niet delen."`,
      prompt: "Wat heeft een plantencel volgens de tekst extra, vergeleken met een dierlijke cel?",
      why: "Plantencel: celwand en bladgroenkorrel. Dierlijke cel niet.",
      correct: "Een celwand en bladgroenkorrels.",
      distractors: [
        "Alleen een kern.",
        "Geen cytoplasma.",
        "Meer botten.",
      ],
    },
    dummy,
  );

  const l8 = assembleMc(
    {
      id: "lees-b2",
      skill: "lees",
      stof: bioFoto,
      situation: `"Groene planten maken glucose met licht. Dat heet fotosynthese. De plant neemt water op via de wortels en koolstofdioxide via de huidmondjes. Bij dit proces komt ook zuurstof vrij. Zonder licht stopt fotosynthese. Mensen en dieren gebruiken die zuurstof bij de ademhaling."`,
      prompt: "Wat betekent ‘fotosynthese’ in deze tekst?",
      why: "De tekst: glucose maken met licht.",
      correct: "Glucose maken met licht.",
      distractors: [
        "Zuurstof inademen.",
        "Water uit bladeren persen.",
        "Dieren voeden met bodem.",
      ],
    },
    dummy,
  );

  const l9 = assembleMc(
    {
      id: "lees-b3",
      skill: "lees",
      stof: bioSpijs,
      situation: `"Spijsvertering begint in de mond. Tanden verkleinen het voedsel. Speeksel maakt het glibberig en bevat een stof die zetmeel afbreekt. Daarna gaat het voedsel via de slokdarm naar de maag. In de maag wordt het verder verteerd. Pas in de dunne darm nemen we de voedingsstoffen op."`,
      prompt: "Waar worden voedingsstoffen volgens de tekst opgenomen?",
      why: "Laatste zin: in de dunne darm.",
      correct: "In de dunne darm.",
      distractors: ["In de mond.", "In de tanden.", "In de slokdarm."],
    },
    dummy,
  );

  const l10 = assembleMc(
    {
      id: "lees-b4",
      skill: "lees",
      stof: bioFoto,
      situation: `"Huidmondjes zitten vooral aan de onderkant van het blad. Ze laten koolstofdioxide naar binnen. Waterdamp kan eruit. Als het droog is, gaan huidmondjes bijna dicht. Zo verliest de plant minder water. Daardoor kan fotosynthese op een hete middag juist minder hard gaan."`,
      prompt: "Waar wijst ‘daardoor’ op in de laatste zin?",
      why: "Daardoor = omdat de huidmondjes bijna dicht gaan.",
      correct: "Op het bijna dichtdoen van de huidmondjes.",
      distractors: [
        "Op de kleur van het blad.",
        "Op de wortels van de plant.",
        "Op de lengte van de stengel.",
      ],
    },
    dummy,
  );

  return [l1, l2, l3, l4, l5, l6, l6b, l6c, l7, l8, l9, l10];
}

export const LEES_TAG: StofTag = {
  hoofdstukId: "lees",
  paragraafId: "lees-vaktekst",
  label: "Vaktekst lezen",
};

export function isLeesVraag(q: { skill?: "stof" | "lees" }): boolean {
  return q.skill === "lees";
}
