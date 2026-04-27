"use client";

import { useEffect, useState } from "react";
import CsvImport from "./CsvImport";
import TransactionTable from "./TransactionTable";
import {
  loadTransactions,
  saveTransactions,
  type Transaction,
} from "@/lib/transactions";

export default function Dashboard() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [hydrated, setHydrated] = useState(false);

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

  return (
    <div className="space-y-6">
      <CsvImport onImport={onImport} />

      {!hydrated ? null : transactions.length === 0 ? (
        <div className="rounded-xl border border-dashed border-zinc-300 p-10 text-center text-zinc-500 dark:border-zinc-700">
          No transactions yet. Upload a CSV above to start.
        </div>
      ) : (
        <>
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
