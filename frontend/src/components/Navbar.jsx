// Komponen navigasi utama: Dashboard, Jurnal, Statistik, Lagu, Mood + CTA Tulis Jurnal
import React, { useState } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  BookOpen,
  BarChart3,
  Music,
  Sparkles,
  PenLine,
  LogOut,
  Menu,
  X
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from './Toast';
import MoodBlob from './MoodBlob';

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setMobileMenuOpen(false);
    showToast('Anda telah keluar dari akun', 'info');
    navigate('/login');
  };

  const navLinkClass = ({ isActive }) =>
    `inline-flex items-center gap-2 px-3.5 py-2 rounded-2xl text-sm font-bold transition-all ${
      isActive
        ? 'bg-denim text-white shadow-xs'
        : 'text-ink-soft hover:text-denim-dark hover:bg-frost'
    }`;

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-frost-border shadow-soft">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-18 flex items-center justify-between gap-3">
        {/* Brand Moodify */}
        <Link
          to={isAuthenticated ? '/dashboard' : '/songs'}
          className="flex items-center gap-2.5 group shrink-0"
          onClick={() => setMobileMenuOpen(false)}
        >
          <MoodBlob moodName="senang" color="#5798D7" size="sm" />
          <div className="flex flex-col">
            <span className="text-xl font-extrabold tracking-tight text-ink leading-none">
              Moodify
            </span>
            <span className="text-[11px] text-denim-dark font-bold tracking-wide mt-0.5">
              Jurnal & Nada Harian
            </span>
          </div>
        </Link>

        {/* Menu Navigasi Desktop */}
        <nav aria-label="Menu Utama" className="hidden lg:flex items-center gap-1">
          {isAuthenticated && (
            <>
              <NavLink to="/dashboard" className={navLinkClass}>
                <LayoutDashboard className="w-4 h-4" />
                <span>Dashboard</span>
              </NavLink>
              <NavLink to="/journal" className={navLinkClass}>
                <BookOpen className="w-4 h-4" />
                <span>Jurnal</span>
              </NavLink>
              <NavLink to="/stats" className={navLinkClass}>
                <BarChart3 className="w-4 h-4" />
                <span>Statistik</span>
              </NavLink>
            </>
          )}
          <NavLink to="/songs" className={navLinkClass}>
            <Music className="w-4 h-4" />
            <span>Lagu</span>
          </NavLink>
          {isAuthenticated && (
            <NavLink to="/moods" className={navLinkClass}>
              <Sparkles className="w-4 h-4" />
              <span>Mood</span>
            </NavLink>
          )}
        </nav>

        {/* Aksi Kanan Desktop: Tombol Tulis Jurnal, Nama User, Logout */}
        <div className="hidden lg:flex items-center gap-3">
          {isAuthenticated ? (
            <>
              <Link
                to="/journal/new"
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-denim hover:bg-denim-dark text-white text-xs font-extrabold shadow-xs transition-all"
              >
                <PenLine className="w-3.5 h-3.5" />
                <span>Tulis Jurnal</span>
              </Link>

              <div className="pl-2 border-l border-frost-border flex items-center gap-2.5">
                <div className="text-right">
                  <p className="text-xs font-extrabold text-ink leading-tight">
                    {user?.name}
                  </p>
                  <p className="text-[11px] font-medium text-ink-soft leading-tight">
                    {user?.email}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleLogout}
                  title="Keluar dari akun"
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-2xl border border-frost-border text-ink-soft hover:text-rose-600 hover:border-rose-200 hover:bg-rose-50 text-xs font-bold transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Logout</span>
                </button>
              </div>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="px-4 py-2 rounded-2xl text-sm font-bold text-denim-dark hover:bg-frost transition-colors"
              >
                Masuk
              </Link>
              <Link
                to="/register"
                className="px-4 py-2.5 rounded-2xl bg-denim hover:bg-denim-dark text-white text-sm font-bold shadow-xs transition-colors"
              >
                Daftar
              </Link>
            </div>
          )}
        </div>

        {/* Tombol Cepat Tulis Jurnal + Hamburger di Mobile */}
        <div className="flex lg:hidden items-center gap-2">
          {isAuthenticated && (
            <Link
              to="/journal/new"
              onClick={() => setMobileMenuOpen(false)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-denim hover:bg-denim-dark text-white text-xs font-extrabold shadow-xs"
            >
              <PenLine className="w-3.5 h-3.5" />
              <span>Tulis Jurnal</span>
            </Link>
          )}
          <button
            type="button"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            aria-expanded={mobileMenuOpen}
            aria-label="Buka atau tutup menu navigasi"
            className="p-2.5 rounded-2xl border border-frost-border text-ink hover:bg-frost"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Panel Menu Mobile */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-t border-frost-border px-4 pt-3 pb-5 space-y-3 shadow-soft-lg">
          <div className="flex flex-col space-y-1">
            {isAuthenticated && (
              <>
                <NavLink
                  to="/dashboard"
                  className={navLinkClass}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <LayoutDashboard className="w-4 h-4" />
                  <span>Dashboard</span>
                </NavLink>
                <NavLink
                  to="/journal"
                  className={navLinkClass}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <BookOpen className="w-4 h-4" />
                  <span>Jurnal</span>
                </NavLink>
                <NavLink
                  to="/stats"
                  className={navLinkClass}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <BarChart3 className="w-4 h-4" />
                  <span>Statistik</span>
                </NavLink>
              </>
            )}
            <NavLink
              to="/songs"
              className={navLinkClass}
              onClick={() => setMobileMenuOpen(false)}
            >
              <Music className="w-4 h-4" />
              <span>Lagu</span>
            </NavLink>
            {isAuthenticated && (
              <NavLink
                to="/moods"
                className={navLinkClass}
                onClick={() => setMobileMenuOpen(false)}
              >
                <Sparkles className="w-4 h-4" />
                <span>Mood</span>
              </NavLink>
            )}
          </div>

          <div className="pt-3 border-t border-frost-border flex items-center justify-between">
            {isAuthenticated ? (
              <>
                <div>
                  <p className="text-sm font-extrabold text-ink">{user?.name}</p>
                  <p className="text-xs text-ink-soft">{user?.email}</p>
                </div>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-rose-50 text-rose-700 text-xs font-bold"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Logout</span>
                </button>
              </>
            ) : (
              <div className="flex items-center gap-2 w-full">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex-1 text-center py-2.5 rounded-2xl border border-frost-border text-sm font-bold text-ink"
                >
                  Masuk
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex-1 text-center py-2.5 rounded-2xl bg-denim text-white text-sm font-bold"
                >
                  Daftar
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
