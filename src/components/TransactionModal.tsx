"use client";

import { useEffect, useState, type FormEvent } from "react";
import { iconFor, listCategories } from "@/lib/categorize";
import type { Transaction } from "@/lib/transactions";

interface Props {
  transaction?: Transaction;
  onSave: (tx: Transaction) => void;
  onDelete?: (id: string) => void;
  onClose: () => void;
}

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

function newId(): string {
  return `manual-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export default function TransactionModal({
  transaction,
  onSave,
  onDelete,
  onClose,
}: Props) {
  const isEdit = transaction !== undefined;

  const [date, setDate] = useState(transaction?.date ?? todayIso());
  const [description, setDescription] = useState(transaction?.description ?? "");
  const [amount, setAmount] = useState<string>(
    transaction ? String(transaction.amount) : "",
  );
  const [category, setCategory] = useState(transaction?.category ?? "Other");

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  function submit(e: FormEvent) {
    e.preventDefault();
    const numericAmount = Number(amount);
    if (!description.trim()) return;
    if (!Number.isFinite(numericAmount) || numericAmount <= 0) return;

    onSave({
      id: transaction?.id ?? newId(),
      date,
      description: description.trim(),
      amount: numericAmount,
      category,
    });
  }

  function handleDelete() {
    if (!isEdit || !onDelete || !transaction) return;
    if (typeof window !== "undefined" && !window.confirm("Delete this transaction?")) {
      return;
    }
    onDelete(transaction.id);
  }

  const cats = listCategories();

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="tx-modal-title"
    >
      <button
        type="button"
        aria-label="Close"
        onClick={onClose}
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
      />
      <div className="relative w-full max-w-md rounded-xl border border-zinc-200 bg-white p-6 shadow-xl dark:border-zinc-800 dark:bg-zinc-900">
        <h2
          id="tx-modal-title"
          className="text-base font-semibold text-zinc-900 dark:text-zinc-50"
        >
          {isEdit ? "Edit transaction" : "Add transaction"}
        </h2>

        <form onSubmit={submit} className="mt-4 space-y-3">
          <label className="block">
            <span className="text-xs text-zinc-500">Date</span>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
              className="mt-1 w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100"
            />
          </label>

          <label className="block">
            <span className="text-xs text-zinc-500">Description</span>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Swiggy lunch"
              required
              autoFocus={!isEdit}
              className="mt-1 w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100"
            />
          </label>

          <label className="block">
            <span className="text-xs text-zinc-500">Amount (₹)</span>
            <input
              type="number"
              min={1}
              step={1}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0"
              required
              className="mt-1 w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm tabular-nums dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100"
            />
          </label>

          <label className="block">
            <span className="text-xs text-zinc-500">Category</span>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="mt-1 w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100"
            >
              {cats.map((c) => (
                <option key={c} value={c}>
                  {iconFor(c)} {c}
                </option>
              ))}
            </select>
          </label>

          <div className="flex flex-wrap items-center justify-between gap-2 pt-2">
            <div>
              {isEdit && onDelete && (
                <button
                  type="button"
                  onClick={handleDelete}
                  className="rounded-md border border-red-200 bg-white px-3 py-2 text-sm text-red-700 hover:bg-red-50 dark:border-red-800 dark:bg-transparent dark:text-red-400 dark:hover:bg-red-950/40"
                >
                  Delete
                </button>
              )}
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-transparent dark:text-zinc-200 dark:hover:bg-zinc-800"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-emerald-500"
              >
                {isEdit ? "Save" : "Add"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
