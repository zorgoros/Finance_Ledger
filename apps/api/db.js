import { mkdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { DatabaseSync } from "node:sqlite";
import { randomUUID } from "node:crypto";

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, "..", "..");
const dataDir = join(rootDir, "local-data");
const dbPath = process.env.MONEY_LEDGER_DB_PATH || join(dataDir, "money-ledger.sqlite");
const schemaPath = join(__dirname, "schema.sql");

mkdirSync(dirname(dbPath), { recursive: true });

const db = new DatabaseSync(dbPath);
db.exec(readFileSync(schemaPath, "utf8"));

const transactionColumns = "id, name, amount, currency, direction, date, iranianDate, note, createdAt, updatedAt";

function normalizeTransaction(record) {
  return {
    id: String(record.id || randomUUID()),
    name: String(record.name || "").trim().replace(/\s+/g, " "),
    amount: Number(record.amount),
    currency: record.currency === "TOMAN" ? "TOMAN" : "USD",
    direction: record.direction === "iOwe" ? "iOwe" : "theyOwe",
    date: typeof record.date === "string" ? record.date : "",
    iranianDate: typeof record.iranianDate === "string" ? record.iranianDate : "",
    note: typeof record.note === "string" ? record.note : "",
    createdAt: Number.isFinite(Number(record.createdAt)) ? Number(record.createdAt) : Date.now(),
    updatedAt: Number.isFinite(Number(record.updatedAt)) ? Number(record.updatedAt) : null,
  };
}

function validateTransaction(record) {
  if (!record.name) throw new Error("Transaction name is required.");
  if (!Number.isFinite(record.amount) || record.amount <= 0) throw new Error("Transaction amount must be greater than 0.");
  if (record.currency === "TOMAN" && !Number.isInteger(record.amount)) throw new Error("Toman amounts must be whole numbers.");
  if (record.currency !== "USD" && record.currency !== "TOMAN") throw new Error("Unsupported currency.");
  if (record.direction !== "theyOwe" && record.direction !== "iOwe") throw new Error("Unsupported direction.");
}

function addAudit(action, details = {}) {
  if (!action) return;
  db.prepare("INSERT INTO audit_log (id, action, details, createdAt) VALUES (?, ?, ?, ?)").run(
    randomUUID(),
    action,
    JSON.stringify(details),
    Date.now(),
  );
}

export function getTransactions() {
  return db.prepare(`SELECT ${transactionColumns} FROM transactions ORDER BY createdAt ASC`).all();
}

export function getTransaction(id) {
  return db.prepare(`SELECT ${transactionColumns} FROM transactions WHERE id = ?`).get(id);
}

export function createTransaction(record, audit = {}) {
  const normalized = normalizeTransaction(record);
  validateTransaction(normalized);

  db.prepare(
    `INSERT INTO transactions (${transactionColumns}) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  ).run(
    normalized.id,
    normalized.name,
    normalized.amount,
    normalized.currency,
    normalized.direction,
    normalized.date,
    normalized.iranianDate,
    normalized.note,
    normalized.createdAt,
    normalized.updatedAt,
  );
  addAudit(audit.action || "record-created", audit.details || { record: normalized });
  return normalized;
}

export function updateTransaction(id, record, audit = {}) {
  const before = getTransaction(id);
  if (!before) throw new Error("Transaction not found.");

  const normalized = normalizeTransaction({ ...record, id, createdAt: record.createdAt || before.createdAt, updatedAt: Date.now() });
  validateTransaction(normalized);

  db.prepare(
    `UPDATE transactions
     SET name = ?, amount = ?, currency = ?, direction = ?, date = ?, iranianDate = ?, note = ?, createdAt = ?, updatedAt = ?
     WHERE id = ?`,
  ).run(
    normalized.name,
    normalized.amount,
    normalized.currency,
    normalized.direction,
    normalized.date,
    normalized.iranianDate,
    normalized.note,
    normalized.createdAt,
    normalized.updatedAt,
    id,
  );
  addAudit(audit.action || "record-updated", audit.details || { before, after: normalized });
  return normalized;
}

export function deleteTransaction(id, audit = {}) {
  const record = getTransaction(id);
  if (!record) return false;

  db.prepare("DELETE FROM transactions WHERE id = ?").run(id);
  addAudit(audit.action || "record-deleted", audit.details || { record });
  return true;
}

export function clearTransactions(audit = {}) {
  const clearedCount = db.prepare("SELECT COUNT(*) AS count FROM transactions").get().count;
  db.prepare("DELETE FROM transactions").run();
  addAudit(audit.action || "records-cleared", audit.details || { clearedCount });
  return { clearedCount };
}

export function replaceTransactions(records, audit = {}) {
  const normalizedRecords = records.map((record) => {
    const normalized = normalizeTransaction(record);
    validateTransaction(normalized);
    return normalized;
  });

  db.exec("BEGIN");
  try {
    db.prepare("DELETE FROM transactions").run();
    const insert = db.prepare(`INSERT INTO transactions (${transactionColumns}) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);
    for (const record of normalizedRecords) {
      insert.run(
        record.id,
        record.name,
        record.amount,
        record.currency,
        record.direction,
        record.date,
        record.iranianDate,
        record.note,
        record.createdAt,
        record.updatedAt,
      );
    }
    addAudit(audit.action || "backup-imported", audit.details || { importedCount: normalizedRecords.length });
    db.exec("COMMIT");
  } catch (error) {
    db.exec("ROLLBACK");
    throw error;
  }

  return normalizedRecords;
}

export function getSetting(key) {
  const row = db.prepare("SELECT value FROM settings WHERE key = ?").get(key);
  return row?.value ?? "";
}

export function setSetting(key, value) {
  db.prepare(
    `INSERT INTO settings (key, value, updatedAt) VALUES (?, ?, ?)
     ON CONFLICT(key) DO UPDATE SET value = excluded.value, updatedAt = excluded.updatedAt`,
  ).run(key, String(value ?? ""), Date.now());
}

export { dbPath };
