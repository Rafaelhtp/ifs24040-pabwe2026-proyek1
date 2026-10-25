import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

// Harness pengujian hook dan state komponen dalam lingkungan test Node / Vitest
const testHarness = {
  slots: [],
  cursor: 0,
  effects: [],
  effectDeps: [],
  effectCursor: 0,
  callbacks: [],
  callbackCursor: 0,
  reset() {
    this.slots = [];
    this.cursor = 0;
    this.effects = [];
    this.effectDeps = [];
    this.effectCursor = 0;
    this.callbacks = [];
    this.callbackCursor = 0;
  },
  useState(initial) {
    const idx = this.cursor++;
    if (!(idx in this.slots)) {
      this.slots[idx] = typeof initial === 'function' ? initial() : initial;
    }
    const setter = (val) => {
      this.slots[idx] = typeof val === 'function' ? val(this.slots[idx]) : val;
    };
    return [this.slots[idx], setter];
  },
  useEffect(fn, deps) {
    const idx = this.effectCursor++;
    const prevDeps = this.effectDeps[idx];
    let hasChanged = true;
    if (prevDeps && deps) {
      hasChanged =
        deps.length !== prevDeps.length ||
        deps.some((dep, i) => !Object.is(dep, prevDeps[i]));
    }
    this.effectDeps[idx] = deps;
    if (hasChanged) {
      this.effects.push(fn);
    }
  },
  useCallback(fn, deps) {
    const idx = this.callbackCursor++;
    const prev = this.callbacks[idx];
    let hasChanged = true;
    if (prev && deps && prev.deps) {
      hasChanged =
        deps.length !== prev.deps.length ||
        deps.some((d, i) => !Object.is(d, prev.deps[i]));
    }
    if (hasChanged || !prev) {
      this.callbacks[idx] = { fn, deps };
      return fn;
    }
    return prev.fn;
  },
  async flushEffects() {
    const pending = [...this.effects];
    this.effects = [];
    for (const eff of pending) {
      await eff();
    }
  },
  render(fn) {
    this.cursor = 0;
    this.effectCursor = 0;
    this.callbackCursor = 0;
    return fn();
  }
};

vi.mock('react', async (importOriginal) => {
  const actual = await importOriginal();
  const mocked = {
    ...actual,
    useState: (init) => testHarness.useState(init),
    useEffect: (fn, deps) => testHarness.useEffect(fn, deps),
    useCallback: (fn, deps) => testHarness.useCallback(fn, deps),
    useMemo: (fn) => fn(),
    useRef: (init) => ({ current: init })
  };
  return {
    ...mocked,
    default: mocked
  };
});

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
import * as songService from '../../services/songService';

// Helper penelusuran pohon VDOM mirip React Testing Library
function collectNodes(node, predicate, results = []) {
  if (!node || typeof node !== 'object') return results;
  if (Array.isArray(node)) {
    for (const child of node) collectNodes(child, predicate, results);
    return results;
  }
  if (predicate(node)) results.push(node);
  if (node.props?.children) {
    collectNodes(node.props.children, predicate, results);
  }
  return results;
}

function getTextContent(node) {
  if (!node) return '';
  if (typeof node === 'string' || typeof node === 'number') return String(node);
  if (Array.isArray(node)) return node.map(getTextContent).join(' ');
  if (node.props?.children) return getTextContent(node.props.children);
  return '';
}

const fireEvent = {
  click: async (element) => {
    if (!element || !element.props) return;
    if (element.props.disabled) return;
    if (typeof element.props.onClick === 'function') {
      await element.props.onClick({ preventDefault: vi.fn(), stopPropagation: vi.fn() });
    }
  }
};

