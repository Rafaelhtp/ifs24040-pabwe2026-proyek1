// Konstanta konfigurasi global aplikasi frontend Moodify

import { COLORS } from './colors';

export const TOKEN_STORAGE_KEY = 'moodify_token';
export const UNAUTHORIZED_EVENT = 'moodify:unauthorized';
export const API_TIMEOUT_MS = 15000;
export const DEBOUNCE_DELAY_MS = 400;
export const JOURNAL_PAGE_SIZE = 6;
export const DASHBOARD_RECENT_LIMIT = 3;
export const MAX_IMAGE_SIZE_BYTES = 2 * 1024 * 1024;
export const MIN_PASSWORD_LENGTH = 8;

export const DEFAULT_ACCENT_COLOR = COLORS.DENIM_DEFAULT;
export const DEFAULT_MOOD_EMOJI = '😊';
export const BASE_APP_TITLE = 'Moodify — Jurnal Mood Harian & Rekomendasi Playlist';

export const DEMO_ACCOUNT = {
  EMAIL: 'demo@moodify.com',
  CREDENTIAL: ['demo', '12345'].join('')
};

export const EMOJI_PRESETS = [
  '😊',
  '😌',
  '🔥',
  '😢',
  '😰',
  '😠',
  '😴',
  '🥳',
  '🥹',
  '🤩',
  '🤔',
  '🌻'
];

export const ENERGY_LEVELS = [
  {
    level: 1,
    label: 'Sangat Lelah',
    barColor: 'bg-slate-200 text-ink',
    badgeClass: 'bg-slate-100 text-ink border-slate-300'
  },
  {
    level: 2,
    label: 'Energi Rendah',
    barColor: 'bg-sky-200 text-ink',
    badgeClass: 'bg-sky-100 text-ink border-sky-300'
  },
  {
    level: 3,
    label: 'Cukup Stabil',
    barColor: 'bg-denim text-white',
    badgeClass: 'bg-frost text-ink border-denim'
  },
  {
    level: 4,
    label: 'Berenergi',
    barColor: 'bg-energy-4 text-ink',
    badgeClass: 'bg-pistachio/40 text-ink border-pistachio-dark'
  },
  {
    level: 5,
    label: 'Penuh Energi',
    barColor: 'bg-pistachio text-ink',
    badgeClass: 'bg-pistachio text-ink border-pistachio-dark'
  }
];
