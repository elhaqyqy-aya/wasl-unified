import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { PageHeader, Panel } from "@/components/dashboard/Bits";
import { Modal, Toast } from "@/components/Modal";
import { FileText, Download, Plus, Loader2 } from "lucide-react";
import { createDocument, listMyDocuments } from "@/lib/documents.functions";
import { openPrintablePdf } from "@/lib/pdf";

export const Route = createFileRoute("/dashboard/collab/documents")({
  component: Documents,
});

type Tpl = { label: string; type: "certificate" | "contract" | "policy" | "other"; body: (reason: string) => string };
const TEMPLATES: Tpl[] = [
  { label: "Salary certificate", type: "certificate", body: (r) => `This is to certify that {{name}}, holding the position of {{position}} in the {{department}} department since {{hire_date}}, is currently employed by the company as of {{today}}.\n\nReason: ${r || "Administrative use."}\n\nThis certificate is issued at the employee's request.` },
  { label: "Leave request", type: "other", body: (r) => `Requester: {{name}} ({{position}})\nDate: {{today}}\n\nI hereby request leave for the following reason:\n\n${r || "Personal time off."}\n\nThank you for your consideration.` },
  { label: "Remote-work request", type: "other", body: (r) => `Requester: {{name}} — {{position}}\nDate: {{today}}\n\nI request authorization to perform my duties remotely.\n\nMotivation: ${r || "Better focus and family balance."}` },
  { label: "Internal transfer", type: "other", body: (r) => `Requester: {{name}} — {{department}}\n\nI am formally requesting an internal mobility.\n\nReason: ${r || "Career development."}` },
  { label: "Loan attestation", type: "certificate", body: (r) => `This attestation confirms that {{name}}, employed as {{position}} since {{hire_date}}, has stable employment with the company for the purpose of a loan application.\n\nReason: ${r || "Personal loan."}` },
];

