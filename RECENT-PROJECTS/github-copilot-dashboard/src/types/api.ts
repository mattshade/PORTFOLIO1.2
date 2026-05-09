// ─── GitHub Copilot Metrics API Types ────────────────────────────────────────

export interface DateRange {
    since: string; // ISO 8601
    until: string;
}

export interface OrgFilter {
    org: string;
    teams?: string[];
}

// ─── Seat Activity ────────────────────────────────────────────────────────────

export type ActivityBucket = '<1d' | '1-7d' | '8-30d' | '31-90d' | 'inactive';

export interface CopilotSeat {
    login: string;
    name?: string;
    email?: string;
    avatar_url?: string;
    created_at: string;
    updated_at: string;
    last_activity_at: string | null;
    last_activity_editor?: string;
    last_activity_surface?: 'chat' | 'pr_review' | 'inline' | 'cli' | 'unknown';
    plan_type?: 'business' | 'enterprise';
    team?: string;
    // derived
    bucket?: ActivityBucket;
    days_since_activity?: number;
}

export interface SeatActivityResponse {
    total_seats: number;
    seats: CopilotSeat[];
}

// ─── Usage Summary ────────────────────────────────────────────────────────────

export interface UsageSummary {
    total_active_users: number;
    total_engaged_users: number;
    total_ide_completions_count: number;
    total_ide_suggestions_count: number;
    total_chat_turns: number;
    total_pr_review_count: number;
    total_cli_completions: number;
    active_users_by_period: {
        '1d': number;
        '7d': number;
        '30d': number;
        '90d': number;
    };
}

// ─── Usage Trends ─────────────────────────────────────────────────────────────

export interface UsageTrendPoint {
    date: string;
    active_users: number;
    engaged_users: number;
    completions: number;
    suggestions: number;
    chat_turns?: number;
    pr_reviews?: number;
    cli_completions?: number;
}

export interface UsageTrendsResponse {
    granularity: 'day' | 'week';
    data: UsageTrendPoint[];
}

// ─── Surface Usage ────────────────────────────────────────────────────────────

export interface SurfaceUsagePoint {
    date: string;
    chat: number;
    inline_completion: number;
    pr_review: number;
    cli: number;
    other: number;
}

export interface SurfaceUsageResponse {
    data: SurfaceUsagePoint[];
    totals: {
        chat: number;
        inline_completion: number;
        pr_review: number;
        cli: number;
        other: number;
    };
}

// ─── Editor Usage ─────────────────────────────────────────────────────────────

export interface EditorUsagePoint {
    editor: string;
    active_users: number;
    completions: number;
    percentage: number;
}

export interface EditorUsageResponse {
    data: EditorUsagePoint[];
    trend: {
        date: string;
        vscode: number;
        jetbrains: number;
        neovim: number;
        other: number;
    }[];
}

// ─── Language Usage ───────────────────────────────────────────────────────────

export interface LanguageUsagePoint {
    language: string;
    active_users: number;
    completions: number;
    acceptance_rate: number;
}

export interface LanguageUsageResponse {
    data: LanguageUsagePoint[];
}

// ─── PR Review Usage ─────────────────────────────────────────────────────────

export interface PRReviewUsagePoint {
    date: string;
    reviews_initiated: number;
    reviews_completed: number;
    unique_users: number;
}

export interface PRReviewUsageResponse {
    data: PRReviewUsagePoint[];
    totals: {
        reviews_initiated: number;
        reviews_completed: number;
        unique_users: number;
    };
}

// ─── Chat Usage ───────────────────────────────────────────────────────────────

export interface ChatUsagePoint {
    date: string;
    turns: number;
    unique_users: number;
    copilot_chat_turns: number;
}

export interface ChatUsageResponse {
    data: ChatUsagePoint[];
    totals: {
        turns: number;
        unique_users: number;
    };
}

// ─── Active Users ─────────────────────────────────────────────────────────────

export interface ActiveUsersResponse {
    bucket: '1d' | '7d' | '30d' | '90d';
    active_users: number;
    timestamp: string;
}

// ─── Versions ─────────────────────────────────────────────────────────────────

export interface VersionEntry {
    version: string;
    editor: string;
    active_users: number;
    percentage: number;
}

export interface VersionsResponse {
    data: VersionEntry[];
}

// ─── Combined Dashboard State ─────────────────────────────────────────────────

export interface DashboardData {
    seatActivity: SeatActivityResponse;
    usageSummary: UsageSummary;
    usageTrends: UsageTrendsResponse;
    surfaceUsage: SurfaceUsageResponse;
    editorUsage: EditorUsageResponse;
    languageUsage: LanguageUsageResponse;
    prReviewUsage: PRReviewUsageResponse;
    chatUsage: ChatUsageResponse;
    versions: VersionsResponse;
    availableTeams: string[];
}

export type LoadingState = 'idle' | 'loading' | 'success' | 'error';
