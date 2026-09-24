import { createServerFn } from "@tanstack/react-start";
import { getSql } from "./db";
import { telegramAuthMiddleware } from "./telegram-auth";
import type { Currency, TxType } from "./types";

export type LedgerSyncItem = {
  id: string;
  personId: string;
  note: string;
  amount: number;
  currency: Currency;
  type: TxType;
  category: string;
  createdAt: string;
};

export const syncLedgerTransactions = createServerFn({ method: "POST" })
  .middleware([telegramAuthMiddleware])
  .validator((input: { transactions: LedgerSyncItem[] }) => input)
  .handler(async ({ data, context }): Promise<{ synced: number }> => {
    const { transactions } = data;
    if (!Array.isArray(transactions) || transactions.length === 0) {
      return { synced: 0 };
    }

    const sql = await getSql();
    for (const row of transactions) {
      await sql`
        insert into ledger_transactions (id, owner_id, person_id, note, amount, currency, type, category, created_at)
        values (${row.id}, ${context.telegramUser.id}, ${row.personId}, ${row.note}, ${row.amount}, ${row.currency}, ${row.type}, ${row.category}, ${row.createdAt})
        on conflict (id) do update set
          person_id = excluded.person_id,
          note = excluded.note,
          amount = excluded.amount,
          currency = excluded.currency,
          type = excluded.type,
          category = excluded.category,
          created_at = excluded.created_at
        where ledger_transactions.owner_id = excluded.owner_id
      `;
    }

    return { synced: transactions.length };
  });

export const listLedgerTransactions = createServerFn({ method: "GET" })
  .middleware([telegramAuthMiddleware])
  .handler(async ({ context }): Promise<LedgerSyncItem[]> => {
    const sql = await getSql();
    const rows = await sql<{
      id: string;
      person_id: string;
      note: string;
      amount: number;
      currency: Currency;
      type: TxType;
      category: string;
      created_at: string;
    }>`
      select id, person_id, note, amount, currency, type, category, created_at
      from ledger_transactions
      where owner_id = ${context.telegramUser.id}
      order by created_at desc
    `;

    return rows.map((row) => ({
      id: row.id,
      personId: row.person_id,
      note: row.note,
      amount: row.amount,
      currency: row.currency,
      type: row.type,
      category: row.category,
      createdAt: new Date(row.created_at).toISOString(),
    }));
  });
