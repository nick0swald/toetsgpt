import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { DEFAULT_VAK_ID } from "./stof";
import { gradeToets } from "./scoring";
import { rapporteerOefening } from "./stats";
import type { Screen, Toets, ToetsUitslag } from "./types";

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
  resetKeepStudent: () => void;
  home: () => void;
};

const Ctx = createContext<Api | null>(null);

function cijferBucket(cijfer: number): "onder" | "cesuur" | "boven" {
  if (cijfer < 5.5) return "onder";
  if (cijfer < 7) return "cesuur";
  return "boven";
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
      const bucket = cijferBucket(uitslag.cijfer);
      const events = uitslag.diagnose.perStof.map((row) => ({
        klas,
        vakId,
        hoofdstukId: row.tag.hoofdstukId,
        paragraafId: row.tag.paragraafId,
        lastig: row.totaal > 0 && row.behaald / row.totaal < 0.55,
        cijferBucket: bucket,
      }));
      if (klas && events.length > 0) {
        void rapporteerOefening({ data: { events } }).catch(() => undefined);
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
