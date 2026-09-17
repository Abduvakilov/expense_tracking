CREATE TABLE IF NOT EXISTS users (
  chat_id INTEGER NOT NULL,
  telegram_user_id INTEGER NOT NULL,
  telegram_user TEXT NOT NULL,
  registered_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  last_seen_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  PRIMARY KEY (chat_id, telegram_user_id)
);

CREATE TABLE IF NOT EXISTS transactions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  chat_id INTEGER NOT NULL,
  telegram_user_id INTEGER NOT NULL,
  telegram_user TEXT NOT NULL,
  amount REAL NOT NULL,
  currency TEXT NOT NULL CHECK (currency IN ('UZS', 'USD', 'EUR')),
  note TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

CREATE INDEX IF NOT EXISTS idx_transactions_chat ON transactions (chat_id);
CREATE INDEX IF NOT EXISTS idx_transactions_user_recent
  ON transactions (chat_id, telegram_user_id, created_at DESC, id DESC);
CREATE INDEX IF NOT EXISTS idx_transactions_balance
  ON transactions (chat_id, telegram_user, currency);
