import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { duurMinuten, formatTijd } from "@/lib/toets/format";
import { useSession } from "@/lib/toets/session";
import type { InvulQuestion, Letter, McQuestion, OpenQuestion } from "@/lib/toets/types";
import { cn } from "@/lib/utils";

export function ExamScreen() {
  const { state, setAnswer, setIndex, askSubmit, cancelSubmit, submit } = useSession();
  const toets = state.toets;
  const [now, setNow] = useState(() => Date.now());

  const durationSec = toets ? (duurMinuten(toets.bron.tijd) ?? 0) * 60 : 0;
  const remaining = useMemo(() => {
    if (!durationSec || !state.startedAt) return null;
    return durationSec - (now - state.startedAt) / 1000;
  }, [durationSec, now, state.startedAt]);

  useEffect(() => {
    if (!durationSec) return;
    const id = window.setInterval(() => setNow(Date.now()), 250);
    return () => window.clearInterval(id);
  }, [durationSec]);

  useEffect(() => {
    if (remaining !== null && remaining <= 0) submit();
  }, [remaining, submit]);

  if (!toets) return null;
  const total = toets.questions.length;
  const index = Math.min(state.index, total - 1);
  const vraag = toets.questions[index];
  if (!vraag) return null;
  const given = state.answers[vraag.id] ?? "";
  const unanswered = toets.questions.filter((q) => !(state.answers[q.id] ?? "").trim()).length;
  const last = index === total - 1;

  return (
    <main className="flex min-h-[70dvh] flex-col pb-4">
      <header className="flex items-end justify-between gap-3">
        <div>
          <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-subtle">
            {toets.subject}
            {toets.bron.kind === "extra" ? " · extra" : ""}
          </p>
          <p className="mt-0.5 font-serif text-lg font-medium tracking-tight text-foreground">
            {toets.title}
          </p>
        </div>
        <p className="tabular-nums text-sm font-medium text-muted-foreground">
          {index + 1} / {total}
        </p>
      </header>

      <div className="mt-3 h-1 overflow-hidden rounded-full bg-card">
        <div
          className="h-full rounded-full bg-primary transition-[width] duration-200 ease-out"
          style={{ width: `${((index + 1) / total) * 100}%` }}
        />
      </div>

      {remaining !== null ? (
        <p
          className={cn(
            "mt-2 text-right text-xs tabular-nums",
            remaining < 60 ? "text-destructive" : "text-subtle",
          )}
        >
          nog {formatTijd(remaining)}
        </p>
      ) : null}

      <article className="mt-5 flex-1">
        {vraag.skill === "lees" ? (
          <>
            <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-subtle">Tekst</p>
            <div className="mt-2 rounded-2xl bg-card px-4 py-3 shadow-[var(--shadow-border)]">
              <p className="text-[1.05rem] leading-relaxed text-foreground text-pretty">{vraag.situation}</p>
            </div>
          </>
        ) : (
          <p className="text-[1.05rem] leading-relaxed text-foreground text-pretty">{vraag.situation}</p>
        )}

        {vraag.type === "invul" ? (
          <>
            <p className="mt-4 text-xs text-subtle">
              {vraag.points} punt{vraag.points === 1 ? "" : "en"} · invul
            </p>
            <InvulBlock
              question={vraag}
              value={given}
              onChange={(v) => setAnswer(vraag.id, v)}
            />
          </>
        ) : (
          <>
            <p className="mt-4 font-medium leading-snug text-foreground text-pretty">
              {vraag.prompt}
            </p>
            <p className="mt-2 text-xs text-subtle">
              {vraag.points} punt{vraag.points === 1 ? "" : "en"}
              {vraag.skill === "lees"
                ? " · leesvraag"
                : vraag.type === "mc"
                  ? " · meerkeuze"
                  : " · open"}
            </p>
            {vraag.type === "mc" ? (
              <McOptions
                question={vraag}
                value={given as Letter | ""}
                onChange={(letter) => setAnswer(vraag.id, letter)}
              />
            ) : (
              <OpenLines
                question={vraag}
                value={given}
                onChange={(v) => setAnswer(vraag.id, v)}
              />
            )}
          </>
        )}
      </article>

      {state.confirmSubmit ? (
        <div className="mt-6 rounded-2xl bg-card p-4 shadow-[var(--shadow-border)]">
          <p className="text-sm leading-relaxed text-foreground">
            {unanswered > 0
              ? `Je hebt ${unanswered} vraag${unanswered === 1 ? "" : "en"} open. Toch inleveren?`
              : "Inleveren? Daarna kun je niets meer wijzigen."}
          </p>
          <div className="mt-3 grid grid-cols-2 gap-2">
            <Button type="button" variant="secondary" onClick={cancelSubmit}>
              Annuleren
            </Button>
            <Button type="button" onClick={submit}>
              Inleveren
            </Button>
          </div>
        </div>
      ) : (
        <div className="mt-6 grid gap-2">
          <div className="grid grid-cols-2 gap-2">
            <Button
              type="button"
              variant="secondary"
              disabled={index === 0}
              onClick={() => setIndex(index - 1)}
            >
              <ChevronLeft className="size-4" strokeWidth={1.75} />
              Terug
            </Button>
            {last ? (
              <Button type="button" onClick={askSubmit}>
                Inleveren
              </Button>
            ) : (
              <Button type="button" variant="secondary" onClick={() => setIndex(index + 1)}>
                Volgende
                <ChevronRight className="size-4" strokeWidth={1.75} />
              </Button>
            )}
          </div>
          {!last ? (
            <Button type="button" variant="ghost" className="text-subtle" onClick={askSubmit}>
              Inleveren
            </Button>
          ) : null}
        </div>
      )}
    </main>
  );
}

