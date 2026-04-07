import type { Delta } from '../../utils/metrics';

interface KPICardProps {
    id: string;
    label: string;
    value: string | number;
    subtitle?: string;
    delta?: Delta;
    deltaLabel?: string;
    accentColor?: string;  // explicit chart color for the value
    loading?: boolean;
}

export function KPICard({ id, label, value, subtitle, delta, deltaLabel, accentColor, loading }: KPICardProps) {
    if (loading) {
        return (
            <div className="glass kpi-card" id={id}>
                <div className="skeleton" style={{ height: 11, width: '55%', marginBottom: 12 }} />
                <div className="skeleton" style={{ height: 34, width: '75%', marginBottom: 8 }} />
                <div className="skeleton" style={{ height: 18, width: '38%' }} />
            </div>
        );
    }

    const deltaDir = delta?.direction ?? 'flat';

    return (
        <div className="glass kpi-card glass-hover" id={id} role="article" aria-label={`${label}: ${value}`}>
            <div className="kpi-label">{label}</div>
            <div
                className="kpi-value"
                style={accentColor ? { color: accentColor } : undefined}
            >
                {value}
            </div>
            <div className="flex gap-8 items-center">
                {subtitle && <span className="text-sm text-secondary">{subtitle}</span>}
                {delta && (
                    <span
                        className={`kpi-delta ${deltaDir}`}
                        aria-label={`${deltaDir === 'up' ? 'increased' : deltaDir === 'down' ? 'decreased' : 'unchanged'} ${delta.pct.toFixed(1)} percent`}
                    >
                        {deltaDir === 'up' ? '↑' : deltaDir === 'down' ? '↓' : '—'}
                        {delta.pct.toFixed(1)}%
                        {deltaLabel && <span style={{ fontWeight: 400, opacity: 0.65 }}> {deltaLabel}</span>}
                    </span>
                )}
            </div>
        </div>
    );
}
