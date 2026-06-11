import { createFileRoute } from "@tanstack/react-router";
import { convertToModelMessages, streamText, type UIMessage } from "ai";
import { createLovableAiGatewayProvider } from "@/lib/ai-gateway.server";
import { createClient } from "@supabase/supabase-js";

const SYSTEM_PROMPTS: Record<string, string> = {
  collab: `You are Wasl, the AI HR assistant by Humanai for an employee (collaborator).
You answer questions about leave, payroll, remote-work policy, internal mobility, onboarding, and HR procedures.
Rules:
- Be concise, warm, and professional. Use the user's language (French or English).
- Ground answers in standard HR practice; if a topic requires personal data you don't have, say what info is needed and offer to escalate to a human HR referent.
- Refuse politely when a request is outside the collaborator scope (e.g. asking about another employee's salary, performance, or private data) and explain why.
- Never invent specific figures (leave balance, exact policy clauses). If asked, say you'll check the validated HR knowledge base and offer to open a request.
- Suggest one concrete next step at the end of substantive answers.`,
  manager: `You are Wasl, the AI HR copilot by Humanai for a team manager.
You help with team engagement, workload balancing, attrition risk, 1:1 prep, and people-decision reasoning.
Rules:
- Provide actionable, manager-level recommendations. Cite which signals matter (engagement score, absenteeism, workload).
- Never reveal data the manager would not normally see about peers or other teams.
- Be neutral and unbiased. Avoid recommendations that could constitute discrimination.`,
  rh: `You are Wasl, the AI HR copilot by Humanai for an HR specialist.
You help draft attestations, summarise policies, prepare onboarding/offboarding plans, classify tickets, and surface risk patterns.
Rules:
- Be precise. When drafting documents, use clean structure and clear French/English.
- Flag compliance concerns (GDPR, data minimisation) when relevant.`,
  admin: `You are Wasl, the AI assistant by Humanai for a platform administrator.
You help with role management, audit interpretation, security posture, and configuration.
Rules:
- Treat all logs as confidential. Summarise patterns, do not paste raw PII.
- Recommend least-privilege actions.`,
};

type ChatRequestBody = {
  messages?: unknown;
  role?: "collab" | "manager" | "rh" | "admin";
};

export const Route = createFileRoute("/api/chat")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const body = (await request.json()) as ChatRequestBody;
        const messages = body.messages;
        const role = body.role ?? "collab";
        if (!Array.isArray(messages)) {
          return new Response("Messages are required", { status: 400 });
        }

        const key = process.env.LOVABLE_API_KEY;
        if (!key) return new Response("Missing LOVABLE_API_KEY", { status: 500 });

        // Identify user from bearer (for audit) — optional, never block chat
        let userId: string | null = null;
        try {
          const auth = request.headers.get("authorization");
          if (auth?.startsWith("Bearer ")) {
            const token = auth.slice(7);
            const supa = createClient(
              process.env.SUPABASE_URL!,
              process.env.SUPABASE_PUBLISHABLE_KEY!,
              { auth: { persistSession: false } },
            );
            const { data } = await supa.auth.getUser(token);
            userId = data.user?.id ?? null;
          }
        } catch {
          /* ignore */
        }

        const gateway = createLovableAiGatewayProvider(key);
        const model = gateway("google/gemini-2.5-flash");

        const uiMessages = messages as UIMessage[];
        const lastUser = [...uiMessages].reverse().find((m) => m.role === "user");
        const lastUserText =
          lastUser?.parts
            ?.map((p) => (p.type === "text" ? p.text : ""))
            .join(" ")
            .slice(0, 2000) ?? "";

        // Detect suspicious patterns (privilege escalation, PII probing)
        const suspicious =
          /salary|salaire|payroll|paie|password|mot de passe|admin|service[_ ]role|api[_ ]?key|other employee|autre (collaborateur|employé)|jailbreak|ignore (previous|all) instructions|system prompt/i.test(
            lastUserText,
          );

        const result = streamText({
          model,
          system: SYSTEM_PROMPTS[role] ?? SYSTEM_PROMPTS.collab,
          messages: await convertToModelMessages(uiMessages),
          onFinish: async ({ text }) => {
            try {
              const admin = createClient(
                process.env.SUPABASE_URL!,
                process.env.SUPABASE_SERVICE_ROLE_KEY!,
                { auth: { persistSession: false } },
              );
              await admin.from("audit_logs").insert({
                actor_id: userId,
                action: suspicious ? "ai.chat.suspicious" : "ai.chat",
                entity: "assistant",
                entity_id: null,
                metadata: {
                  role,
                  prompt_preview: lastUserText.slice(0, 300),
                  reply_preview: text.slice(0, 300),
                  reply_length: text.length,
                  flagged: suspicious,
                },
              });
              if (suspicious) {
                await admin.from("alerts").insert({
                  title: "Suspicious AI assistant query",
                  description: lastUserText.slice(0, 280),
                  severity: "high",
                  target_id: userId,
                });
              }
            } catch (e) {
              console.error("audit log failed", e);
            }
          },
        });

        return result.toUIMessageStreamResponse({ originalMessages: uiMessages });
      },
    },
  },
});