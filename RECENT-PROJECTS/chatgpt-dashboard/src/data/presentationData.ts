import type { PlatformRow, Meeting, Participant } from '../types';

// Helper to create rows
const createSegmentRows = (
    segment: string,
    totalEnabled: number,
    totalActive: number,
    totalMessages: number
): PlatformRow[] => {
    const rows: PlatformRow[] = [];

    // Distribute messages among active users
    // We start with floor average, then distribute remainder
    const baseMsg = totalActive > 0 ? Math.floor(totalMessages / totalActive) : 0;
    let remainder = totalActive > 0 ? totalMessages % totalActive : 0;

    for (let i = 0; i < totalEnabled; i++) {
        const isActive = i < totalActive;
        let msgCount = 0;

        if (isActive) {
            msgCount = baseMsg;
            if (remainder > 0) {
                msgCount += 1;
                remainder--;
            }
        }

        rows.push({
            email: `user${i}@${segment.replace(/\s/g, '').toLowerCase()}.com`,
            userStatus: 'enabled',
            isActive: isActive,
            messages: msgCount,
            toolsMessaged: 0,
            gptsMessaged: 0,
            projectsMessaged: 0,
            projectsCreated: 0,
            businessSegment: segment,
            organization: segment + " Org",
            parentOrg: "Enterprise",
            bu: "General",
            jobFunction: "Employee",
            jobTitle: "Staff"
        });
    }
    return rows;
};

// 1. Generate Base Segments (generic business units — mock data)
const segments = [
    { name: "Corporate HQ", enabled: 200, active: 175, msgs: 15000 },
    { name: "Regional Operations", enabled: 175, active: 140, msgs: 12000 },
    { name: "International Division", enabled: 150, active: 130, msgs: 18000 },
    { name: "Content & Editorial", enabled: 125, active: 100, msgs: 7000 },
    { name: "Media & Lifestyle", enabled: 5, active: 2, msgs: 50 },
];

let generatedRows: PlatformRow[] = [];
segments.forEach(s => {
    generatedRows = [...generatedRows, ...createSegmentRows(s.name, s.enabled, s.active, s.msgs)];
});

// 2. Distribute Feature Adoption
const assignFeature = (count: number, field: keyof PlatformRow) => {
    let assigned = 0;
    const shuffledIndices = Array.from({ length: generatedRows.length }, (_, i) => i)
        .sort(() => 0.5 - Math.random());

    for (let i of shuffledIndices) {
        if (assigned >= count) break;
        // @ts-ignore
        generatedRows[i][field] = 1;
        assigned++;
    }
};

assignFeature(480, 'toolsMessaged');
assignFeature(100, 'gptsMessaged');
assignFeature(95, 'projectsMessaged');
assignFeature(50, 'projectsCreated');

export const PRELOADED_PLATFORM_DATA = generatedRows;

// Helper to fill participants
const createDummyParticipants = (
    baseParticipants: Partial<Participant>[],
    countNeeded: number
): Participant[] => {
    const result: Participant[] = [];

    // Mix 1: Add Base Participants (Real samples)
    baseParticipants.forEach((p, i) => {
        result.push({
            firstName: p.firstName || "User",
            lastName: p.lastName || String(i + 1),
            email: p.email || `user${i}@company.com`,
            regTime: "2026-01-01T10:00:00",
            status: "Registered",
            department: p.department || "General",
            jobTitle: p.jobTitle || "Employee",
            question: p.question || "",
            sourceFile: "Preloaded"
        });
    });

    // Mix 2: Fill the rest with dummies
    const titles = ["Producer", "Editor", "Analyst", "Manager", "Director", "Coordinator", "Specialist"];
    const depts = ["Operations", "Product", "Marketing", "Finance", "Tech", "Legal", "Sales"];

    for (let i = result.length; i < countNeeded; i++) {
        result.push({
            firstName: "Participant",
            lastName: String(i + 1),
            email: `participant${i}@company.com`,
            regTime: "2026-01-01T10:00:00",
            status: "Registered",
            department: depts[i % depts.length],
            jobTitle: titles[i % titles.length],
            question: "", // No question for filler
            sourceFile: "Preloaded"
        });
    }

    return result;
}

// 3. Office Hours Data (mock)
export const PRELOADED_MEETINGS: Meeting[] = [
    {
        id: "dec-10-meet",
        title: "Office Hours - Dec 10: Prompt Engineering Basics",
        dateStr: "2025-12-10",
        dateObj: new Date("2025-12-10"),
        pageViews: 6,
        registered: 4,
        canceled: 0,
        conversionRate: 67,
        sourceFile: "Preloaded",
        participants: createDummyParticipants([
            { department: "Content", jobTitle: "Editor", question: "How to prompt for summaries?" }
        ], 4)
    },
    {
        id: "jan-21-meet",
        title: "Office Hours - Jan 21: Advanced Workflows",
        dateStr: "2026-01-21",
        dateObj: new Date("2026-01-21"),
        pageViews: 12,
        registered: 6,
        canceled: 0,
        conversionRate: 50,
        sourceFile: "Preloaded",
        participants: createDummyParticipants([
            { department: "Operations", jobTitle: "Producer", question: "Is Copilot better?" },
            { department: "Marketing", jobTitle: "Specialist", question: "Image generation rights?" }
        ], 6)
    },
    {
        id: "jan-27-meet",
        title: "Office Hours - Jan 27: Data Analysis",
        dateStr: "2026-01-27",
        dateObj: new Date("2026-01-27"),
        pageViews: 15,
        registered: 10,
        canceled: 0,
        conversionRate: 67,
        sourceFile: "Preloaded",
        participants: createDummyParticipants([
            { department: "Legal", jobTitle: "Counsel", question: "Governance on uploads?" },
            { department: "Content", jobTitle: "Writer", question: "Can it write in Spanish?" }
        ], 10)
    },
    {
        id: "feb-4-meet",
        title: "Office Hours - Feb 4: New Features",
        dateStr: "2026-02-04",
        dateObj: new Date("2026-02-04"),
        pageViews: 8,
        registered: 6,
        canceled: 0,
        conversionRate: 75,
        sourceFile: "Preloaded",
        participants: createDummyParticipants([
            { department: "Finance", jobTitle: "Analyst", question: "Measurement ROI?" }
        ], 6)
    }
];
