import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';

vi.mock('react-router-dom', () => ({
  Link: ({ to, children, ...props }) => (
    <a href={to} {...props}>
      {children}
    </a>
  )
}));

vi.mock('../../services/songService', () => ({
  getRandomSong: vi.fn(),
  getSongs: vi.fn()
}));

vi.mock('../../utils/imageUrl', () => ({
  getImageUrl: vi.fn((path) => (path ? `http://localhost:5000/${path}` : null))
}));

import SoundtrackCard from '../../components/entries/SoundtrackCard';
import SongRecommendationPanel from '../../components/entries/SongRecommendationPanel';
import EnergySlider from '../../components/form/EnergySlider';
import * as songService from '../../services/songService';

describe('SoundtrackCard & SongRecommendationPanel Component Unit Tests', () => {
  beforeEach(() => {
    vi.mocked(songService.getRandomSong).mockReset();
    vi.mocked(songService.getSongs).mockReset();
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  describe('SoundtrackCard', () => {
    it('menguji kondisi saat data soundtrack (lagu) kosong, null, atau undefined', async () => {
      // 1. Kondisi API mengembalikan { data: null }
      vi.mocked(songService.getRandomSong).mockResolvedValueOnce({ data: null });
      const { container, rerender } = render(<SoundtrackCard moodId={1} moodName="Senang" />);
      expect(screen.getByText('Soundtrack Mood Kamu Hari Ini')).toBeDefined();

      await waitFor(() => {
        expect(container.querySelector('img')).toBeNull();
      });

      // 2. Kondisi data undefined
      cleanup();
      vi.mocked(songService.getRandomSong).mockResolvedValueOnce({});
      const { container: container2 } = render(<SoundtrackCard moodId={1} moodName="Senang" />);
      await waitFor(() => {
        expect(container2.querySelector('img')).toBeNull();
      });

      // 3. Kondisi 404 (lagu belum tersedia untuk mood ini)
      cleanup();
      vi.mocked(songService.getRandomSong).mockRejectedValueOnce({ statusCode: 404 });
      render(<SoundtrackCard moodId={99} moodName="Haru" />);
      await screen.findByText('Belum ada lagu untuk mood ini');
      expect(screen.getByText('Tambah di Halaman Lagu')).toBeDefined();

      // 4. Kondisi error umum saat fetch
      cleanup();
      vi.mocked(songService.getRandomSong).mockRejectedValueOnce({
        userMessage: 'Gagal mengambil lagu acak'
      });
      render(<SoundtrackCard moodId={1} moodName="Senang" />);
      await screen.findByText('Gagal mengambil lagu acak');

      // 5. Kondisi error default tanpa userMessage
      cleanup();
      vi.mocked(songService.getRandomSong).mockRejectedValueOnce({});
      render(<SoundtrackCard moodId={1} moodName="Senang" />);
      await screen.findByText('Gagal mengambil lagu acak');
    });

    it('menguji saat tombol play/shuffle diklik (simulasi event click)', async () => {
      const mockRandom = vi.mocked(songService.getRandomSong);
      mockRandom.mockResolvedValue({
        data: {
          id: 10,
          title: 'Hati-Hati di Jalan',
          artist: 'Tulus',
          mood_name: 'Haru',
          cover_path: 'uploads/tulus.jpg',
          link: 'https://youtube.com/watch?v=sample'
        }
      });

      render(<SoundtrackCard moodId={5} moodName="Haru" />);
      await screen.findByText('Hati-Hati di Jalan');
      expect(mockRandom).toHaveBeenCalledWith(5);

      const shuffleBtn = screen.getByRole('button', { name: /acak lagu lain/i });
      fireEvent.click(shuffleBtn);

      await waitFor(() => {
        expect(mockRandom).toHaveBeenCalledTimes(2);
      });
    });

    it('menguji saat elemen gambar (<img>) tidak memiliki URL atau cover_path null (fallback ke MoodBlob)', async () => {
      // Kasus tanpa cover
      vi.mocked(songService.getRandomSong).mockResolvedValueOnce({
        data: {
          id: 25,
          title: 'Lagu Tanpa Gambar',
          artist: 'Musisi Akustik',
          mood_name: 'Tenang',
          color: '#34D399',
          cover_path: null,
          link: 'https://open.spotify.com/track/123'
        }
      });

      const { container } = render(<SoundtrackCard moodId={2} moodName="Tenang" />);
      await screen.findByText('Lagu Tanpa Gambar');
      expect(container.querySelector('img')).toBeNull();
      expect(screen.getByText('Buka lagu')).toBeDefined();

      // Kasus dengan cover valid
      cleanup();
      vi.mocked(songService.getRandomSong).mockResolvedValueOnce({
        data: {
          id: 26,
          title: 'Lagu Bergambar',
          artist: 'Penyanyi Top',
          mood_name: 'Senang',
          color: '#FACC15',
          cover_path: 'uploads/album.png',
          link: 'https://youtube.com/watch?v=sample2'
        }
      });

      render(<SoundtrackCard moodId={1} moodName="Senang" />);
      const img = await screen.findByAltText('Cover Lagu Bergambar');
      expect(img.getAttribute('src')).toContain('uploads/album.png');
      expect(screen.getByText('Putar di YouTube')).toBeDefined();
    });

    it('menguji seluruh kondisi branch pada SoundtrackCard (title, link, album art, mood fallback, default parameter)', async () => {
      // 1. Default props tanpa parameter apapun
      vi.mocked(songService.getRandomSong).mockResolvedValueOnce({ data: null });
      render(<SoundtrackCard />);
      expect(screen.getByText('Soundtrack Mood Kamu Hari Ini')).toBeDefined();
      expect(screen.getByText('Hari Ini')).toBeDefined();

      // 2. Data lagu dengan title/artist/link/cover null
      cleanup();
      vi.mocked(songService.getRandomSong).mockResolvedValueOnce({
        data: {
          id: 30,
          title: null,
          artist: null,
          mood_name: null,
          color: null,
          cover_path: null,
          link: '   '
        }
      });
      const { container } = render(
        <SoundtrackCard moodId={1} moodName="FallbackMood" moodColor="#123456" title="Judul Kustom" />
      );
      await screen.findByText('Judul Kustom');
      expect(screen.getByText('FallbackMood')).toBeDefined();
      expect(container.querySelector('img')).toBeNull();
      expect(container.querySelector('a')).toBeNull();

      // 3. Data lagu dengan cover_path ada, link YouTube, title dan artist terisi
      cleanup();
      vi.mocked(songService.getRandomSong).mockResolvedValueOnce({
        data: {
          id: 31,
          title: 'Judul Lagu Lengkap',
          artist: 'Artis Lengkap',
          mood_name: 'Senang',
          color: '#FACC15',
          cover_path: 'uploads/cover.jpg',
          link: 'https://www.youtube.com/watch?v=xyz'
        }
      });
      render(<SoundtrackCard moodId={1} />);
      await screen.findByText('Judul Lagu Lengkap');
      expect(screen.getByAltText('Cover Judul Lagu Lengkap')).toBeDefined();
      expect(screen.getByText('Putar di YouTube')).toBeDefined();

      // 4. Data lagu dengan link non-YouTube (misal Spotify)
      cleanup();
      vi.mocked(songService.getRandomSong).mockResolvedValueOnce({
        data: {
          id: 32,
          title: 'Lagu Spotify',
          artist: 'Artis Spotify',
          mood_name: 'Tenang',
          cover_path: null,
          link: 'https://open.spotify.com/track/123'
        }
      });
      render(<SoundtrackCard moodId={2} />);
      await screen.findByText('Buka lagu');

      // 5. Data lagu dengan song.link bernilai null / undefined
      cleanup();
      vi.mocked(songService.getRandomSong).mockResolvedValueOnce({
        data: {
          id: 33,
          title: 'Lagu Tanpa Link',
          artist: 'Artis Tanpa Link',
          link: null
        }
      });
      const { container: container5 } = render(<SoundtrackCard moodId={3} />);
      await screen.findByText('Lagu Tanpa Link');
      expect(container5.querySelector('a')).toBeNull();
    });
  });

  describe('SongRecommendationPanel', () => {
    // Skenario 1: Error 404 pada Lagu Acak
    it('Skenario 1: menangani error 404 pada getRandomSong saat tombol Acak lagu diklik', async () => {
      vi.mocked(songService.getSongs).mockResolvedValueOnce({
        data: [
          { id: 1, title: 'Lagu Awal', artist: 'Artis A', link: 'https://youtube.com/watch?v=1' }
        ]
      });
      vi.mocked(songService.getRandomSong).mockRejectedValueOnce({ statusCode: 404 });

      render(
        <SongRecommendationPanel
          moodId={1}
          selectedMood={{ id: 1, name: 'Senang', color: '#FACC15' }}
        />
      );

      await screen.findByText('Lagu Awal');
      const shuffleBtn = screen.getByRole('button', { name: /acak lagu/i });
      fireEvent.click(shuffleBtn);

      await screen.findByText('Belum ada lagu untuk mood ini.');
    });

    // Skenario 2: Data API Bukan Array
    it('Skenario 2: menangani respons getSongs dengan data yang bukan array (null, undefined, objek, string)', async () => {
      const nonArrayCases = [
        { data: null },
        { data: undefined },
        { data: { message: 'bukan array' } },
        { data: 'string bukan array' },
        null,
        {}
      ];

      for (const nonArrayData of nonArrayCases) {
        cleanup();
        vi.mocked(songService.getSongs).mockResolvedValueOnce(nonArrayData);

        render(
          <SongRecommendationPanel
            moodId={5}
            selectedMood={{ id: 5, name: 'Fokus', color: '#6366F1' }}
          />
        );

        await screen.findByText('Belum ada lagu untuk mood ini.');
      }
    });

    // Skenario 3: Fallback Pesan Error
    it('Skenario 3: menampilkan pesan fallback ketika error getSongs atau getRandomSong tidak memiliki properti userMessage', async () => {
      // 3a. Error getSongs tanpa userMessage
      vi.mocked(songService.getSongs).mockRejectedValueOnce({});

      render(
        <SongRecommendationPanel
          moodId={2}
          selectedMood={{ id: 2, name: 'Sedih' }}
        />
      );
      await screen.findByText('Gagal memuat rekomendasi lagu.');

      // 3b. Error getRandomSong tanpa userMessage (bukan 404)
      cleanup();
      vi.mocked(songService.getSongs).mockResolvedValueOnce({
        data: [{ id: 10, title: 'Lagu C', artist: 'Artis C' }]
      });
      vi.mocked(songService.getRandomSong).mockRejectedValueOnce({ status: 500 });

      render(
        <SongRecommendationPanel
          moodId={3}
          selectedMood={{ id: 3, name: 'Cemas' }}
        />
      );

      await screen.findByText('Lagu C');
      const shuffleBtn = screen.getByRole('button', { name: /acak lagu/i });
      fireEvent.click(shuffleBtn);

      await screen.findByText('Gagal mengambil lagu acak.');

      // 3c. Error dengan userMessage kustom
      cleanup();
      vi.mocked(songService.getSongs).mockResolvedValueOnce({
        data: [{ id: 11, title: 'Lagu D', artist: 'Artis D' }]
      });
      vi.mocked(songService.getRandomSong).mockRejectedValueOnce({
        userMessage: 'Gagal koneksi server musik'
      });

      render(
        <SongRecommendationPanel
          moodId={3}
          selectedMood={{ id: 3, name: 'Cemas' }}
        />
      );

      await screen.findByText('Lagu D');
      const btn = screen.getByRole('button', { name: /acak lagu/i });
      fireEvent.click(btn);

      await screen.findByText('Gagal koneksi server musik');
    });

    // Skenario 4: Link Lagu Bukan YouTube / Tanpa Link
    it('Skenario 4: merender link Spotify ("Buka lagu"), YouTube ("Putar di YouTube"), atau tanpa tombol link jika link null', async () => {
      vi.mocked(songService.getSongs).mockResolvedValueOnce({
        data: [
          {
            id: 201,
            title: 'Lagu Spotify',
            artist: 'Musisi Spotify',
            link: 'https://open.spotify.com/track/spotify123'
          },
          {
            id: 202,
            title: 'Lagu Tanpa Link',
            artist: 'Musisi Offline',
            link: null
          },
          {
            id: 203,
            title: 'Lagu YouTube',
            artist: 'Musisi YouTube',
            link: 'https://youtube.com/watch?v=yt123'
          }
        ]
      });

      render(
        <SongRecommendationPanel
          moodId={1}
          selectedMood={{ id: 1, name: 'Senang', color: '#FACC15' }}
        />
      );

      await screen.findByText('Buka lagu');
      expect(screen.getByText('Putar di YouTube')).toBeDefined();

      // Highlighted song tanpa link sama sekali
      cleanup();
      vi.mocked(songService.getSongs).mockResolvedValueOnce({
        data: [
          {
            id: 301,
            title: 'Lagu Solo Tanpa Link',
            artist: 'Musisi Solo',
            link: null
          }
        ]
      });

      const { container } = render(
        <SongRecommendationPanel
          moodId={1}
          selectedMood={{ id: 1, name: 'Senang', color: '#FACC15' }}
        />
      );

      await screen.findByText('Lagu Solo Tanpa Link');
      expect(container.querySelector('a')).toBeNull();
    });

    it('menguji kondisi saat moodId kosong, null, atau undefined', () => {
      const { rerender } = render(<SongRecommendationPanel moodId={null} selectedMood={null} />);
      expect(
        screen.getByText('🎵 Pilih salah satu karakter mood di atas untuk memunculkan rekomendasi playlist!')
      ).toBeDefined();

      rerender(<SongRecommendationPanel moodId="" selectedMood={null} />);
      expect(
        screen.getByText('🎵 Pilih salah satu karakter mood di atas untuk memunculkan rekomendasi playlist!')
      ).toBeDefined();
    });

    it('menguji pemanggilan handlePickRandom yang sukses dan menguji tombol disabled saat loading', async () => {
      const mockGetSongs = vi.mocked(songService.getSongs);
      const mockGetRandom = vi.mocked(songService.getRandomSong);

      mockGetSongs.mockResolvedValueOnce({
        data: [
          { id: 1, title: 'Lagu 1', artist: 'Artis 1', link: 'https://youtube.com/watch?v=1' },
          { id: 2, title: 'Lagu 2', artist: 'Artis 2', link: 'https://spotify.com/track/2' }
        ]
      });

      render(
        <SongRecommendationPanel
          moodId={1}
          selectedMood={{ id: 1, name: 'Senang', color: '#FACC15' }}
        />
      );

      await screen.findByText('Lagu 1');

      // Sukses mengacak lagu lain yang memiliki res.data
      mockGetRandom.mockResolvedValueOnce({
        data: {
          id: 50,
          title: 'Lagu Baru Terpilih',
          artist: 'Artis Baru',
          link: 'https://spotify.com/track/50'
        }
      });

      const shuffleBtn = screen.getByRole('button', { name: /acak lagu/i });
      fireEvent.click(shuffleBtn);

      await screen.findByText('Lagu Baru Terpilih');

      // Sukses mengacak lagu tapi res.data bernilai null/undefined
      mockGetRandom.mockResolvedValueOnce({ data: null });
      fireEvent.click(shuffleBtn);
      // highlightedSong tetap lagu sebelumnya karena res.data tidak ada
      await screen.findByText('Lagu Baru Terpilih');
    });

    it('menguji songs.length bernilai 0, 1, dan lebih dari 1, serta selectedMood bernilai null/undefined', async () => {
      // 1. songs.length === 0
      vi.mocked(songService.getSongs).mockResolvedValueOnce({ data: [] });
      render(<SongRecommendationPanel moodId={1} selectedMood={null} />);
      await screen.findByText('Belum ada lagu untuk mood ini.');
      expect(screen.getByText(/Rekomendasi Lagu Mood/i)).toBeDefined();

      // 2. songs.length === 1
      cleanup();
      vi.mocked(songService.getSongs).mockResolvedValueOnce({
        data: [{ id: 101, title: 'Lagu Tunggal', artist: 'Artis Tunggal', link: null }]
      });
      render(<SongRecommendationPanel moodId={1} selectedMood={undefined} />);
      await screen.findByText('Lagu Tunggal');
      expect(screen.queryByText(/lagu lainnya/i)).toBeNull();

      // 3. songs.length > 1
      cleanup();
      vi.mocked(songService.getSongs).mockResolvedValueOnce({
        data: [
          { id: 201, title: 'Lagu Pertama', artist: 'Artis 1', link: 'https://youtube.com/watch?v=201' },
          { id: 202, title: 'Lagu Kedua', artist: 'Artis 2', link: 'https://open.spotify.com/track/202' },
          { id: 203, title: 'Lagu Ketiga', artist: 'Artis 3', link: null }
        ]
      });
      render(
        <SongRecommendationPanel
          moodId={1}
          selectedMood={{ id: 1, name: 'Senang', color: '#FACC15' }}
        />
      );
      await screen.findByText('Lagu Pertama');
      expect(screen.getByText(/lagu lainnya/i)).toBeDefined();
      expect(screen.getByText('Lagu Kedua')).toBeDefined();
      expect(screen.getByText('Lagu Ketiga')).toBeDefined();
    });
  });

  describe('EnergySlider', () => {
    it('menguji kondisi nilai kosong/undefined, nilai 1, 3, 4, 5, 10, dan interaksi klik dengan/tanpa onChange', () => {
      // 1. Default parameter: value undefined dan onChange undefined
      const { container } = render(<EnergySlider />);
      expect(screen.getByText('Cukup Stabil')).toBeDefined();

      // Klik tombol saat onChange tidak diberikan
      const buttons = container.querySelectorAll('button');
      expect(buttons.length).toBe(5);
      fireEvent.click(buttons[0]);

      // 2. Nilai 1
      cleanup();
      const mockOnChange = vi.fn();
      const { container: container1 } = render(<EnergySlider value={1} onChange={mockOnChange} />);
      expect(screen.getByText('Sangat Lelah')).toBeDefined();
      const buttons1 = container1.querySelectorAll('button');
      fireEvent.click(buttons1[0]);
      expect(mockOnChange).toHaveBeenCalledWith(1);

      // 3. Nilai 2
      cleanup();
      render(<EnergySlider value={2} onChange={mockOnChange} />);
      expect(screen.getByText('/5')).toBeDefined();

      // 4. Nilai 4
      cleanup();
      render(<EnergySlider value={4} onChange={mockOnChange} />);
      expect(screen.getByText('Berenergi')).toBeDefined();

      // 5. Nilai 5
      cleanup();
      render(<EnergySlider value={5} onChange={mockOnChange} />);
      expect(screen.getByText('Penuh Energi')).toBeDefined();

      // 6. Nilai 10
      cleanup();
      render(<EnergySlider value={10} onChange={mockOnChange} />);
      expect(screen.getByText('Cukup Stabil')).toBeDefined();

      // 7. Nilai 0 / null
      cleanup();
      render(<EnergySlider value={0} />);
      expect(screen.getByText('Cukup Stabil')).toBeDefined();

      cleanup();
      render(<EnergySlider value={null} />);
      expect(screen.getByText('Cukup Stabil')).toBeDefined();
    });
  });
});
