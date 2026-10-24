// Entry point utama untuk menjalankan server HTTP Moodify API dengan Bun
const fs = require('node:fs');
const path = require('node:path');
const { execFileSync } = require('node:child_process');

// Muat file .env dari root atau backend/ jika ada dan belum dimuat otomatis
function loadEnvIfNeeded() { // NOSONAR
  const candidates = [
    path.resolve(process.cwd(), '.env'),
    path.resolve(__dirname, '..', '.env'),
    path.resolve(__dirname, '../..', '.env')
  ];
  for (const envPath of candidates) {
    if (fs.existsSync(envPath)) {
      const content = fs.readFileSync(envPath, 'utf-8');
      for (const line of content.split(/\r?\n/)) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('#')) continue;
        const eqIdx = trimmed.indexOf('=');
        if (eqIdx > 0) {
          const key = trimmed.slice(0, eqIdx).trim();
          const val = trimmed.slice(eqIdx + 1).trim();
          if (!process.env[key]) {
            process.env[key] = val;
          }
        }
      }
    }
  }
}

loadEnvIfNeeded();

if (!process.env.JWT_SECRET?.trim()) {
  process.env.JWT_SECRET = 'moodify-default-jwt-secret-2026';
}

// Bangun aset statis frontend secara otomatis jika belum tersedia saat server dijalankan
function ensureFrontendBuild() {
  if (process.env.NODE_ENV === 'test') return;
  const rootDir = path.resolve(__dirname, '../..');
  const distIndex = path.join(rootDir, 'frontend', 'dist', 'index.html');
  const frontendEntry = path.join(rootDir, 'frontend', 'index.html');

  if (!fs.existsSync(distIndex) && fs.existsSync(frontendEntry)) {
    try {
      process.stdout.write('Membangun aset statis frontend (frontend/dist)...\n');
      execFileSync('bun', ['run', 'build'], { cwd: rootDir, stdio: 'inherit' }); // NOSONAR
    } catch {
      // Lanjutkan menjalankan API meskipun build frontend gagal
    }
  }
}

ensureFrontendBuild();

const app = require('./app');
const db = require('./db');

const PORT = Number(process.env.PORT) || 5000;

try {
  const moodCount = db.prepare('SELECT COUNT(*) as count FROM moods').get()?.count || 0;
  const songCount = db.prepare('SELECT COUNT(*) as count FROM songs').get()?.count || 0;

  const server = app.listen(PORT, () => {
    process.stdout.write(`Moodify API berjalan di http://localhost:${PORT}\n`);
    process.stdout.write(`Lokasi database : ${db.dbPath}\n`);
    process.stdout.write(`Data tersedia   : ${moodCount} mood, ${songCount} lagu\n`);
  });

  server.on('error', (err) => {
    if (err?.code === 'EADDRINUSE') {
      process.stderr.write(
        `[ERROR] Port ${PORT} sedang digunakan oleh aplikasi lain. Silakan ubah PORT di file .env.\n`
      );
    } else {
      process.stderr.write(`[ERROR] Gagal menjalankan server: ${err?.message}\n`);
    }
    process.exit(1);
  });
} catch (err) {
  process.stderr.write(`[ERROR] Terjadi kegagalan saat inisialisasi server: ${err?.message}\n`);
  process.exit(1);
}
