// Komponen grafik mingguan: ComposedChart Sumbu Ganda (Daily) & Distribusi Mood (By Mood + Legenda MoodBlob)
import React from 'react';
import PropTypes from 'prop-types';
import {
  ResponsiveContainer,
  ComposedChart,
  BarChart,
  Bar,
  Line,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip
} from 'recharts';
import MoodBlob from './MoodBlob';
import { formatDateShort } from '../../utils/formatDate';
import { DEFAULT_ACCENT_COLOR } from '../../constants/config';

export default function MoodChart({ byMood = [], daily = [] }) {
  const formattedDaily = daily.map((item) => ({
    ...item,
    shortDate: formatDateShort(item.date),
    avg_energy: Number(item.avg_energy || 0),
    count: Number(item.count || 0)
  }));

  const totalMoodCount = byMood.reduce((acc, cur) => acc + Number(cur.count || 0), 0);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="bg-white rounded-3xl border border-frost-border p-6 shadow-soft">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
          <div>
            <h2 className="text-base font-extrabold text-ink">Tren Harian (7 Hari Terakhir)</h2>
            <p className="text-xs text-ink-soft">
              Jumlah entri jurnal & rata-rata tingkat energi harian
            </p>
          </div>
          <div className="flex items-center gap-3 text-xs font-bold">
            <span className="inline-flex items-center gap-1.5 text-ink">
              <span className="w-3 h-3 rounded-sm bg-[#5798D7] inline-block" />
              Entri
            </span>
            <span className="inline-flex items-center gap-1.5 text-ink">
              <span className="w-3 h-3 rounded-full bg-pistachio inline-block border border-ink/20" />
              Energi
            </span>
          </div>
        </div>

        <div className="h-72 min-h-[288px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart
              data={formattedDaily}
              margin={{ top: 10, right: 8, left: -18, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#E6F1FA" />
              <XAxis
                dataKey="shortDate"
                tick={{ fontSize: 12, fill: '#1E293B', fontWeight: 600 }}
              />
              <YAxis
                yAxisId="left"
                allowDecimals={false}
                tick={{ fontSize: 12, fill: '#1F4E80', fontWeight: 700 }}
              />
              <YAxis
                yAxisId="right"
                orientation="right"
                domain={[0, 5]}
                ticks={[0, 1, 2, 3, 4, 5]}
                tick={{ fontSize: 12, fill: '#1E293B', fontWeight: 700 }}
              />
              <Tooltip
                formatter={(value, name) => {
                  if (name === 'count') return [`${value} entri`, 'Jumlah Entri'];
                  if (name === 'avg_energy') return [`${value} / 5.0`, 'Rata-rata Energi'];
                  return [value, name];
                }}
                labelFormatter={(label, payload) => {
                  const rawDate = payload?.[0]?.payload?.date;
                  return `Tanggal: ${rawDate || label}`;
                }}
                contentStyle={{
                  borderRadius: '16px',
                  borderColor: '#C5DDF2',
                  color: '#1E293B',
                  fontSize: '12px',
                  fontWeight: 600
                }}
              />
              <Bar
                yAxisId="left"
                dataKey="count"
                fill={DEFAULT_ACCENT_COLOR}
                radius={[8, 8, 0, 0]}
                barSize={26}
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="avg_energy"
                stroke="#B9C255"
                strokeWidth={3.5}
                dot={{ r: 5, fill: '#B9C255', stroke: '#1E293B', strokeWidth: 2 }}
                activeDot={{ r: 7 }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-frost-border p-6 shadow-soft flex flex-col justify-between">
        <div>
          <div className="mb-4">
            <h2 className="text-base font-extrabold text-ink">Distribusi Mood Mingguan</h2>
            <p className="text-xs text-ink-soft">
              Proporsi suasana hati yang tercatat selama 7 hari terakhir
            </p>
          </div>

          <div className="h-48 min-h-[192px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={byMood}
                layout="vertical"
                margin={{ top: 4, right: 20, left: 10, bottom: 4 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#E6F1FA" horizontal={false} />
                <XAxis
                  type="number"
                  allowDecimals={false}
                  tick={{ fontSize: 12, fill: '#1E293B', fontWeight: 600 }}
                />
                <YAxis
                  type="category"
                  dataKey="name"
                  width={80}
                  tick={{ fontSize: 12, fill: '#1E293B', fontWeight: 700 }}
                />
                <Tooltip
                  formatter={(value) => [`${value} kali`, 'Frekuensi']}
                  contentStyle={{
                    borderRadius: '16px',
                    borderColor: '#C5DDF2',
                    color: '#1E293B',
                    fontSize: '12px',
                    fontWeight: 600
                  }}
                />
                <Bar dataKey="count" radius={[0, 8, 8, 0]} barSize={20}>
                  {byMood.map((entry) => (
                    <Cell
                      key={`cell-${entry.mood_id}`}
                      fill={entry.color || DEFAULT_ACCENT_COLOR}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-frost-border grid grid-cols-2 sm:grid-cols-3 gap-2">
          {byMood.map((item) => {
            const pct =
              totalMoodCount > 0 ? Math.round((Number(item.count) / totalMoodCount) * 100) : 0;
            return (
              <div
                key={item.mood_id}
                className="flex items-center gap-2 bg-frost/50 rounded-2xl px-3 py-1.5 border border-frost-border"
              >
                <MoodBlob moodName={item.name} color={item.color} size="xs" />
                <div className="min-w-0">
                  <p className="text-xs font-extrabold text-ink truncate">{item.name}</p>
                  <p className="text-[11px] font-bold text-ink-soft">
                    {item.count}x ({pct}%)
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

MoodChart.propTypes = {
  byMood: PropTypes.arrayOf(
    PropTypes.shape({
      mood_id: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
      name: PropTypes.string,
      color: PropTypes.string,
      count: PropTypes.oneOfType([PropTypes.number, PropTypes.string])
    })
  ),
  daily: PropTypes.arrayOf(
    PropTypes.shape({
      date: PropTypes.string,
      count: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
      avg_energy: PropTypes.oneOfType([PropTypes.number, PropTypes.string])
    })
  )
};
