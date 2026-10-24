// Utilitas pembentuk objek FormData multipart/form-data untuk entri jurnal dan lagu

/**
 * Membangun objek FormData untuk penyimpanan entri jurnal harian.
 * @param {object} payload - Data formulir entri jurnal
 * @param {string} payload.entryDate - Tanggal jurnal (YYYY-MM-DD)
 * @param {string|number} payload.moodId - ID mood terpilih
 * @param {string|number} payload.energyLevel - Tingkat energi (1-5)
 * @param {string} [payload.note] - Isi catatan harian
 * @param {File|null} [payload.imageFile] - File foto lampiran opsional
 * @returns {FormData} Objek FormData siap dikirim ke endpoint /api/entries
 */
export function buildEntryFormData({ entryDate, moodId, energyLevel, note = '', imageFile = null }) {
  const formData = new FormData();
  formData.append('entry_date', String(entryDate).trim());
  formData.append('mood_id', String(moodId));
  formData.append('energy_level', String(energyLevel));
  formData.append('note', String(note || '').trim());
  if (imageFile) {
    formData.append('image', imageFile);
  }
  return formData;
}

/**
 * Membangun objek FormData untuk penyimpanan lagu rekomendasi.
 * @param {object} payload - Data formulir lagu
 * @param {string} payload.title - Judul lagu
 * @param {string} payload.artist - Nama artis/penyanyi
 * @param {string|number} payload.moodId - ID kategori mood
 * @param {string} [payload.link] - Tautan eksternal lagu opsional
 * @param {File|null} [payload.coverFile] - File sampul lagu opsional
 * @returns {FormData} Objek FormData siap dikirim ke endpoint /api/songs
 */
export function buildSongFormData({ title, artist, moodId, link = '', coverFile = null }) {
  const formData = new FormData();
  formData.append('title', String(title || '').trim());
  formData.append('artist', String(artist || '').trim());
  formData.append('mood_id', String(moodId));
  const cleanLink = String(link || '').trim();
  if (cleanLink) {
    formData.append('link', cleanLink);
  }
  if (coverFile) {
    formData.append('cover', coverFile);
  }
  return formData;
}
