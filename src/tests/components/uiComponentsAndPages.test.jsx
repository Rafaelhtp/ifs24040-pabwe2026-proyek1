import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import { ToastProvider } from '../../components/common/Toast';
import { AuthProvider } from '../../context/AuthContext';
import MoodBlob from '../../components/mood/MoodBlob';
import MoodPicker from '../../components/mood/MoodPicker';
import MoodChart from '../../components/mood/MoodChart';
import Loading from '../../components/common/Loading';
import EmptyState from '../../components/common/EmptyState';
import ErrorMessage from '../../components/common/ErrorMessage';
import StatCard from '../../components/common/StatCard';
import Pagination from '../../components/common/Pagination';
import Modal from '../../components/common/Modal';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import EnergySlider from '../../components/form/EnergySlider';
import FormAlert from '../../components/form/FormAlert';
import TextField from '../../components/form/TextField';
import ImageUpload from '../../components/form/ImageUpload';
import Footer from '../../components/layout/Footer';
import Navbar from '../../components/layout/Navbar';
import MoodCard from '../../components/moods/MoodCard';
import MoodConflictAlert from '../../components/moods/MoodConflictAlert';
import MoodFormModal from '../../components/moods/MoodFormModal';
import RandomSongBanner from '../../components/songs/RandomSongBanner';
import SongCard from '../../components/songs/SongCard';
import SongFilterBar from '../../components/songs/SongFilterBar';
import SongFormModal from '../../components/songs/SongFormModal';
import EntryCard from '../../components/entries/EntryCard';
import EntryFilterBar from '../../components/entries/EntryFilterBar';
import EntrySuccessView from '../../components/entries/EntrySuccessView';
import SongRecommendationPanel from '../../components/entries/SongRecommendationPanel';
import SoundtrackCard from '../../components/entries/SoundtrackCard';
import ProtectedRoute from '../../components/auth/ProtectedRoute';
import Login from '../../pages/Login';
import Register from '../../pages/Register';
import Dashboard from '../../pages/Dashboard';
import Journal from '../../pages/Journal';
import EntryForm from '../../pages/EntryForm';
import Songs from '../../pages/Songs';
import Moods from '../../pages/Moods';
import Stats from '../../pages/Stats';
import NotFound from '../../pages/NotFound';
import App from '../../App';

const wrap = (node, initialPath = '/dashboard') =>
  renderToStaticMarkup(
    <MemoryRouter initialEntries={[initialPath]}>
      <ToastProvider>
        <AuthProvider>{node}</AuthProvider>
      </ToastProvider>
    </MemoryRouter>
  );

