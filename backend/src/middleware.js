// Middleware autentikasi JWT, upload file (multer), validasi, dan error handler global
const fs = require('fs');
const os = require('os');
const path = require('path');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');
const { validationResult } = require('express-validator');

// Pastikan direktori upload dapat ditulis oleh user 1000:1000 di container Alpine
function getUploadDir() {
  const defaultDir = path.join(__dirname, '..', 'uploads');
  const rawDir = process.env.UPLOAD_DIR || defaultDir;
  let resolved = path.resolve(process.cwd(), rawDir);

  try {
    if (!fs.existsSync(resolved)) {
      fs.mkdirSync(resolved, { recursive: true });
    }
    fs.accessSync(resolved, fs.constants.W_OK);
    return resolved;
  } catch (_err) {
    const fallback = path.join(os.tmpdir(), 'moodify-uploads');
    if (!fs.existsSync(fallback)) {
      fs.mkdirSync(fallback, { recursive: true });
    }
    return fallback;
  }
}

// Hapus file dari folder upload dengan aman jika ada
function removeUploadedFile(filename) {
  if (!filename) return;
  try {
    const safeName = path.basename(filename);
    const filePath = path.join(getUploadDir(), safeName);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  } catch (_err) {
    // Abaikan jika gagal menghapus file lama
  }
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, getUploadDir());
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase() || '.jpg';
    cb(null, `${uuidv4()}${ext}`);
  }
});

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp'];

const fileFilter = (_req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  if (ALLOWED_MIME_TYPES.includes(file.mimetype) && ALLOWED_EXTENSIONS.includes(ext)) {
    cb(null, true);
  } else {
    const err = new Error('Tipe file tidak didukung. Gunakan format JPG, PNG, atau WEBP');
    err.status = 400;
    cb(err, false);
  }
};

const multerInstance = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 2 * 1024 * 1024 // Maksimal 2 MB
  }
});

function uploadSingle(fieldName) {
  return (req, res, next) => {
    const uploader = multerInstance.single(fieldName);
    uploader(req, res, (err) => {
      if (!err) return next();

      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(413).json({
            success: false,
            data: null,
            message: 'Ukuran file terlalu besar. Maksimal 2 MB',
            errors: [{ field: fieldName, message: 'Maksimal ukuran file adalah 2 MB' }]
          });
        }
        return res.status(400).json({
          success: false,
          data: null,
          message: `Kesalahan upload file: ${err.message}`,
          errors: [{ field: fieldName, message: err.message }]
        });
      }

      return res.status(err.status || 400).json({
        success: false,
        data: null,
        message: err.message || 'Gagal mengunggah file',
        errors: [{ field: fieldName, message: err.message || 'File tidak valid' }]
      });
    });
  };
}

function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      data: null,
      message: 'Akses ditolak. Token tidak ditemukan',
      errors: []
    });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = {
      id: decoded.id,
      email: decoded.email,
      name: decoded.name
    };
    return next();
  } catch (_err) {
    return res.status(401).json({
      success: false,
      data: null,
      message: 'Token tidak valid atau sudah kedaluwarsa',
      errors: []
    });
  }
}

function validate(req, res, next) {
  const result = validationResult(req);
  if (result.isEmpty()) {
    return next();
  }

  if (req.file && req.file.filename) {
    removeUploadedFile(req.file.filename);
  }

  const errors = result.array().map((item) => ({
    field: item.path || item.param,
    message: item.msg
  }));

  return res.status(400).json({
    success: false,
    data: null,
    message: errors[0]?.message || 'Validasi input gagal',
    errors
  });
}

function errorHandler(err, req, res, _next) {
  if (req.file && req.file.filename) {
    removeUploadedFile(req.file.filename);
  }

  const statusCode = err.status || 500;
  const isProd = process.env.NODE_ENV === 'production';
  const message =
    statusCode === 500 && isProd
      ? 'Terjadi kesalahan pada server'
      : err.message || 'Terjadi kesalahan pada server';

  const response = {
    success: false,
    data: null,
    message,
    errors: err.errors || []
  };

  if (!isProd && err.stack && statusCode === 500) {
    response.debug = err.stack;
  }

  return res.status(statusCode).json(response);
}

module.exports = {
  authMiddleware,
  uploadSingle,
  validate,
  errorHandler,
  getUploadDir,
  removeUploadedFile
};
