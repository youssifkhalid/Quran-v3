import { Outlet, createFileRoute } from "@tanstack/react-router";

// Layout wrapper — child routes render inside <Outlet />
export const Route = createFileRoute("/adhkar")({
  component: () => <Outlet />,
});
