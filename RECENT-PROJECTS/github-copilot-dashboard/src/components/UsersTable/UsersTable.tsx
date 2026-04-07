import { useState, useMemo } from 'react';
import type { CopilotSeat, ActivityBucket } from '../../types/api';
import { fmtDays } from '../../utils/metrics';
import { useDashboardStore } from '../../store/dashboard';

const SURFACE_COLOR: Record<string, string> = {
    chat: '#60a5fa', pr_review: '#34d399',
    inline: '#818cf8', cli: '#fbbf24', unknown: '#6b7280',
};
const BUCKET_COLOR: Record<string, string> = {
    '<1d': '#34d399', '1-7d': '#60a5fa', '8-30d': '#fbbf24', '31-90d': '#f87171', 'inactive': '#6b7280',
};

type SortKey = 'login' | 'last_activity_at' | 'days_since_activity' | 'bucket' | 'last_activity_surface' | 'last_activity_editor' | 'team';

interface UsersTableProps {
    seats: CopilotSeat[];
    onSelectUser: (login: string) => void;
    loading?: boolean;
}

export function UsersTable({ seats, onSelectUser, loading }: UsersTableProps) {
    const { search, bucketFilter, surfaceFilter, editorFilter, setBucketFilter, setSurfaceFilter, setEditorFilter } = useDashboardStore();
    const [sortKey, setSortKey] = useState<SortKey>('days_since_activity');
    const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
    const [page, setPage] = useState(0);
    const PAGE_SIZE = 15;

    const handleSort = (key: SortKey) => {
        if (sortKey === key) setSortDir((d) => d === 'asc' ? 'desc' : 'asc');
        else { setSortKey(key); setSortDir('asc'); }
        setPage(0);
    };

    const filtered = useMemo(() => {
        return seats
            .filter((s) => {
                if (search) {
                    const q = search.toLowerCase();
                    const match =
                        s.login.toLowerCase().includes(q) ||
                        (s.name && s.name.toLowerCase().includes(q)) ||
                        (s.email && s.email.toLowerCase().includes(q));
                    if (!match) return false;
                }
                if (bucketFilter && s.bucket !== bucketFilter) return false;
                if (surfaceFilter && s.last_activity_surface !== surfaceFilter) return false;
                if (editorFilter && s.last_activity_editor !== editorFilter) return false;
                return true;
            })
            .sort((a, b) => {
                const aVal = a[sortKey as keyof CopilotSeat] as any;
                const bVal = b[sortKey as keyof CopilotSeat] as any;
                if (aVal == null && bVal == null) return 0;
                if (aVal == null) return 1;
                if (bVal == null) return -1;
                const cmp = aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
                return sortDir === 'asc' ? cmp : -cmp;
            });
    }, [seats, search, bucketFilter, surfaceFilter, editorFilter, sortKey, sortDir]);

    const paged = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);
    const totalPages = Math.ceil(filtered.length / PAGE_SIZE);

    const SortIcon = ({ k }: { k: SortKey }) =>
        sortKey === k ? <span>{sortDir === 'asc' ? ' ↑' : ' ↓'}</span> : <span style={{ opacity: 0.3 }}> ↕</span>;

    if (loading) {
        return (
            <div className="glass" style={{ padding: 20 }}>
                {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="skeleton" style={{ height: 44, marginBottom: 8 }} />
                ))}
            </div>
        );
    }

    const BUCKETS: ActivityBucket[] = ['<1d', '1-7d', '8-30d', '31-90d', 'inactive'];
    const SURFACES = ['chat', 'pr_review', 'inline', 'cli', 'unknown'];
    const EDITORS = ['vscode', 'jetbrains', 'neovim', 'vscode-insiders', 'vim'];

    return (
        <div className="glass" style={{ padding: 20 }}>
            <div className="flex justify-between items-center mb-12" style={{ flexWrap: 'wrap', gap: 10 }}>
                <div>
                    <div className="chart-title">👥 Users Table</div>
                    <div className="chart-subtitle">{filtered.length} / {seats.length} seats — click row for details</div>
                </div>
                {/* Filters */}
                <div className="flex gap-8" style={{ flexWrap: 'wrap' }}>
                    <div className="select-wrap">
                        <select
                            className="select"
                            value={bucketFilter ?? ''}
                            onChange={(e) => setBucketFilter((e.target.value as ActivityBucket) || undefined)}
                            aria-label="Filter by activity bucket"
                        >
                            <option value="">All buckets</option>
                            {BUCKETS.map((b) => <option key={b} value={b}>{b}</option>)}
                        </select>
                    </div>
                    <div className="select-wrap">
                        <select
                            className="select"
                            value={surfaceFilter ?? ''}
                            onChange={(e) => setSurfaceFilter(e.target.value || undefined)}
                            aria-label="Filter by surface"
                        >
                            <option value="">All surfaces</option>
                            {SURFACES.map((s) => <option key={s} value={s}>{s}</option>)}
                        </select>
                    </div>
                    <div className="select-wrap">
                        <select
                            className="select"
                            value={editorFilter ?? ''}
                            onChange={(e) => setEditorFilter(e.target.value || undefined)}
                            aria-label="Filter by editor"
                        >
                            <option value="">All editors</option>
                            {EDITORS.map((e) => <option key={e} value={e}>{e}</option>)}
                        </select>
                    </div>
                    {(bucketFilter || surfaceFilter || editorFilter) && (
                        <button className="btn btn-sm" onClick={() => { setBucketFilter(undefined); setSurfaceFilter(undefined); setEditorFilter(undefined); }}>
                            Clear filters
                        </button>
                    )}
                </div>
            </div>

            <div className="table-wrap">
                <table>
                    <thead>
                        <tr>
                            <th onClick={() => handleSort('login')} scope="col">User <SortIcon k="login" /></th>
                            <th onClick={() => handleSort('team')} scope="col">Team <SortIcon k="team" /></th>
                            <th onClick={() => handleSort('last_activity_at')} scope="col">Last Activity <SortIcon k="last_activity_at" /></th>
                            <th onClick={() => handleSort('days_since_activity')} scope="col">Days Since <SortIcon k="days_since_activity" /></th>
                            <th onClick={() => handleSort('bucket')} scope="col">Bucket <SortIcon k="bucket" /></th>
                            <th onClick={() => handleSort('last_activity_surface')} scope="col">Surface <SortIcon k="last_activity_surface" /></th>
                            <th onClick={() => handleSort('last_activity_editor')} scope="col">Editor <SortIcon k="last_activity_editor" /></th>
                        </tr>
                    </thead>
                    <tbody>
                        {paged.map((seat) => {
                            const bucketColor = BUCKET_COLOR[seat.bucket ?? 'inactive'];
                            const surfaceColor = SURFACE_COLOR[seat.last_activity_surface ?? 'unknown'];
                            const initials = seat.login.slice(0, 2).toUpperCase();

                            return (
                                <tr
                                    key={seat.login}
                                    onClick={() => onSelectUser(seat.login)}
                                    tabIndex={0}
                                    onKeyDown={(e) => e.key === 'Enter' && onSelectUser(seat.login)}
                                    aria-label={`View details for ${seat.login}`}
                                >
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                            {seat.avatar_url ? (
                                                <img src={seat.avatar_url} alt="" style={{ width: 32, height: 32, borderRadius: '50%', objectFit: 'cover', border: '1px solid rgba(255,255,255,0.08)' }} />
                                            ) : (
                                                <div style={{
                                                    width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
                                                    background: 'rgba(255,255,255,0.06)',
                                                    border: '1px solid rgba(255,255,255,0.08)',
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                    fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)',
                                                }}>
                                                    {initials}
                                                </div>
                                            )}
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                                <span style={{ fontWeight: 600, fontSize: 13 }}>{seat.name || seat.login}</span>
                                                <span style={{ fontSize: 11, color: 'var(--text-secondary)' }}>
                                                    @{seat.login} {seat.email ? `• ${seat.email}` : ''}
                                                </span>
                                            </div>
                                        </div>
                                    </td>
                                    <td><span style={{ color: 'var(--text-secondary)' }}>{seat.team ?? '—'}</span></td>
                                    <td style={{ fontFamily: 'var(--font-mono)', fontSize: 12 }}>
                                        {seat.last_activity_at ?? <span style={{ color: 'var(--text-tertiary)' }}>Never</span>}
                                    </td>
                                    <td>
                                        <span style={{ color: bucketColor, fontWeight: 600 }}>
                                            {fmtDays(seat.days_since_activity)}
                                        </span>
                                    </td>
                                    <td>
                                        <span className="badge" style={{
                                            background: `${bucketColor}20`,
                                            color: bucketColor,
                                        }}>
                                            {seat.bucket ?? 'inactive'}
                                        </span>
                                    </td>
                                    <td>
                                        {seat.last_activity_surface ? (
                                            <span className="badge" style={{
                                                background: `${surfaceColor}20`,
                                                color: surfaceColor,
                                            }}>
                                                {seat.last_activity_surface}
                                            </span>
                                        ) : <span style={{ color: 'var(--text-tertiary)' }}>—</span>}
                                    </td>
                                    <td>
                                        <span style={{ fontSize: 12, fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)' }}>
                                            {seat.last_activity_editor ?? '—'}
                                        </span>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex justify-between items-center" style={{ marginTop: 16, paddingTop: 12, borderTop: '1px solid var(--glass-border)' }}>
                    <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                        Showing {page * PAGE_SIZE + 1}–{Math.min((page + 1) * PAGE_SIZE, filtered.length)} of {filtered.length}
                    </span>
                    <div className="flex gap-8">
                        <button className="btn btn-sm" disabled={page === 0} onClick={() => setPage(p => p - 1)}>← Prev</button>
                        {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => (
                            <button
                                key={i}
                                className={`btn btn-sm ${page === i ? 'btn-primary' : ''}`}
                                onClick={() => setPage(i)}
                                aria-current={page === i ? 'page' : undefined}
                            >{i + 1}</button>
                        ))}
                        <button className="btn btn-sm" disabled={page === totalPages - 1} onClick={() => setPage(p => p + 1)}>Next →</button>
                    </div>
                </div>
            )}
        </div>
    );
}
