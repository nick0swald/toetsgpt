/** Metadata-bank voor herbruikbare H10/H14 figuren (ids → examen-figuur / klas-figuur). */
export const KLAS_FIGUUR_BANK: { id: string; label: string; topics: string[]; check: string }[] = [
  {
    id: "fbd-tafel",
    label: "FBD: blok op tafel (Fz↓, Fn↑)",
    topics: ["h10-p1"],
    check: "Fz vanaf zwaartepunt omlaag; Fn vanaf steunvlak omhoog.",
  },
  {
    id: "fbd-hangend",
    label: "FBD: hangende massa (Fs↑, Fz↓)",
    topics: ["h10-p1"],
    check: "Fs en Fz op dezelfde verticale lijn; tip = richting van de kracht.",
  },
  {
    id: "krachten-tegengesteld",
    label: "Tegengestelde krachten (gelijke lengte)",
    topics: ["h10-p3"],
    check: "F1 en F2 tegengesteld, gelijke pijllengte → resultante 0 bij gelijke F.",
  },
  {
    id: "krachten-zelfde",
    label: "Krachtenzelfde richting + resultante",
    topics: ["h10-p3"],
    check: "F1 en F2 zelfde kant; gestippelde R langer ≈ F1+F2.",
  },
  {
    id: "vector-schaal",
    label: "Krachtvector met schaalstreep",
    topics: ["h10-p1", "h10-p3"],
    check: "Pijllengte schaalt met magnitude; schaaltekst 1 cm ≙ 5 N.",
  },
  {
    id: "constructie-driehoek",
    label: "Driehoek (stabiel) vs rechthoek (vervormbaar)",
    topics: ["h10-p2"],
    check: "Driehoek star; rechthoek met stippellijnen toont scheefzakken.",
  },
  {
    id: "trek-druk",
    label: "Trek- en drukkracht in staven",
    topics: ["h10-p2"],
    check: "Trek: pijlen uit elkaar; druk: pijlen naar elkaar toe.",
  },
  {
    id: "ontbinden-schuin",
    label: "Schuine F ontbinden in Fx en Fy",
    topics: ["h10-p4"],
    check: "F diagonaal; Fx horizontaal en Fy verticaal vanaf hetzelfde aangrijpingspunt.",
  },
  {
    id: "hefboom-evenwicht",
    label: "Hefboom met P, F1/F2 en arm1/arm2",
    topics: ["h14-p1"],
    check: "Arm = loodrechte afstand van P tot werklijn; hier langs balk bij verticale F.",
  },
  {
    id: "hefboom-proef",
    label: "Momentenproef: haken + gestapelde gewichten",
    topics: ["h14-p1", "h14-p2"],
    check: "3 gewichten links @ 40 cm, 2 rechts @ 60 cm; P in het midden (origineel lab).",
  },
  {
    id: "zwaartepunt-balk",
    label: "Balk met zwaartepunt Z en Fz",
    topics: ["h14-p2"],
    check: "Fz aangrijpt in Z; P uit het midden → eigen moment van de balk.",
  },
  {
    id: "katrol-vast",
    label: "Vaste katrol (MA ≈ 1)",
    topics: ["h14-p3"],
    check: "Eén vaste katrol; touw doorlopend; Ftrek ≈ last (MA=1).",
  },
  {
    id: "takel-2",
    label: "Takel met 2 strengen (MA ≈ 2)",
    topics: ["h14-p3"],
    check: "Vast + bewegend; doorlopend touw; last onder bewegende; Ftrek aan vrij eind; MA≈2.",
  },
  {
    id: "druk-oppervlak",
    label: "Zelfde F, klein A vs groot A",
    topics: ["h14-p4"],
    check: "F-pijlen omlaag op steunvlak; klein A → hoge p, groot A → lage p.",
  },
  {
    id: "hefboom-dubbel",
    label: "Dubbele hefboom (schaar/tang)",
    topics: ["h14-p1"],
    check: "Twee armen kruisen in draaipunt P; grepen en bekken gespiegeld.",
  },
];

export type KlasFiguurBankEntry = (typeof KLAS_FIGUUR_BANK)[number];
