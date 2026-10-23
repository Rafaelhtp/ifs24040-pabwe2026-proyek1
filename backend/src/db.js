// Koneksi SQLite menggunakan bun:sqlite (serta fallback node:sqlite untuk container node:24-alpine di CI)
const fs = require('fs');
const os = require('os');
const path = require('path');
const { seedDatabase } = require('./seed');

const rawDbPath = process.env.DB_PATH || path.join(__dirname, '..', 'moodify.db');
const isMemory = rawDbPath === ':memory:';
let resolvedDbPath = isMemory ? ':memory:' : path.resolve(process.cwd(), rawDbPath);

if (!isMemory) {
  try {
    const dir = path.dirname(resolvedDbPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    // Pastikan direktori dapat ditulis oleh user 1000:1000 di container Alpine
    fs.accessSync(dir, fs.constants.W_OK);
  } catch (_err) {
    resolvedDbPath = path.join(os.tmpdir(), 'moodify.db');
  }
}

let db;

if (typeof Bun !== 'undefined') {
  // Gunakan bun:sqlite bawaan Bun (tanpa kompilasi native C++)
  const { Database } = require('bun:sqlite');
  const sqlite = new Database(resolvedDbPath);
  sqlite.run('PRAGMA foreign_keys = ON');
  db = sqlite;
} else {
  // Fallback ke node:sqlite bawaan Node 24 saat stage Test CI menjalankan npx vitest di node:24-alpine
  const { DatabaseSync } = require('node:sqlite');
  const rawDb = new DatabaseSync(resolvedDbPath);
  rawDb.exec('PRAGMA foreign_keys = ON');
  db = {
    run: (sql, ...params) => rawDb.prepare(sql).run(...params),
    exec: (sql) => rawDb.exec(sql),
    query: (sql) => rawDb.prepare(sql),
    prepare: (sql) => rawDb.prepare(sql),
    transaction: (fn) => (...args) => {
      rawDb.exec('BEGIN');
      try {
        const result = fn(...args);
        rawDb.exec('COMMIT');
        return result;
      } catch (err) {
        rawDb.exec('ROLLBACK');
        throw err;
      }
    },
    close: () => rawDb.close()
  };
}

// Jalankan schema.sql
const schemaPath = path.join(__dirname, 'schema.sql');
const schemaSql = fs.readFileSync(schemaPath, 'utf-8');
db.exec(schemaSql);

// Jalankan seed otomatis jika tabel masih kosong
seedDatabase(db);

db.dbPath = resolvedDbPath;
module.exports = db;
