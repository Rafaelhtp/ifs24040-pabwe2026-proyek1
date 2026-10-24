// Komponen indikator tingkat energi harian (1-5) berbentuk baterai/bar dengan kontras WCAG AA
import React from 'react';
import PropTypes from 'prop-types';
import { BatteryLow, BatteryMedium, BatteryFull, Zap } from 'lucide-react';
import { ENERGY_LEVELS } from '../../constants/config';

function EnergyIcon({ level }) {
  if (level <= 1) return <BatteryLow className="w-4 h-4" aria-hidden="true" />;
  if (level <= 3) return <BatteryMedium className="w-4 h-4" aria-hidden="true" />;
  if (level === 4) return <BatteryFull className="w-4 h-4" aria-hidden="true" />;
  return <Zap className="w-4 h-4" aria-hidden="true" />;
}

EnergyIcon.propTypes = {
  level: PropTypes.number
};

export default function EnergySlider({ value = 3, onChange }) {
  const numValue = Number(value) || 3;
  const current = ENERGY_LEVELS.find((item) => item.level === numValue) || ENERGY_LEVELS[2];

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
          <EnergyIcon level={numValue} />
          <span>
            {numValue} — {current.label}
          </span>
        </span>
      </div>

      <fieldset
        aria-label="Pilih tingkat energi 1 sampai 5"
        className="grid grid-cols-5 gap-2 p-2 bg-white rounded-2xl border border-frost-border shadow-2xs m-0"
      >
        {ENERGY_LEVELS.map((item) => {
          const isFilled = item.level <= numValue;
          const isCurrent = item.level === numValue;

          return (
            <button
              key={item.level}
              type="button"
              aria-pressed={isCurrent}
              aria-label={`Energi ${item.level}: ${item.label}`}
              onClick={() => onChange?.(item.level)}
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
      </fieldset>

      <div className="flex justify-between text-[11px] font-bold text-ink-soft mt-2 px-1">
        <span>1 Sangat Lelah</span>
        <span>3 Cukup Stabil</span>
        <span>5 Penuh Energi</span>
      </div>
    </div>
  );
}

EnergySlider.propTypes = {
  value: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  onChange: PropTypes.func
};
