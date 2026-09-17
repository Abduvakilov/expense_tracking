import type { Currency } from "./types";

export interface TransactionRow {
  id: number;
  chat_id: number;
  telegram_user_id: number;
  telegram_user: string;
  amount: number;
  currency: Currency;
  note: string;
  created_at: string;
}

export async function upsertUser(
  db: D1Database,
  chatId: number,
  userId: number,
  name: string,
): Promise<void> {
  await db
    .prepare(
      `INSERT INTO users (chat_id, telegram_user_id, telegram_user)
       VALUES (?, ?, ?)
       ON CONFLICT (chat_id, telegram_user_id) DO UPDATE SET
         telegram_user = excluded.telegram_user,
         last_seen_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now')`,
    )
    .bind(chatId, userId, name)
    .run();
}

export async function insertTransaction(
  db: D1Database,
  input: {
    chatId: number;
    userId: number;
    name: string;
    amount: number;
    currency: Currency;
    note: string;
  },
): Promise<void> {
  await db
    .prepare(
      `INSERT INTO transactions
        (chat_id, telegram_user_id, telegram_user, amount, currency, note)
       VALUES (?, ?, ?, ?, ?, ?)`,
    )
    .bind(input.chatId, input.userId, input.name, input.amount, input.currency, input.note)
    .run();
}

export async function listBalances(
  db: D1Database,
  chatId: number,
): Promise<{
  users: Array<{ telegram_user: string; telegram_user_id: number; currency: Currency; total: number }>;
  totals: Array<{ currency: Currency; total: number }>;
}> {
  const users = await db
    .prepare(
      `SELECT telegram_user, telegram_user_id, currency, SUM(amount) AS total
       FROM transactions
       WHERE chat_id = ?
       GROUP BY telegram_user_id, telegram_user, currency
       ORDER BY telegram_user COLLATE NOCASE, currency`,
    )
    .bind(chatId)
    .all<{ telegram_user: string; telegram_user_id: number; currency: Currency; total: number }>();

  const totals = await db
    .prepare(
      `SELECT currency, SUM(amount) AS total
       FROM transactions
       WHERE chat_id = ?
       GROUP BY currency
       ORDER BY currency`,
    )
    .bind(chatId)
    .all<{ currency: Currency; total: number }>();

  return {
    users: users.results ?? [],
    totals: totals.results ?? [],
  };
}

export async function undoLastTransaction(
  db: D1Database,
  chatId: number,
  userId: number,
): Promise<TransactionRow | null> {
  const result = await db
    .prepare(
      `DELETE FROM transactions
       WHERE id = (
         SELECT id FROM transactions
         WHERE telegram_user_id = ? AND chat_id = ?
         ORDER BY created_at DESC, id DESC
         LIMIT 1
       )
       RETURNING *`,
    )
    .bind(userId, chatId)
    .first<TransactionRow>();

  return result ?? null;
}
