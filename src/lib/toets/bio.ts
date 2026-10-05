import { assembleMc } from "./shuffle";
import type { InvulQuestion, OpenQuestion, Question, StofTag } from "./types";

const H = "bio-13";
const slot = "A" as const;

function tag(paragraafId: string, label: string): StofTag {
  return { hoofdstukId: H, paragraafId, label };
}

const p3 = tag("bio-13-3", "13.3 Ademhalingsstelsel");
const p4 = tag("bio-13-4", "13.4 Inademen en uitademen");
const p5 = tag("bio-13-5", "13.5 Longaandoeningen");
const p6 = tag("bio-13-6", "13.6 Gaswisseling bij dieren");

function invul(
  id: string,
  situation: string,
  prompt: string,
  modelAnswer: string,
  why: string,
  keywords: string[],
  stof: StofTag,
): InvulQuestion {
  return {
    id,
    type: "invul",
    situation,
    prompt,
    points: 1,
    modelAnswer,
    why,
    accept: { keywords },
    stof,
    skill: "stof",
  };
}

function open(
  id: string,
  situation: string,
  prompt: string,
  modelAnswer: string,
  why: string,
  keywords: string[],
  stof: StofTag,
): OpenQuestion {
  return {
    id,
    type: "open",
    situation,
    prompt,
    points: 2,
    modelAnswer,
    why,
    accept: { keywords },
    stof,
    skill: "stof",
  };
}

