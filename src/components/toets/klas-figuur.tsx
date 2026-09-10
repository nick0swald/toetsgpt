/** Originele H10/H14 klas-figuren (Nova-achtige types, zwart op wit). Niet uit het boek gekopieerd. */
import type { ReactNode } from "react";

const stroke = {
  fill: "none",
  stroke: "#111",
  strokeWidth: 1.75,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

const dash = { ...stroke, strokeDasharray: "4 3" };

/** Pijlpunt: tip = richting van de kracht. */
function Tip({ x, y, dir }: { x: number; y: number; dir: "up" | "down" | "left" | "right" }) {
  const s = 7;
  if (dir === "up") return <polyline points={`${x - 6},${y + s} ${x},${y} ${x + 6},${y + s}`} {...stroke} />;
  if (dir === "down") return <polyline points={`${x - 6},${y - s} ${x},${y} ${x + 6},${y - s}`} {...stroke} />;
  if (dir === "left") return <polyline points={`${x + s},${y - 6} ${x},${y} ${x + s},${y + 6}`} {...stroke} />;
  return <polyline points={`${x - s},${y - 6} ${x},${y} ${x - s},${y + 6}`} {...stroke} />;
}

/** 1. Blok op tafel: Fz↓ vanaf zwaartepunt, Fn↑ vanaf steunvlak. */
export function FbdTafel() {
  return (
    <>
      <line x1="50" y1="118" x2="230" y2="118" {...stroke} />
      <rect x="110" y="68" width="60" height="50" {...stroke} />
      <circle cx="140" cy="93" r="2.5" fill="#111" />
      {/* Fz vanaf CoM omlaag */}
      <line x1="140" y1="93" x2="140" y2="148" {...stroke} strokeWidth={2} />
      <Tip x={140} y={148} dir="down" />
      <text x="148" y="142" fontSize="12" fill="#111">
        Fz
      </text>
      {/* Fn vanaf steunvlak omhoog */}
      <line x1="140" y1="118" x2="140" y2="38" {...stroke} strokeWidth={2} />
      <Tip x={140} y={38} dir="up" />
      <text x="148" y="50" fontSize="12" fill="#111">
        Fn
      </text>
      <text x="54" y="148" fontSize="11" fill="#111">
        tafel
      </text>
    </>
  );
}

/** 2. Hangende massa: Fs↑ en Fz↓ op dezelfde verticale lijn. */
export function FbdHangend() {
  return (
    <>
      <line x1="100" y1="18" x2="180" y2="18" {...stroke} />
      <line x1="140" y1="18" x2="140" y2="55" {...stroke} />
      <rect x="115" y="55" width="50" height="40" {...stroke} />
      <circle cx="140" cy="75" r="2.5" fill="#111" />
      {/* Fs omhoog (spankracht in touw) */}
      <line x1="140" y1="55" x2="140" y2="28" {...stroke} strokeWidth={2} />
      <Tip x={140} y={28} dir="up" />
      <text x="150" y="40" fontSize="12" fill="#111">
        Fs
      </text>
      {/* Fz omlaag vanaf CoM */}
      <line x1="140" y1="75" x2="140" y2="140" {...stroke} strokeWidth={2} />
      <Tip x={140} y={140} dir="down" />
      <text x="150" y="130" fontSize="12" fill="#111">
        Fz
      </text>
    </>
  );
}

/** 3. Tegengestelde krachten, gelijke lengte. */
export function KrachtenTegengesteld() {
  return (
    <>
      <rect x="110" y="60" width="60" height="45" {...stroke} />
      <circle cx="140" cy="82" r="2.2" fill="#111" />
      <line x1="110" y1="82" x2="40" y2="82" {...stroke} strokeWidth={2} />
      <Tip x={40} y={82} dir="left" />
      <text x="48" y="74" fontSize="12" fill="#111">
        F1
      </text>
      <line x1="170" y1="82" x2="240" y2="82" {...stroke} strokeWidth={2} />
      <Tip x={240} y={82} dir="right" />
      <text x="210" y="74" fontSize="12" fill="#111">
        F2
      </text>
      <text x="88" y="140" fontSize="11" fill="#111">
        tegengesteld · gelijke lengte
      </text>
    </>
  );
}

/** 4. Krachten zelfde richting + gestippelde resultante. */
export function KrachtenZelfde() {
  return (
    <>
      <rect x="50" y="70" width="50" height="40" {...stroke} />
      <line x1="100" y1="78" x2="170" y2="78" {...stroke} strokeWidth={2} />
      <Tip x={170} y={78} dir="right" />
      <text x="125" y="70" fontSize="12" fill="#111">
        F1
      </text>
      <line x1="100" y1="102" x2="155" y2="102" {...stroke} strokeWidth={2} />
      <Tip x={155} y={102} dir="right" />
      <text x="118" y="118" fontSize="12" fill="#111">
        F2
      </text>
      <line x1="100" y1="130" x2="210" y2="130" {...dash} strokeWidth={2} />
      <Tip x={210} y={130} dir="right" />
      <text x="145" y="148" fontSize="12" fill="#111">
        R = F1 + F2
      </text>
    </>
  );
}

/** 5. Eén krachtpijl met schaalstreep. */
export function VectorSchaal() {
  return (
    <>
      <line x1="50" y1="80" x2="200" y2="80" {...stroke} strokeWidth={2.2} />
      <Tip x={200} y={80} dir="right" />
      <text x="110" y="68" fontSize="13" fill="#111">
        F = 20 N
      </text>
      {/* schaalstreep 1 cm ≙ 5 N → 4 cm voor 20 N (visueel) */}
      <line x1="50" y1="120" x2="88" y2="120" {...stroke} strokeWidth={2} />
      <line x1="50" y1="114" x2="50" y2="126" {...stroke} />
      <line x1="88" y1="114" x2="88" y2="126" {...stroke} />
      <text x="98" y="126" fontSize="12" fill="#111">
        1 cm ≙ 5 N
      </text>
    </>
  );
}

/** 6. Driehoek (stabiel) naast vervormbare rechthoek. */
export function ConstructieDriehoek() {
  return (
    <>
      <polygon points="50,130 100,40 150,130" {...stroke} />
      <text x="72" y="148" fontSize="11" fill="#111">
        driehoek
      </text>
      <text x="68" y="28" fontSize="11" fill="#111">
        stabiel
      </text>
      <rect x="175" y="50" width="70" height="70" {...stroke} />
      <line x1="175" y1="50" x2="210" y2="120" {...dash} />
      <line x1="245" y1="50" x2="210" y2="120" {...dash} />
      <text x="182" y="148" fontSize="11" fill="#111">
        rechthoek
      </text>
      <text x="178" y="40" fontSize="11" fill="#111">
        vervormbaar
      </text>
    </>
  );
}

/** 7. Trek (uit elkaar) vs druk (naar elkaar). */
export function TrekDruk() {
  return (
    <>
      <rect x="40" y="55" width="90" height="28" {...stroke} />
      <line x1="40" y1="69" x2="18" y2="69" {...stroke} strokeWidth={2} />
      <Tip x={18} y={69} dir="left" />
      <line x1="130" y1="69" x2="152" y2="69" {...stroke} strokeWidth={2} />
      <Tip x={152} y={69} dir="right" />
      <text x="68" y="74" fontSize="12" fill="#111">
        trek
      </text>
      <rect x="40" y="110" width="90" height="28" {...stroke} />
      <line x1="18" y1="124" x2="40" y2="124" {...stroke} strokeWidth={2} />
      <Tip x={40} y={124} dir="right" />
      <line x1="152" y1="124" x2="130" y2="124" {...stroke} strokeWidth={2} />
      <Tip x={130} y={124} dir="left" />
      <text x="68" y="129" fontSize="12" fill="#111">
        druk
      </text>
      <text x="175" y="74" fontSize="11" fill="#111">
        uit elkaar
      </text>
      <text x="175" y="129" fontSize="11" fill="#111">
        naar elkaar
      </text>
    </>
  );
}

/** 8. Schuine F ontbonden in Fx (horizontaal) en Fy (verticaal). */
export function OntbindenSchuin() {
  return (
    <>
      <circle cx="70" cy="120" r="3" fill="#111" />
      <line x1="70" y1="120" x2="200" y2="40" {...stroke} strokeWidth={2.2} />
      {/* pijlpunt langs de diagonaal */}
      <polyline points="186,42 200,40 192,52" {...stroke} />
      <text x="208" y="48" fontSize="12" fill="#111">
        F
      </text>
      <line x1="70" y1="120" x2="200" y2="120" {...dash} />
      <Tip x={200} y={120} dir="right" />
      <text x="128" y="136" fontSize="12" fill="#111">
        Fx
      </text>
      <line x1="70" y1="120" x2="70" y2="40" {...dash} />
      <Tip x={70} y={40} dir="up" />
      <text x="78" y="70" fontSize="12" fill="#111">
        Fy
      </text>
      <path d="M200 120 L200 40" {...dash} />
    </>
  );
}

/** 9. Hefboom in evenwicht: verticale F, arm = loodrechte afstand langs balk. */
export function HefboomEvenwicht() {
  return (
    <>
      <line x1="28" y1="78" x2="252" y2="78" {...stroke} strokeWidth={2.2} />
      <polygon points="140,78 130,108 150,108" {...stroke} fill="#fff" />
      <text x="134" y="126" fontSize="12" fill="#111">
        P
      </text>
      <line x1="55" y1="78" x2="55" y2="128" {...stroke} strokeWidth={2} />
      <Tip x={55} y={128} dir="down" />
      <text x="40" y="146" fontSize="12" fill="#111">
        F1
      </text>
      <line x1="55" y1="68" x2="140" y2="68" {...dash} />
      <text x="84" y="62" fontSize="11" fill="#111">
        arm1
      </text>
      <line x1="225" y1="78" x2="225" y2="128" {...stroke} strokeWidth={2} />
      <Tip x={225} y={128} dir="down" />
      <text x="210" y="146" fontSize="12" fill="#111">
        F2
      </text>
      <line x1="140" y1="68" x2="225" y2="68" {...dash} />
      <text x="168" y="62" fontSize="11" fill="#111">
        arm2
      </text>
    </>
  );
}

/** 10. School-lab momentenproef (origineel): haken + gestapelde gewichten. */
export function HefboomProef() {
  return (
    <>
      <line x1="30" y1="70" x2="250" y2="70" {...stroke} strokeWidth={2.4} />
      {/* cm-markeringen */}
      {[50, 70, 90, 110, 130, 150, 170, 190, 210, 230].map((x) => (
        <line key={x} x1={x} y1="70" x2={x} y2="76" {...stroke} strokeWidth={1.2} />
      ))}
      <polygon points="140,70 131,98 149,98" {...stroke} fill="#fff" />
      <text x="134" y="116" fontSize="12" fill="#111">
        P
      </text>
      {/* linker haak @ 40 cm-mark (x=70) — 3 gewichten */}
      <line x1="70" y1="70" x2="70" y2="82" {...stroke} />
      <path d="M70 82 Q64 88 70 94 Q76 88 70 82" {...stroke} />
      <rect x="58" y="94" width="24" height="12" {...stroke} fill="#eee" />
      <rect x="58" y="106" width="24" height="12" {...stroke} fill="#eee" />
      <rect x="58" y="118" width="24" height="12" {...stroke} fill="#eee" />
      <text x="48" y="148" fontSize="11" fill="#111">
        3× gewicht
      </text>
      <text x="58" y="62" fontSize="10" fill="#111">
        40 cm
      </text>
      {/* rechter haak @ 60 cm-mark (x=210) — 2 gewichten */}
      <line x1="210" y1="70" x2="210" y2="82" {...stroke} />
      <path d="M210 82 Q204 88 210 94 Q216 88 210 82" {...stroke} />
      <rect x="198" y="94" width="24" height="12" {...stroke} fill="#f5f5f5" />
      <rect x="198" y="106" width="24" height="12" {...stroke} fill="#f5f5f5" />
      <text x="178" y="148" fontSize="11" fill="#111">
        2× gewicht
      </text>
      <text x="198" y="62" fontSize="10" fill="#111">
        60 cm
      </text>
    </>
  );
}

/** 11. Balk met zwaartepunt Z; Fz bij Z; P optioneel uit het midden. */
export function ZwaartepuntBalk() {
  return (
    <>
      <line x1="35" y1="70" x2="245" y2="70" {...stroke} strokeWidth={2.2} />
      <polygon points="110,70 101,100 119,100" {...stroke} fill="#fff" />
      <text x="104" y="118" fontSize="12" fill="#111">
        P
      </text>
      <circle cx="160" cy="70" r="3.5" fill="#111" />
      <text x="152" y="58" fontSize="12" fill="#111">
        Z
      </text>
      <line x1="160" y1="70" x2="160" y2="130" {...stroke} strokeWidth={2} />
      <Tip x={160} y={130} dir="down" />
      <text x="168" y="118" fontSize="12" fill="#111">
        Fz
      </text>
      <text x="70" y="148" fontSize="11" fill="#111">
        Z ≠ P → eigen moment meerekenen
      </text>
    </>
  );
}

/** 12. Vaste katrol alleen (MA ≈ 1): Ftrek één kant, last andere kant. */
export function KatrolVast() {
  return (
    <>
      <line x1="60" y1="22" x2="200" y2="22" {...stroke} />
      <line x1="140" y1="22" x2="140" y2="40" {...stroke} />
      <circle cx="140" cy="56" r="16" {...stroke} />
      <circle cx="140" cy="56" r="3.5" fill="#111" />
      {/* touw over vaste katrol */}
      <path d="M124 56 V130 M156 56 V130" {...stroke} />
      <path d="M124 56 A16 16 0 0 1 156 56" {...stroke} />
      <rect x="104" y="130" width="40" height="22" {...stroke} />
      <text x="112" y="145" fontSize="11" fill="#111">
        last
      </text>
      <line x1="156" y1="130" x2="156" y2="148" {...stroke} strokeWidth={2} />
      <Tip x={156} y={148} dir="down" />
      <text x="166" y="142" fontSize="12" fill="#111">
        Ftrek
      </text>
      <text x="200" y="60" fontSize="11" fill="#111">
        vast · MA≈1
      </text>
    </>
  );
}

/** 13. Takel met 2 strengen (vaste + bewegende katrol), doorlopend touw, MA≈2. */
export function Takel2() {
  // Schoolmodel: anker + vaste katrol dicht bij elkaar BOVEN de bewegende.
  // 2 parallelle verticale strengen; rechter streng gaat vloeiend over vast → Ftrek.
  // Geen knikken, geen trapjes.
  return (
    <>
      <line x1="50" y1="20" x2="230" y2="20" {...stroke} />
      <circle cx="118" cy="20" r="3" fill="#111" />
      {/* vaste katrol: centrum (146,34), r=14 — links=132, rechts=160 */}
      <circle cx="146" cy="34" r="14" {...stroke} />
      <circle cx="146" cy="34" r="3" fill="#111" />
      {/* bewegende: centrum (132,112), r=14 — links=118, rechts=146 (= parallel) */}
      <circle cx="132" cy="112" r="14" {...stroke} />
      <circle cx="132" cy="112" r="3" fill="#111" />
      {/* anker↓ → onder bewegend → ↑ parallel tot links van vast → over vast → Ftrek↓ */}
      <path
        d="M118 20 L118 112 A14 14 0 0 0 146 112 L146 20 A14 14 0 0 1 160 34 L160 148"
        {...stroke}
      />
      <line x1="132" y1="126" x2="132" y2="134" {...stroke} />
      <rect x="112" y="134" width="40" height="18" {...stroke} />
      <text x="120" y="147" fontSize="11" fill="#111">
        last
      </text>
      <Tip x={160} y={148} dir="down" />
      <text x="168" y="130" fontSize="12" fill="#111">
        Ftrek
      </text>
      <text x="52" y="116" fontSize="11" fill="#111">
        bewegend
      </text>
      <text x="168" y="38" fontSize="11" fill="#111">
        vast
      </text>
      <text x="70" y="154" fontSize="11" fill="#111">
        2 strengen
      </text>
    </>
  );
}







/** 14. Zelfde F↓ op klein A (hoge p) vs groot A (lage p). */
export function DrukOppervlakKlas() {
  return (
    <>
      <line x1="70" y1="34" x2="70" y2="86" {...stroke} strokeWidth={2} />
      <Tip x={70} y={86} dir="down" />
      <text x="78" y="52" fontSize="12" fill="#111">
        F
      </text>
      <rect x="55" y="90" width="30" height="14" {...stroke} fill="#eee" />
      <line x1="40" y1="104" x2="100" y2="104" {...stroke} />
      <text x="42" y="124" fontSize="11" fill="#111">
        klein A
      </text>
      <text x="44" y="140" fontSize="11" fill="#111">
        hoge p
      </text>
      <line x1="200" y1="34" x2="200" y2="86" {...stroke} strokeWidth={2} />
      <Tip x={200} y={86} dir="down" />
      <text x="208" y="52" fontSize="12" fill="#111">
        F
      </text>
      <rect x="150" y="90" width="100" height="14" {...stroke} fill="#f5f5f5" />
      <line x1="140" y1="104" x2="260" y2="104" {...stroke} />
      <text x="168" y="124" fontSize="11" fill="#111">
        groot A
      </text>
      <text x="170" y="140" fontSize="11" fill="#111">
        lage p
      </text>
    </>
  );
}

/** 15. Eenvoudige schaar/tang: twee armen, draaipunt P in het midden. */
export function HefboomDubbel() {
  return (
    <>
      <line x1="40" y1="40" x2="240" y2="120" {...stroke} strokeWidth={2.2} />
      <line x1="40" y1="120" x2="240" y2="40" {...stroke} strokeWidth={2.2} />
      <circle cx="140" cy="80" r="5" {...stroke} fill="#fff" />
      <text x="148" y="76" fontSize="12" fill="#111">
        P
      </text>
      <text x="36" y="34" fontSize="11" fill="#111">
        greep
      </text>
      <text x="36" y="148" fontSize="11" fill="#111">
        greep
      </text>
      <text x="220" y="34" fontSize="11" fill="#111">
        bek
      </text>
      <text x="220" y="148" fontSize="11" fill="#111">
        bek
      </text>
    </>
  );
}

export const KLAS_FIGUREN: Record<string, { label: string; node: () => ReactNode }> = {
  "fbd-tafel": { label: "FBD blok op tafel", node: FbdTafel },
  "fbd-hangend": { label: "FBD hangende massa", node: FbdHangend },
  "krachten-tegengesteld": { label: "Tegengestelde krachten", node: KrachtenTegengesteld },
  "krachten-zelfde": { label: "Krachtenzelfde richting", node: KrachtenZelfde },
  "vector-schaal": { label: "Krachtvector met schaal", node: VectorSchaal },
  "constructie-driehoek": { label: "Driehoek vs rechthoek", node: ConstructieDriehoek },
  "trek-druk": { label: "Trek en druk", node: TrekDruk },
  "ontbinden-schuin": { label: "Schuine kracht ontbinden", node: OntbindenSchuin },
  "hefboom-evenwicht": { label: "Hefboom in evenwicht", node: HefboomEvenwicht },
  "hefboom-proef": { label: "Momentenproef met gewichten", node: HefboomProef },
  "zwaartepunt-balk": { label: "Zwaartepunt van een balk", node: ZwaartepuntBalk },
  "katrol-vast": { label: "Vaste katrol", node: KatrolVast },
  "takel-2": { label: "Takel met 2 strengen", node: Takel2 },
  "druk-oppervlak": { label: "Druk en oppervlak", node: DrukOppervlakKlas },
  "hefboom-dubbel": { label: "Dubbele hefboom (schaar)", node: HefboomDubbel },
};

export const KLAS_FIGUUR_IDS = Object.keys(KLAS_FIGUREN);
