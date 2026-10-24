// Hook untuk memperbarui judul dokumen (<title>) secara unik pada setiap halaman demi SEO & Aksesibilitas
import { useEffect } from 'react';
import { BASE_APP_TITLE } from '../constants/config';

/**
 * Mengatur document.title pada halaman yang sedang aktif.
 * @param {string} [title] - Judul spesifik halaman
 */
export default function usePageTitle(title) {
  useEffect(() => {
    document.title = title ? `${title} | Moodify` : BASE_APP_TITLE;
  }, [title]);
}
