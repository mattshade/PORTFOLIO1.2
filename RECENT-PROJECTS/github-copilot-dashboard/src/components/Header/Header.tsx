import { useState, useMemo } from 'react';
import { useDashboardStore } from '../../store/dashboard';
import type { DatePreset } from '../../store/dashboard';
import { seatsToCSV, downloadCSV } from '../../utils/metrics';

const DATE_PRESETS: { label: string; value: DatePreset }[] = [
    { label: '7d', value: '7d' },
    { label: '30d', value: '30d' },
    { label: '90d', value: '90d' },
];

const DEFAULT_ORG = import.meta.env.VITE_GITHUB_ORG || 'demo-org';
const MOCK_ORGS = [DEFAULT_ORG, 'team-alpha', 'team-beta', 'team-gamma', 'dev-team'].filter(
    (v, i, a) => a.indexOf(v) === i  // dedupe
);
const MOCK_TEAMS = ['All Teams', 'platform', 'frontend', 'backend', 'data', 'devops'];

export function Header() {
    const {
        org, teams, datePreset, search, darkMode, availableTeams,
        setOrg, setTeams, setDatePreset, setSearch, toggleDarkMode, data,
        setSelectedUser,
    } = useDashboardStore();

    // Use dynamically extracted teams from real GitHub API, fallback to mock teams
    const teamsList = availableTeams.length > 0 ? availableTeams : MOCK_TEAMS.filter(t => t !== 'All Teams');

    const [showTeams, setShowTeams] = useState(false);

    const [showCustom, setShowCustom] = useState(false);
    const [customSince, setCustomSince] = useState('');
    const [customUntil, setCustomUntil] = useState('');
    const [showSuggestions, setShowSuggestions] = useState(false);

    const searchSuggestions = useMemo(() => {
        if (!search.trim() || !data) return [];
        const q = search.trim().toLowerCase();
        return data.seatActivity.seats.filter(s =>
            s.login.toLowerCase().includes(q) ||
            (s.name && s.name.toLowerCase().includes(q)) ||
            (s.email && s.email.toLowerCase().includes(q))
        ).slice(0, 5); // display up to 5
    }, [search, data]);

    const handleExport = () => {
        if (!data) return;
        const csv = seatsToCSV(data.seatActivity.seats);
        downloadCSV(csv, `copilot-seats-${org}-${new Date().toISOString().split('T')[0]}.csv`);
    };

    return (
        <>

            <header className="header">
                <div className="header-inner">
                    {/* Brand */}
                    <div className="header-brand">
                        <img
                            src={`${import.meta.env.BASE_URL}github-copilot-icon-logo-brandlogos.net_2b2xhz1k6.svg`}
                            alt="GitHub Copilot"
                            className="header-logo"
                        />
                        <span className="header-title">GitHub Copilot Metrics</span>
                        <div style={{ paddingLeft: 8, display: 'flex', gap: 6, alignItems: 'center' }}>
                            <span className="badge" style={{ background: 'rgba(255,255,255,0.08)', color: 'var(--text-secondary)' }}>
                                {org}
                            </span>
                        </div>
                    </div>
                    <div className="header-controls">
                        {/* Date presets */}
                        {DATE_PRESETS.map((p) => (
                            <button
                                key={p.value}
                                className={`pill ${datePreset === p.value ? 'active' : ''}`}
                                onClick={() => { setShowCustom(false); setDatePreset(p.value); }}
                                aria-pressed={datePreset === p.value}
                            >
                                {p.label}
                            </button>
                        ))}
                        <button
                            className={`pill ${datePreset === 'custom' ? 'active' : ''}`}
                            onClick={() => setShowCustom(!showCustom)}
                            aria-expanded={showCustom}
                        >
                            Custom
                        </button>

                        {showCustom && (
                            <div className="flex gap-8 items-center" style={{ animation: 'fadeIn 0.2s ease-out' }}>
                                <input
                                    type="date"
                                    className="input"
                                    value={customSince}
                                    onChange={(e) => setCustomSince(e.target.value)}
                                    aria-label="From date"
                                    style={{ width: 136 }}
                                />
                                <span className="text-secondary" style={{ fontSize: 12 }}>→</span>
                                <input
                                    type="date"
                                    className="input"
                                    value={customUntil}
                                    onChange={(e) => setCustomUntil(e.target.value)}
                                    aria-label="To date"
                                    style={{ width: 136 }}
                                />
                                <button
                                    className="btn btn-primary btn-sm"
                                    onClick={() => {
                                        if (customSince && customUntil) {
                                            useDashboardStore.getState().setCustomRange(customSince, customUntil);
                                            setShowCustom(false);
                                        }
                                    }}
                                >Apply</button>
                            </div>
                        )}

                        {/* Teams Multiselect */}
                        <div style={{ position: 'relative' }}>
                            <button
                                className="input search-input"
                                style={{ width: 180, display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', textAlign: 'left', padding: '0 12px' }}
                                onClick={() => setShowTeams(!showTeams)}
                                aria-label="Filter by teams"
                            >
                                <span>{teams.length === 0 ? 'All Teams' : `${teams.length} Team${teams.length > 1 ? 's' : ''} Selected`}</span>
                                <span style={{ fontSize: 10, opacity: 0.5 }}>▼</span>
                            </button>

                            {showTeams && (
                                <>
                                    <div
                                        style={{ position: 'fixed', inset: 0, zIndex: 90 }}
                                        onClick={() => setShowTeams(false)}
                                    />
                                    <div className="glass" style={{
                                        position: 'absolute', top: '100%', right: 0, width: 220,
                                        marginTop: 8, borderRadius: 8, overflow: 'hidden',
                                        display: 'flex', flexDirection: 'column', zIndex: 100,
                                        maxHeight: 320, overflowY: 'auto', background: 'var(--bg-layer3)'
                                    }}>
                                        <div style={{ padding: '8px 12px', borderBottom: '1px solid var(--glass-border)' }}>
                                            <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, cursor: 'pointer' }}>
                                                <input
                                                    type="checkbox"
                                                    checked={teams.length === 0}
                                                    onChange={() => {
                                                        setTeams([]);
                                                        setShowTeams(false);
                                                    }}
                                                    style={{ cursor: 'pointer' }}
                                                />
                                                <span style={{ fontWeight: 600 }}>All Teams</span>
                                            </label>
                                        </div>
                                        <div style={{ padding: 4 }}>
                                            {teamsList.map(t => (
                                                <label key={t} className="autocomplete-item" style={{
                                                    display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px',
                                                    cursor: 'pointer', borderRadius: 4, width: '100%',
                                                    color: 'var(--text-primary)', fontSize: 13,
                                                }}>
                                                    <input
                                                        type="checkbox"
                                                        checked={teams.includes(t)}
                                                        onChange={(e) => {
                                                            if (e.target.checked) {
                                                                setTeams([...teams, t]);
                                                            } else {
                                                                setTeams(teams.filter(x => x !== t));
                                                            }
                                                        }}
                                                        style={{ cursor: 'pointer' }}
                                                    />
                                                    <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{t}</span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>

                        {/* Search */}
                        <div className="search-wrap" style={{ position: 'relative' }}>
                            <span className="search-icon">🔍</span>
                            <input
                                id="user-search"
                                type="search"
                                className="input search-input"
                                placeholder="Search users…"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                onFocus={() => setShowSuggestions(true)}
                                onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                                aria-label="Search users"
                                style={{ width: 155 }}
                            />
                            {showSuggestions && searchSuggestions.length > 0 && (
                                <div className="glass" style={{
                                    position: 'absolute', top: '100%', right: 0, width: 220,
                                    marginTop: 8, borderRadius: 8, overflow: 'hidden',
                                    display: 'flex', flexDirection: 'column', padding: 4, zIndex: 100,
                                    background: 'var(--bg-layer3)'
                                }}>
                                    {searchSuggestions.map(s => (
                                        <button
                                            key={s.login}
                                            className="autocomplete-item"
                                            onClick={() => {
                                                setSelectedUser(s.login);
                                                setShowSuggestions(false);
                                                setSearch(''); // clear search when opening drawer
                                            }}
                                            style={{
                                                all: 'unset', boxSizing: 'border-box',
                                                display: 'flex', alignItems: 'center', gap: 10, padding: 8,
                                                cursor: 'pointer', borderRadius: 6, width: '100%',
                                                color: 'var(--text-primary)', fontSize: 13,
                                            }}
                                        >
                                            {s.avatar_url ? (
                                                <img src={s.avatar_url} alt="" style={{ width: 24, height: 24, borderRadius: '50%', objectFit: 'cover' }} />
                                            ) : (
                                                <div style={{
                                                    width: 24, height: 24, borderRadius: '50%',
                                                    background: 'rgba(255,255,255,0.1)', display: 'flex',
                                                    alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700
                                                }}>
                                                    {s.login.slice(0, 2).toUpperCase()}
                                                </div>
                                            )}
                                            <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                                                <span style={{ fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{s.name || s.login}</span>
                                                <span style={{ fontSize: 11, color: 'var(--text-secondary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>@{s.login}</span>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Export */}
                        <button
                            id="export-csv"
                            className="btn btn-sm"
                            onClick={handleExport}
                            title="Export seats as CSV"
                            aria-label="Export CSV"
                        >
                            ⬇ Export
                        </button>

                        {/* Dark/light toggle */}
                        <button
                            id="theme-toggle"
                            className="btn btn-icon btn-sm"
                            onClick={toggleDarkMode}
                            title={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
                            aria-label="Toggle color scheme"
                            style={{ fontSize: 15 }}
                        >
                            {darkMode ? '☀️' : '🌙'}
                        </button>
                    </div>
                </div>
            </header>
        </>
    );
}
