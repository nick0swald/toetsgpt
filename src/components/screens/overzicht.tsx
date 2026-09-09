import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { leesOverzicht, type Overzicht } from "@/lib/toets/stats";
import { useSession } from "@/lib/toets/session";
import { TopBar } from "./zelf";
import { cn } from "@/lib/utils";

export function OverzichtScreen() {
  const { state, go, setDocentPin, home } = useSession();
  const [pin, setPin] = useState(state.docentPin);
  const [busy, setBusy] = useState(false);
  const [fout, setFout] = useState<string | null>(null);
  const [data, setData] = useState<Overzicht | null>(null);

  async function openen(code = pin) {
    setFout(null);
    setBusy(true);
    try {
      const res = await leesOverzicht({ data: { pin: code } });
      if (!res.ok) {
        setFout(res.error);
        setDocentPin("");
        return;
      }
      setDocentPin(code);
      setData(res.overzicht);
    } catch {
      setFout("Overzicht laden lukte niet.");
    } finally {
      setBusy(false);
    }
  }

  useEffect(() => {
    if (state.docentPin) void openen(state.docentPin);
  }, []);

  return (
    <main className="flex flex-col">
      <TopBar onBack={() => home()} label="Docent" />

      {!data ? (
        <form
          className="mt-8 grid gap-4"
          onSubmit={(e) => {
            e.preventDefault();
            void openen();
          }}
        >
          <p className="text-sm leading-relaxed text-muted-foreground">
            Toets van de docent en waar klassen oefenen. Geen namen.
          </p>
          <div className="grid gap-1.5">
            <Label htmlFor="pin">Wachtwoord</Label>
            <Input
              id="pin"
              type="password"
              inputMode="numeric"
              autoComplete="off"
              value={pin}
              maxLength={24}
              onChange={(e) => setPin(e.target.value)}
            />
          </div>
          {fout ? <p className="text-sm text-destructive">{fout}</p> : null}
          <Button type="submit" size="lg" disabled={busy || pin.length < 4}>
            {busy ? "Openen…" : "Openen"}
          </Button>
        </form>
      ) : (
        <div className="mt-6 grid gap-6">
          <Button type="button" size="lg" onClick={() => go("docent")}>
            Toets van de docent
          </Button>
          <p className="text-sm text-muted-foreground">
            {data.totaal === 0
              ? "Nog geen oefeningen in de laatste 28 dagen."
              : `${data.totaal} oefenregels · laatste 28 dagen.`}
          </p>

          <section className="rounded-2xl bg-card p-4 shadow-[var(--shadow-border)]">
            <p className="text-xs font-medium uppercase tracking-[0.12em] text-subtle">
              Per klas
            </p>
            {data.klassen.length === 0 ? (
              <p className="mt-3 text-sm text-muted-foreground">Nog niets.</p>
            ) : (
              <ul className="mt-3 grid gap-2">
                {data.klassen.map((k) => (
                  <li key={k.klas} className="flex items-baseline justify-between gap-3">
                    <span className="text-sm">{k.klas}</span>
                    <span className="text-sm tabular-nums text-muted-foreground">
                      {k.oefeningen} ·{" "}
                      <span className={k.lastig > 0 ? "text-destructive" : "text-ok"}>
                        {k.lastig} lastig
                      </span>
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="rounded-2xl bg-card p-4 shadow-[var(--shadow-border)]">
            <p className="text-xs font-medium uppercase tracking-[0.12em] text-subtle">
              Lastige stof
            </p>
            {data.stof.length === 0 ? (
              <p className="mt-3 text-sm text-muted-foreground">Nog niets.</p>
            ) : (
              <ul className="mt-3 grid gap-2">
                {data.stof.map((s) => {
                  const pct = s.oefeningen > 0 ? s.lastig / s.oefeningen : 0;
                  return (
                    <li
                      key={`${s.vakId}-${s.paragraafId}`}
                      className="flex items-baseline justify-between gap-3"
                    >
                      <span className="min-w-0">
                        <span className="block text-sm leading-snug">{s.label}</span>
                        <span className="text-xs text-subtle">{s.vak}</span>
                      </span>
                      <span
                        className={cn(
                          "shrink-0 text-sm tabular-nums",
                          pct >= 0.55 ? "text-destructive" : "text-muted-foreground",
                        )}
                      >
                        {s.lastig}/{s.oefeningen}
                      </span>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>

          <Button
            type="button"
            variant="secondary"
            size="lg"
            onClick={() => {
              setData(null);
              setDocentPin("");
              home();
            }}
          >
            Terug naar leerlingen
          </Button>
        </div>
      )}
    </main>
  );
}
