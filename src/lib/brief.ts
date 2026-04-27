import {
  computeSpentByCategory,
  currentMonthKey,
  statusFor,
  type Budget,
} from "./budgets";
import type { Transaction } from "./transactions";

export interface BriefLeak {
  category: string;
  amount: number;
}

export interface Brief {
  generatedAt: string;
  monthKey: string;
  topLeaks: BriefLeak[];
  habitWin: string;
  nextMove: string;
  source: "local" | "claude";
}

const fmt = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

export function synthesiseBrief(
  transactions: Transaction[],
  budgets: Budget[],
): Brief {
  const monthKey = currentMonthKey();
  const spent = computeSpentByCategory(transactions, monthKey);

  const ranked = Object.entries(spent)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3);
  const topLeaks: BriefLeak[] = ranked.map(([category, amount]) => ({
    category,
    amount,
  }));

  const overs = budgets.filter(
    (b) => statusFor(spent[b.category] ?? 0, b.limit) === "over",
  );
  const warnings = budgets.filter(
    (b) => statusFor(spent[b.category] ?? 0, b.limit) === "warning",
  );
  const onTrack = budgets.filter((b) => {
    const used = spent[b.category] ?? 0;
    return used > 0 && b.limit > 0 && used / b.limit < 0.5;
  });

  const habitWin = computeHabitWin(onTrack, spent, ranked.length);
  const nextMove = computeNextMove(overs, warnings, ranked, spent);

  return {
    generatedAt: new Date().toISOString(),
    monthKey,
    topLeaks,
    habitWin,
    nextMove,
    source: "local",
  };
}

function computeHabitWin(
  onTrack: Budget[],
  spent: Record<string, number>,
  rankedCount: number,
): string {
  if (onTrack.length > 0) {
    const o = onTrack[0];
    return `You held ${o.category} to ${fmt.format(spent[o.category] ?? 0)} this cycle — well under your ${fmt.format(o.limit)} cap. That's the kind of category to leave alone.`;
  }
  if (rankedCount > 0) {
    return `You're tracking ${rankedCount} active categor${rankedCount === 1 ? "y" : "ies"}. The simple weekly habit: glance at this card every Sunday.`;
  }
  return "Import a CSV first — once you have transactions, the brief becomes specific.";
}

function computeNextMove(
  overs: Budget[],
  warnings: Budget[],
  ranked: [string, number][],
  spent: Record<string, number>,
): string {
  if (overs.length > 0) {
    const o = overs[0];
    const used = spent[o.category] ?? 0;
    return `${o.category} crossed ${fmt.format(o.limit)} — by ${fmt.format(used - o.limit)}. Hard cap it: skip the next two ${o.category.toLowerCase()} purchases this week.`;
  }
  if (warnings.length > 0) {
    const w = warnings[0];
    const pct = w.limit > 0
      ? Math.round(((spent[w.category] ?? 0) / w.limit) * 100)
      : 0;
    return `${w.category} is at ${pct}% of its cap. Cool it for the rest of the cycle — even 3 days off should pull it back under.`;
  }
  if (ranked.length > 0) {
    const [cat, amt] = ranked[0];
    return `Your biggest leak is ${cat} at ${fmt.format(amt)}. Set a budget for it on the Budgets card so the alerts can do the work.`;
  }
  return "Import a CSV to start, then come back here for a personalised plan.";
}
