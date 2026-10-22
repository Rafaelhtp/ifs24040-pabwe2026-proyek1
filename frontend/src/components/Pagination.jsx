// Komponen navigasi halaman (Pagination)
import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function Pagination({ page = 1, limit = 10, total = 0, onPageChange }) {
  const totalPages = Math.max(1, Math.ceil(total / limit));
  if (totalPages <= 1) return null;

  const pages = [];
  for (let i = 1; i <= totalPages; i += 1) {
    pages.push(i);
  }

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
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-frost-border text-xs font-bold text-ink hover:bg-frost disabled:opacity-40 disabled:pointer-events-none transition-colors"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
          <span>Sebelumnya</span>
        </button>
        {pages.map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => onPageChange(p)}
            aria-current={p === page ? 'page' : undefined}
            className={`w-8 h-8 rounded-xl text-xs font-extrabold transition-colors ${
              p === page
                ? 'bg-denim text-white shadow-xs'
                : 'text-ink hover:bg-frost border border-transparent'
            }`}
          >
            {p}
          </button>
        ))}
        <button
          type="button"
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-frost-border text-xs font-bold text-ink hover:bg-frost disabled:opacity-40 disabled:pointer-events-none transition-colors"
        >
          <span>Berikutnya</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </nav>
  );
}
