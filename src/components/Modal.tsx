import { ReactNode, useEffect } from "react";
import { X } from "lucide-react";

export function Modal({
  open,
  onClose,
  title,
  kicker,
  children,
  footer,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  kicker?: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  useEffect(() => {
    if (!open) return;
    const k = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", k);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", k);
    };
  }, [open, onClose]);
  if (!open) return null;
  return (
    <>
      <div onClick={onClose} className="fixed inset-0 z-[80] bg-foreground/45 animate-in fade-in duration-200" />
      <div className="fixed inset-0 z-[81] flex items-end sm:items-center justify-center px-3 py-6 pointer-events-none">
        <div className="pointer-events-auto w-full max-w-sm animate-in slide-in-from-bottom-4 fade-in duration-300">
          <div className="edunai-card relative overflow-hidden">
            <div className="px-5 pt-5 pb-3 border-b border-border flex items-start justify-between gap-3">
              <div>
                {kicker && <div className="bracket-tag mb-1">{kicker}</div>}
                <h3 className="font-display font-bold text-xl tracking-tight">{title}</h3>
              </div>
              <button onClick={onClose} className="w-8 h-8 grid place-items-center rounded-full hover:bg-muted transition shrink-0">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-5 max-h-[70vh] overflow-y-auto">{children}</div>
            {footer && <div className="px-5 py-4 border-t border-border bg-secondary/40">{footer}</div>}
          </div>
        </div>
      </div>
    </>
  );
}

export function Toast({ msg, onDone }: { msg: string | null; onDone: () => void }) {
  useEffect(() => {
    if (!msg) return;
    const t = setTimeout(onDone, 2400);
    return () => clearTimeout(t);
  }, [msg, onDone]);
  if (!msg) return null;
  return (
    <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[90] animate-in slide-in-from-bottom-2 fade-in duration-300">
      <div className="bg-foreground text-background px-4 py-2.5 rounded-full text-[11px] tracking-[0.2em] uppercase font-bold shadow-xl">
        {msg}
      </div>
    </div>
  );
}