describe('SoundtrackCard & SongRecommendationPanel Component Unit Tests', () => {
  beforeEach(() => {
    testHarness.reset();
    vi.clearAllMocks();
  });

  describe('SoundtrackCard', () => {
    it('menguji kondisi saat data soundtrack (lagu) kosong, null, atau undefined', async () => {
      // 1. Kondisi API mengembalikan { data: null }
      vi.mocked(songService.getRandomSong).mockResolvedValueOnce({ data: null });
      let tree = testHarness.render(() =>
        SoundtrackCard({ moodId: 1, moodName: 'Senang' })
      );
      // Saat awal me-render, header kartu tetap tampil
      expect(getTextContent(tree)).toContain('Soundtrack Mood Kamu Hari Ini');

      await testHarness.flushEffects();
      await Promise.resolve();

      tree = testHarness.render(() =>
        SoundtrackCard({ moodId: 1, moodName: 'Senang' })
      );
      // Karena song null, tidak ada detail lagu dan tidak ada elemen <img>
      expect(collectNodes(tree, (n) => n.type === 'img').length).toBe(0);

      // 2. Kondisi data undefined
      testHarness.reset();
      vi.mocked(songService.getRandomSong).mockResolvedValueOnce({});
      tree = testHarness.render(() =>
        SoundtrackCard({ moodId: 1, moodName: 'Senang' })
      );
      await testHarness.flushEffects();
      await Promise.resolve();
      tree = testHarness.render(() =>
        SoundtrackCard({ moodId: 1, moodName: 'Senang' })
      );
      expect(collectNodes(tree, (n) => n.type === 'img').length).toBe(0);

      // 3. Kondisi 404 (lagu belum tersedia untuk mood ini)
      testHarness.reset();
      vi.mocked(songService.getRandomSong).mockRejectedValueOnce({ statusCode: 404 });
      tree = testHarness.render(() =>
        SoundtrackCard({ moodId: 99, moodName: 'Haru' })
      );
      await testHarness.flushEffects();
      await Promise.resolve();
      tree = testHarness.render(() =>
        SoundtrackCard({ moodId: 99, moodName: 'Haru' })
      );
      const text404 = getTextContent(tree);
      expect(text404).toContain('Belum ada lagu untuk mood ini');
      expect(text404).toContain('Tambah di Halaman Lagu');

      // 4. Kondisi error umum saat fetch
      testHarness.reset();
      vi.mocked(songService.getRandomSong).mockRejectedValueOnce({
        userMessage: 'Gagal mengambil lagu acak'
      });
      tree = testHarness.render(() =>
        SoundtrackCard({ moodId: 1, moodName: 'Senang' })
      );
      await testHarness.flushEffects();
      await Promise.resolve();
      tree = testHarness.render(() =>
        SoundtrackCard({ moodId: 1, moodName: 'Senang' })
      );
      expect(getTextContent(tree)).toContain('Gagal mengambil lagu acak');

      // 5. Kondisi error default tanpa userMessage
      testHarness.reset();
      vi.mocked(songService.getRandomSong).mockRejectedValueOnce({});
      tree = testHarness.render(() =>
        SoundtrackCard({ moodId: 1, moodName: 'Senang' })
      );
      await testHarness.flushEffects();
      await Promise.resolve();
      tree = testHarness.render(() =>
        SoundtrackCard({ moodId: 1, moodName: 'Senang' })
      );
      expect(getTextContent(tree)).toContain('Gagal mengambil lagu acak');
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

      let tree = testHarness.render(() =>
        SoundtrackCard({ moodId: 5, moodName: 'Haru' })
      );
      await testHarness.flushEffects();
      await Promise.resolve();
      tree = testHarness.render(() =>
        SoundtrackCard({ moodId: 5, moodName: 'Haru' })
      );

      expect(mockRandom).toHaveBeenCalledWith(5);

      // Cari tombol acak lagu
      const buttons = collectNodes(tree, (n) => n.type === 'button');
      expect(buttons.length).toBeGreaterThan(0);
      const shuffleBtn = buttons[0];
      expect(getTextContent(shuffleBtn)).toContain('Acak lagu lain');

      // Simulasikan event click pada tombol
      await fireEvent.click(shuffleBtn);
      await testHarness.flushEffects();
      await Promise.resolve();
      expect(mockRandom).toHaveBeenCalledTimes(2);

      // Uji tombol disabled saat loading
      testHarness.slots[1] = true; // set state loading = true
      tree = testHarness.render(() =>
        SoundtrackCard({ moodId: 5, moodName: 'Haru' })
      );
      const loadingButtons = collectNodes(tree, (n) => n.type === 'button');
      expect(loadingButtons[0].props.disabled).toBe(true);
      expect(getTextContent(loadingButtons[0])).toContain('Mengacak...');
      expect(getTextContent(tree)).toContain('Mencari lagu yang cocok...');

      // Pastikan fireEvent.click tidak memicu fungsi fetch baru saat tombol disabled
      await fireEvent.click(loadingButtons[0]);
      expect(mockRandom).toHaveBeenCalledTimes(2);
    });

    it('menguji saat elemen gambar (<img>) tidak memiliki URL atau cover_path null (fallback ke MoodBlob)', async () => {
      // Kasus tanpa cover (cover_path null)
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

      let tree = testHarness.render(() =>
        SoundtrackCard({ moodId: 2, moodName: 'Tenang' })
      );
      await testHarness.flushEffects();
      await Promise.resolve();
      tree = testHarness.render(() =>
        SoundtrackCard({ moodId: 2, moodName: 'Tenang' })
      );

      // Tidak merender <img>, merender fallback pembungkus MoodBlob
      const images = collectNodes(tree, (n) => n.type === 'img');
      expect(images.length).toBe(0);
      expect(getTextContent(tree)).toContain('Lagu Tanpa Gambar');
      expect(getTextContent(tree)).toContain('Buka lagu');

      // Kasus dengan cover valid
      testHarness.reset();
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

      tree = testHarness.render(() =>
        SoundtrackCard({ moodId: 1, moodName: 'Senang' })
      );
      await testHarness.flushEffects();
      await Promise.resolve();
      tree = testHarness.render(() =>
        SoundtrackCard({ moodId: 1, moodName: 'Senang' })
      );

      const renderedImages = collectNodes(tree, (n) => n.type === 'img');
      expect(renderedImages.length).toBe(1);
      expect(renderedImages[0].props.src).toContain('uploads/album.png');
      expect(renderedImages[0].props.alt).toBe('Cover Lagu Bergambar');
      expect(getTextContent(tree)).toContain('Putar di YouTube');
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

      let tree = testHarness.render(() =>
        SongRecommendationPanel({
          moodId: 1,
          selectedMood: { id: 1, name: 'Senang', color: '#FACC15' }
        })
      );
      await testHarness.flushEffects();
      await Promise.resolve();

      tree = testHarness.render(() =>
        SongRecommendationPanel({
          moodId: 1,
          selectedMood: { id: 1, name: 'Senang', color: '#FACC15' }
        })
      );
      expect(getTextContent(tree)).toContain('Lagu Awal');

      const buttons = collectNodes(tree, (n) => n.type === 'button');
      expect(buttons.length).toBeGreaterThan(0);

      // Simulasikan tombol "Acak lagu" diklik
      await fireEvent.click(buttons[0]);

      // Re-render setelah error 404 ditangkap
      tree = testHarness.render(() =>
        SongRecommendationPanel({
          moodId: 1,
          selectedMood: { id: 1, name: 'Senang', color: '#FACC15' }
        })
      );

      // Pastikan pesan 'Belum ada lagu untuk mood ini.' muncul
      expect(getTextContent(tree)).toContain('Belum ada lagu untuk mood ini.');
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
        testHarness.reset();
        vi.mocked(songService.getSongs).mockResolvedValueOnce(nonArrayData);

        let tree = testHarness.render(() =>
          SongRecommendationPanel({
            moodId: 5,
            selectedMood: { id: 5, name: 'Fokus', color: '#6366F1' }
          })
        );
        await testHarness.flushEffects();
        await Promise.resolve();

        tree = testHarness.render(() =>
          SongRecommendationPanel({
            moodId: 5,
            selectedMood: { id: 5, name: 'Fokus', color: '#6366F1' }
          })
        );

        // Komponen tidak crash dan menggunakan fallback array kosong
        expect(getTextContent(tree)).toContain('Belum ada lagu untuk mood ini.');
      }
    });

    // Skenario 3: Fallback Pesan Error
    it('Skenario 3: menampilkan pesan fallback ketika error getSongs atau getRandomSong tidak memiliki properti userMessage', async () => {
      // 3a. Error getSongs tanpa userMessage
      testHarness.reset();
      vi.mocked(songService.getSongs).mockRejectedValueOnce({});

      let tree = testHarness.render(() =>
        SongRecommendationPanel({
          moodId: 2,
          selectedMood: { id: 2, name: 'Sedih' }
        })
      );
      await testHarness.flushEffects();
      await Promise.resolve();

      tree = testHarness.render(() =>
        SongRecommendationPanel({
          moodId: 2,
          selectedMood: { id: 2, name: 'Sedih' }
        })
      );
      // Pesan fallback getSongs
      expect(getTextContent(tree)).toContain('Gagal memuat rekomendasi lagu.');

      // 3b. Error getRandomSong tanpa userMessage (bukan 404)
      testHarness.reset();
      vi.mocked(songService.getSongs).mockResolvedValueOnce({
        data: [{ id: 10, title: 'Lagu C', artist: 'Artis C' }]
      });
      vi.mocked(songService.getRandomSong).mockRejectedValueOnce({ status: 500 });

      tree = testHarness.render(() =>
        SongRecommendationPanel({
          moodId: 3,
          selectedMood: { id: 3, name: 'Cemas' }
        })
      );
      await testHarness.flushEffects();
      await Promise.resolve();

      tree = testHarness.render(() =>
        SongRecommendationPanel({
          moodId: 3,
          selectedMood: { id: 3, name: 'Cemas' }
        })
      );

      const shuffleBtn = collectNodes(tree, (n) => n.type === 'button')[0];
      await fireEvent.click(shuffleBtn);

      tree = testHarness.render(() =>
        SongRecommendationPanel({
          moodId: 3,
          selectedMood: { id: 3, name: 'Cemas' }
        })
      );
      // Pesan fallback getRandomSong
      expect(getTextContent(tree)).toContain('Gagal mengambil lagu acak.');

      // 3c. Error dengan userMessage kustom
      testHarness.reset();
      vi.mocked(songService.getSongs).mockResolvedValueOnce({
        data: [{ id: 11, title: 'Lagu D', artist: 'Artis D' }]
      });
      vi.mocked(songService.getRandomSong).mockRejectedValueOnce({
        userMessage: 'Gagal koneksi server musik'
      });

      tree = testHarness.render(() =>
        SongRecommendationPanel({
          moodId: 3,
          selectedMood: { id: 3, name: 'Cemas' }
        })
      );
      await testHarness.flushEffects();
      await Promise.resolve();

      tree = testHarness.render(() =>
        SongRecommendationPanel({
          moodId: 3,
          selectedMood: { id: 3, name: 'Cemas' }
        })
      );

      const btn = collectNodes(tree, (n) => n.type === 'button')[0];
      await fireEvent.click(btn);

      tree = testHarness.render(() =>
        SongRecommendationPanel({
          moodId: 3,
          selectedMood: { id: 3, name: 'Cemas' }
        })
      );
      expect(getTextContent(tree)).toContain('Gagal koneksi server musik');
    });

    // Skenario 4: Link Lagu Bukan YouTube / Tanpa Link
    it('Skenario 4: merender link Spotify ("Buka lagu"), YouTube ("Putar di YouTube"), atau tanpa tombol link jika link null', async () => {
      // 4a. Highlighted song dengan Spotify link, lagu kedua tanpa link (null), lagu ketiga YouTube link
      testHarness.reset();
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

      let tree = testHarness.render(() =>
        SongRecommendationPanel({
          moodId: 1,
          selectedMood: { id: 1, name: 'Senang', color: '#FACC15' }
        })
      );
      await testHarness.flushEffects();
      await Promise.resolve();

      tree = testHarness.render(() =>
        SongRecommendationPanel({
          moodId: 1,
          selectedMood: { id: 1, name: 'Senang', color: '#FACC15' }
        })
      );

      // Periksa teks tautan
      const text = getTextContent(tree);
      expect(text).toContain('Buka lagu');
      expect(text).toContain('Putar di YouTube');

      // Periksa semua elemen tautan <a>
      const anchorNodes = collectNodes(tree, (n) => n.type === 'a');
      const hrefs = anchorNodes.map((a) => a.props.href);
      expect(hrefs).toContain('https://open.spotify.com/track/spotify123');
      expect(hrefs).toContain('https://youtube.com/watch?v=yt123');
      expect(hrefs).not.toContain(null);

      // 4b. Highlighted song tanpa link sama sekali (link: null)
      testHarness.reset();
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

      tree = testHarness.render(() =>
        SongRecommendationPanel({
          moodId: 1,
          selectedMood: { id: 1, name: 'Senang', color: '#FACC15' }
        })
      );
      await testHarness.flushEffects();
      await Promise.resolve();

      tree = testHarness.render(() =>
        SongRecommendationPanel({
          moodId: 1,
          selectedMood: { id: 1, name: 'Senang', color: '#FACC15' }
        })
      );

      expect(getTextContent(tree)).toContain('Lagu Solo Tanpa Link');
      const anchorsSingle = collectNodes(tree, (n) => n.type === 'a');
      expect(anchorsSingle.length).toBe(0); // Tombol link tidak dirender sama sekali
    });

    it('menguji kondisi saat moodId kosong, null, atau undefined', () => {
      const treeNull = testHarness.render(() =>
        SongRecommendationPanel({ moodId: null, selectedMood: null })
      );
      expect(getTextContent(treeNull)).toContain(
        'Pilih salah satu karakter mood di atas untuk memunculkan rekomendasi playlist!'
      );

      testHarness.reset();
      const treeEmpty = testHarness.render(() =>
        SongRecommendationPanel({ moodId: '', selectedMood: null })
      );
      expect(getTextContent(treeEmpty)).toContain(
        'Pilih salah satu karakter mood di atas untuk memunculkan rekomendasi playlist!'
      );
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

      let tree = testHarness.render(() =>
        SongRecommendationPanel({
          moodId: 1,
          selectedMood: { id: 1, name: 'Senang', color: '#FACC15' }
        })
      );
      await testHarness.flushEffects();
      await Promise.resolve();

      tree = testHarness.render(() =>
        SongRecommendationPanel({
          moodId: 1,
          selectedMood: { id: 1, name: 'Senang', color: '#FACC15' }
        })
      );

      // Sukses mengacak lagu lain yang memiliki res.data
      mockGetRandom.mockResolvedValueOnce({
        data: {
          id: 50,
          title: 'Lagu Baru Terpilih',
          artist: 'Artis Baru',
          link: 'https://spotify.com/track/50'
        }
      });

      const buttons = collectNodes(tree, (n) => n.type === 'button');
      await fireEvent.click(buttons[0]);

      tree = testHarness.render(() =>
        SongRecommendationPanel({
          moodId: 1,
          selectedMood: { id: 1, name: 'Senang', color: '#FACC15' }
        })
      );
      expect(getTextContent(tree)).toContain('Lagu Baru Terpilih');

      // Sukses mengacak lagu tapi res.data bernilai null/undefined
      mockGetRandom.mockResolvedValueOnce({ data: null });
      await fireEvent.click(buttons[0]);
      tree = testHarness.render(() =>
        SongRecommendationPanel({
          moodId: 1,
          selectedMood: { id: 1, name: 'Senang', color: '#FACC15' }
        })
      );
      // highlightedSong tetap lagu sebelumnya karena res.data tidak ada
      expect(getTextContent(tree)).toContain('Lagu Baru Terpilih');

      // Uji status loading dan randomLoading
      testHarness.slots[2] = true; // loading = true
      tree = testHarness.render(() =>
        SongRecommendationPanel({
          moodId: 1,
          selectedMood: { id: 1, name: 'Senang', color: '#FACC15' }
        })
      );
      expect(getTextContent(tree)).toContain('Memuat daftar lagu...');
      const loadingButtons = collectNodes(tree, (n) => n.type === 'button');
      expect(loadingButtons[0].props.disabled).toBe(true);

      // Uji randomLoading = true
      testHarness.slots[2] = false;
      testHarness.slots[3] = true; // randomLoading = true
      tree = testHarness.render(() =>
        SongRecommendationPanel({
          moodId: 1,
          selectedMood: { id: 1, name: 'Senang', color: '#FACC15' }
        })
      );
      const randomLoadingButtons = collectNodes(tree, (n) => n.type === 'button');
      expect(randomLoadingButtons[0].props.disabled).toBe(true);
      expect(getTextContent(randomLoadingButtons[0])).toContain('Mengacak...');
    });
  });
});
