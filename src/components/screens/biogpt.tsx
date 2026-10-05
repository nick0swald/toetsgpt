import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { vraagBio, type BioStap } from "@/lib/toets/biogpt";
import { useSession } from "@/lib/toets/session";

type Regel = { van: "jij" | "bio"; tekst: string };

export function BioGptScreen() {
  const { state, go } = useSession();
  const startVraag = state.bio?.vraag ?? "";
  const juist = state.bio?.juist ?? "";
  const [vraag, setVraag] = useState(startVraag);
  const [regels, setRegels] = useState<Regel[]>(
    startVraag ? [{ van: "jij", tekst: startVraag }] : [],
  );
  const [bezig, setBezig] = useState(false);
  const [fout, setFout] = useState<string | null>(null);
  const [antwoordGezien, setAntwoordGezien] = useState(false);
  const heeftHint = regels.some((r) => r.van === "bio");

  async function stap(soort: BioStap) {
    const tekst = vraag.trim();
    if (!tekst && soort !== "oefen") {
      setFout("Zet eerst je vraag.");
      return;
    }
    setFout(null);
    setBezig(true);
    const eerder = regels.filter((r) => r.van === "bio").map((r) => r.tekst);
    try {
      const res = await vraagBio({
        data: { stap: soort, vraag: tekst, juist: juist || undefined, eerder },
      });
      setRegels((cur) => {
        const next = [...cur];
        if (soort !== "oefen" && tekst && !next.some((r) => r.van === "jij" && r.tekst === tekst)) {
          next.push({ van: "jij", tekst });
        }
        next.push({ van: "bio", tekst: res.tekst });
        return next;
      });
      if (soort === "antwoord") setAntwoordGezien(true);
      if (soort === "oefen") setVraag("");
    } catch {
      setFout("BioGPT antwoordt nu niet. Probeer opnieuw.");
    } finally {
      setBezig(false);
    }
  }

  return (
    <main className="flex flex-col">
      <button
        type="button"
        onClick={() => go(state.uitslag ? "results" : "zelf")}
        className="inline-flex min-h-11 items-center gap-1 text-sm font-bold text-muted-foreground"
      >
        <ArrowLeft className="size-4" strokeWidth={2} />
        Terug
      </button>
      <p className="mt-3 font-serif text-2xl font-medium tracking-tight text-foreground">BioGPT</p>
      <p className="mt-1 text-sm text-muted-foreground">
        Eerst een hint. Het antwoord pas als je daarom vraagt. Alleen 13.3 tot en met 13.6.
      </p>

      <ul className="mt-5 grid gap-3">
        {regels.map((r, i) => (
          <li
            key={`${i}-${r.van}`}
            className={
              r.van === "bio"
                ? "rounded-2xl bg-card px-4 py-3 text-sm leading-relaxed text-foreground shadow-[var(--shadow-border)]"
                : "rounded-2xl bg-primary/10 px-4 py-3 text-sm leading-relaxed text-foreground"
            }
          >
            <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-subtle">
              {r.van === "bio" ? "BioGPT" : "Jij"}
            </p>
            <p className="mt-1">{r.tekst}</p>
          </li>
        ))}
      </ul>

      <label htmlFor="bio-vraag" className="mt-5 text-xs font-medium uppercase tracking-[0.14em] text-subtle">
        Jouw vraag
      </label>
      <Textarea
        id="bio-vraag"
        value={vraag}
        onChange={(e) => setVraag(e.target.value)}
        maxLength={800}
        rows={3}
        placeholder="Waar zit je vast?"
        className="mt-2"
      />
      {fout ? <p className="mt-3 text-sm text-destructive">{fout}</p> : null}

      <div className="mt-4 grid gap-2">
        {!heeftHint ? (
          <Button type="button" size="lg" onClick={() => void stap("hint")} disabled={bezig}>
            {bezig ? "Even denken…" : "Geef een hint"}
          </Button>
        ) : (
          <>
            <Button type="button" size="lg" onClick={() => void stap("nog")} disabled={bezig}>
              Ik snap het nog niet
            </Button>
            <Button
              type="button"
              variant="secondary"
              size="lg"
              onClick={() => void stap("antwoord")}
              disabled={bezig}
            >
              Laat het antwoord zien
            </Button>
            {antwoordGezien ? (
              <Button
                type="button"
                variant="bio"
                size="lg"
                onClick={() => void stap("oefen")}
                disabled={bezig}
              >
                Nieuwe oefenvraag
              </Button>
            ) : null}
          </>
        )}
      </div>
    </main>
  );
}
