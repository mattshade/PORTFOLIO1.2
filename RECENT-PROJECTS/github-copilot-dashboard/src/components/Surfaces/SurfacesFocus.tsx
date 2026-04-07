import React, { useState } from 'react';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import type { DashboardData } from '../../types/api';
import { format, parseISO } from 'date-fns';

type SurfaceTab = 'chat' | 'pr_review' | 'inline' | 'cli';

const TABS: { key: SurfaceTab; label: string; emoji: string; color: string }[] = [
    { key: 'chat', label: 'Chat', emoji: '💬', color: '#7c3aed' },
    { key: 'pr_review', label: 'PR Review', emoji: '🔍', color: '#10b981' },
    { key: 'inline', label: 'Inline/Editor', emoji: '⚡', color: '#3b82f6' },
    { key: 'cli', label: 'CLI', emoji: '🖥️', color: '#f59e0b' },
];

function getDataKey(tab: SurfaceTab) {
    if (tab === 'chat') return 'chat';
    if (tab === 'pr_review') return 'pr_review';
    if (tab === 'inline') return 'inline_completion';
    return 'cli';
}

function getTotals(tab: SurfaceTab, data: DashboardData) {
    const totals = data.surfaceUsage.totals;
    if (tab === 'chat') return { total: data.chatUsage.totals.turns, users: data.chatUsage.totals.unique_users };
    if (tab === 'pr_review') return { total: data.prReviewUsage.totals.reviews_initiated, users: data.prReviewUsage.totals.unique_users };
    if (tab === 'inline') return { total: totals.inline_completion, users: data.usageSummary.total_active_users };
    return { total: totals.cli, users: Math.round(data.usageSummary.total_active_users * 0.3) };
}

const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    return (
        <div className="glass glass-sm" style={{ padding: '10px 14px', minWidth: 140 }}>
            <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginBottom: 6 }}>
                {label ? format(parseISO(label), 'MMM d') : ''}
            </div>
            {payload.map((p: any) => (
                <div key={p.dataKey} style={{ display: 'flex', justifyContent: 'space-between', gap: 12, fontSize: 13 }}>
                    <span style={{ color: p.stroke }}>{p.name}</span>
                    <span style={{ fontWeight: 700 }}>{p.value}</span>
                </div>
            ))}
        </div>
    );
};

// Detect largest WoW movers
function getWoWMovers(data: number[]) {
    const len = data.length;
    if (len < 14) return null;
    const thisWeek = data.slice(len - 7).reduce((a, b) => a + b, 0) / 7;
    const lastWeek = data.slice(len - 14, len - 7).reduce((a, b) => a + b, 0) / 7;
    const pct = lastWeek === 0 ? 0 : ((thisWeek - lastWeek) / lastWeek) * 100;
    return { current: thisWeek, prev: lastWeek, pct };
}

interface SurfacesFocusProps {
    data: DashboardData;
    loading?: boolean;
}

