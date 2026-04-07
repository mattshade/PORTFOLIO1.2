import { subDays, format, subWeeks } from 'date-fns';
import type {
    SeatActivityResponse,
    UsageSummary,
    UsageTrendsResponse,
    SurfaceUsageResponse,
    EditorUsageResponse,
    LanguageUsageResponse,
    PRReviewUsageResponse,
    ChatUsageResponse,
    VersionsResponse,
    DashboardData,
} from '../types/api';

const today = new Date(2026, 2, 5); // 2026-03-05

const fmt = (d: Date) => format(d, 'yyyy-MM-dd');

function seededRandom(seed: number) {
    const x = Math.sin(seed + 1) * 10000;
    return x - Math.floor(x);
}

// ─── Source of truth: totals for a wildly successful org ───────────────────────

const TOTALS = {
    seats: 95,
    activeUsers: 93,
    engagedUsers: 90,
    completions: 3_240_000,
    suggestions: 5_680_000,
    chatTurns: 485_000,
    prReviews: 22_100,
    cliCompletions: 78_500,
};

// ─── 95全新用户 / Brand new users ─────────────────────────────────────────────

const USER_PROFILES: { login: string; name: string; email: string }[] = [
    { login: 'jkim', name: 'Jordan Kim', email: 'jordan.kim@example.com' },
    { login: 'svaldez', name: 'Sienna Valdez', email: 'sienna.valdez@example.com' },
    { login: 'mokonkwo', name: 'Micah Okonkwo', email: 'micah.okonkwo@example.com' },
    { login: 'apetrov', name: 'Anastasia Petrov', email: 'anastasia.petrov@example.com' },
    { login: 'rsharma', name: 'Rohan Sharma', email: 'rohan.sharma@example.com' },
    { login: 'lweber', name: 'Leah Weber', email: 'leah.weber@example.com' },
    { login: 'knovak', name: 'Kira Novak', email: 'kira.novak@example.com' },
    { login: 'tdelgado', name: 'Tyler Delgado', email: 'tyler.delgado@example.com' },
    { login: 'nbeck', name: 'Nadia Beck', email: 'nadia.beck@example.com' },
    { login: 'cpham', name: 'Chloe Pham', email: 'chloe.pham@example.com' },
    { login: 'amckenzie', name: 'Ashton McKenzie', email: 'ashton.mckenzie@example.com' },
    { login: 'bhuang', name: 'Brooke Huang', email: 'brooke.huang@example.com' },
    { login: 'dokane', name: 'Dylan Okane', email: 'dylan.okane@example.com' },
    { login: 'emendoza', name: 'Elias Mendoza', email: 'elias.mendoza@example.com' },
    { login: 'fsantos', name: 'Freya Santos', email: 'freya.santos@example.com' },
    { login: 'gvogel', name: 'Gavin Vogel', email: 'gavin.vogel@example.com' },
    { login: 'hkoch', name: 'Hazel Koch', email: 'hazel.koch@example.com' },
    { login: 'imueller', name: 'Isabel Müller', email: 'isabel.mueller@example.com' },
    { login: 'jwinters', name: 'Jasper Winters', email: 'jasper.winters@example.com' },
    { login: 'kramirez', name: 'Keira Ramirez', email: 'keira.ramirez@example.com' },
    { login: 'lstein', name: 'Leo Stein', email: 'leo.stein@example.com' },
    { login: 'mchang', name: 'Maya Chang', email: 'maya.chang@example.com' },
    { login: 'nkim', name: 'Noah Kim', email: 'noah.kim@example.com' },
    { login: 'ozhang', name: 'Olivia Zhang', email: 'olivia.zhang@example.com' },
    { login: 'pfernandez', name: 'Parker Fernandez', email: 'parker.fernandez@example.com' },
    { login: 'qreed', name: 'Quinn Reed', email: 'quinn.reed@example.com' },
    { login: 'rsullivan', name: 'Riley Sullivan', email: 'riley.sullivan@example.com' },
    { login: 'storres', name: 'Skylar Torres', email: 'skylar.torres@example.com' },
    { login: 'twolf', name: 'Taylor Wolf', email: 'taylor.wolf@example.com' },
    { login: 'uyamamoto', name: 'Uma Yamamoto', email: 'uma.yamamoto@example.com' },
    { login: 'vcastillo', name: 'Violet Castillo', email: 'violet.castillo@example.com' },
    { login: 'wnguyen', name: 'Weston Nguyen', email: 'weston.nguyen@example.com' },
    { login: 'xliu', name: 'Xander Liu', email: 'xander.liu@example.com' },
    { login: 'ypark', name: 'Yara Park', email: 'yara.park@example.com' },
    { login: 'zwerner', name: 'Zoe Werner', email: 'zoe.werner@example.com' },
    { login: 'adixon', name: 'Aria Dixon', email: 'aria.dixon@example.com' },
    { login: 'bthompson', name: 'Blake Thompson', email: 'blake.thompson@example.com' },
    { login: 'cchen', name: 'Casey Chen', email: 'casey.chen@example.com' },
    { login: 'dharris', name: 'Drew Harris', email: 'drew.harris@example.com' },
    { login: 'ewong', name: 'Emery Wong', email: 'emery.wong@example.com' },
    { login: 'ffleming', name: 'Finley Fleming', email: 'finley.fleming@example.com' },
    { login: 'ggraves', name: 'Grace Graves', email: 'grace.graves@example.com' },
    { login: 'hhodges', name: 'Harper Hodges', email: 'harper.hodges@example.com' },
    { login: 'iwood', name: 'Ian Wood', email: 'ian.wood@example.com' },
    { login: 'jyu', name: 'Jade Yu', email: 'jade.yu@example.com' },
    { login: 'kzhang', name: 'Kai Zhang', email: 'kai.zhang@example.com' },
    { login: 'lweiss', name: 'Luna Weiss', email: 'luna.weiss@example.com' },
    { login: 'mbrooks', name: 'Morgan Brooks', email: 'morgan.brooks@example.com' },
    { login: 'nquinn', name: 'Nolan Quinn', email: 'nolan.quinn@example.com' },
    { login: 'orojas', name: 'Oscar Rojas', email: 'oscar.rojas@example.com' },
    { login: 'pchoi', name: 'Piper Choi', email: 'piper.choi@example.com' },
    { login: 'qsanchez', name: 'Quentin Sanchez', email: 'quentin.sanchez@example.com' },
    { login: 'rlewis', name: 'River Lewis', email: 'river.lewis@example.com' },
    { login: 'smyers', name: 'Sage Myers', email: 'sage.myers@example.com' },
    { login: 'tpowell', name: 'Teagan Powell', email: 'teagan.powell@example.com' },
    { login: 'urivers', name: 'Uma Rivers', email: 'uma.rivers@example.com' },
    { login: 'vwatts', name: 'Victor Watts', email: 'victor.watts@example.com' },
    { login: 'wchen', name: 'Willow Chen', email: 'willow.chen@example.com' },
    { login: 'xfeng', name: 'Xavier Feng', email: 'xavier.feng@example.com' },
    { login: 'yozawa', name: 'Yuki Ozawa', email: 'yuki.ozawa@example.com' },
    { login: 'zbauer', name: 'Zara Bauer', email: 'zara.bauer@example.com' },
    { login: 'abishop', name: 'Arlo Bishop', email: 'arlo.bishop@example.com' },
    { login: 'bholt', name: 'Briar Holt', email: 'briar.holt@example.com' },
    { login: 'ccurtis', name: 'Cameron Curtis', email: 'cameron.curtis@example.com' },
    { login: 'dmayo', name: 'Dakota Mayo', email: 'dakota.mayo@example.com' },
    { login: 'ekim', name: 'Ellis Kim', email: 'ellis.kim@example.com' },
    { login: 'freed', name: 'Felix Reed', email: 'felix.reed@example.com' },
    { login: 'gross', name: 'Gemma Ross', email: 'gemma.ross@example.com' },
    { login: 'hsharma', name: 'Harper Sharma', email: 'harper.sharma@example.com' },
    { login: 'ilam', name: 'Ivy Lam', email: 'ivy.lam@example.com' },
    { login: 'jdoe', name: 'Jules Doe', email: 'jules.doe@example.com' },
    { login: 'kkowalski', name: 'Kai Kowalski', email: 'kai.kowalski@example.com' },
    { login: 'llee', name: 'Liam Lee', email: 'liam.lee@example.com' },
    { login: 'mmorgan', name: 'Mia Morgan', email: 'mia.morgan@example.com' },
    { login: 'nross', name: 'Nina Ross', email: 'nina.ross@example.com' },
    { login: 'osato', name: 'Oliver Sato', email: 'oliver.sato@example.com' },
    { login: 'ppalmer', name: 'Paige Palmer', email: 'paige.palmer@example.com' },
    { login: 'qgray', name: 'Quinn Gray', email: 'quinn.gray@example.com' },
    { login: 'rbell', name: 'Reese Bell', email: 'reese.bell@example.com' },
    { login: 'sclark', name: 'Sawyer Clark', email: 'sawyer.clark@example.com' },
    { login: 'tjohnson', name: 'Tatum Johnson', email: 'tatum.johnson@example.com' },
    { login: 'uanderson', name: 'Uriah Anderson', email: 'uriah.anderson@example.com' },
    { login: 'vhall', name: 'Vivian Hall', email: 'vivian.hall@example.com' },
    { login: 'wwright', name: 'Wyatt Wright', email: 'wyatt.wright@example.com' },
    { login: 'xmorales', name: 'Xena Morales', email: 'xena.morales@example.com' },
    { login: 'ytan', name: 'Yael Tan', email: 'yael.tan@example.com' },
    { login: 'zzimmermann', name: 'Zander Zimmermann', email: 'zander.zimmermann@example.com' },
];

