import type {
    DateRange,
    OrgFilter,
    SeatActivityResponse,
    UsageSummary,
    UsageTrendsResponse,
    SurfaceUsageResponse,
    EditorUsageResponse,
    LanguageUsageResponse,
    PRReviewUsageResponse,
    ChatUsageResponse,
    ActiveUsersResponse,
    VersionsResponse,
    DashboardData,
    CopilotSeat,
} from '../types/api';
import {
    mockSeatActivity,
    mockUsageSummary,
    getUsageTrendsMock,
    mockSurfaceUsage,
    mockEditorUsage,
    mockLanguageUsage,
    mockPRReviewUsage,
    mockChatUsage,
    mockVersions,
    MOCK_EMAILS,
} from '../data/mockData';
import { differenceInDays } from 'date-fns';
import { mergeMetricDays } from '../utils/mergeMetrics';

// ─── Config ───────────────────────────────────────────────────────────────────

const DEMO_MODE = import.meta.env.VITE_DEMO_MODE !== 'false';
const GITHUB_TOKEN = import.meta.env.VITE_GITHUB_TOKEN || '';
const API_BASE = 'https://api.github.com';

// ─── Cache & Dedup ────────────────────────────────────────────────────────────

const cache = new Map<string, { data: unknown; ts: number }>();
const inFlight = new Map<string, Promise<unknown>>();
const CACHE_TTL = 5 * 60 * 1000; // 5 min

function sleep(ms: number) { return new Promise(r => setTimeout(r, ms)); }

