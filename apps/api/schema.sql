PRAGMA journal_mode = WAL;
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS transactions (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  amount REAL NOT NULL CHECK (amount > 0),
  currency TEXT NOT NULL CHECK (currency IN ('USD', 'TOMAN')),
  direction TEXT NOT NULL CHECK (direction IN ('theyOwe', 'iOwe')),
  date TEXT NOT NULL DEFAULT '',
  iranianDate TEXT NOT NULL DEFAULT '',
  note TEXT NOT NULL DEFAULT '',
  createdAt INTEGER NOT NULL,
  updatedAt INTEGER
);

CREATE INDEX IF NOT EXISTS idx_transactions_name ON transactions (name);
CREATE INDEX IF NOT EXISTS idx_transactions_createdAt ON transactions (createdAt);
CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions (date);

CREATE TABLE IF NOT EXISTS audit_log (
  id TEXT PRIMARY KEY,
  action TEXT NOT NULL,
  details TEXT NOT NULL DEFAULT '{}',
  createdAt INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_audit_log_createdAt ON audit_log (createdAt);
CREATE INDEX IF NOT EXISTS idx_audit_log_action ON audit_log (action);

CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updatedAt INTEGER NOT NULL
);
