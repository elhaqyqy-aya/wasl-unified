import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";

export const Route = createFileRoute("/dashboard/collab")({
  component: () => <AppShell role="collab" />,
});
