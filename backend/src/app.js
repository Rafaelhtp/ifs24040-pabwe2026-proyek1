// Konfigurasi aplikasi Express (tanpa app.listen agar dapat diuji langsung)
const fs = require('fs');
const path = require('path');
const express = require('express');
const cors = require('cors');
const { getUploadDir, errorHandler } = require('./middleware');

const authRoutes = require('./routes/auth');
const moodRoutes = require('./routes/moods');
const entryRoutes = require('./routes/entries');
const songRoutes = require('./routes/songs');
const statsRoutes = require('./routes/stats');

const app = express();

// Konfigurasi CORS (mendukung banyak origin yang dipisahkan koma atau semua origin saat deploy)
const rawClientUrls = process.env.CLIENT_URL || '*';
const allowedOrigins = rawClientUrls
  .split(',')
  .map((item) => item.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes('*') || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      const corsErr = new Error(`Origin ${origin} tidak diizinkan oleh kebijakan CORS`);
      corsErr.status = 403;
      return callback(corsErr);
    },
    credentials: true
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Layani file gambar statis di /uploads
app.use('/uploads', express.static(getUploadDir()));

// Endpoint cek kesehatan server
app.get('/api/health', (_req, res) => {
  return res.status(200).json({
    success: true,
    data: { status: 'ok' },
    message: 'Moodify API berjalan normal'
  });
});

// Registrasi seluruh route API utama
app.use('/api/auth', authRoutes);
app.use('/api/moods', moodRoutes);
app.use('/api/entries', entryRoutes);
app.use('/api/songs', songRoutes);
app.use('/api/stats', statsRoutes);

// Handler 404 khusus rute /api/* yang tidak dikenal
app.use('/api', (_req, res) => {
  return res.status(404).json({
    success: false,
    data: null,
    message: 'Endpoint tidak ditemukan',
    errors: []
  });
});

// Jika hasil build frontend (frontend/dist atau dist) tersedia, sajikan lewat express.static dengan fallback SPA
const candidateDistDirs = [
  path.resolve(__dirname, '../../frontend/dist'),
  path.resolve(__dirname, '../../dist')
];
const activeDistDir = candidateDistDirs.find((dir) => fs.existsSync(path.join(dir, 'index.html')));

if (activeDistDir) {
  app.use(express.static(activeDistDir));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api') || req.path.startsWith('/uploads')) {
      return next();
    }
    return res.sendFile(path.join(activeDistDir, 'index.html'));
  });
}

// Handler 404 default jika bukan rute SPA
app.use((_req, res) => {
  return res.status(404).json({
    success: false,
    data: null,
    message: 'Endpoint tidak ditemukan',
    errors: []
  });
});

// Global error handler
app.use(errorHandler);

module.exports = app;
