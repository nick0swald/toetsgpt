import { useRef } from "react";
import { SessionProvider, useSession } from "@/lib/toets/session";
import { DocentScreen } from "./screens/docent";
import { ExamScreen } from "./screens/exam";
import { OverzichtScreen } from "./screens/overzicht";
import { ResultsScreen } from "./screens/results";
import { StartScreen } from "./screens/start";
import { VandaagScreen } from "./screens/vandaag";
import { ZelfScreen } from "./screens/zelf";

export function ToetsoefenApp() {
  return (
    <SessionProvider>
      <Shell />
    </SessionProvider>
  );
}

function LogoMark() {
  return (
    <svg viewBox="0 0 32 32" className="size-8 shrink-0" aria-hidden="true">
      <circle cx="16" cy="16" r="15" className="fill-primary" />
      <circle
        cx="16"
        cy="16"
        r="6.2"
        fill="none"
        className="stroke-primary-foreground"
        strokeWidth="2.6"
      />
    </svg>
  );
}

function Shell() {
  const { state, go } = useSession();
  const taps = useRef(0);
  const tapTimer = useRef(0);

  function tapLogo() {
    window.clearTimeout(tapTimer.current);
    taps.current += 1;
    if (taps.current >= 5) {
      taps.current = 0;
      go("overzicht");
      return;
    }
    tapTimer.current = window.setTimeout(() => {
      taps.current = 0;
    }, 4000);
  }

  let screen = <StartScreen />;
  if (state.screen === "vandaag") screen = <VandaagScreen />;
  else if (state.screen === "zelf") screen = <ZelfScreen />;
  else if (state.screen === "docent") screen = <DocentScreen />;
  else if (state.screen === "exam") screen = <ExamScreen />;
  else if (state.screen === "results") screen = <ResultsScreen />;
  else if (state.screen === "overzicht") screen = <OverzichtScreen />;

  return (
    <div className="flex min-h-dvh flex-col bg-background text-foreground">
      <header className="sticky top-0 z-50 border-b border-border bg-background/90">
        <div className="mx-auto flex h-14 w-full max-w-md items-center px-4">
          <button type="button" onClick={tapLogo} className="flex items-center gap-2 text-foreground">
            <LogoMark />
            <span className="text-lg font-extrabold tracking-tight">
              Toets<span className="text-primary">GPT</span>
            </span>
          </button>
        </div>
      </header>
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col px-4 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-5">
        {screen}
      </div>
    </div>
  );
}
