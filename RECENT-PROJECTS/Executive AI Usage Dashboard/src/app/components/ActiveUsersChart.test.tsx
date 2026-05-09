import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { ActiveUsersChart } from './ActiveUsersChart';

// Mock recharts because it doesn't play well with JSDOM out of the box
// We only need to verify that the data is passed correctly or that the container renders
vi.mock('recharts', () => {
    const OriginalModule = vi.importActual('recharts');
    return {
        ...OriginalModule,
        ResponsiveContainer: ({ children }: { children: React.ReactNode }) => <div data-testid="responsive-container">{children}</div>,
        BarChart: ({ children }: { children: React.ReactNode }) => <div data-testid="bar-chart">{children}</div>,
        Bar: () => <div data-testid="bar" />,
        XAxis: () => <div data-testid="x-axis" />,
        YAxis: () => <div data-testid="y-axis" />,
        CartesianGrid: () => <div data-testid="cartesian-grid" />,
        Tooltip: () => <div data-testid="tooltip" />,
        Legend: () => <div data-testid="legend" />,
        Cell: () => <div data-testid="cell" />,
    };
});

describe('ActiveUsersChart', () => {
    it('renders the chart title and description', () => {
        render(<ActiveUsersChart />);
        expect(screen.getByText('Observed Users by Tool')).toBeInTheDocument();
        expect(screen.getByText('Ranked by observed user counts. Context shown against allocated licenses.')).toBeInTheDocument();
    });

    it('renders the Slack AI data correctly', () => {
        render(<ActiveUsersChart />);
        expect(screen.getByText('Slack AI')).toBeInTheDocument();
        expect(screen.getByText('659')).toBeInTheDocument();
        expect(screen.getByText('Total active users')).toBeInTheDocument();
    });

    it('renders ChatGPT data correctly', () => {
        render(<ActiveUsersChart />);
        expect(screen.getByText('ChatGPT')).toBeInTheDocument();
        expect(screen.getByText('576')).toBeInTheDocument();
        expect(screen.getByText('Users with Activity (January)')).toBeInTheDocument();
    });
});
