import type { ReactNode } from "react";
import { FileText, PencilLine } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { KLASSEN } from "@/lib/toets/types";
import { naamOk } from "@/lib/toets/format";
import { useSession } from "@/lib/toets/session";
import { VAKKEN } from "@/lib/toets/stof";
import { cn } from "@/lib/utils";

export function StartScreen() {
  const { state, setNaam, setKlas, setVakId, go } = useSession();
  const naamFout = state.naam.length > 0 && !naamOk(state.naam);

  return (
    <div className="stagger-in flex min-h-0 flex-1 flex-col">
      <p className="max-w-[20ch] text-xl font-extrabold leading-tight tracking-tight text-foreground text-balance">
        Oefen een toets. Geen Word, wel een score.
      </p>

      <form className="mt-5 grid gap-3" onSubmit={(e) => e.preventDefault()}>
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

        <div className="grid gap-1.5">
          <Label htmlFor="klas">Klas</Label>
          <select
            id="klas"
            value={state.klas}
            onChange={(e) => setKlas(e.target.value)}
            className={cn(
              "h-12 w-full appearance-none rounded-2xl bg-card px-4 text-base text-foreground",
              "shadow-[var(--shadow-border)]",
              "bg-[url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%2212%22 height=%228%22 fill=%22none%22 stroke=%22%2352525b%22 stroke-width=%221.6%22><path d=%22m1 1 5 5 5-5%22/></svg>')] bg-[length:12px_8px] bg-[right_14px_center] bg-no-repeat pr-10",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
            )}
          >
            <option value="">Kies je klas</option>
            {KLASSEN.map((k) => (
              <option key={k} value={k}>
                {k}
              </option>
            ))}
          </select>
        </div>

        <div>
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-subtle">Vak</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {VAKKEN.map((v) => {
              const live = v.status === "live";
              const on = state.vakId === v.id;
              return (
                <button
                  key={v.id}
                  type="button"
                  disabled={!live}
                  onClick={() => live && setVakId(v.id)}
                  className={cn(
                    "min-h-11 rounded-full px-4 text-sm font-bold",
                    on && v.id === "lees"
                      ? "bg-accent text-accent-foreground"
                      : on
                        ? "bg-primary text-primary-foreground"
                        : "bg-card text-foreground shadow-[var(--shadow-border)]",
                    !live && "opacity-50",
                  )}
                >
                  {v.titel}
                  {v.tijdelijk ? " · tijdelijk" : !live ? " · straks" : ""}
                </button>
              );
            })}
          </div>
        </div>
      </form>

      <div className="mt-auto grid gap-3 pt-6">
        <Ingang
          icon={<PencilLine className="size-6" strokeWidth={2} />}
          title="Vandaag oefenen"
          body="Jaar, niveau, NaSk. Hoofdstuk mag leeg."
          variant="primary"
          onClick={() => !naamFout && go("vandaag")}
        />
        <Ingang
          icon={<PencilLine className="size-6" strokeWidth={2} />}
          title="Zelf oefenen"
          body={
            state.vakId === "lees"
              ? "Alleen vakteksten. Geen rekenen."
              : "Kies leerjaar, niveau en hoofdstuk."
          }
          variant="secondary"
          onClick={() => !naamFout && go("zelf")}
        />
        <Ingang
          icon={<FileText className="size-6" strokeWidth={2} />}
          title="Oefenbriefje"
          body="Verder oefenen met lastige stof."
          variant="secondary"
          onClick={() => !naamFout && go("zelf")}
        />
        <p className="pt-1 text-center text-xs leading-relaxed text-subtle">
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
  onClick,
}: {
  icon: ReactNode;
  title: string;
  body: string;
  variant: "primary" | "secondary";
  onClick: () => void;
}) {
  return (
    <Button
      type="button"
      variant={variant}
      size="lg"
      onClick={onClick}
      className="items-center justify-start gap-3.5 overflow-visible whitespace-normal"
    >
      <span className="flex size-10 shrink-0 items-center justify-center">{icon}</span>
      <span className="min-w-0 text-left">
        <span className="block font-extrabold">{title}</span>
        <span className="mt-0.5 block text-sm font-medium leading-snug opacity-80">{body}</span>
      </span>
    </Button>
  );
}
