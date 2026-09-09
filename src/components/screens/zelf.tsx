import { useEffect, useMemo, useState, type ReactNode } from "react";
import { ArrowLeft } from "lucide-react";
import { parseBriefje, type OefenBriefje } from "@/lib/toets/briefje";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { bouwOefentoets } from "@/lib/toets/demo";
import { generateToets } from "@/lib/toets/generate";
import { useSession } from "@/lib/toets/session";
import { boekLabel, eersteHoofdstukId, hoofdstukById, hoofdstukHeeftBoek, hoofdstukkenVoor, parseKlas, vakOf } from "@/lib/toets/stof";
import {
  LEERJAREN,
  NIVEAUS,
  VRAAG_AANTALLEN,
  type Leerjaar,
  type Niveau,
  type TijdKeuze,
  type VraagSoort,
} from "@/lib/toets/types";
import { cn } from "@/lib/utils";

export function ZelfScreen() {
  const { state, go, startToets } = useSession();
  const vak = vakOf(state.vakId);
  const isLees = vak.id === "lees";
  const fromKlas = parseKlas(state.klas);
  const [leerjaar, setLeerjaar] = useState<Leerjaar | "">(fromKlas.leerjaar);
  const [niveau, setNiveau] = useState<Niveau | "">(fromKlas.niveau);
  const [hoofdstukId, setHoofdstukId] = useState(() =>
    eersteHoofdstukId(fromKlas.leerjaar, fromKlas.niveau, state.vakId, state.klas),
  );
  const [paragraafIds, setParagraafIds] = useState<string[]>([]);
  const [lastig, setLastig] = useState("");
  const [lesstof, setLesstof] = useState("");
  const [count, setCount] = useState(8);
  const [soort, setSoort] = useState<VraagSoort>(isLees ? "lees" : "auto");
  const [tijd, setTijd] = useState<TijdKeuze>("kort");
  const [busy, setBusy] = useState(false);
  const [fout, setFout] = useState<string | null>(null);
  const [briefje, setBriefje] = useState<OefenBriefje | null>(null);

  const hoofdstukken = useMemo(
    () => hoofdstukkenVoor(leerjaar, niveau, state.vakId, state.klas),
    [leerjaar, niveau, state.vakId, state.klas],
  );
  const hoofdstuk = hoofdstukById(hoofdstukId, state.vakId);

  useEffect(() => {
    if (!hoofdstukken.some((h) => h.id === hoofdstukId)) {
      setHoofdstukId(hoofdstukken[0]?.id ?? "");
      setParagraafIds([]);
    }
  }, [hoofdstukken, hoofdstukId]);

  function kiesHoofdstuk(id: string) {
    setHoofdstukId(id);
    setParagraafIds([]);
  }

  function togglePara(id: string) {
    setParagraafIds((cur) =>
      cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id],
    );
  }

  function startLokaal(kind: "demo" | "zelf" | "extra") {
    setFout(null);
    const paras =
      kind === "extra" && briefje?.paragraafIds?.length ? briefje.paragraafIds : paragraafIds;
    startToets(
      bouwOefentoets({
        count,
        soort: isLees ? "lees" : kind === "extra" ? "mix" : soort,
        tijd,
        seed: Date.now() % 1_000_000,
        kind,
        topic: briefje?.lastig || hoofdstuk?.titel || vak.titel,
        hoofdstukId: isLees
          ? undefined
          : briefje?.hoofdstukId || hoofdstukId || eersteHoofdstukId(leerjaar, niveau, state.vakId, state.klas),
        paragraafIds: paras,
        lastig: briefje?.lastig || lastig,
        leerjaar: leerjaar || undefined,
        niveau: niveau || undefined,
        vakId: state.vakId,
      }),
    );
  }

  function applyBriefje(b: OefenBriefje) {
    if (b.leerjaar === "2" || b.leerjaar === "3" || b.leerjaar === "4") setLeerjaar(b.leerjaar);
    if (b.niveau === "BB" || b.niveau === "KB" || b.niveau === "GT") setNiveau(b.niveau);
    if (b.hoofdstukId) setHoofdstukId(b.hoofdstukId);
    if (b.paragraafIds?.length) setParagraafIds(b.paragraafIds);
    if (b.lastig) setLastig(b.lastig);
    setBriefje(b);
    setFout(null);
  }

  async function onBriefjeBestand(file: File | undefined) {
    if (!file) return;
    const text = await file.text();
    const parsed = parseBriefje(text);
    if (!parsed) {
      setFout("Dit bestand is geen ToetsGPT-briefje.");
      return;
    }
    applyBriefje(parsed);
  }

  async function maken() {
    setFout(null);
    const extra = lesstof.trim();
    const geplakt = parseBriefje(extra);
    if (geplakt) {
      applyBriefje(geplakt);
      startToets(
        bouwOefentoets({
          count,
          soort: "mix",
          tijd,
          seed: Date.now() % 1_000_000,
          kind: "extra",
          topic: geplakt.lastig || geplakt.topic || vak.titel,
          hoofdstukId: geplakt.hoofdstukId || hoofdstukId,
          paragraafIds: geplakt.paragraafIds ?? [],
          lastig: geplakt.lastig,
          leerjaar: geplakt.leerjaar || leerjaar || undefined,
          niveau: geplakt.niveau || niveau || undefined,
          vakId: state.vakId,
        }),
      );
      return;
    }
    if (!hoofdstukId && !extra && !lastig.trim()) {
      startLokaal("demo");
      return;
    }
    if (hoofdstukId && !extra && hoofdstuk?.bank && !hoofdstukHeeftBoek(hoofdstukId)) {
      startLokaal("zelf");
      return;
    }
    setBusy(true);
    try {
      const res = await generateToets({
        data: {
          mode: "zelf",
          naam: state.naam,
          klas: state.klas,
          lesstof: extra || hoofdstuk?.titel || lastig || vak.titel,
          count,
          soort,
          tijd,
          leerjaar: leerjaar || undefined,
          niveau: niveau || undefined,
          hoofdstukId: hoofdstukId || undefined,
          paragraafIds: paragraafIds.length ? paragraafIds : undefined,
          lastig: lastig.trim() || undefined,
          vakId: state.vakId,
        },
      });
      if (!res.ok) {
        if (hoofdstuk?.bank) {
          startLokaal("zelf");
          return;
        }
        setFout(res.error);
        return;
      }
      startToets(res.toets);
    } catch {
      if (hoofdstuk?.bank) {
        startLokaal("zelf");
        return;
      }
      setFout("Maken lukte niet. Start de demo of probeer later.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="flex flex-col">
      <TopBar onBack={() => go("start")} label={isLees ? "Leesvaardigheid" : "Zelf oefenen"} />

      <p className="mt-6 text-sm leading-relaxed text-muted-foreground">
        {isLees
          ? "Korte vaktekst, daarna één vraag. Woord, verwijzing of hoofdzaak. Geen rekenen."
          : `Kies leerjaar, niveau en het Nova-hoofdstuk ${vak.titel} waarmee je bezig bent.`}
      </p>
      {isLees ? (
        <p className="mt-2 text-xs text-subtle">{vak.bronLabel}</p>
      ) : (
        <p className="mt-2 text-xs text-subtle">{boekLabel(state.klas, leerjaar)}</p>
      )}

      <section className="mt-6 rounded-2xl bg-card p-4 shadow-[var(--shadow-border)]">
        <p className="text-xs font-medium uppercase tracking-[0.14em] text-subtle">
          Oefenbriefje
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          Van een eerdere oefening. Bestand of plakken.
        </p>
        {briefje?.feedback ? (
          <p className="mt-3 text-sm leading-relaxed text-foreground">{briefje.feedback}</p>
        ) : null}
        <label className="mt-3 flex min-h-12 cursor-pointer items-center justify-center rounded-xl bg-card px-4 text-sm font-medium text-foreground shadow-[var(--shadow-border)]">
          {briefje ? "Ander briefje kiezen" : "Briefje laden"}
          <input
            type="file"
            accept=".txt,.json,text/plain,application/json"
            className="sr-only"
            onChange={(e) => {
              const file = e.target.files?.[0];
              void onBriefjeBestand(file);
              e.target.value = "";
            }}
          />
        </label>
      </section>

      {!isLees ? (
      <>
      <section className="mt-6">
        <p className="text-xs font-medium uppercase tracking-[0.14em] text-subtle">
          Leerjaar
        </p>
        <div className="mt-2 flex flex-wrap gap-2">
          {LEERJAREN.map((j) => (
            <Chip
              key={j}
              selected={leerjaar === j}
              onClick={() => setLeerjaar(j)}
            >
              {j}
            </Chip>
          ))}
        </div>
      </section>

      <section className="mt-5">
        <p className="text-xs font-medium uppercase tracking-[0.14em] text-subtle">
          Niveau
        </p>
        <div className="mt-2 flex flex-wrap gap-2">
          {NIVEAUS.map((n) => (
            <Chip
              key={n}
              selected={niveau === n}
              onClick={() => setNiveau(n)}
            >
              {n}
            </Chip>
          ))}
        </div>
      </section>

      <section className="mt-5">
        <p className="text-xs font-medium uppercase tracking-[0.14em] text-subtle">
          Hoofdstuk
        </p>
        <div className={cn("mt-2 grid gap-2", hoofdstukken.length === 1 ? "grid-cols-1" : "grid-cols-2")}>
          {hoofdstukken.map((h) => {
            const on = hoofdstukId === h.id;
            return (
              <button
                key={h.id}
                type="button"
                onClick={() => kiesHoofdstuk(h.id)}
                className={cn(
                  "min-h-14 rounded-2xl px-3.5 py-3 text-left transition-[background-color] duration-150",
                  "active:scale-[0.99]",
                  on
                    ? "bg-primary text-primary-foreground"
                    : "bg-card text-foreground shadow-[var(--shadow-border)]",
                )}
              >
                <span className="block text-sm font-medium">{h.titel}</span>
                <span
                  className={cn(
                    "mt-0.5 block text-xs",
                    on ? "text-primary-foreground/70" : "text-subtle",
                  )}
                >
                  {h.boek ? "Nova-boek" : `${h.paragrafen.length} paragrafen`}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {hoofdstuk ? (
        <section className="mt-5">
          <p className="text-xs font-medium uppercase tracking-[0.14em] text-subtle">
            Paragrafen
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Optioneel. Leeg = het hele hoofdstuk.
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            {hoofdstuk.paragrafen.map((p) => (
              <Chip
                key={p.id}
                selected={paragraafIds.includes(p.id)}
                onClick={() => togglePara(p.id)}
              >
                {p.titel}
              </Chip>
            ))}
          </div>
        </section>
      ) : null}
      </> ) : null}

      <div className="mt-5 grid gap-1.5">
        <Label htmlFor="lastig">Wat vind je lastig?</Label>
        <Input
          id="lastig"
          value={lastig}
          onChange={(e) => setLastig(e.target.value)}
          maxLength={400}
          placeholder={isLees ? "Bijvoorbeeld: vakwoorden, of daardoor" : "Bijvoorbeeld: vakwoorden, of volume"}
        />
        <p className="text-xs text-subtle">Optioneel. Daar komen extra vragen op.</p>
      </div>

      <div className={cn("mt-5 grid gap-3", isLees ? "grid-cols-1" : "grid-cols-2")}>
        <FieldSelect
          id="aantal"
          label="Aantal vragen"
          value={String(count)}
          onChange={(v) => setCount(Number(v))}
          options={VRAAG_AANTALLEN.map((n) => ({ value: String(n), label: String(n) }))}
        />
        {isLees ? null : (
        <FieldSelect
          id="soort"
          label="Soort"
          value={soort}
          onChange={(v) => setSoort(v as VraagSoort)}
          options={[
            { value: "auto", label: "Mix" },
            { value: "lees", label: "Lezen" },
            { value: "mc", label: "Meerkeuze" },
            { value: "open", label: "Open" },
            { value: "invul", label: "Invul" },
          ]}
        />
        )}
      </div>
      {isLees ? null : (
      <p className="mt-1.5 text-xs text-subtle">
        Mix bevat ook leesvragen bij een vaktekst. Lezen is alleen dat.
      </p>
      )}

      <div className="mt-3">
        <FieldSelect
          id="tijd"
          label="Duur"
          value={tijd}
          onChange={(v) => setTijd(v as TijdKeuze)}
          options={[
            { value: "kort", label: "Korte oefening" },
            { value: "10", label: "10 minuten" },
            { value: "15", label: "15 minuten" },
            { value: "20", label: "20 minuten" },
          ]}
        />
      </div>

      {isLees ? null : (
      <details className="mt-5">
        <summary className="cursor-pointer text-sm text-muted-foreground">
          Extra aantekeningen plakken
        </summary>
        <div className="mt-3 grid gap-1.5">
          <Label htmlFor="lesstof">Lesstof</Label>
          <Textarea
            id="lesstof"
            value={lesstof}
            onChange={(e) => setLesstof(e.target.value)}
            maxLength={8000}
            placeholder="Plak extra stof als dat nog niet in een hoofdstuk staat."
          />
        </div>
      </details>
      )}

      {fout ? <p className="mt-4 text-sm text-destructive">{fout}</p> : null}

      <div className="mt-6 grid gap-3">
        {briefje ? (
          <Button type="button" size="lg" onClick={() => startLokaal("extra")} disabled={busy}>
            Oefen verder met dit briefje
          </Button>
        ) : null}
        <Button
          type="button"
          variant={briefje ? "secondary" : "primary"}
          size="lg"
          onClick={() => (isLees ? startLokaal("zelf") : void maken())}
          disabled={busy}
        >
          {busy ? "Oefentoets maken…" : isLees ? "Start leesoefening" : "Maak oefentoets"}
        </Button>
        {isLees ? null : (
        <Button
          type="button"
          variant="secondary"
          size="lg"
          onClick={() =>
            hoofdstukHeeftBoek(hoofdstukId) ? void maken() : startLokaal(hoofdstuk?.bank ? "zelf" : "demo")
          }
          disabled={busy || (!hoofdstuk?.bank && !hoofdstukHeeftBoek(hoofdstukId))}
        >
          {hoofdstukHeeftBoek(hoofdstukId)
            ? `Oefenen uit Nova: ${hoofdstuk?.titel}`
            : hoofdstuk?.bank
              ? `Start oefening: ${hoofdstuk.titel}`
              : "Kies een hoofdstuk met vragen"}
        </Button>
        )}
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
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "min-h-11 rounded-full px-3.5 text-sm font-bold transition-[background-color] duration-150",
        "active:scale-[0.99]",
        selected
          ? "bg-primary text-primary-foreground"
          : "bg-card text-foreground shadow-[var(--shadow-border)]",
      )}
    >
      {children}
    </button>
  );
}

export function TopBar({ onBack, label }: { onBack: () => void; label: string }) {
  return (
    <div className="flex items-center gap-2">
      <Button type="button" variant="ghost" size="icon" onClick={onBack} aria-label="Terug">
        <ArrowLeft className="size-5" strokeWidth={1.75} />
      </Button>
      <p className="text-lg font-extrabold tracking-tight">{label}</p>
    </div>
  );
}

export function FieldSelect({
  id,
  label,
  value,
  onChange,
  options,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <div className="grid gap-1.5">
      <Label htmlFor={id}>{label}</Label>
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={cn(
          "h-12 w-full appearance-none rounded-2xl bg-card px-4 text-base text-foreground",
          "shadow-[var(--shadow-border)]",
          "bg-[url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%2212%22 height=%228%22 fill=%22none%22 stroke=%22%2352525b%22 stroke-width=%221.6%22><path d=%22m1 1 5 5 5-5%22/></svg>')] bg-[length:12px_8px] bg-[right_14px_center] bg-no-repeat pr-10",
          "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary",
        )}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}
