// Konfigurasi aplikasi Express (tanpa app.listen agar mudah diuji dengan Supertest)
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { getUploadDir, errorHandler } = require('./middleware');

const authRoutes = require('./routes/auth');
const moodRoutes = require('./routes/moods');
const entryRoutes = require('./routes/entries');
const songRoutes = require('./routes/songs');
const statsRoutes = require('./routes/stats');

const app = express();

// Konfigurasi CORS (mendukung banyak origin yang dipisahkan koma)
const rawClientUrls =
  process.env.CLIENT_URL || 'http://localhost:5173,http://localhost:4173';
const allowedOrigins = rawClientUrls
  .split(',')
  .map((item) => item.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Izinkan request tanpa origin (seperti curl, Postman, atau pengujian Supertest)
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

// Registrasi seluruh route utama
app.use('/api/auth', authRoutes);
app.use('/api/moods', moodRoutes);
app.use('/api/entries', entryRoutes);
app.use('/api/songs', songRoutes);
app.use('/api/stats', statsRoutes);

// Handler untuk endpoint yang tidak ditemukan (404)
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