// Additional named users to reach 95
const PADDING_PROFILES: { login: string; name: string; email: string }[] = [
    { login: 'amora', name: 'Aidan Mora', email: 'aidan.mora@example.com' },
    { login: 'bkim', name: 'Blair Kim', email: 'blair.kim@example.com' },
    { login: 'cdavila', name: 'Corinne Davila', email: 'corinne.davila@example.com' },
    { login: 'delgado', name: 'Devon Delgado', email: 'devon.delgado@example.com' },
    { login: 'eoconnor', name: 'Eden O\'Connor', email: 'eden.oconnor@example.com' },
    { login: 'fmoreno', name: 'Fallon Moreno', email: 'fallon.moreno@example.com' },
    { login: 'gibarra', name: 'Griffin Ibarra', email: 'griffin.ibarra@example.com' },
    { login: 'hjensen', name: 'Hayden Jensen', email: 'hayden.jensen@example.com' },
    { login: 'iklein', name: 'Indigo Klein', email: 'indigo.klein@example.com' },
    { login: 'jmcdowell', name: 'Jace McDowell', email: 'jace.mcdowell@example.com' },
    { login: 'klynch', name: 'Kendall Lynch', email: 'kendall.lynch@example.com' },
    { login: 'lhenry', name: 'Logan Henry', email: 'logan.henry@example.com' },
    { login: 'mnash', name: 'Maddox Nash', email: 'maddox.nash@example.com' },
    { login: 'noconnor', name: 'Nico O\'Connor', email: 'nico.oconnor@example.com' },
    { login: 'opratt', name: 'Orion Pratt', email: 'orion.pratt@example.com' },
    { login: 'pquinn', name: 'Phoenix Quinn', email: 'phoenix.quinn@example.com' },
    { login: 'qwest', name: 'Quincy West', email: 'quincy.west@example.com' },
    { login: 'rsantos', name: 'Rowan Santos', email: 'rowan.santos@example.com' },
    { login: 'sthompson', name: 'Sloane Thompson', email: 'sloane.thompson@example.com' },
    { login: 'tvaldez', name: 'Trace Valdez', email: 'trace.valdez@example.com' },
];