function McOptions({
  question,
  value,
  onChange,
}: {
  question: McQuestion;
  value: Letter | "";
  onChange: (letter: Letter) => void;
}) {
  return (
    <ul className="mt-5 grid gap-2">
      {question.options.map((opt) => {
        const selected = value === opt.letter;
        return (
          <li key={opt.letter}>
            <button
              type="button"
              onClick={() => onChange(opt.letter)}
              className={cn(
                "flex w-full min-h-14 items-start gap-3 rounded-2xl px-3.5 py-3 text-left",
                "shadow-[var(--shadow-border)] transition-[box-shadow,background-color] duration-150 ease-[var(--ease-out)]",
                "active:scale-[0.99]",
                selected ? "bg-primary/15 shadow-[var(--shadow-border-hover)]" : "bg-card",
              )}
            >
              <span
                className={cn(
                  "mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-[5px] border-2",
                  selected
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-muted-foreground/45 bg-transparent",
                )}
                aria-hidden="true"
              >
                {selected ? (
                  <svg viewBox="0 0 12 12" className="size-3.5">
                    <path
                      d="M2 6.2 4.6 9 10 3"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                ) : null}
              </span>
              <span className="flex min-w-0 flex-1 items-start gap-2.5">
                <span className="w-6 shrink-0 font-medium tabular-nums text-muted-foreground">
                  {opt.letter}
                </span>
                <span className="min-w-0 flex-1 text-base leading-snug text-foreground">{opt.text}</span>
              </span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}

function OpenLines({
  question,
  value,
  onChange,
}: {
  question: OpenQuestion;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="mt-5">
      <label htmlFor={`open-${question.id}`} className="sr-only">
        Antwoord
      </label>
      <textarea
        id={`open-${question.id}`}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={4}
        maxLength={400}
        placeholder="Schrijf je antwoord."
        className={cn(
          "w-full resize-none rounded-xl bg-card px-3.5 py-3 font-serif text-base leading-[1.85] text-foreground",
          "shadow-[var(--shadow-border)] placeholder:font-sans placeholder:text-subtle",
          "bg-[linear-gradient(transparent_calc(1.85em_-_1px),color-mix(in_oklab,var(--color-foreground)_12%,transparent)_1px)] bg-[size:100%_1.85em] bg-[position:0_0.55rem]",
          "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary",
        )}
      />
    </div>
  );
}

function InvulBlock({
  question,
  value,
  onChange,
}: {
  question: InvulQuestion;
  value: string;
  onChange: (v: string) => void;
}) {
  const parts = question.prompt.split("___");
  return (
    <div className="mt-4">
      <p className="font-medium leading-relaxed text-foreground text-pretty">
        {parts[0]}
        <span className="mx-1 inline-block min-w-[4.5rem] border-b-2 border-primary px-1 text-center font-serif text-primary">
          {value.trim() || "\u00a0"}
        </span>
        {parts.slice(1).join("")}
      </p>
      <label htmlFor={`invul-${question.id}`} className="sr-only">
        Invullen
      </label>
      <Input
        id={`invul-${question.id}`}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        maxLength={80}
        autoComplete="off"
        placeholder="Vul het ontbrekende woord of getal in."
        className="mt-4"
      />
    </div>
  );
}
