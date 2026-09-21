ALTER TABLE transactions
  ADD COLUMN message_id INTEGER;

CREATE INDEX IF NOT EXISTS idx_transactions_message
  ON transactions (chat_id, telegram_user_id, message_id);
