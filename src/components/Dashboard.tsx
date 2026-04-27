"use client";

import { useEffect, useState } from "react";
import Budgets from "./Budgets";
import CsvImport from "./CsvImport";
import TotalSpentHero from "./TotalSpentHero";
import TransactionTable from "./TransactionTable";
import WeeklyBrief from "./WeeklyBrief";
import { categorize } from "@/lib/categorize";
import { parseCsv } from "@/lib/csv";
import {
  loadTransactions,
  saveTransactions,
  type Transaction,
} from "@/lib/transactions";

export default function Dashboard() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [loadingSample, setLoadingSample] = useState(false);

  useEffect(() => {
    setTransactions(loadTransactions());
    setHydrated(true);
  }, []);

  function onImport(newTx: Transaction[]) {
    setTransactions((prev) => {
      const next = [...prev, ...newTx];
      saveTransactions(next);
      return next;
    });
  }

  function onClear() {
    if (typeof window !== "undefined" && !window.confirm("Clear all transactions?")) {
      return;
    }
    setTransactions([]);
    saveTransactions([]);
  }

  async function loadSample() {
    setLoadingSample(true);
    try {
      const res = await fetch("/sample.csv");
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const text = await res.text();
      const rows = parseCsv(text);
      const tx: Transaction[] = rows.map((r, i) => ({
        id: `sample-${i}-${Date.now()}`,
        date: r.date,
        description: r.description,
        amount: r.amount,
        category: categorize(r.description),
      }));
      onImport(tx);
    } catch (err) {
      console.error("loadSample failed", err);
    } finally {
      setLoadingSample(false);
    }
  }

  return (
    <div className="space-y-6">
      <CsvImport onImport={onImport} />

      {!hydrated ? null : transactions.length === 0 ? (
        <div className="rounded-xl border border-dashed border-zinc-300 p-10 text-center dark:border-zinc-700">
          <p className="text-3xl" aria-hidden>
            🪙
          </p>
          <p className="mt-3 text-sm font-medium text-zinc-700 dark:text-zinc-300">
            No spend logged yet.
          </p>
          <p className="mt-1 text-sm text-zinc-500">
            Upload your own CSV above, or try the bundled sample to see the
            budgets and weekly brief in action.
          </p>
          <button
            onClick={loadSample}
            disabled={loadingSample}
            className="mt-4 inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-emerald-500 disabled:opacity-50"
          >
            {loadingSample ? "Loading…" : "Try with sample data →"}
          </button>
        </div>
      ) : (
        <>
          <TotalSpentHero transactions={transactions} />

          <WeeklyBrief transactions={transactions} />

          <Budgets transactions={transactions} />

          <div className="flex items-center justify-between">
            <h2 className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
              {transactions.length} transactions imported
            </h2>
            <button
              onClick={onClear}
              className="text-xs text-zinc-500 underline-offset-2 hover:text-red-600 hover:underline"
            >
              clear all
            </button>
          </div>
          <TransactionTable transactions={transactions} />
        </>
      )}
    </div>
  );
}
