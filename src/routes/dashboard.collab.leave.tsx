import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { PageHeader, Panel } from "@/components/dashboard/Bits";
import { Toast } from "@/components/Modal";
import { CalendarDays, Loader2, CheckCircle2, XCircle, Clock } from "lucide-react";
import { createLeaveRequest, listMyLeaves } from "@/lib/leave.functions";

export const Route = createFileRoute("/dashboard/collab/leave")({ component: LeavePage });

const TYPES = [
  { v: "vacation", l: "Vacation" },
  { v: "sick", l: "Sick leave" },
  { v: "remote", l: "Remote work" },
  { v: "unpaid", l: "Unpaid leave" },
  { v: "training", l: "Training" },
] as const;

function StatusBadge({ s }: { s: string }) {
  const map: Record<string, { c: string; I: any }> = {
    pending: { c: "bg-amber-100 text-amber-700", I: Clock },
    approved: { c: "bg-green-100 text-green-700", I: CheckCircle2 },
    rejected: { c: "bg-red-100 text-red-700", I: XCircle },
    cancelled: { c: "bg-gray-100 text-gray-600", I: XCircle },
  };
  const m = map[s] ?? map.pending; const I = m.I;
  return <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${m.c}`}><I className="w-3 h-3"/>{s}</span>;
}

function LeavePage() {
  const qc = useQueryClient();
  const [toast, setToast] = useState<string | null>(null);
  const [type, setType] = useState<typeof TYPES[number]["v"]>("vacation");
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [reason, setReason] = useState("");

  const listFn = useServerFn(listMyLeaves);
  const createFn = useServerFn(createLeaveRequest);
  const { data } = useQuery({ queryKey: ["my-leaves"], queryFn: () => listFn() });
  const submit = useMutation({
    mutationFn: () => createFn({ data: { type, start_date: start, end_date: end, reason: reason || undefined } }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["my-leaves"] });
      setToast("Leave request submitted — pending approval");
      setStart(""); setEnd(""); setReason("");
    },
    onError: (e: any) => setToast(e?.message ?? "Failed"),
  });

  return (
    <div className="space-y-6">
      <PageHeader kicker="Time off" title="Leave requests" subtitle="Submit a request — your manager or HR will review it." />
      <Panel title="New request">
        <div className="grid gap-3">
          <div>
            <label className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Type</label>
            <select value={type} onChange={(e) => setType(e.target.value as any)} className="mt-1 w-full rounded-xl border border-border bg-secondary/40 px-3 py-2 text-sm">
              {TYPES.map((t) => <option key={t.v} value={t.v}>{t.l}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">From</label>
              <input type="date" value={start} onChange={(e) => setStart(e.target.value)} className="mt-1 w-full rounded-xl border border-border bg-secondary/40 px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">To</label>
              <input type="date" value={end} onChange={(e) => setEnd(e.target.value)} className="mt-1 w-full rounded-xl border border-border bg-secondary/40 px-3 py-2 text-sm" />
            </div>
          </div>
          <div>
            <label className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Reason (optional)</label>
            <textarea rows={3} value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Family event, medical appointment, conference…" className="mt-1 w-full rounded-xl border border-border bg-secondary/40 px-3 py-2 text-sm" />
          </div>
          <button disabled={!start || !end || submit.isPending} onClick={() => submit.mutate()} className="pill-btn accent !text-[10px] !py-2.5 !px-4 tracking-[0.2em] uppercase self-start disabled:opacity-50">
            {submit.isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin"/> : <CalendarDays className="w-3.5 h-3.5"/>} Submit request
          </button>
        </div>
      </Panel>

      <Panel title="My requests">
        {(data?.items?.length ?? 0) === 0 ? (
          <p className="text-sm text-muted-foreground">No requests yet.</p>
        ) : (
          <div className="space-y-2">
            {data!.items.map((r: any) => (
              <div key={r.id} className="flex items-center justify-between border-b border-border/60 last:border-0 py-2">
                <div>
                  <div className="font-semibold text-sm capitalize">{r.type}</div>
                  <div className="text-xs text-muted-foreground">{r.start_date} → {r.end_date}</div>
                  {r.reason && <div className="text-xs text-muted-foreground italic mt-0.5">"{r.reason}"</div>}
                </div>
                <StatusBadge s={r.status} />
              </div>
            ))}
          </div>
        )}
      </Panel>
      <Toast msg={toast} onDone={() => setToast(null)} />
    </div>
  );
}