/** Toepassingsvragen bij basisstof 13.3–13.6. Geen boekopdracht. */
export function bioBank(): Question[] {
  return [
    open(
      "b3a",
      "Sem sprint naar de bus. Zijn ademhaling wordt sneller en dieper.",
      "Leg uit waarom zijn spieren dan meer zuurstof nodig hebben.",
      "Bij meer inspanning is meer energie nodig. Daarvoor is meer verbranding nodig, en verbranding heeft zuurstof nodig.",
      "Meer inspanning vraagt meer verbranding, en daarvoor is meer zuurstof nodig.",
      ["verbranding", "zuurstof", "energie"],
      p3,
    ),
    assembleMc(
      {
        id: "b3b",
        stof: p3,
        skill: "stof",
        situation: "Een arts zegt: de uitwisseling van zuurstof en koolstofdioxide gaat bij deze patiënt te langzaam.",
        prompt: "Welke eigenschap van de longblaasjes helpt normaal om die uitwisseling snel te laten gaan?",
        why: "De wand is dun en het totale oppervlak is groot. Daardoor kan veel gas snel wisselen.",
        correct: "Een dunne wand en een groot totaal oppervlak.",
        distractors: [
          "Kraakbeenringen om de longblaasjes.",
          "Neusharen in elk longblaasje.",
          "Een dikke slijmlaag op elk longblaasje.",
        ],
      },
      slot,
    ),
    open(
      "b3c",
      "Noor slikt een slok water en verslikt zich bijna.",
      "Leg uit wat het strotklepje op dat moment doet, en waarom dat nodig is.",
      "Het strotklepje sluit de luchtpijp af, zodat het water niet in de luchtpijp komt.",
      "Bij slikken sluit het strotklepje de luchtpijp af.",
      ["strotklepje", "luchtpijp"],
      p3,
    ),
    assembleMc(
      {
        id: "b3d",
        stof: p3,
        skill: "stof",
        situation: "In een stoffige werkplaats ademt een leerling door de neus.",
        prompt: "Wat houden de neusharen vooral tegen?",
        why: "Neusharen houden grote stofdeeltjes tegen. Slijm houdt kleinere deeltjes tegen.",
        correct: "Grote stofdeeltjes.",
        distractors: ["Alleen koolstofdioxide.", "Het bloed in de longen.", "De kraakbeenringen."],
      },
      slot,
    ),
    invul(
      "b3e",
      "Lucht gaat vanuit de luchtpijp naar links en naar rechts de long in.",
      "De luchtpijp vertakt zich in twee ___.",
      "bronchiën",
      "De luchtpijp splitst in twee bronchiën. Die vertakken verder in luchtpijptakjes.",
      ["bronchiën", "bronchien", "bronchie"],
      p3,
    ),
    open(
      "b4a",
      "Bij buikademhaling trekt het middenrif samen.",
      "Leg uit wat er daarna met de borstholte en de luchtstroom gebeurt.",
      "Het middenrif gaat omlaag. De borstholte wordt groter. Lucht stroomt naar binnen.",
      "Samentrekken van het middenrif maakt de borstholte groter, zodat lucht naar binnen stroomt.",
      ["omlaag", "groter", "binnen"],
      p4,
    ),
    assembleMc(
      {
        id: "b4b",
        stof: p4,
        skill: "stof",
        situation: "Bij borstademhaling gaan de ribben en het borstbeen omhoog en naar voren.",
        prompt: "Wat is het gevolg daarvan?",
        why: "De borstholte wordt groter, de longen worden groter en lucht stroomt naar binnen.",
        correct: "De borstholte wordt groter en lucht stroomt naar binnen.",
        distractors: [
          "De borstholte wordt kleiner en lucht stroomt naar buiten.",
          "Het middenrif sluit de neus af.",
          "De longblaasjes veranderen in kieuwen.",
        ],
      },
      slot,
    ),
    open(
      "b4c",
      "Mevrouw de Vries is 70. Haar longen zijn minder elastisch dan vroeger. Haar vitale capaciteit is kleiner.",
      "Leg uit wat vitale capaciteit is, en waarom die bij haar kleiner kan zijn.",
      "Vitale capaciteit is de maximale hoeveelheid lucht die je na een diepe inademing in één keer uitademt. Minder elastische longen kunnen minder lucht verplaatsen.",
      "Vitale capaciteit is de maximale uitademing na een diepe teug. Minder elastische longen verlagen die.",
      ["vitale capaciteit", "elastisch"],
      p4,
    ),
    {
      ...open(
        "b4d",
        "Tijdens het fietsen ademt Amir 20 keer per minuut. Elke teug is 0,5 liter.",
        "Bereken hoeveel liter lucht hij per minuut inademt.",
        "10 liter per minuut.",
        "20 keer × 0,5 liter = 10 liter per minuut.",
        [],
        p4,
      ),
      accept: { numbers: [10], tolerance: 0.2 },
    },
    invul(
      "b4e",
      "De lucht in de longen wordt steeds ververst.",
      "Het verversen van lucht in de longen heet ___.",
      "ventilatie",
      "Ventilatie is het verversen van de lucht in de longen.",
      ["ventilatie"],
      p4,
    ),
    open(
      "b5a",
      "Bij een patiënt zijn wanden van longblaasjes kapot. De schade herstelt niet. Hij is snel moe.",
      "Leg uit waarom hij minder energie kan vrijmaken. Gebruik gaswisseling en verbranding.",
      "Het oppervlak voor gaswisseling is kleiner. Er komt minder zuurstof in het bloed. Daardoor is er minder verbranding en minder energie.",
      "Minder longblaasoppervlak geeft minder zuurstof, dus minder verbranding en minder energie.",
      ["zuurstof", "oppervlak", "verbranding"],
      p5,
    ),
    assembleMc(
      {
        id: "b5b",
        stof: p5,
        skill: "stof",
        situation: "Een longarts noemt twee ziekten die allebei bij COPD horen.",
        prompt: "Welke twee zijn dat?",
        why: "Chronische bronchitis en longemfyseem horen bij COPD.",
        correct: "Chronische bronchitis en longemfyseem.",
        distractors: ["Astma en hooikoorts.", "Tuberculose en verkoudheid.", "Hooikoorts en tuberculose."],
      },
      slot,
    ),
    open(
      "b5c",
      "Na rook van een kampvuur krijgt een leerling een astma-aanval en wordt benauwd.",
      "Leg uit wat de spiertjes en het slijmvlies in de luchtwegen dan doen.",
      "De spiertjes trekken samen en het slijmvlies wordt dikker. De luchtwegen worden nauwer.",
      "Bij astma trekken spiertjes samen en zwelt het slijmvlies. De luchtwegen worden nauwer.",
      ["samentrekken", "slijmvlies", "nauwer"],
      p5,
    ),
    assembleMc(
      {
        id: "b5d",
        stof: p5,
        skill: "stof",
        situation: "In een klas niest iemand met tuberculose.",
        prompt: "Hoe kan de bacterie anderen bereiken, en waarmee is tbc te behandelen?",
        why: "Tbc verspreidt zich door hoesten of niezen. Behandeling kan met antibiotica.",
        correct: "Via hoesten of niezen. Behandeling kan met antibiotica.",
        distractors: [
          "Alleen via de huid. Er is geen behandeling.",
          "Alleen via voedsel. Behandeling is een pleister.",
          "Alleen via stuifmeel. Behandeling is rust.",
        ],
      },
      slot,
    ),
    open(
      "b6a",
      "Een vis zwemt in water met weinig zuurstof. Water gaat door de bek naar binnen.",
      "Beschrijf de weg van het water tot de gaswisseling, en welk deel je met longblaasjes vergelijkt.",
      "Water wordt tussen de kieuwplaatjes geperst. Daar is de gaswisseling. Die plaatjes zijn te vergelijken met longblaasjes.",
      "Gaswisseling zit in de kieuwplaatjes. Die hebben dezelfde functie als longblaasjes.",
      ["kieuwplaatjes", "longblaasjes"],
      p6,
    ),
    assembleMc(
      {
        id: "b6b",
        stof: p6,
        skill: "stof",
        situation: "Een insect vliegt lang achter elkaar. Het heeft stigma's en tracheeën.",
        prompt: "Hoe komt de zuurstof bij de cellen?",
        why: "Lucht gaat via stigma's de tracheeën in. De kleinste takken komen tot bij de cellen. Het bloed vervoert die zuurstof niet eerst.",
        correct: "Via tracheeën tot bij de cellen, niet eerst via het bloed.",
        distractors: [
          "Eerst via longblaasjes naar het bloed.",
          "Alleen via de huid, zoals een vis.",
          "Via de urineleider naar de spieren.",
        ],
      },
      slot,
    ),
    open(
      "b6c",
      "Een kikker en een muis zijn ongeveer even groot. De muis heeft een veel groter inwendig longoppervlak.",
      "Leg uit waarom de muis meer gaswisseling nodig heeft dan de kikker.",
      "Een muis is warmbloedig en moet de lichaamstemperatuur vasthouden. Daarvoor is meer verbranding en dus meer zuurstof nodig. Een kikker is koudbloedig en kan ook via de huid gas wisselen.",
      "Warmbloedige dieren hebben meer verbranding en dus meer zuurstof nodig.",
      ["warmbloedig", "verbranding", "zuurstof"],
      p6,
    ),
    assembleMc(
      {
        id: "b6d",
        stof: p6,
        skill: "stof",
        situation: "Een volwassen kikker zit aan de waterkant.",
        prompt: "Waarmee kan deze kikker gas wisselen?",
        why: "Volwassen amfibieën hebben eenvoudige longen en kunnen ook via de huid gas wisselen.",
        correct: "Met de longen en via de huid.",
        distractors: [
          "Alleen met kieuwdeksels.",
          "Alleen met tracheeën.",
          "Alleen met longblaasjes zoals een zoogdier, zonder huid.",
        ],
      },
      slot,
    ),
    assembleMc(
      {
        id: "b3f",
        stof: p3,
        skill: "lees",
        situation:
          "In de neusholte wordt lucht warm en vochtig gemaakt. Neusharen houden grote stofdeeltjes tegen. Slijm vangt kleinere deeltjes en ziekteverwekkers. Trilharen duwen dat slijm naar de keelholte. Zo komt schonere lucht in de luchtpijp.",
        prompt: "Wat is de hoofdzaak van deze tekst?",
        why: "De tekst legt uit hoe de neus de lucht schoon, warm en vochtig maakt voordat die verdergaat.",
        correct: "De neus maakt de lucht schoon, warm en vochtig.",
        distractors: [
          "De longblaasjes maken urine.",
          "Het middenrif sluit de maag af.",
          "Insecten ademen via de neus.",
        ],
      },
      slot,
    ),
    assembleMc(
      {
        id: "b5e",
        stof: p5,
        skill: "lees",
        situation:
          "Hooikoorts is een overgevoeligheid voor stuifmeel. Iemand kan dan tranende ogen krijgen, een loopneus en niesbuien. Het slijmvlies raakt ontstoken. Dat is iets anders dan astma. Bij astma worden de luchtwegen nauwer en ontstaat benauwdheid.",
        prompt: "Wat is het verschil dat de tekst maakt?",
        why: "Hooikoorts geeft klachten zoals niezen en een loopneus. Bij astma worden de luchtwegen nauwer.",
        correct: "Hooikoorts reageert op stuifmeel. Bij astma worden de luchtwegen nauwer.",
        distractors: [
          "Hooikoorts en astma zijn hetzelfde.",
          "Astma komt alleen door een bacterie in de nier.",
          "Hooikoorts beschadigt de wanden van longblaasjes voorgoed.",
        ],
      },
      slot,
    ),
    assembleMc(
      {
        id: "b6e",
        stof: p6,
        skill: "lees",
        situation:
          "Koudbloedige dieren houden hun temperatuur niet constant met extra verbranding. Ze hebben daardoor gemiddeld minder zuurstof nodig. Warmbloedige dieren, zoals zoogdieren, verbranden meer. Zij hebben een groot inwendig longoppervlak nodig voor die gaswisseling.",
        prompt: "Waar verwijst ‘die gaswisseling’ naar?",
        why: "Het gaat om de gaswisseling die warmbloedige dieren nodig hebben door hun hogere verbranding.",
        correct: "De gaswisseling die warmbloedige dieren nodig hebben.",
        distractors: [
          "De gaswisseling in de urineblaas.",
          "Alleen de niesbui bij hooikoorts.",
          "Het slikken van voedsel.",
        ],
      },
      slot,
    ),
    assembleMc(
      {
        id: "b4f",
        stof: p4,
        skill: "lees",
        situation:
          "De longen liggen in de borstholte. Het middenrif zit tussen de borstholte en de buikholte. Bij inademen gaat het middenrif omlaag. De borstholte wordt groter en lucht stroomt naar binnen. Bij uitademen gaat het middenrif omhoog en stroomt lucht naar buiten.",
        prompt: "Wat gebeurt er volgens de tekst bij het uitademen?",
        why: "Het middenrif gaat omhoog en lucht stroomt naar buiten.",
        correct: "Het middenrif gaat omhoog en lucht gaat naar buiten.",
        distractors: [
          "Het middenrif gaat omlaag en lucht gaat naar binnen.",
          "De neusharen sluiten de borstholte.",
          "De longen verlaten de borstholte.",
        ],
      },
      slot,
    ),
  ];
}

