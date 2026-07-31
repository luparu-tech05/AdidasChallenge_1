import Database from "better-sqlite3";
import { createHash } from "node:crypto";
import { mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";

export const hashKey = (value) =>
  createHash("sha256").update(value).digest("hex");

const schema = `
  CREATE TABLE IF NOT EXISTS stores (
    id INTEGER PRIMARY KEY,
    code TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    api_key_hash TEXT NOT NULL UNIQUE,
    active INTEGER NOT NULL DEFAULT 1
  );

  CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY,
    sku TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    threshold INTEGER NOT NULL DEFAULT 5
  );

  CREATE TABLE IF NOT EXISTS balances (
    store_id INTEGER NOT NULL REFERENCES stores(id),
    product_id INTEGER NOT NULL REFERENCES products(id),
    quantity INTEGER NOT NULL DEFAULT 0 CHECK (quantity >= 0),
    updated_at TEXT NOT NULL,
    PRIMARY KEY (store_id, product_id)
  );

  CREATE TABLE IF NOT EXISTS movements (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    store_id INTEGER NOT NULL REFERENCES stores(id),
    product_id INTEGER NOT NULL REFERENCES products(id),
    type TEXT NOT NULL CHECK (type IN ('IN', 'OUT')),
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    resulting_balance INTEGER NOT NULL,
    idempotency_key TEXT NOT NULL,
    request_signature TEXT NOT NULL,
    reference TEXT,
    occurred_at TEXT NOT NULL,
    created_at TEXT NOT NULL,
    UNIQUE (store_id, idempotency_key)
  );

  CREATE TABLE IF NOT EXISTS alerts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    product_id INTEGER NOT NULL REFERENCES products(id),
    observed_quantity INTEGER NOT NULL,
    threshold INTEGER NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('OPEN', 'RESOLVED')),
    opened_at TEXT NOT NULL,
    resolved_at TEXT
  );
`;

const stores = [
  ["BOG-CALLE82", "Bogota Calle 82", "store-bogota-key"],
  ["MDE-POBLADO", "Medellin El Poblado", "store-medellin-key"],
  ["CLO-JARDIN", "Cali Jardin Plaza", "store-cali-key"]
];

const products = [
  ["SAMBA-OG-WHT-42", "Samba OG White", "Footwear", 5],
  ["PREDATOR-ELITE-FG-43", "Predator Elite", "Football", 6],
  ["ADIZERO-BOSTON-13-40", "Adizero Boston 13", "Running", 5]
];

const startingBalances = [
  [6, 3, 1],
  [8, 9, 7],
  [2, 1, 1]
];

function seed(db) {
  const storeCount = db.prepare("SELECT COUNT(*) AS count FROM stores").get().count;
  if (storeCount > 0) return;

  const insertStore = db.prepare(
    "INSERT INTO stores (code, name, api_key_hash) VALUES (?, ?, ?)"
  );
  const insertProduct = db.prepare(
    "INSERT INTO products (sku, name, category, threshold) VALUES (?, ?, ?, ?)"
  );
  const insertBalance = db.prepare(
    `INSERT INTO balances (store_id, product_id, quantity, updated_at)
     VALUES (?, ?, ?, ?)`
  );
  const insertAlert = db.prepare(
    `INSERT INTO alerts (
      product_id, observed_quantity, threshold, status, opened_at
    ) VALUES (?, ?, ?, 'OPEN', ?)`
  );

  db.transaction(() => {
    stores.forEach(([code, name, key]) =>
      insertStore.run(code, name, hashKey(key))
    );
    products.forEach((product) => insertProduct.run(...product));

    const now = new Date().toISOString();
    startingBalances.forEach((productBalances, productIndex) => {
      productBalances.forEach((quantity, storeIndex) => {
        insertBalance.run(storeIndex + 1, productIndex + 1, quantity, now);
      });
      const networkTotal = productBalances.reduce(
        (total, quantity) => total + quantity,
        0
      );
      const threshold = products[productIndex][3];
      if (networkTotal <= threshold) {
        insertAlert.run(productIndex + 1, networkTotal, threshold, now);
      }
    });
  })();
}

export function createDatabase(filename = process.env.DATABASE_FILE) {
  const selectedFile =
    filename === ":memory:"
      ? filename
      : resolve(process.cwd(), filename || "./data/inventory.db");

  if (selectedFile !== ":memory:") {
    mkdirSync(dirname(selectedFile), { recursive: true });
  }

  const db = new Database(selectedFile);
  db.pragma("foreign_keys = ON");
  db.pragma("journal_mode = WAL");
  db.pragma("busy_timeout = 5000");
  db.exec(schema);
  seed(db);
  return db;
}
