
import type { DashboardData } from '../../types/api';
import { bucketCounts, medianDaysSinca, fmtDays } from '../../utils/metrics';

const BUCKETS = [
    { key: '<1d' as const, label: 'Active today', color: '#10b981' },
    { key: '1-7d' as const, label: '1–7 days ago', color: '#3b82f6' },
    { key: '8-30d' as const, label: '8–30 days ago', color: '#f59e0b' },
    { key: '31-90d' as const, label: '31–90 days ago', color: '#ef4444' },
    { key: 'inactive' as const, label: 'No activity (90d+)', color: '#6b7280' },
];

interface EngagementRetentionProps {
    data: DashboardData;
    loading?: boolean;
}

export function EngagementRetention({ data, loading }: EngagementRetentionProps) {
    const seats = data.seatActivity.seats;
    const counts = bucketCounts(seats);
    const total = seats.length;
    const medianDays = medianDaysSinca(seats);

    // Cohort: "first seen" vs "re-active after 7/30d"
    const active30d = data.usageSummary.active_users_by_period['30d'];
    const active7d = data.usageSummary.active_users_by_period['7d'];
    const activateRate = total > 0 ? (active30d / total * 100) : 0;
    const retentionRate = active30d > 0 ? (active7d / active30d * 100) : 0;

    if (loading) {
        return (
            <div className="glass chart-wrap" style={{ padding: 20, minHeight: 280 }}>
                {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="skeleton" style={{ height: 36, marginBottom: 10 }} />
                ))}
            </div>
        );
    }

    return (
        <div className="glass" style={{ padding: 20 }}>
            <div className="chart-title">Engagement & Retention</div>
            <div className="chart-subtitle">Activity distribution across all assigned seats</div>

            {/* Metric pills */}
            <div className="flex gap-8 mb-12" style={{ flexWrap: 'wrap' }}>
                <div className="glass glass-sm" style={{ padding: '8px 14px', borderRadius: 'var(--radius-md)' }}>
                    <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>Activation Rate</div>
                    <div style={{ fontSize: 20, fontWeight: 800, color: '#10b981' }}>{activateRate.toFixed(0)}%</div>
                </div>
                <div className="glass glass-sm" style={{ padding: '8px 14px', borderRadius: 'var(--radius-md)' }}>
                    <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>7d Retention</div>
                    <div style={{ fontSize: 20, fontWeight: 800, color: '#3b82f6' }}>{retentionRate.toFixed(0)}%</div>
                </div>
                <div className="glass glass-sm" style={{ padding: '8px 14px', borderRadius: 'var(--radius-md)' }}>
                    <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>Median Idle</div>
                    <div style={{ fontSize: 20, fontWeight: 800, color: '#f59e0b' }}>{fmtDays(medianDays)}</div>
                </div>
            </div>

            {/* Bucket viz */}
            {BUCKETS.map(({ key, label, color }) => {
                const count = counts[key];
                const pct = total > 0 ? (count / total * 100) : 0;
                return (
                    <div key={key} className="bucket-row">
                        <div className="bucket-dot" style={{ background: color }} />
                        <div className="bucket-label">{label}</div>
                        <div style={{ flex: 2 }}>
                            <div className="progress-bar">
                                <div
                                    className="progress-fill"
                                    style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${color}, ${color}88)` }}
                                />
                            </div>
                        </div>
                        <div className="bucket-count" style={{ color }}>{count}</div>
                        <div style={{ fontSize: 11, color: 'var(--text-tertiary)', width: 40, textAlign: 'right' }}>
                            {pct.toFixed(0)}%
                        </div>
                    </div>
                );
            })}

            {/* Cohort note */}
            <div style={{
                marginTop: 16,
                padding: '10px 14px',
                borderRadius: 'var(--radius-sm)',
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.06)',
                fontSize: 12,
                color: 'var(--text-secondary)',
                lineHeight: 1.6,
            }}>
                <strong style={{ color: 'var(--text-primary)' }}>Cohort estimate (inferred):</strong>{' '}
                {active30d} users active in the last 30d. Of those, {active7d} ({retentionRate.toFixed(0)}%) remained
                active in the last 7d — a proxy for short-term stickiness.
            </div>
        </div>
    );
}
