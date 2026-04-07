import { create } from 'zustand';
import { format, subDays } from 'date-fns';
import type { DashboardData, LoadingState, ActivityBucket } from '../types/api';
import { api } from '../api/client';
import { computeSeats } from '../utils/metrics';

const DEFAULT_ORG = import.meta.env.VITE_GITHUB_ORG || 'demo-org';
const today = new Date();

export type DatePreset = '7d' | '30d' | '90d' | 'custom';

interface FilterState {
    org: string;
    teams: string[];
    datePreset: DatePreset;
    since: string;
    until: string;
    search: string;
    // table filters
    bucketFilter?: ActivityBucket;
    surfaceFilter?: string;
    editorFilter?: string;
    // trend toggle
    trendMetric: 'active_users' | 'engaged_users' | 'completions';
    surface: 'chat' | 'pr_review' | 'inline' | 'cli';
    selectedUser: string | null;
}

interface DashboardStore extends FilterState {
    availableTeams: string[];
    data: DashboardData | null;
    loadingState: LoadingState;
    error: string | null;
    isDemoMode: boolean;
    darkMode: boolean;
    // actions
    setOrg: (org: string) => void;
    setTeams: (teams: string[]) => void;
    setDatePreset: (preset: DatePreset) => void;
    setCustomRange: (since: string, until: string) => void;
    setSearch: (s: string) => void;
    setBucketFilter: (b?: ActivityBucket) => void;
    setSurfaceFilter: (s?: string) => void;
    setEditorFilter: (e?: string) => void;
    setTrendMetric: (m: FilterState['trendMetric']) => void;
    setSurface: (s: FilterState['surface']) => void;
    setSelectedUser: (u: string | null) => void;
    toggleDarkMode: () => void;
    fetchData: () => Promise<void>;
}

function presetRange(preset: DatePreset, customSince?: string, customUntil?: string) {
    const until = format(today, 'yyyy-MM-dd');
    switch (preset) {
        case '7d': return { since: format(subDays(today, 7), 'yyyy-MM-dd'), until };
        case '30d': return { since: format(subDays(today, 30), 'yyyy-MM-dd'), until };
        case '90d': return { since: format(subDays(today, 90), 'yyyy-MM-dd'), until };
        case 'custom': return { since: customSince ?? format(subDays(today, 30), 'yyyy-MM-dd'), until: customUntil ?? until };
    }
}

// Sync URL params & Local Storage
function syncState(state: Partial<FilterState>) {
    const params = new URLSearchParams(window.location.search);
    if (state.org) params.set('org', state.org);
    if (state.teams !== undefined) {
        if (state.teams.length > 0) params.set('teams', state.teams.join(','));
        else params.delete('teams');
    }
    if (state.datePreset) params.set('range', state.datePreset);
    if (state.since) params.set('since', state.since);
    if (state.until) params.set('until', state.until);
    window.history.replaceState({}, '', `?${params.toString()}`);

    try {
        const stored = localStorage.getItem('copilot-dashboard-filters');
        const current = stored ? JSON.parse(stored) : {};
        if (state.org) current.org = state.org;
        if (state.teams !== undefined) current.teams = state.teams;
        if (state.datePreset) current.datePreset = state.datePreset;
        localStorage.setItem('copilot-dashboard-filters', JSON.stringify(current));
    } catch { }
}

function readState(): Partial<FilterState> {
    const params = new URLSearchParams(window.location.search);

    let local: any = {};
    try {
        const stored = localStorage.getItem('copilot-dashboard-filters');
        if (stored) local = JSON.parse(stored);
    } catch { }

    const urlTeams = params.get('teams');
    const teams = urlTeams !== null ? urlTeams.split(',').filter(Boolean) : (local.teams || []);

    return {
        org: params.get('org') ?? local.org ?? DEFAULT_ORG,
        teams,
        datePreset: (params.get('range') as DatePreset) ?? local.datePreset ?? '30d',
        since: params.get('since') ?? '',
        until: params.get('until') ?? '',
    };
}

const urlState = readState();
const initialPreset = urlState.datePreset ?? '30d';
const initialRange = presetRange(
    initialPreset,
    urlState.since || undefined,
    urlState.until || undefined
);

export const useDashboardStore = create<DashboardStore>((set, get) => ({
    org: urlState.org ?? DEFAULT_ORG,
    teams: urlState.teams ?? [],
    datePreset: initialPreset,
    since: initialRange.since,
    until: initialRange.until,
    search: '',
    bucketFilter: undefined,
    surfaceFilter: undefined,
    editorFilter: undefined,
    trendMetric: 'active_users',
    surface: 'chat',
    selectedUser: null,
    availableTeams: [],
    data: null,
    loadingState: 'idle',
    error: null,
    isDemoMode: import.meta.env.VITE_DEMO_MODE !== 'false',
    darkMode: true,

    setOrg: (org) => {
        set({ org, teams: [] }); // reset teams on org change
        syncState({ org, teams: [] });
        get().fetchData();
    },
    setTeams: (teams) => {
        set({ teams });
        syncState({ teams });
        get().fetchData();
    },
    setDatePreset: (preset) => {
        const range = presetRange(preset);
        set({ datePreset: preset, ...range });
        syncState({ datePreset: preset, ...range });
        get().fetchData();
    },
    setCustomRange: (since, until) => {
        set({ datePreset: 'custom', since, until });
        syncState({ datePreset: 'custom', since, until });
        get().fetchData();
    },
    setSearch: (search) => set({ search }),
    setBucketFilter: (bucketFilter) => set({ bucketFilter }),
    setSurfaceFilter: (surfaceFilter) => set({ surfaceFilter }),
    setEditorFilter: (editorFilter) => set({ editorFilter }),
    setTrendMetric: (trendMetric) => set({ trendMetric }),
    setSurface: (surface) => set({ surface }),
    setSelectedUser: (selectedUser) => set({ selectedUser }),
    toggleDarkMode: () => set((s) => ({ darkMode: !s.darkMode })),

    fetchData: async () => {
        const { org, teams, since, until } = get();
        set({ loadingState: 'loading', error: null });
        try {
            const data = await api.getDashboardData({ org, teams }, { since, until });
            // Enrich seats with bucket + days
            data.seatActivity.seats = computeSeats(data.seatActivity.seats);

            set({ data, loadingState: 'success', availableTeams: data.availableTeams });
        } catch (err) {
            const msg = err instanceof Error ? err.message : 'Unknown error';
            set({ loadingState: 'error', error: msg });
        }
    },
}));
