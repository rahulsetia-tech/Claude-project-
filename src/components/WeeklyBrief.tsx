"use client";

import { useEffect, useState } from "react";
import { load, save } from "@/lib/storage";
import type { Brief } from "@/lib/brief";
import { loadBudgets } from "@/lib/budgets";
import type { Transaction } from "@/lib/transactions";

const KEY = "pocket:last-brief";

const fmt = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

interface Props {
  transactions: Transaction[];
}

export default function WeeklyBrief({ transactions }: Props) {
  const [brief, setBrief] = useState<Brief | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setBrief(load<Brief | null>(KEY, null));
    setHydrated(true);
  }, []);

  async function generate() {
    setGenerating(true);
    setError(null);
    try {
      const budgets = loadBudgets();
      const res = await fetch("/api/brief", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ transactions, budgets }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const b = (await res.json()) as Brief;
      setBrief(b);
      save(KEY, b);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not generate brief.");
    } finally {
      setGenerating(false);
    }
  }

  if (!hydrated) return null;

  const noData = transactions.length === 0;

  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="flex items-center gap-2 text-base font-semibold text-zinc-900 dark:text-zinc-50">
            <span aria-hidden>📬</span>
            Weekly brief
          </h2>
          <p className="mt-0.5 text-sm text-zinc-500">
            {brief
              ? `Generated ${new Date(brief.generatedAt).toLocaleString("en-IN")} · ${brief.monthKey}`
              : "Top leaks, habit win, and one specific move for next week — written for a student, not a CFO."}
          </p>
        </div>
        <button
          onClick={generate}
          disabled={noData || generating}
          className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
        >
          {generating
            ? "Asking Claude…"
            : brief
              ? "Regenerate"
              : "Generate this week's brief"}
        </button>
      </div>

      {!brief && noData && (
        <p className="mt-4 text-sm text-zinc-500">
          Import a CSV first — the brief reads from your transactions.
        </p>
      )}

      {error && (
        <p className="mt-4 text-sm text-red-600 dark:text-red-400">
          Could not generate brief: {error}
        </p>
      )}

      {brief && (
        <div className="mt-5 grid gap-4 md:grid-cols-3">
          <section className="rounded-lg bg-zinc-50 p-4 dark:bg-zinc-950">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
              Top 3 leaks
            </h3>
            <ol className="mt-2 space-y-1 text-sm text-zinc-800 dark:text-zinc-200">
              {brief.topLeaks.length === 0 && (
                <li className="text-zinc-500">Nothing logged this cycle yet.</li>
              )}
              {brief.topLeaks.map((l, i) => (
                <li key={l.category} className="flex justify-between gap-2">
                  <span>
                    {i + 1}. {l.category}
                  </span>
                  <span className="tabular-nums text-zinc-500">
                    {fmt.format(l.amount)}
                  </span>
                </li>
              ))}
            </ol>
          </section>

          <section className="rounded-lg bg-emerald-50 p-4 dark:bg-emerald-950/40">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-emerald-700 dark:text-emerald-300">
              Habit win
            </h3>
            <p className="mt-2 text-sm text-zinc-800 dark:text-zinc-200">
              {brief.habitWin}
            </p>
          </section>

          <section className="rounded-lg bg-amber-50 p-4 dark:bg-amber-950/40">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-amber-700 dark:text-amber-300">
              Next week&apos;s move
            </h3>
            <p className="mt-2 text-sm text-zinc-800 dark:text-zinc-200">
              {brief.nextMove}
            </p>
          </section>
        </div>
      )}

      {brief && (
        <p className="mt-4 text-xs text-zinc-400">
          Source: {brief.source === "claude" ? "Claude API" : "local synthesis (no API key)"}
        </p>
      )}
    </div>
  );
}
