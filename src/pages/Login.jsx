// Halaman Login (/auth/login) dengan selector #username, #password, #btn-submit & tombol 1-klik Akun Demo
import React, { useState } from 'react';
import { Link, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { LogIn, Sparkles, Mail, Lock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/common/Toast';
import MoodBlob from '../components/moods/MoodBlob';
import usePageTitle from '../hooks/usePageTitle';
import { isValidEmail, isValidPassword } from '../utils/validators';
import { ROUTES } from '../constants/routes';
import { COLORS } from '../constants/colors';

export default function Login() {
  usePageTitle('Masuk Akun');
  const { login, isAuthenticated } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [demoLoading, setDemoLoading] = useState(false);
  const [formError, setFormError] = useState('');

  if (isAuthenticated) {
    return <Navigate to={ROUTES.DASHBOARD} replace />;
  }

  const destination = location.state?.from?.pathname || ROUTES.DASHBOARD;

  // Login langsung dalam 1 klik menggunakan akun demo
  const handleInstantDemoLogin = async () => {
    setFormError('');
    setEmail('demo@moodify.com');
    setPassword('demo12345');
    setDemoLoading(true);
    try {
      const user = await login('demo@moodify.com', 'demo12345');
      showToast(`Selamat datang kembali, ${user?.name || 'Pengguna'}!`, 'success');
      navigate(destination, { replace: true });
    } catch (err) {
      const msg = err?.userMessage || 'Gagal masuk dengan akun demo.';
      setFormError(msg);
      showToast(msg, 'error');
    } finally {
      setDemoLoading(false);
    }
  };

  const handleUserLogin = async (event) => {
    event.preventDefault();
    setFormError('');

    if (!isValidEmail(email)) {
      setFormError('Masukkan alamat email yang valid.');
      return;
    }
    if (!isValidPassword(password)) {
      setFormError('Password wajib diisi minimal 8 karakter.');
      return;
    }

    setSubmitting(true);
    try {
      const user = await login(email.trim(), password);
      showToast(`Selamat datang kembali, ${user?.name || 'Pengguna'}!`, 'success');
      navigate(destination, { replace: true });
    } catch (err) {
      const msg = err?.userMessage || 'Gagal masuk. Periksa email dan password Anda.';
      setFormError(msg);
      showToast(msg, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const isBusy = submitting || demoLoading;
  const errorId = formError ? 'login-form-error' : undefined;

  return (
    <div className="min-h-[82vh] flex items-center justify-center py-6">
      <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-12 bg-white rounded-3xl border border-frost-border shadow-soft-lg overflow-hidden">
        {/* Panel Ilustrasi Kiri (Split-Screen Dekoratif) */}
        <div className="md:col-span-5 bg-gradient-to-br from-denim via-denim-dark to-denim-deep p-8 text-white flex flex-col justify-between relative overflow-hidden">
          <div className="relative z-10">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-pistachio text-ink text-xs font-extrabold mb-4">
              <Sparkles className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Ruang Aman Perasaanmu</span>
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold leading-tight">
              Kenali Emosimu Bersama Moodify
            </h1>
            <p className="text-xs sm:text-sm text-white/95 mt-2 leading-relaxed">
              Catat suasana hati harianmu, pantau tingkat energi, dan dengarkan rekomendasi musik yang menenangkan.
            </p>
          </div>

          {/* Dekorasi Karakter Blob Mengambang */}
          <div className="my-8 flex items-center justify-center gap-3 relative z-10">
            <MoodBlob moodName="senang" color={COLORS.PRESET.YELLOW} size="lg" className="mood-blob-float" />
            <MoodBlob moodName="tenang" color={COLORS.PRESET.BLUE} size="md" className="mood-blob-float" />
            <MoodBlob moodName="semangat" color={COLORS.PRESET.ORANGE} size="sm" className="mood-blob-float" />
          </div>

          <p className="text-xs text-white font-medium relative z-10">
            <span>Akun Demo: </span>
            <strong className="text-white">demo@moodify.com</strong>
            <span> / </span>
            <strong className="text-white">demo12345</strong>
          </p>
        </div>

        {/* Panel Formulir Login Kanan */}
        <div className="md:col-span-7 p-7 sm:p-9 flex flex-col justify-center">
          <div className="mb-6">
            <h2 className="text-2xl font-extrabold text-ink">Masuk ke Akunmu</h2>
            <p className="text-xs font-medium text-ink-soft mt-1">
              Lanjutkan perjalanan jurnal suasana hatimu hari ini
            </p>
          </div>

          {/* Tombol 1-Klik Masuk dengan Akun Demo (Pistachio dengan Teks Gelap Ink) */}
          <div className="mb-6">
            <button
              type="button"
              onClick={handleInstantDemoLogin}
              disabled={isBusy}
              className="w-full py-3 px-4 rounded-2xl bg-pistachio hover:bg-pistachio-dark text-ink text-xs sm:text-sm font-extrabold shadow-xs flex items-center justify-center gap-2 transition-all disabled:opacity-60 min-h-[44px]"
            >
              <Sparkles className="w-4 h-4" aria-hidden="true" />
              <span>
                {demoLoading ? 'Masuk ke Akun Demo...' : 'Masuk dengan Akun Demo (1 Klik)'}
              </span>
            </button>
          </div>

          <div className="relative flex py-1 items-center mb-5">
            <div className="grow border-t border-frost-border" />
            <span className="shrink mx-3 text-[11px] font-bold text-ink-soft uppercase">
              atau masuk dengan email
            </span>
            <div className="grow border-t border-frost-border" />
          </div>

          {formError && (
            <div
              id="login-form-error"
              role="alert"
              className="mb-4 px-4 py-3 rounded-2xl bg-rose-50 border border-rose-200 text-xs font-bold text-rose-800"
            >
              {formError}
            </div>
          )}

          <form onSubmit={handleUserLogin} className="space-y-4" noValidate>
            <div>
              <label htmlFor="username" className="block text-xs font-extrabold text-ink mb-1.5">
                Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-ink-soft absolute left-3.5 top-3" aria-hidden="true" />
                <input
                  id="username"
                  name="username"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nama@email.com"
                  autoComplete="username"
                  aria-invalid={Boolean(formError)}
                  aria-describedby={errorId}
                  required
                  className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-frost-border text-sm text-ink bg-frost/30 focus:bg-white"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-xs font-extrabold text-ink mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-ink-soft absolute left-3.5 top-3" aria-hidden="true" />
                <input
                  id="password"
                  name="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Masukkan password"
                  autoComplete="current-password"
                  aria-invalid={Boolean(formError)}
                  aria-describedby={errorId}
                  required
                  className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-frost-border text-sm text-ink bg-frost/30 focus:bg-white"
                />
              </div>
            </div>

            <button
              id="btn-submit"
              type="submit"
              disabled={isBusy}
              className="w-full py-3 rounded-2xl bg-denim hover:bg-denim-dark text-white text-sm font-extrabold shadow-soft flex items-center justify-center gap-2 transition-all disabled:opacity-60 min-h-[44px]"
            >
              <LogIn className="w-4 h-4" aria-hidden="true" />
              <span>{submitting ? 'Memproses...' : 'Masuk Sekarang'}</span>
            </button>
          </form>

          <p className="text-center text-xs font-medium text-ink-soft mt-6">
            <span>Belum memiliki akun? </span>
            <Link to={ROUTES.REGISTER} className="font-extrabold text-denim-dark hover:underline">
              Daftar akun baru
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
