// Halaman Dashboard (/dashboard): sapaan user, 3 StatCard, SoundtrackCard, dan 3 entri terbaru
import React, { useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CalendarCheck2, Zap, PenLine, ArrowRight, BarChart3 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getWeeklyStats } from '../services/statsService';
import { getEntries } from '../services/entryService';
import useFetch from '../hooks/useFetch';
import usePageTitle from '../hooks/usePageTitle';
import MoodBlob from '../components/mood/MoodBlob';
import StatCard from '../components/common/StatCard';
import SoundtrackCard from '../components/entries/SoundtrackCard';
import EntryCard from '../components/entries/EntryCard';
import Loading from '../components/common/Loading';
import ErrorMessage from '../components/common/ErrorMessage';
import EmptyState from '../components/common/EmptyState';

export default function Dashboard() {
  usePageTitle('Dashboard');
  const { user } = useAuth();
  const navigate = useNavigate();

  const fetchDashboardData = useCallback(async () => {
    const [statsRes, entriesRes] = await Promise.all([
      getWeeklyStats(),
      getEntries({ page: 1, limit: 3 })
    ]);
    return {
      data: {
        stats: statsRes.data,
        recentEntries: entriesRes.data || []
      }
    };
  }, []);

  const { data, loading, error, refetch } = useFetch(fetchDashboardData, [fetchDashboardData]);

  if (loading) {
    return <Loading text="Memuat beranda suasana hatimu..." />;
  }

  if (error) {
    return <ErrorMessage error={error} onRetry={refetch} />;
  }

  const stats = data?.stats || {
    total_entries_7d: 0,
    avg_energy_7d: 0,
    top_mood: null,
    by_mood: [],
    daily: []
  };
  const recentEntries = data?.recentEntries || [];
  const hasAnyData = stats.total_entries_7d > 0 || recentEntries.length > 0;

  // Mood untuk SoundtrackCard diambil dari entri terbaru, atau fallback ke top_mood
  const latestEntry = recentEntries[0] || null;
  const activeSoundtrackMoodId = latestEntry?.mood_id || stats.top_mood?.id || null;
  const activeSoundtrackMoodName =
    latestEntry?.mood_name || stats.top_mood?.name || 'Hari Ini';
  const activeSoundtrackMoodColor =
    latestEntry?.color || stats.top_mood?.color || '#5798D7';

  return (
    <div className="space-y-8">
      {/* Hero Banner Sapaan */}
      <section className="bg-gradient-to-r from-denim via-denim-dark to-[#3875B2] rounded-3xl p-6 sm:p-8 text-white shadow-soft-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex w-18 h-18 rounded-3xl bg-white/15 backdrop-blur-xs items-center justify-center shrink-0">
            <MoodBlob
              moodName={stats.top_mood?.name || 'senang'}
              color={stats.top_mood?.color || '#FACC15'}
              size="md"
              className="mood-blob-float"
            />
          </div>
          <div>
            <span className="inline-block px-3 py-1 rounded-full bg-pistachio text-ink text-xs font-extrabold mb-2">
              Ruang Harian Moodify
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold">
              Halo, {user?.name || 'Teman Moodify'}!
            </h1>
            <p className="text-sm text-frost mt-1 max-w-xl">
              Bagaimana kabar pikiran dan energimu hari ini? Luangkan sejenak untuk mencatatnya.
            </p>
          </div>
        </div>

        <Link
          to="/journal/new"
          className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-pistachio hover:bg-pistachio-dark text-ink text-sm font-extrabold shadow-soft transition-transform hover:scale-[1.02] shrink-0"
        >
          <PenLine className="w-4 h-4" />
          <span>Tulis Jurnal Hari Ini</span>
        </Link>
      </section>

      {/* 3 Ringkasan Singkat (StatCard) */}
      <section aria-label="Ringkasan 7 Hari Terakhir" className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          icon={<CalendarCheck2 className="w-6 h-6 text-denim-dark" />}
          label="Entri 7 Hari Terakhir"
          value={`${stats.total_entries_7d} Jurnal`}
          subtitle="Catatan dalam sepekan terakhir"
          accentColor="#5798D7"
        />

        <StatCard
          icon={<Zap className="w-6 h-6 text-ink" />}
          label="Rata-rata Energi (7 Hari)"
          value={stats.total_entries_7d > 0 ? `${stats.avg_energy_7d} / 5.0` : '-'}
          subtitle="Indikator baterai harianmu"
          accentColor="#B9C255"
        />

        <StatCard
          icon={
            <MoodBlob
              moodName={stats.top_mood?.name || 'tenang'}
              color={stats.top_mood?.color || '#5798D7'}
              size="sm"
            />
          }
          label="Mood Terbanyak"
          value={stats.top_mood ? stats.top_mood.name : 'Belum ada'}
          subtitle={
            stats.top_mood
              ? `Muncul ${stats.top_mood.count} kali minggu ini`
              : 'Mulai tulis jurnal pertamamu'
          }
          accentColor={stats.top_mood?.color || '#5798D7'}
        />
      </section>

      {!hasAnyData ? (
        <EmptyState
          moodName="senang"
          moodColor="#FACC15"
          title="Jurnal Harianmu Masih Kosong"
          description="Yuk mulai tulis catatan suasana hati pertamamu hari ini dan dapatkan rekomendasi soundtrack lagu yang pas!"
          actionLabel="Tulis Jurnal Pertama"
          onAction={() => navigate('/journal/new')}
        />
      ) : (
        <>
          {/* Widget Soundtrack Mood Kamu */}
          <SoundtrackCard
            moodId={activeSoundtrackMoodId}
            moodName={activeSoundtrackMoodName}
            moodColor={activeSoundtrackMoodColor}
            title="Soundtrack Mood Kamu"
          />

          {/* 3 Entri Jurnal Terbaru */}
          <section aria-label="Entri Jurnal Terbaru" className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h2 className="text-lg font-extrabold text-ink">3 Catatan Jurnal Terbaru</h2>
                <p className="text-xs font-medium text-ink-soft">
                  Rekaman perjalanan suasana hati terakhirmu
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Link
                  to="/stats"
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-white border border-frost-border text-denim-dark hover:bg-frost text-xs font-extrabold transition-colors"
                >
                  <BarChart3 className="w-3.5 h-3.5" />
                  <span>Lihat Grafik Statistik</span>
                </Link>
                <Link
                  to="/journal"
                  className="inline-flex items-center gap-1 text-xs font-extrabold text-denim-dark hover:underline"
                >
                  <span>Lihat semua</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {recentEntries.map((entry) => (
                <EntryCard key={entry.id} entry={entry} compact />
              ))}
            </div>
          </section>
        </>
      )}
    </div>
  );
}
