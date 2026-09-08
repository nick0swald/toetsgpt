import { useEffect, useMemo, useState, type ReactNode } from "react";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { bouwOefentoets } from "@/lib/toets/demo";
import { generateToets } from "@/lib/toets/generate";
import { useSession } from "@/lib/toets/session";
import { CURRICULUM, eersteHoofdstukId, hoofdstukById, hoofdstukkenVoor, parseKlas } from "@/lib/toets/stof";
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
  const fromKlas = parseKlas(state.klas);
  const [leerjaar, setLeerjaar] = useState<Leerjaar | "">(fromKlas.leerjaar);
  const [niveau, setNiveau] = useState<Niveau | "">(fromKlas.niveau);
  const [hoofdstukId, setHoofdstukId] = useState(() =>
    eersteHoofdstukId(fromKlas.leerjaar, fromKlas.niveau),
  );
  const [paragraafIds, setParagraafIds] = useState<string[]>([]);
  const [lastig, setLastig] = useState("");
  const [lesstof, setLesstof] = useState("");
  const [count, setCount] = useState(8);
  const [soort, setSoort] = useState<VraagSoort>("auto");
  const [tijd, setTijd] = useState<TijdKeuze>("kort");
  const [busy, setBusy] = useState(false);
  const [fout, setFout] = useState<string | null>(null);

  const hoofdstukken = useMemo(
    () => hoofdstukkenVoor(leerjaar, niveau),
    [leerjaar, niveau],
  );
  const hoofdstuk = hoofdstukById(hoofdstukId);

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

  function startLokaal(kind: "demo" | "zelf") {
    setFout(null);
    startToets(
      bouwOefentoets({
        count,
        soort,
        tijd,
        seed: Date.now() % 1_000_000,
        kind,
        topic: hoofdstuk?.titel ?? CURRICULUM.vak,
        hoofdstukId: hoofdstukId || eersteHoofdstukId(leerjaar, niveau),
        paragraafIds,
        lastig,
        leerjaar: leerjaar || undefined,
        niveau: niveau || undefined,
      }),
    );
  }

  async function maken() {
    setFout(null);
    const extra = lesstof.trim();
    if (!hoofdstukId && !extra && !lastig.trim()) {
      startLokaal("demo");
      return;
    }
    if (hoofdstukId && !extra) {
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
          lesstof: extra || hoofdstuk?.titel || lastig || CURRICULUM.vak,
          count,
          soort,
          tijd,
          leerjaar: leerjaar || undefined,
          niveau: niveau || undefined,
          hoofdstukId: hoofdstukId || undefined,
          paragraafIds: paragraafIds.length ? paragraafIds : undefined,
          lastig: lastig.trim() || undefined,
        },
      });
      if (!res.ok) {
        setFout(res.error);
        return;
      }
      startToets(res.toets);
    } catch {
      setFout("Maken lukte niet. Start de demo of probeer later.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-lg flex-col px-5 pb-10 pt-[max(1rem,env(safe-area-inset-top))]">
      <TopBar onBack={() => go("start")} label="Zelf oefenen" />

      <p className="mt-6 text-sm leading-relaxed text-muted-foreground">
        {CURRICULUM.voorbeeld
          ? `Nu staat er één voorbeeldhoofdstuk ${CURRICULUM.vak} in. Later laadt Nick hier alle biologie in; dit voorbeeld gaat er dan uit.`
          : `Kies leerjaar, niveau en het hoofdstuk ${CURRICULUM.vak} waarmee je bezig bent.`}
      </p>
      {CURRICULUM.voorbeeld ? (
        <p className="mt-2 text-xs text-subtle">{CURRICULUM.bronLabel}</p>
      ) : null}

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
                  "min-h-14 rounded-xl px-3.5 py-3 text-left transition-[background-color,box-shadow] duration-150",
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
                  {CURRICULUM.voorbeeld
                    ? `Voorbeeld · ${h.paragrafen.length} paragrafen`
                    : `${h.paragrafen.length} paragrafen`}
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

      <div className="mt-5 grid gap-1.5">
        <Label htmlFor="lastig">Wat vind je lastig?</Label>
        <Input
          id="lastig"
          value={lastig}
          onChange={(e) => setLastig(e.target.value)}
          maxLength={400}
          placeholder="Bijvoorbeeld: omrekenen m/s, of volume"
        />
        <p className="text-xs text-subtle">Optioneel. Daar komen extra vragen op.</p>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3">
        <FieldSelect
          id="aantal"
          label="Aantal vragen"
          value={String(count)}
          onChange={(v) => setCount(Number(v))}
          options={VRAAG_AANTALLEN.map((n) => ({ value: String(n), label: String(n) }))}
        />
        <FieldSelect
          id="soort"
          label="Soort"
          value={soort}
          onChange={(v) => setSoort(v as VraagSoort)}
          options={[
            { value: "auto", label: "Mix" },
            { value: "mc", label: "Meerkeuze" },
            { value: "open", label: "Open" },
            { value: "invul", label: "Invul" },
          ]}
        />
      </div>

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

      {fout ? <p className="mt-4 text-sm text-destructive">{fout}</p> : null}

      <div className="mt-6 grid gap-3">
        <Button type="button" size="lg" onClick={() => void maken()} disabled={busy}>
          {busy ? "Oefentoets maken…" : "Maak oefentoets"}
        </Button>
        <Button
          type="button"
          variant="secondary"
          size="lg"
          onClick={() => startLokaal("demo")}
          disabled={busy}
        >
          {hoofdstuk ? `Start oefening: ${hoofdstuk.titel}` : "Start demo: dichtheid"}
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
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "min-h-11 rounded-lg px-3.5 text-sm font-medium transition-[background-color,box-shadow] duration-150",
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
      <p className="font-serif text-lg font-medium tracking-tight">{label}</p>
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
          "h-12 w-full appearance-none rounded-lg bg-card px-3.5 text-base text-foreground",
          "shadow-[var(--shadow-border)]",
          "bg-[url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%2212%22 height=%228%22 fill=%22none%22 stroke=%22%239c998e%22 stroke-width=%221.6%22><path d=%22m1 1 5 5 5-5%22/></svg>')] bg-[length:12px_8px] bg-[right_14px_center] bg-no-repeat pr-10",
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
