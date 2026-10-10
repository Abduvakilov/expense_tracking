CREATE TABLE IF NOT EXISTS ledger_transactions (
  id TEXT PRIMARY KEY,
  owner_id TEXT NOT NULL,
  person_id TEXT NOT NULL,
  note TEXT NOT NULL,
  amount REAL NOT NULL,
  currency TEXT NOT NULL CHECK (currency IN ('UZS', 'USD', 'EUR')),
  type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
  category TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

CREATE INDEX IF NOT EXISTS ledger_transactions_owner_idx
  ON ledger_transactions (owner_id, created_at DESC);
