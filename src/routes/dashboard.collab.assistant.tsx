import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/dashboard/Bits";
import { Send, Sparkles } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/dashboard/collab/assistant")({
  component: Assistant,
});

type Msg = { from: "user" | "bot"; text: string };

const SUGGESTIONS = [
  "How many leave days do I have left?",
  "What's the remote-work policy?",
  "How do I request a salary certificate?",
  "Who do I contact for internal mobility?",
];

const REPLIES: Record<string,string> = {
  leave: "You currently have 12 paid-leave days available until 31 December. I can pre-fill a request — just tell me the dates.",
  remote: "Remote work is allowed up to 2 days per week, requiring manager approval at least 48h in advance. Full policy is in your documents library.",
  certificate: "I can generate a salary certificate for you right now. Should I send it to your work email or a personal one?",
  mobility: "Internal mobility is handled by Hind Alaoui (HR Business Partner). I can schedule a 30-min slot with her this week — would you like that?",
};

function reply(q: string) {
  const lower = q.toLowerCase();
  if (lower.includes("leave") || lower.includes("congé")) return REPLIES.leave;
  if (lower.includes("remote") || lower.includes("télé")) return REPLIES.remote;
  if (lower.includes("certificate") || lower.includes("attest")) return REPLIES.certificate;
  if (lower.includes("mobility") || lower.includes("mobilité")) return REPLIES.mobility;
  return "Good question — I'll check the validated HR knowledge base and route this to a human RH if needed. For now, here's what I found: this topic typically follows your collective agreement (chapter 4) and your team's internal guide.";
}

function Assistant() {
  const [msgs, setMsgs] = useState<Msg[]>([
    { from: "bot", text: "Hi  I'm your Wasl by Humanai assistant. Ask me anything about your HR — I'll answer from validated policies only." },
  ]);
  const [input, setInput] = useState("");

  function send(text: string) {
    if (!text.trim()) return;
    setMsgs((m) => [...m, { from: "user", text }]);
    setInput("");
    setTimeout(() => setMsgs((m) => [...m, { from: "bot", text: reply(text) }]), 600);
  }

  return (
    <div className="space-y-6">
      <PageHeader kicker="AI HR" title="Your HR assistant" subtitle="Grounded in your validated company policies — escalates to humans on sensitive topics." />
      <div className="glow-card rounded-3xl p-6 flex flex-col h-[60vh]">
        <div className="flex-1 overflow-y-auto space-y-3 pr-2">
          {msgs.map((m, i) => (
            <div key={i} className={`flex ${m.from === "user" ? "justify-end" : "justify-start"} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
              <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm ${
                m.from === "user" ? "text-white" : "bg-secondary text-foreground"
              }`} style={m.from === "user" ? { background: "var(--grad-brand)" } : {}}>
                {m.text}
              </div>
            </div>
          ))}
        </div>
        <div className="flex flex-wrap gap-2 my-3">
          {SUGGESTIONS.map((s) => (
            <button key={s} onClick={() => send(s)} className="text-xs px-3 py-1.5 rounded-full bg-secondary hover:bg-accent hover:text-white transition">
              <Sparkles className="w-3 h-3 inline mr-1" />{s}
            </button>
          ))}
        </div>
        <form onSubmit={(e) => { e.preventDefault(); send(input); }} className="flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask anything…"
            className="flex-1 rounded-xl border border-border bg-secondary/40 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-accent transition"
          />
          <button type="submit" className="btn-primary !px-4"><Send className="w-4 h-4" /></button>
        </form>
      </div>
    </div>
  );
}
