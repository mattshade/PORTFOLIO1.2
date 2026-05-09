import React, { useMemo } from 'react';
import { useData } from '../context/DataContext';

interface FilterState {
    segment: string;
    org: string;
    activeOnly: boolean;
}

interface FilterBarProps {
    filters: FilterState;
    setFilters: (f: FilterState) => void;
    showActiveOnly?: boolean;
}

export const FilterBar: React.FC<FilterBarProps> = ({ filters, setFilters, showActiveOnly = true }) => {
    const { platformRows } = useData();

    const segments = useMemo(() =>
        ['All', ...new Set(platformRows.map(m => m.businessSegment).filter(Boolean))].sort(),
        [platformRows]);

    return (
        <div className="flex flex-col md:flex-row md:items-center gap-3 p-3 md:p-3 rounded-xl bg-white/40 border border-white/50 backdrop-blur-sm">
            <div className="flex flex-col flex-1 md:flex-none">
                <label className="text-[10px] text-gray-500 font-semibold uppercase tracking-wider mb-1">Segment</label>
                <select
                    className="bg-white/70 border-none rounded-lg text-sm px-3 py-1.5 focus:ring-2 focus:ring-brand-primary/20 md:min-w-[160px]"
                    value={filters.segment}
                    onChange={(e) => setFilters({ ...filters, segment: e.target.value, org: 'All' })}
                >
                    {segments.map(s => <option key={String(s)} value={String(s)}>{String(s)}</option>)}
                </select>
            </div>

            {showActiveOnly && (
                <div className="flex items-center gap-3 bg-white/50 px-3 py-2 rounded-lg">
                    <span className="text-xs md:text-sm font-medium text-gray-700 whitespace-nowrap">Active Only</span>
                    <button
                        onClick={() => setFilters({ ...filters, activeOnly: !filters.activeOnly })}
                        className={`w-10 h-5 rounded-full p-0.5 transition-colors duration-200 ease-in-out shrink-0 ${filters.activeOnly ? 'bg-brand-primary' : 'bg-gray-300'}`}
                    >
                        <div className={`w-4 h-4 rounded-full bg-white shadow-sm transform transition-transform duration-200 ${filters.activeOnly ? 'translate-x-5' : 'translate-x-0'}`} />
                    </button>
                </div>
            )}
        </div>
    );
};
