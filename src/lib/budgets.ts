import { load, save } from "./storage";
import type { Transaction } from "./transactions";

export interface Budget {
  category: string;
  limit: number;
}

const KEY = "pocket:budgets";

const DEFAULT_BUDGETS: Budget[] = [
  { category: "Eating Out", limit: 2000 },
  { category: "Mess", limit: 4000 },
  { category: "Hostel", limit: 8000 },
  { category: "Ride-share", limit: 1500 },
  { category: "Subscriptions", limit: 1000 },
  { category: "Phone/Internet", limit: 500 },
];

export function loadBudgets(): Budget[] {
  return load<Budget[]>(KEY, DEFAULT_BUDGETS);
}

export function saveBudgets(budgets: Budget[]): void {
  save(KEY, budgets);
}

export function currentMonthKey(now: Date = new Date()): string {
  const y = now.getFullYear();
  const m = `${now.getMonth() + 1}`.padStart(2, "0");
  return `${y}-${m}`;
}

export function daysLeftInMonth(now: Date = new Date()): number {
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  const ms = end.getTime() - now.getTime();
  return Math.max(0, Math.ceil(ms / (1000 * 60 * 60 * 24)));
}

export function toMonthKey(dateStr: string): string | null {
  const iso = dateStr.match(/^(\d{4})-(\d{2})-/);
  if (iso) return `${iso[1]}-${iso[2]}`;
  const dmy = dateStr.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})/);
  if (dmy) return `${dmy[3]}-${dmy[2].padStart(2, "0")}`;
  return null;
}

export function computeSpentByCategory(
  transactions: Transaction[],
  monthKey: string,
): Record<string, number> {
  const totals: Record<string, number> = {};
  for (const t of transactions) {
    const k = toMonthKey(t.date);
    if (k !== null && k !== monthKey) continue;
    totals[t.category] = (totals[t.category] ?? 0) + t.amount;
  }
  return totals;
}

export type BudgetStatus = "under" | "warning" | "over";

export function statusFor(spent: number, limit: number): BudgetStatus {
  if (limit <= 0) return "under";
  const pct = spent / limit;
  if (pct >= 1) return "over";
  if (pct >= 0.8) return "warning";
  return "under";
}
