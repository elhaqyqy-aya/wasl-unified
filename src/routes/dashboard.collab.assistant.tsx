import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/dashboard/Bits";
import { Send, Sparkles, Loader2 } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/dashboard/collab/assistant")({
  component: Assistant,
});

const SUGGESTIONS: string[] = [
  "How many leave days do I have left?",
  "What's the remote-work policy?",
  "How do I request a salary certificate?",
  "Who do I contact for internal mobility?",
];

function Assistant() {
  const [input, setInput] = useState("");
  const endRef = useRef<HTMLDivElement>(null);

  const { messages, sendMessage, status, error } = useChat({
    transport: new DefaultChatTransport({
      api: "/api/chat",
      body: { role: "collab" },
      fetch: async (url, init) => {
        const { data } = await supabase.auth.getSession();
        const headers = new Headers(init?.headers);
        if (data.session?.access_token) {
          headers.set("authorization", `Bearer ${data.session.access_token}`);
        }
        return fetch(url, { ...init, headers });
      },
    }),
  });

  const isLoading = status === "submitted" || status === "streaming";

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, status]);

  function send(text: string) {
    if (!text.trim() || isLoading) return;
    void sendMessage({ text });
    setInput("");
  }

  return (
    <div className="space-y-6">
      <PageHeader kicker="AI HR" title="Your HR assistant" subtitle="Grounded in your validated company policies — escalates to humans on sensitive topics." />
      <div className="glow-card rounded-3xl p-6 flex flex-col h-[60vh]">
        <div className="flex-1 overflow-y-auto space-y-3 pr-2">
          {messages.length === 0 && (
            <div className="text-sm text-muted-foreground bg-secondary/40 rounded-2xl px-4 py-3">
              Hi — I'm your Wasl by Humanai assistant. Ask me anything about your HR; I'll answer from validated policies only and route sensitive requests to a human referent.
            </div>
          )}
          {messages.map((m) => {
            const text = m.parts
              .map((p) => (p.type === "text" ? p.text : ""))
              .join("");
            return (
              <div key={m.id} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
                <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm whitespace-pre-wrap ${
                  m.role === "user" ? "text-white" : "bg-secondary text-foreground"
                }`} style={m.role === "user" ? { background: "var(--grad-brand)" } : {}}>
                  {text || (m.role === "assistant" && isLoading ? "…" : "")}
                </div>
              </div>
            );
          })}
          {isLoading && messages[messages.length - 1]?.role === "user" && (
            <div className="flex justify-start">
              <div className="bg-secondary text-muted-foreground rounded-2xl px-4 py-2.5 text-sm inline-flex items-center gap-2">
                <Loader2 className="w-3.5 h-3.5 animate-spin" /> Thinking…
              </div>
            </div>
          )}
          {error && (
            <div className="text-xs text-destructive bg-destructive/10 rounded-xl px-3 py-2">
              {error.message || "Something went wrong. Please try again."}
            </div>
          )}
          <div ref={endRef} />
        </div>
        <div className="flex flex-wrap gap-2 my-3">
          {SUGGESTIONS.map((s) => (
            <button key={s} onClick={() => send(s)} disabled={isLoading} className="text-xs px-3 py-1.5 rounded-full bg-secondary hover:bg-accent hover:text-white transition disabled:opacity-50">
              <Sparkles className="w-3 h-3 inline mr-1" />{s}
            </button>
          ))}
        </div>
        <form onSubmit={(e) => { e.preventDefault(); send(input); }} className="flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask anything…"
            disabled={isLoading}
            className="flex-1 rounded-xl border border-border bg-secondary/40 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-accent transition"
          />
          <button type="submit" disabled={isLoading || !input.trim()} className="btn-primary !px-4 disabled:opacity-50">
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </button>
        </form>
      </div>
    </div>
  );
}
