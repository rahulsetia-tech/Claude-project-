export interface CsvRow {
  date: string;
  description: string;
  amount: number;
}

const DATE_KEYS = ["date", "transaction date", "txn date", "value date", "posted date"];
const DESC_KEYS = [
  "description",
  "narration",
  "details",
  "particulars",
  "transaction details",
  "remarks",
  "merchant",
];
const DEBIT_KEYS = [
  "withdrawal amount",
  "withdrawal",
  "debit amount",
  "debit",
  "amount",
  "transaction amount",
  "amount (inr)",
];
const CREDIT_KEYS = ["deposit amount", "deposit", "credit amount", "credit"];

function splitCsvLine(line: string): string[] {
  const out: string[] = [];
  let cur = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (inQuotes) {
      if (ch === '"' && line[i + 1] === '"') {
        cur += '"';
        i++;
      } else if (ch === '"') {
        inQuotes = false;
      } else {
        cur += ch;
      }
    } else if (ch === ",") {
      out.push(cur);
      cur = "";
    } else if (ch === '"' && cur === "") {
      inQuotes = true;
    } else {
      cur += ch;
    }
  }
  out.push(cur);
  return out;
}

function findHeaderIndex(headers: string[], options: string[]): number {
  const norm = headers.map((h) => h.trim().toLowerCase());
  for (const opt of options) {
    const idx = norm.indexOf(opt);
    if (idx !== -1) return idx;
  }
  for (const opt of options) {
    const idx = norm.findIndex((h) => h.includes(opt));
    if (idx !== -1) return idx;
  }
  return -1;
}

function parseAmount(raw: string | undefined): number {
  if (!raw) return 0;
  const cleaned = raw.replace(/[,\s₹$]/g, "").trim();
  if (!cleaned) return 0;
  const n = parseFloat(cleaned);
  return isNaN(n) ? 0 : n;
}

export function parseCsv(text: string): CsvRow[] {
  const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
  if (lines.length < 2) return [];

  const headers = splitCsvLine(lines[0]);
  const dateIdx = findHeaderIndex(headers, DATE_KEYS);
  const descIdx = findHeaderIndex(headers, DESC_KEYS);
  const debitIdx = findHeaderIndex(headers, DEBIT_KEYS);
  const creditIdx = findHeaderIndex(headers, CREDIT_KEYS);

  if (dateIdx === -1 || descIdx === -1 || (debitIdx === -1 && creditIdx === -1)) {
    throw new Error(
      "CSV must have Date, Description (or Narration), and Amount (or Withdrawal) columns.",
    );
  }

  const rows: CsvRow[] = [];
  for (let i = 1; i < lines.length; i++) {
    const cells = splitCsvLine(lines[i]);
    const date = (cells[dateIdx] || "").trim();
    const description = (cells[descIdx] || "").trim();
    const debit = debitIdx !== -1 ? parseAmount(cells[debitIdx]) : 0;
    const credit = creditIdx !== -1 ? parseAmount(cells[creditIdx]) : 0;
    const amount = debit > 0 ? debit : 0;
    if (!date || !description) continue;
    if (amount <= 0) continue; // skip credits / income for the spending view
    if (credit > 0 && debit === 0) continue;
    rows.push({ date, description, amount });
  }
  return rows;
}
