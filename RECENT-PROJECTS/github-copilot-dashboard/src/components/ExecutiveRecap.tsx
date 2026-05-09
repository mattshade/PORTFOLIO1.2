import type { DashboardData } from '../types/api';

export function ExecutiveRecap({ data, loading }: { data: DashboardData | null; loading: boolean }) {
    if (loading) {
        return (
            <div className="glass" style={{ padding: 24, marginBottom: 24 }}>
                <div className="skeleton" style={{ height: 24, width: 200, marginBottom: 12 }} />
                <div className="skeleton" style={{ height: 80 }} />
            </div>
        );
    }

    if (!data) return null;

    // Compile some quick insights
    const { seatActivity, usageSummary, editorUsage, languageUsage } = data;
    const assignedSeats = seatActivity.total_seats;
    const activeLast30d = usageSummary.active_users_by_period['30d'];
    const activeRate = assignedSeats > 0 ? Math.round((activeLast30d / assignedSeats) * 100) : 0;

    const topLang = languageUsage.data.length > 0 ? languageUsage.data[0] : null;

    const inactiveSeats = seatActivity.seats.filter(s => s.days_since_activity == null || s.days_since_activity > 30).length;

    return (
        <section className="section" style={{ marginBottom: 32 }}>
            <div className="glass" style={{ padding: '24px 32px', borderLeft: '4px solid var(--color-info)' }}>
                <ul style={{
                    listStyleType: 'none',
                    padding: 0,
                    margin: 0,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 12,
                    color: 'var(--text-secondary)'
                }}>
                    <li style={{ display: 'flex', gap: 12 }}>
                        <span style={{ color: 'var(--color-success)' }}>•</span>
                        <span>
                            <strong>Adoption is {activeRate >= 50 ? 'strong' : 'growing'}</strong>:
                            <strong style={{ color: 'var(--text-primary)' }}> {activeRate}%</strong> of assigned seats ({activeLast30d}/{assignedSeats}) were active in the last 30 days.
                        </span>
                    </li>
                    <li style={{ display: 'flex', gap: 12 }}>
                        <span style={{ color: 'var(--color-warning)' }}>•</span>
                        <span>
                            <strong>Seat Optimization</strong>:
                            <strong style={{ color: 'var(--text-primary)' }}> {inactiveSeats} seats</strong> are currently at risk (inactive for 30+ days or never activated) and could potentially be re-allocated.
                        </span>
                    </li>
                    {topLang && (
                        <li style={{ display: 'flex', gap: 12 }}>
                            <span style={{ color: 'var(--color-info)' }}>•</span>
                            <span>
                                <strong>Top Language</strong>: Copilot is providing the most value to <strong style={{ color: 'var(--text-primary)' }}>{topLang.language}</strong> developers, boasting a
                                <strong style={{ color: 'var(--text-primary)' }}> {Math.round(topLang.acceptance_rate * 100)}%</strong> acceptance rate on suggestions.
                            </span>
                        </li>
                    )}
                </ul>
            </div>
        </section>
    );
}
