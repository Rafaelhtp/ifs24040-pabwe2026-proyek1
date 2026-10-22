// Pengujian otomatis REST API Moodify menggunakan Jest dan Supertest
const fs = require('fs');
const path = require('path');

// Gunakan database in-memory dan folder upload khusus test agar terpisah dari data utama
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-secret';
process.env.DB_PATH = ':memory:';
process.env.UPLOAD_DIR = './uploads_test';

const request = require('supertest');
const app = require('../src/app');
const db = require('../src/db');

describe('Moodify REST API Integration Tests', () => {
  let userToken = '';
  let secondUserToken = '';
  let createdEntryId = null;

  afterAll(() => {
    // Bersihkan direktori upload sementara setelah seluruh pengujian selesai
    const testUploadDir = path.resolve(process.cwd(), './uploads_test');
    if (fs.existsSync(testUploadDir)) {
      fs.rmSync(testUploadDir, { recursive: true, force: true });
    }
    if (db && typeof db.close === 'function') {
      db.close();
    }
  });

  // 1. GET /api/health
  test('1. GET /api/health mengembalikan status ok (200)', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toEqual({ status: 'ok' });
  });

  // 2. Register sukses
  test('2. POST /api/auth/register berhasil mendaftarkan akun baru (201)', async () => {
    const res = await request(app).post('/api/auth/register').send({
      name: 'Budi Santoso',
      email: 'budi@moodify.com',
      password: 'password123'
    });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.token).toBeDefined();
    expect(res.body.data.user).toMatchObject({
      name: 'Budi Santoso',
      email: 'budi@moodify.com'
    });
    expect(res.body.data.user.password_hash).toBeUndefined();
    userToken = res.body.data.token;
  });

  // 3. Register email duplikat (409)
  test('3. POST /api/auth/register menolak email duplikat dengan status 409', async () => {
    const res = await request(app).post('/api/auth/register').send({
      name: 'Budi Duplikat',
      email: 'budi@moodify.com',
      password: 'password123'
    });

    expect(res.status).toBe(409);
    expect(res.body.success).toBe(false);
    expect(res.body.data).toBeNull();
  });

  // 4. Login sukses
  test('4. POST /api/auth/login berhasil dengan kredensial yang benar (200)', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: 'demo@moodify.com',
      password: 'demo12345'
    });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.token).toBeDefined();
    expect(res.body.data.user.email).toBe('demo@moodify.com');
    expect(res.body.data.user.password_hash).toBeUndefined();
  });

  // 5. Login salah (401)
  test('5. POST /api/auth/login gagal dengan password salah (401)', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: 'demo@moodify.com',
      password: 'passwordsalah999'
    });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.data).toBeNull();
  });

  // 6. Akses /api/entries tanpa token (401)
  test('6. GET /api/entries tanpa token ditolak dengan status 401', async () => {
    const res = await request(app).get('/api/entries');
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  // 7. CRUD entri lengkap (Create, Read List, Read Detail, Update, Delete)
  test('7. CRUD /api/entries berjalan lengkap (POST, GET, PUT, DELETE)', async () => {
    const today = new Date().toISOString().slice(0, 10);

    // a. CREATE entri baru dengan gambar PNG valid
    const fakePngBuffer = Buffer.from(
      '89504e470d0a1a0a0000000d49484452000000010000000108060000001f15c4890000000a49444154789c6360000000020001e221bc330000000049454e44ae426082',
      'hex'
    );

    const createRes = await request(app)
      .post('/api/entries')
      .set('Authorization', `Bearer ${userToken}`)
      .field('entry_date', today)
      .field('mood_id', '1')
      .field('energy_level', '4')
      .field('note', 'Catatan jurnal pengujian otomatis')
      .attach('image', fakePngBuffer, { filename: 'test.png', contentType: 'image/png' });

    expect(createRes.status).toBe(201);
    expect(createRes.body.success).toBe(true);
    expect(createRes.body.data.note).toBe('Catatan jurnal pengujian otomatis');
    expect(createRes.body.data.mood_name).toBeDefined();
    expect(createRes.body.data.image_path).toMatch(/\.png$/);
    createdEntryId = createRes.body.data.id;

    // b. READ daftar entri milik user beserta filter dan meta
    const listRes = await request(app)
      .get('/api/entries?q=pengujian&page=1&limit=5')
      .set('Authorization', `Bearer ${userToken}`);

    expect(listRes.status).toBe(200);
    expect(listRes.body.success).toBe(true);
    expect(Array.isArray(listRes.body.data)).toBe(true);
    expect(listRes.body.data.length).toBe(1);
    expect(listRes.body.meta).toMatchObject({
      page: 1,
      limit: 5,
      total: 1
    });

    // c. READ detail entri
    const detailRes = await request(app)
      .get(`/api/entries/${createdEntryId}`)
      .set('Authorization', `Bearer ${userToken}`);

    expect(detailRes.status).toBe(200);
    expect(detailRes.body.data.id).toBe(createdEntryId);

    // d. UPDATE entri
    const updateRes = await request(app)
      .put(`/api/entries/${createdEntryId}`)
      .set('Authorization', `Bearer ${userToken}`)
      .field('entry_date', today)
      .field('mood_id', '2')
      .field('energy_level', '5')
      .field('note', 'Catatan jurnal setelah diperbarui');

    expect(updateRes.status).toBe(200);
    expect(updateRes.body.data.mood_id).toBe(2);
    expect(updateRes.body.data.energy_level).toBe(5);
    expect(updateRes.body.data.note).toBe('Catatan jurnal setelah diperbarui');
  });

  // 8. Akses entri milik user lain (404)
  test('8. Akses entri milik user lain mengembalikan status 404', async () => {
    const regSecond = await request(app).post('/api/auth/register').send({
      name: 'Siti Aminah',
      email: 'siti@moodify.com',
      password: 'password123'
    });
    secondUserToken = regSecond.body.data.token;

    // Coba GET, PUT, dan DELETE entri milik Budi menggunakan token Siti
    const getOtherRes = await request(app)
      .get(`/api/entries/${createdEntryId}`)
      .set('Authorization', `Bearer ${secondUserToken}`);
    expect(getOtherRes.status).toBe(404);

    const delOtherRes = await request(app)
      .delete(`/api/entries/${createdEntryId}`)
      .set('Authorization', `Bearer ${secondUserToken}`);
    expect(delOtherRes.status).toBe(404);

    // Hapus entri menggunakan pemilik aslinya (Budi) -> berhasil (200)
    const delOwnRes = await request(app)
      .delete(`/api/entries/${createdEntryId}`)
      .set('Authorization', `Bearer ${userToken}`);
    expect(delOwnRes.status).toBe(200);
  });

  // 9. Hapus mood yang dipakai (409)
  test('9. DELETE /api/moods/:id ditolak dengan 409 jika mood masih dipakai entri', async () => {
    // Mood id 1 (Senang) sudah dipakai oleh data seed akun demo
    const res = await request(app)
      .delete('/api/moods/1')
      .set('Authorization', `Bearer ${userToken}`);

    expect(res.status).toBe(409);
    expect(res.body.success).toBe(false);
  });

  // 10. GET /api/songs/random
  test('10. GET /api/songs/random mengembalikan 1 lagu acak dan 404 jika mood belum punya lagu', async () => {
    const randomRes = await request(app).get('/api/songs/random?mood_id=1');
    expect(randomRes.status).toBe(200);
    expect(randomRes.body.success).toBe(true);
    expect(randomRes.body.data.title).toBeDefined();
    expect(randomRes.body.data.mood_name).toBe('Senang');

    // Buat mood baru yang belum memiliki lagu sama sekali
    const newMoodRes = await request(app)
      .post('/api/moods')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ name: 'Nostalgia', emoji: '🥹', color: '#EC4899' });
    const emptyMoodId = newMoodRes.body.data.id;

    const emptyRandomRes = await request(app).get(
      `/api/songs/random?mood_id=${emptyMoodId}`
    );
    expect(emptyRandomRes.status).toBe(404);
    expect(emptyRandomRes.body.success).toBe(false);
  });

  // 11. Upload tipe file salah (400)
  test('11. POST /api/entries menolak upload tipe file yang bukan gambar (400)', async () => {
    const today = new Date().toISOString().slice(0, 10);
    const textBuffer = Buffer.from('Ini adalah file teks biasa, bukan gambar');

    const res = await request(app)
      .post('/api/entries')
      .set('Authorization', `Bearer ${userToken}`)
      .field('entry_date', today)
      .field('mood_id', '1')
      .field('energy_level', '3')
      .attach('image', textBuffer, { filename: 'dokumen.txt', contentType: 'text/plain' });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  // 12. GET /api/stats/weekly
  test('12. GET /api/stats/weekly mengembalikan statistik 7 hari terakhir secara lengkap', async () => {
    const loginDemo = await request(app).post('/api/auth/login').send({
      email: 'demo@moodify.com',
      password: 'demo12345'
    });
    const demoToken = loginDemo.body.data.token;

    const res = await request(app)
      .get('/api/stats/weekly')
      .set('Authorization', `Bearer ${demoToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.total_entries_7d).toBeGreaterThan(0);
    expect(res.body.data.avg_energy_7d).toBeGreaterThan(0);
    expect(res.body.data.top_mood).toMatchObject({
      id: expect.any(Number),
      name: expect.any(String),
      emoji: expect.any(String),
      color: expect.any(String),
      count: expect.any(Number)
    });
    expect(Array.isArray(res.body.data.by_mood)).toBe(true);
    expect(Array.isArray(res.body.data.daily)).toBe(true);
    expect(res.body.data.daily).toHaveLength(7);
  });

  // 13. GET /api/auth/me & CRUD /api/songs serta /api/moods
  test('13. GET /api/auth/me, GET /api/moods, dan CRUD /api/songs berjalan dengan benar', async () => {
    const meRes = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${userToken}`);
    expect(meRes.status).toBe(200);
    expect(meRes.body.data.email).toBe('budi@moodify.com');

    const moodsRes = await request(app).get('/api/moods');
    expect(moodsRes.status).toBe(200);
    expect(moodsRes.body.data.length).toBeGreaterThanOrEqual(7);

    const songsRes = await request(app).get('/api/songs?mood_id=1&q=Happy');
    expect(songsRes.status).toBe(200);
    expect(songsRes.body.data.length).toBeGreaterThanOrEqual(1);

    const createSongRes = await request(app)
      .post('/api/songs')
      .set('Authorization', `Bearer ${userToken}`)
      .field('title', 'Lagu Baru Test')
      .field('artist', 'Artis Test')
      .field('mood_id', '1')
      .field('link', 'https://www.youtube.com/results?search_query=lagu+baru+test');
    expect(createSongRes.status).toBe(201);
    const songId = createSongRes.body.data.id;

    const updateSongRes = await request(app)
      .put(`/api/songs/${songId}`)
      .set('Authorization', `Bearer ${userToken}`)
      .field('title', 'Lagu Baru Diperbarui')
      .field('artist', 'Artis Test')
      .field('mood_id', '1')
      .field('link', 'https://www.youtube.com/results?search_query=lagu+diperbarui');
    expect(updateSongRes.status).toBe(200);
    expect(updateSongRes.body.data.title).toBe('Lagu Baru Diperbarui');

    const deleteSongRes = await request(app)
      .delete(`/api/songs/${songId}`)
      .set('Authorization', `Bearer ${userToken}`);
    expect(deleteSongRes.status).toBe(200);
  });
});
