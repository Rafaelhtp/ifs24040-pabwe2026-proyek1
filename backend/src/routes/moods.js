// Route untuk pengelolaan daftar mood
const express = require('express');
const { body } = require('express-validator');
const db = require('../db');
const { authMiddleware, validate } = require('../middleware');

const router = express.Router();

// GET /api/moods (publik)
router.get('/', (_req, res, next) => {
  try {
    const moods = db
      .prepare('SELECT id, name, emoji, color, created_at FROM moods ORDER BY id ASC')
      .all();

    return res.status(200).json({
      success: true,
      data: moods,
      message: 'Daftar mood berhasil diambil'
    });
  } catch (err) {
    return next(err);
  }
});

// POST /api/moods (auth)
router.post(
  '/',
  authMiddleware,
  [
    body('name').trim().notEmpty().withMessage('Nama mood wajib diisi'),
    body('emoji').trim().notEmpty().withMessage('Emoji mood wajib diisi'),
    body('color')
      .optional({ values: 'falsy' })
      .trim()
      .matches(/^#[0-9A-Fa-f]{6}$/)
      .withMessage('Format warna harus berupa kode hex (contoh: #FACC15)')
  ],
  validate,
  (req, res, next) => {
    try {
      const name = req.body.name.trim();
      const emoji = req.body.emoji.trim();
      const color = req.body.color ? req.body.color.trim() : '#9CA3AF';

      const duplicate = db
        .prepare('SELECT id FROM moods WHERE lower(name) = lower(?)')
        .get(name);

      if (duplicate) {
        return res.status(409).json({
          success: false,
          data: null,
          message: 'Nama mood sudah ada',
          errors: [{ field: 'name', message: 'Nama mood harus unik' }]
        });
      }

      const info = db
        .prepare('INSERT INTO moods (name, emoji, color) VALUES (?, ?, ?)')
        .run(name, emoji, color);

      const newMood = db
        .prepare('SELECT id, name, emoji, color, created_at FROM moods WHERE id = ?')
        .get(info.lastInsertRowid);

      return res.status(201).json({
        success: true,
        data: newMood,
        message: 'Mood baru berhasil ditambahkan'
      });
    } catch (err) {
      return next(err);
    }
  }
);

// PUT /api/moods/:id (auth)
router.put(
  '/:id',
  authMiddleware,
  [
    body('name').trim().notEmpty().withMessage('Nama mood wajib diisi'),
    body('emoji').trim().notEmpty().withMessage('Emoji mood wajib diisi'),
    body('color')
      .optional({ values: 'falsy' })
      .trim()
      .matches(/^#[0-9A-Fa-f]{6}$/)
      .withMessage('Format warna harus berupa kode hex (contoh: #FACC15)')
  ],
  validate,
  (req, res, next) => {
    try {
      const moodId = Number(req.params.id);
      const existing = db.prepare('SELECT * FROM moods WHERE id = ?').get(moodId);

      if (!existing) {
        return res.status(404).json({
          success: false,
          data: null,
          message: 'Mood tidak ditemukan',
          errors: []
        });
      }

      const name = req.body.name.trim();
      const emoji = req.body.emoji.trim();
      const color = req.body.color ? req.body.color.trim() : existing.color;

      const duplicate = db
        .prepare('SELECT id FROM moods WHERE lower(name) = lower(?) AND id != ?')
        .get(name, moodId);

      if (duplicate) {
        return res.status(409).json({
          success: false,
          data: null,
          message: 'Nama mood sudah digunakan',
          errors: [{ field: 'name', message: 'Nama mood harus unik' }]
        });
      }

      db.prepare('UPDATE moods SET name = ?, emoji = ?, color = ? WHERE id = ?').run(
        name,
        emoji,
        color,
        moodId
      );

      const updated = db
        .prepare('SELECT id, name, emoji, color, created_at FROM moods WHERE id = ?')
        .get(moodId);

      return res.status(200).json({
        success: true,
        data: updated,
        message: 'Mood berhasil diperbarui'
      });
    } catch (err) {
      return next(err);
    }
  }
);

// DELETE /api/moods/:id (auth)
router.delete('/:id', authMiddleware, (req, res, next) => {
  try {
    const moodId = Number(req.params.id);
    const existing = db.prepare('SELECT * FROM moods WHERE id = ?').get(moodId);

    if (!existing) {
      return res.status(404).json({
        success: false,
        data: null,
        message: 'Mood tidak ditemukan',
        errors: []
      });
    }

    const usageCount = db
      .prepare('SELECT COUNT(*) as count FROM entries WHERE mood_id = ?')
      .get(moodId).count;

    if (usageCount > 0) {
      return res.status(409).json({
        success: false,
        data: null,
        message: 'Mood tidak dapat dihapus karena masih digunakan oleh entri jurnal',
        errors: []
      });
    }

    db.prepare('DELETE FROM moods WHERE id = ?').run(moodId);

    return res.status(200).json({
      success: true,
      data: { id: moodId },
      message: 'Mood berhasil dihapus'
    });
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
