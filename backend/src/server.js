// Entry point utama untuk menjalankan server HTTP Moodify API
require('dotenv').config();

if (process.env.NODE_ENV !== 'test' && (!process.env.JWT_SECRET || !process.env.JWT_SECRET.trim())) {
  console.error(
    '[ERROR] Variabel environment JWT_SECRET belum diatur! Silakan salin .env.example ke .env dan isi JWT_SECRET.'
  );
  process.exit(1);
}

const app = require('./app');
const db = require('./db');

const PORT = Number(process.env.PORT) || 5000;

try {
  const moodCount = db.prepare('SELECT COUNT(*) as count FROM moods').get().count;
  const songCount = db.prepare('SELECT COUNT(*) as count FROM songs').get().count;

  const server = app.listen(PORT, () => {
    console.log(`Moodify API berjalan di http://localhost:${PORT}`);
    console.log(`Lokasi database : ${db.dbPath}`);
    console.log(`Data tersedia   : ${moodCount} mood, ${songCount} lagu`);
  });

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.error(
        `[ERROR] Port ${PORT} sedang digunakan oleh aplikasi lain. Silakan ubah PORT di file .env.`
      );
    } else {
      console.error(`[ERROR] Gagal menjalankan server: ${err.message}`);
    }
    process.exit(1);
  });
} catch (err) {
  console.error(`[ERROR] Terjadi kegagalan saat inisialisasi server: ${err.message}`);
  process.exit(1);
}
