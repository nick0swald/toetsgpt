import { useEffect, useMemo, useState } from "react";
import { bouwVandaag } from "@/lib/toets/demo";
import {
  diagnoseZin,
  lastigTekst,
  leesDiagnoseGeheugen,
  pijnpunten,
  wins,
} from "@/lib/toets/diagnose-geheugen";
import { Button } from "@/components/ui/button";
import { useSession } from "@/lib/toets/session";
import { hoofdstukById, hoofdstukkenVoor, parseKlas } from "@/lib/toets/stof";
import { LEERJAREN, NIVEAUS, type Leerjaar, type Niveau } from "@/lib/toets/types";
import { cn } from "@/lib/utils";
import { FieldSelect, TopBar } from "./zelf";

export function VandaagScreen() {
  const { state, go, startToets, setVakId } = useSession();
  const fromKlas = parseKlas(state.klas);
  const geheugen = useMemo(() => leesDiagnoseGeheugen(), []);
  const zin = useMemo(() => diagnoseZin(geheugen), [geheugen]);

  const [leerjaar, setLeerjaar] = useState<Leerjaar | "">(
    (geheugen?.leerjaar as Leerjaar | undefined) || fromKlas.leerjaar,
  );
  const [niveau, setNiveau] = useState<Niveau | "">(
    (geheugen?.niveau as Niveau | undefined) || fromKlas.niveau,
  );
  const [hoofdstukId, setHoofdstukId] = useState(geheugen?.hoofdstukId ?? "");
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    // re-read after mount (SSR-safe)
    const g = leesDiagnoseGeheugen();
    if (g?.leerjaar) setLeerjaar(g.leerjaar as Leerjaar);
    if (g?.niveau) setNiveau(g.niveau as Niveau);
    if (g?.hoofdstukId) setHoofdstukId(g.hoofdstukId);
    setHydrated(true);
  }, []);

  const hoofdstukken = useMemo(
    () => (leerjaar && niveau ? hoofdstukkenVoor(leerjaar, niveau, "nask", state.klas) : []),
    [leerjaar, niveau, state.klas],
  );
  const gekozen = hoofdstukById(hoofdstukId, "nask");
  const klaar = Boolean(leerjaar && niveau);
  const liveZin = hydrated ? diagnoseZin(leesDiagnoseGeheugen()) || zin : zin;

  function start() {
    if (!leerjaar || !niveau) return;
    setVakId("nask");
    const g = leesDiagnoseGeheugen();
    const zwak = pijnpunten(g, 5);
    const sterk = wins(g, 3);
    startToets(
      bouwVandaag({
        leerjaar,
        niveau,
        hoofdstukId: hoofdstukId || undefined,
        seed: Date.now() % 1_000_000,
        lastigParagraafIds: zwak.map((s) => s.paragraafId),
        winParagraafIds: sterk.map((s) => s.paragraafId),
        lastig: lastigTekst(g) || undefined,
      }),
    );
  }

  return (
    <main className="flex flex-col">
      <TopBar onBack={() => go("start")} label="Korte oefening" />
      <p className="mt-6 text-sm leading-relaxed text-muted-foreground">
        Kies jaar en niveau. Hoofdstuk mag leeg. Acht vragen, ongeveer tien minuten.
      </p>

      {liveZin ? (
        <p
          className="mt-4 rounded-2xl bg-card px-4 py-3 text-sm leading-relaxed text-foreground shadow-[var(--shadow-border)]"
          role="status"
        >
          {liveZin}
        </p>
      ) : null}

      <section className="mt-6">
        <p className="text-xs font-medium uppercase tracking-[0.14em] text-subtle">Jaar</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {LEERJAREN.map((j) => (
            <Chip key={j} selected={leerjaar === j} onClick={() => setLeerjaar(j)}>
              {j}
            </Chip>
          ))}
        </div>
      </section>

      <section className="mt-5">
        <p className="text-xs font-medium uppercase tracking-[0.14em] text-subtle">Niveau</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {NIVEAUS.map((n) => (
            <Chip key={n} selected={niveau === n} onClick={() => setNiveau(n)}>
              {n}
            </Chip>
          ))}
        </div>
      </section>

      <section className="mt-5">
        <p className="text-xs font-medium uppercase tracking-[0.14em] text-subtle">Vak</p>
        <div className="mt-2 flex flex-wrap gap-2">
          <Chip selected onClick={() => undefined}>
            NaSk
          </Chip>
          <span className="inline-flex min-h-11 items-center rounded-full px-3.5 text-sm font-bold text-subtle opacity-50">
            Andere vakken · straks
          </span>
        </div>
      </section>

      <div className="mt-5">
        <FieldSelect
          id="vandaag-hst"
          label="Hoofdstuk"
          value={hoofdstukId}
          onChange={setHoofdstukId}
          options={[
            { value: "", label: "Geen hoofdstuk" },
            ...hoofdstukken.map((h) => ({ value: h.id, label: h.titel })),
          ]}
        />
        <p className="mt-1.5 text-xs text-subtle">
          {gekozen
            ? "Eerst eenheden en formules, daarna dit hoofdstuk."
            : liveZin
              ? "Volgende ronde volgt vooral wat nog lastig was, plus een paar die al lukten."
              : "Zonder hoofdstuk: eenheden, formules en een mix."}
        </p>
      </div>

      <div className="mt-6">
        <Button type="button" size="lg" disabled={!klaar} onClick={start}>
          {liveZin ? "Nog een ronde" : "Start"}
        </Button>
      </div>
    </main>
  );
}

function Chip({
  selected,
  onClick,
  children,
}: {
  selected: boolean;
  onClick: () => void;
  children: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "min-h-11 rounded-full px-3.5 text-sm font-bold",
        selected
          ? "bg-primary text-primary-foreground"
          : "bg-card text-foreground shadow-[var(--shadow-border)]",
      )}
    >
      {children}
    </button>
  );
}
