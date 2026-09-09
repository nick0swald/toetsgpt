import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { briefjeVan } from "@/lib/toets/briefje";
import {
  downloadDocx,
  downloadTekst,
  mailVolledigeToets,
  toetsBestandsnaam,
  volledigeToetsTekst,
} from "@/lib/toets/export-toets";
import { bouwOefentoets } from "@/lib/toets/demo";
import { nlCijfer } from "@/lib/toets/format";
import { generateToets } from "@/lib/toets/generate";
import { useSession } from "@/lib/toets/session";
import type { McQuestion, Question, StofScore } from "@/lib/toets/types";
import { cn } from "@/lib/utils";

export function ResultsScreen() {
  const { state, startToets, home, resetKeepStudent } = useSession();
  const [busy, setBusy] = useState(false);
  const [fout, setFout] = useState<string | null>(null);
  const [bewaarHint, setBewaarHint] = useState<string | null>(null);
  const [bewaarOpen, setBewaarOpen] = useState(false);
  const [mailNaar, setMailNaar] = useState("");
  const uitslag = state.uitslag;
  const toets = state.toets;
  if (!uitslag || !toets) return null;
  const huidige = toets;
  const diagnose = uitslag.diagnose;
  const heeftStof = diagnose.perStof.length > 0;
  const lastig = diagnose.lastig;
  const briefje = briefjeVan(huidige, uitslag);

  async function maken(mode: "regen" | "extra") {
    setFout(null);
    const bron = huidige.bron;
    const extraParas =
      mode === "extra"
        ? (lastig.length ? lastig : zwakste(diagnose.perStof)).map((s) => s.tag.paragraafId)
        : (bron.paragraafIds ?? []);
    const extraTags = mode === "extra" ? (lastig.length ? lastig : zwakste(diagnose.perStof)) : [];
    const extraLastig =
      extraTags.map((s) => s.tag.label).join(", ") || bron.lastig || "";
    const hoofdstukken = new Set(extraTags.map((s) => s.tag.hoofdstukId));
    const hoofdstukId =
      mode === "extra"
        ? hoofdstukken.size === 1
          ? [...hoofdstukken][0]
          : undefined
        : bron.hoofdstukId;

    if (bron.kind === "demo" || bron.hoofdstukId || extraParas.length > 0) {
      startToets(
        bouwOefentoets({
          count: bron.count,
          soort: mode === "extra" ? "mix" : bron.soort,
          tijd: bron.tijd,
          seed: Date.now() % 1_000_000,
          kind: mode === "extra" ? "extra" : bron.kind,
          topic: extraLastig || bron.topic,
          hoofdstukId,
          paragraafIds: extraParas,
          lastig: extraLastig,
          leerjaar: bron.leerjaar,
          niveau: bron.niveau,
          vakId: bron.vakId || state.vakId,
        }),
      );
      return;
    }

    setBusy(true);
    try {
      const res = await generateToets({
        data: {
          mode,
          naam: state.naam,
          klas: state.klas,
          lesstof: extraLastig || bron.raw || bron.topic,
          count: bron.count,
          soort: mode === "extra" ? "mix" : bron.soort,
          tijd: bron.tijd,
          previousTitle: huidige.title,
          leerjaar: bron.leerjaar,
          niveau: bron.niveau,
          hoofdstukId,
          paragraafIds: extraParas.length ? extraParas : undefined,
          lastig: extraLastig || undefined,
          vakId: bron.vakId || state.vakId,
        },
      });
      if (!res.ok) {
        setFout(res.error);
        return;
      }
      startToets(res.toets);
    } catch {
      setFout("Nieuwe toets maken lukte niet.");
    } finally {
      setBusy(false);
    }
  }

  const wie = [state.naam.trim(), state.klas].filter(Boolean).join(" · ");

  function toetsTekst() {
    return volledigeToetsTekst(huidige, uitslag, briefje, wie);
  }

  function opslaanTxt() {
    setFout(null);
    downloadTekst(toetsBestandsnaam(huidige, "txt"), toetsTekst());
    setBewaarHint("Tekstbestand bewaard. Hele toets, antwoorden en punten.");
  }

  function opslaanDocx() {
    setFout(null);
    downloadDocx(toetsBestandsnaam(huidige, "docx"), toetsTekst());
    setBewaarHint("Word-bestand bewaard. Hele toets, antwoorden en punten.");
  }

  async function mailen() {
    setFout(null);
    try {
      const hoe = await mailVolledigeToets({
        naar: mailNaar,
        onderwerp: `ToetsGPT · ${huidige.title || "Oefentoets"}`,
        tekst: toetsTekst(),
        txtNaam: toetsBestandsnaam(huidige, "txt"),
      });
      setBewaarHint(
        hoe === "gedeeld"
          ? "Deelvenster open. Kies Mail en stuur de toets mee."
          : hoe === "geknipt"
            ? "Mail geopend. Lange toets staat op het klembord en in het txt-bestand — plak of voeg toe."
            : "Mail geopend met de volledige toets.",
      );
    } catch {
      setFout("Mailen lukte niet. Sla de toets op als txt of Word.");
    }
  }

  return (
    <main className="flex flex-col">
      <p className="text-xs font-medium uppercase tracking-[0.14em] text-subtle">Uitslag</p>
      {wie ? <p className="mt-1 text-sm text-muted-foreground">{wie}</p> : null}

      <div className="mt-5 rounded-2xl bg-card px-5 py-5 shadow-[var(--shadow-border)]">
        <p className="text-sm text-muted-foreground">Behaalde punten</p>
        <p className="mt-1 font-serif text-4xl font-medium tracking-tight tabular-nums text-foreground">
          {formatPunten(uitslag.behaald)}
          <span className="text-xl text-muted-foreground"> / {formatPunten(uitslag.totaal)}</span>
        </p>
        <p className="mt-4 text-sm text-muted-foreground">Voorlopig cijfer</p>
        <p className="mt-1 font-serif text-4xl font-medium tracking-tight tabular-nums text-primary">
          {nlCijfer(uitslag.cijfer)}
        </p>
        <p className="mt-3 text-sm text-muted-foreground">Oefenscore. Geen echt cijfer.</p>
        <p className="mt-1 text-xs text-subtle">Lineair 1–10, cesuur 55%.</p>
      </div>

      <section className="mt-6 rounded-2xl bg-card p-4 shadow-[var(--shadow-border)]">
        <p className="text-xs font-medium uppercase tracking-[0.12em] text-subtle">
          Oefenbriefje
        </p>
        <p className="mt-3 text-sm leading-relaxed text-foreground">{briefje.feedback}</p>
        {heeftStof ? (
          <ul className="mt-4 grid gap-2">
            {diagnose.perStof.map((s) => {
              const pct = s.totaal > 0 ? s.behaald / s.totaal : 0;
              const zwak = pct < 0.55;
              return (
                <li key={s.tag.paragraafId} className="flex items-baseline justify-between gap-3">
                  <span className="min-w-0 text-sm leading-snug text-foreground">
                    {s.tag.label}
                  </span>
                  <span className="flex shrink-0 items-baseline gap-2">
                    {zwak ? <span className="text-xs text-destructive">lastig</span> : null}
                    <span
                      className={cn(
                        "text-sm tabular-nums",
                        zwak ? "text-destructive" : "text-ok",
                      )}
                    >
                      {formatPunten(s.behaald)}/{formatPunten(s.totaal)}
                    </span>
                  </span>
                </li>
              );
            })}
          </ul>
        ) : null}
        <p className="mt-3 text-xs leading-relaxed text-subtle">
          Bewaar de hele toets met antwoorden en punten. Het txt-bestand kun je later ook inladen bij Zelf oefenen.
        </p>
      </section>

      <ol className="mt-8 grid gap-4">
        {uitslag.perVraag.map((v, i) => (
          <li key={v.question.id} className="rounded-2xl bg-card p-4 shadow-[var(--shadow-border)]">
            <div className="flex items-baseline justify-between gap-3">
              <p className="text-xs font-medium uppercase tracking-[0.12em] text-subtle">
                Vraag {i + 1}
                {v.question.type === "invul"
                  ? " · invul"
                  : v.question.type === "mc"
                    ? " · mc"
                    : " · open"}
              </p>
              <p
                className={cn(
                  "text-sm font-medium tabular-nums",
                  v.points >= v.max ? "text-ok" : v.points > 0 ? "text-primary" : "text-destructive",
                )}
              >
                {formatPunten(v.points)} / {formatPunten(v.max)}
              </p>
            </div>
            {v.question.stof ? (
              <p className="mt-1 text-xs text-subtle">{v.question.stof.label}</p>
            ) : null}
            <p className="mt-2 text-sm leading-snug text-foreground">{v.question.prompt}</p>
            <dl className="mt-3 grid gap-2 text-sm">
              <Row label="Jouw antwoord" value={weergaveGegeven(v.question, v.given)} />
              <Row label="Juist" value={weergaveJuist(v.question)} />
              <Row label="Waarom" value={v.question.why} />
            </dl>
          </li>
        ))}
      </ol>

      <p className="mt-8 text-center text-sm leading-relaxed text-muted-foreground">
        Zit je vast bij een vraag?{" "}
        <a
          href="https://oswaldgpt.nl"
          className="font-medium text-primary underline decoration-primary/40 underline-offset-2"
        >
          Vraag het Oswald
        </a>
        .
      </p>

      {fout ? <p className="mt-4 text-center text-sm text-destructive">{fout}</p> : null}
      {bewaarHint ? <p className="mt-4 text-center text-sm text-muted-foreground">{bewaarHint}</p> : null}

      <div className="mt-6 grid gap-3">
        {heeftStof && lastig.length > 0 ? (
          <Button type="button" size="lg" onClick={() => void maken("extra")} disabled={busy}>
            {busy ? "Extra oefening maken…" : "Oefen extra op lastige stof"}
          </Button>
        ) : null}
        <Button
          type="button"
          variant={heeftStof && lastig.length > 0 ? "secondary" : "primary"}
          size="lg"
          onClick={() => void maken("regen")}
          disabled={busy}
        >
          {busy ? "Nieuwe toets maken…" : "Opnieuw, zelfde stof"}
        </Button>
        {bewaarOpen ? (
          <div className="grid gap-3 rounded-2xl bg-card p-4 shadow-[var(--shadow-border)]">
            <p className="text-sm leading-relaxed text-muted-foreground">
              Hele toets, antwoorden en punten. Mail naar jezelf of iemand anders, of sla op.
            </p>
            <div className="grid gap-1.5">
              <Label htmlFor="mail-naar">Mail naar</Label>
              <Input
                id="mail-naar"
                type="email"
                inputMode="email"
                autoComplete="email"
                placeholder="naam@school.nl"
                value={mailNaar}
                onChange={(e) => setMailNaar(e.target.value)}
              />
            </div>
            <Button type="button" size="lg" onClick={() => void mailen()}>
              Mail de toets
            </Button>
            <Button type="button" variant="secondary" size="lg" onClick={opslaanTxt}>
              Opslaan als txt
            </Button>
            <Button type="button" variant="secondary" size="lg" onClick={opslaanDocx}>
              Opslaan als Word
            </Button>
          </div>
        ) : (
          <Button type="button" variant="secondary" size="lg" onClick={() => setBewaarOpen(true)}>
            Bewaar oefenbriefje
          </Button>
        )}
        <Button type="button" variant="secondary" size="lg" onClick={resetKeepStudent}>
          Andere stof
        </Button>
        <Button type="button" variant="ghost" onClick={home}>
          Naar start
        </Button>
      </div>
    </main>
  );
}

function zwakste(perStof: StofScore[]): StofScore[] {
  return [...perStof]
    .sort((a, b) => a.behaald / a.totaal - b.behaald / b.totaal)
    .slice(0, 2);
}

function formatPunten(n: number): string {
  return Number.isInteger(n) ? String(n) : String(n).replace(".", ",");
}

function weergaveGegeven(q: Question, given: string): string {
  if (!given.trim()) return "Geen antwoord.";
  if (q.type === "mc") {
    const opt = q.options.find((o) => o.letter === given.toUpperCase());
    return opt ? `${opt.letter} ${opt.text}` : given;
  }
  return given;
}

function weergaveJuist(q: Question): string {
  if (q.type === "mc") return mcSleutel(q);
  return q.modelAnswer;
}

function mcSleutel(q: McQuestion): string {
  const opt = q.options.find((o) => o.letter === q.correctLetter);
  return opt ? `${opt.letter} ${opt.text}` : q.modelAnswer;
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs text-subtle">{label}</dt>
      <dd className="mt-0.5 leading-snug text-foreground text-pretty">{value}</dd>
    </div>
  );
}
