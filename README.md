# Pocket

Pocket is a weekly AI financial coach for students. Upload a CSV bank or UPI statement and Pocket auto-categorises your spending into student-friendly buckets (Mess, Hostel, Eating Out, Subscriptions, Ride-share, Books, Phone/Internet, Bills, Shopping, Cash), tracks per-category monthly budgets with 80% / 100% over-spend alerts, and generates a one-page weekly brief — Top 3 leaks, Habit win, and one specific move for next week. The brief is written by Claude Sonnet 4.6 when you bring an Anthropic API key, or a deterministic local synthesiser when you don't. No bank linking. No $100 subscription.

## Setup

```bash
git clone https://github.com/rahulsetia-tech/Claude-project-.git
cd Claude-project-
npm install

# Optional: real Claude-generated briefs.
# Skip this and the brief is generated locally instead.
cp .env.example .env.local
# then paste your key from https://console.anthropic.com/

npm run dev
# open http://localhost:3000
```

Once the server is up: click **download sample CSV**, then **Choose CSV file** and upload it. You should see twenty Indian-student transactions land in the table, the budget bars come alive, and a weekly brief one click away.

## What's inside

| File | Why it exists |
| --- | --- |
| `src/lib/storage.ts` | SSR-safe `localStorage` helper (`save` / `load<T>`). |
| `src/lib/csv.ts` | Quote-aware CSV parser; finds Date / Description / Amount columns by header keyword. |
| `src/lib/categorize.ts` | 10 keyword-rule buckets for student spend, with `Other` fallback. |
| `src/lib/transactions.ts` | `Transaction` type + persistence. |
| `src/lib/budgets.ts` | Budget type, monthly cycle math, status (`under` / `warning` / `over`). |
| `src/lib/brief.ts` | Local deterministic brief synthesiser (fallback when no API key). |
| `src/app/api/brief/route.ts` | Next.js route handler. Calls Claude Sonnet 4.6 (with cached system prompt) when `ANTHROPIC_API_KEY` is set; otherwise calls the local synth. |
| `src/components/{CsvImport,Budgets,WeeklyBrief,TransactionTable,Dashboard,StorageStatus}.tsx` | The UI, one component per concern. |
| `public/sample.csv` | Twenty rows of plausible Indian student spending for demos. |

## Built by

Day 1 of the **Week of Claude** workshop — built in four hours, one teammate per round-robin slot.

- **Rahul Setia** — Round 1 · CSV import + auto-categorisation
- **Claude** — Round 2 · Category budgets + over-spend alerts
- **Atlas** — Round 3 · Weekly brief (deterministic)
- **Kai** — Round 4 · Real Claude API integration with graceful fallback
- **Nova** — Round 5 · Bug bash + polish + this README

## License

MIT (workshop deliverable; not for production use without a real privacy/security review).
