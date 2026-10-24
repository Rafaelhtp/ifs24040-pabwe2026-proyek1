// Komponen utama pengatur tata letak (layout) dan konfigurasi rute React Router v6 dengan code-splitting
import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate, Link } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import Loading from './components/Loading';
import Login from './pages/Login';
import Songs from './pages/Songs';
import Dashboard from './pages/Dashboard';

const Register = lazy(() => import('./pages/Register'));
const Journal = lazy(() => import('./pages/Journal'));
const EntryForm = lazy(() => import('./pages/EntryForm'));
const Stats = lazy(() => import('./pages/Stats'));
const Moods = lazy(() => import('./pages/Moods'));
const NotFound = lazy(() => import('./pages/NotFound'));

function RootRedirect() {
  const { isAuthenticated, loading } = useAuth();
  if (loading) {
    return <Loading text="Memeriksa sesi pengguna..." fullScreen />;
  }
  return <Navigate to={isAuthenticated ? '/dashboard' : '/auth/login'} replace />;
}

export default function App() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen flex flex-col bg-frost text-ink">
      <Navbar />
      <main id="main-content" className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-8">
        <Suspense fallback={<Loading text="Memuat halaman..." />}>
          <Routes>
            {/* Redirect "/" ke /dashboard jika sudah login, selain itu ke /auth/login */}
            <Route path="/" element={<RootRedirect />} />

            {/* Rute Publik Utama */}
            <Route path="/auth/login" element={<Login />} />
            <Route path="/auth/register" element={<Register />} />
            <Route path="/songs" element={<Songs />} />

            {/* Redirect kompatibilitas dari /login dan /register ke /auth/* */}
            <Route path="/login" element={<Navigate to="/auth/login" replace />} />
            <Route path="/register" element={<Navigate to="/auth/register" replace />} />

            {/* Rute Terlindungi (Protected Routes) */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/journal"
              element={
                <ProtectedRoute>
                  <Journal />
                </ProtectedRoute>
              }
            />
            <Route
              path="/journal/new"
              element={
                <ProtectedRoute>
                  <EntryForm />
                </ProtectedRoute>
              }
            />
            <Route
              path="/journal/:id/edit"
              element={
                <ProtectedRoute>
                  <EntryForm />
                </ProtectedRoute>
              }
            />
            <Route
              path="/stats"
              element={
                <ProtectedRoute>
                  <Stats />
                </ProtectedRoute>
              }
            />
            <Route
              path="/moods"
              element={
                <ProtectedRoute>
                  <Moods />
                </ProtectedRoute>
              }
            />

            {/* Rute Tidak Dikenal (404) */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </main>

      <footer className="border-t border-frost-border bg-white/90 py-5 text-center text-xs font-medium text-ink-soft">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div>
            <strong className="text-ink font-extrabold">Moodify</strong> — Jurnal Mood Harian &
            Rekomendasi Playlist © {new Date().getFullYear()}
          </div>
          <nav aria-label="Navigasi Footer" className="flex flex-wrap items-center justify-center gap-3">
            {isAuthenticated ? (
              <>
                <Link to="/dashboard" className="font-bold text-ink hover:text-denim-dark hover:underline py-1 px-1.5">
                  Dashboard
                </Link>
                <Link to="/journal" className="font-bold text-ink hover:text-denim-dark hover:underline py-1 px-1.5">
                  Jurnal
                </Link>
                <Link to="/journal/new" className="font-bold text-ink hover:text-denim-dark hover:underline py-1 px-1.5">
                  Tulis Jurnal
                </Link>
                <Link to="/stats" className="font-bold text-ink hover:text-denim-dark hover:underline py-1 px-1.5">
                  Statistik
                </Link>
                <Link to="/songs" className="font-bold text-ink hover:text-denim-dark hover:underline py-1 px-1.5">
                  Lagu
                </Link>
                <Link to="/moods" className="font-bold text-ink hover:text-denim-dark hover:underline py-1 px-1.5">
                  Mood
                </Link>
              </>
            ) : (
              <>
                <Link to="/auth/login" className="font-bold text-ink hover:text-denim-dark hover:underline py-1 px-1.5">
                  Masuk
                </Link>
                <Link to="/auth/register" className="font-bold text-ink hover:text-denim-dark hover:underline py-1 px-1.5">
                  Daftar
                </Link>
                <Link to="/songs" className="font-bold text-ink hover:text-denim-dark hover:underline py-1 px-1.5">
                  Koleksi Lagu
                </Link>
              </>
            )}
          </nav>
        </div>
      </footer>
    </div>
  );
}
