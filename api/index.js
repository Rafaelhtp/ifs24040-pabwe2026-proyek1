// Entry point Serverless Function Vercel untuk mengarahkan request /api/* dan /uploads/* ke Express app
const os = require('node:os');
const path = require('node:path');

if (!process.env.JWT_SECRET) {
  process.env.JWT_SECRET = process.env.VERCEL_PROJECT_ID || 'moodify-vercel-runtime-key';
}

if (process.env.VERCEL) {
  if (!process.env.DB_PATH) {
    process.env.DB_PATH = path.join(os.tmpdir(), 'moodify.db');
  }
  if (!process.env.UPLOAD_DIR) {
    process.env.UPLOAD_DIR = path.join(os.tmpdir(), 'moodify-uploads');
  }
}

const app = require('../backend/src/app');

module.exports = app;
