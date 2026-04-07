import { read, utils } from 'xlsx';
import Papa from 'papaparse';
import type { PlatformRow, Meeting, Participant } from '../types';
import { isValid } from 'date-fns';

// --- Utils ---
const normalize = (str: any) => String(str || '').trim();
const normalizeKey = (str: string) => str.trim().toLowerCase().replace(/['"“”‘’]/g, '');

// --- Excel Parser ---
export const parsePlatformExcel = async (file: File): Promise<PlatformRow[]> => {
    const data = await file.arrayBuffer();
    const workbook = read(data);

    const sheetName = workbook.SheetNames.find(n => n.toLowerCase() === 'platform data'); // "Platform Data" or "Usage Data"
    if (!sheetName) throw new Error("Missing required sheet: 'Platform Data'");

    const sheet = workbook.Sheets[sheetName];
    const rawRows: any[] = utils.sheet_to_json(sheet); // Assume headers are row 1

    return rawRows.map(r => {
        const userStatus = normalize(r['User Status'] || r['Status']).toLowerCase();
        // Logic: is_active is 1 or 0
        // If not present, default 0
        const isActive = (r['is_active'] == 1) || (String(r['is_active']).toLowerCase() === 'true');

        return {
            email: normalize(r['User Email'] || r['Email']),
            userStatus,
            isActive,
            messages: Number(r['messages'] || r['Messages'] || 0),
            toolsMessaged: Number(r['tools_messaged'] || r['Tools Messaged'] || 0),
            gptsMessaged: Number(r['gpts_messaged'] || r['GPTs Messaged'] || 0),
            projectsMessaged: Number(r['projects_messaged'] || r['Projects Messaged'] || 0),
            projectsCreated: Number(r['projects_created'] || r['Projects Created'] || 0),

            businessSegment: normalize(r['Business Segment']),
            organization: normalize(r['Organization']),
            parentOrg: normalize(r['Parent Organization']),
            bu: normalize(r['BU']),
            jobFunction: normalize(r['Job Function']),
            jobTitle: normalize(r['Job Title']),
        };
    });
};

// --- CSV Parser ---
// "Registration report (15).csv"
// UTF-16, Tab-delimited
// Sections: "1. Summary", "2. Participants"

export const parseOfficeHoursContext = async (files: File[]): Promise<{ meetings: Meeting[], duplicates: number }> => {
    const meetings: Meeting[] = [];
    let duplicates = 0;
    const meetingHashes = new Set<string>();

    for (const file of files) {
        const text = await readFileAsText(file, 'UTF-16');
        const lines = text.split(/\r?\n/);

        // Parse Summary
        let title = "";
        let views = 0;
        let registered = 0;
        let canceled = 0;

        let lineIdx = 0;
        // Scan for Summary
        let inSummary = false;

        // Very simple state machine
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();
            if (line.includes('1. Summary')) {
                inSummary = true;
                continue;
            }
            if (line.includes('2. Participants')) {
                inSummary = false;
                lineIdx = i; // Save where participants start
                break; // Stop parsing summary
            }

            if (inSummary) {
                const parts = lines[i].split('\t');
                const key = parts[0]?.trim();
                const val = parts[1]?.trim();
                if (!key) continue;

                if (key.includes('Meeting title')) title = val;
                // Handle "Registration page views"
                if (key.includes('Registration page views')) views = parseInt(val) || 0;
                if (key.includes('Registered participants')) registered = parseInt(val) || 0;
                if (key.includes('Canceled registrations')) canceled = parseInt(val) || 0;
            }
        }

        // Validate we found a meeting
        if (!title) continue; // Skip if no title

        // Deduping
        const hash = btoa(`${normalizeKey(title)}-${views}-${registered}-${canceled}`);
        if (meetingHashes.has(hash)) {
            duplicates++;
            continue;
        }
        meetingHashes.add(hash);

        // Parse Participants
        // We need to handle multi-line. We'll find the header index.
        // Ensure we start searching *after* the "2. Participants" marker if we found one, or just scan.
        let headerRowIdx = -1;
        for (let i = lineIdx; i < lines.length; i++) {
            if (lines[i].includes('Registration First Name')) {
                headerRowIdx = i;
                break;
            }
        }

        const partsList: Participant[] = [];

        if (headerRowIdx !== -1) {
            // Prepare content for PapaParse: join lines from headerRowIdx
            // But we need to handle "multi-line columns" which plain CSV parsers struggle with if not quoted properly.
            // The prompt says "tab-delimited... question column may contain line breaks".
            // PapaParse usually handles quoted fields with newlines if we pass the whole string.
            // We'll pass the substring from headerRowIdx to the end of the file.

            const rawCSV = lines.slice(headerRowIdx).join('\n');

            const parsed = Papa.parse(rawCSV, {
                header: true,
                delimiter: '\t',
                quoteChar: '"', // Spec says double-quote
                skipEmptyLines: true,
            });

            parsed.data.forEach((row: any) => {
                // Basic validation: ensure we have at least a status or email
                if (!row['Registration Status'] && !row['Registration Email']) return;

                partsList.push({
                    firstName: row['Registration First Name'] || 'Unknown',
                    lastName: row['Registration Last Name'] || 'Unknown',
                    email: row['Registration Email'] || '',
                    regTime: row['Registration Time'] || '',
                    status: row['Registration Status'] || '',
                    department: row['Department or Team'] || row['Department'] || 'Unassigned',
                    jobTitle: row['Job title'] || row['Job Title'] || 'Unknown',
                    question: row["What’s your question for ChatGPT Office Hours?"] || row['Question'] || '',
                    sourceFile: file.name
                });
            });
        }

        // Date Parsing from Title (e.g. "Dec. 10", "Jan. 21")
        let dateStr = "Unknown";
        let dateObj: Date | undefined;

        // Regex for Month Day
        const dateMatch = title.match(/(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z.]*\s+(\d{1,2})/i);
        if (dateMatch) {
            const month = dateMatch[1];
            const day = dateMatch[2];
            const year = month.toLowerCase().startsWith('dec') ? 2025 : 2026; // Infer year based on prompt context (Jan 2026 dataset)
            const d = new Date(`${month} ${day}, ${year}`);
            if (isValid(d)) {
                dateStr = d.toISOString().split('T')[0];
                dateObj = d;
            }
        }

        meetings.push({
            id: hash,
            title,
            dateStr,
            dateObj,
            pageViews: views,
            registered,
            canceled,
            conversionRate: views > 0 ? (registered / views) * 100 : 0,
            participants: partsList,
            sourceFile: file.name
        });
    }

    // Sort meetings by date
    meetings.sort((a, b) => {
        if (!a.dateObj) return 1;
        if (!b.dateObj) return -1;
        return a.dateObj.getTime() - b.dateObj.getTime();
    });

    return { meetings, duplicates };
};

const readFileAsText = (file: File, encoding: string): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target?.result as string);
        reader.onerror = (e) => reject(e);
        reader.readAsText(file, encoding);
    });
};
