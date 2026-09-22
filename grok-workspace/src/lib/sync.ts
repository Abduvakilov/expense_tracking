import { syncLedgerTransactions } from "./ledger-sync";
import type { Transaction } from "./types";

const SYNC_KEY = "hisob-sync-queue-v1";

export function readSyncQueue(): Transaction[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(SYNC_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as Transaction[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function enqueueForSync(rows: Transaction[]): void {
  if (typeof window === "undefined" || rows.length === 0) return;
  const queue = readSyncQueue();
  const next = [...queue, ...rows];
  window.localStorage.setItem(SYNC_KEY, JSON.stringify(next));
}

export function clearSyncQueue(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(SYNC_KEY);
}

export async function flushSyncQueue(): Promise<boolean> {
  if (typeof navigator !== "undefined" && !navigator.onLine) return false;

  const queue = readSyncQueue();
  if (queue.length === 0) return true;

  try {
    const result = await syncLedgerTransactions({ data: { transactions: queue } });
    if (!result || result.synced === 0) {
      return false;
    }

    clearSyncQueue();
    return true;
  } catch {
    return false;
  }
}
