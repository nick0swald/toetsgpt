import { useEffect, useMemo, useState } from "react";
import { Check, ChevronDown, ChevronRight, Lightbulb, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { formuleTonen } from "@/lib/toets/examtrain/formula";
import {
  nakijkenMc,
  nakijkenOpenLokaal,
  nakijkenReken,
  type BankItem,
  type RekenItem,
  type Uitslag,
} from "@/lib/toets/examtrain/grade";
import { TYPEN, type Leerweg } from "@/lib/toets/examtrain/nav";
import { maakSet, telPerDeel, telPerType } from "@/lib/toets/examtrain/pick";
import { TOETSDELEN_VOORLOPIG } from "@/lib/toets/examtrain/toetsdelen";
import { nakijkOpenAi } from "@/lib/toets/examtrain/open-ai";
import { fmtUnit } from "@/lib/toets/examtrain/units";
import { useSession } from "@/lib/toets/session";
import { cn } from "@/lib/utils";
import { TopBar } from "./zelf";

const LW_KEY = "toetsgpt-examtrain-leerweg";
const LEERWEGEN: Leerweg[] = ["BB", "KB", "GT"];
const TYPE_NAAM = new Map(TYPEN.map((t) => [t.id, t.naam]));

type Resultaat = { item: BankItem; uitslag: Uitslag; hints: number };
type Fase =
  | { k: "menu" }
  | { k: "oefen"; titel: string; set: BankItem[]; i: number; res: Resultaat[] }
  | { k: "klaar"; titel: string; res: Resultaat[]; typen?: string[] };

function leesLw(): Leerweg | null {
  try {
    const v = window.localStorage.getItem(LW_KEY);
    return v === "BB" || v === "KB" || v === "GT" ? v : null;
  } catch {
    return null;
  }
}

export function ExamtrainScreen() {
  const { go } = useSession();
  const [bank, setBank] = useState<BankItem[] | null>(null);
  const [lw, setLwState] = useState<Leerweg | null>(null);
  const [fase, setFase] = useState<Fase>({ k: "menu" });
  const [open, setOpen] = useState<string | null>(null);
  const [laatsteTypen, setLaatsteTypen] = useState<string[] | undefined>(undefined);

  useEffect(() => {
    setLwState(leesLw());
    let actief = true;
    void import("@/lib/toets/examtrain/bank.json").then((m) => {
      if (actief) setBank(m.default as unknown as BankItem[]);
    });
    return () => {
      actief = false;
    };
  }, []);

  function setLw(v: Leerweg) {
    setLwState(v);
    try {
      window.localStorage.setItem(LW_KEY, v);
    } catch {
      // geen opslag: niet erg
    }
  }

  function start(titel: string, typen?: string[], n = 10) {
    if (!bank || !lw) return;
    const set = maakSet(bank, lw, { typen, n, seed: Date.now() % 1_000_000 });
    if (!set.length) return;
    setLaatsteTypen(typen);
    setFase({ k: "oefen", titel, set, i: 0, res: [] });
    window.scrollTo({ top: 0 });
  }

  const perType = useMemo(() => (bank && lw ? telPerType(bank, lw) : []), [bank, lw]);
  const perDeel = useMemo(() => (bank && lw ? telPerDeel(bank, lw) : []), [bank, lw]);

  if (fase.k === "oefen") {
    return (
      <OefenScherm
        key={`${fase.set[fase.i]?.id}-${fase.i}`}
        titel={fase.titel}
        item={fase.set[fase.i]!}
        nr={fase.i + 1}
        totaal={fase.set.length}
        onStop={() => setFase({ k: "klaar", titel: fase.titel, res: fase.res, typen: laatsteTypen })}
        onKlaar={(r) => {
          const res = [...fase.res, r];
          if (fase.i + 1 >= fase.set.length) setFase({ k: "klaar", titel: fase.titel, res, typen: laatsteTypen });
          else setFase({ ...fase, i: fase.i + 1, res });
          window.scrollTo({ top: 0 });
        }}
      />
    );
  }

  if (fase.k === "klaar") {
    return (
      <Samenvatting
        titel={fase.titel}
        res={fase.res}
        onOpnieuw={() => start(fase.titel, fase.typen)}
        onMenu={() => setFase({ k: "menu" })}
      />
    );
  }

  const isGt = lw === "GT";
  return (
    <main className="flex flex-col">
      <TopBar onBack={() => go("start")} label="Oefenen voor je examen" />
      <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
        Klas 4 · echte examenvragen (bewerkt) en oefenvragen in examenstijl. Je krijgt per vraag direct
        je punten, per stap, zoals bij Nick.
      </p>

      <section className="mt-5">
        <p className="text-xs font-medium uppercase tracking-[0.14em] text-subtle">Jouw leerweg</p>
        <div className="mt-2 flex gap-2">
          {LEERWEGEN.map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => setLw(n)}
              className={cn(
                "min-h-11 flex-1 rounded-full px-3.5 text-sm font-bold",
                lw === n ? "bg-primary text-primary-foreground" : "bg-card text-foreground shadow-[var(--shadow-border)]",
              )}
            >
              {n}
            </button>
          ))}
        </div>
      </section>

      {!lw ? (
        <p className="mt-6 text-sm text-muted-foreground">Kies eerst je leerweg.</p>
      ) : !bank ? (
        <p className="mt-6 text-sm text-muted-foreground">Vragen laden…</p>
      ) : (
        <>
          <Button type="button" className="mt-5 min-h-12 text-base font-bold" onClick={() => start("Gemengde set")}>
            Gemengde set · 10 vragen
          </Button>

          <section className="mt-7">
            <p className="text-xs font-medium uppercase tracking-[0.14em] text-subtle">
              {isGt ? "Per toetsdeel (4GT · Nova)" : "Per onderwerp"}
              {TOETSDELEN_VOORLOPIG ? " · voorlopige indeling" : ""}
            </p>
            {TOETSDELEN_VOORLOPIG && isGt ? (
              <p className="mt-1 text-xs text-muted-foreground">
                Welke hoofdstukken bij welk toetsdeel horen, wordt nog gecontroleerd. Oefen per vraagtype hieronder als je zeker wilt zijn.
              </p>
            ) : null}
            <div className="mt-2 flex flex-col gap-2">
              {perDeel
                .filter((d) => d.n > 0)
                .map((d) => {
                  const typen = perType.filter((t) => d.typen.includes(t.id));
                  const uit = open === d.id;
                  return (
                    <div key={d.id} className="rounded-2xl bg-card shadow-[var(--shadow-border)]">
                      <div className="flex items-stretch">
                        <button
                          type="button"
                          className="flex-1 px-4 py-3 text-left"
                          onClick={() => start(d.nr && isGt ? `Toetsdeel ${d.nr} · ${d.titel}` : d.titel, d.typen)}
                        >
                          <span className="block text-sm font-extrabold">
                            {d.nr && isGt ? `Deel ${d.nr} · ` : ""}
                            {d.titel}
                          </span>
                          <span className="block text-xs text-muted-foreground">
                            {isGt ? `${d.hoofdstukken} · ` : ""}
                            {d.n} vragen
                          </span>
                        </button>
                        <button
                          type="button"
                          aria-label={uit ? "Vraagtypen verbergen" : "Vraagtypen tonen"}
                          className="px-3 text-muted-foreground"
                          onClick={() => setOpen(uit ? null : d.id)}
                        >
                          {uit ? <ChevronDown className="size-5" /> : <ChevronRight className="size-5" />}
                        </button>
                      </div>
                      {uit ? (
                        <ul className="border-t border-border px-2 py-1">
                          {typen.map((t) => (
                            <li key={t.id}>
                              <button
                                type="button"
                                className="flex w-full items-center justify-between gap-2 rounded-lg px-2 py-2 text-left text-sm"
                                onClick={() => start(t.naam, [t.id], Math.min(8, t.n))}
                              >
                                <span>{t.naam}</span>
                                <span className="shrink-0 text-xs text-muted-foreground">{t.n}</span>
                              </button>
                            </li>
                          ))}
                        </ul>
                      ) : null}
                    </div>
                  );
                })}
            </div>
          </section>

          <section className="mt-7">
            <p className="text-xs font-medium uppercase tracking-[0.14em] text-subtle">
              Per vraagtype · meest gevraagd op het {lw}-examen eerst
            </p>
            <ul className="mt-2 flex flex-col divide-y divide-border rounded-2xl bg-card shadow-[var(--shadow-border)]">
              {perType.map((t) => (
                <li key={t.id}>
                  <button
                    type="button"
                    className="flex w-full items-center justify-between gap-3 px-4 py-2.5 text-left text-sm"
                    onClick={() => start(t.naam, [t.id], Math.min(8, t.n))}
                  >
                    <span>{t.naam}</span>
                    <span className="shrink-0 text-xs text-muted-foreground">
                      {t.freq[lw]}× op examen · {t.n} vr.
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </section>

          <button type="button" className="mt-6 text-left text-sm font-bold text-primary" onClick={() => go("examen")}>
            CE-stijl proeftoets met timer →
          </button>
          <p className="mt-4 text-xs leading-relaxed text-subtle">
            Examenvragen zijn ingekort en herschreven zodat ze zonder figuur te maken zijn. Bij elke vraag
            staat de bron (&ldquo;naar: examen jaar tijdvak&rdquo;). Rekenen met g = 10 N/kg.
          </p>
        </>
      )}
    </main>
  );
}

function Kaart({ item }: { item: BankItem }) {
  return (
    <div className="rounded-2xl bg-card p-4 shadow-[var(--shadow-border)]">
      <p className="text-xs text-subtle">
        {TYPE_NAAM.get(item.type) ?? item.type} · {item.bron}
        {item.leerweg ? ` · ${item.leerweg}` : ""}
      </p>
      <p className="mt-1 text-base font-extrabold">{item.titel}</p>
      {item.intro ? <p className="mt-2 text-sm leading-relaxed">{item.intro}</p> : null}
      {item.lead ? <p className="mt-2 text-sm leading-relaxed">{item.lead}</p> : null}
      <p className="mt-3 text-sm font-bold leading-relaxed">{item.vraag}</p>
      <p className="mt-1 text-xs text-muted-foreground">
        {item.p} punt{item.p > 1 ? "en" : ""}
      </p>
    </div>
  );
}

function partLabel(item: RekenItem, i: number): string {
  if (item.parts.length === 1) return "Antwoord (getal + eenheid)";
  const st = item.steps.find((s) => s.k === "R" && s.part === i);
  const lbl = st?.label.replace(/ juist| consequent/g, "") ?? `deel ${i + 1}`;
  return `Antwoord ${i + 1}: ${lbl} (getal + eenheid)`;
}

function OefenScherm({
  titel,
  item,
  nr,
  totaal,
  onKlaar,
  onStop,
}: {
  titel: string;
  item: BankItem;
  nr: number;
  totaal: number;
  onKlaar: (r: Resultaat) => void;
  onStop: () => void;
}) {
  const [keuze, setKeuze] = useState<number | null>(null);
  const [formule, setFormule] = useState("");
  const [werk, setWerk] = useState("");
  const [ant, setAnt] = useState<string[]>([]);
  const [conclusie, setConclusie] = useState("");
  const [tekst, setTekst] = useState("");
  const [hints, setHints] = useState(0);
  const [uitslag, setUitslag] = useState<Uitslag | null>(null);
  const [aiUitleg, setAiUitleg] = useState<string | null>(null);
  const [bezig, setBezig] = useState(false);

  async function nakijken() {
    if (item.vorm === "mc") setUitslag(nakijkenMc(item, keuze));
    else if (item.vorm === "reken") setUitslag(nakijkenReken(item, { formule, werk, antwoorden: ant, conclusie }));
    else {
      const lokaal = nakijkenOpenLokaal(item, tekst);
      if (!item.ai || tekst.trim().length < 3) {
        setUitslag({ ...lokaal, voorlopig: false });
        return;
      }
      setBezig(true);
      try {
        const r = await nakijkOpenAi({ data: { id: item.id, antwoord: tekst } });
        if (r.ok) {
          setAiUitleg(r.uitleg);
          setUitslag({
            punten: r.punten,
            max: item.p,
            stappen: Array.from({ length: item.p }, (_, i) => ({ label: `punt ${i + 1}`, ok: i < r.punten, uitleg: "" })),
          });
        } else setUitslag(lokaal);
      } catch {
        setUitslag(lokaal);
      } finally {
        setBezig(false);
      }
    }
  }

  const kanNakijken =
    item.vorm === "mc" ? keuze !== null : item.vorm === "reken" ? ant.some((a) => a.trim()) : tekst.trim().length > 0;
  const heeftC = item.vorm === "reken" && item.steps.some((s) => s.k === "C");

  return (
    <main className="flex flex-col">
      <TopBar onBack={onStop} label={titel} />
      <div className="mt-3 flex items-center gap-2">
        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
          <div className="h-full bg-primary" style={{ width: `${((nr - 1) / totaal) * 100}%` }} />
        </div>
        <span className="text-xs text-muted-foreground">
          {nr}/{totaal}
        </span>
      </div>
      <div className="mt-4">
        <Kaart item={item} />
      </div>

      {item.vorm === "mc" ? (
        <div className="mt-4 flex flex-col gap-2">
          {item.opties.map((o, i) => {
            const goed = uitslag && i === item.sleutel;
            const fout = uitslag && i === keuze && i !== item.sleutel;
            return (
              <button
                key={i}
                type="button"
                disabled={!!uitslag}
                onClick={() => setKeuze(i)}
                className={cn(
                  "flex min-h-12 items-start gap-3 rounded-xl px-4 py-3 text-left text-sm",
                  goed
                    ? "bg-emerald-100 text-emerald-900"
                    : fout
                      ? "bg-red-100 text-red-900"
                      : keuze === i
                        ? "bg-primary text-primary-foreground"
                        : "bg-card shadow-[var(--shadow-border)]",
                )}
              >
                <span className="font-extrabold">{"ABCDEF"[i]}</span>
                <span>{o}</span>
              </button>
            );
          })}
        </div>
      ) : item.vorm === "reken" ? (
        <div className="mt-4 flex flex-col gap-3">
          <label className="grid gap-1 text-sm font-bold">
            Formule (met grootheden)
            <Input value={formule} disabled={!!uitslag} onChange={(e) => setFormule(e.target.value)} placeholder="bijv. P = U × I" />
          </label>
          <label className="grid gap-1 text-sm font-bold">
            Berekening / tussenstappen
            <Textarea
              value={werk}
              disabled={!!uitslag}
              onChange={(e) => setWerk(e.target.value)}
              rows={3}
              placeholder="bijv. I = 1150 : 230"
            />
          </label>
          {item.parts.map((_, i) => (
            <label key={i} className="grid gap-1 text-sm font-bold">
              {partLabel(item, i)}
              <Input
                value={ant[i] ?? ""}
                disabled={!!uitslag}
                inputMode="text"
                onChange={(e) => {
                  const n = [...ant];
                  n[i] = e.target.value;
                  setAnt(n);
                }}
                placeholder="bijv. 5,0 A"
              />
            </label>
          ))}
          {heeftC ? (
            <label className="grid gap-1 text-sm font-bold">
              Conclusie
              <Input value={conclusie} disabled={!!uitslag} onChange={(e) => setConclusie(e.target.value)} />
            </label>
          ) : null}
          {!uitslag ? <Hints item={item} niveau={hints} onMeer={() => setHints((h) => Math.min(3, h + 1))} /> : null}
        </div>
      ) : (
        <div className="mt-4">
          <Textarea value={tekst} disabled={!!uitslag} onChange={(e) => setTekst(e.target.value.slice(0, 600))} rows={4} placeholder="Jouw antwoord" />
        </div>
      )}

      {!uitslag ? (
        <Button type="button" className="mt-5 min-h-12 font-bold" disabled={!kanNakijken || bezig} onClick={() => void nakijken()}>
          {bezig ? "Nakijken…" : "Nakijken"}
        </Button>
      ) : (
        <Feedback item={item} uitslag={uitslag} aiUitleg={aiUitleg} hints={hints} onVolgende={() => onKlaar({ item, uitslag, hints })} laatste={nr === totaal} />
      )}
    </main>
  );
}

function Hints({ item, niveau, onMeer }: { item: RekenItem; niveau: number; onMeer: () => void }) {
  const formules = item.fam.map((f) => formuleTonen(f)).filter(Boolean);
  const tussen = item.steps.filter((s) => s.k === "N").map((s) => s.label);
  return (
    <div className="rounded-xl bg-muted/60 p-3 text-sm">
      {niveau >= 1 ? <p>Formule: {formules.length ? formules.join("  of  ") : "geen formule nodig, redeneer stap voor stap."}</p> : null}
      {niveau >= 2 ? (
        <p className="mt-1">
          Opzet: {tussen.length ? `bereken eerst ${tussen.join(", daarna ")}; ` : ""}vul de gegevens in de formule in en reken
          om naar de gevraagde eenheid.
        </p>
      ) : null}
      {niveau >= 3 ? <p className="mt-1">Antwoord: {item.uitwerking}</p> : null}
      {niveau < 3 ? (
        <button type="button" onClick={onMeer} className="flex items-center gap-1 font-bold text-primary">
          <Lightbulb className="size-4" /> {niveau === 0 ? "Hint: formule" : niveau === 1 ? "Hint: opzet" : "Laat antwoord zien"}
        </button>
      ) : null}
    </div>
  );
}

function Feedback({
  item,
  uitslag,
  aiUitleg,
  hints,
  onVolgende,
  laatste,
}: {
  item: BankItem;
  uitslag: Uitslag;
  aiUitleg: string | null;
  hints: number;
  onVolgende: () => void;
  laatste: boolean;
}) {
  return (
    <section className="mt-5 rounded-2xl bg-card p-4 shadow-[var(--shadow-border)]">
      <p className="text-lg font-extrabold">
        {uitslag.punten} / {uitslag.max} punt{uitslag.max > 1 ? "en" : ""}
        {hints > 0 ? <span className="ml-2 text-xs font-normal text-muted-foreground">(met {hints} hint{hints > 1 ? "s" : ""})</span> : null}
      </p>
      {item.vorm !== "open" ? (
        <ul className="mt-2 flex flex-col gap-2">
          {uitslag.stappen.map((s, i) => (
            <li key={i} className="flex gap-2 text-sm">
              {s.ok ? <Check className="mt-0.5 size-4 shrink-0 text-emerald-600" /> : <X className="mt-0.5 size-4 shrink-0 text-red-600" />}
              <span>
                <span className="font-bold">{s.label}</span>
                {s.uitleg ? <span className="text-muted-foreground"> — {s.uitleg}</span> : null}
              </span>
            </li>
          ))}
        </ul>
      ) : (
        <div className="mt-2 text-sm">
          {aiUitleg ? <p>{aiUitleg}</p> : null}
          {uitslag.voorlopig ? (
            <p className="mt-1 text-xs text-muted-foreground">Voorlopige score (op trefwoorden). Vergelijk zelf met het antwoordmodel.</p>
          ) : null}
          <p className="mt-2 text-muted-foreground">
            <span className="font-bold text-foreground">Antwoordmodel:</span> {item.cv}
          </p>
        </div>
      )}
      {item.vorm === "reken" ? (
        <p className="mt-3 text-sm text-muted-foreground">
          <span className="font-bold text-foreground">Uitwerking:</span> {item.uitwerking}
        </p>
      ) : null}
      {item.vorm === "reken" && item.parts[0]?.[0] ? (
        <p className="mt-1 text-xs text-subtle">
          Juist antwoord: {item.parts.map((p) => `${String(p[0]!.v).replace(".", ",")} ${fmtUnit(p[0]!.u)}`).join(" en ")}
        </p>
      ) : null}
      <Button type="button" className="mt-4 w-full min-h-12 font-bold" onClick={onVolgende}>
        {laatste ? "Bekijk je resultaat" : "Volgende vraag"}
      </Button>
    </section>
  );
}

function Samenvatting({ titel, res, onOpnieuw, onMenu }: { titel: string; res: Resultaat[]; onOpnieuw: () => void; onMenu: () => void }) {
  const tot = res.reduce((a, r) => a + r.uitslag.punten, 0);
  const max = res.reduce((a, r) => a + r.uitslag.max, 0);
  const perType = new Map<string, { p: number; m: number }>();
  for (const r of res) {
    const x = perType.get(r.item.type) ?? { p: 0, m: 0 };
    x.p += r.uitslag.punten;
    x.m += r.uitslag.max;
    perType.set(r.item.type, x);
  }
  const rijen = [...perType.entries()].sort((a, b) => a[1].p / a[1].m - b[1].p / b[1].m);
  return (
    <main className="flex flex-col">
      <TopBar onBack={onMenu} label={titel} />
      <p className="mt-6 text-3xl font-extrabold">
        {tot} / {max} punten
      </p>
      <p className="text-sm text-muted-foreground">{res.length} vragen gemaakt</p>
      <section className="mt-5">
        <p className="text-xs font-medium uppercase tracking-[0.14em] text-subtle">Per vraagtype (zwakste eerst)</p>
        <ul className="mt-2 flex flex-col divide-y divide-border rounded-2xl bg-card shadow-[var(--shadow-border)]">
          {rijen.map(([t, x]) => (
            <li key={t} className="flex items-center justify-between px-4 py-2.5 text-sm">
              <span>{TYPE_NAAM.get(t) ?? t}</span>
              <span className={cn("font-bold", x.p === x.m ? "text-emerald-700" : x.p === 0 ? "text-red-700" : "")}>
                {x.p}/{x.m}
              </span>
            </li>
          ))}
        </ul>
      </section>
      <Button type="button" className="mt-6 min-h-12 font-bold" onClick={onOpnieuw}>
        Nog een set
      </Button>
      <Button type="button" variant="outline" className="mt-2 min-h-12 font-bold" onClick={onMenu}>
        Terug naar het overzicht
      </Button>
    </main>
  );
}

