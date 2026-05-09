import { KPICard } from '../KPICard/KPICard';
import { useDashboardStore } from '../../store/dashboard';
import { fmt, fmtPct, fmtDays, getWoWDelta, getMoMDelta, medianDaysSinca } from '../../utils/metrics';

// Gray-first palette for KPIs — subtle color only for status
const KPI_COLORS = {
    seats: 'var(--text-primary)',
    active: 'var(--color-info)',
    activation: 'var(--color-positive)',
    stickiness: 'var(--text-secondary)',
    idle: 'var(--color-warning)',
    completions: 'var(--text-primary)',
};

export function KPIRow() {
    const { data, loadingState } = useDashboardStore();
    const loading = loadingState === 'loading';

    if (!data && !loading) return null;

    const isLoading = loading || !data;
    const summary = data?.usageSummary;
    const seats = data?.seatActivity;
    const trends = data?.usageTrends;

    const totalSeats = seats?.total_seats ?? 0;
    const active30d = summary?.active_users_by_period['30d'] ?? 0;
    const active7d = summary?.active_users_by_period['7d'] ?? 0;
    const active1d = summary?.active_users_by_period['1d'] ?? 0;

    const activationRate = totalSeats > 0 ? (active30d / totalSeats * 100) : 0;
    const stickiness = active30d > 0 ? (active1d / active30d * 100) : 0;
    const medianDays = data ? medianDaysSinca(data.seatActivity.seats) : 0;

    const wowDelta = trends ? getWoWDelta(trends.data, 'active_users') : undefined;
    const momDelta = trends ? getMoMDelta(trends.data, 'active_users') : undefined;

    return (
        <div className="kpi-row">
            <KPICard
                id="kpi-assigned-seats"
                label="Assigned Seats"
                value={isLoading ? '—' : fmt(totalSeats)}
                subtitle="total licenses"
                loading={isLoading}
                accentColor={KPI_COLORS.seats}
            />
            <KPICard
                id="kpi-active-seats"
                label="Active Seats (30d)"
                value={isLoading ? '—' : fmt(active30d)}
                subtitle={isLoading ? '' : `${active7d} last 7d · ${active1d} today`}
                delta={wowDelta}
                deltaLabel="WoW"
                loading={isLoading}
                accentColor={KPI_COLORS.active}
            />
            <KPICard
                id="kpi-activation-rate"
                label="Activation Rate"
                value={isLoading ? '—' : fmtPct(activationRate)}
                subtitle="Active(30d) / Assigned"
                delta={momDelta}
                deltaLabel="MoM"
                loading={isLoading}
                accentColor={KPI_COLORS.activation}
            />
            <KPICard
                id="kpi-stickiness"
                label="Stickiness"
                value={isLoading ? '—' : fmtPct(stickiness)}
                subtitle="DAU / MAU"
                loading={isLoading}
                accentColor={KPI_COLORS.stickiness}
            />
            <KPICard
                id="kpi-median-idle"
                label="Median Idle Time"
                value={isLoading ? '—' : fmtDays(isFinite(medianDays) ? medianDays : undefined)}
                subtitle="across all seats"
                loading={isLoading}
                accentColor={KPI_COLORS.idle}
            />
            <KPICard
                id="kpi-completions"
                label="Total Completions"
                value={isLoading ? '—' : fmt(summary?.total_ide_completions_count ?? 0)}
                subtitle={isLoading ? '' : `${fmt(summary?.total_chat_turns ?? 0)} chat turns`}
                loading={isLoading}
                accentColor={KPI_COLORS.completions}
            />
        </div>
    );
}
