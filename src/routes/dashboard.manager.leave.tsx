import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { PageHeader, Panel } from "@/components/dashboard/Bits";
import { Toast } from "@/components/Modal";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { listLeavesForReview, decideLeave } from "@/lib/leave.functions";

export const Route = createFileRoute("/dashboard/manager/leave")({ component: Review });

function Review() {
  const qc = useQueryClient();
  const [toast, setToast] = useState<string | null>(null);
  const listFn = useServerFn(listLeavesForReview);
  const decideFn = useServerFn(decideLeave);
  const { data } = useQuery({ queryKey: ["leaves-review"], queryFn: () => listFn() });

  const act = useMutation({
    mutationFn: (v: { id: string; decision: "approved" | "rejected" }) => decideFn({ data: v }),
    onSuccess: (_, v) => { qc.invalidateQueries({ queryKey: ["leaves-review"] }); setToast(`Request ${v.decision}`); },
    onError: (e: any) => setToast(e?.message ?? "Failed"),
  });

  const items = (data?.items ?? []) as any[];
  const pending = items.filter((r) => r.status === "pending");
  const decided = items.filter((r) => r.status !== "pending").slice(0, 20);

  return (
    <div className="space-y-6">
      <PageHeader kicker="Approvals" title="Leave review" subtitle={`${pending.length} pending request${pending.length === 1 ? "" : "s"}`} />
      <Panel title="Pending">
        {pending.length === 0 ? <p className="text-sm text-muted-foreground">All caught up.</p> : (
          <div className="space-y-2">
            {pending.map((r) => (
              <div key={r.id} className="border border-border/70 rounded-xl p-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="font-semibold text-sm truncate">{r.employee?.full_name ?? "Employee"}</div>
                    <div className="text-xs text-muted-foreground">{r.employee?.position} · {r.employee?.department}</div>
                    <div className="text-xs mt-1 capitalize"><b>{r.type}</b> · {r.start_date} → {r.end_date}</div>
                    {r.reason && <div className="text-xs italic text-muted-foreground mt-1">"{r.reason}"</div>}
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <button disabled={act.isPending} onClick={() => act.mutate({ id: r.id, decision: "approved" })} className="pill-btn accent !text-[9px] !py-1.5 !px-2.5 tracking-[0.2em] uppercase disabled:opacity-50">
                      {act.isPending ? <Loader2 className="w-3 h-3 animate-spin"/> : <CheckCircle2 className="w-3 h-3"/>} OK
                    </button>
                    <button disabled={act.isPending} onClick={() => act.mutate({ id: r.id, decision: "rejected" })} className="pill-btn !text-[9px] !py-1.5 !px-2.5 tracking-[0.2em] uppercase disabled:opacity-50">
                      <XCircle className="w-3 h-3"/> No
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Panel>
      <Panel title="Recently decided">
        {decided.length === 0 ? <p className="text-sm text-muted-foreground">No history.</p> : (
          <div className="divide-y divide-border/60">
            {decided.map((r) => (
              <div key={r.id} className="flex items-center justify-between py-2 text-sm">
                <div>
                  <div className="font-semibold">{r.employee?.full_name}</div>
                  <div className="text-xs text-muted-foreground capitalize">{r.type} · {r.start_date} → {r.end_date}</div>
                </div>
                <span className={`text-[10px] font-bold uppercase tracking-wider ${r.status === "approved" ? "text-green-600" : "text-red-600"}`}>{r.status}</span>
              </div>
            ))}
          </div>
        )}
      </Panel>
      <Toast msg={toast} onDone={() => setToast(null)} />
    </div>
  );
}