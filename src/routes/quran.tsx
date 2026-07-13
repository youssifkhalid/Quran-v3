import { Outlet, createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/quran")({
  component: () => <Outlet />,
});