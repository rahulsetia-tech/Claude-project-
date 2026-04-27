"use client";

import type { Transaction } from "@/lib/transactions";

const CATEGORY_COLOURS: Record<string, string> = {
  "Eating Out": "bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-300",
  "Ride-share": "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300",
  Books: "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300",
  Subscriptions: "bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300",
  Mess: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300",
  Hostel: "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300",
  "Phone/Internet": "bg-cyan-100 text-cyan-800 dark:bg-cyan-950 dark:text-cyan-300",
  Bills: "bg-yellow-100 text-yellow-800 dark:bg-yellow-950 dark:text-yellow-300",
  Shopping: "bg-pink-100 text-pink-800 dark:bg-pink-950 dark:text-pink-300",
  Cash: "bg-zinc-200 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200",
  Other: "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300",
};

function pillClass(category: string): string {
  return CATEGORY_COLOURS[category] ?? CATEGORY_COLOURS.Other;
}

interface Props {
  transactions: Transaction[];
}

const fmtCurrency = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

export default function TransactionTable({ transactions }: Props) {
  const sorted = [...transactions].sort((a, b) => (a.date < b.date ? 1 : -1));
  const total = transactions.reduce((s, t) => s + t.amount, 0);

  return (
    <div className="overflow-x-auto rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
      <table className="min-w-full text-sm">
        <thead className="bg-zinc-50 text-xs uppercase tracking-wide text-zinc-500 dark:bg-zinc-950">
          <tr>
            <th className="px-4 py-3 text-left">Date</th>
            <th className="px-4 py-3 text-left">Description</th>
            <th className="px-4 py-3 text-left">Category</th>
            <th className="px-4 py-3 text-right">Amount</th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((t) => (
            <tr key={t.id} className="border-t border-zinc-100 dark:border-zinc-800">
              <td className="px-4 py-3 whitespace-nowrap text-zinc-600 dark:text-zinc-400">
                {t.date}
              </td>
              <td className="px-4 py-3 text-zinc-900 dark:text-zinc-100">{t.description}</td>
              <td className="px-4 py-3">
                <span
                  className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${pillClass(t.category)}`}
                >
                  {t.category}
                </span>
              </td>
              <td className="px-4 py-3 text-right tabular-nums text-zinc-900 dark:text-zinc-100">
                {fmtCurrency.format(t.amount)}
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot className="bg-zinc-50 text-sm font-semibold dark:bg-zinc-950">
          <tr>
            <td colSpan={3} className="px-4 py-3 text-right text-zinc-500">
              Total spend
            </td>
            <td className="px-4 py-3 text-right tabular-nums text-zinc-900 dark:text-zinc-100">
              {fmtCurrency.format(total)}
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}
