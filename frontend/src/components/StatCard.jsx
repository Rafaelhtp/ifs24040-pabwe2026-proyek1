// Komponen kartu ringkasan angka statistik untuk Dashboard dan halaman Statistik
import React from 'react';

export default function StatCard({
  icon,
  label,
  value,
  subtitle,
  accentColor = '#5798D7',
  children
}) {
  return (
    <div
      style={{ borderBottomColor: accentColor }}
      className="bg-white rounded-3xl border border-frost-border border-b-4 p-5 shadow-soft flex flex-col justify-between gap-3"
    >
      <div className="flex items-center gap-4">
        <div
          style={{ backgroundColor: `${accentColor}20` }}
          className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0"
        >
          {icon}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-bold text-ink-soft">{label}</p>
          <p className="text-2xl font-extrabold text-ink leading-tight mt-0.5 truncate">
            {value}
          </p>
          {subtitle && (
            <p className="text-xs font-medium text-ink-soft mt-0.5 truncate">{subtitle}</p>
          )}
        </div>
      </div>
      {children && <div className="pt-1">{children}</div>}
    </div>
  );
}
