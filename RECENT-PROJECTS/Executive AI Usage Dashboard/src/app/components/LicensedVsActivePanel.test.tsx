import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { LicensedVsActivePanel } from './LicensedVsActivePanel';

vi.mock('recharts', () => {
    return {
        ResponsiveContainer: ({ children }: { children: React.ReactNode }) => <div data-testid="responsive-container">{children}</div>,
        BarChart: ({ children }: { children: React.ReactNode }) => <div data-testid="bar-chart">{children}</div>,
        Bar: () => <div data-testid="bar" />,
        XAxis: () => <div data-testid="x-axis" />,
        YAxis: () => <div data-testid="y-axis" />,
        CartesianGrid: () => <div data-testid="cartesian-grid" />,
        Tooltip: () => <div data-testid="tooltip" />,
        Legend: () => <div data-testid="legend" />,
    };
});

describe('LicensedVsActivePanel', () => {
    it('renders the panel title and total allocated seats', () => {
        render(<LicensedVsActivePanel />);
        expect(screen.getByText('GitHub Copilot Seats by Segment')).toBeInTheDocument();

        // Total Allocated calculation: 45 (Corporate HQ) + 87 (Regional Operations) + 44 (International Division) = 176
        expect(screen.getByText('176')).toBeInTheDocument();
        expect(screen.getByText('Seats Allocated')).toBeInTheDocument();
    });

    it('renders the active users count', () => {
        render(<LicensedVsActivePanel />);
        // Total Active calculation: 32 + 65 + 27 = 124
        expect(screen.getByText('124')).toBeInTheDocument();
        expect(screen.getByText('Active Users')).toBeInTheDocument();
    });

    it('renders the segment data rows', () => {
        render(<LicensedVsActivePanel />);
        expect(screen.getByText('Corporate HQ')).toBeInTheDocument();
        expect(screen.getByText('32 of 45')).toBeInTheDocument();

        expect(screen.getByText('Regional Operations')).toBeInTheDocument();
        expect(screen.getByText('65 of 87')).toBeInTheDocument();

        expect(screen.getByText('International Division')).toBeInTheDocument();
        expect(screen.getByText('27 of 44')).toBeInTheDocument();
    });
});
