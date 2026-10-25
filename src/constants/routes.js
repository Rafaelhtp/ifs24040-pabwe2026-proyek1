// Konstanta rute navigasi aplikasi dan endpoint API Moodify (tanpa magic string di komponen/service)

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

export const API_ROUTES = {
  AUTH_LOGIN: '/auth/login',
  AUTH_REGISTER: '/auth/register',
  AUTH_ME: '/auth/me',
  ENTRIES: '/entries',
  MOODS: '/moods',
  SONGS: '/songs',
  SONGS_RANDOM: '/songs/random',
  STATS_WEEKLY: '/stats/weekly'
};

/**
 * Membentuk path halaman edit jurnal berdasarkan ID entri.
 * @param {number|string} id - ID entri jurnal
 * @returns {string} Path rute edit jurnal
 */
export function buildJournalEditRoute(id) {
  return `${ROUTES.JOURNAL}/${id}/edit`;
}
