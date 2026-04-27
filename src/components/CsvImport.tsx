"use client";

import { useState, type ChangeEvent } from "react";
import { parseCsv } from "@/lib/csv";
import { categorize } from "@/lib/categorize";
import type { Transaction } from "@/lib/transactions";
import { useToast } from "./ToastProvider";

interface Props {
  onImport: (tx: Transaction[]) => void;
}

export default function CsvImport({ onImport }: Props) {
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [lastSummary, setLastSummary] = useState<string | null>(null);
  const toast = useToast();

  async function handleFile(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);
    setLastSummary(null);
    setPending(true);
    try {
      const text = await file.text();
      const rows = parseCsv(text);
      if (rows.length === 0) {
        throw new Error("No spending rows found in this CSV.");
      }
      const tx: Transaction[] = rows.map((r, i) => ({
        id: `${file.name}-${i}-${Date.now()}`,
        date: r.date,
        description: r.description,
        amount: r.amount,
        category: categorize(r.description),
      }));
      onImport(tx);
      setLastSummary(`${file.name} · ${tx.length} transactions imported`);
      toast.show(`Imported ${tx.length} transactions from ${file.name}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not parse CSV.");
      toast.show(
        err instanceof Error ? err.message : "Could not parse CSV.",
        "error",
      );
    } finally {
      setPending(false);
      e.target.value = "";
    }
  }

  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
      <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-50">Import a CSV</h2>
      <p className="mt-1 text-sm text-zinc-500">
        Upload a bank or UPI statement. We auto-categorise each transaction into
        student-friendly buckets (Mess, Hostel, Ride-share, Subscriptions, …).
      </p>
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-emerald-500 disabled:opacity-50">
          {pending ? "Reading…" : "Choose CSV file"}
          <input
            type="file"
            accept=".csv,text/csv"
            className="hidden"
            onChange={handleFile}
            disabled={pending}
          />
        </label>
        <a
          href="/sample.csv"
          download
          className="text-sm text-zinc-500 underline underline-offset-2 hover:text-zinc-800 dark:hover:text-zinc-300"
        >
          download sample CSV
        </a>
      </div>
      {lastSummary && (
        <p className="mt-3 text-sm text-emerald-600 dark:text-emerald-400">{lastSummary}</p>
      )}
      {error && (
        <p className="mt-3 text-sm text-red-600 dark:text-red-400">{error}</p>
      )}
    </div>
  );
}
