CREATE TABLE transactions_v4 (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  chat_id INTEGER NOT NULL,
  telegram_user_id INTEGER NOT NULL,
  telegram_user TEXT NOT NULL,
  amount REAL NOT NULL,
  currency TEXT NOT NULL CHECK (currency IN ('UZS', 'USD', 'EUR')),
  note TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  category TEXT NOT NULL DEFAULT 'other'
    CHECK (category IN (
      'food',
      'transport',
      'shopping',
      'housing',
      'health',
      'education',
      'entertainment',
      'bills',
      'gifts',
      'travel',
      'work',
      'other'
    )),
  message_id INTEGER
);

INSERT INTO transactions_v4 (
  id,
  chat_id,
  telegram_user_id,
  telegram_user,
  amount,
  currency,
  note,
  created_at,
  category,
  message_id
)
SELECT
  id,
  chat_id,
  telegram_user_id,
  telegram_user,
  amount,
  currency,
  note,
  created_at,
  CASE WHEN category = 'salary' THEN 'work' ELSE category END,
  message_id
FROM transactions;

DROP TABLE transactions;
ALTER TABLE transactions_v4 RENAME TO transactions;

CREATE INDEX IF NOT EXISTS idx_transactions_chat ON transactions (chat_id);
CREATE INDEX IF NOT EXISTS idx_transactions_user_recent
  ON transactions (chat_id, telegram_user_id, created_at DESC, id DESC);
CREATE INDEX IF NOT EXISTS idx_transactions_balance
  ON transactions (chat_id, telegram_user, currency);
CREATE INDEX IF NOT EXISTS idx_transactions_message
  ON transactions (chat_id, telegram_user_id, message_id);
