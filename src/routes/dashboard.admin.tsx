import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";

export const Route = createFileRoute("/dashboard/admin")({
  component: () => <AppShell role="admin" />,
});
