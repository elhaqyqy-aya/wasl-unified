import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { PageHeader, Panel } from "@/components/dashboard/Bits";
import { Toast } from "@/components/Modal";
import { LogOut, Loader2, CheckCircle2, Circle } from "lucide-react";
import { getMyOffboarding, startOffboarding, updateOffboarding } from "@/lib/workflows.functions";

export const Route = createFileRoute("/dashboard/collab/offboarding")({ component: Off });

const STEPS = [
  "Initial notice",
  "Knowledge transfer doc",
  "Equipment return",
  "Access revocation",
  "Exit interview",
  "Final settlement",
];

function Off() {
  const qc = useQueryClient();
  const [toast, setToast] = useState<string | null>(null);
  const [transfer, setTransfer] = useState("");
  const getFn = useServerFn(getMyOffboarding);
  const startFn = useServerFn(startOffboarding);
  const updateFn = useServerFn(updateOffboarding);

  const { data, isLoading } = useQuery({ queryKey: ["my-off"], queryFn: () => getFn() });
  const off = data?.offboarding;

  const start = useMutation({
    mutationFn: () => startFn({ data: {} }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["my-off"] }); setToast("Offboarding started"); },
  });
  const update = useMutation({
    mutationFn: (input: any) => updateFn({ data: input }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["my-off"] }); setToast("Progress saved"); },
  });

  if (isLoading) return <div className="text-sm text-muted-foreground">Loading…</div>;

  if (!off) {
    return (
      <div className="space-y-6">
        <PageHeader kicker="Departure" title="Offboarding" subtitle="A respectful, structured goodbye — and a clean handover." />
        <Panel title="No active offboarding">
          <p className="text-sm text-muted-foreground mb-4">When you decide to leave, start the workflow here. HR is notified and the assistant helps you produce a knowledge-transfer note.</p>
          <button onClick={() => start.mutate()} disabled={start.isPending} className="pill-btn accent !text-[10px] !py-2 !px-4 tracking-[0.2em] uppercase">
            {start.isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <LogOut className="w-3.5 h-3.5" />} Start offboarding
          </button>
        </Panel>
        <Toast msg={toast} onDone={() => setToast(null)} />
      </div>
    );
  }

  const stepIdx = Math.floor((off.progress / 100) * STEPS.length);

  return (
    <div className="space-y-6">
      <PageHeader kicker="Departure" title="Offboarding" subtitle={`Step ${Math.min(stepIdx + 1, STEPS.length)} of ${STEPS.length} · ${off.current_step ?? ""}`} />
      <Panel title={`Progress · ${off.progress}%`}>
        <div className="h-3 rounded-full bg-secondary overflow-hidden">
          <div className="h-full transition-all duration-700" style={{ width: `${off.progress}%`, background: "var(--grad-brand)" }} />
        </div>
      </Panel>
      <Panel title="Steps">
        {STEPS.map((s, i) => {
          const done = i < stepIdx;
          const I = done ? CheckCircle2 : Circle;
          return (
            <div key={s} className="flex items-center gap-2 py-2 text-sm">
              <I className={`w-4 h-4 ${done ? "text-success" : "text-muted-foreground"}`} />
              <span className={done ? "line-through text-muted-foreground" : ""}>{s}</span>
              {i === stepIdx && (
                <button onClick={() => update.mutate({ id: off.id, progress: Math.min(100, off.progress + Math.ceil(100 / STEPS.length)), current_step: STEPS[Math.min(i + 1, STEPS.length - 1)] })}
                  className="ml-auto pill-btn !text-[9px] !py-1 !px-2.5 tracking-[0.2em] uppercase">Complete</button>
              )}
            </div>
          );
        })}
      </Panel>
      <Panel title="Knowledge transfer (AI-assisted)">
        <p className="text-xs text-muted-foreground mb-2">List your ongoing projects, key contacts, recurring tasks and any insight your successor must know.</p>
        <textarea rows={6} value={transfer || off.knowledge_transfer || ""} onChange={(e) => setTransfer(e.target.value)}
          placeholder="Project Atlas — handover to Yasmine; weekly sync Thursdays 10am; cloud cost dashboard credentials in 1Password vault…"
          className="w-full rounded-xl border border-border bg-secondary/40 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-accent" />
        <button onClick={() => update.mutate({ id: off.id, knowledge_transfer: transfer || off.knowledge_transfer })}
          disabled={update.isPending} className="pill-btn accent mt-3 !text-[10px] !py-2 !px-4 tracking-[0.2em] uppercase disabled:opacity-50">
          {update.isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Save transfer note"}
        </button>
      </Panel>
      <Toast msg={toast} onDone={() => setToast(null)} />
    </div>
  );
}