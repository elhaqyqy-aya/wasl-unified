import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

type AiPlan = { weeks: { w: string; items: string[] }[] };

const FALLBACK: AiPlan = {
  weeks: [
    { w: "Week 1", items: ["Meet your team", "Setup laptop & accounts", "Read culture handbook", "1:1 with manager"] },
    { w: "Week 2", items: ["Shadow a senior colleague", "Complete security training", "Ship first deliverable"] },
    { w: "Week 3", items: ["Cross-team intro round", "Pick a buddy", "Mid-point review"] },
    { w: "Week 4", items: ["30-day feedback", "Set first OKRs", "Sign off onboarding"] },
  ],
};

export const generateMyOnboardingPlan = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<{ plan: AiPlan; source: "ai" | "fallback" }> => {
    const { data: prof } = await context.supabase
      .from("profiles")
      .select("full_name, position, department")
      .eq("id", context.userId)
      .maybeSingle();

    const key = process.env.LOVABLE_API_KEY;
    if (!key) return { plan: FALLBACK, source: "fallback" };

    const position = prof?.position ?? "new hire";
    const department = prof?.department ?? "the company";

    try {
      const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Lovable-API-Key": key,
          "X-Lovable-AIG-SDK": "vercel-ai-sdk",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages: [
            { role: "system", content: 'You design 4-week HR onboarding plans. Output STRICT JSON only, no prose. Schema: {"weeks":[{"w":"Week 1","items":["..."]}]}. Exactly 4 weeks, 3-4 items each. Items must be tailored, specific, actionable.' },
            { role: "user", content: `Build a 4-week onboarding plan for a new ${position} in ${department}. Keep items concise (max 8 words).` },
          ],
          response_format: { type: "json_object" },
        }),
      });
      if (!res.ok) return { plan: FALLBACK, source: "fallback" };
      const j = await res.json();
      const txt: string = j?.choices?.[0]?.message?.content ?? "";
      const parsed = JSON.parse(txt);
      if (Array.isArray(parsed?.weeks) && parsed.weeks.length === 4) {
        return { plan: parsed as AiPlan, source: "ai" };
      }
    } catch (e) { console.error("onboarding plan failed", e); }

    return { plan: FALLBACK, source: "fallback" };
  });