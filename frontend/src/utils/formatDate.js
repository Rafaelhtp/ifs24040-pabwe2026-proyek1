// Utilitas pemformatan tanggal ke Bahasa Indonesia dan format input HTML (YYYY-MM-DD)

const MONTHS_ID = [
  'Januari',
  'Februari',
  'Maret',
  'April',
  'Mei',
  'Juni',
  'Juli',
  'Agustus',
  'September',
  'Oktober',
  'November',
  'Desember'
];

const SHORT_MONTHS_ID = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'Mei',
  'Jun',
  'Jul',
  'Agu',
  'Sep',
  'Okt',
  'Nov',
  'Des'
];

const DAYS_ID = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];

// Mengembalikan tanggal hari ini dalam format YYYY-MM-DD (waktu lokal)
export function getTodayDateString() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Mengubah string YYYY-MM-DD menjadi "Kamis, 22 Oktober 2026"
export function formatDateLong(dateStr) {
  if (!dateStr) return '-';
  const parts = String(dateStr).slice(0, 10).split('-');
  if (parts.length !== 3) return dateStr;

  const year = Number(parts[0]);
  const monthIdx = Number(parts[1]) - 1;
  const day = Number(parts[2]);
  const dateObj = new Date(year, monthIdx, day);

  if (Number.isNaN(dateObj.getTime())) return dateStr;

  const dayName = DAYS_ID[dateObj.getDay()];
  const monthName = MONTHS_ID[monthIdx] || '';
  return `${dayName}, ${day} ${monthName} ${year}`;
}

// Mengubah string YYYY-MM-DD menjadi "22 Okt" untuk label grafik
export function formatDateShort(dateStr) {
  if (!dateStr) return '-';
  const parts = String(dateStr).slice(0, 10).split('-');
  if (parts.length !== 3) return dateStr;

  const monthIdx = Number(parts[1]) - 1;
  const day = Number(parts[2]);
  return `${day} ${SHORT_MONTHS_ID[monthIdx] || ''}`;
}
