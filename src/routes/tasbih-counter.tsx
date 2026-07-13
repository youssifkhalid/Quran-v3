import { createFileRoute, Link } from "@tanstack/react-router";
import { ChevronRight } from "lucide-react";

// redirect to tasbeeh
export const Route = createFileRoute("/tasbih-counter")({
  component: () => { if (typeof window !== "undefined") window.location.replace("/tasbeeh"); return null; },
});
