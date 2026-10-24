// Halaman Registrasi Pengguna Baru (/auth/register) dengan dekorasi MoodBlob & konfirmasi password (min 8 karakter)
import React, { useState } from 'react';
import { Link, useNavigate, Navigate } from 'react-router-dom';
import { UserPlus, User, Mail, Lock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/common/Toast';
import MoodBlob from '../components/mood/MoodBlob';
import usePageTitle from '../hooks/usePageTitle';
import { isValidEmail, isValidPassword } from '../utils/validators';

export default function Register() {
  usePageTitle('Daftar Akun Baru');
  const { register, isAuthenticated } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleUserRegister = async (event) => {
    event.preventDefault();
    setFormError('');

    if (!name.trim()) {
      setFormError('Nama lengkap wajib diisi.');
      return;
    }
    if (!isValidEmail(email)) {
      setFormError('Format alamat email tidak valid.');
      return;
    }
    if (!isValidPassword(password)) {
      setFormError('Password harus terdiri dari minimal 8 karakter.');
      return;
    }
    if (password !== confirmPassword) {
      setFormError('Konfirmasi password tidak sama dengan password.');
      return;
    }

    setSubmitting(true);
    try {
      const user = await register(name.trim(), email.trim(), password);
      showToast(`Akun berhasil dibuat! Selamat datang, ${user?.name || 'Pengguna'}!`, 'success');
      navigate('/dashboard', { replace: true });
    } catch (err) {
      const msg = err?.userMessage || 'Gagal mendaftarkan akun.';
      setFormError(msg);
      showToast(msg, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const errorId = formError ? 'register-form-error' : undefined;

  return (
    <div className="min-h-[82vh] flex items-center justify-center py-6">
      <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-12 bg-white rounded-3xl border border-frost-border shadow-soft-lg overflow-hidden">
        {/* Panel Ilustrasi Kiri */}
        <div className="md:col-span-5 bg-gradient-to-br from-denim via-denim-dark to-[#193F68] p-8 text-white flex flex-col justify-between">
          <div>
            <span className="inline-block px-3 py-1 rounded-full bg-pistachio text-ink text-xs font-extrabold mb-4">
              ✨ Mulai Hari Ini
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold leading-tight">
              Buat Jurnal Mood Pribadimu
            </h1>
            <p className="text-xs sm:text-sm text-white/95 mt-2 leading-relaxed">
              Simpan momen berharga, ekspresikan perasaan dengan karakter blob menggemaskan, dan temukan soundtrack harimu.
            </p>
          </div>

          <div className="my-8 flex items-center justify-center gap-3">
            <MoodBlob moodName="semangat" color="#F97316" size="lg" className="mood-blob-float" />
            <MoodBlob moodName="senang" color="#FACC15" size="md" className="mood-blob-float" />
          </div>

          <p className="text-xs text-white/95">
            Gratis, hangat, dan dirancang untuk menemani keseharianmu.
          </p>
        </div>

        {/* Panel Formulir Registrasi Kanan */}
        <div className="md:col-span-7 p-7 sm:p-9">
          <div className="mb-6">
            <h2 className="text-2xl font-extrabold text-ink">Daftar Akun Baru</h2>
            <p className="text-xs font-medium text-ink-soft mt-1">
              Lengkapi data di bawah ini untuk membuat akun Moodify
            </p>
          </div>

          {formError && (
            <div
              id="register-form-error"
              role="alert"
              className="mb-4 px-4 py-3 rounded-2xl bg-rose-50 border border-rose-200 text-xs font-bold text-rose-800"
            >
              {formError}
            </div>
          )}

          <form onSubmit={handleUserRegister} className="space-y-4" noValidate>
            <div>
              <label htmlFor="reg-name" className="block text-xs font-extrabold text-ink mb-1">
                Nama Lengkap
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-ink-soft absolute left-3.5 top-3" aria-hidden="true" />
                <input
                  id="reg-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Contoh: Nadya Putri"
                  autoComplete="name"
                  aria-invalid={Boolean(formError)}
                  aria-describedby={errorId}
                  required
                  className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-frost-border text-sm text-ink bg-frost/30 focus:bg-white"
                />
              </div>
            </div>

            <div>
              <label htmlFor="reg-email" className="block text-xs font-extrabold text-ink mb-1">
                Alamat Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-ink-soft absolute left-3.5 top-3" aria-hidden="true" />
                <input
                  id="reg-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nama@email.com"
                  autoComplete="email"
                  aria-invalid={Boolean(formError)}
                  aria-describedby={errorId}
                  required
                  className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-frost-border text-sm text-ink bg-frost/30 focus:bg-white"
                />
              </div>
            </div>

            <div>
              <label htmlFor="reg-password" className="block text-xs font-extrabold text-ink mb-1">
                Password (minimal 8 karakter)
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-ink-soft absolute left-3.5 top-3" aria-hidden="true" />
                <input
                  id="reg-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimal 8 karakter"
                  autoComplete="new-password"
                  aria-invalid={Boolean(formError)}
                  aria-describedby={errorId}
                  required
                  className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-frost-border text-sm text-ink bg-frost/30 focus:bg-white"
                />
              </div>
            </div>

            <div>
              <label htmlFor="reg-confirm" className="block text-xs font-extrabold text-ink mb-1">
                Konfirmasi Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-ink-soft absolute left-3.5 top-3" aria-hidden="true" />
                <input
                  id="reg-confirm"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Ulangi password"
                  autoComplete="new-password"
                  aria-invalid={Boolean(formError)}
                  aria-describedby={errorId}
                  required
                  className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-frost-border text-sm text-ink bg-frost/30 focus:bg-white"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 rounded-2xl bg-denim hover:bg-denim-dark text-white text-sm font-extrabold shadow-soft flex items-center justify-center gap-2 transition-all disabled:opacity-60 min-h-[44px]"
            >
              <UserPlus className="w-4 h-4" aria-hidden="true" />
              <span>{submitting ? 'Mendaftarkan...' : 'Daftar Sekarang'}</span>
            </button>
          </form>

          <p className="text-center text-xs font-medium text-ink-soft mt-6">
            Sudah punya akun?{' '}
            <Link to="/auth/login" className="font-extrabold text-denim-dark hover:underline">
              Masuk di sini
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
