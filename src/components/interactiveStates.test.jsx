import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockState = {
  auth: {
    user: { id: 1, name: 'Demo User', email: 'demo@moodify.com' },
    token: 'jwt-demo',
    loading: false,
    isAuthenticated: true,
    login: vi.fn(),
    register: vi.fn(),
    logout: vi.fn()
  },
  fetchResult: {
    data: null,
    meta: { page: 1, limit: 10, total: 20 },
    loading: false,
    error: null,
    refetch: vi.fn(),
    setData: vi.fn()
  }
};

vi.mock('../../src/context/AuthContext', () => ({
  useAuth: () => mockState.auth,
  AuthProvider: ({ children }) => <>{children}</> // NOSONAR
}));

vi.mock('../../src/hooks/useFetch', () => ({
  default: () => mockState.fetchResult
}));

import { ToastProvider } from '../../src/components/common/Toast';
import Navbar from '../../src/components/layout/Navbar';
import ProtectedRoute from '../../src/components/auth/ProtectedRoute';
import Dashboard from '../../src/pages/Dashboard';
import Stats from '../../src/pages/Stats';
import Journal from '../../src/pages/Journal';
import Songs from '../../src/pages/Songs';
import Moods from '../../src/pages/Moods';
import EntryForm from '../../src/pages/EntryForm';
import Login from '../../src/pages/Login';
import Register from '../../src/pages/Register';

const renderInRouter = (node, path = '/dashboard') =>
  renderToStaticMarkup(
    <MemoryRouter initialEntries={[path]}>
      <ToastProvider>{node}</ToastProvider>
    </MemoryRouter>
  );

describe('Page and Component Data/Error/Empty Branch Coverage', () => {
  beforeEach(() => {
    mockState.auth = {
      user: { id: 1, name: 'Demo User', email: 'demo@moodify.com' },
      token: 'jwt-demo',
      loading: false,
      isAuthenticated: true,
      login: vi.fn(),
      register: vi.fn(),
      logout: vi.fn()
    };
  });

  it('renders Navbar and ProtectedRoute in authenticated and unauthenticated states', () => {
    expect(renderInRouter(<Navbar />)).toContain('Demo User');
    expect(
      renderInRouter(
        <ProtectedRoute>
          <div>Konten Terlindungi</div>
        </ProtectedRoute>
      )
    ).toContain('Konten Terlindungi');

    mockState.auth.isAuthenticated = false;
    expect(renderInRouter(<Navbar />)).toContain('Masuk');
    expect(
      renderInRouter(
        <ProtectedRoute>
          <div>Konten Terlindungi</div>
        </ProtectedRoute>
      )
    ).not.toContain('Konten Terlindungi');
  });

  it('renders Login and Register redirect when already authenticated', () => {
    mockState.auth.isAuthenticated = true;
    expect(renderInRouter(<Login />)).not.toContain('Masuk ke Akunmu');
    expect(renderInRouter(<Register />)).not.toContain('Daftar Akun Baru');
  });

  it('renders Dashboard in error, empty, and populated states', () => {
    mockState.fetchResult = {
      data: null,
      loading: false,
      error: { message: 'Gagal memuat dashboard' },
      refetch: vi.fn()
    };
    expect(renderInRouter(<Dashboard />)).toContain('Gagal memuat dashboard');

    mockState.fetchResult = {
      data: {
        stats: { total_entries_7d: 0, avg_energy_7d: 0, top_mood: null, by_mood: [], daily: [] },
        recentEntries: []
      },
      loading: false,
      error: null,
      refetch: vi.fn()
    };
    expect(renderInRouter(<Dashboard />)).toContain('Jurnal Harianmu Masih Kosong');

    mockState.fetchResult = {
      data: {
        stats: {
          total_entries_7d: 4,
          avg_energy_7d: 4.2,
          top_mood: { id: 1, name: 'Senang', color: '#FACC15', count: 3 },
          by_mood: [],
          daily: []
        },
        recentEntries: [
          {
            id: 1,
            entry_date: '2026-04-21',
            mood_id: 1,
            mood_name: 'Senang',
            color: '#FACC15',
            energy_level: 4,
            note: 'Hari cerah'
          }
        ]
      },
      loading: false,
      error: null,
      refetch: vi.fn()
    };
    expect(renderInRouter(<Dashboard />)).toContain('3 Catatan Jurnal Terbaru');
  });

  it('renders Stats in error, empty, and populated states', () => {
    mockState.fetchResult = {
      data: null,
      loading: false,
      error: { message: 'Gagal memuat statistik' },
      refetch: vi.fn()
    };
    expect(renderInRouter(<Stats />)).toContain('Gagal memuat statistik');

    mockState.fetchResult = {
      data: { total_entries_7d: 0, avg_energy_7d: 0, top_mood: null, by_mood: [], daily: [] },
      loading: false,
      error: null,
      refetch: vi.fn()
    };
    expect(renderInRouter(<Stats />)).toContain('Belum Ada Data Statistik Mingguan');

    mockState.fetchResult = {
      data: {
        total_entries_7d: 5,
        avg_energy_7d: 3.8,
        top_mood: { id: 2, name: 'Tenang', color: '#60A5FA', count: 4 },
        by_mood: [{ mood_id: 2, name: 'Tenang', color: '#60A5FA', count: 4 }],
        daily: [{ date: '2026-04-21', count: 2, avg_energy: 4 }]
      },
      loading: false,
      error: null,
      refetch: vi.fn()
    };
    expect(renderInRouter(<Stats />)).toContain('Tercatat 4 kali');
  });

  it('renders Journal, Songs, Moods, and EntryForm across error, empty, and populated states', () => {
    // Error state
    mockState.fetchResult = {
      data: null,
      loading: false,
      error: { message: 'Error data' },
      refetch: vi.fn()
    };
    expect(renderInRouter(<Journal />)).toContain('Error data');
    expect(renderInRouter(<Songs />)).toContain('Error data');
    expect(renderInRouter(<Moods />)).toContain('Error data');
    expect(renderInRouter(<EntryForm />)).toContain('Error data');

    // Empty state
    mockState.fetchResult = {
      data: [],
      meta: { page: 1, limit: 10, total: 0 },
      loading: false,
      error: null,
      refetch: vi.fn()
    };
    expect(renderInRouter(<Journal />)).toContain('Belum Ada Catatan Jurnal');
    expect(renderInRouter(<Journal />, '/journal?mood_id=1')).toContain(
      'Tidak Ada Jurnal yang Cocok'
    );
    expect(renderInRouter(<Songs />)).toContain('Belum Ada Lagu Ditemukan');
    expect(renderInRouter(<Moods />)).toContain('Belum Ada Kategori Mood');
    expect(renderInRouter(<EntryForm />)).toContain('Tulis Jurnal Harian');

    // Populated state
    mockState.fetchResult = {
      data: [
        {
          id: 1,
          name: 'Senang',
          emoji: '😊',
          color: '#FACC15',
          title: 'Monokrom',
          artist: 'Tulus',
          mood_id: 1,
          mood_name: 'Senang',
          entry_date: '2026-04-21',
          energy_level: 4,
          note: 'Senang sekali'
        }
      ],
      meta: { page: 1, limit: 10, total: 20 },
      loading: false,
      error: null,
      refetch: vi.fn()
    };
    expect(renderInRouter(<Journal />)).toContain('Senang sekali');
    expect(renderInRouter(<Songs />)).toContain('Monokrom');
    expect(renderInRouter(<Moods />)).toContain('Senang');
  });
});
