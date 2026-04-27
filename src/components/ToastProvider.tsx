"use client";

import {
  createContext,
  useCallback,
  useContext,
  useState,
  type ReactNode,
} from "react";

type ToastKind = "success" | "error" | "info";

interface Toast {
  id: string;
  message: string;
  kind: ToastKind;
}

interface ToastContextType {
  show: (message: string, kind?: ToastKind) => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

const TOAST_TIMEOUT_MS = 3200;

function pillFor(kind: ToastKind): string {
  if (kind === "error") {
    return "border-red-200 bg-red-50/95 text-red-800 dark:border-red-800 dark:bg-red-950/90 dark:text-red-200";
  }
  if (kind === "info") {
    return "border-zinc-200 bg-white/95 text-zinc-800 dark:border-zinc-700 dark:bg-zinc-900/90 dark:text-zinc-200";
  }
  return "border-emerald-200 bg-emerald-50/95 text-emerald-900 dark:border-emerald-800 dark:bg-emerald-950/90 dark:text-emerald-100";
}

function iconFor(kind: ToastKind): string {
  if (kind === "error") return "✗";
  if (kind === "info") return "ℹ";
  return "✓";
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const show = useCallback((message: string, kind: ToastKind = "success") => {
    const id = `t-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    setToasts((prev) => [...prev, { id, message, kind }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, TOAST_TIMEOUT_MS);
  }, []);

  return (
    <ToastContext.Provider value={{ show }}>
      {children}
      <div className="pointer-events-none fixed bottom-4 right-4 z-[60] flex w-full max-w-xs flex-col gap-2">
        {toasts.map((t) => (
          <div
            key={t.id}
            role="status"
            className={`pointer-events-auto inline-flex items-start gap-2 rounded-lg border px-4 py-3 text-sm shadow-lg backdrop-blur transition-opacity ${pillFor(t.kind)}`}
          >
            <span aria-hidden className="mt-0.5 font-semibold">
              {iconFor(t.kind)}
            </span>
            <span>{t.message}</span>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextType {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    return { show: () => {} };
  }
  return ctx;
}
