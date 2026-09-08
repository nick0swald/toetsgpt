import { SessionProvider, useSession } from "@/lib/toets/session";
import { DocentScreen } from "./screens/docent";
import { ExamScreen } from "./screens/exam";
import { ResultsScreen } from "./screens/results";
import { StartScreen } from "./screens/start";
import { ZelfScreen } from "./screens/zelf";

export function ToetsoefenApp() {
  return (
    <SessionProvider>
      <Shell />
    </SessionProvider>
  );
}

function Shell() {
  const { state } = useSession();
  let screen = <StartScreen />;
  if (state.screen === "zelf") screen = <ZelfScreen />;
  else if (state.screen === "docent") screen = <DocentScreen />;
  else if (state.screen === "exam") screen = <ExamScreen />;
  else if (state.screen === "results") screen = <ResultsScreen />;
  return <div className="mx-auto min-h-dvh w-full max-w-lg">{screen}</div>;
}
