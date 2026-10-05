import { Button } from "@/components/ui/button";
import { renderFiguur } from "@/lib/toets/figuren/render";
import { useSession } from "@/lib/toets/session";
import type { FiguurSpec } from "@/lib/toets/figuren/types";
import type { Letter, McQuestion } from "@/lib/toets/types";
import { cn } from "@/lib/utils";

export function DoorScreen() {
  const { state, setDoorAntwoord, keurDoor, volgendeDoor, stopDoor } = useSession();
  const ronde = state.door;
  if (!ronde) return null;
  const vraag = ronde.vraag;
  const nakijk = ronde.nakijk;
  const n = ronde.log.length;

  return (
    <main className="flex min-h-[70dvh] flex-col pb-4">
      <header>
        <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-subtle">
          Oefenen zonder einde
        </p>
        <p className="mt-0.5 font-serif text-lg font-medium tracking-tight text-foreground">
          {n === 0 ? "Eerste vraag" : `${n} nagekeken`}
        </p>
      </header>

      <article className="mt-5 flex-1">
        {vraag.skill === "lees" ? (
          <div className="rounded-2xl bg-card px-4 py-3 shadow-[var(--shadow-border)]">
            <p className="text-[1.05rem] leading-relaxed text-foreground text-pretty">{vraag.situation}</p>
          </div>
        ) : (
          <p className="text-[1.05rem] leading-relaxed text-foreground text-pretty">{vraag.situation}</p>
        )}
        <Figuur spec={vraag.figuur} />
        <p className="mt-4 font-medium leading-snug text-foreground text-pretty">{vraag.prompt}</p>
        {vraag.stof ? <p className="mt-2 text-xs text-subtle">{vraag.stof.label}</p> : null}

        {vraag.type === "mc" ? (
          <Mc
            question={vraag}
            value={(ronde.antwoord as Letter | "") || ""}
            locked={Boolean(nakijk)}
            onChange={setDoorAntwoord}
          />
        ) : (
          <textarea
            value={ronde.antwoord}
            disabled={Boolean(nakijk)}
            onChange={(e) => setDoorAntwoord(e.target.value)}
            rows={4}
            placeholder="Typ je antwoord"
            className="mt-5 w-full rounded-2xl bg-card px-4 py-3 text-base text-foreground shadow-[var(--shadow-border)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 disabled:opacity-70"
          />
        )}

        {nakijk ? (
          <div className="mt-4 rounded-2xl bg-card px-4 py-3 shadow-[var(--shadow-border)]">
            <p className={cn("text-sm font-bold", nakijk.correct ? "text-ok" : "text-destructive")}>
              {nakijk.correct ? "Juist." : nakijk.points > 0 ? "Deels juist." : "Niet juist."}
            </p>
            <p className="mt-1 text-sm leading-relaxed text-foreground">{vraag.why}</p>
            <p className="mt-2 text-xs text-subtle">
              {nakijk.correct
                ? "De volgende vraag gaat verder in de stof."
                : "De volgende vraag oefent dit onderdeel opnieuw, in een andere situatie."}
            </p>
          </div>
        ) : null}
      </article>

      <div className="mt-6 grid gap-2">
        {nakijk ? (
          <Button type="button" size="lg" onClick={volgendeDoor}>
            Volgende vraag
          </Button>
        ) : (
          <Button type="button" size="lg" onClick={keurDoor} disabled={!ronde.antwoord.trim()}>
            Kijk deze vraag na
          </Button>
        )}
        <Button type="button" variant="secondary" size="lg" onClick={stopDoor} disabled={n === 0}>
          Stop en bewaar briefje
        </Button>
      </div>
    </main>
  );
}

function Figuur({ spec }: { spec?: FiguurSpec }) {
  const svg = renderFiguur(spec);
  if (!svg) return null;
  return (
    <div
      className="mt-4 flex justify-center overflow-hidden rounded-2xl bg-white p-3 shadow-[var(--shadow-border)] [&_svg]:h-auto [&_svg]:max-h-64 [&_svg]:w-auto [&_svg]:max-w-full"
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}

function Mc({
  question,
  value,
  locked,
  onChange,
}: {
  question: McQuestion;
  value: Letter | "";
  locked: boolean;
  onChange: (value: string) => void;
}) {
  return (
    <ul className="mt-5 grid gap-2">
      {question.options.map((opt) => {
        const selected = value === opt.letter;
        return (
          <li key={opt.letter}>
            <button
              type="button"
              disabled={locked}
              onClick={() => onChange(opt.letter)}
              className={cn(
                "flex w-full min-h-14 items-start gap-3 rounded-2xl px-3.5 py-3 text-left",
                "shadow-[var(--shadow-border)]",
                selected ? "bg-primary/15" : "bg-card",
                locked && "opacity-80",
              )}
            >
              <span className="w-6 shrink-0 font-medium tabular-nums text-muted-foreground">{opt.letter}</span>
              <span className="min-w-0 flex-1 text-base leading-snug text-foreground">{opt.text}</span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}
