"use client";

import { useEffect, useState } from "react";
import {
  computeSpentByCategory,
  currentMonthKey,
  daysLeftInMonth,
  loadBudgets,
  statusFor,
  type Budget,
  type BudgetStatus,
} from "@/lib/budgets";
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

const STATUS_LABEL: Record<BudgetStatus, string> = {
  under: "On track",
  warning: "⚠ 80%+ used",
  over: "🚨 Over budget",
};

interface Props {
  transactions: Transaction[];
}

export default function TotalSpentHero({ transactions }: Props) {
  const [budgets, setBudgets] = useState<Budget[] | null>(null);

  useEffect(() => {
    setBudgets(loadBudgets());
  }, [transactions]);

  if (!budgets) return null;

  const monthKey = currentMonthKey();
  const spent = computeSpentByCategory(transactions, monthKey);
  const totalSpent = budgets.reduce((s, b) => s + (spent[b.category] ?? 0), 0);
  const totalLimit = budgets.reduce((s, b) => s + b.limit, 0);
  const daysLeft = daysLeftInMonth();
  const status = statusFor(totalSpent, totalLimit);
  const delta = totalLimit - totalSpent;
  const pct = totalLimit > 0 ? Math.min(100, (totalSpent / totalLimit) * 100) : 0;

  return (
    <div className="rounded-2xl border border-emerald-100 bg-gradient-to-br from-emerald-50 via-white to-white p-6 shadow-sm dark:border-emerald-900/40 dark:from-emerald-950/40 dark:via-zinc-900 dark:to-zinc-900">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700 dark:text-emerald-400">
            Spent this cycle · {monthKey}
          </p>
          <p className="mt-1 text-4xl font-semibold tabular-nums text-zinc-900 dark:text-zinc-50">
            {fmt.format(totalSpent)}
          </p>
          <p className="mt-1 text-sm text-zinc-500">
            of {fmt.format(totalLimit)} planned · {daysLeft} day
            {daysLeft === 1 ? "" : "s"} left
          </p>
        </div>
        <div className="text-right">
          <span
            className={`inline-block rounded-full px-3 py-1 text-xs font-medium ${STATUS_PILL[status]}`}
          >
            {STATUS_LABEL[status]}
          </span>
          <p className="mt-2 text-sm tabular-nums text-zinc-500">
            {delta >= 0
              ? `${fmt.format(delta)} under`
              : `${fmt.format(-delta)} over`}
          </p>
        </div>
      </div>

      <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
        <div
          className={`h-full transition-[width] duration-500 ${
            status === "over"
              ? "bg-red-500"
              : status === "warning"
                ? "bg-amber-500"
                : "bg-emerald-500"
          }`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
