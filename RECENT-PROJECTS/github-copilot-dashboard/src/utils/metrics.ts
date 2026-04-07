import { differenceInDays, parseISO } from 'date-fns';
import type { CopilotSeat, ActivityBucket, UsageTrendPoint } from '../types/api';

// ─── Seat enrichment ─────────────────────────────────────────────────────────

export function getDaysSince(dateStr: string | null): number {
    if (!dateStr) return Infinity;
    return differenceInDays(new Date(), parseISO(dateStr));
}

export function getBucket(daysSince: number): ActivityBucket {
    if (daysSince < 1) return '<1d';
    if (daysSince <= 7) return '1-7d';
    if (daysSince <= 30) return '8-30d';
    if (daysSince <= 90) return '31-90d';
    return 'inactive';
}

export function computeSeats(seats: CopilotSeat[]): CopilotSeat[] {
    return seats.map((seat) => {
        const days = getDaysSince(seat.last_activity_at);
        return {
            ...seat,
            days_since_activity: isFinite(days) ? days : undefined,
            bucket: getBucket(days),
        };
    });
}

// ─── Delta calculation ────────────────────────────────────────────────────────

export interface Delta {
    value: number;
    direction: 'up' | 'down' | 'flat';
    pct: number;
}

export function computeDelta(current: number, previous: number): Delta {
    if (previous === 0) return { value: current, direction: 'flat', pct: 0 };
    const diff = current - previous;
    const pct = (diff / previous) * 100;
    return {
        value: diff,
        direction: diff > 0 ? 'up' : diff < 0 ? 'down' : 'flat',
        pct: Math.abs(pct),
    };
}

export function getWoWDelta(data: UsageTrendPoint[], metric: keyof UsageTrendPoint): Delta {
    const len = data.length;
    if (len < 14) return { value: 0, direction: 'flat', pct: 0 };
    const thisWeek = data.slice(len - 7).reduce((s, d) => s + (Number(d[metric]) || 0), 0) / 7;
    const lastWeek = data.slice(len - 14, len - 7).reduce((s, d) => s + (Number(d[metric]) || 0), 0) / 7;
    return computeDelta(thisWeek, lastWeek);
}

export function getMoMDelta(data: UsageTrendPoint[], metric: keyof UsageTrendPoint): Delta {
    const len = data.length;
    if (len < 60) return { value: 0, direction: 'flat', pct: 0 };
    const thisMonth = data.slice(len - 30).reduce((s, d) => s + (Number(d[metric]) || 0), 0) / 30;
    const lastMonth = data.slice(len - 60, len - 30).reduce((s, d) => s + (Number(d[metric]) || 0), 0) / 30;
    return computeDelta(thisMonth, lastMonth);
}

// ─── Formatting ───────────────────────────────────────────────────────────────

export function fmt(n: number): string {
    if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
    if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
    return n.toLocaleString();
}

export function fmtPct(n: number, decimals = 1): string {
    return `${n.toFixed(decimals)}%`;
}

export function fmtDays(days: number | undefined): string {
    if (days === undefined) return 'Never';
    if (days < 1) return 'Today';
    if (days === 1) return '1 day ago';
    return `${days}d ago`;
}

// ─── Median ───────────────────────────────────────────────────────────────────

export function median(arr: number[]): number {
    if (!arr.length) return 0;
    const sorted = [...arr].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    return sorted.length % 2 === 0
        ? (sorted[mid - 1] + sorted[mid]) / 2
        : sorted[mid];
}

export function medianDaysSinca(seats: CopilotSeat[]): number {
    const days = seats
        .map((s) => s.days_since_activity)
        .filter((d): d is number => typeof d === 'number');
    return median(days);
}

// ─── Bucket counts ────────────────────────────────────────────────────────────

export function bucketCounts(seats: CopilotSeat[]): Record<ActivityBucket, number> {
    const counts: Record<ActivityBucket, number> = {
        '<1d': 0, '1-7d': 0, '8-30d': 0, '31-90d': 0, 'inactive': 0,
    };
    for (const seat of seats) {
        if (seat.bucket) counts[seat.bucket]++;
    }
    return counts;
}

// ─── Export helpers ───────────────────────────────────────────────────────────

export function seatsToCSV(seats: CopilotSeat[]): string {
    const headers = ['Login', 'Team', 'Last Activity', 'Days Since', 'Bucket', 'Surface', 'Editor'];
    const rows = seats.map((s) => [
        s.login,
        s.team ?? '',
        s.last_activity_at ?? 'Never',
        s.days_since_activity?.toString() ?? '',
        s.bucket ?? '',
        s.last_activity_surface ?? '',
        s.last_activity_editor ?? '',
    ]);
    return [headers, ...rows].map((r) => r.join(',')).join('\n');
}

export function downloadCSV(csv: string, filename: string) {
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
}
