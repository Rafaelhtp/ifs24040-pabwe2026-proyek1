// Halaman Statistik (/stats): 3 Summary Card (termasuk meteran Pistachio & MoodBlob besar) + Grafik Recharts
import React, { useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { CalendarCheck2, Zap, PenLine } from 'lucide-react';
import { getWeeklyStats } from '../api/statsApi';
import useFetch from '../hooks/useFetch';
import MoodBlob from '../components/MoodBlob';
import StatCard from '../components/StatCard';
import MoodChart from '../components/MoodChart';
import Loading from '../components/Loading';
import ErrorMessage from '../components/ErrorMessage';
import EmptyState from '../components/EmptyState';

export default function Stats() {
  const navigate = useNavigate();

  const fetchStats = useCallback(() => getWeeklyStats(), []);
  const { data: stats, loading, error, refetch } = useFetch(fetchStats, [fetchStats]);

  if (loading) {
    return <Loading text="Menghitung statistik mingguanmu..." />;
  }

  if (error) {
    return <ErrorMessage error={error} onRetry={refetch} />;
  }

  const totalEntries = Number(stats?.total_entries_7d || 0);
  const avgEnergy = stats?.avg_energy_7d ? Number(stats.avg_energy_7d) : 0;
  const energyPct = Math.min(100, Math.max(0, Math.round((avgEnergy / 5) * 100)));
  const topMood = stats?.top_mood || null;
  const byMood = Array.isArray(stats?.by_mood) ? stats.by_mood : [];
  const daily = Array.isArray(stats?.daily) ? stats.daily : [];

  return (
    <div className="space-y-6">
      {/* Header Halaman Statistik */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-ink">Statistik & Wawasan Mingguan</h1>
          <p className="text-sm font-medium text-ink-soft">
            Analisis frekuensi jurnal, rata-rata energi, dan distribusi mood dalam 7 hari terakhir
          </p>
        </div>
        <Link
          to="/journal/new"
          className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-denim hover:bg-denim-dark text-white text-sm font-extrabold shadow-soft transition-all"
        >
          <PenLine className="w-4 h-4" />
          <span>Tambah Catatan</span>
        </Link>
      </div>

      {/* 3 Summary Cards */}
      <section aria-label="Ringkasan Statistik Mingguan" className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* 1. Total Entri 7 Hari */}
        <StatCard
          icon={<CalendarCheck2 className="w-7 h-7 text-denim-dark" />}
          label="Total Entri (7 Hari)"
          value={`${totalEntries} Catatan`}
          subtitle="Rekaman jurnal dalam 7 hari terakhir"
          accentColor="#5798D7"
        />

        {/* 2. Rata-rata Energi dari 5.0 dengan Meteran Pistachio */}
        <StatCard
          icon={<Zap className="w-7 h-7 text-ink" />}
          label="Rata-rata Energi Mingguan"
          value={totalEntries > 0 ? `${avgEnergy.toFixed(2)} / 5.0` : '0.0 / 5.0'}
          subtitle={
            totalEntries > 0
              ? `Tingkat energi rata-rata (${energyPct}%)`
              : 'Belum ada data energi minggu ini'
          }
          accentColor="#B9C255"
        >
          <div className="w-full h-3 rounded-full bg-frost overflow-hidden border border-frost-border">
            <div
              style={{ width: `${energyPct}%` }}
              className="h-full bg-pistachio transition-all duration-500 rounded-full"
            />
          </div>
        </StatCard>

        {/* 3. Top Mood dengan MoodBlob Besar dan Jumlahnya */}
        <div
          style={{ borderBottomColor: topMood?.color || '#5798D7' }}
          className="bg-white rounded-3xl border border-frost-border border-b-4 p-5 shadow-soft flex items-center gap-4"
        >
          <MoodBlob
            moodName={topMood?.name || 'tenang'}
            color={topMood?.color || '#5798D7'}
            size="lg"
          />
          <div className="min-w-0">
            <p className="text-xs font-bold text-ink-soft">Mood Paling Dominan</p>
            <p className="text-2xl font-extrabold text-ink leading-tight mt-0.5 truncate">
              {topMood ? topMood.name : 'Belum Ada'}
            </p>
            <span className="inline-block mt-1 px-2.5 py-0.5 rounded-full bg-pistachio text-ink text-xs font-extrabold">
              {topMood ? `Tercatat ${topMood.count} kali` : '0 kali minggu ini'}
            </span>
          </div>
        </div>
      </section>

      {/* Grafik Tren Harian & Distribusi Mood */}
      {totalEntries === 0 ? (
        <EmptyState
          moodName="tenang"
          moodColor="#5798D7"
          title="Belum Ada Data Statistik Mingguan"
          description="Catat suasana hatimu selama beberapa hari ke depan untuk melihat grafik tren energi dan proporsi mood di halaman ini."
          actionLabel="Tulis Jurnal Sekarang"
          onAction={() => navigate('/journal/new')}
        />
      ) : (
        <MoodChart byMood={byMood} daily={daily} />
      )}
    </div>
  );
}
