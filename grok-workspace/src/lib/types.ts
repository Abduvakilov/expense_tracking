export type Currency = "UZS" | "USD" | "EUR";

export type TxType = "income" | "expense";

export type CategoryId =
  | "food"
  | "transport"
  | "housing"
  | "health"
  | "education"
  | "entertainment"
  | "bills"
  | "gifts"
  | "travel"
  | "shopping"
  | "work"
  | "other";

export interface Person {
  id: string;
  name: string;
}

export interface Transaction {
  id: string;
  amount: number;
  currency: Currency;
  note: string;
  type: TxType;
  category: CategoryId;
  personId: string;
  createdAt: string;
}

export interface Budget {
  currency: Currency;
  monthlyLimit: number;
}

export interface ParsedTransaction {
  amount: number;
  currency: Currency;
  note: string;
  type: TxType;
  category: CategoryId;
}

export const CURRENCIES: Currency[] = ["UZS", "USD", "EUR"];

export const CATEGORIES: { id: CategoryId; label: string }[] = [
  { id: "food", label: "Food" },
  { id: "transport", label: "Transport" },
  { id: "housing", label: "Housing" },
  { id: "health", label: "Health" },
  { id: "education", label: "Education" },
  { id: "entertainment", label: "Entertainment" },
  { id: "bills", label: "Bills" },
  { id: "gifts", label: "Gifts" },
  { id: "travel", label: "Travel" },
  { id: "shopping", label: "Shopping" },
  { id: "work", label: "Work" },
  { id: "other", label: "Other" },
];
