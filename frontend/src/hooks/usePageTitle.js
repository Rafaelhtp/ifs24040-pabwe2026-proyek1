// Hook untuk memperbarui judul dokumen (<title>) secara unik pada setiap halaman demi SEO & Aksesibilitas
import { useEffect } from 'react';

export default function usePageTitle(title) {
  useEffect(() => {
    const baseTitle = 'Moodify — Jurnal Mood Harian & Rekomendasi Playlist';
    document.title = title ? `${title} | Moodify` : baseTitle;
  }, [title]);
}
