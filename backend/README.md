# Moodify Backend API

**Moodify** adalah aplikasi web jurnal mood harian yang dilengkapi dengan rekomendasi playlist lagu sesuai suasana hati serta visualisasi statistik mingguan. Folder `backend/` ini berisi layanan REST API mandiri (dilengkapi skema SQLite dan data seed otomatis) yang menyediakan seluruh kebutuhan data untuk aplikasi frontend ReactJS.

---

## 1. Tech Stack

- **Runtime & Bahasa**: Node.js 18+ (LTS), JavaScript (CommonJS)
- **Framework Web**: Express.js
- **Database**: SQLite (`better-sqlite3`) dengan *prepared statements*
- **Autentikasi & Keamanan**: JWT (`jsonwebtoken`) & `bcryptjs`
- **Validasi & Upload**: `express-validator`, `multer`, `uuid`
- **Pengujian Otomatis (CI/CD)**: Jest, Supertest, `cross-env`, dan Jenkins Pipeline

---

## 2. Cara Menjalankan di Komputer Lokal (Mulai dari Clone)

Anda dapat menjalankan server ini secara langsung tanpa perlu melakukan konfigurasi database eksternal:

```bash
# 1. Clone repositori
git clone <URL_REPOSITORY_ANDA>
cd moodify/backend

# 2. Instal seluruh dependensi
npm install

# 3. Salin file .env.example menjadi .env
# Untuk pengguna Windows (Command Prompt / PowerShell):
copy .env.example .env

# Untuk pengguna macOS / Linux (Bash / Zsh):
cp .env.example .env

# 4. Jalankan server
npm start
```

Server akan berjalan di **`http://localhost:5000`**. Saat pertama kali dijalankan, aplikasi secara otomatis membuat file database `moodify.db`, menjalankan skema tabel (`schema.sql`), dan mengisi data awal (*seed data* berupa 7 mood, 35 lagu, akun demo, dan 22 entri jurnal 14 hari terakhir).

Untuk mode pengembangan (*auto-reload* dengan `nodemon`):
```bash
npm run dev
```

---

## 3. Akun Demo

Gunakan akun berikut untuk langsung mencoba fitur login, daftar jurnal, dan grafik mingguan:

| Field | Nilai |
| :--- | :--- |
| **Email** | `demo@moodify.com` |
| **Password** | `demo12345` |

---

## 4. Daftar Seluruh Endpoint API

Seluruh respons API menggunakan format JSON standar:
- Sukses: `{ "success": true, "data": ..., "message": "..." }`
- Gagal: `{ "success": false, "data": null, "message": "...", "errors": [...] }`

| Method | Endpoint | Akses | Deskripsi |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/health` | Publik | Cek status kesehatan server (`{ status: "ok" }`) |
| `POST` | `/api/auth/register` | Publik | Registrasi pengguna baru (`{ name, email, password }`) |
| `POST` | `/api/auth/login` | Publik | Login pengguna (`{ email, password }`) & dapatkan token JWT |
| `GET` | `/api/auth/me` | Auth (JWT) | Ambil data profil pengguna yang sedang login |
| `GET` | `/api/moods` | Publik | Ambil daftar seluruh mood |
| `POST` | `/api/moods` | Auth (JWT) | Tambah mood baru (`{ name, emoji, color }`) |
| `PUT` | `/api/moods/:id` | Auth (JWT) | Perbarui data mood berdasarkan ID |
| `DELETE` | `/api/moods/:id` | Auth (JWT) | Hapus mood (ditolak `409` jika masih digunakan oleh entri jurnal) |
| `GET` | `/api/entries` | Auth (JWT) | Ambil daftar entri milik user (`?mood_id=&from=&to=&q=&page=&limit=`) |
| `GET` | `/api/entries/:id` | Auth (JWT) | Ambil detail 1 entri milik user (`404` jika milik user lain) |
| `POST` | `/api/entries` | Auth (JWT) | Buat entri jurnal baru (`multipart/form-data`, field gambar `image` opsional) |
| `PUT` | `/api/entries/:id` | Auth (JWT) | Perbarui entri jurnal milik user (`multipart/form-data`, field `image` opsional) |
| `DELETE` | `/api/entries/:id` | Auth (JWT) | Hapus entri jurnal milik user beserta file gambarnya |
| `GET` | `/api/songs` | Publik | Ambil daftar lagu rekomendasi (`?mood_id=&q=`) |
| `GET` | `/api/songs/random` | Publik | Ambil 1 lagu acak (`?mood_id=`), `404` jika mood belum punya lagu |
| `GET` | `/api/songs/:id` | Publik | Ambil detail lagu berdasarkan ID |
| `POST` | `/api/songs` | Auth (JWT) | Tambah lagu baru (`multipart/form-data`, field gambar `cover` opsional) |
| `PUT` | `/api/songs/:id` | Auth (JWT) | Perbarui data lagu (`multipart/form-data`, field `cover` opsional) |
| `DELETE` | `/api/songs/:id` | Auth (JWT) | Hapus lagu beserta file sampulnya |
| `GET` | `/api/stats/weekly` | Auth (JWT) | Statistik 7 hari terakhir user (`total_entries_7d`, `avg_energy_7d`, `top_mood`, `by_mood`, `daily`) |
| `GET` | `/uploads/:filename` | Publik | Akses statis file gambar entri atau sampul lagu yang diunggah |

---

## 5. Contoh Request `curl`

### a. Registrasi Pengguna Baru
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"Rina Putri\",\"email\":\"rina@moodify.com\",\"password\":\"rahasia123\"}"
```

