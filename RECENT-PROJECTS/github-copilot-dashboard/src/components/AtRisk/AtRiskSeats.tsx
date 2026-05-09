
import type { DashboardData } from '../../types/api';
import { fmtDays } from '../../utils/metrics';

const SURFACE_COLOR: Record<string, string> = {
    chat: '#7c3aed',
    pr_review: '#10b981',
    inline: '#3b82f6',
    cli: '#f59e0b',
    unknown: '#6b7280',
};

interface AtRiskSeatsProps {
    data: DashboardData;
    onSelectUser?: (login: string) => void;
    loading?: boolean;
}

export function AtRiskSeats({ data, onSelectUser, loading }: AtRiskSeatsProps) {
    if (loading) {
        return (
            <div className="glass" style={{ padding: 20 }}>
                {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="skeleton" style={{ height: 48, marginBottom: 8 }} />
                ))}
            </div>
        );
    }

    const atRisk = data.seatActivity.seats
        .filter((s) => s.days_since_activity !== undefined && s.days_since_activity > 30)
        .sort((a, b) => (b.days_since_activity ?? 0) - (a.days_since_activity ?? 0))
        .slice(0, 10);

    const neverActive = data.seatActivity.seats.filter((s) => !s.last_activity_at);

    return (
        <div className="glass" style={{ padding: 20 }}>
            <div className="flex justify-between items-center mb-12">
                <div>
                    <div className="chart-title">⚠️ At-Risk Seats</div>
                    <div className="chart-subtitle">Inactive for 30+ days — {atRisk.length + neverActive.length} seats</div>
                </div>
                <div className="badge badge-red">{atRisk.length + neverActive.length} at risk</div>
            </div>

            {neverActive.length > 0 && (
                <div style={{
                    padding: '10px 14px', borderRadius: 'var(--radius-sm)',
                    background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)',
                    marginBottom: 12, fontSize: 12, color: '#fca5a5',
                    display: 'flex', alignItems: 'center', gap: 8,
                }}>
                    <span>⚡</span>
                    <span>{neverActive.length} seats assigned but never used</span>
                </div>
            )}

            <div>
                {atRisk.map((seat) => {
                    const surface = seat.last_activity_surface ?? 'unknown';
                    const color = SURFACE_COLOR[surface] ?? '#6b7280';
                    const initials = seat.login.slice(0, 2).toUpperCase();

                    return (
                        <div
                            key={seat.login}
                            className="risk-row"
                            onClick={() => onSelectUser?.(seat.login)}
                            role="button"
                            tabIndex={0}
                            aria-label={`View ${seat.login} details`}
                            onKeyDown={(e) => e.key === 'Enter' && onSelectUser?.(seat.login)}
                        >
                            <div className="risk-avatar" style={{ background: `linear-gradient(135deg, ${color}, ${color}88)` }}>
                                {initials}
                            </div>
                            <div style={{ flex: 1 }}>
                                <div style={{ fontWeight: 600, fontSize: 13 }}>{seat.login}</div>
                                <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>
                                    {seat.team ?? 'No team'} · Last: {seat.last_activity_surface ?? 'unknown'}
                                </div>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <div style={{ fontSize: 13, fontWeight: 700, color: '#f87171' }}>
                                    {fmtDays(seat.days_since_activity)}
                                </div>
                                <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>
                                    {seat.last_activity_editor ?? 'No editor'}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {atRisk.length === 0 && (
                <div style={{
                    textAlign: 'center', padding: '32px 0',
                    color: 'var(--text-secondary)', fontSize: 13,
                }}>
                    🎉 All active users have recent activity!
                </div>
            )}
        </div>
    );
}
