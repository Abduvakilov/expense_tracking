create table if not exists ledger_transactions (
  id text primary key,
  person_id text not null,
  note text not null,
  amount integer not null,
  currency text not null check (currency in ('UZS', 'USD', 'EUR')),
  type text not null check (type in ('income', 'expense')),
  category text not null,
  created_at timestamptz not null default now()
);

create index if not exists ledger_transactions_created_at_idx
  on ledger_transactions (created_at desc);