const ALL_PROFILES = [...USER_PROFILES, ...PADDING_PROFILES].slice(0, TOTALS.seats);

export const MOCK_EMAILS: Record<string, string> = Object.fromEntries(
    ALL_PROFILES.map((p) => [p.login, p.email])
);

const EDITORS = ['vscode', 'jetbrains', 'neovim', 'vscode-insiders', 'vim'];
const SURFACES = ['inline', 'chat', 'pr_review', 'cli'] as const;
const TEAMS = ['platform', 'frontend', 'backend', 'data', 'devops', 'mobile', 'security'];

// ─── Usage Trends (90 days) — derived from TOTALS ─────────────────────────────

function generateTrend(days: number): UsageTrendsResponse {
    const data = [];
    let baseline = 70;
    for (let i = days; i >= 0; i--) {
        const date = fmt(subDays(today, i));
        baseline = Math.min(TOTALS.seats, baseline + (seededRandom(i) - 0.4) * 1.5 + 0.12);
        const active = Math.round(baseline);
        const dayScale = 1 + (days - i) / days * 0.3; // growth over period
        const completions = Math.round((TOTALS.completions / days) * dayScale * (0.92 + seededRandom(i) * 0.16));
        const suggestions = Math.round((TOTALS.suggestions / days) * dayScale * (0.92 + seededRandom(i + 1) * 0.16));
        const chatTurns = Math.round((TOTALS.chatTurns / days) * dayScale * (0.9 + seededRandom(i + 2) * 0.2));
        const prReviews = Math.round((TOTALS.prReviews / days) * dayScale * (0.88 + seededRandom(i + 3) * 0.24));
        const cliCompletions = Math.round((TOTALS.cliCompletions / days) * dayScale * (0.9 + seededRandom(i + 4) * 0.2));
        data.push({
            date,
            active_users: active,
            engaged_users: Math.round(active * 0.97),
            completions,
            suggestions,
            chat_turns: chatTurns,
            pr_reviews: prReviews,
            cli_completions: cliCompletions,
        });
    }
    return { granularity: 'day', data };
}

