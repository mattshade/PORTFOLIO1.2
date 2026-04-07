export interface PlatformRow {
    email: string;
    userStatus: 'enabled' | 'pending' | 'deleted' | string; // Normalized to lowercase
    isActive: boolean; // Computed from 1/0
    messages: number;
    toolsMessaged: number;
    gptsMessaged: number;
    projectsMessaged: number;
    projectsCreated: number;

    // Segment fields
    businessSegment: string;
    organization: string;
    parentOrg: string;
    bu: string;
    jobFunction: string;
    jobTitle: string;
}

export interface Meeting {
    id: string; // Hash
    title: string;
    dateStr: string; // Parsed from title
    dateObj?: Date;
    pageViews: number;
    registered: number;
    canceled: number;
    conversionRate: number;
    participants: Participant[];
    sourceFile: string;
}

export interface Participant {
    firstName: string;
    lastName: string;
    email: string;
    regTime: string;
    status: string;
    department: string;
    jobTitle: string;
    question: string;
    sourceFile: string;
}

export interface ValidationStats {
    platform: {
        totalRows: number;
        enabled: number;
        pending: number;
        deleted: number;
        mau: number;
        activeRate: number;
        totalMessages: number;
        avgMessages: number;
        toolsUsers: number;
        gptsUsers: number;
        projectsUsers: number;
        creators: number;
    };
    officeHours: {
        filesLoaded: number;
        meetingsDetected: number;
        totalViews: number;
        totalRegistered: number;
        conversionRate: number;
        duplicatesRemoved: number;
    };
}

export const VALIDATION_TARGETS = {
    platform: {
        totalRows: 820,
        enabled: 690,
        pending: 98,
        deleted: 32,
        mau: 576,
        activeRate: 83.48,
        totalMessages: 53647,
        avgMessages: 93.14,
        toolsUsers: 500,
        gptsUsers: 106,
        projectsUsers: 101,
        creators: 58
    },
    officeHours: {
        meetingsDetected: 4,
        totalViews: 39,
        totalRegistered: 25,
        conversionRate: 64.10
    }
};
