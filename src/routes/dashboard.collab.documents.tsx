import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PageHeader, Panel } from "@/components/dashboard/Bits";
import { Modal, Toast } from "@/components/Modal";
import { FileText, Download, Plus } from "lucide-react";

export const Route = createFileRoute("/dashboard/collab/documents")({
  component: Documents,
});

const DOCS = [
  { n: "Salary certificate · Nov 2025", t: "Certificate", d: "2 days ago" },
  { n: "Remote-work request · approved", t: "Request", d: "1 week ago" },
  { n: "Annual contract · 2025", t: "Contract", d: "Last year" },
  { n: "Onboarding kit", t: "Internal guide", d: "3 months ago" },
];

const TEMPLATES = ["Salary certificate","Leave request","Remote-work request","Internal transfer","Loan attestation"];

function Documents() {
  const [open, setOpen] = useState(false);
  const [tpl, setTpl] = useState(TEMPLATES[0]);
  const [reason, setReason] = useState("");
  const [toast, setToast] = useState<string | null>(null);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setOpen(false);
    setReason("");
    setToast("Request sent to HR");
  }

  return (
    <div className="space-y-6">
      <PageHeader kicker="Your space" title="Documents" subtitle="Generate, sign and store your HR documents — pre-filled and versioned."
        right={<button onClick={()=>setOpen(true)} className="pill-btn accent !text-[10px] !py-1.5 !px-3 tracking-[0.2em] uppercase"><Plus className="w-3.5 h-3.5"/> New</button>} />
      <Panel title="Templates available">
        {TEMPLATES.map((t) => (
          <div key={t} className="flex items-center justify-between py-2.5 border-b border-border last:border-0">
            <div className="flex items-center gap-2"><FileText className="w-4 h-4 text-accent" /><span className="text-sm">{t}</span></div>
            <button onClick={() => { setTpl(t); setOpen(true); }} className="pill-btn !text-[9px] !py-1 !px-2.5 tracking-[0.2em] uppercase">Generate</button>
          </div>
        ))}
      </Panel>
      <Panel title="Your documents">
        {DOCS.map((d, i) => (
          <div key={i} className="flex items-center gap-3 py-3 border-b border-border last:border-0">
            <div className="w-10 h-10 rounded-lg bg-secondary grid place-items-center"><FileText className="w-4 h-4 text-accent" /></div>
            <div className="flex-1 min-w-0">
              <div className="font-medium text-sm truncate">{d.n}</div>
              <div className="text-xs text-muted-foreground">{d.t} · {d.d}</div>
            </div>
            <button onClick={() => setToast("Downloaded")} className="pill-btn !text-[9px] !py-1.5 !px-2.5 tracking-[0.2em] uppercase"><Download className="w-3 h-3"/> PDF</button>
          </div>
        ))}
      </Panel>

      <Modal open={open} onClose={() => setOpen(false)} kicker="REQUEST" title="New document"
        footer={
          <button form="cdoc-form" type="submit" className="pill-btn accent w-full justify-center !py-2.5 !text-[11px] tracking-[0.2em] uppercase">
            Submit request
          </button>
        }>
        <form id="cdoc-form" onSubmit={submit} className="space-y-3">
          <div>
            <div className="text-[10px] tracking-[0.22em] uppercase text-muted-foreground mb-2 font-bold">Template</div>
            <select value={tpl} onChange={e=>setTpl(e.target.value)} className="w-full px-3 py-2.5 rounded-xl border border-border bg-card text-sm focus:outline-none focus:border-foreground">
              {TEMPLATES.map(t => <option key={t}>{t}</option>)}
            </select>
          </div>
          <div className="field"><div className="relative">
            <textarea id="cdoc-reason" rows={3} placeholder=" " value={reason} onChange={e=>setReason(e.target.value)} className="resize-none" />
            <label htmlFor="cdoc-reason">Reason / details</label>
          </div></div>
          <div className="rounded-xl bg-secondary/60 border border-border p-3 text-[11px] text-muted-foreground leading-relaxed">
            Your HR team will validate and send the signed document within 48h.
          </div>
        </form>
      </Modal>

      <Toast msg={toast} onDone={() => setToast(null)} />
    </div>
  );
}

