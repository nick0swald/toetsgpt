import { createFileRoute } from "@tanstack/react-router";
import { ToetsoefenApp } from "@/components/app";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  return <ToetsoefenApp />;
}