export const mockUsageTrends90 = generateTrend(90);

export function getUsageTrendsMock(days: number): UsageTrendsResponse {
    return generateTrend(days);
}

const trendData = mockUsageTrends90.data;

// ─── Usage Summary — matches TOTALS ───────────────────────────────────────────

export const mockUsageSummary: UsageSummary = {
    total_active_users: TOTALS.activeUsers,
    total_engaged_users: TOTALS.engagedUsers,
    total_ide_completions_count: TOTALS.completions,
    total_ide_suggestions_count: TOTALS.suggestions,
    total_chat_turns: TOTALS.chatTurns,
    total_pr_review_count: TOTALS.prReviews,
    total_cli_completions: TOTALS.cliCompletions,
    active_users_by_period: {
        '1d': 79,
        '7d': 89,
        '30d': 92,
        '90d': TOTALS.seats,
    },
};

// ─── Seat Activity ───────────────────────────────────────────────────────────

export const mockSeatActivity: SeatActivityResponse = {
    total_seats: TOTALS.seats,
    seats: ALL_PROFILES.map((profile, i) => {
        const seed = i * 19;
        const activityRoll = seededRandom(seed);
        const daysAgo = activityRoll < 0.52 ? Math.floor(activityRoll * 2) :
            activityRoll < 0.88 ? 2 + Math.floor(seededRandom(seed + 1) * 5) :
                activityRoll < 0.96 ? 8 + Math.floor(seededRandom(seed + 2) * 22) :
                    31 + Math.floor(seededRandom(seed + 3) * 55);

        const lastActivity = daysAgo <= 90 ? fmt(subDays(today, daysAgo)) : null;
        const editorIdx = Math.floor(seededRandom(seed + 4) * EDITORS.length);
        const surfaceIdx = Math.floor(seededRandom(seed + 5) * SURFACES.length);
        const teamIdx = Math.floor(seededRandom(seed + 6) * TEAMS.length);

        return {
            login: profile.login,
            name: profile.name,
            email: profile.email,
            avatar_url: `https://i.pravatar.cc/150?u=${profile.login}`,
            created_at: fmt(subDays(today, 200 + Math.floor(seededRandom(seed + 7) * 400))),
            updated_at: lastActivity ?? fmt(subDays(today, 1)),
            last_activity_at: lastActivity,
            last_activity_editor: lastActivity ? EDITORS[editorIdx] : undefined,
            last_activity_surface: lastActivity ? SURFACES[surfaceIdx] : undefined,
            plan_type: 'enterprise' as const,
            team: TEAMS[teamIdx],
        };
    }),
};

// ─── Surface Usage — filled from trendData, totals = TOTALS ────────────────────

export const mockSurfaceUsage: SurfaceUsageResponse = {
    data: trendData.map((d, i) => ({
        date: d.date,
        chat: Math.round((d.chat_turns ?? 0)),
        inline_completion: d.completions ?? 0,
        pr_review: d.pr_reviews ?? 0,
        cli: d.cli_completions ?? 0,
        other: Math.round(seededRandom(i + 200) * 8),
    })),
    totals: {
        chat: TOTALS.chatTurns,
        inline_completion: TOTALS.completions,
        pr_review: TOTALS.prReviews,
        cli: TOTALS.cliCompletions,
        other: 1_840,
    },
};

// ─── Editor Usage — percentages sum to 100, completions = TOTALS.completions ───

const EDITOR_BREAKDOWN = [
    { editor: 'VS Code', pct: 66.2, users: 62 },
    { editor: 'JetBrains', pct: 24.1, users: 22 },
    { editor: 'Neovim', pct: 5.3, users: 5 },
    { editor: 'VS Code Insiders', pct: 2.9, users: 3 },
    { editor: 'Vim', pct: 1.5, users: 2 },
];

