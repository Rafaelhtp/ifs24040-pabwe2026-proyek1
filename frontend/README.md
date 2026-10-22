# Moodify Frontend

**Moodify** adalah aplikasi web jurnal mood harian dengan rekomendasi playlist musik sesuai suasana hati dan visualisasi grafik perkembangan emosi mingguan. Folder `frontend/` ini berisi aplikasi *Single Page Application* (SPA) berbasis **React 18 + Vite** dengan konsep desain **Soft Organic Aesthetic** (palet *Frost*, *Iced Denim*, dan *Pistachio* serta ilustrasi karakter organik SVG `<MoodBlob />`).

---

## 1. Tech Stack

- **Library Utama**: React 18 (Function Components & Hooks, JavaScript ES Modules)
- **Build Tool & Bundler**: Vite (Dev Server di port `5173`)
- **Package Manager**: **Bun** (`bun.lock`)
- **Routing**: React Router DOM v6 (`ProtectedRoute`, sinkronisasi filter URL query string)
- **HTTP Client**: Axios (dilengkapi *Request & Response Interceptors* untuk token JWT dan deteksi koneksi server)
- **Visualisasi Grafik**: Recharts (`ComposedChart` sumbu ganda tren harian & `BarChart` distribusi mood)
- **Styling, Ikon & Tipografi**:
  - Tailwind CSS (token warna kustom `frost`, `denim`, `denim-dark`, `pistachio`, `ink`, `ink-soft`)
  - Ikon: `lucide-react`
  - Font Lokal: `@fontsource-variable/plus-jakarta-sans` (*Plus Jakarta Sans*, tanpa ketergantungan CDN eksternal)

---

## 2. Cara Menjalankan di Komputer Lokal (Mulai dari Clone)

Pastikan **Bun** sudah terpasang di komputer Anda dan server **Moodify Backend** sudah berjalan di `http://localhost:5000`.

```bash
# 1. Clone repositori dan masuk ke folder frontend
git clone <URL_REPOSITORY_ANDA>
cd moodify/frontend

# 2. Instal seluruh dependensi menggunakan Bun
bun install

# 3. Salin file .env.example menjadi .env
# Untuk Windows (CMD / PowerShell):
copy .env.example .env

# Untuk macOS / Linux:
cp .env.example .env

# 4. Jalankan server pengembangan (Development Server)
bun run dev
```

Aplikasi akan berjalan di **`http://localhost:5173`**.

---

## 3. Akun Demo

Anda dapat langsung masuk dalam **1 klik** menggunakan tombol **"Masuk dengan Akun Demo (1 Klik)"** berwarna *Pistachio* di halaman `/login`, atau mengisi kredensial berikut secara manual:

| Field | Nilai |
| :--- | :--- |
| **Email** | `demo@moodify.com` |
| **Password** | `demo12345` |

---

## 4. Cara Build dan Preview Produksi

Untuk membangun bundel produksi yang teroptimasi ke dalam folder `dist/`:

```bash
# Buat production build
bun run build

# Jalankan preview hasil build secara lokal (di http://localhost:4173)
bun run preview
```

> **Catatan Penting Mengenai `VITE_API_URL`**:
> Variabel lingkungan `VITE_API_URL` (contoh: `http://localhost:5000`, **tanpa `/api` di belakangnya**) **ditanam secara statis pada saat proses `bun run build` dijalankan**. Jika Anda mengubah nilai `VITE_API_URL`, pastikan Anda menjalankan ulang `bun run build` agar perubahan diterapkan.

---

## 5. Panduan Deploy (Vercel / Netlify)

Proyek ini sudah dilengkapi file *SPA Rewrite* ([`vercel.json`](./vercel.json) dan [`public/_redirects`](./public/_redirects)) agar ketika pengguna melakukan *refresh* langsung di rute dalam (seperti `/dashboard`, `/journal`, `/stats`, `/songs`, atau `/moods`), aplikasi tidak mengembalikan error `404 Not Found`.

### Langkah Deploy:
1. Hubungkan repositori GitHub proyek Anda ke **Vercel** atau **Netlify**.
2. Atur konfigurasi proyek sebagai berikut:
   - **Root Directory**: `frontend`
   - **Build Command**: `bun install && bun run build`
   - **Output / Publish Directory**: `dist`
3. Tambahkan **Environment Variable**:
   - `VITE_API_URL` = `https://url-backend-anda.onrender.com` *(tanpa `/api` dan tanpa garis miring di akhir)*
4. Klik **Deploy**. Pastikan variabel `CLIENT_URL` pada backend Anda juga sudah mencantumkan domain frontend hasil deploy agar tidak terkena blokir CORS.
