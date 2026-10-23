// Route untuk autentikasi pengguna (register, login, profil me)
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body } = require('express-validator');
const db = require('../db');
const { authMiddleware, validate } = require('../middleware');

const router = express.Router();

function generateToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, name: user.name },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
}

// POST /api/auth/register
router.post(
  '/register',
  [
    body('name').trim().notEmpty().withMessage('Nama wajib diisi'),
    body('email').trim().isEmail().withMessage('Format email tidak valid').normalizeEmail(),
    body('password')
      .isLength({ min: 8 })
      .withMessage('Password minimal 8 karakter')
  ],
  validate,
  (req, res, next) => {
    try {
      const { name, email, password } = req.body;

      const existingUser = db
        .prepare('SELECT id FROM users WHERE lower(email) = lower(?)')
        .get(email);

      if (existingUser) {
        return res.status(409).json({
          success: false,
          data: null,
          message: 'Email sudah digunakan oleh pengguna lain',
          errors: [{ field: 'email', message: 'Email sudah terdaftar' }]
        });
      }

      const passwordHash = bcrypt.hashSync(password, 10);
      const info = db
        .prepare('INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)')
        .run(name.trim(), email.toLowerCase(), passwordHash);

      const user = db
        .prepare('SELECT id, name, email, created_at FROM users WHERE id = ?')
        .get(Number(info.lastInsertRowid));

      const token = generateToken(user);

      return res.status(201).json({
        success: true,
        data: { user, token },
        message: 'Registrasi pengguna berhasil'
      });
    } catch (err) {
      return next(err);
    }
  }
);

// POST /api/auth/login
router.post(
  '/login',
  [
    body('email').trim().isEmail().withMessage('Format email tidak valid'),
    body('password').notEmpty().withMessage('Password wajib diisi')
  ],
  validate,
  (req, res, next) => {
    try {
      const { email, password } = req.body;

      const userRow = db
        .prepare('SELECT id, name, email, password_hash, created_at FROM users WHERE lower(email) = lower(?)')
        .get(email.trim());

      if (!userRow || !bcrypt.compareSync(password, userRow.password_hash)) {
        return res.status(401).json({
          success: false,
          data: null,
          message: 'Email atau password salah',
          errors: []
        });
      }

      const user = {
        id: userRow.id,
        name: userRow.name,
        email: userRow.email,
        created_at: userRow.created_at
      };

      const token = generateToken(user);

      return res.status(200).json({
        success: true,
        data: { user, token },
        message: 'Login berhasil'
      });
    } catch (err) {
      return next(err);
    }
  }
);

// GET /api/auth/me
router.get('/me', authMiddleware, (req, res, next) => {
  try {
    const user = db
      .prepare('SELECT id, name, email, created_at FROM users WHERE id = ?')
      .get(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        data: null,
        message: 'Pengguna tidak ditemukan',
        errors: []
      });
    }

    return res.status(200).json({
      success: true,
      data: user,
      message: 'Profil pengguna berhasil diambil'
    });
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
