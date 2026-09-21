export type Currency = "UZS" | "USD" | "EUR";
export type TransactionCategory =
  | "food"
  | "transport"
  | "shopping"
  | "housing"
  | "health"
  | "education"
  | "entertainment"
  | "bills"
  | "gifts"
  | "travel"
  | "salary"
  | "other";

export interface Env {
  DB: D1Database;
  BOT_TOKEN: string;
  WEBHOOK_SECRET?: string;
}

export interface ParsedTransaction {
  amount: number;
  currency: Currency;
  note: string;
  type: "income" | "expense";
  category: TransactionCategory;
}
