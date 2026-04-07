import { useState } from 'react';
import type { DashboardData } from '../../types/api';
import { fmtDays } from '../../utils/metrics';

const SURFACE_EMOJI: Record<string, string> = {
    chat: '💬', pr_review: '🔍', inline: '⚡', cli: '🖥️', unknown: '❓',
};

interface UserDrawerProps {
    login: string;
    data: DashboardData;
    onClose: () => void;
}

export function UserDrawer({ login, data, onClose }: UserDrawerProps) {
    const seat = data.seatActivity.seats.find((s) => s.login === login);
    const [notes, setNotes] = useState(() => localStorage.getItem(`notes-${login}`) ?? '');

    if (!seat) return null;

    const surfaces = [
        { key: 'chat', label: 'Chat', active: seat.last_activity_surface === 'chat' },
        { key: 'pr_review', label: 'PR Review', active: seat.last_activity_surface === 'pr_review' },
        { key: 'inline', label: 'Inline', active: seat.last_activity_surface === 'inline' },
        { key: 'cli', label: 'CLI', active: seat.last_activity_surface === 'cli' },
    ];

    const saveNotes = () => {
        localStorage.setItem(`notes-${login}`, notes);
    };

    return (
        <>
            <div
                className="drawer-overlay"
                onClick={onClose}
                role="presentation"
                aria-hidden="true"
            />
            <aside className="drawer" role="dialog" aria-modal="true" aria-label={`Details for ${login}`}>
                {/* Header */}
                <div className="flex justify-between items-center" style={{ marginBottom: 24 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                        {seat.avatar_url ? (
                            <img
                                src={seat.avatar_url}
                                alt={login}
                                style={{ width: 48, height: 48, borderRadius: '50%', border: '1px solid var(--glass-border)' }}
                            />
                        ) : (
                            <div style={{
                                width: 48, height: 48, borderRadius: '50%',
                                background: 'rgba(255,255,255,0.10)',
                                border: '1px solid rgba(255,255,255,0.14)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontSize: 18, fontWeight: 800, color: 'var(--text-primary)',
                            }}>
                                {login.slice(0, 2).toUpperCase()}
                            </div>
                        )}
                        <div>
                            <div style={{ fontWeight: 700, fontSize: 16 }}>{seat.name ?? login}</div>
                            {seat.name && seat.name !== login && (
                                <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>@{login}</div>
                            )}
                            {seat.email ? (
                                <a
                                    href={`mailto:${seat.email}`}
                                    style={{ fontSize: 12, color: 'var(--color-info)', textDecoration: 'none' }}
                                >
                                    {seat.email}
                                </a>
                            ) : (
                                <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                                    {seat.team ?? 'No team'} · {seat.plan_type ?? 'N/A'}
                                </div>
                            )}
                        </div>
                    </div>
                    <button
                        className="btn btn-icon"
                        onClick={onClose}
                        aria-label="Close panel"
                        style={{ fontSize: 18 }}
                    >×</button>
                </div>

                {/* Status */}
                <div className="glass glass-sm" style={{ padding: 16, marginBottom: 16, borderRadius: 'var(--radius-md)' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                        <div>
                            <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginBottom: 2 }}>Last Activity</div>
                            <div style={{ fontWeight: 600, fontSize: 13 }}>{seat.last_activity_at ?? 'Never'}</div>
                        </div>
                        <div>
                            <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginBottom: 2 }}>Days Since</div>
                            <div style={{ fontWeight: 600, fontSize: 13, color: seat.days_since_activity && seat.days_since_activity > 30 ? '#f87171' : '#34d399' }}>
                                {fmtDays(seat.days_since_activity)}
                            </div>
                        </div>
                        <div>
                            <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginBottom: 2 }}>Editor</div>
                            <div style={{ fontWeight: 600, fontSize: 13, fontFamily: 'var(--font-mono)' }}>
                                {seat.last_activity_editor ?? '—'}
                            </div>
                        </div>
                        <div>
                            <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginBottom: 2 }}>Plan</div>
                            <div>
                                <span className={`badge ${seat.plan_type === 'enterprise' ? 'badge-purple' : 'badge-blue'}`}>
                                    {seat.plan_type ?? 'N/A'}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Surface breakdown */}
                <div style={{ marginBottom: 20 }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 }}>
                        Surface Activity
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
                        {surfaces.map(({ key, label, active }) => (
                            <div key={key} className="glass glass-sm" style={{
                                padding: '10px 14px', borderRadius: 'var(--radius-md)',
                                border: active ? '1px solid rgba(96,165,250,0.4)' : '1px solid var(--glass-border)',
                                opacity: active ? 1 : 0.5,
                            }}>
                                <div style={{ fontSize: 20, marginBottom: 4 }}>{SURFACE_EMOJI[key]}</div>
                                <div style={{ fontSize: 13, fontWeight: 600 }}>{label}</div>
                                {active && <div style={{ fontSize: 11, color: '#60a5fa', marginTop: 2 }}>Last used</div>}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Activity timeline (mock) */}
                <div style={{ marginBottom: 20 }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 }}>
                        Recent Activity Timeline
                    </div>
                    {seat.last_activity_at ? (
                        <div style={{ position: 'relative', paddingLeft: 20 }}>
                            {[
                                { label: 'Last active', date: seat.last_activity_at, surface: seat.last_activity_surface },
                                { label: 'Seat updated', date: seat.updated_at, surface: undefined },
                                { label: 'Seat created', date: seat.created_at, surface: undefined },
                            ].map((item, i) => (
                                <div key={i} style={{ display: 'flex', gap: 12, marginBottom: 12, position: 'relative' }}>
                                    {/* Timeline dot */}
                                    <div style={{
                                        width: 8, height: 8, borderRadius: '50%',
                                        background: i === 0 ? '#60a5fa' : 'var(--text-tertiary)',
                                        position: 'absolute', left: -20, top: 4,
                                    }} />
                                    {i < 2 && <div style={{
                                        position: 'absolute', left: -17, top: 12,
                                        width: 2, height: 'calc(100% + 4px)',
                                        background: 'var(--glass-border)',
                                    }} />}
                                    <div>
                                        <div style={{ fontSize: 12, fontWeight: 600 }}>{item.label}</div>
                                        <div style={{ fontSize: 11, color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>{item.date}</div>
                                        {item.surface && (
                                            <div style={{ fontSize: 11, color: '#60a5fa', marginTop: 2 }}>
                                                {SURFACE_EMOJI[item.surface]} {item.surface}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div style={{ fontSize: 13, color: 'var(--text-secondary)', padding: '12px 0' }}>
                            No activity recorded for this seat.
                        </div>
                    )}
                </div>

                {/* Notes */}
                <div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>
                        Notes (local)
                    </div>
                    <textarea
                        className="input"
                        style={{ width: '100%', minHeight: 80, resize: 'vertical', fontFamily: 'var(--font-sans)' }}
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        onBlur={saveNotes}
                        placeholder="Add a private note about this user…"
                        aria-label="User notes"
                    />
                    <button className="btn btn-sm btn-primary" style={{ marginTop: 8 }} onClick={saveNotes}>
                        Save Note
                    </button>
                </div>
            </aside>
        </>
    );
}
