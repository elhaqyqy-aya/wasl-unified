import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { PageHeader, Panel } from "@/components/dashboard/Bits";
import { Toast } from "@/components/Modal";
import { Fingerprint, LogIn, LogOut, AlertTriangle, Loader2 } from "lucide-react";
import { checkInOut, listMyPresence } from "@/lib/presence.functions";

export const Route = createFileRoute("/dashboard/collab/presence")({ component: PresencePage });

function fmt(d?: string | null) { if (!d) return "—"; return new Date(d).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }); }
function hours(a?: string | null, b?: string | null) {
  if (!a || !b) return "—"; const h = (new Date(b).getTime() - new Date(a).getTime()) / 3600000;
  return `${h.toFixed(1)} h`;
}

function PresencePage() {
  const qc = useQueryClient();
  const [toast, setToast] = useState<string | null>(null);
  const listFn = useServerFn(listMyPresence);
  const actFn = useServerFn(checkInOut);
  const { data } = useQuery({ queryKey: ["my-presence"], queryFn: () => listFn() });
  const today = new Date().toISOString().slice(0, 10);
  const todayRow = data?.items?.find((r: any) => r.day === today);

  const act = useMutation({
    mutationFn: (action: "in" | "out") => actFn({ data: { action } }),
    onSuccess: (_, action) => { qc.invalidateQueries({ queryKey: ["my-presence"] }); setToast(action === "in" ? "Checked in" : "Checked out"); },
    onError: (e: any) => setToast(e?.message ?? "Failed"),
  });

  return (
    <div className="space-y-6">
      <PageHeader kicker="Biometric link" title="Presence" subtitle="Synced with the on-site biometric gate · web check-in available for remote days." />
      <Panel title={`Today · ${today}`}>
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl grid place-items-center text-white" style={{ background: "var(--accent)" }}>
            <Fingerprint className="w-7 h-7" />
          </div>
          <div className="flex-1">
            <div className="text-xs text-muted-foreground">Check-in</div>
            <div className="font-bold text-lg">{fmt(todayRow?.check_in)}</div>
          </div>
          <div className="flex-1">
            <div className="text-xs text-muted-foreground">Check-out</div>
            <div className="font-bold text-lg">{fmt(todayRow?.check_out)}</div>
          </div>
        </div>
        <div className="mt-4 flex gap-2">
          <button disabled={act.isPending || !!todayRow?.check_in} onClick={() => act.mutate("in")} className="pill-btn accent flex-1 justify-center !text-[10px] !py-2.5 tracking-[0.2em] uppercase disabled:opacity-40">
            {act.isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin"/> : <LogIn className="w-3.5 h-3.5"/>} Check in
          </button>
          <button disabled={act.isPending || !todayRow?.check_in || !!todayRow?.check_out} onClick={() => act.mutate("out")} className="pill-btn flex-1 justify-center !text-[10px] !py-2.5 tracking-[0.2em] uppercase disabled:opacity-40">
            <LogOut className="w-3.5 h-3.5"/> Check out
          </button>
        </div>
      </Panel>
      <Panel title="Last 30 days">
        {(data?.items?.length ?? 0) === 0 ? <p className="text-sm text-muted-foreground">No records yet.</p> : (
          <div className="divide-y divide-border/60">
            {data!.items.map((r: any) => (
              <div key={r.id} className="flex items-center justify-between py-2 text-sm">
                <div className="w-24 font-mono text-xs">{r.day}</div>
                <div className="w-16 text-xs">{fmt(r.check_in)}</div>
                <div className="w-16 text-xs">{fmt(r.check_out)}</div>
                <div className="w-16 text-xs text-muted-foreground">{hours(r.check_in, r.check_out)}</div>
                <div className="w-24 text-right">
                  {r.anomaly && <span className="inline-flex items-center gap-1 text-amber-600 text-[10px] uppercase tracking-wider"><AlertTriangle className="w-3 h-3"/>{r.anomaly.replace("_", " ")}</span>}
                </div>
              </div>
            ))}
          </div>
        )}
      </Panel>
      <Toast msg={toast} onDone={() => setToast(null)} />
    </div>
  );
}