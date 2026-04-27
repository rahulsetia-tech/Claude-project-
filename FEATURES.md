# Pocket — FEATURES.md

> A weekly AI financial coach for students. Upload a CSV bank/UPI statement, see your money sorted into student-friendly categories, set budgets with alerts, and get a one-page weekly advice brief written by Claude.

## 1. Primary user

A college student in India (18–24) on a parental allowance or part-time income, spending across UPI / debit card / cash, who finds existing apps either too expensive (YNAB, Monarch) or too shallow (chat-bot reactions, no real advice). Secondary user: US post-Mint refugees on the same budget.

## 2. The single most important thing they should be able to do

> **Drop in a CSV bank/UPI statement and, in under 60 seconds, see their money categorised, their budgets vs. reality, and a one-paragraph "what to do this week" written for them — without ever connecting a bank.**

## 3. Features (checklist)

- [x] **CSV import + auto-categorise** — *MVP* — Upload a CSV from any bank or UPI app; Pocket parses every transaction and tags it into student categories (mess, hostel, ride-share, books, subscriptions, eating out, etc.).
- [x] **Category budgets + over-spend alerts** — *MVP* — Set a monthly cap per category; the app flashes a clear warning the moment spending crosses 80% / 100%, and shows how many days are left in the cycle.
- [x] **Weekly AI advice brief** — *MVP* — Every Sunday, a Claude-generated one-pager: top 3 leaks this week, one habit win, one specific action for next week — written for a student, not a CFO.
- [ ] **Spending trend charts** — 30 / 60 / 90-day charts per category and overall, so creeping costs show up before the alert fires.
- [ ] **Manual transaction add + edit** — Add cash spends, fix a wrong category, or split a transaction (e.g., a Swiggy order shared with roommates).
- [ ] **PDF-statement → CSV (OCR fallback)** — When the bank only gives a PDF, Pocket OCRs it into a clean CSV so the import flow still works.
- [ ] **Multi-month dashboard + export** — Stitch monthly imports into a single timeline; export as CSV/PDF for personal records or to share with a parent.
- [ ] **Privacy-first local mode** — All raw transactions stay on the device by default; only anonymised aggregates leave the phone for the AI brief. Builds the trust that "one breach ends the brand" demands.

## 4. MVP — what ships day 1

1. CSV import + auto-categorise
2. Category budgets + over-spend alerts
3. Weekly AI advice brief

Everything else waits until we hit ≥40% weekly-active users opening the AI brief within 48 hours of delivery.
