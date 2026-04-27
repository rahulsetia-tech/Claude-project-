"use client";

import { useMemo } from "react";
import type { Transaction } from "@/lib/transactions";

interface Props {
  transactions: Transaction[];
  days?: number;
  className?: string;
}

function isoDateOnly(s: string): string | null {
  const iso = s.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (iso) return `${iso[1]}-${iso[2]}-${iso[3]}`;
  const dmy = s.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})/);
  if (dmy)
    return `${dmy[3]}-${dmy[2].padStart(2, "0")}-${dmy[1].padStart(2, "0")}`;
  return null;
}

function dayKey(d: Date): string {
  const y = d.getFullYear();
  const m = `${d.getMonth() + 1}`.padStart(2, "0");
  const day = `${d.getDate()}`.padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export default function Sparkline({ transactions, days = 30, className }: Props) {
  const series = useMemo(() => {
    const today = new Date();
    const keys: string[] = [];
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      keys.push(dayKey(d));
    }

    const totals: Record<string, number> = {};
    for (const t of transactions) {
      const k = isoDateOnly(t.date);
      if (!k) continue;
      totals[k] = (totals[k] ?? 0) + t.amount;
    }

    return keys.map((k) => totals[k] ?? 0);
  }, [transactions, days]);

  const max = Math.max(...series, 1);
  const W = 120;
  const H = 36;
  const stepX = series.length > 1 ? W / (series.length - 1) : 0;

  const linePoints = series
    .map((v, i) => {
      const x = i * stepX;
      const y = H - (v / max) * (H - 4) - 2;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");

  const areaPoints = `0,${H} ${linePoints} ${W},${H}`;

  const total = series.reduce((s, v) => s + v, 0);
  if (total === 0) {
    return (
      <span className={`text-xs text-zinc-400 ${className ?? ""}`}>
        no recent activity
      </span>
    );
  }

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className={`h-9 w-32 text-emerald-500 ${className ?? ""}`}
      preserveAspectRatio="none"
      aria-hidden
    >
      <polygon points={areaPoints} fill="currentColor" opacity={0.15} />
      <polyline
        points={linePoints}
        fill="none"
        stroke="currentColor"
        strokeWidth={1.5}
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
  );
}