const SAMENVATTING = `Alleen basisstof 13.3, 13.4, 13.5 en 13.6 van Biologie voor jou, vmbo-K, thema 13.
Geen andere biologie. Geen huidlagen, geen lever, geen nieren, geen inwendig milieu als apart onderwerp.
Ongeveer 70% toepassingsvragen in een nieuwe situatie. Ongeveer 30% leesvragen bij een korte vaktekst: vakwoord, verwijzing of hoofdzaak.
Typen: meerkeuze, leg uit, oorzaak en gevolg, een eenvoudige berekening met ademfrequentie × liter per teug.
Niet de voorbeelden hieronder letterlijk herhalen.

13.3 Neus maakt lucht warm en vochtig. Neusharen: grote deeltjes. Slijm: kleine deeltjes en ziekteverwekkers. Trilharen brengen slijm naar de keel. Bij slikken sluit de huig de neusholte en het strotklepje de luchtpijp. Luchtpijp blijft open door kraakbeenringen en splitst in twee bronchiën, daarna luchtpijptakjes met spiertjes. Longblaasjes: dunne wand, groot oppervlak, haarvaten, gaswisseling. Zuurstof de long uit naar het bloed, koolstofdioxide terug. Uitgeademde lucht: minder zuurstof, meer koolstofdioxide en waterdamp, warmer. Meer inspanning: meer verbranding, meer zuurstof, sneller of dieper ademen.
13.4 Ventilatie ververst longlucht. Longen in de borstholte. Middenrif scheidt borst- en buikholte. Borst in: tussenribspieren samen, ribben omhoog, holte groter, lucht naar binnen. Borst uit: spieren ontspannen, ribben omlaag, holte kleiner, lucht naar buiten. Buik in: middenrif omlaag. Buik uit: middenrif omhoog. Vitale capaciteit: maximale uitademing na een diepe teug. Leeftijd en lichaamsgrootte spelen mee. Oudere longen zijn minder elastisch.
13.5 Ingeademde vervuiling kan longziekte veroorzaken of erger maken: fijnstof, stikstofdioxide, zwaveldioxide, tabaksrook, bacteriën, sporen, stuifmeel. Astma: spiertjes samen, slijmvlies dikker, luchtwegen nauwer, benauwd. Chronische bronchitis: COPD, bronchiën ontstoken, meer slijm, hoesten. Longemfyseem: COPD, wanden longblaasjes kapot, kleiner oppervlak, herstelt niet, minder zuurstof, minder verbranding, minder energie. Tbc: bacterie, via hoesten of niezen, antibiotica. Hooikoorts: overgevoelig voor stuifmeel, tranende ogen, loopneus, niezen.
13.6 Amfibieën: jonge dieren kieuwen, volwassen dieren eenvoudige longen plus huid met slijm en veel vaatjes. Vissen: water via de bek langs kieuwplaatjes, eruit via kieuwdeksels. Kieuwplaatjes zijn te vergelijken met longblaasjes. Insecten: stigma's en tracheeën tot bij de cellen, zuurstof niet eerst via het bloed. Koudbloedig: minder verbranding, minder zuurstof. Warmbloedig zoogdier: groot longoppervlak.`;

export function bioLesstof(hoofdstukId?: string): string | null {
  if (hoofdstukId !== H) return null;
  return SAMENVATTING;
}
