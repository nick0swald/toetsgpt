import type { ReactNode } from "react";
import { useState } from "react";
import { BookOpen, FileText, GraduationCap, PencilLine } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { naamOk } from "@/lib/toets/format";
import {
  isHuiswerkActief,
  isHuiswerkModusBeschikbaar,
  setHuiswerkActief,
} from "@/lib/toets/huiswerk";
import { bouwKlasOefening } from "@/lib/toets/klas-oefen";
import { useSession } from "@/lib/toets/session";
import { VAKKEN } from "@/lib/toets/stof";
import { cn } from "@/lib/utils";

const START_VAKKEN = VAKKEN.filter((v) => v.id === "nask" || v.id === "lees");
const HUISWERK_UI = isHuiswerkModusBeschikbaar();

/** Zet op false / verwijder knop wanneer de klastoets voorbij is. */
export const TIJDELIJKE_KLAS_OEFEN = true;

export function StartScreen() {
  const { state, setNaam, setVakId, startToets, go } = useSession();
  const naamFout = state.naam.length > 0 && !naamOk(state.naam);
  const isLees = state.vakId === "lees";
  const [huiswerkAan, setHuiswerkAan] = useState(() => (HUISWERK_UI ? isHuiswerkActief() : false));

  function toggleHuiswerk() {
    const next = !huiswerkAan;
    setHuiswerkActief(next, state.naam);
    setHuiswerkAan(next);
  }

  return (
    <div className="stagger-in flex min-h-0 flex-1 flex-col">
      <p className="max-w-[22ch] text-xl font-extrabold leading-tight tracking-tight text-foreground text-balance">
        Oefen een toets. Geen Word, wel een score.
      </p>

      <form className="mt-5 grid gap-4" onSubmit={(e) => e.preventDefault()}>
        <div className="grid gap-1.5">
          <Label htmlFor="naam">Naam</Label>
          <Input
            id="naam"
            autoComplete="given-name"
            inputMode="text"
            placeholder="Optioneel"
            value={state.naam}
            maxLength={32}
            onChange={(e) => setNaam(e.target.value)}
            aria-invalid={naamFout}
          />
          {naamFout ? <p className="text-sm text-destructive">Alleen letters.</p> : null}
        </div>


        {TIJDELIJKE_KLAS_OEFEN && !isLees ? (
          <Ingang
            icon={<BookOpen className="size-6" strokeWidth={2} />}
            title="Oefenen H10 & H14"
            body="Krachten en werktuigen · 4GT. Met plaatjes."
            variant="klas"
            onClick={() => {
              if (naamFout) return;
              setVakId("nask");
              startToets(bouwKlasOefening({ niveau: "GT", seed: Date.now() % 1_000_000 }));
            }}
          />
        ) : null}

        <div>
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-subtle">Vak</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {START_VAKKEN.map((v) => {
              const on = state.vakId === v.id;
              return (
                <button
                  key={v.id}
                  type="button"
                  onClick={() => setVakId(v.id)}
                  className={cn(
                    "min-h-11 rounded-full px-4 text-sm font-bold",
                    on && v.id === "lees"
                      ? "bg-accent text-accent-foreground"
                      : on
                        ? "bg-primary text-primary-foreground"
                        : "bg-card text-foreground shadow-[var(--shadow-border)]",
                  )}
                >
                  {v.titel}
                </button>
              );
            })}
          </div>
        </div>
      </form>

      {HUISWERK_UI ? (
        <div className="mt-4 rounded-2xl bg-card p-4 shadow-[var(--shadow-border)]">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="text-sm font-extrabold text-foreground">Huiswerkmodus</p>
              <p className="mt-0.5 text-xs leading-snug text-muted-foreground">
                {huiswerkAan
                  ? "Sessielog aan. Download na het oefenen."
                  : "Zet aan om je oefensessie bij te houden."}
              </p>
            </div>
            <button
              type="button"
              onClick={toggleHuiswerk}
              aria-pressed={huiswerkAan}
              className={cn(
                "min-h-11 shrink-0 rounded-full px-4 text-sm font-bold",
                huiswerkAan
                  ? "bg-primary text-primary-foreground"
                  : "bg-background text-foreground shadow-[var(--shadow-border)]",
              )}
            >
              {huiswerkAan ? "Aan" : "Uit"}
            </button>
          </div>
        </div>
      ) : null}

      <div className="mt-6 flex flex-1 flex-col gap-3">
        {isLees ? (
          <Ingang
            icon={<PencilLine className="size-6" strokeWidth={2} />}
            title="Lezen oefenen"
            body="Korte vaktekst, daarna één vraag. Geen rekenen."
            variant="primary"
            grow
            onClick={() => !naamFout && go("zelf")}
          />
        ) : (
          <>
            <Ingang
              icon={<PencilLine className="size-6" strokeWidth={2} />}
              title="Korte oefening"
              body="Jaar, niveau, optioneel hoofdstuk. Acht vragen."
              variant="primary"
              grow
              onClick={() => !naamFout && go("vandaag")}
            />
            <Ingang
              icon={<PencilLine className="size-6" strokeWidth={2} />}
              title="Zelf oefenen"
              body="Meer keuzes: soort, duur, briefje."
              variant="secondary"
              grow
              onClick={() => !naamFout && go("zelf")}
            />
          </>
        )}
        <Ingang
          icon={<FileText className="size-6" strokeWidth={2} />}
          title="Briefje laden"
          body="Alleen een bewaard briefje kiezen. Daarna verder."
          variant="outline"
          grow
          onClick={() => !naamFout && go("briefje")}
        />
        {!isLees ? (
          <Ingang
            icon={<GraduationCap className="size-6" strokeWidth={2} />}
            title="Oefenen voor het examen"
            body="Jaar 4 · CE-stijl, timer, score per onderdeel."
            variant="exam"
            grow
            onClick={() => !naamFout && go("examen")}
          />
        ) : null}
        <p className="mt-auto pt-4 text-center text-xs leading-relaxed text-subtle">
          Ares058 VMBO Leeuwarden · toetsgpt.nl
          <br />
          Oefenen voor de klas van Nick. Geen officieel cijfer.
        </p>
      </div>
    </div>
  );
}

function Ingang({
  icon,
  title,
  body,
  variant,
  grow,
  onClick,
}: {
  icon: ReactNode;
  title: string;
  body: string;
  variant: "primary" | "secondary" | "outline" | "exam" | "klas";
  grow?: boolean;
  onClick: () => void;
}) {
  return (
    <Button
      type="button"
      variant={variant}
      size="lg"
      onClick={onClick}
      className={cn(
        "items-center justify-start gap-3.5 overflow-visible whitespace-normal",
        grow && "flex-1 min-h-[4.75rem]",
      )}
    >
      <span className="flex size-10 shrink-0 items-center justify-center">{icon}</span>
      <span className="min-w-0 text-left">
        <span className="block font-extrabold">{title}</span>
        <span className="mt-0.5 block text-sm font-medium leading-snug opacity-80">{body}</span>
      </span>
    </Button>
  );
}
