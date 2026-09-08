import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { VOORBEELD_DOC_TOETS } from "@/lib/toets/demo";
import { generateToets } from "@/lib/toets/generate";
import { parseLeerlingToets } from "@/lib/toets/parse-paste";
import { useSession } from "@/lib/toets/session";
import { TopBar } from "./zelf";

export function DocentScreen() {
  const { state, go, startToets } = useSession();
  const [tekst, setTekst] = useState("");
  const [busy, setBusy] = useState(false);
  const [fout, setFout] = useState<string | null>(null);

  function startVoorbeeld() {
    setFout(null);
    const parsed = parseLeerlingToets(VOORBEELD_DOC_TOETS, {
      kind: "docent",
      topic: "voorbeeldtoets",
      raw: VOORBEELD_DOC_TOETS,
      count: 6,
      soort: "auto",
      tijd: "kort",
    });
    if (!parsed) {
      setFout("Voorbeeld kon niet geladen worden.");
      return;
    }
    startToets(parsed.toets);
  }

  async function starten() {
    setFout(null);
    const raw = tekst.trim();
    if (!raw) {
      setFout("Plak eerst de leerlingtoets.");
      return;
    }

    const parsed = parseLeerlingToets(raw, {
      kind: "docent",
      topic: "geplakte toets",
      raw,
      count: 8,
      soort: "auto",
      tijd: "kort",
    });

    if (parsed && parsed.missingKey.length === 0) {
      startToets(parsed.toets);
      return;
    }

    setBusy(true);
    try {
      const res = await generateToets({
        data: {
          mode: "docent",
          naam: state.naam,
          klas: state.klas,
          lesstof: raw,
          count: parsed?.toets.questions.length ?? 8,
          soort: "auto",
          tijd: "kort",
        },
      });
      if (res.ok) {
        startToets(res.toets);
        return;
      }
      if (parsed && parsed.missingKey.length < parsed.toets.questions.length) {
        startToets(parsed.toets);
        return;
      }
      setFout(
        parsed
          ? "Geen sleutel gevonden. Zet onderaan SLEUTEL, of start het voorbeeld."
          : "Deze tekst lijkt geen toets. Nummer de vragen (1. 2. 3.) of start het voorbeeld.",
      );
    } catch {
      if (parsed) {
        startToets(parsed.toets);
      } else {
        setFout(
          "Deze tekst lijkt geen toets. Nummer de vragen (1. 2. 3.) of start het voorbeeld.",
        );
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-lg flex-col px-5 pb-10 pt-[max(1rem,env(safe-area-inset-top))]">
      <TopBar onBack={() => go("start")} label="Toets van de docent" />

      <p className="mt-6 text-sm leading-relaxed text-muted-foreground">
        Plak de leerlingtoets als tekst. Een sleutel onderaan mag (kop SLEUTEL). Code volgt later.
      </p>

      <div className="mt-5 grid gap-1.5">
        <Label htmlFor="toets">Leerlingtoets</Label>
        <Textarea
          id="toets"
          value={tekst}
          onChange={(e) => setTekst(e.target.value)}
          maxLength={8000}
          className="min-h-48"
          placeholder={"1. Situatie…\n\nVraag…\nA …\nB …"}
        />
      </div>

      {fout ? <p className="mt-4 text-sm text-destructive">{fout}</p> : null}

      <div className="mt-6 grid gap-3">
        <Button type="button" size="lg" onClick={() => void starten()} disabled={busy}>
          {busy ? "Toets klaarzetten…" : "Start toets"}
        </Button>
        <Button
          type="button"
          variant="secondary"
          size="lg"
          onClick={startVoorbeeld}
          disabled={busy}
        >
          Start voorbeeldtoets
        </Button>
      </div>

      <p className="mt-8 text-xs leading-relaxed text-subtle">
        Geen upload. Alleen plakken. Vernieuwen wist de toets.
      </p>
    </main>
  );
}
