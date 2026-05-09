import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import type { EditorUsageResponse } from '../../types/api';

const COLORS = ['#818cf8', '#60a5fa', '#34d399', '#fbbf24', '#f87171', '#06b6d4'];

const CustomTooltip = ({ active, payload }: any) => {
    if (!active || !payload?.length) return null;
    const d = payload[0];
    return (
        <div className="glass glass-sm" style={{ padding: '10px 14px' }}>
            <div style={{ fontWeight: 700, fontSize: 13 }}>{d.name}</div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{d.value}% of active users</div>
        </div>
    );
};

interface EditorSplitProps {
    data: EditorUsageResponse;
    loading?: boolean;
}

export function EditorSplit({ data, loading }: EditorSplitProps) {
    if (loading) {
        return (
            <div className="glass chart-wrap" style={{ minHeight: 280 }}>
                <div className="skeleton" style={{ height: 14, width: 180, marginBottom: 16 }} />
                <div className="skeleton" style={{ height: 200, borderRadius: '50%', width: 200, margin: '0 auto' }} />
            </div>
        );
    }

    // Re-derive percentages from active_users to avoid NaN when completions are 0
    const totalUsers = data.data.reduce((s, d) => s + (d.active_users || 0), 0) || 1;
    const enriched = data.data.map((d) => ({
        ...d,
        pct: Math.round((d.active_users / totalUsers) * 1000) / 10,
    }));

    const pieData = enriched.map((d) => ({
        name: d.editor,
        value: d.pct,
        users: d.active_users,
    }));

    const topEditor = enriched[0];

    return (
        <div className="glass chart-wrap" style={{ padding: 20 }}>
            <div className="chart-title">Where Copilot Lives</div>
            <div className="chart-subtitle">Active users by editor / IDE</div>

            <div style={{ position: 'relative' }}>
                <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                        <Pie
                            data={pieData}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={90}
                            paddingAngle={3}
                            dataKey="value"
                            animationBegin={0}
                            animationDuration={800}
                        >
                            {pieData.map((_, i) => (
                                <Cell key={i} fill={COLORS[i % COLORS.length]} stroke="none" />
                            ))}
                        </Pie>
                        <Tooltip content={<CustomTooltip />} />
                    </PieChart>
                </ResponsiveContainer>
                {/* Center label */}
                <div style={{
                    position: 'absolute', top: '50%', left: '50%',
                    transform: 'translate(-50%, -50%)',
                    textAlign: 'center', pointerEvents: 'none',
                }}>
                    <div style={{ fontSize: 22, fontWeight: 800 }}>{(topEditor?.pct ?? 0).toFixed(0)}%</div>
                    <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{topEditor?.editor}</div>
                </div>
            </div>

            {/* Share bars */}
            <div>
                {enriched.map((d, i) => (
                    <div key={d.editor} className="editor-row">
                        <div className="editor-name" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <span style={{ width: 10, height: 10, borderRadius: 2, background: COLORS[i % COLORS.length], display: 'inline-block', flexShrink: 0 }} />
                            <span style={{ fontSize: 13 }}>{d.editor}</span>
                        </div>
                        <div className="editor-bar-wrap">
                            <div className="progress-bar">
                                <div
                                    className="progress-fill"
                                    style={{ width: `${d.pct}%`, background: COLORS[i % COLORS.length] }}
                                />
                            </div>
                        </div>
                        <div className="editor-pct">{d.pct.toFixed(1)}%</div>
                        <div style={{ fontSize: 12, color: 'var(--text-secondary)', width: 40, textAlign: 'right' }}>
                            {d.active_users}u
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
