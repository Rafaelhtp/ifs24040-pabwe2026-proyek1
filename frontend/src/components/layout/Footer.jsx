// Komponen footer aplikasi dengan tautan navigasi cepat
import React from 'react';
import { Link } from 'react-router-dom';
import { ROUTES } from '../../constants/routes';

const AUTH_FOOTER_LINKS = [
  { to: ROUTES.DASHBOARD, label: 'Dashboard' },
  { to: ROUTES.JOURNAL, label: 'Jurnal' },
  { to: ROUTES.JOURNAL_NEW, label: 'Tulis Jurnal' },
  { to: ROUTES.STATS, label: 'Statistik' },
  { to: ROUTES.SONGS, label: 'Lagu' },
  { to: ROUTES.MOODS, label: 'Mood' }
];

const GUEST_FOOTER_LINKS = [
  { to: ROUTES.LOGIN, label: 'Masuk' },
  { to: ROUTES.REGISTER, label: 'Daftar' },
  { to: ROUTES.SONGS, label: 'Koleksi Lagu' }
];

export default function Footer({ isAuthenticated }) {
  const links = isAuthenticated ? AUTH_FOOTER_LINKS : GUEST_FOOTER_LINKS;

  return (
    <footer className="border-t border-frost-border bg-white/90 py-5 text-center text-xs font-medium text-ink-soft">
      <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div>
          <strong className="text-ink font-extrabold">Moodify</strong> — Jurnal Mood Harian &
          Rekomendasi Playlist © {new Date().getFullYear()}
        </div>
        <nav
          aria-label="Navigasi Footer"
          className="flex flex-wrap items-center justify-center gap-3"
        >
          {links.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="font-bold text-ink hover:text-denim-dark hover:underline py-1 px-1.5"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </footer>
  );
}