### b. Login dengan Akun Demo
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"demo@moodify.com\",\"password\":\"demo12345\"}"
```

### c. Membuat Entri Jurnal Baru (Multipart dengan Upload Gambar)
Ganti `<TOKEN_JWT>` dengan nilai `token` dari respons login, dan sesuaikan path gambar `@foto.jpg`:
```bash
curl -X POST http://localhost:5000/api/entries \
  -H "Authorization: Bearer <TOKEN_JWT>" \
  -F "entry_date=2026-10-22" \
  -F "mood_id=1" \
  -F "energy_level=5" \
  -F "note=Hari ini sangat menyenangkan dan produktif!" \
  -F "image=@foto.jpg"
```

---

## 6. Panduan Deploy Singkat (Render / Railway)

1. Hubungkan repositori GitHub proyek Anda ke layanan **Render** (Web Service) atau **Railway**.
2. Atur konfigurasi layanan sebagai berikut:
   - **Root Directory**: `backend`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
3. Tambahkan **Environment Variables**:
   - `NODE_ENV` = `production`
   - `PORT` = `5000` (atau mengikuti port otomatis dari platform)
   - `JWT_SECRET` = *(isi dengan string acak yang panjang dan aman)*
   - `CLIENT_URL` = *(URL domain frontend Anda, misalnya `https://moodify-app.vercel.app`)*
   - `DB_PATH` = `/var/data/moodify.db`
   - `UPLOAD_DIR` = `/var/data/uploads`
4. **Catatan Penting Persistent Disk**: Karena menggunakan SQLite dan penyimpanan file lokal, pastikan Anda memasang **Persistent Disk / Volume** (misalnya di-mount ke `/var/data`) dan mengarahkan `DB_PATH` serta `UPLOAD_DIR` ke dalam direktori persistent disk tersebut agar database dan gambar unggahan tidak hilang saat container di-*restart* atau di-*redeploy*.

---

## 7. Cara Menjalankan Pengujian (Test)

Pengujian menggunakan **Jest** dan **Supertest** dengan database terisolasi (`:memory:`):

```bash
cd backend
npm test
```

Perintah di atas akan menjalankan seluruh test suite beserta laporan *code coverage* di folder `coverage/`.

---

## 8. Troubleshooting

1. **`better-sqlite3` gagal *build* / instal di Windows**:
   - Pastikan Anda menggunakan **Node.js versi LTS (18, 20, atau 22)** agar tersedia *prebuilt binary* tanpa perlu kompilasi C++ manual.
   - Jika Anda baru saja berganti versi Node.js, jalankan perintah:
     ```bash
     npm rebuild better-sqlite3
     ```
   - Jika menggunakan versi Node.js non-LTS yang sangat baru dan *prebuilt binary* belum rilis, instal *Desktop development with C++* melalui Visual Studio Build Tools atau gunakan Node.js LTS.
2. **Port `5000` bentrok (`EADDRINUSE`)**:
   - Ubah nilai `PORT=5001` (atau port lain yang kosong) di dalam file `.env`, lalu sesuaikan URL API pada konfigurasi frontend.
3. **Error CORS saat diakses dari Frontend**:
   - Pastikan URL asal (*origin*) tempat frontend berjalan (misalnya `http://localhost:5173`) sudah terdaftar di variabel `CLIENT_URL` pada file `.env` (mendukung beberapa URL yang dipisahkan tanda koma tanpa spasi, contoh: `CLIENT_URL=http://localhost:5173,http://localhost:4173`).
