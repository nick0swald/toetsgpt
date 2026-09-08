import type { ReactNode } from "react";
import { ClipboardList, PencilLine } from "lucide-react";
import { BrandMark } from "@/components/brand-mark";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { KLASSEN } from "@/lib/toets/types";
import { naamOk } from "@/lib/toets/format";
import { useSession } from "@/lib/toets/session";
import { cn } from "@/lib/utils";

export function StartScreen() {
  const { state, setNaam, setKlas, go } = useSession();
  const naamFout = state.naam.length > 0 && !naamOk(state.naam);

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-lg flex-col px-5 pb-10 pt-[max(1.5rem,env(safe-area-inset-top))]">
      <div className="stagger-in flex min-h-0 flex-1 flex-col">
        <header>
          <BrandMark />
        </header>

        <p className="mt-8 max-w-[22ch] font-serif text-2xl font-medium leading-snug tracking-tight text-foreground text-balance">
          Oefen een toets. Geen Word, wel een score.
        </p>

        <form className="mt-8 grid gap-4" onSubmit={(e) => e.preventDefault()}>
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
            {naamFout ? (
              <p className="text-sm text-destructive">Alleen letters.</p>
            ) : (
              <p className="text-xs text-subtle">Mag leeg. Geen cijfers.</p>
            )}
          </div>

          <div className="grid gap-1.5">
            <Label htmlFor="klas">Klas</Label>
            <select
              id="klas"
              value={state.klas}
              onChange={(e) => setKlas(e.target.value)}
              className={cn(
                "h-12 w-full appearance-none rounded-lg bg-card px-3.5 text-base text-foreground",
                "shadow-[var(--shadow-border)]",
                "bg-[url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%2212%22 height=%228%22 fill=%22none%22 stroke=%22%239c998e%22 stroke-width=%221.6%22><path d=%22m1 1 5 5 5-5%22/></svg>')] bg-[length:12px_8px] bg-[right_14px_center] bg-no-repeat pr-10",
                "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary",
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
        </form>

        <div className="mt-8 grid gap-3">
          <p className="text-xs font-medium uppercase tracking-[0.14em] text-subtle">
            Kies een ingang
          </p>
          <Ingang
            icon={<PencilLine className="size-5" strokeWidth={1.75} />}
            title="Zelf oefenen"
            body="Kies leerjaar, niveau en hoofdstuk. Nu: voorbeeld NaSk. Later: biologie."
            onClick={() => !naamFout && go("zelf")}
          />
          <Ingang
            icon={<ClipboardList className="size-5" strokeWidth={1.75} />}
            title="Toets van de docent"
            body="Plak de leerlingtoets. Later kan dat met een code."
            onClick={() => !naamFout && go("docent")}
          />
        </div>

        <p className="mt-auto pt-10 text-center text-xs leading-relaxed text-subtle">
          Ares058 VMBO Leeuwarden · toetsgpt.nl
          <br />
          Oefenen voor de klas van Nick. Geen officieel cijfer.
        </p>
      </div>
    </main>
  );
}

function Ingang({
  icon,
  title,
  body,
  onClick,
}: {
  icon: ReactNode;
  title: string;
  body: string;
  onClick: () => void;
}) {
  return (
    <Button
      type="button"
      variant="secondary"
      size="lg"
      onClick={onClick}
      className="h-auto items-start justify-start gap-3.5 px-4 py-4 text-left"
    >
      <span className="mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-lg bg-background text-primary">
        {icon}
      </span>
      <span className="min-w-0">
        <span className="block font-medium text-foreground">{title}</span>
        <span className="mt-0.5 block text-sm font-normal leading-snug text-muted-foreground">
          {body}
        </span>
      </span>
    </Button>
  );
}
