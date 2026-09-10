import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { bouwExamenOefening, examenOnderdeelChips } from "@/lib/toets/examen-oefen";
import { useSession } from "@/lib/toets/session";
import { NIVEAUS, type Niveau } from "@/lib/toets/types";
import { cn } from "@/lib/utils";
import { TopBar } from "./zelf";

export function ExamenScreen() {
  const { go, startToets, setVakId } = useSession();
  const chips = useMemo(() => examenOnderdeelChips(), []);
  const [niveau, setNiveau] = useState<Niveau | "">("GT");
  const [focus, setFocus] = useState<string[]>([]);

  function toggle(id: string) {
    setFocus((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }

  function start() {
    if (!niveau) return;
    setVakId("nask");
    startToets(
      bouwExamenOefening({
        niveau,
        seed: Date.now() % 1_000_000,
        focusOnderdeelIds: focus.length ? focus : undefined,
      }),
    );
  }

  return (
    <main className="flex flex-col">
      <TopBar onBack={() => go("start")} label="Oefenen voor het examen" />
      <p className="mt-6 text-sm leading-relaxed text-muted-foreground">
        Alleen leerjaar 4. CE-stijl: ongeveer tien vragen, mix meerkeuze/open, inclusief korte
        vaktekst-leesvragen. Timer ongeveer twintig minuten. Geen letterlijke examens — originele
        oefening op syllabus-onderwerpen.
      </p>

      <section className="mt-6">
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
        <p className="text-xs font-medium uppercase tracking-[0.14em] text-subtle">
          Focus CE-onderdelen
        </p>
        <p className="mt-1.5 text-xs text-subtle">Optioneel. Geen keuze = mix over het CE.</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {chips.map((c) => (
            <Chip key={c.id} selected={focus.includes(c.id)} onClick={() => toggle(c.id)}>
              {c.label}
            </Chip>
          ))}
        </div>
      </section>

      <div className="mt-6">
        <Button type="button" size="lg" disabled={!niveau} onClick={start}>
          Start examen oefenen
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
