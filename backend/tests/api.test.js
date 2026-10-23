// Pengujian otomatis REST API Moodify menggunakan bun:test & fetch bawaan (tanpa bergantung pada file .env)
const fs = require('fs');
const os = require('os');
const path = require('path');

// Set variabel environment pengujian di awal sebelum meng-import app dan db
const testUploadDir = path.join(os.tmpdir(), `moodify-test-uploads-${Date.now()}`);
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-secret-moodify-ci-2026';
process.env.DB_PATH = ':memory:';
process.env.UPLOAD_DIR = testUploadDir;

const { describe, test, expect, beforeAll, afterAll } =
  typeof Bun !== 'undefined' ? require('bun:test') : globalThis;
const app = require('../src/app');
const db = require('../src/db');

describe('Moodify REST API Integration Tests', () => {
  let server;
  let baseUrl = '';
  let userToken = '';
  let secondUserToken = '';
  let createdEntryId = null;

  beforeAll(async () => {
    await new Promise((resolve) => {
      server = app.listen(0, '127.0.0.1', () => {
        const addr = server.address();
        baseUrl = `http://127.0.0.1:${addr.port}`;
        resolve();
      });
    });
  });

  afterAll(async () => {
    if (server) {
      await new Promise((resolve) => server.close(resolve));
    }
    if (fs.existsSync(testUploadDir)) {
      fs.rmSync(testUploadDir, { recursive: true, force: true });
    }
    if (db && typeof db.close === 'function') {
      db.close();
    }
  });

  // 1. GET /api/health
  test('1. GET /api/health mengembalikan status ok (200)', async () => {
    const res = await fetch(`${baseUrl}/api/health`);
    const body = await res.json();
    expect(res.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.data).toEqual({ status: 'ok' });
  });

  // 2. Register sukses
  test('2. POST /api/auth/register berhasil mendaftarkan akun baru (201)', async () => {
    const res = await fetch(`${baseUrl}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Budi Santoso',
        email: 'budi@moodify.com',
        password: 'password123'
      })
    });
    const body = await res.json();

    expect(res.status).toBe(201);
    expect(body.success).toBe(true);
    expect(body.data.token).toBeDefined();
    expect(body.data.user.name).toBe('Budi Santoso');
    expect(body.data.user.email).toBe('budi@moodify.com');
    expect(body.data.user.password_hash).toBeUndefined();
    userToken = body.data.token;
  });

  // 3. Register email duplikat (409)
  test('3. POST /api/auth/register menolak email duplikat dengan status 409', async () => {
    const res = await fetch(`${baseUrl}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Budi Duplikat',
        email: 'budi@moodify.com',
        password: 'password123'
      })
    });
    const body = await res.json();

    expect(res.status).toBe(409);
    expect(body.success).toBe(false);
    expect(body.data).toBeNull();
  });

  // 4. Login sukses
  test('4. POST /api/auth/login berhasil dengan kredensial yang benar (200)', async () => {
    const res = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'demo@moodify.com',
        password: 'demo12345'
      })
    });
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.data.token).toBeDefined();
    expect(body.data.user.email).toBe('demo@moodify.com');
    expect(body.data.user.password_hash).toBeUndefined();
  });

  // 5. Login salah (401)
  test('5. POST /api/auth/login gagal dengan password salah (401)', async () => {
    const res = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'demo@moodify.com',
        password: 'passwordsalah999'
      })
    });
    const body = await res.json();

    expect(res.status).toBe(401);
    expect(body.success).toBe(false);
    expect(body.data).toBeNull();
  });

  // 6. Akses /api/entries tanpa token (401)
  test('6. GET /api/entries tanpa token ditolak dengan status 401', async () => {
    const res = await fetch(`${baseUrl}/api/entries`);
    const body = await res.json();
    expect(res.status).toBe(401);
    expect(body.success).toBe(false);
  });

  // 7. CRUD entri lengkap (Create, Read List, Read Detail, Update, Delete)
  test('7. CRUD /api/entries berjalan lengkap (POST, GET, PUT, DELETE)', async () => {
    const today = new Date().toISOString().slice(0, 10);
    const pngBytes = Uint8Array.from(
      Buffer.from(
        '89504e470d0a1a0a0000000d49484452000000010000000108060000001f15c4890000000a49444154789c6360000000020001e221bc330000000049454e44ae426082',
        'hex'
      )
    );

    const createFd = new FormData();
    createFd.append('entry_date', today);
    createFd.append('mood_id', '1');
    createFd.append('energy_level', '4');
    createFd.append('note', 'Catatan jurnal pengujian otomatis');
    createFd.append('image', new Blob([pngBytes], { type: 'image/png' }), 'test.png');

    const createRes = await fetch(`${baseUrl}/api/entries`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${userToken}` },
      body: createFd
    });
    const createBody = await createRes.json();

    expect(createRes.status).toBe(201);
    expect(createBody.success).toBe(true);
    expect(createBody.data.note).toBe('Catatan jurnal pengujian otomatis');
    expect(createBody.data.mood_name).toBeDefined();
    expect(createBody.data.image_path).toMatch(/\.png$/);
    createdEntryId = createBody.data.id;

    // b. READ daftar entri milik user beserta filter dan meta
    const listRes = await fetch(
      `${baseUrl}/api/entries?q=pengujian&mood_id=1&from=${today}&to=${today}&page=1&limit=5`,
      {
        headers: { Authorization: `Bearer ${userToken}` }
      }
    );
    const listBody = await listRes.json();

    expect(listRes.status).toBe(200);
    expect(listBody.success).toBe(true);
    expect(Array.isArray(listBody.data)).toBe(true);
    expect(listBody.data.length).toBe(1);
    expect(listBody.meta.page).toBe(1);
    expect(listBody.meta.total).toBe(1);

    // c. READ detail entri
    const detailRes = await fetch(`${baseUrl}/api/entries/${createdEntryId}`, {
      headers: { Authorization: `Bearer ${userToken}` }
    });
    const detailBody = await detailRes.json();
    expect(detailRes.status).toBe(200);
    expect(detailBody.data.id).toBe(createdEntryId);

    // d. UPDATE entri
    const updateFd = new FormData();
    updateFd.append('entry_date', today);
    updateFd.append('mood_id', '2');
    updateFd.append('energy_level', '5');
    updateFd.append('note', 'Catatan jurnal setelah diperbarui');

    const updateRes = await fetch(`${baseUrl}/api/entries/${createdEntryId}`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${userToken}` },
      body: updateFd
    });
    const updateBody = await updateRes.json();

    expect(updateRes.status).toBe(200);
    expect(updateBody.data.mood_id).toBe(2);
    expect(updateBody.data.energy_level).toBe(5);
    expect(updateBody.data.note).toBe('Catatan jurnal setelah diperbarui');
  });

  // 8. Akses entri milik user lain (404)
  test('8. Akses entri milik user lain mengembalikan status 404', async () => {
    const regSecond = await fetch(`${baseUrl}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Siti Aminah',
        email: 'siti@moodify.com',
        password: 'password123'
      })
    });
    const regSecondBody = await regSecond.json();
    secondUserToken = regSecondBody.data.token;

    const getOtherRes = await fetch(`${baseUrl}/api/entries/${createdEntryId}`, {
      headers: { Authorization: `Bearer ${secondUserToken}` }
    });
    expect(getOtherRes.status).toBe(404);

    const delOtherRes = await fetch(`${baseUrl}/api/entries/${createdEntryId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${secondUserToken}` }
    });
    expect(delOtherRes.status).toBe(404);

    const delOwnRes = await fetch(`${baseUrl}/api/entries/${createdEntryId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${userToken}` }
    });
    expect(delOwnRes.status).toBe(200);
  });

  // 9. Hapus mood yang dipakai (409)
  test('9. DELETE /api/moods/:id ditolak dengan 409 jika mood masih dipakai entri', async () => {
    const res = await fetch(`${baseUrl}/api/moods/1`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${userToken}` }
    });
    const body = await res.json();

    expect(res.status).toBe(409);
    expect(body.success).toBe(false);
  });

  // 10. GET /api/songs/random
  test('10. GET /api/songs/random mengembalikan 1 lagu acak dan 404 jika mood belum punya lagu', async () => {
    const randomRes = await fetch(`${baseUrl}/api/songs/random?mood_id=1`);
    const randomBody = await randomRes.json();
    expect(randomRes.status).toBe(200);
    expect(randomBody.success).toBe(true);
    expect(randomBody.data.title).toBeDefined();
    expect(randomBody.data.mood_name).toBe('Senang');

    const newMoodRes = await fetch(`${baseUrl}/api/moods`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${userToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ name: 'Nostalgia', emoji: '🥹', color: '#EC4899' })
    });
    const newMoodBody = await newMoodRes.json();
    const emptyMoodId = newMoodBody.data.id;

    const emptyRandomRes = await fetch(
      `${baseUrl}/api/songs/random?mood_id=${emptyMoodId}`
    );
    expect(emptyRandomRes.status).toBe(404);

    // Update & Delete mood baru yang tidak dipakai
    const updMoodRes = await fetch(`${baseUrl}/api/moods/${emptyMoodId}`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${userToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ name: 'Nostalgia Indah', emoji: '🥹', color: '#EC4899' })
    });
    expect(updMoodRes.status).toBe(200);

    const delMoodRes = await fetch(`${baseUrl}/api/moods/${emptyMoodId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${userToken}` }
    });
    expect(delMoodRes.status).toBe(200);
  });

  // 11. Upload tipe file salah (400)
  test('11. POST /api/entries menolak upload tipe file yang bukan gambar (400)', async () => {
    const today = new Date().toISOString().slice(0, 10);
    const fd = new FormData();
    fd.append('entry_date', today);
    fd.append('mood_id', '1');
    fd.append('energy_level', '3');
    fd.append(
      'image',
      new Blob(['Ini file teks biasa'], { type: 'text/plain' }),
      'dokumen.txt'
    );

    const res = await fetch(`${baseUrl}/api/entries`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${userToken}` },
      body: fd
    });
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.success).toBe(false);
  });

  // 12. GET /api/stats/weekly
  test('12. GET /api/stats/weekly mengembalikan statistik 7 hari terakhir secara lengkap', async () => {
    const loginDemo = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'demo@moodify.com',
        password: 'demo12345'
      })
    });
    const loginDemoBody = await loginDemo.json();
    const demoToken = loginDemoBody.data.token;

    const res = await fetch(`${baseUrl}/api/stats/weekly`, {
      headers: { Authorization: `Bearer ${demoToken}` }
    });
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.data.total_entries_7d).toBeGreaterThan(0);
    expect(body.data.avg_energy_7d).toBeGreaterThan(0);
    expect(body.data.top_mood.name).toBeDefined();
    expect(Array.isArray(body.data.by_mood)).toBe(true);
    expect(Array.isArray(body.data.daily)).toBe(true);
    expect(body.data.daily).toHaveLength(7);
  });

  // 13. GET /api/auth/me, GET /api/moods, dan CRUD /api/songs
  test('13. GET /api/auth/me, GET /api/moods, dan CRUD /api/songs berjalan dengan benar', async () => {
    const meRes = await fetch(`${baseUrl}/api/auth/me`, {
      headers: { Authorization: `Bearer ${userToken}` }
    });
    const meBody = await meRes.json();
    expect(meRes.status).toBe(200);
    expect(meBody.data.email).toBe('budi@moodify.com');

    const moodsRes = await fetch(`${baseUrl}/api/moods`);
    const moodsBody = await moodsRes.json();
    expect(moodsRes.status).toBe(200);
    expect(moodsBody.data.length).toBeGreaterThanOrEqual(7);

    const songsRes = await fetch(`${baseUrl}/api/songs?mood_id=1&q=Happy`);
    const songsBody = await songsRes.json();
    expect(songsRes.status).toBe(200);
    expect(songsBody.data.length).toBeGreaterThanOrEqual(1);

    const createFd = new FormData();
    createFd.append('title', 'Lagu Baru Test');
    createFd.append('artist', 'Artis Test');
    createFd.append('mood_id', '1');
    createFd.append('link', 'https://www.youtube.com/results?search_query=lagu+baru+test');

    const createSongRes = await fetch(`${baseUrl}/api/songs`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${userToken}` },
      body: createFd
    });
    const createSongBody = await createSongRes.json();
    expect(createSongRes.status).toBe(201);
    const songId = createSongBody.data.id;

    const detailSongRes = await fetch(`${baseUrl}/api/songs/${songId}`);
    expect(detailSongRes.status).toBe(200);

    const updateFd = new FormData();
    updateFd.append('title', 'Lagu Baru Diperbarui');
    updateFd.append('artist', 'Artis Test');
    updateFd.append('mood_id', '1');
    updateFd.append('link', 'https://www.youtube.com/results?search_query=lagu+diperbarui');

    const updateSongRes = await fetch(`${baseUrl}/api/songs/${songId}`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${userToken}` },
      body: updateFd
    });
    const updateSongBody = await updateSongRes.json();
    expect(updateSongRes.status).toBe(200);
    expect(updateSongBody.data.title).toBe('Lagu Baru Diperbarui');

    const deleteSongRes = await fetch(`${baseUrl}/api/songs/${songId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${userToken}` }
    });
    expect(deleteSongRes.status).toBe(200);
  });
});
