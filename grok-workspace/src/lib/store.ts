import { create } from "zustand";
import { persist } from "zustand/middleware";
import { inferCategory } from "./categories";
import { listLedgerTransactions } from "./ledger-sync";
import { parseTransactionInputs } from "./parser";
import { buildSampleLedger, DEFAULT_BUDGETS, DEFAULT_PEOPLE } from "./seed";
import { enqueueForSync, flushSyncQueue } from "./sync";
import type {
  Budget,
  CategoryId,
  Currency,
  Person,
  Transaction,
  TxType,
} from "./types";

export type TypeFilter = "all" | TxType;
export type CurrencyFilter = "all" | Currency;

interface LedgerState {
  isSample: boolean;
  people: Person[];
  activePersonId: string;
  transactions: Transaction[];
  budgets: Budget[];
  undoStack: string[][];
  month: string;
  typeFilter: TypeFilter;
  currencyFilter: CurrencyFilter;
  search: string;
  setMonth: (isoMonth: string) => void;
  setTypeFilter: (value: TypeFilter) => void;
  setCurrencyFilter: (value: CurrencyFilter) => void;
  setSearch: (value: string) => void;
  setActivePerson: (id: string) => void;
  logText: (text: string, createdAt?: string) => Transaction[];
  logTextAsync: (text: string, createdAt?: string) => Promise<Transaction[]>;
  addPerson: (name: string) => void;
  renamePerson: (id: string, name: string) => void;
  removePerson: (id: string) => void;
  setBudget: (currency: Currency, monthlyLimit: number) => void;
  updateTransaction: (
    id: string,
    patch: Partial<
      Pick<
        Transaction,
        "note" | "amount" | "currency" | "category" | "personId" | "createdAt" | "type"
      >
    >,
  ) => void;
  deleteTransaction: (id: string) => void;
  undo: () => string[] | null;
  startFresh: () => void;
  restoreSample: () => void;
}

