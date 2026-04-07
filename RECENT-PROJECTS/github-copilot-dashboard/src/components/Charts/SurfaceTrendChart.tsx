import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import type { SurfaceUsagePoint } from '../../types/api';
import { format, parseISO } from 'date-fns';

const COLORS = {
    inline_completion: '#3b82f6',
    chat: '#7c3aed',
    pr_review: '#10b981',
    cli: '#f59e0b',
    other: '#6b7280',
};

const LABELS = {
    inline_completion: 'Inline',
    chat: 'Chat',
    pr_review: 'PR Review',
    cli: 'CLI',
    other: 'Other',
};

const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    return (
        <div className="glass glass-sm" style={{ padding: '12px 16px', minWidth: 160 }}>
            <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginBottom: 8 }}>
                {label ? format(parseISO(label), 'MMM d') : ''}
            </div>
            {payload.map((p: any) => (
                <div key={p.dataKey} style={{ display: 'flex', gap: 10, marginBottom: 4, alignItems: 'center' }}>
                    <span style={{ width: 8, height: 8, borderRadius: 2, background: p.fill, flexShrink: 0 }} />
                    <span style={{ color: 'var(--text-secondary)', fontSize: 12, flex: 1 }}>
                        {LABELS[p.dataKey as keyof typeof LABELS] ?? p.dataKey}
                    </span>
                    <span style={{ fontSize: 12, fontWeight: 700 }}>{p.value}</span>
                </div>
            ))}
        </div>
    );
};

interface SurfaceTrendChartProps {
    data: SurfaceUsagePoint[];
    loading?: boolean;
}

export function SurfaceTrendChart({ data, loading }: SurfaceTrendChartProps) {
    if (loading) {
        return (
            <div className="glass chart-wrap">
                <div className="skeleton" style={{ height: 14, width: 220, marginBottom: 16 }} />
                <div className="skeleton" style={{ height: 200 }} />
            </div>
        );
    }

    // Sample: every 3 days for clarity
    const displayData = data.filter((_, i) => i % 3 === 0).slice(-20);

    return (
        <div className="glass chart-wrap" style={{ padding: 20 }}>
            <div className="chart-title">Usage by Surface</div>
            <div className="chart-subtitle">Stacked daily usage across all Copilot surfaces</div>

            {/* Legend */}
            <div className="flex gap-8 mb-12" style={{ flexWrap: 'wrap' }}>
                {(Object.keys(COLORS) as (keyof typeof COLORS)[]).map((key) => (
                    <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--text-secondary)' }}>
                        <span style={{ width: 10, height: 10, borderRadius: 2, background: COLORS[key], display: 'inline-block' }} />
                        {LABELS[key]}
                    </div>
                ))}
            </div>

            <ResponsiveContainer width="100%" height={200}>
                <BarChart data={displayData} margin={{ top: 0, right: 0, left: -24, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
                    <XAxis
                        dataKey="date"
                        tickFormatter={(v) => format(parseISO(v), 'MMM d')}
                        tick={{ fill: 'var(--text-secondary)', fontSize: 10 }}
                        tickLine={false}
                        axisLine={false}
                        interval="preserveStartEnd"
                    />
                    <YAxis tick={{ fill: 'var(--text-secondary)', fontSize: 10 }} tickLine={false} axisLine={false} />
                    <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.04)' }} />
                    {(Object.keys(COLORS) as (keyof typeof COLORS)[]).map((key) => (
                        <Bar
                            key={key}
                            dataKey={key}
                            stackId="a"
                            fill={COLORS[key]}
                            radius={key === 'other' ? [3, 3, 0, 0] : [0, 0, 0, 0]}
                            animationDuration={700}
                        />
                    ))}
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}
