// Komponen navigasi halaman (Pagination) dengan ellipsis (...) untuk daftar halaman panjang
import React from 'react';
import PropTypes from 'prop-types';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export function getPaginationItems(page, totalPages) {
  if (totalPages <= 5) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  const items = [];
  const startPage = Math.max(2, page - 1);
  const endPage = Math.min(totalPages - 1, page + 1);

  items.push(1);

  if (startPage > 2) {
    items.push('ellipsis-left');
  }

  for (let i = startPage; i <= endPage; i++) {
    items.push(i);
  }

  if (endPage < totalPages - 1) {
    items.push('ellipsis-right');
  }

  items.push(totalPages);
  return items;
}

export default function Pagination({ page = 1, limit = 10, total = 0, onPageChange }) {
  const totalPages = Math.max(1, Math.ceil(total / limit));
  if (totalPages <= 1) return null;

  const pageItems = getPaginationItems(page, totalPages);

  return (
    <nav
      aria-label="Navigasi halaman jurnal"
      className="flex flex-wrap items-center justify-between gap-4 mt-6 bg-white border border-frost-border rounded-2xl px-5 py-3.5 shadow-soft"
    >
      <span className="text-xs font-medium text-ink-soft">
        <span>Halaman </span>
        <strong className="text-ink">{page}</strong>
        <span> dari </span>
        <strong className="text-ink">{totalPages}</strong>
        <span>{` (${total} entri)`}</span>
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
        {pageItems.map((item) => {
          if (typeof item === 'string') {
            return (
              <span
                key={item}
                aria-hidden="true"
                className="w-8 h-8 flex items-center justify-center text-xs font-bold text-ink-soft select-none"
              >
                ...
              </span>
            );
          }
          return (
            <button
              key={item}
              type="button"
              onClick={() => onPageChange?.(item)}
              aria-current={item === page ? 'page' : undefined}
              className={`w-8 h-8 rounded-xl text-xs font-extrabold transition-colors ${
                item === page
                  ? 'bg-denim text-white shadow-xs'
                  : 'text-ink hover:bg-frost border border-transparent'
              }`}
            >
              {item}
            </button>
          );
        })}
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
  page: PropTypes.number.isRequired,
  limit: PropTypes.number.isRequired,
  total: PropTypes.number.isRequired,
  onPageChange: PropTypes.func.isRequired
};
