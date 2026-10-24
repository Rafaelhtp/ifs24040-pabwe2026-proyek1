// Konfigurasi aplikasi Express (tanpa app.listen agar dapat diuji langsung)
const fs = require('node:fs');
const path = require('node:path');
const express = require('express');
const cors = require('cors');
const { getUploadDir, errorHandler } = require('./middleware');

const authRoutes = require('./routes/auth');
const moodRoutes = require('./routes/moods');
const entryRoutes = require('./routes/entries');
const songRoutes = require('./routes/songs');
const statsRoutes = require('./routes/stats');

const NOT_FOUND_MESSAGE = 'Endpoint tidak ditemukan';

const app = express();

// Matikan header x-powered-by demi keamanan
app.disable('x-powered-by');

// Middleware header keamanan dasar
app.use((_req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Cross-Origin-Opener-Policy', 'same-origin-allow-popups');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  next();
});

// Helper pembuatan trace ID sederhana non-kriptografi
function generateTraceId() {
  return Math.random().toString(36).substring(2, 15);
}

// Helper pengecekan origin CORS yang aman dan dapat dikonfigurasi via CLIENT_URL
function isOriginAllowed(origin) {
  if (!origin) return true;
  const rawUrls = process.env.CLIENT_URL || '*';
  const allowedList = new Set(
    rawUrls
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean)
  );
  return allowedList.has('*') || allowedList.has(origin);
}

app.use(
  cors({
    origin: (origin, callback) => {
      if (isOriginAllowed(origin)) {
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

// Sajikan robots.txt secara eksplisit sebagai text/plain untuk kebutuhan SEO
app.get('/robots.txt', (_req, res) => {
  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  res.setHeader('Cache-Control', 'public, max-age=3600');
  return res.status(200).send('User-agent: *\nAllow: /\n');
});

// Layani file gambar statis di /uploads
app.use('/uploads', express.static(getUploadDir(), { maxAge: '7d' }));

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
    message: NOT_FOUND_MESSAGE,
    errors: []
  });
});

// Helper pencari direktori build frontend (frontend/dist atau dist)
function resolveFrontendDist(customCandidates) {
  const candidates = customCandidates || [
    path.resolve(__dirname, '../../frontend/dist'),
    path.resolve(__dirname, '../frontend/dist'),
    path.resolve(__dirname, '../../dist'),
    path.resolve(__dirname, '../dist')
  ];
  return candidates.find((dir) => fs.existsSync(path.join(dir, 'index.html'))) || null;
}

const initialDistDir = resolveFrontendDist();
if (initialDistDir) {
  app.use(
    '/assets',
    express.static(path.join(initialDistDir, 'assets'), {
      maxAge: '1y',
      immutable: true
    })
  );
  app.use(express.static(initialDistDir, { index: false, maxAge: '1h' }));
}

// Fallback SPA untuk rute frontend jika hasil build tersedia
app.get('*', (req, res, next) => {
  const activeDistDir = resolveFrontendDist();
  if (!activeDistDir) {
    return next();
  }
  res.setHeader('Cache-Control', 'no-cache');
  return res.sendFile(path.join(activeDistDir, 'index.html'));
});

// Handler 404 default jika bukan rute SPA
app.use((_req, res) => {
  return res.status(404).json({
    success: false,
    data: null,
    message: NOT_FOUND_MESSAGE,
    errors: []
  });
});

// Global error handler
app.use(errorHandler);

app.isOriginAllowed = isOriginAllowed;
app.resolveFrontendDist = resolveFrontendDist;
app.generateTraceId = generateTraceId;

module.exports = app;
