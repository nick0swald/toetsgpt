import { useState } from "react";
import { Button } from "@/components/ui/button";
import { bouwKlasOefening } from "@/lib/toets/klas-oefen";
import { useSession } from "@/lib/toets/session";
import { NIVEAUS, type Niveau } from "@/lib/toets/types";
import { cn } from "@/lib/utils";
import { TopBar } from "./zelf";

export function KlasScreen() {
  const { go, startToets, setVakId } = useSession();
  const [niveau, setNiveau] = useState<Niveau | "">("GT");

  function start() {
    if (!niveau) return;
    setVakId("nask");
    startToets(
      bouwKlasOefening({
        niveau,
        seed: Date.now() % 1_000_000,
      }),
    );
  }

  return (
    <main className="flex flex-col">
      <TopBar onBack={() => go("start")} label="Oefenen H10 & H14" />
      <p className="mt-6 text-sm leading-relaxed text-muted-foreground">
        Krachten en werktuigen. Voor 4GT en 3HGL. Ongeveer tien vragen, mix meerkeuze/open, met
        plaatjes. Originele oefening — geen letterlijke boekopgaven.
      </p>

      <section className="mt-6">
        <p className="text-xs font-medium uppercase tracking-[0.14em] text-subtle">Niveau</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {NIVEAUS.map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => setNiveau(n)}
              className={cn(
                "min-h-11 rounded-full px-3.5 text-sm font-bold",
                niveau === n
                  ? "bg-primary text-primary-foreground"
                  : "bg-card text-foreground shadow-[var(--shadow-border)]",
              )}
            >
              {n}
            </button>
          ))}
        </div>
      </section>

      <div className="mt-6">
        <Button type="button" size="lg" variant="klas" disabled={!niveau} onClick={start}>
          Start oefenen H10 & H14
        </Button>
      </div>
    </main>
  );
}
