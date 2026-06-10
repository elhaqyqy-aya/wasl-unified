import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PageHeader, Panel, Stat } from "@/components/dashboard/Bits";
import { Modal, Toast } from "@/components/Modal";
import { FileText, Plus, Download, CheckCircle2, Clock } from "lucide-react";

export const Route = createFileRoute("/dashboard/rh/documents")({
  component: RHDocs,
});

const TEMPLATES = [
  "Salary certificate", "Leave request", "Remote-work attestation",
  "Internal transfer", "Loan attestation", "End-of-contract certificate",
];

const QUEUE = [
  { n: "Attestation · A. Benali", t: "AI-prefilled · awaiting RH validation", s: "pending" },
  { n: "Leave approval · O. El Idrissi", t: "Manager approved · ready to sign", s: "ready" },
  { n: "Mobility letter · Y. Bennani", t: "Generated · sent to collaborator", s: "done" },
  { n: "Loan attestation · K. Naciri", t: "AI-prefilled · awaiting RH validation", s: "pending" },
];

function RHDocs() {
  const [open, setOpen] = useState(false);
  const [tpl, setTpl] = useState(TEMPLATES[0]);
  const [emp, setEmp] = useState("");
  const [toast, setToast] = useState<string | null>(null);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setOpen(false);
    setToast(`${tpl} generated`);
    setEmp("");
  }

  return (
    <div className="space-y-5">
      <PageHeader kicker="Documents" title="Generation queue" subtitle="AI-assisted creation, validation and dispatch of every HR document."
        right={<button onClick={()=>setOpen(true)} className="pill-btn accent !text-[10px] !py-1.5 !px-3 tracking-[0.2em] uppercase"><Plus className="w-3.5 h-3.5"/> New document</button>} />

      <div className="grid grid-cols-3 gap-2">
        <Stat label="To validate" value="12" accent />
        <Stat label="Sent · 7d" value="143" delta="+12%" />
        <Stat label="Templates" value="18" />
      </div>

      <Panel label="QUEUE" title="Awaiting action">
        {QUEUE.map((d, i) => {
          const Icon = d.s === "done" ? CheckCircle2 : d.s === "ready" ? FileText : Clock;
          const color = d.s === "done" ? "text-success" : d.s === "ready" ? "text-accent" : "text-muted-foreground";
          return (
            <div key={i} className="flex items-center gap-3 py-3 border-b border-border last:border-0">
              <div className="w-10 h-10 rounded-lg bg-secondary grid place-items-center"><Icon className={`w-4 h-4 ${color}`} /></div>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-sm truncate">{d.n}</div>
                <div className="text-xs text-muted-foreground truncate">{d.t}</div>
              </div>
              <button onClick={() => setToast(d.s === "pending" ? "Validated" : "Downloaded")} className="pill-btn !text-[9px] !py-1.5 !px-3 tracking-[0.2em] uppercase">
                {d.s === "pending" ? "Validate" : <><Download className="w-3 h-3"/> PDF</>}
              </button>
            </div>
          );
        })}
      </Panel>

      <Panel label="TEMPLATES" title="Quick generate">
        <div className="grid grid-cols-1 gap-2">
          {TEMPLATES.map(t => (
            <button key={t} onClick={() => { setTpl(t); setOpen(true); }}
              className="flex items-center justify-between gap-2 px-3 py-2.5 rounded-xl border border-border bg-card hover:border-foreground transition text-sm text-left">
              <span className="inline-flex items-center gap-2"><FileText className="w-4 h-4 text-accent"/> {t}</span>
              <Plus className="w-4 h-4 text-muted-foreground" />
            </button>
          ))}
        </div>
      </Panel>

      <Modal open={open} onClose={() => setOpen(false)} kicker="GENERATE" title="New document"
        footer={
          <button form="doc-form" type="submit" className="pill-btn accent w-full justify-center !py-2.5 !text-[11px] tracking-[0.2em] uppercase">
            Generate with AI
          </button>
        }>
        <form id="doc-form" onSubmit={submit} className="space-y-3">
          <div>
            <div className="text-[10px] tracking-[0.22em] uppercase text-muted-foreground mb-2 font-bold">Template</div>
            <select value={tpl} onChange={e=>setTpl(e.target.value)} className="w-full px-3 py-2.5 rounded-xl border border-border bg-card text-sm focus:outline-none focus:border-foreground">
              {TEMPLATES.map(t => <option key={t}>{t}</option>)}
            </select>
          </div>
          <div className="field"><div className="relative">
            <input id="doc-emp" placeholder=" " value={emp} onChange={e=>setEmp(e.target.value)} required />
            <label htmlFor="doc-emp">Collaborator</label>
          </div></div>
          <div className="field"><div className="relative">
            <textarea id="doc-note" placeholder=" " rows={3} className="resize-none" />
            <label htmlFor="doc-note">Notes (optional)</label>
          </div></div>
          <div className="rounded-xl bg-secondary/60 border border-border p-3 text-[11px] text-muted-foreground leading-relaxed">
            AI will pre-fill the document from authorized records. Your validation is required before dispatch.
          </div>
        </form>
      </Modal>

      <Toast msg={toast} onDone={() => setToast(null)} />
    </div>
  );
}
