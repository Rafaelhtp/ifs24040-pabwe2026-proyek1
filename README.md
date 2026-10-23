# Moodify — Jurnal Mood Harian & Rekomendasi Playlist (Bun Monorepo)

**Moodify** adalah aplikasi web jurnal mood harian yang dilengkapi rekomendasi playlist musik sesuai suasana hati serta visualisasi grafik perkembangan emosi dan tingkat energi mingguan. Repositori ini menggunakan arsitektur **Bun Workspaces (`backend` & `frontend`)** dengan satu lockfile tunggal (`bun.lock`) di root repositori agar terintegrasi penuh dengan pipeline CI/CD Jenkins.

---

## 1. Struktur Repositori

```text
moodify/
├── backend/                  # Workspace Backend REST API (Express + bun:sqlite)
│   ├── src/
│   │   ├── app.js            # Konfigurasi Express + penyajian statis SPA frontend/dist
│   │   ├── server.js         # Entry point HTTP server (port 5000)
│   │   ├── db.js             # Koneksi SQLite (bun:sqlite) + auto-schema & auto-seed
│   │   ├── schema.sql        # Skema tabel SQLite (users, moods, entries, songs)
│   │   ├── seed.js           # Data awal (7 mood, 35 lagu, akun demo, 22 entri jurnal)
│   │   ├── middleware.js     # Autentikasi JWT, upload Multer, validasi, error handler
│   │   └── routes/           # Endpoint API (auth, moods, entries, songs, stats)
│   ├── tests/
│   │   └── api.test.js       # Integration test API (bun:test + native fetch)
│   ├── uploads/              # Direktori penyimpanan foto jurnal & sampul lagu
│   └── package.json
├── frontend/                 # Workspace Frontend SPA (React 18 + Vite + Tailwind CSS)
│   ├── src/
│   │   ├── api/              # Axios client & modul pemanggil API
│   │   ├── components/       # Komponen UI (MoodBlob SVG, SoundtrackCard, MoodChart, dll.)
│   │   ├── context/          # AuthContext (sesi JWT)
│   │   ├── hooks/            # Custom hooks (useFetch, useDebounce, useMoods)
│   │   ├── pages/            # Halaman (Login, Register, Dashboard, Journal, EntryForm, Stats, Songs, Moods)
│   │   └── utils/            # Helper tanggal lokal, validasi, dan URL gambar
│   └── package.json
├── Jenkinsfile               # Pipeline CI/CD Deklaratif Kampus
├── sonar-project.properties  # Konfigurasi analisis kualitas kode SonarQube
├── vitest.config.js          # Konfigurasi runner coverage lcov untuk CI
├── .env.example              # Contoh variabel lingkungan
├── package.json              # Root Bun Workspace (workspaces: ["backend", "frontend"])
└── bun.lock                  # Lockfile tunggal Bun di root
```

---

## 2. Tech Stack

- **Runtime & Package Manager**: **Bun** (Workspaces)
- **Backend**: Express.js, SQLite (`bun:sqlite`), JWT (`jsonwebtoken`), `bcryptjs`, `multer`, `express-validator`
- **Frontend**: React 18, Vite, React Router DOM v6, Axios, Recharts, Tailwind CSS (tema *Soft Organic Aesthetic*: *Frost*, *Iced Denim*, *Pistachio*), `lucide-react`, `@fontsource-variable/plus-jakarta-sans`
- **Testing & CI/CD**: `bun test` / Vitest (`lcov` coverage), Trivy Security Scan, SonarQube Analysis, Jenkins Pipeline

---

## 3. Cara Menjalankan dari Nol (Mulai dari Clone)

Anda dapat menginstal dan menjalankan seluruh proyek langsung dari **root repositori** menggunakan **Bun**:

```bash
# 1. Clone repositori
git clone <URL_REPOSITORY_ANDA>
cd ifs24040-pabwe2026-project

# 2. Instal seluruh dependensi (backend & frontend sekaligus) dari root
bun install

# 3. Salin file .env.example menjadi .env
# Untuk Windows (CMD / PowerShell):
copy .env.example .env

# Untuk macOS / Linux:
cp .env.example .env

# 4. Jalankan server Backend di http://localhost:5000 (Terminal 1)
bun run start

# 5. Jalankan server pengembangan Frontend di http://localhost:5173 (Terminal 2)
bun run dev
```

> **Mode Satu Server (Production Preview)**:
> Jika Anda menjalankan `bun run build` terlebih dahulu, maka perintah `bun run start` di port `5000` juga secara otomatis menyajikan hasil build frontend (`frontend/dist`) beserta seluruh endpoint `/api/*` dan `/uploads/*`.

---

## 4. Akun Demo

Gunakan akun berikut untuk langsung mencoba fitur aplikasi (atau klik tombol **"Masuk dengan Akun Demo (1 Klik)"** berwarna *Pistachio* di halaman Login):

| Field | Nilai |
| :--- | :--- |
| **Email** | `demo@moodify.com` |
| **Password** | `demo12345` |

---

## 5. Daftar Perintah Script di Root (`package.json`)

| Perintah | Deskripsi |
| :--- | :--- |
| `bun install` | Menginstal dependensi seluruh workspace (`backend` & `frontend`) |
| `bun run start` | Menjalankan server backend di `http://localhost:5000` |
| `bun run dev` | Menjalankan dev server frontend Vite di `http://localhost:5173` |
| `bun run dev:backend` | Menjalankan backend dengan mode `--watch` |
| `bun run build` | Membangun aset produksi frontend ke `frontend/dist/` |
| `bun test` / `bun run test` | Menjalankan pengujian otomatis beserta laporan coverage `coverage/lcov.info` |

---

## 6. Panduan Deploy

1. **Fullstack dalam Satu Layanan / Pipeline Kampus**:
   - Jalankan `bun install`, `bun run build`, dan `bun run start`.
   - Atur variabel environment `JWT_SECRET`, `PORT=5000`, `DB_PATH`, dan `UPLOAD_DIR` pada direktori yang dapat ditulis (*writable persistent storage*).
2. **Terpisah (Backend di Render/Railway & Frontend di Vercel/Netlify)**:
   - **Backend**: Root directory `backend` (atau dari root dengan start command `bun run start`), set `CLIENT_URL` ke domain frontend.
   - **Frontend**: Root directory `frontend`, build command `bun install && bun run build`, output directory `dist`, dan set `VITE_API_URL` ke URL backend (tanpa `/api`). Ingat bahwa nilai `VITE_API_URL` ditanam saat proses build.
