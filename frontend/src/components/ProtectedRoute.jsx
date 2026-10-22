// Komponen pembungkus rute yang mewajibkan autentikasi pengguna
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Loading from './Loading';

export default function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  // Tampilkan indikator loading selama pengecekan token awal agar tidak berkedip ke halaman login
  if (loading) {
    return <Loading text="Memeriksa sesi pengguna..." fullScreen />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}
