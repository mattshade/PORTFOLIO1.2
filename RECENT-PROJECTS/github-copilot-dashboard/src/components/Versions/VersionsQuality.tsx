
import type { DashboardData } from '../../types/api';

interface VersionsQualityProps {
    data: DashboardData;
    loading?: boolean;
}

const EDITOR_COLORS: Record<string, string> = {
    'VS Code': '#3b82f6',
    'JetBrains': '#f59e0b',
    'Unknown': '#6b7280',
};

export function VersionsQuality({ data, loading }: VersionsQualityProps) {
    if (loading) {
        return (
            <div className="glass" style={{ padding: 20 }}>
                {[1, 2, 3].map((i) => <div key={i} className="skeleton" style={{ height: 40, marginBottom: 8 }} />)}
            </div>
        );
    }

    const versions = data.versions.data;
    const unknownVersions = versions.filter((v) => v.version === 'unknown' || v.editor === 'Unknown');
    const unknownUsers = unknownVersions.reduce((s, v) => s + v.active_users, 0);

    const groupedByEditor = versions.reduce<Record<string, typeof versions>>((acc, v) => {
        const ed = v.editor;
        if (!acc[ed]) acc[ed] = [];
        acc[ed].push(v);
        return acc;
    }, {});

    return (
        <div className="glass" style={{ padding: 20 }}>
            <div className="chart-title" style={{ marginBottom: 4 }}>📦 Versions & Quality Signals</div>
            <div className="chart-subtitle" style={{ marginBottom: 16 }}>Copilot extension versions in use</div>

            {/* Data hygiene warning */}
            {unknownUsers > 0 && (
                <div style={{
                    padding: '10px 14px', borderRadius: 'var(--radius-sm)',
                    background: 'rgba(245,158,11,0.10)', border: '1px solid rgba(245,158,11,0.25)',
                    marginBottom: 16, display: 'flex', alignItems: 'center', gap: 10,
                    fontSize: 12, color: '#fbbf24',
                }}>
                    <span>⚠️</span>
                    <span>
                        <strong>{unknownUsers}</strong> users have unknown version/surface — check extension telemetry.
                    </span>
                </div>
            )}

            {Object.entries(groupedByEditor).map(([editor, versionList]) => {
                const color = EDITOR_COLORS[editor] ?? '#a78bfa';
                return (
                    <div key={editor} style={{ marginBottom: 16 }}>
                        <div style={{ fontSize: 12, fontWeight: 700, color, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                            <span style={{ width: 8, height: 8, borderRadius: 2, background: color, display: 'inline-block' }} />
                            {editor}
                        </div>
                        {versionList.map((v) => (
                            <div key={v.version} className="editor-row" style={{ paddingBottom: 6, marginBottom: 6 }}>
                                <div style={{ width: 100, fontSize: 12, fontFamily: 'var(--font-mono)', flexShrink: 0, color: v.version === 'unknown' ? '#9ca3af' : 'var(--text-primary)' }}>
                                    v{v.version}
                                </div>
                                <div className="editor-bar-wrap">
                                    <div className="progress-bar">
                                        <div className="progress-fill" style={{ width: `${v.percentage}%`, background: color }} />
                                    </div>
                                </div>
                                <div style={{ fontSize: 12, color: 'var(--text-secondary)', width: 40, textAlign: 'right' }}>{v.active_users}u</div>
                                <div style={{ fontSize: 12, fontWeight: 600, color, width: 44, textAlign: 'right' }}>{v.percentage.toFixed(0)}%</div>
                            </div>
                        ))}
                    </div>
                );
            })}
        </div>
    );
}
