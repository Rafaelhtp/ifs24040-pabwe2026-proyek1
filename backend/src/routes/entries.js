// Route untuk pengelolaan entri jurnal mood harian (hanya milik user yang sedang login)
const express = require('express');
const { body } = require('express-validator');
const db = require('../db');
const {
  authMiddleware,
  uploadSingle,
  validate,
  removeUploadedFile
} = require('../middleware');

const router = express.Router();

// Semua endpoint entries wajib autentikasi JWT
router.use(authMiddleware);

// Validasi field entri
const entryValidationRules = [
  body('entry_date')
    .trim()
    .notEmpty()
    .withMessage('Tanggal entri wajib diisi')
    .matches(/^\d{4}-\d{2}-\d{2}$/)
    .withMessage('Format tanggal harus YYYY-MM-DD')
    .custom((val) => {
      const parsed = new Date(`${val}T00:00:00Z`);
      if (Number.isNaN(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== val) {
        throw new Error('Tanggal tidak valid');
      }
      return true;
    }),
  body('mood_id')
    .notEmpty()
    .withMessage('mood_id wajib diisi')
    .isInt({ min: 1 })
    .withMessage('mood_id harus berupa angka bulat positif')
    .custom((val) => {
      const mood = db.prepare('SELECT id FROM moods WHERE id = ?').get(Number(val));
      if (!mood) {
        throw new Error('Mood tidak ditemukan di database');
      }
      return true;
    }),
  body('energy_level')
    .notEmpty()
    .withMessage('energy_level wajib diisi')
    .isInt({ min: 1, max: 5 })
    .withMessage('energy_level harus bernilai antara 1 sampai 5'),
  body('note').optional({ nullable: true }).isString().withMessage('Catatan harus berupa teks')
];

// Query helper untuk mengambil 1 entri lengkap dengan JOIN moods
const selectEntryByIdStmt = db.prepare(`
  SELECT
    e.id,
    e.user_id,
    e.entry_date,
    e.mood_id,
    e.energy_level,
    e.note,
    e.image_path,
    e.created_at,
    e.updated_at,
    m.name AS mood_name,
    m.emoji,
    m.color
  FROM entries e
  JOIN moods m ON e.mood_id = m.id
  WHERE e.id = ? AND e.user_id = ?
`);

// GET /api/entries?mood_id=&from=&to=&q=&page=&limit=
router.get('/', (req, res, next) => {
  try {
    const userId = req.user.id;
    const { mood_id, from, to, q } = req.query;
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.max(1, Math.min(100, parseInt(req.query.limit, 10) || 10));
    const offset = (page - 1) * limit;

    const conditions = ['e.user_id = ?'];
    const params = [userId];

    if (mood_id !== undefined && mood_id !== '') {
      conditions.push('e.mood_id = ?');
      params.push(Number(mood_id));
    }

    if (from) {
      conditions.push('e.entry_date >= ?');
      params.push(from);
    }

    if (to) {
      conditions.push('e.entry_date <= ?');
      params.push(to);
    }

    if (q && q.trim() !== '') {
      conditions.push('e.note LIKE ?');
      params.push(`%${q.trim()}%`);
    }

    const whereClause = conditions.join(' AND ');

    const countRow = db
      .prepare(`SELECT COUNT(*) as total FROM entries e WHERE ${whereClause}`)
      .get(...params);
    const total = countRow.total;

    const rows = db
      .prepare(`
        SELECT
          e.id,
          e.user_id,
          e.entry_date,
          e.mood_id,
          e.energy_level,
          e.note,
          e.image_path,
          e.created_at,
          e.updated_at,
          m.name AS mood_name,
          m.emoji,
          m.color
        FROM entries e
        JOIN moods m ON e.mood_id = m.id
        WHERE ${whereClause}
        ORDER BY e.entry_date DESC, e.id DESC
        LIMIT ? OFFSET ?
      `)
      .all(...params, limit, offset);

    return res.status(200).json({
      success: true,
      data: rows,
      meta: {
        page,
        limit,
        total,
        total_pages: Math.ceil(total / limit) || 1
      },
      message: 'Daftar entri jurnal berhasil diambil'
    });
  } catch (err) {
    return next(err);
  }
});

// GET /api/entries/:id
router.get('/:id', (req, res, next) => {
  try {
    const entryId = Number(req.params.id);
    const entry = selectEntryByIdStmt.get(entryId, req.user.id);

    if (!entry) {
      return res.status(404).json({
        success: false,
        data: null,
        message: 'Entri jurnal tidak ditemukan',
        errors: []
      });
    }

    return res.status(200).json({
      success: true,
      data: entry,
      message: 'Detail entri jurnal berhasil diambil'
    });
  } catch (err) {
    return next(err);
  }
});

// POST /api/entries (multipart/form-data, field gambar "image" opsional)
router.post(
  '/',
  uploadSingle('image'),
  entryValidationRules,
  validate,
  (req, res, next) => {
    try {
      const userId = req.user.id;
      const entryDate = req.body.entry_date.trim();
      const moodId = Number(req.body.mood_id);
      const energyLevel = Number(req.body.energy_level);
      const note = req.body.note !== undefined ? req.body.note : null;
      const imagePath = req.file ? req.file.filename : null;

      const info = db
        .prepare(`
          INSERT INTO entries (user_id, entry_date, mood_id, energy_level, note, image_path)
          VALUES (?, ?, ?, ?, ?, ?)
        `)
        .run(userId, entryDate, moodId, energyLevel, note, imagePath);

      const createdEntry = selectEntryByIdStmt.get(info.lastInsertRowid, userId);

      return res.status(201).json({
        success: true,
        data: createdEntry,
        message: 'Entri jurnal berhasil dibuat'
      });
    } catch (err) {
      return next(err);
    }
  }
);

// PUT /api/entries/:id (multipart/form-data, opsional ganti gambar)
router.put(
  '/:id',
  uploadSingle('image'),
  (req, res, next) => {
    // Pastikan entri milik user ada sebelum menjalankan validasi
    const entryId = Number(req.params.id);
    const existing = db
      .prepare('SELECT * FROM entries WHERE id = ? AND user_id = ?')
      .get(entryId, req.user.id);

    if (!existing) {
      if (req.file && req.file.filename) {
        removeUploadedFile(req.file.filename);
      }
      return res.status(404).json({
        success: false,
        data: null,
        message: 'Entri jurnal tidak ditemukan',
        errors: []
      });
    }

    req.existingEntry = existing;
    return next();
  },
  entryValidationRules,
  validate,
  (req, res, next) => {
    try {
      const existing = req.existingEntry;
      const entryDate = req.body.entry_date.trim();
      const moodId = Number(req.body.mood_id);
      const energyLevel = Number(req.body.energy_level);
      const note = req.body.note !== undefined ? req.body.note : existing.note;

      let imagePath = existing.image_path;
      if (req.file) {
        if (existing.image_path) {
          removeUploadedFile(existing.image_path);
        }
        imagePath = req.file.filename;
      }

      db.prepare(`
        UPDATE entries
        SET entry_date = ?, mood_id = ?, energy_level = ?, note = ?, image_path = ?, updated_at = datetime('now')
        WHERE id = ? AND user_id = ?
      `).run(entryDate, moodId, energyLevel, note, imagePath, existing.id, req.user.id);

      const updatedEntry = selectEntryByIdStmt.get(existing.id, req.user.id);

      return res.status(200).json({
        success: true,
        data: updatedEntry,
        message: 'Entri jurnal berhasil diperbarui'
      });
    } catch (err) {
      return next(err);
    }
  }
);

// DELETE /api/entries/:id
router.delete('/:id', (req, res, next) => {
  try {
    const entryId = Number(req.params.id);
    const existing = db
      .prepare('SELECT * FROM entries WHERE id = ? AND user_id = ?')
      .get(entryId, req.user.id);

    if (!existing) {
      return res.status(404).json({
        success: false,
        data: null,
        message: 'Entri jurnal tidak ditemukan',
        errors: []
      });
    }

    db.prepare('DELETE FROM entries WHERE id = ? AND user_id = ?').run(
      entryId,
      req.user.id
    );

    if (existing.image_path) {
      removeUploadedFile(existing.image_path);
    }

    return res.status(200).json({
      success: true,
      data: { id: entryId },
      message: 'Entri jurnal berhasil dihapus'
    });
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
