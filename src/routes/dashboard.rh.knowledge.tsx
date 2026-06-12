import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { PageHeader, Panel } from "@/components/dashboard/Bits";
import { Modal, Toast } from "@/components/Modal";
import { BookOpen, Plus, Loader2, Trash2 } from "lucide-react";
import { listKbArticles, upsertKbArticle, deleteKbArticle } from "@/lib/kb.functions";

export const Route = createFileRoute("/dashboard/rh/knowledge")({ component: KB });

function KB() {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [edit, setEdit] = useState<any | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const listFn = useServerFn(listKbArticles);
  const upsertFn = useServerFn(upsertKbArticle);
  const delFn = useServerFn(deleteKbArticle);
  const { data, isLoading } = useQuery({ queryKey: ["kb"], queryFn: () => listFn() });
  const upsert = useMutation({
    mutationFn: (input: any) => upsertFn({ data: input }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["kb"] }); setOpen(false); setEdit(null); setToast("Saved"); },
    onError: (e: any) => setToast(e?.message ?? "Failed"),
  });
  const del = useMutation({
    mutationFn: (id: string) => delFn({ data: { id } }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["kb"] }); setToast("Deleted"); },
  });

  const articles = data?.articles ?? [];

  function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    upsert.mutate({
      id: edit?.id,
      title: String(f.get("title")),
      category: String(f.get("category") || "policy"),
      tags: String(f.get("tags") || "").split(",").map((t) => t.trim()).filter(Boolean),
      content: String(f.get("content")),
      language: String(f.get("language") || "en"),
      audience: String(f.get("audience") || "all"),
      published: f.get("published") === "on",
    });
  }

  return (
    <div className="space-y-6">
      <PageHeader kicker="AI grounding" title="Knowledge base" subtitle="The validated content the AI assistant grounds its answers in."
        right={<button onClick={() => { setEdit(null); setOpen(true); }} className="pill-btn accent !text-[10px] !py-1.5 !px-3 tracking-[0.2em] uppercase"><Plus className="w-3.5 h-3.5" /> New article</button>} />

      <Panel title={`${articles.length} articles`}>
        {isLoading && <div className="text-xs text-muted-foreground py-4">Loading…</div>}
        {articles.map((a: any) => (
          <div key={a.id} className="flex items-start gap-3 py-3 border-b border-border last:border-0">
            <div className="w-10 h-10 rounded-lg bg-secondary grid place-items-center"><BookOpen className="w-4 h-4 text-accent" /></div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2"><span className="font-medium text-sm">{a.title}</span>
                {!a.published && <span className="text-[9px] uppercase tracking-[0.2em] text-muted-foreground border border-border rounded px-1.5 py-0.5">draft</span>}
              </div>
              <div className="text-xs text-muted-foreground mt-0.5">{a.category} · {(a.tags ?? []).join(", ")}</div>
              <div className="text-xs text-muted-foreground mt-1 line-clamp-2">{a.content}</div>
            </div>
            <button onClick={() => { setEdit(a); setOpen(true); }} className="pill-btn !text-[9px] !py-1 !px-2.5 tracking-[0.2em] uppercase">Edit</button>
            <button onClick={() => del.mutate(a.id)} className="w-8 h-8 grid place-items-center rounded-full hover:bg-destructive/10 text-destructive"><Trash2 className="w-3.5 h-3.5" /></button>
          </div>
        ))}
      </Panel>

      <Modal open={open} onClose={() => { setOpen(false); setEdit(null); }} kicker={edit ? "EDIT" : "NEW"} title={edit?.title ?? "Article"}>
        <form onSubmit={submit} className="space-y-3">
          <input name="title" defaultValue={edit?.title ?? ""} placeholder="Title" required maxLength={200} className="w-full px-3 py-2.5 rounded-xl border border-border bg-card text-sm" />
          <div className="grid grid-cols-2 gap-2">
            <input name="category" defaultValue={edit?.category ?? "policy"} placeholder="Category" className="px-3 py-2.5 rounded-xl border border-border bg-card text-sm" />
            <input name="language" defaultValue={edit?.language ?? "en"} placeholder="Language" className="px-3 py-2.5 rounded-xl border border-border bg-card text-sm" />
          </div>
          <input name="tags" defaultValue={(edit?.tags ?? []).join(", ")} placeholder="tags, comma separated" className="w-full px-3 py-2.5 rounded-xl border border-border bg-card text-sm" />
          <textarea name="content" defaultValue={edit?.content ?? ""} placeholder="Content the AI will ground on…" rows={8} required maxLength={20000} className="w-full px-3 py-2.5 rounded-xl border border-border bg-card text-sm" />
          <label className="flex items-center gap-2 text-xs"><input type="checkbox" name="published" defaultChecked={edit?.published ?? true} /> Published (used by AI assistant)</label>
          <button type="submit" disabled={upsert.isPending} className="pill-btn accent w-full justify-center !py-2.5 !text-[11px] tracking-[0.2em] uppercase disabled:opacity-50">
            {upsert.isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Save"}
          </button>
        </form>
      </Modal>
      <Toast msg={toast} onDone={() => setToast(null)} />
    </div>
  );
}