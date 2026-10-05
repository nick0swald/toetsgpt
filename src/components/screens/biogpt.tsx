import { useEffect, useRef, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { vraagBio, type BioStap } from "@/lib/toets/biogpt";
import { useSession } from "@/lib/toets/session";

type Regel = { van: "jij" | "bio"; tekst: string };

const KNOP: Record<Exclude<BioStap, "vrij">, string> = {
  snap: "Snap je vraag",
  hint: "Eerst een hint",
  hulp: "Hulp",
  nog: "Ik snap het nog niet",
  antwoord: "Laat het antwoord zien",
  oefen: "Nieuwe oefenvraag",
};

export function BioGptScreen() {
  const { state, go } = useSession();
  const startVraag = state.bio?.vraag ?? "";
  const juist = state.bio?.juist ?? "";
  const [concept, setConcept] = useState("");
  const [regels, setRegels] = useState<Regel[]>(startVraag ? [{ van: "jij", tekst: startVraag }] : []);
  const [bezig, setBezig] = useState(false);
  const [fout, setFout] = useState<string | null>(null);
  const [antwoordGezien, setAntwoordGezien] = useState(false);
  const einde = useRef<HTMLDivElement>(null);
  const heeftGesprek = regels.some((r) => r.van === "bio");

  useEffect(() => {
    einde.current?.scrollIntoView({ block: "end" });
  }, [regels, bezig]);

  async function stuur(stap: BioStap) {
    const getypt = concept.trim();
    if (!startVraag && regels.length === 0 && !getypt) {
      setFout("Zet eerst je vraag.");
      return;
    }
    if (stap === "vrij" && !getypt) {
      setFout("Typ eerst iets.");
      return;
    }
    setFout(null);
    setBezig(true);
    const geschiedenis = regels;
    try {
      const res = await vraagBio({
        data: {
          stap,
          tekst: getypt || startVraag || undefined,
          juist: juist || undefined,
          geschiedenis,
        },
      });
      if (!res.ok) {
        setFout(res.tekst);
        return;
      }
      const toevoegen: Regel[] = [];
      if (stap === "vrij") {
        toevoegen.push({ van: "jij", tekst: getypt });
      } else {
        if (getypt && !geschiedenis.some((r) => r.van === "jij" && r.tekst === getypt)) {
          toevoegen.push({ van: "jij", tekst: getypt });
        }
        toevoegen.push({ van: "jij", tekst: KNOP[stap] });
      }
      setRegels((cur) => [...cur, ...toevoegen, { van: "bio", tekst: res.tekst }]);
      if (stap === "vrij" || regels.length === 0) setConcept("");
      if (stap === "antwoord") setAntwoordGezien(true);
    } catch {
      setFout("BioGPT antwoordt nu niet. Probeer opnieuw.");
    } finally {
      setBezig(false);
    }
  }

  return (
    <main className="flex flex-col pb-4">
      <button
        type="button"
        onClick={() => go(state.uitslag ? "results" : "zelf")}
        className="inline-flex min-h-11 items-center gap-1 text-sm font-bold text-muted-foreground"
      >
        <ArrowLeft className="size-4" strokeWidth={2} />
        Terug
      </button>
      <p className="mt-3 font-serif text-2xl font-medium tracking-tight text-foreground">BioGPT</p>
      <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
        Zelfde hulp als Oswald. Over 13.3 tot en met 13.6. Een beetje extra uitleg mag, die staat niet op de toets.
      </p>

      <ul className="mt-5 grid gap-3">
        {regels.length === 0 ? (
          <li className="rounded-2xl bg-card px-4 py-3 text-sm leading-relaxed text-muted-foreground shadow-[var(--shadow-border)]">
            Plak de vraag waar je vastzit. Daarna: snap je vraag, een hint, of hulp.
          </li>
        ) : null}
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
            <p className="mt-1 whitespace-pre-wrap">{r.tekst}</p>
          </li>
        ))}
        {bezig ? (
          <li className="rounded-2xl bg-card px-4 py-3 text-sm text-muted-foreground shadow-[var(--shadow-border)]">
            Even denken…
          </li>
        ) : null}
      </ul>
      <div ref={einde} />

      <label htmlFor="bio-vraag" className="mt-5 text-xs font-medium uppercase tracking-[0.14em] text-subtle">
        {regels.length === 0 ? "Jouw vraag" : "Doorvragen"}
      </label>
      <Textarea
        id="bio-vraag"
        value={concept}
        onChange={(e) => setConcept(e.target.value)}
        maxLength={800}
        rows={3}
        placeholder={regels.length === 0 ? "Plak de vraag." : "Typ een vervolg, of kies een knop."}
        className="mt-2"
      />
      {fout ? <p className="mt-3 text-sm text-destructive">{fout}</p> : null}

      <div className="mt-4 grid gap-2">
        <Button type="button" size="lg" onClick={() => void stuur(regels.length === 0 ? "snap" : "vrij")} disabled={bezig}>
          {regels.length === 0 ? "Snap je vraag" : "Stuur"}
        </Button>
        <div className="grid grid-cols-2 gap-2">
          <Button type="button" variant="secondary" size="lg" onClick={() => void stuur("hint")} disabled={bezig}>
            Eerst een hint
          </Button>
          <Button type="button" variant="secondary" size="lg" onClick={() => void stuur("hulp")} disabled={bezig}>
            Hulp
          </Button>
        </div>
        {heeftGesprek ? (
          <>
            <Button type="button" variant="secondary" size="lg" onClick={() => void stuur("nog")} disabled={bezig}>
              Ik snap het nog niet
            </Button>
            <Button type="button" variant="secondary" size="lg" onClick={() => void stuur("antwoord")} disabled={bezig}>
              Laat het antwoord zien
            </Button>
          </>
        ) : null}
        {antwoordGezien ? (
          <Button type="button" variant="bio" size="lg" onClick={() => void stuur("oefen")} disabled={bezig}>
            Nieuwe oefenvraag
          </Button>
        ) : null}
      </div>
    </main>
  );
}
