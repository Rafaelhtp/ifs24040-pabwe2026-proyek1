// Konfigurasi koneksi SQLite, inisialisasi skema, dan seed otomatis
const fs = require('fs');
const path = require('path');
const Database = require('better-sqlite3');
const { seedDatabase } = require('./seed');

const rawDbPath = process.env.DB_PATH || './moodify.db';
const isMemory = rawDbPath === ':memory:';
const resolvedDbPath = isMemory ? ':memory:' : path.resolve(process.cwd(), rawDbPath);

if (!isMemory) {
  const dir = path.dirname(resolvedDbPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

const db = new Database(resolvedDbPath);

// Aktifkan foreign keys
db.pragma('foreign_keys = ON');

// Jalankan schema.sql
const schemaPath = path.join(__dirname, 'schema.sql');
const schemaSql = fs.readFileSync(schemaPath, 'utf-8');
db.exec(schemaSql);

// Jalankan seed jika tabel masih kosong
seedDatabase(db);

module.exports = db;
module.exports.dbPath = resolvedDbPath;
