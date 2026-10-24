// Konstanta rute navigasi aplikasi Moodify (tanpa magic string di komponen/halaman)

export const ROUTES = {
  HOME: '/',
  LOGIN: '/auth/login',
  DASHBOARD_LOGIN: '/dashboard/auth/login',
  REGISTER: '/auth/register',
  DASHBOARD_REGISTER: '/dashboard/auth/register',
  LEGACY_LOGIN: '/login',
  LEGACY_REGISTER: '/register',
  DASHBOARD: '/dashboard',
  JOURNAL: '/journal',
  JOURNAL_NEW: '/journal/new',
  JOURNAL_EDIT: '/journal/:id/edit',
  STATS: '/stats',
  SONGS: '/songs',
  MOODS: '/moods'
};

/**
 * Membentuk path halaman edit jurnal berdasarkan ID entri.
 * @param {number|string} id - ID entri jurnal
 * @returns {string} Path rute edit jurnal
 */
export function buildJournalEditRoute(id) {
  return `/journal/${id}/edit`;
}
