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

// Matikan header x-powered-by demi keamanan
app.disable('x-powered-by');

// Middleware header keamanan dasar (kompatibel penuh dengan Bun & Node tanpa merusak aset)
app.use((_req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Cross-Origin-Opener-Policy', 'same-origin-allow-popups');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  next();
});

// Konfigurasi CORS (mendukung banyak origin yang dipisahkan koma atau origin yang sama saat deploy)
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

// Sajikan robots.txt secara eksplisit sebagai text/plain agar SEO Lighthouse selalu valid (bukan fallback index.html)
app.get('/robots.txt', (_req, res) => {
  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  res.setHeader('Cache-Control', 'public, max-age=3600');
  return res.status(200).send('User-agent: *\nAllow: /\n');
});

// Layani file gambar statis di /uploads
app.use(
  '/uploads',
  express.static(getUploadDir(), {
    maxAge: '7d'
  })
);

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

// Helper pencari direktori build frontend (frontend/dist atau dist)
function resolveFrontendDist() {
  const candidates = [
    path.resolve(__dirname, '../../frontend/dist'),
    path.resolve(__dirname, '../../dist')
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
  app.use(
    express.static(initialDistDir, {
      index: false,
      maxAge: '1h'
    })
  );
}

// Fallback SPA untuk seluruh rute frontend (seperti /auth/login, /songs, /dashboard, /journal, /stats, /moods)
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api') || req.path.startsWith('/uploads')) {
    return next();
  }
  const activeDistDir = initialDistDir || resolveFrontendDist();
  if (!activeDistDir) {
    return next();
  }

  // Jika request meminta file statis di dist (mis. /favicon.svg), sajikan langsung jika ada
  const requestedFile = path.join(activeDistDir, req.path);
  if (
    req.path !== '/' &&
    fs.existsSync(requestedFile) &&
    fs.statSync(requestedFile).isFile()
  ) {
    return res.sendFile(requestedFile);
  }

  res.setHeader('Cache-Control', 'no-cache');
  return res.sendFile(path.join(activeDistDir, 'index.html'));
});

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
