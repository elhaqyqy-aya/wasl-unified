import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, Panel } from "@/components/dashboard/Bits";

export const Route = createFileRoute("/dashboard/admin/settings")({
  component: Settings,
});

function Toggle({ label, hint, defaultOn }: { label: string; hint: string; defaultOn?: boolean }) {
  return (
    <label className="flex items-start justify-between gap-4 py-4 border-b border-border last:border-0 cursor-pointer">
      <div>
        <div className="font-medium text-sm">{label}</div>
        <div className="text-xs text-muted-foreground mt-1">{hint}</div>
      </div>
      <input type="checkbox" defaultChecked={defaultOn} className="peer sr-only" />
      <span className="w-11 h-6 rounded-full bg-muted relative transition peer-checked:bg-accent after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:w-5 after:h-5 after:rounded-full after:bg-white after:transition-all peer-checked:after:translate-x-5 shrink-0" />
    </label>
  );
}

function Settings() {
  return (
    <div className="space-y-6">
      <PageHeader kicker="Platform" title="Settings & policies" subtitle="Configure how Wasl by Humanai behaves across roles and data domains." />
      <div className="grid lg:grid-cols-2 gap-5">
        <Panel title="AI assistant policies">
          <Toggle label="Strict knowledge boundary" hint="Refuse questions outside the user's authorized scope." defaultOn />
          <Toggle label="Auto-escalation to human RH" hint="Forward sensitive or ambiguous queries to an HR referent." defaultOn />
          <Toggle label="Log full transcripts" hint="Store full interactions (encrypted). Required for compliance audits." />
        </Panel>
        <Panel title="Workforce data">
          <Toggle label="Anonymise analytics" hint="Use aggregated data when no identification is required." defaultOn />
          <Toggle label="Allow CSV import" hint="Let authorized HR users bulk import collaborator records." defaultOn />
          <Toggle label="Enable SIRH bridge (beta)" hint="Sync with an external HRIS — coming in v2." />
        </Panel>
        <Panel title="Notifications">
          <Toggle label="Email critical alerts" hint="Immediate email for any critical-level incident." defaultOn />
          <Toggle label="Daily digest" hint="Morning summary of platform activity to admins." defaultOn />
        </Panel>
        <Panel title="Compliance">
          <Toggle label="GDPR right-to-be-forgotten" hint="Surface a one-click workflow for data erasure requests." defaultOn />
          <Toggle label="Immutable audit log" hint="Append-only storage with cryptographic chain verification." defaultOn />
        </Panel>
      </div>
    </div>
  );
}
