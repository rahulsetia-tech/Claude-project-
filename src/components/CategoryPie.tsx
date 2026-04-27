"use client";

import { useMemo } from "react";
import { iconFor } from "@/lib/categorize";
import {
  computeSpentByCategory,
  currentMonthKey,
} from "@/lib/budgets";
import type { Transaction } from "@/lib/transactions";

const CATEGORY_FILL: Record<string, string> = {
  "Eating Out": "#f97316",
  "Ride-share": "#3b82f6",
  Books: "#f59e0b",
  Subscriptions: "#a855f7",
  Mess: "#10b981",
  Hostel: "#f43f5e",
  "Phone/Internet": "#06b6d4",
  Bills: "#eab308",
  Shopping: "#ec4899",
  Cash: "#71717a",
  Other: "#a1a1aa",
};

function fillFor(category: string): string {
  return CATEGORY_FILL[category] ?? CATEGORY_FILL.Other;
}

interface Props {
  transactions: Transaction[];
}

export default function CategoryPie({ transactions }: Props) {
  const monthKey = currentMonthKey();

  const slices = useMemo(() => {
    const spent = computeSpentByCategory(transactions, monthKey);
    return Object.entries(spent)
      .map(([category, amount]) => ({ category, amount }))
      .filter((s) => s.amount > 0)
      .sort((a, b) => b.amount - a.amount);
  }, [transactions, monthKey]);

  const total = slices.reduce((s, x) => s + x.amount, 0);

  if (total === 0 || slices.length === 0) {
    return (
      <div className="flex h-full items-center justify-center rounded-xl border border-zinc-200 bg-white p-6 text-center text-sm text-zinc-500 dark:border-zinc-800 dark:bg-zinc-900">
        No spending in {monthKey} yet — once data lands, the breakdown will
        show up here.
      </div>
    );
  }

  const RADIUS = 40;
  const STROKE = 18;
  const SIZE = 100;
  const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

  let cumulative = 0;
  const arcs = slices.map((s) => {
    const fraction = s.amount / total;
    const arcLen = fraction * CIRCUMFERENCE;
    const offset = -cumulative * CIRCUMFERENCE;
    cumulative += fraction;
    return { ...s, arcLen, offset, fraction };
  });

  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
      <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-50">
        Where the money goes
      </h2>
      <p className="mt-0.5 text-sm text-zinc-500">
        Share of cycle spend, by category.
      </p>

      <div className="mt-5 flex flex-col items-center gap-6 sm:flex-row sm:items-center">
        <svg
          viewBox={`0 0 ${SIZE} ${SIZE}`}
          className="h-44 w-44 flex-shrink-0"
          aria-label="Spending breakdown by category"
        >
          {arcs.map((a) => (
            <circle
              key={a.category}
              cx={SIZE / 2}
              cy={SIZE / 2}
              r={RADIUS}
              fill="none"
              stroke={fillFor(a.category)}
              strokeWidth={STROKE}
              strokeDasharray={`${a.arcLen} ${CIRCUMFERENCE - a.arcLen}`}
              strokeDashoffset={a.offset}
              transform={`rotate(-90 ${SIZE / 2} ${SIZE / 2})`}
            />
          ))}
        </svg>

        <ul className="w-full space-y-1.5 text-sm">
          {arcs.map((a) => {
            const pct = a.fraction * 100;
            return (
              <li key={a.category} className="flex items-center gap-2">
                <span
                  className="inline-block h-3 w-3 rounded-sm"
                  style={{ backgroundColor: fillFor(a.category) }}
                  aria-hidden
                />
                <span className="inline-flex items-center gap-1 text-zinc-700 dark:text-zinc-300">
                  <span aria-hidden>{iconFor(a.category)}</span>
                  {a.category}
                </span>
                <span className="ml-auto tabular-nums text-zinc-500">
                  {pct.toFixed(0)}%
                </span>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
