const EMBED_MODEL = "openai/text-embedding-3-small"; // 1536 dims

export async function embedText(text: string, apiKey: string): Promise<number[] | null> {
  try {
    const res = await fetch("https://ai.gateway.lovable.dev/v1/embeddings", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Lovable-API-Key": apiKey,
        "X-Lovable-AIG-SDK": "vercel-ai-sdk",
      },
      body: JSON.stringify({ model: EMBED_MODEL, input: text.slice(0, 8000) }),
    });
    if (!res.ok) {
      console.error("embed failed", res.status, await res.text().catch(() => ""));
      return null;
    }
    const j = await res.json();
    return (j?.data?.[0]?.embedding as number[]) ?? null;
  } catch (e) {
    console.error("embed error", e);
    return null;
  }
}

export function chunkText(text: string, size = 600, overlap = 80): string[] {
  const clean = text.replace(/\s+/g, " ").trim();
  if (clean.length <= size) return [clean];
  const out: string[] = [];
  let i = 0;
  while (i < clean.length) {
    out.push(clean.slice(i, i + size));
    i += size - overlap;
  }
  return out;
}