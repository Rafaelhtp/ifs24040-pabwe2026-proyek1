// Komponen utama pengatur tata letak (layout) dan konfigurasi rute React Router v6 dengan code-splitting
import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import ProtectedRoute from './components/auth/ProtectedRoute';
import Loading from './components/common/Loading';
import Login from './pages/Login';
import Songs from './pages/Songs';
import Dashboard from './pages/Dashboard';
import { ROUTES } from './constants/routes';
import { MESSAGES } from './constants/messages';

const Register = lazy(() => import('./pages/Register'));
const Journal = lazy(() => import('./pages/Journal'));
const EntryForm = lazy(() => import('./pages/EntryForm'));
const Stats = lazy(() => import('./pages/Stats'));
const Moods = lazy(() => import('./pages/Moods'));
const NotFound = lazy(() => import('./pages/NotFound'));

function RootRedirect() {
  const { isAuthenticated, loading } = useAuth();
  if (loading) {
    return <Loading text={MESSAGES.SESSION_CHECKING} fullScreen />;
  }
  return <Navigate to={isAuthenticated ? ROUTES.DASHBOARD : ROUTES.LOGIN} replace />;
}

export default function App() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen flex flex-col bg-frost text-ink">
      <Navbar />
      <main id="main-content" className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-8">
        <Suspense fallback={<Loading text={MESSAGES.PAGE_LOADING} />}>
          <Routes>
            <Route path={ROUTES.HOME} element={<RootRedirect />} />

            <Route path={ROUTES.LOGIN} element={<Login />} />
            <Route path={ROUTES.DASHBOARD_LOGIN} element={<Login />} />
            <Route path={ROUTES.REGISTER} element={<Register />} />
            <Route path={ROUTES.DASHBOARD_REGISTER} element={<Register />} />
            <Route path={ROUTES.SONGS} element={<Songs />} />

            <Route path={ROUTES.LEGACY_LOGIN} element={<Navigate to={ROUTES.LOGIN} replace />} />
            <Route
              path={ROUTES.LEGACY_REGISTER}
              element={<Navigate to={ROUTES.REGISTER} replace />}
            />

            <Route
              path={ROUTES.DASHBOARD}
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path={ROUTES.JOURNAL}
              element={
                <ProtectedRoute>
                  <Journal />
                </ProtectedRoute>
              }
            />
            <Route
              path={ROUTES.JOURNAL_NEW}
              element={
                <ProtectedRoute>
                  <EntryForm />
                </ProtectedRoute>
              }
            />
            <Route
              path={ROUTES.JOURNAL_EDIT}
              element={
                <ProtectedRoute>
                  <EntryForm />
                </ProtectedRoute>
              }
            />
            <Route
              path={ROUTES.STATS}
              element={
                <ProtectedRoute>
                  <Stats />
                </ProtectedRoute>
              }
            />
            <Route
              path={ROUTES.MOODS}
              element={
                <ProtectedRoute>
                  <Moods />
                </ProtectedRoute>
              }
            />

            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </main>
      <Footer isAuthenticated={isAuthenticated} />
    </div>
  );
}
