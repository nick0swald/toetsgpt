import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { DEFAULT_VAK_ID, vakOf } from "./stof";
import { bouwOefentoets } from "./demo";
import { diagnoseVan, gradeQuestion, gradeToets } from "./scoring";
import { doelId } from "./koppel";
import { slaDiagnoseOp } from "./diagnose-geheugen";
import { voegHuiswerkRondeToe } from "./huiswerk";
import { rapporteerOefening } from "./stats";
import type { Question, Screen, Toets, ToetsBron, ToetsUitslag, VraagUitslag } from "./types";

export type DoorRonde = {
  log: VraagUitslag[];
  vraag: Question;
  antwoord: string;
  nakijk: VraagUitslag | null;
  bron: ToetsBron;
  gezien: string[];
};

export type SessionState = {
  screen: Screen;
  naam: string;
  klas: string;
  vakId: string;
  toets: Toets | null;
  answers: Record<string, string>;
  index: number;
  startedAt: number | null;
  submittedAt: number | null;
  uitslag: ToetsUitslag | null;
  confirmSubmit: boolean;
  docentPin: string;
  door: DoorRonde | null;
  bio: { vraag: string; juist: string } | null;
};

const initial: SessionState = {
  screen: "start",
  naam: "",
  klas: "",
  vakId: DEFAULT_VAK_ID,
  toets: null,
  answers: {},
  index: 0,
  startedAt: null,
  submittedAt: null,
  uitslag: null,
  confirmSubmit: false,
  docentPin: "",
  door: null,
  bio: null,
};

type Api = {
  state: SessionState;
  setNaam: (v: string) => void;
  setKlas: (v: string) => void;
  setVakId: (v: string) => void;
  setDocentPin: (v: string) => void;
  go: (screen: Screen) => void;
  startToets: (toets: Toets) => void;
  setAnswer: (id: string, value: string) => void;
  setIndex: (i: number) => void;
  askSubmit: () => void;
  cancelSubmit: () => void;
  submit: () => void;
  startDoor: (bron: ToetsBron, gezien?: string[]) => void;
  setDoorAntwoord: (value: string) => void;
  keurDoor: () => void;
  volgendeDoor: () => void;
  stopDoor: () => void;
  openBio: (vraag: string, juist?: string) => void;
  resetKeepStudent: () => void;
  home: () => void;
};

const Ctx = createContext<Api | null>(null);

function cijferBucket(cijfer: number): "onder" | "cesuur" | "boven" {
  if (cijfer < 5.5) return "onder";
  if (cijfer < 7) return "cesuur";
  return "boven";
}

function meld(klas: string, vakId: string, uitslag: ToetsUitslag) {
  const bucket = cijferBucket(uitslag.cijfer);
  const events = uitslag.diagnose.perStof.map((row) => ({
    klas,
    vakId,
    hoofdstukId: row.tag.hoofdstukId,
    paragraafId: row.tag.paragraafId,
    lastig: row.totaal > 0 && row.behaald / row.totaal < 0.55,
    cijferBucket: bucket,
    behaald: row.behaald,
    totaal: row.totaal,
    doelId: doelId(vakId, row.tag.hoofdstukId, row.tag.paragraafId),
  }));
  if (klas && events.length > 0) {
    void rapporteerOefening({ data: { events } }).catch(() => undefined);
  }
}

function kiesDoorVraag(bron: ToetsBron, log: VraagUitslag[], gezien: string[]): Question | null {
  const lastig = diagnoseVan(log)
    .lastig.map((s) => s.tag.paragraafId)
    .filter((id) => id && id !== "lees-vaktekst");
  const vragen = bouwOefentoets({
    count: 6,
    soort: "mix",
    tijd: "kort",
    seed: Date.now() % 1_000_000,
    kind: "door",
    topic: bron.topic,
    hoofdstukId: bron.hoofdstukId,
    paragraafIds: lastig.length ? lastig : bron.paragraafIds,
    leerjaar: bron.leerjaar,
    niveau: bron.niveau,
    vakId: bron.vakId,
    excludePrompts: [...gezien, ...log.map((v) => v.question.prompt)],
  }).questions;
  const vraag = vragen[Math.floor(Math.random() * vragen.length)];
  if (!vraag) return null;
  return { ...vraag, id: `door-${log.length + 1}` };
}

