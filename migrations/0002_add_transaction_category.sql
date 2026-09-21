ALTER TABLE transactions
  ADD COLUMN category TEXT NOT NULL DEFAULT 'other'
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
    'salary',
    'other'
  ));
