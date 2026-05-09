import { useEffect, useState } from 'react';
import './index.css';
import { useDashboardStore } from './store/dashboard';
import { Header } from './components/Header/Header';
import { KPIRow } from './components/KPICard/KPIRow';
import { AdoptionTrendChart } from './components/Charts/AdoptionTrendChart';
import { SurfaceTrendChart } from './components/Charts/SurfaceTrendChart';
import { EditorSplit } from './components/Charts/EditorSplit';
import { SurfacesFocus } from './components/Surfaces/SurfacesFocus';
import { EngagementRetention } from './components/Engagement/EngagementRetention';
import { AtRiskSeats } from './components/AtRisk/AtRiskSeats';
import { UsersTable } from './components/UsersTable/UsersTable';
import { UserDrawer } from './components/UsersTable/UserDrawer';
import { VersionsQuality } from './components/Versions/VersionsQuality';
import { LanguageBreakdown } from './components/Language/LanguageBreakdown';
import { ToastProvider } from './components/Toast';
import { ExecutiveRecap } from './components/ExecutiveRecap';

function AppBackground() {
  return (
    <div className="app-bg" aria-hidden="true">
      <div className="blob blob-1" />
      <div className="blob blob-2" />
      <div className="blob blob-3" />
    </div>
  );
}

function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      minHeight: '60vh', gap: 16, textAlign: 'center', padding: 40,
    }}>
      <div style={{ fontSize: 48 }}>⚠️</div>
      <div style={{ fontSize: 18, fontWeight: 700 }}>Failed to load data</div>
      <div style={{ color: 'var(--text-secondary)', maxWidth: 400 }}>{message}</div>
      <button className="btn btn-primary" onClick={onRetry}>Retry</button>
    </div>
  );
}

export default function App() {
  const { data, loadingState, error, darkMode, fetchData, selectedUser, setSelectedUser } = useDashboardStore();

  useEffect(() => {
    fetchData();
  }, []);

  // Apply dark/light class to document root
  useEffect(() => {
    document.documentElement.className = darkMode ? '' : 'light-mode';
  }, [darkMode]);

  const loading = loadingState === 'loading';
  const hasError = loadingState === 'error';

  return (
    <div className="app-shell">
      <AppBackground />
      <Header />

      <main className="main-content" id="main-content">
        {hasError ? (
          <ErrorState message={error ?? 'Unknown error'} onRetry={fetchData} />
        ) : (
          <>
            {/* ── A: KPI Row ── */}
            <KPIRow />

            {/* ── Executive Recap ── */}
            <ExecutiveRecap data={data} loading={loading} />

            {/* ── B: Adoption Hero ── */}
            <section className="section" aria-labelledby="adoption-section">
              <h2 className="section-title" id="adoption-section">Adoption Story</h2>
              <div className="grid-hero">
                <AdoptionTrendChart
                  data={data?.usageTrends.data ?? []}
                  loading={loading}
                />
                <EditorSplit
                  data={data?.editorUsage ?? { data: [], trend: [] }}
                  loading={loading}
                />
              </div>
              <div style={{ marginTop: 12 }}>
                <SurfaceTrendChart
                  data={data?.surfaceUsage.data ?? []}
                  loading={loading}
                />
              </div>
            </section>

            {/* ── C: Surfaces Focus ── */}
            <section className="section" aria-labelledby="surfaces-section">
              <h2 className="section-title" id="surfaces-section">Copilot Surfaces</h2>
              {data ? (
                <SurfacesFocus data={data} loading={loading} />
              ) : (
                <div className="glass" style={{ padding: 20, minHeight: 200 }}>
                  <div className="skeleton" style={{ height: 200 }} />
                </div>
              )}
            </section>

            {/* ── D: Engagement + At-Risk ── */}
            <section className="section" aria-labelledby="engagement-section">
              <h2 className="section-title" id="engagement-section">Engagement & Retention</h2>
              <div className="grid-2">
                {data ? (
                  <EngagementRetention data={data} loading={loading} />
                ) : (
                  <div className="glass skeleton" style={{ minHeight: 300 }} />
                )}
                {data ? (
                  <AtRiskSeats
                    data={data}
                    onSelectUser={(login) => setSelectedUser(login)}
                    loading={loading}
                  />
                ) : (
                  <div className="glass skeleton" style={{ minHeight: 300 }} />
                )}
              </div>
            </section>

            {/* ── E: Users Table ── */}
            <section className="section" aria-labelledby="users-section">
              <h2 className="section-title" id="users-section">Users</h2>
              <UsersTable
                seats={data?.seatActivity.seats ?? []}
                onSelectUser={(login) => setSelectedUser(login)}
                loading={loading}
              />
            </section>

            {/* ── F: Versions + Languages ── */}
            <section className="section" aria-labelledby="versions-section">
              <h2 className="section-title" id="versions-section">Quality Signals</h2>
              <div className="grid-2">
                {data ? (
                  <VersionsQuality data={data} loading={loading} />
                ) : (
                  <div className="glass skeleton" style={{ minHeight: 220 }} />
                )}
                {data ? (
                  <LanguageBreakdown data={data} loading={loading} />
                ) : (
                  <div className="glass skeleton" style={{ minHeight: 220 }} />
                )}
              </div>
            </section>
          </>
        )}
      </main>

      {/* User drawer */}
      {selectedUser && data && (
        <UserDrawer
          login={selectedUser}
          data={data}
          onClose={() => setSelectedUser(null)}
        />
      )}

      <ToastProvider />
    </div>
  );
}