export function SessionProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<SessionState>(initial);

  const setNaam = useCallback((v: string) => {
    setState((s) => ({ ...s, naam: v }));
  }, []);
  const setKlas = useCallback((v: string) => {
    setState((s) => ({ ...s, klas: v }));
  }, []);
  const setVakId = useCallback((v: string) => {
    setState((s) => ({ ...s, vakId: v }));
  }, []);
  const setDocentPin = useCallback((v: string) => {
    setState((s) => ({ ...s, docentPin: v }));
  }, []);
  const go = useCallback((screen: Screen) => {
    setState((s) => ({ ...s, screen, confirmSubmit: false }));
  }, []);
  const startToets = useCallback((toets: Toets) => {
    setState((s) => ({
      ...s,
      toets,
      answers: {},
      index: 0,
      startedAt: Date.now(),
      submittedAt: null,
      uitslag: null,
      confirmSubmit: false,
      door: null,
      screen: "exam",
    }));
  }, []);
  const setAnswer = useCallback((id: string, value: string) => {
    setState((s) => ({ ...s, answers: { ...s.answers, [id]: value } }));
  }, []);
  const setIndex = useCallback((i: number) => {
    setState((s) => ({ ...s, index: i, confirmSubmit: false }));
  }, []);
  const askSubmit = useCallback(() => {
    setState((s) => ({ ...s, confirmSubmit: true }));
  }, []);
  const cancelSubmit = useCallback(() => {
    setState((s) => ({ ...s, confirmSubmit: false }));
  }, []);
  const submit = useCallback(() => {
    setState((s) => {
      if (!s.toets) return s;
      const uitslag = gradeToets(s.toets, s.answers);
      const klas = s.klas.trim();
      const vakId = s.toets.bron.vakId || s.vakId || DEFAULT_VAK_ID;
      meld(klas, vakId, uitslag);
      try {
        slaDiagnoseOp({
          diagnose: uitslag.diagnose,
          bron: s.toets.bron,
          leerjaar: s.toets.bron.leerjaar,
          niveau: s.toets.bron.niveau,
          hoofdstukId: s.toets.bron.hoofdstukId,
          vakId,
        });
      } catch {
        /* localStorage mag falen */
      }
      try {
        voegHuiswerkRondeToe(s.toets, uitslag, {
          naam: s.naam,
          startedAt: s.startedAt,
          submittedAt: Date.now(),
        });
      } catch {
        /* sessionStorage mag falen */
      }
      return {
        ...s,
        submittedAt: Date.now(),
        confirmSubmit: false,
        uitslag,
        screen: "results",
      };
    });
  }, []);
  const startDoor = useCallback((bron: ToetsBron, gezien: string[] = []) => {
    const vraag = kiesDoorVraag(bron, [], gezien);
    if (!vraag) return;
    setState((s) => ({
      ...s,
      door: {
        log: [],
        vraag,
        antwoord: "",
        nakijk: null,
        bron: { ...bron, kind: "door" },
        gezien,
      },
      screen: "door",
      uitslag: null,
      confirmSubmit: false,
    }));
  }, []);
  const setDoorAntwoord = useCallback((value: string) => {
    setState((s) => (s.door && !s.door.nakijk ? { ...s, door: { ...s.door, antwoord: value } } : s));
  }, []);
  const keurDoor = useCallback(() => {
    setState((s) => {
      if (!s.door || s.door.nakijk) return s;
      const nakijk = gradeQuestion(s.door.vraag, s.door.antwoord);
      return { ...s, door: { ...s.door, nakijk, log: [...s.door.log, nakijk] } };
    });
  }, []);
  const volgendeDoor = useCallback(() => {
    setState((s) => {
      if (!s.door?.nakijk) return s;
      const vraag = kiesDoorVraag(s.door.bron, s.door.log, s.door.gezien);
      if (!vraag) return s;
      return { ...s, door: { ...s.door, vraag, antwoord: "", nakijk: null } };
    });
  }, []);
  const stopDoor = useCallback(() => {
    setState((s) => {
      if (!s.door || s.door.log.length === 0) return s;
      const log = s.door.log;
      const questions = log.map((v) => v.question);
      const answers = Object.fromEntries(log.map((v) => [v.question.id, v.given]));
      const toets: Toets = {
        title: "Oefenen zonder einde",
        subject: vakOf(s.door.bron.vakId).titel,
        questions,
        bron: { ...s.door.bron, kind: "door", count: questions.length, tijd: "kort" },
      };
      const uitslag = gradeToets(toets, answers);
      meld(s.klas.trim(), s.door.bron.vakId || s.vakId || DEFAULT_VAK_ID, uitslag);
      return {
        ...s,
        toets,
        answers,
        uitslag,
        submittedAt: Date.now(),
        confirmSubmit: false,
        door: null,
        screen: "results",
      };
    });
  }, []);
  const openBio = useCallback((vraag: string, juist = "") => {
    setState((s) => ({
      ...s,
      bio: { vraag: vraag.trim(), juist: juist.trim() },
      screen: "biogpt",
      confirmSubmit: false,
    }));
  }, []);
  const resetKeepStudent = useCallback(() => {
    setState((s) => ({
      ...initial,
      naam: s.naam,
      klas: s.klas,
      vakId: s.vakId,
      docentPin: s.docentPin,
      screen: s.toets?.bron.kind === "docent" ? "docent" : "zelf",
    }));
  }, []);
  const home = useCallback(() => {
    setState((s) => ({ ...initial, naam: s.naam, klas: s.klas, vakId: s.vakId }));
  }, []);

  const api = useMemo<Api>(
    () => ({
      state,
      setNaam,
      setKlas,
      setVakId,
      setDocentPin,
      go,
      startToets,
      setAnswer,
      setIndex,
      askSubmit,
      cancelSubmit,
      submit,
      startDoor,
      setDoorAntwoord,
      keurDoor,
      volgendeDoor,
      stopDoor,
      openBio,
      resetKeepStudent,
      home,
    }),
    [
      state,
      setNaam,
      setKlas,
      setVakId,
      setDocentPin,
      go,
      startToets,
      setAnswer,
      setIndex,
      askSubmit,
      cancelSubmit,
      submit,
      startDoor,
      setDoorAntwoord,
      keurDoor,
      volgendeDoor,
      stopDoor,
      openBio,
      resetKeepStudent,
      home,
    ],
  );

  return <Ctx.Provider value={api}>{children}</Ctx.Provider>;
}

export function useSession(): Api {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useSession buiten provider");
  return ctx;
}
