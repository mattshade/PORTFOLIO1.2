import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer, Legend
} from 'recharts';
import { useDashboardStore } from '../../store/dashboard';
import type { UsageTrendPoint } from '../../types/api';
import { format, parseISO } from 'date-fns';

const METRICS = [
    { key: 'active_users', label: 'Active Users', color: '#60a5fa' },
    { key: 'engaged_users', label: 'Engaged Users', color: '#9ca3af' },
    { key: 'completions', label: 'Completions', color: '#2dd4bf' },
] as const;

const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    return (
        <div className="glass glass-sm" style={{ padding: '12px 16px', minWidth: 160 }}>
            <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginBottom: 8 }}>
                {label ? format(parseISO(label), 'MMM d, yyyy') : ''}
            </div>
            {payload.map((p: any) => (
                <div key={p.name} style={{ display: 'flex', justifyContent: 'space-between', gap: 16, marginBottom: 4 }}>
                    <span style={{ color: p.color, fontSize: 13, fontWeight: 500 }}>{p.name}</span>
                    <span style={{ fontSize: 13, fontWeight: 700 }}>
                        {typeof p.value === 'number' && p.value > 1000
                            ? `${(p.value / 1000).toFixed(1)}K`
                            : p.value}
                    </span>
                </div>
            ))}
        </div>
    );
};

interface AdoptionTrendChartProps {
    data: UsageTrendPoint[];
    loading?: boolean;
}

export function AdoptionTrendChart({ data, loading }: AdoptionTrendChartProps) {
    const { trendMetric, setTrendMetric } = useDashboardStore();

    if (loading) {
        return (
            <div className="chart-wrap glass">
                <div className="skeleton" style={{ height: 14, width: 180, marginBottom: 16 }} />
                <div className="skeleton" style={{ height: 260 }} />
            </div>
        );
    }

    const displayData = data.slice(-30); // last 30 points

    return (
        <div className="glass chart-wrap" style={{ padding: 20 }}>
            <div className="flex justify-between items-center mb-12">
                <div>
                    <div className="chart-title">Copilot Adoption Over Time</div>
                    <div className="chart-subtitle">Active seat usage trend</div>
                </div>
                {/* Toggle pills */}
                <div className="flex gap-8">
                    {METRICS.map((m) => (
                        <button
                            key={m.key}
                            className={`pill ${trendMetric === m.key ? 'active' : ''}`}
                            style={{ fontSize: 12, padding: '4px 10px' }}
                            onClick={() => setTrendMetric(m.key)}
                            aria-pressed={trendMetric === m.key}
                        >
                            {m.label}
                        </button>
                    ))}
                </div>
            </div>

            <ResponsiveContainer width="100%" height={260}>
                <AreaChart data={displayData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                    <defs>
                        <linearGradient id="grad-blue" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#60a5fa" stopOpacity={0.35} />
                            <stop offset="95%" stopColor="#60a5fa" stopOpacity={0.0} />
                        </linearGradient>
                        <linearGradient id="grad-gray" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#9ca3af" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#9ca3af" stopOpacity={0.0} />
                        </linearGradient>
                        <linearGradient id="grad-teal" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#2dd4bf" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#2dd4bf" stopOpacity={0.0} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                    <XAxis
                        dataKey="date"
                        tickFormatter={(v) => format(parseISO(v), 'MMM d')}
                        tick={{ fill: 'var(--text-secondary)', fontSize: 11 }}
                        tickLine={false}
                        axisLine={false}
                        interval="preserveStartEnd"
                    />
                    <YAxis
                        tick={{ fill: 'var(--text-secondary)', fontSize: 11 }}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(v) => v >= 1000 ? `${(v / 1000).toFixed(0)}K` : v}
                    />
                    <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'rgba(255,255,255,0.1)', strokeWidth: 1 }} />
                    {trendMetric === 'active_users' && (
                        <Area
                            type="monotone"
                            dataKey="active_users"
                            name="Active Users"
                            stroke="#60a5fa"
                            strokeWidth={2}
                            fill="url(#grad-blue)"
                            dot={false}
                            activeDot={{ r: 4, fill: '#60a5fa', stroke: 'white', strokeWidth: 2 }}
                            animationDuration={800}
                            animationEasing="ease-out"
                        />
                    )}
                    {trendMetric === 'engaged_users' && (
                        <Area
                            type="monotone"
                            dataKey="engaged_users"
                            name="Engaged Users"
                            stroke="#9ca3af"
                            strokeWidth={2}
                            fill="url(#grad-gray)"
                            dot={false}
                            activeDot={{ r: 4, fill: '#9ca3af', stroke: 'white', strokeWidth: 2 }}
                            animationDuration={800}
                        />
                    )}
                    {trendMetric === 'completions' && (
                        <Area
                            type="monotone"
                            dataKey="completions"
                            name="Completions"
                            stroke="#2dd4bf"
                            strokeWidth={2}
                            fill="url(#grad-teal)"
                            dot={false}
                            activeDot={{ r: 4, fill: '#2dd4bf', stroke: 'white', strokeWidth: 2 }}
                            animationDuration={800}
                        />
                    )}
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
}
