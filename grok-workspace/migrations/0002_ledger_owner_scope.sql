alter table ledger_transactions
  add column if not exists owner_id text not null default 'dev-user';

create index if not exists ledger_transactions_owner_idx
  on ledger_transactions (owner_id, created_at desc);