describe('UI components and pages SSR coverage', () => {
  beforeEach(() => {
    const store = new Map();
    globalThis.sessionStorage = {
      getItem: (key) => (store.has(key) ? store.get(key) : null),
      setItem: (key, value) => store.set(key, String(value)),
      removeItem: (key) => store.delete(key)
    };
  });

  it('renders all 7 MoodBlob presets plus custom fallback and MoodPicker/MoodChart', () => {
    const presets = ['senang', 'tenang', 'semangat', 'sedih', 'cemas', 'marah', 'lelah', 'kustom'];
    presets.forEach((name, idx) => {
      const html = renderToStaticMarkup(
        <MoodBlob
          moodName={name}
          color={idx % 2 === 0 ? '#5798D7' : ''}
          size={idx === 0 ? 48 : 'md'}
          selected={idx === 1}
          animated={idx === 2}
        />
      );
      expect(html).toContain('<svg');
    });

    const moods = [
      { id: 1, name: 'Senang', emoji: '😊', color: '#FACC15' },
      { id: 2, name: 'Tenang', emoji: '😌', color: '#60A5FA' }
    ];
    expect(
      renderToStaticMarkup(<MoodPicker moods={moods} selectedMoodId={1} onSelect={vi.fn()} />)
    ).toContain('Senang');

    expect(
      renderToStaticMarkup(
        <MoodChart
          byMood={[{ mood_id: 1, name: 'Senang', count: 3, color: '#FACC15' }]}
          daily={[{ date: '2026-04-21', count: 2, avg_energy: 4.5 }]}
        />
      )
    ).toContain('Tren Harian');
  });

  it('renders common, form, layout, mood, song, and entry components across states', () => {
    expect(renderToStaticMarkup(<Loading fullScreen />)).toContain('Memuat');
    expect(renderToStaticMarkup(<Loading fullScreen={false} />)).toContain('Memuat');
    expect(
      renderToStaticMarkup(
        <EmptyState title="Kosong" actionLabel="Tambah" onAction={vi.fn()} />
      )
    ).toContain('Tambah');

    expect(renderToStaticMarkup(<ErrorMessage error={null} />)).toBe('');
    expect(
      renderToStaticMarkup(
        <ErrorMessage error={{ isNetworkError: true, message: 'Offline' }} onRetry={vi.fn()} />
      )
    ).toContain('Coba lagi');
    expect(renderToStaticMarkup(<ErrorMessage error="Gagal biasa" />)).toContain('Gagal biasa');

    expect(
      renderToStaticMarkup(
        <StatCard icon={<span>★</span>} label="Total" value="7" subtitle="Sepekan">
          <div>Detail</div>
        </StatCard>
      )
    ).toContain('Sepekan');

    expect(renderToStaticMarkup(<Pagination page={1} limit={10} total={5} />)).toBe('');
    expect(
      renderToStaticMarkup(<Pagination page={2} limit={5} total={15} onPageChange={vi.fn()} />)
    ).toContain('Berikutnya');

    expect(renderToStaticMarkup(<Modal isOpen={false} onClose={vi.fn()} title="Tutup" />)).toBe('');
    expect(
      renderToStaticMarkup(
        <Modal isOpen onClose={vi.fn()} title="Judul Modal">
          <p>Isi</p>
        </Modal>
      )
    ).toContain('Judul Modal');

    expect(
      renderToStaticMarkup(
        <ConfirmDialog isOpen loading onConfirm={vi.fn()} onCancel={vi.fn()} />
      )
    ).toContain('Menghapus...');

    [1, 2, 3, 4, 5].forEach((lvl) => {
      expect(renderToStaticMarkup(<EnergySlider value={lvl} onChange={vi.fn()} />)).toContain(
        `${lvl}/5`
      );
    });

    expect(renderToStaticMarkup(<FormAlert id="err" message="" />)).toBe('');
    expect(renderToStaticMarkup(<FormAlert id="err" message="Ada error" />)).toContain('Ada error');
    expect(
      renderToStaticMarkup(
        <TextField id="tf" label="Nama" value="A" onChange={vi.fn()} required hasError />
      )
    ).toContain('Nama');
    expect(
      renderToStaticMarkup(
        <ImageUpload existingImagePath="uploads/pic.png" onFileSelect={vi.fn()} errorText="Err" />
      )
    ).toContain('Err');
    expect(renderToStaticMarkup(<ImageUpload onFileSelect={vi.fn()} />)).toContain('Tarik');

    expect(wrap(<Footer isAuthenticated />)).toContain('Statistik');
    expect(wrap(<Footer isAuthenticated={false} />)).toContain('Koleksi Lagu');
    expect(wrap(<Navbar />)).toContain('Moodify');
  });

  it('renders cards, filter bars, modals, and pages', () => {
    const mood = { id: 1, name: 'Senang', emoji: '😊', color: '#FACC15' };
    const song = {
      id: 10,
      title: 'Monokrom',
      artist: 'Tulus',
      mood_id: 1,
      mood_name: 'Senang',
      color: '#FACC15',
      cover_path: 'uploads/cover.jpg',
      link: 'https://www.youtube.com/watch?v=123'
    };
    const entry = {
      id: 20,
      entry_date: '2026-04-21',
      mood_id: 1,
      mood_name: 'Senang',
      color: '#FACC15',
      energy_level: 4,
      note: 'Catatan hari ini',
      image_path: 'uploads/entry.jpg'
    };

    expect(renderToStaticMarkup(<MoodCard mood={mood} onEdit={vi.fn()} onDelete={vi.fn()} />)).toContain(
      'Senang'
    );
    expect(renderToStaticMarkup(<MoodConflictAlert message="" onClose={vi.fn()} />)).toBe('');
    expect(
      renderToStaticMarkup(<MoodConflictAlert message="Konflik" onClose={vi.fn()} />)
    ).toContain('Konflik');
    expect(
      renderToStaticMarkup(
        <MoodFormModal
          isOpen
          onClose={vi.fn()}
          editingMood={mood}
          form={{ name: 'Senang', emoji: '😊', color: '#FACC15' }}
          onFieldChange={vi.fn()}
          formError="Error"
          isSubmitting={false}
          onSubmit={vi.fn()}
        />
      )
    ).toContain('Simpan Perubahan');

    expect(renderToStaticMarkup(<RandomSongBanner song={null} onClose={vi.fn()} />)).toBe('');
    expect(renderToStaticMarkup(<RandomSongBanner song={song} onClose={vi.fn()} />)).toContain(
      'Putar di YouTube'
    );
    expect(
      renderToStaticMarkup(<SongCard song={song} canManage onEdit={vi.fn()} onDelete={vi.fn()} />)
    ).toContain('Monokrom');
    expect(
      renderToStaticMarkup(
        <SongCard song={{ ...song, cover_path: null, link: '' }} canManage={false} />
      )
    ).toContain('Tanpa tautan eksternal');
    expect(
      renderToStaticMarkup(
        <SongFilterBar
          moods={[mood]}
          selectedMoodId="1"
          onSelectMood={vi.fn()}
          searchQuery="Tulus"
          onSearchChange={vi.fn()}
        />
      )
    ).toContain('Semua Mood');
    expect(
      renderToStaticMarkup(
        <SongFormModal
          isOpen
          onClose={vi.fn()}
          editingSong={song}
          form={{ title: 'A', artist: 'B', moodId: '1', link: '' }}
          onFieldChange={vi.fn()}
          formError="Err"
          isSubmitting
          moods={[mood]}
          onSubmit={vi.fn()}
        />
      )
    ).toContain('Menyimpan...');

    expect(wrap(<EntryCard entry={entry} onDelete={vi.fn()} />)).toContain('Catatan hari ini');
    expect(
      wrap(<EntryCard entry={{ ...entry, energy_level: 2, note: '', image_path: null }} compact />)
    ).toContain('Tidak ada catatan tertulis');
    expect(
      renderToStaticMarkup(
        <EntryFilterBar
          moods={[mood]}
          moodIdParam="1"
          fromParam="2026-04-01"
          toParam="2026-04-21"
          searchInput="pagi"
          onSearchChange={vi.fn()}
          onFilterChange={vi.fn()}
          onReset={vi.fn()}
          hasActiveFilter
        />
      )
    ).toContain('Reset Semua Filter');

    expect(wrap(<EntrySuccessView savedEntry={entry} onWriteAnother={vi.fn()} />)).toContain(
      'Jurnal Tersimpan'
    );
    expect(renderToStaticMarkup(<SongRecommendationPanel moodId="" selectedMood={null} />)).toContain(
      'Pilih salah satu'
    );
    expect(renderToStaticMarkup(<SongRecommendationPanel moodId={1} selectedMood={mood} />)).toContain(
      'Rekomendasi Lagu'
    );
    expect(wrap(<SoundtrackCard moodId={1} moodName="Senang" />)).toContain('Soundtrack');

    expect(wrap(<ProtectedRoute><div>Rahasia</div></ProtectedRoute>)).toContain('Memeriksa');
    expect(wrap(<Login />)).toContain('Masuk ke Akunmu');
    expect(wrap(<Register />)).toContain('Daftar Akun Baru');
    expect(wrap(<Dashboard />)).toContain('Memuat');
    expect(wrap(<Journal />)).toContain('Memuat');
    expect(wrap(<EntryForm />)).toContain('Menyiapkan');
    expect(wrap(<Songs />)).toContain('Koleksi Lagu');
    expect(wrap(<Moods />)).toContain('Kelola Kategori Mood');
    expect(wrap(<Stats />)).toContain('Menghitung');
    expect(wrap(<NotFound />)).toContain('404 Not Found');
    expect(wrap(<App />, '/')).toContain('Memeriksa');
    expect(wrap(<App />, '/auth/login')).toContain('Moodify');
  });
});
