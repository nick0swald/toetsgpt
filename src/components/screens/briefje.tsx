import { useState } from "react";
import { parseBriefje } from "@/lib/toets/briefje";
import { bouwOefentoets } from "@/lib/toets/demo";
import { Button } from "@/components/ui/button";
import { useSession } from "@/lib/toets/session";
import { TopBar } from "./zelf";

export function BriefjeScreen() {
  const { state, go, startToets } = useSession();
  const [fout, setFout] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function laden(file: File | undefined) {
    if (!file) return;
    setFout(null);
    setBusy(true);
    try {
      const text = await file.text();
      const b = parseBriefje(text);
      if (!b) {
        setFout("Dit is geen ToetsGPT-briefje.");
        return;
      }
      startToets(
        bouwOefentoets({
          count: 8,
          soort: "mix",
          tijd: "kort",
          seed: Date.now() % 1_000_000,
          kind: "extra",
          topic: b.lastig || b.topic || "Oefenbriefje",
          hoofdstukId: b.hoofdstukId,
          paragraafIds: b.paragraafIds ?? [],
          lastig: b.lastig,
          leerjaar: b.leerjaar,
          niveau: b.niveau,
          vakId: state.vakId === "lees" ? "lees" : "nask",
        }),
      );
    } catch {
      setFout("Laden lukte niet. Kies een txt-briefje.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="flex flex-col">
      <TopBar onBack={() => go("start")} label="Briefje laden" />
      <p className="mt-6 text-sm leading-relaxed text-muted-foreground">
        Kies een eerder bewaard briefje. Daarna ga je verder met die stof. Later ook een startbriefje van je docent.
      </p>

      <label className="mt-8 flex min-h-28 cursor-pointer flex-col items-center justify-center gap-2 rounded-3xl bg-card px-5 text-center shadow-[var(--shadow-border)]">
        <span className="text-base font-extrabold text-foreground">
          {busy ? "Laden…" : "Kies briefje"}
        </span>
        <span className="text-sm text-muted-foreground">txt-bestand van ToetsGPT</span>
        <input
          type="file"
          accept=".txt,.json,text/plain,application/json"
          className="sr-only"
          disabled={busy}
          onChange={(e) => {
            const file = e.target.files?.[0];
            void laden(file);
            e.target.value = "";
          }}
        />
      </label>

      {fout ? <p className="mt-4 text-sm text-destructive">{fout}</p> : null}

      <Button type="button" variant="ghost" className="mt-6" onClick={() => go("start")}>
        Terug
      </Button>
    </main>
  );
}
