// Komponen penampil pesan error API maupun kegagalan koneksi ke server
import React from 'react';
import PropTypes from 'prop-types';
import { RefreshCw, WifiOff, AlertCircle } from 'lucide-react';
import { MESSAGES } from '../../constants/messages';

export default function ErrorMessage({ error, onRetry }) {
  if (!error) return null;

  const isNetwork = Boolean(error?.isNetworkError);
  let messageText = error?.message || MESSAGES.LOAD_ERROR;
  if (typeof error === 'string') {
    messageText = error;
  } else if (isNetwork) {
    messageText = MESSAGES.NETWORK_ERROR;
  }

  return (
    <div
      role="alert"
      className="bg-white border-2 border-rose-200 rounded-3xl p-6 text-center max-w-lg mx-auto my-6 shadow-soft"
    >
      <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-700 flex items-center justify-center mx-auto mb-3">
        {isNetwork ? (
          <WifiOff className="w-6 h-6" aria-hidden="true" />
        ) : (
          <AlertCircle className="w-6 h-6" aria-hidden="true" />
        )}
      </div>
      <h2 className="text-base font-extrabold text-ink mb-1">{messageText}</h2>
      {isNetwork && (
        <p className="text-xs text-ink-soft mb-4">
          Pastikan koneksi jaringan stabil dan layanan server Moodify sedang aktif, lalu coba kembali.
        </p>
      )}
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="mt-2 inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-denim hover:bg-denim-dark text-white text-xs font-bold shadow-xs transition-colors min-h-[36px]"
        >
          <RefreshCw className="w-4 h-4" aria-hidden="true" />
          <span>Coba lagi</span>
        </button>
      )}
    </div>
  );
}

ErrorMessage.propTypes = {
  error: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.shape({
      message: PropTypes.string,
      isNetworkError: PropTypes.bool
    })
  ]),
  onRetry: PropTypes.func
};