function Documents() {
  const [open, setOpen] = useState(false);
  const [tplIdx, setTplIdx] = useState(0);
  const [reason, setReason] = useState("");
  const [toast, setToast] = useState<string | null>(null);
  const qc = useQueryClient();

  const listFn = useServerFn(listMyDocuments);
  const createFn = useServerFn(createDocument);
  const { data, isLoading } = useQuery({ queryKey: ["my-docs"], queryFn: () => listFn() });
  const mutate = useMutation({
    mutationFn: (input: { title: string; type: any; body: string }) => createFn({ data: input }),
    onSuccess: ({ document }) => {
      qc.invalidateQueries({ queryKey: ["my-docs"] });
      setOpen(false);
      setReason("");
      if (document.status === "pending") {
        setToast(`${document.title} submitted — awaiting HR validation`);
      } else {
        setToast(`${document.title} generated`);
        openPrintablePdf({ title: document.title, kind: TEMPLATES[tplIdx].label, body: document.body ?? "", issuedAt: document.issued_at ?? undefined });
      }
    },
    onError: (e: any) => setToast(e?.message ?? "Failed to generate"),
  });

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const tpl = TEMPLATES[tplIdx];
    const title = `${tpl.label} · ${new Date().toLocaleDateString("en-GB", { month: "short", year: "numeric" })}`;
    mutate.mutate({ title, type: tpl.type, body: tpl.body(reason) });
  }

  const docs = data?.documents ?? [];

  return (
    <div className="space-y-6">
      <PageHeader kicker="Your space" title="Documents" subtitle="Generate, sign and store your HR documents — pre-filled and versioned."
        right={<button onClick={()=>setOpen(true)} className="pill-btn accent !text-[10px] !py-1.5 !px-3 tracking-[0.2em] uppercase"><Plus className="w-3.5 h-3.5"/> New</button>} />
      <Panel title="Templates available">
        {TEMPLATES.map((t, i) => (
          <div key={t.label} className="flex items-center justify-between py-2.5 border-b border-border last:border-0">
            <div className="flex items-center gap-2"><FileText className="w-4 h-4 text-accent" /><span className="text-sm">{t.label}</span></div>
            <button onClick={() => { setTplIdx(i); setOpen(true); }} className="pill-btn !text-[9px] !py-1 !px-2.5 tracking-[0.2em] uppercase">Generate</button>
          </div>
        ))}
      </Panel>
      <Panel title="Your documents">
        {isLoading && <div className="text-xs text-muted-foreground py-4">Loading…</div>}
        {!isLoading && docs.length === 0 && <div className="text-xs text-muted-foreground py-4">No documents yet. Generate one from a template above.</div>}
        {docs.map((d: any) => {
          const body = d.body ?? decodeBody(d.storage_path);
          const pending = d.status === "pending";
          const rejected = d.status === "rejected";
          return (
            <div key={d.id} className="flex items-center gap-3 py-3 border-b border-border last:border-0">
              <div className="w-10 h-10 rounded-lg bg-secondary grid place-items-center"><FileText className="w-4 h-4 text-accent" /></div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2"><span className="font-medium text-sm truncate">{d.title}</span>
                  {pending && <span className="text-[9px] uppercase tracking-[0.2em] px-1.5 py-0.5 rounded bg-warning/15 text-warning">pending</span>}
                  {rejected && <span className="text-[9px] uppercase tracking-[0.2em] px-1.5 py-0.5 rounded bg-destructive/15 text-destructive">rejected</span>}
                </div>
                <div className="text-xs text-muted-foreground capitalize">{d.type} · {new Date(d.created_at).toLocaleDateString()}</div>
                {rejected && d.rejection_reason && <div className="text-xs text-destructive mt-0.5">Reason: {d.rejection_reason}</div>}
              </div>
              <button disabled={pending || rejected} onClick={() => openPrintablePdf({ title: d.title, kind: d.type, body, issuedAt: d.issued_at })} className="pill-btn !text-[9px] !py-1.5 !px-2.5 tracking-[0.2em] uppercase disabled:opacity-40">
                <Download className="w-3 h-3"/> PDF
              </button>
            </div>
          );
        })}
      </Panel>

      <Modal open={open} onClose={() => setOpen(false)} kicker="GENERATE" title="New document"
        footer={
          <button form="cdoc-form" type="submit" disabled={mutate.isPending} className="pill-btn accent w-full justify-center !py-2.5 !text-[11px] tracking-[0.2em] uppercase disabled:opacity-50">
            {mutate.isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin"/> : "Generate & open PDF"}
          </button>
        }>
        <form id="cdoc-form" onSubmit={submit} className="space-y-3">
          <div>
            <div className="text-[10px] tracking-[0.22em] uppercase text-muted-foreground mb-2 font-bold">Template</div>
            <select value={tplIdx} onChange={e=>setTplIdx(Number(e.target.value))} className="w-full px-3 py-2.5 rounded-xl border border-border bg-card text-sm focus:outline-none focus:border-foreground">
              {TEMPLATES.map((t, i) => <option key={t.label} value={i}>{t.label}</option>)}
            </select>
          </div>
          <div className="field"><div className="relative">
            <textarea id="cdoc-reason" rows={3} placeholder=" " value={reason} onChange={e=>setReason(e.target.value)} className="resize-none" />
            <label htmlFor="cdoc-reason">Reason / details</label>
          </div></div>
          <div className="rounded-xl bg-secondary/60 border border-border p-3 text-[11px] text-muted-foreground leading-relaxed">
            We generate, save and open a printable PDF immediately. HR will be notified for validation.
          </div>
        </form>
      </Modal>

      <Toast msg={toast} onDone={() => setToast(null)} />
    </div>
  );
}

function decodeBody(path: string | null): string {
  if (!path?.startsWith("inline://")) return "";
  try { return decodeURIComponent(escape(atob(path.slice(9)))); } catch { return ""; }
}