export function SurfacesFocus({ data, loading }: SurfacesFocusProps) {
    const [activeTab, setActiveTab] = useState<SurfaceTab>('chat');
    const tabInfo = TABS.find((t) => t.key === activeTab)!;
    const dataKey = getDataKey(activeTab);
    const totals = getTotals(activeTab, data);

    const surfaceData = data.surfaceUsage.data.slice(-30);
    const values = surfaceData.map((d) => Number((d as any)[dataKey] ?? 0));
    const mover = getWoWMovers(values);

    const total = data.surfaceUsage.totals.chat + data.surfaceUsage.totals.inline_completion +
        data.surfaceUsage.totals.pr_review + data.surfaceUsage.totals.cli + data.surfaceUsage.totals.other;
    const share = total > 0 ? (totals.total / total * 100) : 0;

    if (loading) {
        return (
            <div className="glass chart-wrap" style={{ minHeight: 360, padding: 20 }}>
                <div className="skeleton" style={{ height: 14, width: 200, marginBottom: 16 }} />
                <div className="skeleton" style={{ height: 40, marginBottom: 16 }} />
                <div className="skeleton" style={{ height: 240 }} />
            </div>
        );
    }

    return (
        <div className="glass" style={{ padding: 20 }}>
            <div className="chart-title" style={{ marginBottom: 16 }}>Copilot Surfaces Focus</div>

            {/* Tabs */}
            <div className="tab-bar">
                {TABS.map((t) => (
                    <button
                        key={t.key}
                        id={`tab-${t.key}`}
                        className={`tab ${activeTab === t.key ? 'active' : ''}`}
                        onClick={() => setActiveTab(t.key)}
                        aria-selected={activeTab === t.key}
                        role="tab"
                    >
                        {t.emoji} {t.label}
                    </button>
                ))}
            </div>

            {/* Summary row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 20 }}>
                <div className="glass glass-sm mover-card" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: 4 }}>
                    <div className="mover-label">Total Usage</div>
                    <div className="mover-value" style={{ color: tabInfo.color }}>
                        {totals.total >= 1000 ? `${(totals.total / 1000).toFixed(1)}K` : totals.total}
                    </div>
                </div>
                <div className="glass glass-sm mover-card" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: 4 }}>
                    <div className="mover-label">Unique Users</div>
                    <div className="mover-value" style={{ color: tabInfo.color }}>{totals.users}</div>
                </div>
                <div className="glass glass-sm mover-card" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: 4 }}>
                    <div className="mover-label">Share of Total</div>
                    <div className="mover-value" style={{ color: tabInfo.color }}>{share.toFixed(1)}%</div>
                    <div className="progress-bar" style={{ width: '100%', marginTop: 4 }}>
                        <div className="progress-fill" style={{ width: `${share}%`, background: tabInfo.color }} />
                    </div>
                </div>
            </div>

            {/* Trend chart */}
            <ResponsiveContainer width="100%" height={180}>
                <LineChart data={surfaceData} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
                    <defs>
                        <linearGradient id={`grad-surface-${activeTab}`} x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={tabInfo.color} stopOpacity={0.4} />
                            <stop offset="95%" stopColor={tabInfo.color} stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                    <XAxis
                        dataKey="date"
                        tickFormatter={(v) => format(parseISO(v), 'M/d')}
                        tick={{ fill: 'var(--text-secondary)', fontSize: 10 }}
                        tickLine={false} axisLine={false}
                        interval="preserveStartEnd"
                    />
                    <YAxis
                        tick={{ fill: 'var(--text-secondary)', fontSize: 10 }}
                        tickLine={false} axisLine={false}
                        tickFormatter={(v) => v >= 1000 ? `${(v / 1000).toFixed(0)}K` : v}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Line
                        type="monotone"
                        dataKey={dataKey}
                        name={tabInfo.label}
                        stroke={tabInfo.color}
                        strokeWidth={2.5}
                        dot={false}
                        activeDot={{ r: 5, fill: tabInfo.color, stroke: 'white', strokeWidth: 2 }}
                        animationDuration={600}
                    />
                </LineChart>
            </ResponsiveContainer>

            {/* WoW mover callout */}
            {mover && (
                <div className="mover-card mt-12">
                    <div>
                        <div className="mover-label">What changed this week?</div>
                        <div style={{ fontSize: 13, color: 'var(--text-primary)', marginTop: 2 }}>
                            {tabInfo.label} usage vs last week
                        </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                        <div
                            className="mover-delta"
                            style={{ color: mover.pct >= 0 ? 'var(--copilot-green)' : 'var(--copilot-red)' }}
                        >
                            {mover.pct >= 0 ? '↑' : '↓'} {Math.abs(mover.pct).toFixed(1)}% WoW
                        </div>
                        <div className="mover-label" style={{ marginTop: 2 }}>
                            {mover.current.toFixed(0)}/day vs {mover.prev.toFixed(0)}/day
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
