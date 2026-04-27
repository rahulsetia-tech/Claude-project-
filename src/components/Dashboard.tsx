"use client";

import { useEffect, useState } from "react";
import Budgets from "./Budgets";
import CategoryPie from "./CategoryPie";
import CsvImport from "./CsvImport";
import TotalSpentHero from "./TotalSpentHero";
import TransactionModal from "./TransactionModal";
import TransactionTable from "./TransactionTable";
import WeeklyBrief from "./WeeklyBrief";
import { categorize } from "@/lib/categorize";
import { parseCsv } from "@/lib/csv";
import {
  loadTransactions,
  saveTransactions,
  type Transaction,
} from "@/lib/transactions";
import { useToast } from "./ToastProvider";

type ModalState =
  | { kind: "closed" }
  | { kind: "new" }
  | { kind: "edit"; tx: Transaction };

export default function Dashboard() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [loadingSample, setLoadingSample] = useState(false);
  const [modal, setModal] = useState<ModalState>({ kind: "closed" });
  const toast = useToast();

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
    toast.show("All transactions cleared", "info");
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
      toast.show(`Loaded ${tx.length} sample transactions`);
    } catch (err) {
      console.error("loadSample failed", err);
      toast.show("Could not load sample data", "error");
    } finally {
      setLoadingSample(false);
    }
  }

  function handleSave(tx: Transaction) {
    setTransactions((prev) => {
      const exists = prev.some((p) => p.id === tx.id);
      const next = exists
        ? prev.map((p) => (p.id === tx.id ? tx : p))
        : [...prev, tx];
      saveTransactions(next);
      return next;
    });
    toast.show(modal.kind === "edit" ? "Transaction updated" : "Transaction added");
    setModal({ kind: "closed" });
  }

  function handleDelete(id: string) {
    setTransactions((prev) => {
      const next = prev.filter((p) => p.id !== id);
      saveTransactions(next);
      return next;
    });
    toast.show("Transaction deleted", "info");
    setModal({ kind: "closed" });
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
            Upload your own CSV above, try the bundled sample, or add a
            transaction manually.
          </p>
          <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={loadSample}
              disabled={loadingSample}
              className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-emerald-500 disabled:opacity-50"
            >
              {loadingSample ? "Loading…" : "Try with sample data →"}
            </button>
            <button
              onClick={() => setModal({ kind: "new" })}
              className="inline-flex items-center gap-2 rounded-lg border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-transparent dark:text-zinc-200 dark:hover:bg-zinc-800"
            >
              + Add manually
            </button>
          </div>
        </div>
      ) : (
        <>
          <TotalSpentHero transactions={transactions} />

          <WeeklyBrief transactions={transactions} />

          <div className="grid items-start gap-6 lg:grid-cols-2">
            <CategoryPie transactions={transactions} />
            <Budgets transactions={transactions} />
          </div>

          <div className="flex items-center justify-between">
            <h2 className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
              {transactions.length} transactions imported
            </h2>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setModal({ kind: "new" })}
                className="rounded-md border border-zinc-200 bg-white px-3 py-1 text-xs font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-transparent dark:text-zinc-200 dark:hover:bg-zinc-800"
              >
                + Add transaction
              </button>
              <button
                onClick={onClear}
                className="text-xs text-zinc-500 underline-offset-2 hover:text-red-600 hover:underline"
              >
                clear all
              </button>
            </div>
          </div>
          <TransactionTable
            transactions={transactions}
            onRowClick={(tx) => setModal({ kind: "edit", tx })}
          />
          <p className="text-xs text-zinc-400">
            Tip: click any row to edit or delete it.
          </p>
        </>
      )}

      {modal.kind !== "closed" && (
        <TransactionModal
          transaction={modal.kind === "edit" ? modal.tx : undefined}
          onSave={handleSave}
          onDelete={modal.kind === "edit" ? handleDelete : undefined}
          onClose={() => setModal({ kind: "closed" })}
        />
      )}
    </div>
  );
}
