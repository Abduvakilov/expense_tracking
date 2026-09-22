import { inferCategory } from "./categories";
import type { Budget, Person, Transaction } from "./types";

function todayUtcNoon(): Date {
  const n = new Date();
  return new Date(Date.UTC(n.getUTCFullYear(), n.getUTCMonth(), n.getUTCDate(), 12, 0, 0, 0));
}

function atHours(base: Date, daysAgo: number, hour: number): string {
  const d = new Date(base.getTime());
  d.setUTCDate(d.getUTCDate() - daysAgo);
  d.setUTCHours(hour, 0, 0, 0);
  return d.toISOString();
}

function tx(
  id: string,
  partial: Omit<Transaction, "id" | "category" | "type"> & { type?: Transaction["type"] },
): Transaction {
  const type = partial.type ?? (partial.amount >= 0 ? "income" : "expense");
  return {
    id,
    category: inferCategory(partial.note, type),
    type,
    amount: partial.amount,
    currency: partial.currency,
    note: partial.note,
    personId: partial.personId,
    createdAt: partial.createdAt,
  };
}

export const DEFAULT_PEOPLE: Person[] = [
  { id: "you", name: "You" },
  { id: "doniyor", name: "Doniyor" },
  { id: "malika", name: "Malika" },
];

export const DEFAULT_BUDGETS: Budget[] = [
  { currency: "UZS", monthlyLimit: 12_000_000 },
  { currency: "USD", monthlyLimit: 400 },
  { currency: "EUR", monthlyLimit: 200 },
];

export function buildSampleLedger(now = todayUtcNoon()): Transaction[] {
  const rows: Transaction[] = [
    tx("s01", { personId: "you", currency: "UZS", amount: 8_500_000, note: "Salary maosh", createdAt: atHours(now, 18, 9) }),
    tx("s02", { personId: "malika", currency: "UZS", amount: 6_200_000, note: "Malika kirim oylik", createdAt: atHours(now, 17, 10) }),
    tx("s03", { personId: "you", currency: "USD", amount: 480, note: "Freelance kirim", createdAt: atHours(now, 14, 16) }),
    tx("s04", { personId: "doniyor", currency: "EUR", amount: 220, note: "Client kirim", createdAt: atHours(now, 12, 11) }),
    tx("s05", { personId: "you", currency: "UZS", amount: -2_400_000, note: "Rent ijara", createdAt: atHours(now, 16, 12) }),
    tx("s06", { personId: "malika", currency: "UZS", amount: -180_000, note: "Internet wifi", createdAt: atHours(now, 15, 19) }),
    tx("s07", { personId: "you", currency: "UZS", amount: -320_000, note: "Kommunal tok", createdAt: atHours(now, 15, 19) }),
    tx("s08", { personId: "doniyor", currency: "UZS", amount: -85_000, note: "kartoshka, sabzi, piyoz jami", createdAt: atHours(now, 13, 18) }),
    tx("s09", { personId: "you", currency: "USD", amount: -25, note: "Taxi", createdAt: atHours(now, 12, 21) }),
    tx("s10", { personId: "malika", currency: "UZS", amount: -64_000, note: "Oshxona lunch", createdAt: atHours(now, 11, 13) }),
    tx("s11", { personId: "you", currency: "UZS", amount: -42_000, note: "Yandex", createdAt: atHours(now, 10, 8) }),
    tx("s12", { personId: "doniyor", currency: "EUR", amount: -38, note: "Cafe", createdAt: atHours(now, 9, 17) }),
    tx("s13", { personId: "malika", currency: "UZS", amount: -156_000, note: "Pharmacy apteka", createdAt: atHours(now, 8, 15) }),
    tx("s14", { personId: "you", currency: "UZS", amount: -210_000, note: "Uzum shopping", createdAt: atHours(now, 7, 20) }),
    tx("s15", { personId: "you", currency: "USD", amount: -14.5, note: "Netflix", createdAt: atHours(now, 7, 9) }),
    tx("s16", { personId: "doniyor", currency: "UZS", amount: -28_000, note: "Choy cafe", createdAt: atHours(now, 6, 16) }),
    tx("s17", { personId: "malika", currency: "UZS", amount: -95_000, note: "Bozor meva", createdAt: atHours(now, 5, 11) }),
    tx("s18", { personId: "you", currency: "UZS", amount: -18_000, note: "Metro", createdAt: atHours(now, 5, 8) }),
    tx("s19", { personId: "you", currency: "EUR", amount: -12, note: "Domain work", createdAt: atHours(now, 4, 14) }),
    tx("s20", { personId: "doniyor", currency: "USD", amount: -32, note: "Uber", createdAt: atHours(now, 4, 22) }),
    tx("s21", { personId: "malika", currency: "UZS", amount: -48_000, note: "Somsa lavash", createdAt: atHours(now, 3, 13) }),
    tx("s22", { personId: "you", currency: "UZS", amount: -72_000, note: "Kartoshka 3kg", createdAt: atHours(now, 2, 19) }),
    tx("s23", { personId: "you", currency: "UZS", amount: -15_000, note: "Taxi", createdAt: atHours(now, 1, 21) }),
    tx("s24", { personId: "malika", currency: "UZS", amount: -36_000, note: "Coffee kofe", createdAt: atHours(now, 1, 10) }),
    tx("s25", { personId: "doniyor", currency: "UZS", amount: -120_000, note: "Benzin", createdAt: atHours(now, 0, 9) }),
    tx("s26", { personId: "you", currency: "UZS", amount: 1_200_000, note: "Side project kirim", createdAt: atHours(now, 0, 15) }),
  ];
  return rows.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
}
