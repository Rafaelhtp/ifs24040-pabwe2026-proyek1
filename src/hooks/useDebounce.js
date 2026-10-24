// Custom hook untuk menunda pembaruan nilai input pencarian (debounce)
import { useState, useEffect } from 'react';
import { DEBOUNCE_DELAY_MS } from '../constants/config';

/**
 * Menunda pembaruan nilai hingga pengguna berhenti mengetik selama waktu tunda tertentu.
 * @param {any} value - Nilai input yang ingin ditunda
 * @param {number} [delay] - Durasi tunda dalam milidetik (default 400ms)
 * @returns {any} Nilai yang telah ditunda (debounced)
 */
export default function useDebounce(value, delay = DEBOUNCE_DELAY_MS) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}