export const mockEditorUsage: EditorUsageResponse = {
    data: EDITOR_BREAKDOWN.map((e) => ({
        editor: e.editor,
        active_users: e.users,
        completions: Math.round(TOTALS.completions * (e.pct / 100)),
        percentage: e.pct,
    })),
    trend: Array.from({ length: 12 }, (_, i) => {
        const w = 11 - i;
        return {
            date: fmt(subWeeks(today, w)),
            vscode: 58 + Math.round(seededRandom(i) * 10),
            jetbrains: 20 + Math.round(seededRandom(i + 11) * 4),
            neovim: 4 + Math.round(seededRandom(i + 22) * 2),
            other: 3 + Math.round(seededRandom(i + 33) * 3),
        };
    }),
};

// ─── Language Usage — completions sum ≈ TOTALS.completions ────────────────────

const LANG_BREAKDOWN = [
    { language: 'TypeScript', users: 74, pct: 28.2, rate: 0.42 },
    { language: 'Python', users: 70, pct: 23.1, rate: 0.39 },
    { language: 'JavaScript', users: 66, pct: 16.8, rate: 0.36 },
    { language: 'Go', users: 50, pct: 10.2, rate: 0.45 },
    { language: 'Java', users: 40, pct: 6.4, rate: 0.35 },
    { language: 'Rust', users: 34, pct: 5.1, rate: 0.48 },
    { language: 'C#', users: 36, pct: 4.2, rate: 0.38 },
    { language: 'Ruby', users: 28, pct: 2.4, rate: 0.33 },
    { language: 'Shell', users: 60, pct: 1.8, rate: 0.29 },
    { language: 'Kotlin', users: 24, pct: 2.2, rate: 0.40 },
];

export const mockLanguageUsage: LanguageUsageResponse = {
    data: LANG_BREAKDOWN.map((l) => ({
        language: l.language,
        active_users: l.users,
        completions: Math.round(TOTALS.completions * (l.pct / 100)),
        acceptance_rate: l.rate,
    })),
};

// ─── PR Review Usage — filled from trendData ───────────────────────────────────

export const mockPRReviewUsage: PRReviewUsageResponse = {
    data: trendData.map((d) => ({
        date: d.date,
        reviews_initiated: d.pr_reviews ?? 0,
        reviews_completed: Math.round((d.pr_reviews ?? 0) * 0.92),
        unique_users: Math.round(((d.pr_reviews ?? 0) / 2.2) + 2),
    })),
    totals: {
        reviews_initiated: TOTALS.prReviews,
        reviews_completed: Math.round(TOTALS.prReviews * 0.92),
        unique_users: 68,
    },
};

// ─── Chat Usage — filled from trendData ────────────────────────────────────────

export const mockChatUsage: ChatUsageResponse = {
    data: trendData.map((d) => ({
        date: d.date,
        turns: d.chat_turns ?? 0,
        unique_users: Math.round(((d.chat_turns ?? 0) / 16) + 3),
        copilot_chat_turns: Math.round((d.chat_turns ?? 0) * 0.88),
    })),
    totals: {
        turns: TOTALS.chatTurns,
        unique_users: 86,
    },
};

// ─── Versions — percentages sum to 100 ────────────────────────────────────────

export const mockVersions: VersionsResponse = {
    data: [
        { version: '1.240.0', editor: 'VS Code', active_users: 44, percentage: 47.4 },
        { version: '1.239.2', editor: 'VS Code', active_users: 18, percentage: 19.4 },
        { version: '1.5.28', editor: 'JetBrains', active_users: 14, percentage: 15.1 },
        { version: '1.238.0', editor: 'VS Code', active_users: 9, percentage: 9.7 },
        { version: '1.5.27', editor: 'JetBrains', active_users: 5, percentage: 5.4 },
        { version: 'unknown', editor: 'Unknown', active_users: 3, percentage: 3.2 },
    ],
};

// ─── Full mock dataset ────────────────────────────────────────────────────────

export const mockDashboardData: DashboardData = {
    seatActivity: mockSeatActivity,
    usageSummary: mockUsageSummary,
    usageTrends: mockUsageTrends90,
    surfaceUsage: mockSurfaceUsage,
    editorUsage: mockEditorUsage,
    languageUsage: mockLanguageUsage,
    prReviewUsage: mockPRReviewUsage,
    chatUsage: mockChatUsage,
    versions: mockVersions,
    availableTeams: TEAMS,
};
