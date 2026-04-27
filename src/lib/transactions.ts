import { load, save } from "./storage";

export interface Transaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  category: string;
}

const KEY = "pocket:transactions";

export function loadTransactions(): Transaction[] {
  return load<Transaction[]>(KEY, []);
}

export function saveTransactions(tx: Transaction[]): void {
  save(KEY, tx);
}
