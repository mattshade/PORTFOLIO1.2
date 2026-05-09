import React, { useMemo, useState } from 'react';
import { useData } from '../context/DataContext';
import { FilterBar } from '../components/FilterBar';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Sparkles } from 'lucide-react';

// Custom Tick for multi-line labels
const CustomTick = (props: any) => {
    const { x, y, payload } = props;
    const words = payload.value.split(' ');
    const line1 = words.slice(0, Math.ceil(words.length / 2)).join(' ');
    const line2 = words.slice(Math.ceil(words.length / 2)).join(' ');

    return (
        <g transform={`translate(${x},${y})`}>
            <text x={0} y={10} dy={16} textAnchor="middle" fill="#6B7280" fontSize={10}>
                <tspan x={0} dy="0em">{words.length > 2 ? line1 : payload.value}</tspan>
                {words.length > 2 && <tspan x={0} dy="1.2em">{line2}</tspan>}
            </text>
        </g>
    );
};

export const Adoption: React.FC = () => {
    const { platformRows } = useData();
    const [filters, setFilters] = useState({ segment: 'All', org: 'All', activeOnly: false });

    // Filter Data first (Global Filters)
    const baseData = useMemo(() => {
        return platformRows.filter(r => {
            if (filters.segment !== 'All' && r.businessSegment !== filters.segment) return false;
            if (filters.org !== 'All' && r.organization !== filters.org) return false;
            return true;
        });
    }, [platformRows, filters]);

    // Chart Data: Enabled vs Active by Business Segment
    const chartData = useMemo(() => {
        const groups: Record<string, { segment: string, enabled: number, active: number }> = {};

        baseData.forEach(r => {
            if (r.userStatus !== 'enabled') return; // Only count 'enabled' status rows for this chart
            const key = r.businessSegment || 'Unassigned';
            if (!groups[key]) groups[key] = { segment: key, enabled: 0, active: 0 };
            groups[key].enabled++;
            if (r.isActive) groups[key].active++;
        });

        return Object.values(groups).sort((a, b) => b.enabled - a.enabled);
    }, [baseData]);

    // Table Data: Detailed stats by Segment
    const tableData = useMemo(() => {
        const groups: Record<string, {
            segment: string,
            enabled: number,
            active: number,
            messages: number
        }> = {};

        baseData.forEach(r => {
            if (r.userStatus !== 'enabled') return;
            const key = r.businessSegment || 'Unassigned';
            if (!groups[key]) groups[key] = { segment: key, enabled: 0, active: 0, messages: 0 };
            groups[key].enabled++;
            if (r.isActive) {
                groups[key].active++;
                groups[key].messages += r.messages; // Messages only sum for active/enabled (implicit in data usually, but strictly active)
            }
        });

        return Object.values(groups)
            .map(g => ({
                ...g,
                activeRate: g.enabled > 0 ? (g.active / g.enabled) * 100 : 0,
                avgMessages: g.active > 0 ? g.messages / g.active : 0
            }))
            .sort((a, b) => b.activeRate - a.activeRate);
    }, [baseData]);

    // Insights with Guardrails
    const insights = useMemo(() => {
        // Filter out small segments
        const eligible = tableData.filter(d => d.enabled >= 25);

        // Highest Rate
        const highestRateData = [...eligible].sort((a, b) => b.activeRate - a.activeRate)[0];

        // Opportunity: Lowest rate OR rate < median. 
        // Simple logic: Lowest active rate among eligible
        const lowestRateData = [...eligible].sort((a, b) => a.activeRate - b.activeRate)[0];

        return { highest: highestRateData, lowest: lowestRateData };
    }, [tableData]);

    const { highest, lowest } = insights;

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
                <h2 className="text-2xl font-bold text-gray-900">Platform Adoption</h2>
                <div className="md:max-w-md">
                    <FilterBar filters={filters} setFilters={setFilters} showActiveOnly={false} />
                </div>
            </div>

            {/* Executive Summary */}
            <div className="glass-card p-6 border-l-4 border-brand-primary">
                <h3 className="font-bold text-lg mb-2 text-gray-800 flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-brand-primary" />
                    Adoption Analysis
                </h3>
                <p className="text-gray-600 leading-relaxed text-sm">
                    Adoption variances highlight clear enablement opportunities.
                    {highest ? (
                        <>
                            &nbsp;<strong className="text-gray-900">{highest.segment}</strong> is leading with an impressive <strong className="text-gray-900">{highest.activeRate.toFixed(1)}%</strong> active rate, setting the benchmark for other business units.
                        </>
                    ) : "Adoption is steady across segments."}
                    {lowest ? (
                        <>
                            &nbsp;Conversely, <strong className="text-gray-900">{lowest.segment}</strong> shows significant room for growth ({lowest.activeRate.toFixed(1)}%), suggesting a need for targeted "Chat 101" refresher sessions.
                        </>
                    ) : ""}
                </p>
            </div>

            {/* Chart */}
            <div className="glass-card p-6">
                <h3 className="font-bold text-lg mb-4 text-gray-800">Enabled vs Active Users by Segment</h3>

                {/* Desktop Chart */}
                <div className="hidden md:block h-80 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData} margin={{ top: 60, right: 30, left: 20, bottom: 30 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                            <XAxis
                                dataKey="segment"
                                tick={<CustomTick />}
                                interval={0}
                                height={50}
                            />
                            <YAxis tickFormatter={(value) => Math.round(value).toString()} tick={{ fontSize: 11 }} domain={[0, 'dataMax + 50']} />
                            <Tooltip
                                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                formatter={(value: any) => (typeof value === 'number' ? Math.round(value) : value)}
                            />
                            <Legend wrapperStyle={{ paddingTop: '20px' }} />
                            <Bar dataKey="enabled" name="Enabled" fill="#C7D2FE" stroke="#A5B4FC" radius={[4, 4, 0, 0]} />
                            <Bar dataKey="active" name="Active (MAU)" fill="#4F46E5" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* Mobile Simplified View */}
                <div className="md:hidden space-y-4">
                    {/* Show all segments for consistency */}
                    {chartData.sort((a, b) => b.active - a.active).map((d, i) => (
                        <div key={i} className="space-y-1">
                            <div className="flex justify-between items-center text-sm">
                                <span className="font-medium text-gray-700 truncate max-w-[60%]">{d.segment}</span>
                                <span className="text-brand-primary font-bold">{d.active} Active</span>
                            </div>
                            <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                                <div
                                    className="bg-brand-primary h-full rounded-full"
                                    style={{ width: `${(d.active / d.enabled) * 100}%` }}
                                />
                            </div>
                            <div className="flex justify-between text-[10px] text-gray-400">
                                <span>{d.enabled} Enabled</span>
                                <span>{((d.active / d.enabled) * 100).toFixed(0)}% Rate</span>
                            </div>
                        </div>
                    ))}
                    <div className="text-center text-xs text-gray-400 pt-2 border-t border-gray-100">
                        {/* Scroll for details in table below */}
                    </div>
                </div>
            </div>

            {/* Key Insights */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="glass-card p-6 bg-gradient-to-br from-green-50 to-emerald-50 border-green-100">
                    <div className="flex justify-between items-center mb-4">
                        <h4 className="text-sm font-bold text-green-800 uppercase">Detailed Breakdown</h4>
                        <span className="md:hidden text-[10px] text-green-600 bg-green-100 px-2 py-1 rounded-full flex items-center">
                            ← Scroll →
                        </span>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs text-gray-500 uppercase border-b border-gray-200 bg-green-100/30">
                                <tr>
                                    <th className="py-3 px-4 rounded-tl-lg">Segment</th>
                                    <th className="py-3 px-4 text-right">Enabled</th>
                                    <th className="py-3 px-4 text-right">Active</th>
                                    <th className="py-3 px-4 text-right">Rate</th>
                                    <th className="py-3 px-4 text-right rounded-tr-lg">Avg Msgs</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {tableData.map((row, i) => (
                                    <tr key={i} className="hover:bg-green-100/20 transition-colors">
                                        <td className="py-3 px-4 font-medium text-gray-700">{row.segment}</td>
                                        <td className="py-3 px-4 text-right text-gray-600">{row.enabled}</td>
                                        <td className="py-3 px-4 text-right text-gray-600">{row.active}</td>
                                        <td className="py-3 px-4 text-right font-bold text-brand-primary">{row.activeRate.toFixed(1)}%</td>
                                        <td className="py-3 px-4 text-right text-gray-600">{row.avgMessages.toFixed(1)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="glass-card p-6 flex flex-col justify-center">
                    <h4 className="text-sm font-bold text-gray-800 uppercase mb-4">Automated Insights</h4>
                    {highest ? (
                        <div className="mb-6">
                            <div className="text-xs text-brand-primary uppercase font-bold tracking-wider mb-1">Highest Active Rate</div>
                            <div className="text-2xl font-bold text-gray-900">{highest.segment}</div>
                            <div className="text-sm text-green-600 font-medium">
                                {highest.activeRate.toFixed(1)}% of enabled users are active
                            </div>
                            <div className="text-xs text-gray-400 mt-1">Based on {highest.enabled} enabled users</div>
                        </div>
                    ) : (
                        <div className="mb-6 text-gray-400 text-sm">No segments meet the threshold (25+ enabled) for insights.</div>
                    )}

                    {lowest && (
                        <div>
                            <div className="text-xs text-orange-500 uppercase font-bold tracking-wider mb-1">Enablement Opportunity</div>
                            <div className="text-2xl font-bold text-gray-900">{lowest.segment}</div>
                            <div className="text-sm text-orange-600 font-medium">
                                Lower adoption ({lowest.activeRate.toFixed(1)}%) compared to peers.
                            </div>
                            <div className="text-xs text-gray-400 mt-1">Target for training / awareness campaign.</div>
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
};