function currentMonthIso(date = new Date()): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-01`;
}

function sortTx(rows: Transaction[]): Transaction[] {
  return [...rows].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
}

export const useLedgerStore = create<LedgerState>()(
  persist(
    (set, get) => ({
      isSample: true,
      people: DEFAULT_PEOPLE,
      activePersonId: "you",
      transactions: buildSampleLedger(),
      budgets: DEFAULT_BUDGETS,
      undoStack: [],
      month: currentMonthIso(),
      typeFilter: "all",
      currencyFilter: "all",
      search: "",
      setMonth: (isoMonth) => set({ month: isoMonth }),
      setTypeFilter: (value) => set({ typeFilter: value }),
      setCurrencyFilter: (value) => set({ currencyFilter: value }),
      setSearch: (value) => set({ search: value }),
      setActivePerson: (id) => set({ activePersonId: id }),
      logText: (text, createdAt) => {
        const parsed = parseTransactionInputs(text);
        if (parsed.length === 0) return [];
        const personId = get().activePersonId;
        const stamp = createdAt ?? new Date().toISOString();
        const rows: Transaction[] = parsed.map((p, index) => ({
          id: crypto.randomUUID(),
          amount: p.amount,
          currency: p.currency,
          note: p.note,
          type: p.type,
          category: p.category,
          personId,
          createdAt: new Date(new Date(stamp).getTime() + index).toISOString(),
        }));
        enqueueForSync(rows);
        set((state) => ({
          isSample: false,
          transactions: sortTx([...rows, ...state.transactions]),
          undoStack: [rows.map((r) => r.id), ...state.undoStack].slice(0, 20),
        }));
        return rows;
      },
      logTextAsync: async (text, createdAt) => {
        const parsed = await parseTransactionInputs(text);
        if (parsed.length === 0) return [];
        const personId = get().activePersonId;
        const stamp = createdAt ?? new Date().toISOString();
        const rows: Transaction[] = parsed.map((p, index) => ({
          id: crypto.randomUUID(),
          amount: p.amount,
          currency: p.currency,
          note: p.note,
          type: p.type,
          category: p.category,
          personId,
          createdAt: new Date(new Date(stamp).getTime() + index).toISOString(),
        }));
        enqueueForSync(rows);
        set((state) => ({
          isSample: false,
          transactions: sortTx([...rows, ...state.transactions]),
          undoStack: [rows.map((r) => r.id), ...state.undoStack].slice(0, 20),
        }));
        return rows;
      },
      addPerson: (name) => {
        const trimmed = name.trim();
        if (!trimmed) return;
        const id = crypto.randomUUID();
        set((state) => ({
          people: [...state.people, { id, name: trimmed }],
          activePersonId: id,
        }));
      },
      renamePerson: (id, name) => {
        const trimmed = name.trim();
        if (!trimmed) return;
        set((state) => ({
          people: state.people.map((p) => (p.id === id ? { ...p, name: trimmed } : p)),
        }));
      },
      removePerson: (id) => {
        const { people, activePersonId, transactions } = get();
        if (people.length <= 1) return;
        const fallback = people.find((p) => p.id !== id)?.id;
        if (!fallback) return;
        set({
          people: people.filter((p) => p.id !== id),
          activePersonId: activePersonId === id ? fallback : activePersonId,
          transactions: transactions.map((t) =>
            t.personId === id ? { ...t, personId: fallback } : t,
          ),
        });
      },
      setBudget: (currency, monthlyLimit) => {
        set((state) => {
          const next = state.budgets.filter((b) => b.currency !== currency);
          if (monthlyLimit > 0) next.push({ currency, monthlyLimit });
          return { budgets: next };
        });
      },
      updateTransaction: (id, patch) => {
        set((state) => ({
          isSample: false,
          transactions: sortTx(
            state.transactions.map((t) => {
              if (t.id !== id) return t;
              const next = { ...t, ...patch };
              if (patch.amount !== undefined) {
                next.type = patch.amount >= 0 ? "income" : "expense";
              }
              if (patch.type) {
                const abs = Math.abs(next.amount);
                next.amount = patch.type === "income" ? abs : -abs;
                next.type = patch.type;
              }
              if (patch.note !== undefined || patch.type !== undefined) {
                next.category = patch.category ?? inferCategory(next.note, next.type);
              }
              return next;
            }),
          ),
        }));
      },
      deleteTransaction: (id) => {
        set((state) => ({
          isSample: false,
          transactions: state.transactions.filter((t) => t.id !== id),
        }));
      },
      undo: () => {
        const batch = get().undoStack[0];
        if (!batch) return null;
        set((state) => ({
          transactions: state.transactions.filter((t) => !batch.includes(t.id)),
          undoStack: state.undoStack.slice(1),
        }));
        return batch;
      },
      startFresh: () => {
        set({
          isSample: false,
          people: [{ id: "you", name: "You" }],
          activePersonId: "you",
          transactions: [],
          budgets: [],
          undoStack: [],
          month: currentMonthIso(),
          typeFilter: "all",
          currencyFilter: "all",
          search: "",
        });
      },
      restoreSample: () => {
        set({
          isSample: true,
          people: DEFAULT_PEOPLE,
          activePersonId: "you",
          transactions: buildSampleLedger(),
          budgets: DEFAULT_BUDGETS,
          undoStack: [],
          month: currentMonthIso(),
          typeFilter: "all",
          currencyFilter: "all",
          search: "",
        });
      },
    }),
    {
      name: "hisob-ledger-v3",
      skipHydration: true,
      partialize: (state) => ({
        isSample: state.isSample,
        people: state.people,
        activePersonId: state.activePersonId,
        transactions: state.transactions,
        budgets: state.budgets,
      }),
    },
  ),
);

function ensureLedgerReady(): void {
  const state = useLedgerStore.getState();
  if (state.isSample && state.transactions.length === 0) {
    useLedgerStore.setState({ transactions: buildSampleLedger() });
  }
}

function normalizeRemoteCategory(category: string): CategoryId {
  const legacy: Record<string, CategoryId> = {
    groceries: "food",
    dining: "food",
    utilities: "bills",
    work: "other",
    entertainment: "entertainment",
    income: "work",
    salary: "work",
  };
  return legacy[category] ?? (category as CategoryId);
}

export async function refreshLedger(): Promise<void> {
  await flushSyncQueue();
  const rows = await listLedgerTransactions();
  const state = useLedgerStore.getState();
  const knownPeople = new Set(state.people.map((person) => person.id));
  const remotePeople = rows
    .map((row) => row.personId)
    .filter((id, index, ids) => ids.indexOf(id) === index)
    .filter((id) => !knownPeople.has(id))
    .map((id) => ({ id, name: id === "you" ? "You" : id }));

  useLedgerStore.setState({
    isSample: false,
    transactions: rows.map((row) => ({
      ...row,
      category: normalizeRemoteCategory(row.category),
    })),
    people: [...state.people, ...remotePeople],
  });
}

let bootstrapPromise: Promise<void> | null = null;

export function bootstrapLedger(): Promise<void> {
  if (!bootstrapPromise) {
    bootstrapPromise = (async () => {
      await useLedgerStore.persist.rehydrate();
      try {
        await refreshLedger();
      } catch (error) {
        console.warn("Could not load shared ledger; keeping local data.", error);
        ensureLedgerReady();
      }
    })();
  }
  return bootstrapPromise;
}

export function monthBounds(monthIso: string): { start: Date; end: Date } {
  const start = new Date(`${monthIso}T00:00:00`);
  const end = new Date(start);
  end.setMonth(end.getMonth() + 1);
  return { start, end };
}

export function inMonth(iso: string, monthIso: string): boolean {
  const { start, end } = monthBounds(monthIso);
  const t = new Date(iso).getTime();
  return t >= start.getTime() && t < end.getTime();
}

export function shiftMonth(monthIso: string, delta: number): string {
  const d = new Date(`${monthIso}T00:00:00`);
  d.setMonth(d.getMonth() + delta);
  return currentMonthIso(d);
}

export function sumsByCurrency(rows: Transaction[]): Record<Currency, number> {
  const sums: Record<Currency, number> = { UZS: 0, USD: 0, EUR: 0 };
  for (const row of rows) sums[row.currency] += row.amount;
  return sums;
}

export function expenseByCurrency(rows: Transaction[]): Record<Currency, number> {
  const sums: Record<Currency, number> = { UZS: 0, USD: 0, EUR: 0 };
  for (const row of rows) {
    if (row.amount < 0) sums[row.currency] += Math.abs(row.amount);
  }
  return sums;
}

export function incomeByCurrency(rows: Transaction[]): Record<Currency, number> {
  const sums: Record<Currency, number> = { UZS: 0, USD: 0, EUR: 0 };
  for (const row of rows) {
    if (row.amount > 0) sums[row.currency] += row.amount;
  }
  return sums;
}

export function categorySpend(
  rows: Transaction[],
  currency: CurrencyFilter,
): { id: CategoryId; label: string; total: number }[] {
  const map = new Map<CategoryId, number>();
  for (const row of rows) {
    if (row.amount >= 0) continue;
    if (currency !== "all" && row.currency !== currency) continue;
    map.set(row.category, (map.get(row.category) ?? 0) + Math.abs(row.amount));
  }
  return [...map.entries()]
    .map(([id, total]) => ({
      id,
      label: id.charAt(0).toUpperCase() + id.slice(1),
      total,
    }))
    .sort((a, b) => b.total - a.total);
}

export { currentMonthIso };
