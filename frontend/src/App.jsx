// Komponen utama pengatur tata letak (layout) dan konfigurasi rute React Router v6
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import Loading from './components/Loading';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Journal from './pages/Journal';
import EntryForm from './pages/EntryForm';
import Stats from './pages/Stats';
import Songs from './pages/Songs';
import Moods from './pages/Moods';
import NotFound from './pages/NotFound';

function RootRedirect() {
  const { isAuthenticated, loading } = useAuth();
  if (loading) {
    return <Loading text="Memeriksa sesi pengguna..." fullScreen />;
  }
  return <Navigate to={isAuthenticated ? '/dashboard' : '/login'} replace />;
}

export default function App() {
  return (
    <div className="min-h-screen flex flex-col bg-frost text-ink">
      <Navbar />
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-8">
        <Routes>
          {/* Redirect "/" ke /dashboard jika sudah login, selain itu ke /login */}
          <Route path="/" element={<RootRedirect />} />

          {/* Rute Publik */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/songs" element={<Songs />} />

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
      </main>

      <footer className="border-t border-frost-border bg-white/75 py-5 text-center text-xs font-medium text-ink-soft">
        <div className="max-w-6xl mx-auto px-4">
          <strong className="text-ink font-extrabold">Moodify</strong> — Jurnal Mood Harian &
          Rekomendasi Playlist © {new Date().getFullYear()}
        </div>
      </footer>
    </div>
  );
}
