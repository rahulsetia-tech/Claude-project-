"use client";

import { useState, type ChangeEvent } from "react";
import { categorize } from "@/lib/categorize";
import type { Transaction } from "@/lib/transactions";
import { useToast } from "./ToastProvider";

interface Props {
  onImport: (tx: Transaction[]) => void;
}

interface ExtractResponse {
  transactions?: Array<{
    date: string | null;
    description: string;
    amount: number;
  }>;
  error?: string;
}

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

export default function ImageImport({ onImport }: Props) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastSummary, setLastSummary] = useState<string | null>(null);
  const toast = useToast();

  async function handleFile(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    setLastSummary(null);
    setPending(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/extract-transactions", {
        method: "POST",
        body: formData,
      });

      const data = (await res.json()) as ExtractResponse;

      if (!res.ok) {
        throw new Error(data.error || `HTTP ${res.status}`);
      }

      const extracted = data.transactions ?? [];
      const tx: Transaction[] = extracted
        .filter((t) => t.amount > 0 && t.description.trim().length > 0)
        .map((t, i) => ({
          id: `image-${Date.now()}-${i}`,
          date: t.date ?? todayIso(),
          description: t.description.trim(),
          amount: t.amount,
          category: categorize(t.description),
        }));

      if (tx.length === 0) {
        throw new Error("No outgoing transactions found in that file.");
      }

      onImport(tx);
      setLastSummary(`${file.name} · ${tx.length} transactions extracted`);
      toast.show(`Extracted ${tx.length} transactions from ${file.name}`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Extraction failed.";
      setError(msg);
      toast.show(msg, "error");
    } finally {
      setPending(false);
      e.target.value = "";
    }
  }

  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
      <h2 className="flex items-center gap-2 text-base font-semibold text-zinc-900 dark:text-zinc-50">
        <span aria-hidden>📸</span>
        Upload a screenshot or PDF
      </h2>
      <p className="mt-1 text-sm text-zinc-500">
        Drop in a UPI app screenshot, a bank statement, or a paper-receipt
        photo. Claude reads the image and pulls out every outgoing transaction.
      </p>
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-emerald-500 aria-disabled:opacity-50">
          {pending ? "Asking Claude…" : "Choose image or PDF"}
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif,application/pdf"
            className="hidden"
            onChange={handleFile}
            disabled={pending}
          />
        </label>
        <span className="text-xs text-zinc-400">
          PNG · JPG · WebP · PDF · max 5 MB · needs an Anthropic API key
        </span>
      </div>
      {lastSummary && (
        <p className="mt-3 text-sm text-emerald-600 dark:text-emerald-400">
          {lastSummary}
        </p>
      )}
      {error && (
        <p className="mt-3 text-sm text-red-600 dark:text-red-400">{error}</p>
      )}
    </div>
  );
}
