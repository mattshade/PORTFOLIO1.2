
import type { DashboardData } from '../../types/api';

interface LanguageBreakdownProps {
    data: DashboardData;
    loading?: boolean;
}

const LANG_COLORS = [
    '#7c3aed', '#3b82f6', '#06b6d4', '#10b981',
    '#f59e0b', '#ef4444', '#ec4899', '#8b5cf6', '#14b8a6',
];

export function LanguageBreakdown({ data, loading }: LanguageBreakdownProps) {
    if (loading) {
        return (
            <div className="glass" style={{ padding: 20 }}>
                {[1, 2, 3].map((i) => <div key={i} className="skeleton" style={{ height: 40, marginBottom: 8 }} />)}
            </div>
        );
    }

    const langs = data.languageUsage.data;
    const maxCompletions = Math.max(...langs.map((l) => l.completions));

    return (
        <div className="glass" style={{ padding: 20 }}>
            <div className="chart-title" style={{ marginBottom: 4 }}>🧑‍💻 Top Languages</div>
            <div className="chart-subtitle" style={{ marginBottom: 16 }}>Completions & acceptance rate by language</div>

            {langs.map((lang, i) => {
                const color = LANG_COLORS[i % LANG_COLORS.length];
                const pct = maxCompletions > 0 ? (lang.completions / maxCompletions * 100) : 0;
                return (
                    <div key={lang.language} style={{ marginBottom: 12 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, alignItems: 'baseline' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <span style={{ width: 8, height: 8, background: color, borderRadius: 2, display: 'inline-block' }} />
                                <span style={{ fontSize: 13, fontWeight: 500 }}>{lang.language}</span>
                                <span className="badge badge-gray" style={{ fontSize: 10 }}>{lang.active_users}u</span>
                            </div>
                            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                                <span style={{ fontSize: 12, color: '#10b981', fontWeight: 600 }}>
                                    {(lang.acceptance_rate * 100).toFixed(0)}% acc
                                </span>
                                <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                                    {lang.completions >= 1000 ? `${(lang.completions / 1000).toFixed(0)}K` : lang.completions}
                                </span>
                            </div>
                        </div>
                        <div className="progress-bar">
                            <div className="progress-fill" style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${color}, ${color}88)` }} />
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
