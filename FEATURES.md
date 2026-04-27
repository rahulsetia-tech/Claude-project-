# Pocket — FEATURES.md

> A weekly AI financial coach for students. Upload a CSV bank/UPI statement, see your money sorted into student-friendly categories, set budgets with alerts, and get a one-page weekly advice brief written by Claude.

## 1. Primary user

A college student in India (18–24) on a parental allowance or part-time income, spending across UPI / debit card / cash, who finds existing apps either too expensive (YNAB, Monarch) or too shallow (chat-bot reactions, no real advice). Secondary user: US post-Mint refugees on the same budget.

## 2. The single most important thing they should be able to do

> **Drop in a CSV bank/UPI statement and, in under 60 seconds, see their money categorised, their budgets vs. reality, and a one-paragraph "what to do this week" written for them — without ever connecting a bank.**

## 3. Features (checklist) — Day 1 ship state

- [x] **CSV import + auto-categorise** — *MVP* — **SHIPPED in PR #1.** Quote-aware parser, header-keyword column detection (Date / Description / Amount or Withdrawal), 10 keyword-rule categories + Other fallback.
- [x] **Category budgets + over-spend alerts** — *MVP* — **SHIPPED in PR #2.** Editable monthly caps, progress bars, three alert states (under / 80%+ / over), days-left-in-cycle counter.
- [x] **Weekly AI advice brief** — *MVP* — **SHIPPED in PRs #3 + #4.** Top 3 leaks / Habit win / Next week's move. Real Claude Sonnet 4.6 via `/api/brief` route handler when `ANTHROPIC_API_KEY` is set, deterministic local synthesis otherwise.
- [ ] **Spending trend charts** — Deferred. Closest to the cut (RICE 11,400) but the AI brief was the differentiator the workshop demanded.
- [ ] **Manual transaction add + edit** — Deferred. CSV-import-first works for the demo; manual entry needed once users live with it.
- [ ] **PDF-statement → CSV (OCR fallback)** — Deferred. Cheaper path: just instruct users to download CSV from their bank app.
- [ ] **Multi-month dashboard + export** — Deferred. The cycle math is in (`lib/budgets.ts`), only UI surface missing.
- [ ] **Privacy-first local mode** — Partial. Raw transactions never leave the device; the brief endpoint posts a summary (spend-by-category + last 40 transactions) only when a user has opted in by setting an API key. Full opt-out toggle still TODO.

## 4. MVP — what ships day 1

1. CSV import + auto-categorise — ✅ shipped
2. Category budgets + over-spend alerts — ✅ shipped
3. Weekly AI advice brief — ✅ shipped (Claude Sonnet 4.6 with cached system prompt + local fallback)

Everything else waits until we hit ≥40% weekly-active users opening the AI brief within 48 hours of delivery (PMF signal from §6 of the business plan).
