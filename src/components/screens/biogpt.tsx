import { useEffect, useRef, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { vraagBio, type BioStap } from "@/lib/toets/biogpt";
import { useSession } from "@/lib/toets/session";

type Regel = { van: "jij" | "bio"; tekst: string };

const KNOP: Record<Exclude<BioStap, "vrij" | "snap">, string> = {
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
  const gaf = state.bio?.gaf ?? "";
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

  function huidigeVraag(): string {
    for (let i = regels.length - 1; i >= 0; i -= 1) {
      const regel = regels[i];
      if (regel?.van === "jij" && !Object.values(KNOP).includes(regel.tekst)) return regel.tekst;
    }
    return startVraag;
  }

  async function stuur(stap: BioStap) {
    const getypt = concept.trim();
    const vraag = stap === "vrij" ? getypt : getypt || huidigeVraag();
    if (!vraag) {
      setFout(stap === "vrij" ? "Typ eerst iets." : "Zet eerst je vraag.");
      return;
    }
    setFout(null);
    setBezig(true);
    try {
      const res = await vraagBio({
        data: {
          stap,
          tekst: vraag,
          juist: juist || undefined,
          gaf: gaf || undefined,
          geschiedenis: regels,
        },
      });
      if (!res.ok) {
        setFout(res.tekst);
        return;
      }
      const toevoegen: Regel[] = [];
      if (stap === "vrij") toevoegen.push({ van: "jij", tekst: getypt });
      else if (!regels.some((r) => r.van === "jij" && r.tekst === vraag)) {
        toevoegen.push({ van: "jij", tekst: vraag });
      }
      if (stap !== "vrij" && stap !== "snap") toevoegen.push({ van: "jij", tekst: KNOP[stap] });
      setRegels((cur) => [...cur, ...toevoegen, { van: "bio", tekst: res.tekst }]);
      setConcept("");
      if (stap === "antwoord") setAntwoordGezien(true);
      if (stap === "oefen") setAntwoordGezien(false);
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
        Hulp bij je biologievraag. Over 13.3 tot en met 13.6. Extra uitleg mag, die staat niet op de toets.
      </p>

      <ul className="mt-5 grid gap-3">
        {regels.map((r, i) => (
          <li
            key={`${i}-${r.van}`}
            className={
              r.van === "bio"
                ? "rounded-2xl bg-[#C6F531]/25 px-4 py-3 text-sm leading-relaxed text-foreground shadow-[var(--shadow-border)]"
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
        {concept.trim() ? (
          <Button type="button" size="lg" onClick={() => void stuur(heeftGesprek ? "vrij" : "hint")} disabled={bezig}>
            {bezig ? "Even denken…" : "Stuur"}
          </Button>
        ) : null}
        <Button
          type="button"
          variant={concept.trim() ? "secondary" : "primary"}
          size="lg"
          onClick={() => void stuur("hint")}
          disabled={bezig}
        >
          Eerst een hint
        </Button>
        <Button type="button" variant="secondary" size="lg" onClick={() => void stuur("hulp")} disabled={bezig}>
          Hulp
        </Button>
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
