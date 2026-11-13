import Database from 'better-sqlite3'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const dbPath = path.join(__dirname, 'vaultnft.db')

const db = new Database(dbPath)

db.pragma('journal_mode = WAL')
db.pragma('foreign_keys = ON')

db.exec(`
  CREATE TABLE IF NOT EXISTS collections (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    description TEXT NOT NULL DEFAULT '',
    creator_id TEXT NOT NULL,
    image_url TEXT,
    accent_color TEXT NOT NULL DEFAULT '#06b6d4',
    vault_rules TEXT NOT NULL DEFAULT '{}',
    mint_count INTEGER NOT NULL DEFAULT 0,
    max_supply INTEGER NOT NULL DEFAULT 100,
    floor_price REAL NOT NULL DEFAULT 0,
    total_tvl REAL NOT NULL DEFAULT 0,
    holder_count INTEGER NOT NULL DEFAULT 0,
    near_account TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS vault_nfts (
    id TEXT PRIMARY KEY,
    token_id TEXT NOT NULL,
    collection_id TEXT NOT NULL REFERENCES collections(id),
    owner_id TEXT NOT NULL,
    vault_address TEXT NOT NULL UNIQUE,
    balance REAL NOT NULL DEFAULT 0,
    total_deposited REAL NOT NULL DEFAULT 0,
    total_withdrawn REAL NOT NULL DEFAULT 0,
    total_yield REAL NOT NULL DEFAULT 0,
    minted_at TEXT NOT NULL DEFAULT (datetime('now')),
    holder_since TEXT NOT NULL DEFAULT (datetime('now')),
    metadata TEXT NOT NULL DEFAULT '{}',
    UNIQUE(collection_id, token_id)
  );

  CREATE TABLE IF NOT EXISTS transactions (
    id TEXT PRIMARY KEY,
    vault_id TEXT NOT NULL REFERENCES vault_nfts(id),
    type TEXT NOT NULL,
    amount REAL NOT NULL DEFAULT 0,
    from_address TEXT NOT NULL DEFAULT '',
    to_address TEXT NOT NULL DEFAULT '',
    tx_hash TEXT NOT NULL,
    timestamp TEXT NOT NULL DEFAULT (datetime('now')),
    status TEXT NOT NULL DEFAULT 'completed'
  );

  CREATE TABLE IF NOT EXISTS revenue_distributions (
    id TEXT PRIMARY KEY,
    collection_id TEXT NOT NULL REFERENCES collections(id),
    total_amount REAL NOT NULL,
    per_vault_amount REAL NOT NULL,
    vault_count INTEGER NOT NULL,
    distributed_at TEXT NOT NULL DEFAULT (datetime('now')),
    tx_hash TEXT NOT NULL
  );

  CREATE INDEX IF NOT EXISTS idx_vault_nfts_collection ON vault_nfts(collection_id);
  CREATE INDEX IF NOT EXISTS idx_vault_nfts_owner ON vault_nfts(owner_id);
  CREATE INDEX IF NOT EXISTS idx_transactions_vault ON transactions(vault_id);
  CREATE INDEX IF NOT EXISTS idx_revenue_distributions_collection ON revenue_distributions(collection_id);
`)

export default db
