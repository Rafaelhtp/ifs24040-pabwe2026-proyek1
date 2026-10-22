// Halaman 404 NotFound dengan ilustrasi MoodBlob
import React from 'react';
import { Link } from 'react-router-dom';
import { Home } from 'lucide-react';
import MoodBlob from '../components/MoodBlob';

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4">
      <div className="mb-4">
        <MoodBlob moodName="cemas" color="#A78BFA" size="xl" className="mood-blob-float" />
      </div>
      <h1 className="text-3xl font-extrabold text-ink mb-2">
        404 — Halaman Tidak Ditemukan
      </h1>
      <p className="text-sm font-medium text-ink-soft max-w-md mb-6">
        Maaf, halaman yang kamu tuju tidak tersedia atau sudah berpindah alamat.
      </p>
      <Link
        to="/dashboard"
        className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-denim hover:bg-denim-dark text-white text-sm font-extrabold shadow-soft transition-all"
      >
        <Home className="w-4 h-4" />
        <span>Kembali ke Dashboard</span>
      </Link>
    </div>
  );
}
