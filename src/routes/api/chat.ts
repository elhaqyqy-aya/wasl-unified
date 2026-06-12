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

const PII_PATTERNS: [RegExp, string][] = [
  [/\b[\w.+-]+@[\w-]+\.[\w.-]+\b/g, "[email]"],
  [/\b(?:\+?\d{1,3}[ -]?)?(?:\(?\d{2,4}\)?[ -]?){2,5}\d{2,4}\b/g, "[phone]"],
  [/\b\d{4,}\b/g, "[number]"],
];
function maskPii(text: string): string {
  let out = text;
  for (const [re, repl] of PII_PATTERNS) out = out.replace(re, repl);
  return out;
}

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
        let userProfile: { full_name: string; position: string | null; department: string | null } | null = null;
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
            if (userId) {
              const admin = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, { auth: { persistSession: false } });
              const { data: p } = await admin.from("profiles").select("full_name,position,department").eq("id", userId).maybeSingle();
              if (p) userProfile = p as any;
            }
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
          /\bpassword\b|mot de passe|service[_ ]role|api[_ ]?key|other employee|autre (collaborateur|employ[eé])|jailbreak|ignore (previous|all|the) instructions|system prompt|reveal (your )?prompt/i.test(
            lastUserText,
          );
        // Hard programmatic guard for collaborators asking about others
        const crossEmployeeProbe = role === "collab" && /\b(another|other|autre)\s+(employee|collaborateur|colleague|coll[eé]gue|person)\b|\b(his|her|son|sa) (salary|salaire|wage|bonus|prime)\b/i.test(lastUserText);

        // Knowledge base retrieval (lightweight keyword RAG)
        let kbContext = "";
        try {
          const admin = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, { auth: { persistSession: false } });
          const tokens = Array.from(new Set(lastUserText.toLowerCase().match(/[a-zàâçéèêëîïôûùüÿñæœ]{4,}/g) ?? [])).slice(0, 8);
          if (tokens.length) {
            const ors = tokens.map((t) => `title.ilike.%${t}%,content.ilike.%${t}%,tags.cs.{${t}}`).join(",");
            const { data: arts } = await admin
              .from("kb_articles")
              .select("title,category,content")
              .eq("published", true)
              .or(ors)
              .limit(4);
            if (arts && arts.length) {
              kbContext = "\n\nValidated HR knowledge base excerpts (use these as ground truth — cite the title in your answer):\n" +
                arts.map((a: any) => `### ${a.title} (${a.category})\n${a.content}`).join("\n\n");
            }
          }
        } catch (e) { console.error("kb fetch failed", e); }

        const profileCtx = userProfile
          ? `\n\nThe current user is ${userProfile.full_name}${userProfile.position ? `, ${userProfile.position}` : ""}${userProfile.department ? ` (${userProfile.department})` : ""}.`
          : "";
        const guard = crossEmployeeProbe
          ? "\n\nIMPORTANT: The user appears to ask about another employee's private data. Politely refuse, remind them of confidentiality, and suggest contacting HR."
          : "";
        const systemPrompt = (SYSTEM_PROMPTS[role] ?? SYSTEM_PROMPTS.collab) + profileCtx + kbContext + guard;

        const result = streamText({
          model,
          system: systemPrompt,
          messages: await convertToModelMessages(uiMessages),
          onFinish: async ({ text }) => {
            try {
              const admin = createClient(
                process.env.SUPABASE_URL!,
                process.env.SUPABASE_SERVICE_ROLE_KEY!,
                { auth: { persistSession: false } },
              );
              const maskedPrompt = maskPii(lastUserText).slice(0, 300);
              const maskedReply = maskPii(text).slice(0, 300);
              await admin.from("audit_logs").insert({
                actor_id: userId,
                action: suspicious ? "ai.chat.suspicious" : "ai.chat",
                entity: "assistant",
                entity_id: null,
                metadata: {
                  role,
                  prompt_preview: maskedPrompt,
                  reply_preview: maskedReply,
                  reply_length: text.length,
                  flagged: suspicious,
                  kb_hits: kbContext ? kbContext.split("###").length - 1 : 0,
                  cross_employee_probe: crossEmployeeProbe,
                },
              });
              if (suspicious || crossEmployeeProbe) {
                await admin.from("alerts").insert({
                  title: "Suspicious AI assistant query",
                  description: maskedPrompt,
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