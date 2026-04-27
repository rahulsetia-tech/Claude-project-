"use client";

import { useEffect, useMemo, useState } from "react";
import {
  computeSpentByCategory,
  currentMonthKey,
  daysLeftInMonth,
  loadBudgets,
  saveBudgets,
  statusFor,
  type Budget,
  type BudgetStatus,
} from "@/lib/budgets";
import { iconFor, listCategories } from "@/lib/categorize";
import type { Transaction } from "@/lib/transactions";

const fmt = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

const STATUS_PILL: Record<BudgetStatus, string> = {
  under: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300",
  warning: "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300",
  over: "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300",
};

const STATUS_BAR: Record<BudgetStatus, string> = {
  under: "bg-emerald-500",
  warning: "bg-amber-500",
  over: "bg-red-500",
};

const STATUS_LABEL: Record<BudgetStatus, string> = {
  under: "On track",
  warning: "⚠ 80%+ used",
  over: "🚨 Over budget",
};

interface Props {
  transactions: Transaction[];
}

export default function Budgets({ transactions }: Props) {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [newCategory, setNewCategory] = useState<string>("");

  useEffect(() => {
    setBudgets(loadBudgets());
    setHydrated(true);
  }, []);

  const monthKey = currentMonthKey();
  const daysLeft = daysLeftInMonth();
  const spent = useMemo(
    () => computeSpentByCategory(transactions, monthKey),
    [transactions, monthKey],
  );

  function updateLimit(category: string, limit: number) {
    setBudgets((prev) => {
      const next = prev.map((b) => (b.category === category ? { ...b, limit } : b));
      saveBudgets(next);
      return next;
    });
  }

  function removeBudget(category: string) {
    setBudgets((prev) => {
      const next = prev.filter((b) => b.category !== category);
      saveBudgets(next);
      return next;
    });
  }

  function addBudget() {
    if (!newCategory) return;
    if (budgets.some((b) => b.category === newCategory)) {
      setNewCategory("");
      return;
    }
    setBudgets((prev) => {
      const next = [...prev, { category: newCategory, limit: 1000 }];
      saveBudgets(next);
      return next;
    });
    setNewCategory("");
  }

  if (!hydrated) return null;

  const remainingCategories = listCategories().filter(
    (c) => !budgets.some((b) => b.category === c),
  );

  const totalLimit = budgets.reduce((s, b) => s + b.limit, 0);
  const totalSpent = budgets.reduce((s, b) => s + (spent[b.category] ?? 0), 0);
  const overallStatus = statusFor(totalSpent, totalLimit);

  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-50">
            Budgets · {monthKey}
          </h2>
          <p className="mt-0.5 text-sm text-zinc-500">
            {daysLeft} day{daysLeft === 1 ? "" : "s"} left in this cycle ·{" "}
            <span className="font-medium text-zinc-700 dark:text-zinc-300">
              {fmt.format(totalSpent)}
            </span>{" "}
            / {fmt.format(totalLimit)} planned
          </p>
        </div>
        <span
          className={`inline-block rounded-full px-3 py-1 text-xs font-medium ${STATUS_PILL[overallStatus]}`}
        >
          {STATUS_LABEL[overallStatus]}
        </span>
      </div>

      <div className="mt-5 space-y-4">
        {budgets.length === 0 && (
          <p className="text-sm text-zinc-500">
            No budgets yet. Add one below to start tracking.
          </p>
        )}

        {budgets.map((b) => {
          const used = spent[b.category] ?? 0;
          const status = statusFor(used, b.limit);
          const pct = b.limit > 0 ? Math.min(100, (used / b.limit) * 100) : 0;
          return (
            <div key={b.category} className="space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 text-sm font-medium text-zinc-900 dark:text-zinc-100">
                    <span aria-hidden>{iconFor(b.category)}</span>
                    {b.category}
                  </span>
                  <span
                    className={`inline-block rounded-full px-2 py-0.5 text-[11px] font-medium ${STATUS_PILL[status]}`}
                  >
                    {STATUS_LABEL[status]}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400">
                  <span className="tabular-nums">{fmt.format(used)}</span>
                  <span className="text-zinc-400">/</span>
                  <label className="flex items-center gap-1">
                    <span className="text-xs text-zinc-500">₹</span>
                    <input
                      type="number"
                      min={0}
                      step={100}
                      value={b.limit}
                      onChange={(e) => updateLimit(b.category, Number(e.target.value) || 0)}
                      className="w-20 rounded-md border border-zinc-200 bg-zinc-50 px-2 py-0.5 text-right text-sm tabular-nums dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100"
                    />
                  </label>
                  <button
                    onClick={() => removeBudget(b.category)}
                    aria-label={`Remove ${b.category} budget`}
                    className="text-xs text-zinc-400 hover:text-red-500"
                  >
                    ✕
                  </button>
                </div>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
                <div
                  className={`h-full ${STATUS_BAR[status]} transition-[width]`}
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {remainingCategories.length > 0 && (
        <div className="mt-5 flex flex-wrap items-center gap-2 border-t border-zinc-100 pt-4 dark:border-zinc-800">
          <select
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
            className="rounded-md border border-zinc-200 bg-white px-2 py-1 text-sm dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
          >
            <option value="">Add category…</option>
            {remainingCategories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <button
            onClick={addBudget}
            disabled={!newCategory}
            className="rounded-md bg-emerald-600 px-3 py-1 text-sm font-medium text-white hover:bg-emerald-500 disabled:opacity-50"
          >
            Add
          </button>
        </div>
      )}
    </div>
  );
}
