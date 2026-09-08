import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { Screen, Toets, ToetsUitslag } from "./types";
import { gradeToets } from "./scoring";

export type SessionState = {
  screen: Screen;
  naam: string;
  klas: string;
  toets: Toets | null;
  answers: Record<string, string>;
  index: number;
  startedAt: number | null;
  submittedAt: number | null;
  uitslag: ToetsUitslag | null;
  confirmSubmit: boolean;
};

const initial: SessionState = {
  screen: "start",
  naam: "",
  klas: "",
  toets: null,
  answers: {},
  index: 0,
  startedAt: null,
  submittedAt: null,
  uitslag: null,
  confirmSubmit: false,
};

type Api = {
  state: SessionState;
  setNaam: (v: string) => void;
  setKlas: (v: string) => void;
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

export function SessionProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<SessionState>(initial);

  const setNaam = useCallback((v: string) => {
    setState((s) => ({ ...s, naam: v }));
  }, []);
  const setKlas = useCallback((v: string) => {
    setState((s) => ({ ...s, klas: v }));
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
      return {
        ...s,
        submittedAt: Date.now(),
        confirmSubmit: false,
        uitslag: gradeToets(s.toets, s.answers),
        screen: "results",
      };
    });
  }, []);
  const resetKeepStudent = useCallback(() => {
    setState((s) => ({
      ...initial,
      naam: s.naam,
      klas: s.klas,
      screen: s.toets?.bron.kind === "docent" ? "docent" : "zelf",
    }));
  }, []);
  const home = useCallback(() => {
    setState((s) => ({ ...initial, naam: s.naam, klas: s.klas }));
  }, []);

  const api = useMemo<Api>(
    () => ({
      state,
      setNaam,
      setKlas,
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