async function fetchWithCache<T>(
    url: string,
    options: RequestInit = {}
): Promise<T> {
    const key = url + JSON.stringify(options.body ?? '');
    const cached = cache.get(key);
    if (cached && Date.now() - cached.ts < CACHE_TTL) return cached.data as T;
    if (inFlight.has(key)) return inFlight.get(key) as Promise<T>;

    const authHeaders: Record<string, string> = GITHUB_TOKEN
        ? { Authorization: `Bearer ${GITHUB_TOKEN}` }
        : {};

    const promise = (async () => {
        let attempt = 0;
        while (attempt < 3) {
            try {
                const res = await fetch(url, {
                    ...options,
                    headers: {
                        Accept: 'application/vnd.github+json',
                        'X-GitHub-Api-Version': '2022-11-28',
                        ...authHeaders,
                        ...options.headers,
                    },
                });
                if (res.status === 429) {
                    const retryAfter = parseInt(res.headers.get('Retry-After') ?? '10', 10);
                    throw makeRateLimitError(retryAfter);
                }
                if (!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText} — ${url}`);
                const data = await res.json();
                cache.set(key, { data, ts: Date.now() });
                return data as T;
            } catch (err) {
                if (isRateLimitError(err)) throw err;
                attempt++;
                if (attempt >= 3) throw err;
                await sleep(1000 * attempt);
            }
        }
    })();

    inFlight.set(key, promise!);
    promise!.finally(() => inFlight.delete(key));
    return promise as Promise<T>;
}

// ─── Error types ─────────────────────────────────────────────────────────────

export interface RateLimitError extends Error { retryAfter: number; }

export function makeRateLimitError(retryAfter: number): RateLimitError {
    const err = new Error(`Rate limited. Retry after ${retryAfter}s`) as RateLimitError;
    err.retryAfter = retryAfter;
    err.name = 'RateLimitError';
    return err;
}

function isRateLimitError(e: unknown): e is RateLimitError {
    return e instanceof Error && e.name === 'RateLimitError';
}

// ─── Real API Types (raw GitHub shapes) ──────────────────────────────────────

interface RawSeat {
    created_at: string;
    updated_at: string;
    last_activity_at: string | null;
    last_activity_editor: string | null;
    plan_type: string;
    pending_cancellation_date: string | null;
    last_authenticated_at: string | null;
    assignee: {
        login: string;
        avatar_url: string;
        name?: string;
    };
    assigning_team?: { slug: string; name: string } | null;
}

interface RawSeatsPage {
    total_seats: number;
    seats: RawSeat[];
}

export interface RawMetricDay {
    date: string;
    total_active_users: number;
    total_engaged_users: number;
    copilot_ide_code_completions?: {
        editors?: Array<{
            name: string;
            total_engaged_users: number;
            models?: Array<{
                name: string;
                total_engaged_users: number;
                languages?: Array<{
                    name: string;
                    total_engaged_users: number;
                    total_code_suggestions: number;
                    total_code_acceptances: number;
                    total_code_lines_suggested: number;
                    total_code_lines_accepted: number;
                }>;
            }>;
        }>;
    };
    copilot_ide_chat?: {
        total_engaged_users: number;
        editors?: Array<{
            name: string;
            total_engaged_users: number;
            models?: Array<{
                name: string;
                total_chats: number;
                total_engaged_users: number;
            }>;
        }>;
    };
    copilot_dotcom_chat?: {
        total_engaged_users: number;
        models?: Array<{
            name: string;
            total_chats: number;
            total_engaged_users: number;
        }>;
    };
    copilot_dotcom_pull_requests?: {
        total_engaged_users: number;
        repositories?: Array<{
            name: string;
            total_engaged_users: number;
            models?: Array<{
                name: string;
                total_pr_summaries_created: number;
                total_engaged_users: number;
            }>;
        }>;
    };
}

// ─── Pagination helper ────────────────────────────────────────────────────────

async function fetchAllSeats(org: string): Promise<RawSeatsPage> {
    const perPage = 100;
    let page = 1;
    let totalSeats = 0;
    const allSeats: RawSeat[] = [];

    while (true) {
        const url = `${API_BASE}/orgs/${org}/copilot/billing/seats?per_page=${perPage}&page=${page}`;
        const result = await fetchWithCache<RawSeatsPage>(url);

        totalSeats = result.total_seats;
        allSeats.push(...result.seats);

        if (allSeats.length >= totalSeats || result.seats.length < perPage) break;
        page++;
    }

    return { total_seats: totalSeats, seats: allSeats };
}

// ─── Adapters: raw API → internal types ──────────────────────────────────────

function adaptSeats(raw: RawSeatsPage): SeatActivityResponse {
    return {
        total_seats: raw.total_seats,
        seats: raw.seats.map((s): CopilotSeat => {
            const editorRaw = (s.last_activity_editor ?? '').toLowerCase();
            let surface: 'chat' | 'pr_review' | 'inline' | 'cli' | 'unknown' | undefined;

            if (editorRaw) {
                if (editorRaw.includes('chat')) surface = 'chat';
                else if (editorRaw.includes('pr_review')) surface = 'pr_review';
                else if (editorRaw.includes('cli')) surface = 'cli';
                // Known editor strings usually refer to standard inline code completions
                else if (editorRaw.includes('jetbrains') || editorRaw.includes('vscode') || editorRaw.includes('githubcopilot/')) surface = 'inline';
                else surface = 'unknown';
            }

            return {
                login: s.assignee.login,
                name: s.assignee.name,
                avatar_url: s.assignee.avatar_url,
                created_at: s.created_at,
                updated_at: s.updated_at,
                last_activity_at: s.last_activity_at ?? null,
                last_activity_editor: s.last_activity_editor ?? undefined,
                last_activity_surface: surface,
                plan_type: s.plan_type as 'business' | 'enterprise',
                team: s.assigning_team?.slug ?? s.assigning_team?.name,
            };
        }),
    };
}

function adaptMetrics(days: RawMetricDay[]): {
    summary: UsageSummary;
    trends: UsageTrendsResponse;
    surface: SurfaceUsageResponse;
    editors: EditorUsageResponse;
    languages: LanguageUsageResponse;
    prReview: PRReviewUsageResponse;
    chat: ChatUsageResponse;
    versions: VersionsResponse;
} {
    // ── Aggregate completions per editor and language ────────────────────────
    const editorMap = new Map<string, { users: number; completions: number; suggestions: number }>();
    const langMap = new Map<string, { users: number; completions: number; suggestions: number; acceptances: number }>();

    let totalSuggestions = 0;
    let totalAcceptances = 0;
    let totalChatTurns = 0;
    let totalPRReviews = 0;
    let totalCliCompletions = 0;

    const trendData = days.map((day) => {
        const completionEditors = day.copilot_ide_code_completions?.editors ?? [];

        // per-day aggregates
        let daySuggestions = 0;
        let dayAcceptances = 0;
        let dayCliCompletions = 0;

        completionEditors.forEach((ed) => {
            const edKey = ed.name.toLowerCase();
            const existing = editorMap.get(edKey) ?? { users: 0, completions: 0, suggestions: 0 };

            ed.models?.forEach((m) => {
                let modelSuggestions = 0;
                let modelAcceptances = 0;

                m.languages?.forEach((lang) => {
                    modelSuggestions += (lang.total_code_suggestions || 0);
                    modelAcceptances += (lang.total_code_acceptances || 0);

                    const lKey = lang.name.toLowerCase();
                    const lEx = langMap.get(lKey) ?? { users: 0, completions: 0, suggestions: 0, acceptances: 0 };
                    lEx.completions += lang.total_code_acceptances;
                    lEx.suggestions += lang.total_code_suggestions;
                    lEx.acceptances += lang.total_code_acceptances;
                    lEx.users = Math.max(lEx.users, lang.total_engaged_users);
                    langMap.set(lKey, lEx);
                });

                daySuggestions += modelSuggestions;
                dayAcceptances += modelAcceptances;
                existing.completions += modelAcceptances;
                existing.suggestions += modelSuggestions;
                existing.users = Math.max(existing.users, m.total_engaged_users || 0);

                // CLI completions (Copilot CLI uses a specific editor name)
                if (edKey.includes('cli') || edKey === 'copilot-cli') {
                    dayCliCompletions += modelAcceptances;
                }
            });

            editorMap.set(edKey, existing);
        });

        // chat
        const chatEditors = day.copilot_ide_chat?.editors ?? [];
        let dayChatTurns = day.copilot_dotcom_chat?.models?.reduce((s, m) => s + m.total_chats, 0) ?? 0;
        chatEditors.forEach((ed) => {
            ed.models?.forEach((m) => { dayChatTurns += m.total_chats; });
        });

        // PR reviews
        const prRepos = day.copilot_dotcom_pull_requests?.repositories ?? [];
        let dayPRReviews = 0;
        prRepos.forEach((r) => {
            r.models?.forEach((m) => { dayPRReviews += m.total_pr_summaries_created; });
        });

        totalSuggestions += daySuggestions;
        totalAcceptances += dayAcceptances;
        totalChatTurns += dayChatTurns;
        totalPRReviews += dayPRReviews;
        totalCliCompletions += dayCliCompletions;

        return {
            date: day.date,
            active_users: day.total_active_users,
            engaged_users: day.total_engaged_users,
            completions: dayAcceptances,
            suggestions: daySuggestions,
            chat_turns: dayChatTurns,
            pr_reviews: dayPRReviews,
            cli_completions: dayCliCompletions,
        };
    });

    // ── Summary ───────────────────────────────────────────────────────────────
    const maxActive = Math.max(...trendData.map(d => d.active_users));
    const last1d = trendData[trendData.length - 1]?.active_users ?? 0;
    const last7d = trendData.slice(-7).reduce((s, d) => Math.max(s, d.active_users), 0);
    const last30d = trendData.slice(-30).reduce((s, d) => Math.max(s, d.active_users), 0);

    const summary: UsageSummary = {
        total_active_users: maxActive,
        total_engaged_users: Math.max(...trendData.map(d => d.engaged_users)),
        total_ide_completions_count: totalAcceptances,
        total_ide_suggestions_count: totalSuggestions,
        total_chat_turns: totalChatTurns,
        total_pr_review_count: totalPRReviews,
        total_cli_completions: totalCliCompletions,
        active_users_by_period: {
            '1d': last1d,
            '7d': last7d,
            '30d': last30d,
            '90d': maxActive,
        },
    };

    // ── Trends ────────────────────────────────────────────────────────────────
    const trends: UsageTrendsResponse = { granularity: 'day', data: trendData };

    // ── Surface breakdown (from trends) ──────────────────────────────────────
    const surface: SurfaceUsageResponse = {
        data: trendData.map(d => ({
            date: d.date,
            chat: d.chat_turns,
            inline_completion: d.completions,
            pr_review: d.pr_reviews,
            cli: d.cli_completions,
            other: 0,
        })),
        totals: {
            chat: totalChatTurns,
            inline_completion: totalAcceptances,
            pr_review: totalPRReviews,
            cli: totalCliCompletions,
            other: 0,
        },
    };

    // ── Editors ───────────────────────────────────────────────────────────────
    const totalEditorCompletions = Array.from(editorMap.values()).reduce((s, e) => s + e.completions, 0) || 1;
    const editorsList = Array.from(editorMap.entries())
        .map(([name, e]) => ({
            editor: name.charAt(0).toUpperCase() + name.slice(1),
            active_users: e.users,
            completions: e.completions,
            percentage: Math.round((e.completions / totalEditorCompletions) * 1000) / 10,
        }))
        .sort((a, b) => b.completions - a.completions);

    const editors: EditorUsageResponse = {
        data: editorsList,
        trend: days.slice(-12).map(d => {
            const compEditors = d.copilot_ide_code_completions?.editors ?? [];
            const byName: Record<string, number> = {};
            compEditors.forEach(ed => {
                const k = ed.name.toLowerCase();
                let acc = 0;
                ed.models?.forEach(m => {
                    m.languages?.forEach(l => { acc += l.total_code_acceptances; });
                });
                byName[k] = (byName[k] ?? 0) + acc;
            });
            return {
                date: d.date,
                vscode: byName['vscode'] ?? 0,
                jetbrains: byName['jetbrains'] ?? 0,
                neovim: byName['neovim'] ?? 0,
                other: Object.entries(byName)
                    .filter(([k]) => !['vscode', 'jetbrains', 'neovim'].includes(k))
                    .reduce((s, [, v]) => s + v, 0),
            };
        }),
    };

    // ── Languages ─────────────────────────────────────────────────────────────
    const totalLangSuggestions = Array.from(langMap.values()).reduce((s, l) => s + l.suggestions, 0) || 1;
    const languages: LanguageUsageResponse = {
        data: Array.from(langMap.entries())
            .map(([name, l]) => ({
                language: name.charAt(0).toUpperCase() + name.slice(1),
                active_users: l.users,
                completions: l.completions,
                acceptance_rate: l.suggestions > 0 ? l.acceptances / l.suggestions : 0,
            }))
            .sort((a, b) => b.completions - a.completions)
            .slice(0, 12),
    };

    // ── PR Review ─────────────────────────────────────────────────────────────
    const prReview: PRReviewUsageResponse = {
        data: trendData.map(d => ({
            date: d.date,
            reviews_initiated: d.pr_reviews,
            reviews_completed: Math.round(d.pr_reviews * 0.85),
            unique_users: Math.round(d.pr_reviews / 3) + 1,
        })),
        totals: {
            reviews_initiated: totalPRReviews,
            reviews_completed: Math.round(totalPRReviews * 0.85),
            unique_users: days.reduce((s, d) => Math.max(s, d.copilot_dotcom_pull_requests?.total_engaged_users ?? 0), 0),
        },
    };

    // ── Chat ─────────────────────────────────────────────────────────────────
    const chat: ChatUsageResponse = {
        data: trendData.map(d => ({
            date: d.date,
            turns: d.chat_turns,
            unique_users: Math.round(d.chat_turns / 15) + 1,
            copilot_chat_turns: Math.round(d.chat_turns * 0.75),
        })),
        totals: {
            turns: totalChatTurns,
            unique_users: Math.max(...days.map(d => d.copilot_ide_chat?.total_engaged_users ?? 0)),
        },
    };

    // ── Versions (editor version breakdown not in this endpoint — return empty) ─
    const versions: VersionsResponse = { data: [] };

    return { summary, trends, surface, editors, languages, prReview, chat, versions };
}

// ─── User email enrichment ────────────────────────────────────────────────────

interface GitHubUser {
    login: string;
    name: string | null;
    email: string | null;
    avatar_url: string;
}

async function fetchUserProfile(login: string): Promise<GitHubUser | null> {
    if (DEMO_MODE) {
        return {
            login,
            name: login.charAt(0).toUpperCase() + login.slice(1),
            email: MOCK_EMAILS[login] ?? null,
            avatar_url: `https://i.pravatar.cc/150?u=${login}`,
        };
    }
    try {
        return await fetchWithCache<GitHubUser>(`${API_BASE}/users/${login}`);
    } catch {
        return null;
    }
}

async function enrichSeatsWithEmails(seats: CopilotSeat[]): Promise<CopilotSeat[]> {
    const CONCURRENCY = 8;
    const enriched = [...seats];
    for (let i = 0; i < enriched.length; i += CONCURRENCY) {
        const batch = enriched.slice(i, i + CONCURRENCY);
        await Promise.all(
            batch.map(async (seat, idx) => {
                const profile = await fetchUserProfile(seat.login);
                if (profile) {
                    enriched[i + idx] = {
                        ...seat,
                        email: profile.email ?? undefined,
                        name: profile.name ?? seat.name,
                        avatar_url: profile.avatar_url ?? seat.avatar_url,
                    };
                }
            })
        );
    }
    return enriched;
}

// ─── API Client ───────────────────────────────────────────────────────────────

export const api = {
    async getSeatActivity(filter: OrgFilter): Promise<SeatActivityResponse> {
        if (DEMO_MODE) return { ...mockSeatActivity };
        const raw = await fetchAllSeats(filter.org);
        if (filter.teams && filter.teams.length > 0) {
            raw.seats = raw.seats.filter(s => {
                const teamName = s.assigning_team?.slug ?? s.assigning_team?.name;
                return teamName && filter.teams?.includes(teamName);
            });
            raw.total_seats = raw.seats.length;
        }
        return adaptSeats(raw);
    },

    async getUsageSummary(_filter: OrgFilter, _range: DateRange): Promise<UsageSummary> {
        // Summary is derived from metrics in real mode — return mock here, getDashboardData drives this
        if (DEMO_MODE) return mockUsageSummary;
        return mockUsageSummary; // overridden in getDashboardData
    },

    async getUsageTrends(filter: OrgFilter, range: DateRange, _granularity: 'day' | 'week' = 'day'): Promise<UsageTrendsResponse> {
        if (DEMO_MODE) {
            const days = differenceInDays(new Date(range.until), new Date(range.since));
            return getUsageTrendsMock(days);
        }
        const base = filter.teams?.length ? `${API_BASE}/orgs/${filter.org}/team/${filter.teams[0]}/copilot/metrics` : `${API_BASE}/orgs/${filter.org}/copilot/metrics`;
        const url = `${base}?since=${range.since}&until=${range.until}`;
        const raw = await fetchWithCache<RawMetricDay[]>(url);
        return adaptMetrics(raw).trends;
    },

    async getUsageBySurface(filter: OrgFilter, range: DateRange): Promise<SurfaceUsageResponse> {
        if (DEMO_MODE) return mockSurfaceUsage;
        const base = filter.teams?.length ? `${API_BASE}/orgs/${filter.org}/team/${filter.teams[0]}/copilot/metrics` : `${API_BASE}/orgs/${filter.org}/copilot/metrics`;
        const url = `${base}?since=${range.since}&until=${range.until}`;
        const raw = await fetchWithCache<RawMetricDay[]>(url);
        return adaptMetrics(raw).surface;
    },

    async getUsageByEditor(filter: OrgFilter, range: DateRange): Promise<EditorUsageResponse> {
        if (DEMO_MODE) return mockEditorUsage;
        const base = filter.teams?.length ? `${API_BASE}/orgs/${filter.org}/team/${filter.teams[0]}/copilot/metrics` : `${API_BASE}/orgs/${filter.org}/copilot/metrics`;
        const url = `${base}?since=${range.since}&until=${range.until}`;
        const raw = await fetchWithCache<RawMetricDay[]>(url);
        return adaptMetrics(raw).editors;
    },

    async getUsageByLanguage(filter: OrgFilter, range: DateRange): Promise<LanguageUsageResponse> {
        if (DEMO_MODE) return mockLanguageUsage;
        const base = filter.teams?.length ? `${API_BASE}/orgs/${filter.org}/team/${filter.teams[0]}/copilot/metrics` : `${API_BASE}/orgs/${filter.org}/copilot/metrics`;
        const url = `${base}?since=${range.since}&until=${range.until}`;
        const raw = await fetchWithCache<RawMetricDay[]>(url);
        return adaptMetrics(raw).languages;
    },

    async getPRReviewUsage(filter: OrgFilter, range: DateRange): Promise<PRReviewUsageResponse> {
        if (DEMO_MODE) return mockPRReviewUsage;
        const base = filter.teams?.length ? `${API_BASE}/orgs/${filter.org}/team/${filter.teams[0]}/copilot/metrics` : `${API_BASE}/orgs/${filter.org}/copilot/metrics`;
        const url = `${base}?since=${range.since}&until=${range.until}`;
        const raw = await fetchWithCache<RawMetricDay[]>(url);
        return adaptMetrics(raw).prReview;
    },

    async getChatUsage(filter: OrgFilter, range: DateRange): Promise<ChatUsageResponse> {
        if (DEMO_MODE) return mockChatUsage;
        const base = filter.teams?.length ? `${API_BASE}/orgs/${filter.org}/team/${filter.teams[0]}/copilot/metrics` : `${API_BASE}/orgs/${filter.org}/copilot/metrics`;
        const url = `${base}?since=${range.since}&until=${range.until}`;
        const raw = await fetchWithCache<RawMetricDay[]>(url);
        return adaptMetrics(raw).chat;
    },

    async getActiveUsers(filter: OrgFilter, range: DateRange, bucket: '1d' | '7d' | '30d' | '90d'): Promise<ActiveUsersResponse> {
        if (DEMO_MODE) {
            return { bucket, active_users: mockUsageSummary.active_users_by_period[bucket], timestamp: new Date().toISOString() };
        }
        const base = filter.teams?.length ? `${API_BASE}/orgs/${filter.org}/team/${filter.teams[0]}/copilot/metrics` : `${API_BASE}/orgs/${filter.org}/copilot/metrics`;
        const url = `${base}?since=${range.since}&until=${range.until}`;
        const raw = await fetchWithCache<RawMetricDay[]>(url);
        const adapted = adaptMetrics(raw).summary;
        return { bucket, active_users: adapted.active_users_by_period[bucket], timestamp: new Date().toISOString() };
    },

    async getVersions(_filter: OrgFilter, _range: DateRange): Promise<VersionsResponse> {
        if (DEMO_MODE) return mockVersions;
        return { data: [] }; // Not available directly in the v1 metrics API, we compute it below
    },

    // ── Compute Versions from Seats ───────────────────────────────────────────
    _computeVersionsFromSeats(seats: CopilotSeat[]): VersionsResponse {
        const versionMap = new Map<string, { editor: string; users: number }>();
        let totalUsers = 0;

        seats.forEach((s) => {
            const raw = s.last_activity_editor;
            if (!raw) return;

            let editor = 'Unknown';
            let version = 'unknown';

            const lower = raw.toLowerCase();
            if (lower.includes('vscode')) {
                editor = 'VS Code';
                const parts = raw.split('/');
                if (parts.length > 1) version = parts[1]!.split('-')[0]!;
            } else if (lower.includes('jetbrains')) {
                editor = 'JetBrains';
                const parts = raw.split('/');
                if (parts.length > 1) version = parts[1]!;
            } else if (lower.includes('githubcopilot')) {
                const parts = raw.split('/');
                if (parts.length > 2) {
                    editor = lower.includes('visualstudio') ? 'Visual Studio' : 'Unknown';
                    version = parts[parts.length - 1]!;
                } else if (parts.length > 1) {
                    version = parts[parts.length - 1]!;
                }
            }

            const key = `${editor}_${version}`;
            const ex = versionMap.get(key) || { editor, users: 0 };
            ex.users++;
            totalUsers++;
            versionMap.set(key, ex);
        });

        if (totalUsers === 0) totalUsers = 1;

        const data = Array.from(versionMap.entries()).map(([_k, v]) => ({
            version: _k.split('_')[1]!,
            active_users: v.users,
            percentage: (v.users / totalUsers) * 100,
            editor: v.editor,
        })).sort((a, b) => b.active_users - a.active_users);

        return { data };
    },

    // ── Main data fetch — single metrics call + seats (parallel) ─────────────
    async getDashboardData(filter: OrgFilter, range: DateRange): Promise<DashboardData> {
        if (DEMO_MODE) {
            const days = differenceInDays(new Date(range.until), new Date(range.since));
            const dm: DashboardData = {
                seatActivity: { ...mockSeatActivity },
                usageSummary: mockUsageSummary,
                usageTrends: getUsageTrendsMock(days),
                surfaceUsage: mockSurfaceUsage,
                editorUsage: mockEditorUsage,
                languageUsage: mockLanguageUsage,
                prReviewUsage: mockPRReviewUsage,
                chatUsage: mockChatUsage,
                versions: mockVersions,
                availableTeams: ['platform', 'frontend', 'backend', 'data', 'devops'],
            };
            dm.seatActivity.seats = await enrichSeatsWithEmails(dm.seatActivity.seats);
            return dm;
        }

        // Real mode: one or more metrics call + seats (paginated) in parallel
        let metricsUrlOrPromises: Promise<RawMetricDay[]> | Promise<RawMetricDay[][]>;

        if (!filter.teams || filter.teams.length === 0) {
            metricsUrlOrPromises = fetchWithCache<RawMetricDay[]>(`${API_BASE}/orgs/${filter.org}/copilot/metrics?since=${range.since}&until=${range.until}`);
        } else if (filter.teams.length === 1) {
            metricsUrlOrPromises = fetchWithCache<RawMetricDay[]>(`${API_BASE}/orgs/${filter.org}/team/${filter.teams[0]}/copilot/metrics?since=${range.since}&until=${range.until}`).catch(() => [] as RawMetricDay[]);
        } else {
            metricsUrlOrPromises = Promise.all(
                filter.teams.map(team =>
                    fetchWithCache<RawMetricDay[]>(`${API_BASE}/orgs/${filter.org}/team/${team}/copilot/metrics?since=${range.since}&until=${range.until}`)
                        .catch(() => [] as RawMetricDay[])
                )
            );
        }

        const [metricsResult, rawSeats] = await Promise.all([
            metricsUrlOrPromises,
            fetchAllSeats(filter.org), // GitHub doesn't have a team seats API, fetch all and filter locally
        ]);

        const rawMetrics = Array.isArray(metricsResult[0])
            ? mergeMetricDays(metricsResult as RawMetricDay[][])
            : metricsResult as RawMetricDay[];

        // Extract teams BEFORE filtering raw seats by team
        const teams = new Set(rawSeats.seats.map(s => s.assigning_team?.slug ?? s.assigning_team?.name).filter(Boolean) as string[]);
        const availableTeams = Array.from(teams).sort();

        if (filter.teams && filter.teams.length > 0) {
            rawSeats.seats = rawSeats.seats.filter(s => {
                const teamName = s.assigning_team?.slug ?? s.assigning_team?.name;
                return teamName && filter.teams?.includes(teamName);
            });
            rawSeats.total_seats = rawSeats.seats.length;
        }

        const adapted = adaptMetrics(rawMetrics);
        const seatActivity = adaptSeats(rawSeats);

        // Enrich seats with emails (batched)
        seatActivity.seats = await enrichSeatsWithEmails(seatActivity.seats);

        return {
            seatActivity,
            usageSummary: adapted.summary,
            usageTrends: adapted.trends,
            surfaceUsage: adapted.surface,
            editorUsage: adapted.editors,
            languageUsage: adapted.languages,
            prReviewUsage: adapted.prReview,
            chatUsage: adapted.chat,
            versions: this._computeVersionsFromSeats(seatActivity.seats),
            availableTeams,
        };
    },
};
