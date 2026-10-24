// Komponen indikator tingkat energi harian (1-5) berbentuk baterai/bar dengan kontras WCAG AA
import React from 'react';
import { BatteryLow, BatteryMedium, BatteryFull, Zap } from 'lucide-react';

const ENERGY_LEVELS = [
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
    barColor: 'bg-[#A8BA42] text-ink',
    badgeClass: 'bg-pistachio/40 text-ink border-pistachio-dark'
  },
  {
    level: 5,
    label: 'Penuh Energi',
    barColor: 'bg-pistachio text-ink',
    badgeClass: 'bg-pistachio text-ink border-pistachio-dark'
  }
];

export default function EnergySlider({ value = 3, onChange }) {
  const numValue = Number(value) || 3;
  const current = ENERGY_LEVELS.find((item) => item.level === numValue) || ENERGY_LEVELS[2];

  const renderIcon = () => {
    if (numValue <= 1) return <BatteryLow className="w-4 h-4" aria-hidden="true" />;
    if (numValue <= 3) return <BatteryMedium className="w-4 h-4" aria-hidden="true" />;
    if (numValue === 4) return <BatteryFull className="w-4 h-4" aria-hidden="true" />;
    return <Zap className="w-4 h-4" aria-hidden="true" />;
  };

  return (
    <div className="bg-frost/55 border border-frost-border rounded-3xl p-5">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
        <div>
          <span className="block text-sm font-extrabold text-ink">
            Tingkat Energi Harian ({numValue}/5)
          </span>
          <span className="block text-xs text-ink-soft">
            Seberapa penuh baterai energimu hari ini?
          </span>
        </div>

        <span
          className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border text-xs font-extrabold ${current.badgeClass}`}
        >
          {renderIcon()}
          <span>
            {numValue} — {current.label}
          </span>
        </span>
      </div>

      {/* Bar Indikator Baterai 5 Segmen yang Dapat Diklik */}
      <div
        role="radiogroup"
        aria-label="Pilih tingkat energi 1 sampai 5"
        className="grid grid-cols-5 gap-2 p-2 bg-white rounded-2xl border border-frost-border shadow-2xs"
      >
        {ENERGY_LEVELS.map((item) => {
          const isFilled = item.level <= numValue;
          const isCurrent = item.level === numValue;

          return (
            <button
              key={item.level}
              type="button"
              role="radio"
              aria-checked={isCurrent}
              aria-label={`Energi ${item.level}: ${item.label}`}
              onClick={() => onChange(item.level)}
              className={`h-11 min-h-[44px] rounded-xl flex flex-col items-center justify-center transition-all duration-150 border ${
                isFilled
                  ? `${current.barColor} border-transparent shadow-2xs`
                  : 'bg-frost/40 text-ink-soft border-frost-border hover:bg-frost'
              } ${isCurrent ? 'ring-2 ring-denim-dark scale-[1.02]' : ''}`}
            >
              <span className="text-xs font-extrabold leading-none">{item.level}</span>
              <span className="text-[10px] font-bold hidden sm:inline mt-0.5 truncate max-w-full px-1">
                {item.label}
              </span>
            </button>
          );
        })}
      </div>

      <div className="flex justify-between text-[11px] font-bold text-ink-soft mt-2 px-1">
        <span>1 Sangat Lelah</span>
        <span>3 Cukup Stabil</span>
        <span>5 Penuh Energi</span>
      </div>
    </div>
  );
}
