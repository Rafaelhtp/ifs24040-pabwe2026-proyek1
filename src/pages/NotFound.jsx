// Halaman 404 Not Found ketika rute tidak ditemukan
import React from 'react';
import { Link } from 'react-router-dom';
import { Home } from 'lucide-react';
import MoodBlob from '../components/mood/MoodBlob';
import usePageTitle from '../hooks/usePageTitle';
import { ROUTES } from '../constants/routes';

export default function NotFound() {
  usePageTitle('Halaman Tidak Ditemukan');

  return (
    <div className="min-h-[65vh] flex flex-col items-center justify-center text-center px-4">
      <MoodBlob moodName="cemas" color="#A78BFA" size="xl" className="mood-blob-float mb-4" />
      <span className="px-3 py-1 rounded-full bg-pistachio text-ink text-xs font-extrabold mb-2">
        404 Not Found
      </span>
      <h1 className="text-2xl sm:text-3xl font-extrabold text-ink mb-2">
        Halaman Tidak Ditemukan
      </h1>
      <p className="text-sm text-ink-soft max-w-md mb-6">
        Maaf, halaman yang kamu tuju tidak tersedia atau telah berpindah alamat.
      </p>
      <Link
        to={ROUTES.HOME}
        className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-denim hover:bg-denim-dark text-white text-sm font-extrabold shadow-soft transition-colors"
      >
        <Home className="w-4 h-4" aria-hidden="true" />
        <span>Kembali ke Beranda</span>
      </Link>
    </div>
  );
}
