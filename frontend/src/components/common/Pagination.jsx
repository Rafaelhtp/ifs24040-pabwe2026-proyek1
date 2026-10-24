// Komponen navigasi halaman (Pagination)
import React from 'react';
import PropTypes from 'prop-types';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function Pagination({ page = 1, limit = 10, total = 0, onPageChange }) {
  const totalPages = Math.max(1, Math.ceil(total / limit));
  if (totalPages <= 1) return null;

  const pages = Array.from({ length: totalPages }, (_, index) => index + 1);

  return (
    <nav
      aria-label="Navigasi halaman jurnal"
      className="flex flex-wrap items-center justify-between gap-4 mt-6 bg-white border border-frost-border rounded-2xl px-5 py-3.5 shadow-soft"
    >
      <span className="text-xs font-medium text-ink-soft">
        Halaman <strong className="text-ink">{page}</strong> dari{' '}
        <strong className="text-ink">{totalPages}</strong> ({total} entri)
      </span>
      <div className="flex items-center gap-1.5">
        <button
          type="button"
          onClick={() => onPageChange?.(page - 1)}
          disabled={page <= 1}
          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-frost-border text-xs font-bold text-ink hover:bg-frost disabled:opacity-40 disabled:pointer-events-none transition-colors"
        >
          <ChevronLeft className="w-3.5 h-3.5" aria-hidden="true" />
          <span>Sebelumnya</span>
        </button>
        {pages.map((pageNum) => (
          <button
            key={pageNum}
            type="button"
            onClick={() => onPageChange?.(pageNum)}
            aria-current={pageNum === page ? 'page' : undefined}
            className={`w-8 h-8 rounded-xl text-xs font-extrabold transition-colors ${
              pageNum === page
                ? 'bg-denim text-white shadow-xs'
                : 'text-ink hover:bg-frost border border-transparent'
            }`}
          >
            {pageNum}
          </button>
        ))}
        <button
          type="button"
          onClick={() => onPageChange?.(page + 1)}
          disabled={page >= totalPages}
          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-frost-border text-xs font-bold text-ink hover:bg-frost disabled:opacity-40 disabled:pointer-events-none transition-colors"
        >
          <span>Berikutnya</span>
          <ChevronRight className="w-3.5 h-3.5" aria-hidden="true" />
        </button>
      </div>
    </nav>
  );
}

Pagination.propTypes = {
  page: PropTypes.number,
  limit: PropTypes.number,
  total: PropTypes.number,
  onPageChange: PropTypes.func
};
