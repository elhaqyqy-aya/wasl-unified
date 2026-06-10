import { createFileRoute } from "@tanstack/react-router";
import { ProfileView } from "@/components/dashboard/ProfileView";

export const Route = createFileRoute("/dashboard/rh/profile")({
  component: () => <ProfileView role="rh" />,
});
