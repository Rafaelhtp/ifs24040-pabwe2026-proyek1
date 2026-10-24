// Utilitas pembersih parameter query URL agar tidak mengirim nilai kosong ke API

/**
 * Menyaring properti objek parameter yang bernilai undefined, null, atau string kosong.
 * @param {Record<string, unknown>} params - Objek parameter mentah
 * @returns {Record<string, unknown>} Objek parameter bersih siap dikirim ke Axios
 */
export function cleanQueryParams(params = {}) {
  const cleanParams = {};
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      cleanParams[key] = value;
    }
  });
  return cleanParams;
}
