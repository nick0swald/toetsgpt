/** Eenvoudige CE-achtige figuren (origineel, zwart op wit). */
import type { ReactNode } from "react";

const stroke = {
  fill: "none",
  stroke: "#111",
  strokeWidth: 1.75,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

function Frame({
  children,
  bijschrift,
  label,
}: {
  children: ReactNode;
  bijschrift?: string;
  label: string;
}) {
  return (
    <figure className="mt-4 overflow-hidden rounded-2xl bg-white shadow-[var(--shadow-border)]">
      <svg viewBox="0 0 280 160" className="block w-full" role="img" aria-label={label}>
        <rect x="0" y="0" width="280" height="160" fill="#fff" />
        {children}
      </svg>
      {bijschrift ? (
        <figcaption className="border-t border-black/10 px-3 py-2 text-xs leading-snug text-muted-foreground">
          {bijschrift}
        </figcaption>
      ) : null}
    </figure>
  );
}

function CircuitSerie() {
  return (
    <>
      {/* batterij */}
      <line x1="36" y1="70" x2="36" y2="100" {...stroke} strokeWidth={2.2} />
      <line x1="44" y1="78" x2="44" y2="92" {...stroke} strokeWidth={2.2} />
      <text x="28" y="118" fontSize="11" fill="#111">
        + −
      </text>
      {/* bedrading + schakelaar + 2 lampen */}
      <path d="M44 85 H90" {...stroke} />
      <line x1="90" y1="78" x2="108" y2="92" {...stroke} />
      <path d="M108 85 H130" {...stroke} />
      <circle cx="150" cy="85" r="14" {...stroke} />
      <line x1="140" y1="75" x2="160" y2="95" {...stroke} />
      <line x1="160" y1="75" x2="140" y2="95" {...stroke} />
      <path d="M164 85 H188" {...stroke} />
      <circle cx="208" cy="85" r="14" {...stroke} />
      <line x1="198" y1="75" x2="218" y2="95" {...stroke} />
      <line x1="218" y1="75" x2="198" y2="95" {...stroke} />
      <path d="M222 85 H248 V130 H36 V85" {...stroke} />
      <text x="142" y="48" fontSize="12" fill="#111">
        serie
      </text>
    </>
  );
}

function CircuitParallel() {
  return (
    <>
      <line x1="40" y1="55" x2="40" y2="85" {...stroke} strokeWidth={2.2} />
      <line x1="48" y1="62" x2="48" y2="78" {...stroke} strokeWidth={2.2} />
      <path d="M48 70 H100 V40 H160" {...stroke} />
      <circle cx="180" cy="40" r="12" {...stroke} />
      <line x1="172" y1="32" x2="188" y2="48" {...stroke} />
      <line x1="188" y1="32" x2="172" y2="48" {...stroke} />
      <path d="M192 40 H230 V70 H100 V100 H160" {...stroke} />
      <circle cx="180" cy="100" r="12" {...stroke} />
      <line x1="172" y1="92" x2="188" y2="108" {...stroke} />
      <line x1="188" y1="92" x2="172" y2="108" {...stroke} />
      <path d="M192 100 H230 V70 M100 70 H48" {...stroke} />
      <path d="M40 70 V130 H230 V70" {...stroke} />
      <text x="118" y="148" fontSize="12" fill="#111">
        parallel
      </text>
    </>
  );
}

function KrachtDoos() {
  return (
    <>
      <rect x="100" y="70" width="80" height="50" {...stroke} />
      {/* Fz omlaag */}
      <line x1="140" y1="95" x2="140" y2="145" {...stroke} strokeWidth={2} />
      <polyline points="134,136 140,146 146,136" {...stroke} />
      <text x="148" y="140" fontSize="12" fill="#111">
        Fz
      </text>
      {/* Fn omhoog */}
      <line x1="140" y1="95" x2="140" y2="40" {...stroke} strokeWidth={2} />
      <polyline points="134,50 140,40 146,50" {...stroke} />
      <text x="148" y="52" fontSize="12" fill="#111">
        Fn
      </text>
      <line x1="70" y1="120" x2="210" y2="120" {...stroke} />
      <text x="74" y="148" fontSize="11" fill="#111">
        tafel
      </text>
    </>
  );
}

function StSchets() {
  return (
    <>
      {/* assen */}
      <line x1="40" y1="130" x2="250" y2="130" {...stroke} />
      <line x1="40" y1="130" x2="40" y2="30" {...stroke} />
      <polyline points="244,124 250,130 244,136" {...stroke} />
      <polyline points="34,36 40,30 46,36" {...stroke} />
      <text x="252" y="134" fontSize="12" fill="#111">
        t
      </text>
      <text x="28" y="28" fontSize="12" fill="#111">
        s
      </text>
      {/* rechte lijn */}
      <line x1="40" y1="130" x2="210" y2="45" {...stroke} strokeWidth={2} />
      <text x="160" y="100" fontSize="11" fill="#111">
        const. v
      </text>
    </>
  );
}

function DichtheidBlokken() {
  return (
    <>
      {/* waterbak */}
      <rect x="40" y="50" width="200" height="90" {...stroke} />
      <line x1="40" y1="78" x2="240" y2="78" {...stroke} strokeDasharray="4 3" />
      <text x="48" y="72" fontSize="11" fill="#111">
        water
      </text>
      {/* drijvend hout */}
      <rect x="70" y="62" width="50" height="28" {...stroke} fill="#f5f5f5" />
      <text x="78" y="80" fontSize="11" fill="#111">
        hout
      </text>
      {/* zinkend steen */}
      <rect x="160" y="108" width="50" height="26" {...stroke} fill="#eee" />
      <text x="166" y="125" fontSize="11" fill="#111">
        steen
      </text>
    </>
  );
}

function ThermometerIsolatie() {
  return (
    <>
      {/* thermos schets */}
      <rect x="50" y="35" width="70" height="100" rx="12" {...stroke} />
      <rect x="62" y="48" width="46" height="74" rx="8" {...stroke} />
      <text x="58" y="150" fontSize="11" fill="#111">
        isoleerkan
      </text>
      {/* thermometer */}
      <line x1="180" y1="40" x2="180" y2="115" {...stroke} strokeWidth={2} />
      <circle cx="180" cy="128" r="12" {...stroke} />
      <line x1="170" y1="60" x2="190" y2="60" {...stroke} />
      <line x1="170" y1="80" x2="190" y2="80" {...stroke} />
      <line x1="170" y1="100" x2="190" y2="100" {...stroke} />
      <text x="200" y="90" fontSize="11" fill="#111">
        T
      </text>
      {/* stralingspijlen */}
      <path d="M130 70 H155" {...stroke} />
      <polyline points="148,64 156,70 148,76" {...stroke} />
    </>
  );
}


function KrachtVectoren() {
  return (
    <>
      {/* ondergrond */}
      <line x1="50" y1="120" x2="230" y2="120" {...stroke} />
      {/* doos / voorwerp; CoM in het midden */}
      <rect x="110" y="70" width="60" height="50" {...stroke} />
      <circle cx="140" cy="95" r="2.5" fill="#111" />
      {/* Fz vanaf zwaartepunt omlaag */}
      <line x1="140" y1="95" x2="140" y2="148" {...stroke} strokeWidth={2} />
      <polyline points="134,139 140,149 146,139" {...stroke} />
      <text x="148" y="145" fontSize="12" fill="#111">
        Fz
      </text>
      {/* Fn vanaf steunvlak omhoog */}
      <line x1="140" y1="120" x2="140" y2="42" {...stroke} strokeWidth={2} />
      <polyline points="134,52 140,42 146,52" {...stroke} />
      <text x="148" y="54" fontSize="12" fill="#111">
        Fn
      </text>
    </>
  );
}

function HefboomMoment() {
  return (
    <>
      {/* balk; arm = loodrechte afstand tot werklijn (hier horizontaal bij verticale F) */}
      <line x1="30" y1="80" x2="250" y2="80" {...stroke} strokeWidth={2.2} />
      {/* draaipunt P */}
      <polygon points="140,80 130,110 150,110" {...stroke} fill="#fff" />
      <text x="134" y="128" fontSize="12" fill="#111">
        P
      </text>
      {/* F1 omlaag links */}
      <line x1="60" y1="80" x2="60" y2="130" {...stroke} strokeWidth={2} />
      <polyline points="54,121 60,131 66,121" {...stroke} />
      <text x="44" y="148" fontSize="12" fill="#111">
        F1
      </text>
      {/* arm1 */}
      <line x1="60" y1="70" x2="140" y2="70" {...stroke} strokeDasharray="3 2" />
      <text x="88" y="64" fontSize="11" fill="#111">
        arm1
      </text>
      {/* F2 omlaag rechts */}
      <line x1="220" y1="80" x2="220" y2="130" {...stroke} strokeWidth={2} />
      <polyline points="214,121 220,131 226,121" {...stroke} />
      <text x="204" y="148" fontSize="12" fill="#111">
        F2
      </text>
      <line x1="140" y1="70" x2="220" y2="70" {...stroke} strokeDasharray="3 2" />
      <text x="166" y="64" fontSize="11" fill="#111">
        arm2
      </text>
    </>
  );
}

function KatrolTakel() {
  return (
    <>
      {/* plafond / steun */}
      <line x1="40" y1="22" x2="200" y2="22" {...stroke} />
      <line x1="120" y1="22" x2="120" y2="36" {...stroke} />
      {/* vaste katrol (boven) */}
      <circle cx="120" cy="52" r="16" {...stroke} />
      <circle cx="120" cy="52" r="3.5" fill="#111" />
      {/* bewegende katrol (onder) */}
      <circle cx="120" cy="108" r="14" {...stroke} />
      <circle cx="120" cy="108" r="3" fill="#111" />
      {/* doorlopende kabel: vast aan plafond → onder bewegende → over vaste → vrije trekeinde */}
      <path
        d="M70 22 V108 A14 14 0 0 0 134 108 V52 A16 16 0 0 0 104 52 V148"
        {...stroke}
      />
      {/* last onder bewegende katrol */}
      <line x1="120" y1="122" x2="120" y2="132" {...stroke} />
      <rect x="100" y="132" width="40" height="20" {...stroke} />
      <text x="108" y="146" fontSize="11" fill="#111">
        last
      </text>
      {/* Ftrek aan vrije eind */}
      <polyline points="98,140 104,150 110,140" {...stroke} />
      <text x="48" y="152" fontSize="12" fill="#111">
        Ftrek
      </text>
      <text x="190" y="70" fontSize="11" fill="#111">
        vast
      </text>
      <text x="190" y="112" fontSize="11" fill="#111">
        bewegend
      </text>
    </>
  );
}

function DrukOppervlak() {
  return (
    <>
      {/* klein oppervlak — F wijst OMLAAG op het steunvlak */}
      <line x1="70" y1="36" x2="70" y2="86" {...stroke} strokeWidth={2} />
      <polyline points="64,76 70,88 76,76" {...stroke} />
      <text x="78" y="52" fontSize="12" fill="#111">
        F
      </text>
      <rect x="55" y="90" width="30" height="14" {...stroke} fill="#eee" />
      <line x1="40" y1="104" x2="100" y2="104" {...stroke} />
      <text x="42" y="124" fontSize="11" fill="#111">
        klein A
      </text>
      <text x="48" y="140" fontSize="11" fill="#111">
        hoge p
      </text>
      {/* groot oppervlak — F wijst OMLAAG op het steunvlak */}
      <line x1="200" y1="36" x2="200" y2="86" {...stroke} strokeWidth={2} />
      <polyline points="194,76 200,88 206,76" {...stroke} />
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

const FIGUREN: Record<string, { label: string; node: () => ReactNode }> = {
  "circuit-serie": { label: "Serieschakeling", node: CircuitSerie },
  "circuit-parallel": { label: "Parallelschakeling", node: CircuitParallel },
  "kracht-doos": { label: "Krachten op een doos", node: KrachtDoos },
  "st-schets": { label: "(s,t)-diagram", node: StSchets },
  "dichtheid-blokken": { label: "Drijven en zinken", node: DichtheidBlokken },
  "thermometer-isolatie": { label: "Isolatie en temperatuur", node: ThermometerIsolatie },
  "kracht-vectoren": { label: "Krachtenvectoren", node: KrachtVectoren },
  "hefboom-moment": { label: "Hefboom en moment", node: HefboomMoment },
  "katrol-takel": { label: "Katrol en takel", node: KatrolTakel },
  "druk-oppervlak": { label: "Druk en oppervlak", node: DrukOppervlak },
};

export function ExamenFiguur({ id, bijschrift }: { id: string; bijschrift?: string }) {
  const fig = FIGUREN[id];
  if (!fig) return null;
  const Node = fig.node;
  return (
    <Frame bijschrift={bijschrift} label={fig.label}>
      <Node />
    </Frame>
  );
}

export const EXAMEN_FIGUUR_IDS = Object.keys(FIGUREN);
