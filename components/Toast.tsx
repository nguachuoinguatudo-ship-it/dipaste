"use client";

import { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import { CheckCircle2, XCircle, Info } from "lucide-react";

type ToastKind = "success" | "error" | "info";

interface Toast {
  id: number;
  kind: ToastKind;
  msg: string;
}

const Ctx = createContext<{ toast: (msg: string, kind?: ToastKind) => void }>({
  toast: () => {},
});

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<Toast[]>([]);

  const toast = useCallback((msg: string, kind: ToastKind = "success") => {
    const id = Date.now() + Math.random();
    setItems((p) => [...p, { id, kind, msg }]);
    setTimeout(() => setItems((p) => p.filter((t) => t.id !== id)), 3200);
  }, []);

  return (
    <Ctx.Provider value={{ toast }}>
      {children}
      <div className="pointer-events-none fixed bottom-5 left-1/2 z-[100] flex w-full max-w-sm -translate-x-1/2 flex-col items-center gap-2 px-4">
        {items.map((t) => (
          <div
            key={t.id}
            className={`toast-in pointer-events-auto flex w-full items-center gap-2.5 rounded-xl border px-4 py-3 text-sm font-medium shadow-2xl backdrop-blur-xl ${
              t.kind === "success"
                ? "border-green-500/30 bg-emerald-950/80 text-emerald-200"
                : t.kind === "error"
                  ? "border-rose-500/30 bg-rose-950/80 text-rose-200"
                  : "border-violet-500/30 bg-violet-950/80 text-violet-200"
            }`}
          >
            {t.kind === "success" ? (
              <CheckCircle2 size={18} className="shrink-0 text-emerald-400" />
            ) : t.kind === "error" ? (
              <XCircle size={18} className="shrink-0 text-rose-400" />
            ) : (
              <Info size={18} className="shrink-0 text-violet-400" />
            )}
            <span>{t.msg}</span>
          </div>
        ))}
      </div>
    </Ctx.Provider>
  );
}

export function useToast() {
  return useContext(Ctx);
}
