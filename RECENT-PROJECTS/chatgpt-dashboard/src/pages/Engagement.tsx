import React, { useMemo, useState } from 'react';
import { useData } from '../context/DataContext';
import { FilterBar } from '../components/FilterBar';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Legend, LabelList } from 'recharts';
import { Sparkles } from 'lucide-react';
import { InfoModal } from '../components/InfoModal';

// Custom Tick for multi-line labels
const CustomTick = (props: any) => {
    const { x, y, payload } = props;
    const words = payload.value.split(' ');
    // Simple split logic: if more than 2 words, split in half
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

export const Engagement: React.FC = () => {
    // ... hooks ...
    const { platformRows } = useData();
    const [filters, setFilters] = useState({ segment: 'All', org: 'All', activeOnly: false });
    const [showChartModal, setShowChartModal] = useState(false);
    const [showMobileModals, setShowMobileModals] = useState<Record<number, boolean>>({});

    // Filter Logic
    const filteredRows = useMemo(() => {
        return platformRows.filter(r => {
            if (r.userStatus !== 'enabled') return false;
            if (filters.segment !== 'All' && r.businessSegment !== filters.segment) return false;
            if (filters.org !== 'All' && r.organization !== filters.org) return false;
            return true;
        });
    }, [platformRows, filters]);

    // Data for Charts
    const segmentData = useMemo(() => {
        const groups: Record<string, any> = {};

        filteredRows.forEach(r => {
            const key = r.businessSegment || 'Unassigned';
            if (!groups[key]) groups[key] = { segment: key, enabled: 0, active: 0, messages: 0, tools: 0, gpts: 0, projects: 0, creators: 0 };

            groups[key].enabled++;
            if (r.isActive) {
                groups[key].active++;
                groups[key].messages += r.messages;
            }
            if (r.toolsMessaged > 0) groups[key].tools++;
            if (r.gptsMessaged > 0) groups[key].gpts++;
            if (r.projectsMessaged > 0) groups[key].projects++;
            if (r.projectsCreated > 0) groups[key].creators++;
        });

        return Object.values(groups).map(g => ({
            ...g,
            avgMessages: g.active > 0 ? g.messages / g.active : 0,
            toolsRate: (g.tools / g.enabled) * 100,
            gptsRate: (g.gpts / g.enabled) * 100,
            projectsRate: (g.projects / g.enabled) * 100
        })).sort((a, b) => b.avgMessages - a.avgMessages);
    }, [filteredRows]);

    // Opportunity Finder Data
    // "High enabled base + low GPT/Projects adoption"
    const opportunities = useMemo(() => {
        const avgGptRate = segmentData.reduce((s, x) => s + x.gptsRate, 0) / (segmentData.length || 1);
        return segmentData.filter(s => s.enabled > 10 && s.gptsRate < avgGptRate).sort((a, b) => b.enabled - a.enabled);
    }, [segmentData]);

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
                <h2 className="text-2xl font-bold text-gray-900">Engagement & Feature Adoption</h2>
                <div className="md:max-w-md">
                    <FilterBar filters={filters} setFilters={setFilters} showActiveOnly={false} />
                </div>
            </div>

            {/* Executive Summary */}
            <div className="glass-card p-6 border-l-4 border-brand-primary">
                <h3 className="font-bold text-lg mb-2 text-gray-800 flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-brand-primary" />
                    Feature Engagement
                </h3>
                <p className="text-gray-600 leading-relaxed text-sm">
                    Users are moving beyond basic interactions.
                    Across the platform, <strong className="text-gray-900">{((segmentData.reduce((acc, curr) => acc + (curr.gptsRate * curr.enabled), 0) / platformRows.filter(r => r.userStatus === 'enabled').length) || 0).toFixed(1)}%</strong> of users are using Custom GPTs, while <strong>{((segmentData.reduce((acc, curr) => acc + (curr.projectsRate * curr.enabled), 0) / platformRows.filter(r => r.userStatus === 'enabled').length) || 0).toFixed(1)}%</strong> are leveraging Projects.
                    {opportunities.length > 0 ? (
                        <>
                            &nbsp;Specifically, <strong className="text-gray-900">{opportunities[0].segment}</strong> presents a key opportunity, having high enablement but lower feature adoption (<strong className="text-gray-900">{opportunities[0].gptsRate.toFixed(1)}%</strong> GPT Usage), identifying them as a prime candidate for "Level 2" training.
                        </>
                    ) : (
                        " Feature adoption is consistent across all major business segments."
                    )}
                </p>
            </div>

            {/* Avg Messages Chart */}
            <div className="glass-card p-6 mb-6">
                <h3 className="font-bold text-lg mb-4 text-gray-800">Average Messages per Active User</h3>

                {/* Desktop Chart */}
                <div className="hidden md:block h-64 w-full" style={{ pointerEvents: 'none' }}>
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={segmentData} margin={{ top: 24, right: 30, left: 20, bottom: 10 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                            <XAxis dataKey="segment" tick={<CustomTick />} interval={0} height={50} />
                            <YAxis tickFormatter={(value) => Math.round(value).toString()} tick={{ fontSize: 13 }} domain={[0, 'dataMax + 20']} />
                            <Bar dataKey="avgMessages" fill="#F472B6" radius={[4, 4, 0, 0]} name="Avg Messages" isAnimationActive={false}>
                                <LabelList dataKey="avgMessages" position="top" style={{ fontSize: 14, fill: '#111827', fontWeight: 600 }} formatter={(v: any) => Math.round(v)} />
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* Mobile List View */}
                <div className="md:hidden space-y-3">
                    {segmentData.map((d, i) => (
                        <div key={i} className="flex items-center justify-between p-2 bg-pink-50/50 rounded-lg">
                            <div className="flex items-center gap-3 overflow-hidden">
                                <div className="text-sm font-bold text-pink-500 w-4">{i + 1}</div>
                                <div className="text-sm font-medium text-gray-700 truncate">{d.segment}</div>
                            </div>
                            <div className="text-sm font-bold text-gray-800">{d.avgMessages.toFixed(1)} <span className="text-[10px] text-gray-400 font-normal">avg</span></div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Feature Adoption Stacked/Grouped */}
            <div className="glass-card p-6 mb-6">
                <h3 className="font-bold text-lg mb-4 text-gray-800 flex items-center gap-2">
                    Feature Adoption Rates (%) by Segment
                    <span 
                        className="cursor-pointer text-gray-400 hover:text-gray-600 transition-colors"
                        onClick={() => setShowChartModal(true)}
                    >
                        <Sparkles className="w-4 h-4" />
                    </span>
                </h3>

                {/* Desktop Chart */}
                <div className="hidden md:block h-80 w-full" style={{ pointerEvents: 'none' }}>
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={segmentData} margin={{ top: 24, right: 30, left: 20, bottom: 10 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                            <XAxis dataKey="segment" tick={<CustomTick />} interval={0} height={50} />
                            <YAxis unit="%" tickFormatter={(value) => Math.round(value).toString()} tick={{ fontSize: 13 }} domain={[0, 100]} />
                            <Legend wrapperStyle={{ paddingTop: '12px' }} />
                            <Bar dataKey="toolsRate" fill="#34D399" name="Tools" radius={[4, 4, 0, 0]} isAnimationActive={false}>
                                <LabelList dataKey="toolsRate" position="top" style={{ fontSize: 13, fill: '#111827', fontWeight: 600 }} formatter={(v: any) => `${Math.round(v)}%`} />
                            </Bar>
                            <Bar dataKey="gptsRate" fill="#60A5FA" name="Custom GPTs" radius={[4, 4, 0, 0]} isAnimationActive={false}>
                                <LabelList dataKey="gptsRate" position="top" style={{ fontSize: 13, fill: '#111827', fontWeight: 600 }} formatter={(v: any) => `${Math.round(v)}%`} />
                            </Bar>
                            <Bar dataKey="projectsRate" fill="#A78BFA" name="Projects" radius={[4, 4, 0, 0]} isAnimationActive={false}>
                                <LabelList dataKey="projectsRate" position="top" style={{ fontSize: 13, fill: '#111827', fontWeight: 600 }} formatter={(v: any) => `${Math.round(v)}%`} />
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* Mobile Cards View */}
                <div className="md:hidden grid grid-cols-1 gap-3">
                    {segmentData.map((d, i) => (
                        <div key={i} className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                            <div className="font-bold text-gray-800 text-sm mb-2 pb-1 border-b border-gray-200">{d.segment}</div>
                            <div className="grid grid-cols-3 gap-2 text-center">
                                <div className="bg-emerald-50 rounded p-1">
                                    <div 
                                        className="text-[10px] text-emerald-600 font-bold uppercase flex justify-center items-center gap-1 cursor-pointer"
                                        onClick={() => setShowMobileModals(prev => ({ ...prev, [i]: !prev[i] }))}
                                    >
                                        Tools
                                    </div>
                                    <div className="text-sm font-bold text-gray-800">{d.toolsRate.toFixed(0)}%</div>
                                </div>
                                <div className="bg-blue-50 rounded p-1">
                                    <div className="text-[10px] text-blue-600 font-bold uppercase">GPTs</div>
                                    <div className="text-sm font-bold text-gray-800">{d.gptsRate.toFixed(0)}%</div>
                                </div>
                                <div className="bg-purple-50 rounded p-1">
                                    <div className="text-[10px] text-purple-600 font-bold uppercase">Proj</div>
                                    <div className="text-sm font-bold text-gray-800">{d.projectsRate.toFixed(0)}%</div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Opportunity Finder - Only show if we have findings */}
            {opportunities.length > 0 && (
                <>
                    <h3 className="text-lg font-bold text-gray-800 mb-2">Opportunity Finder</h3>
                    <div className="glass-card overflow-hidden">
                        <div className="p-4 bg-yellow-50/50 border-b border-yellow-100 flex justify-between items-center">
                            <p className="text-sm text-yellow-800">Segments with enabled users but <strong>below-average</strong> GPT adoption.</p>
                            <span className="md:hidden text-[10px] text-yellow-800 bg-yellow-100/50 px-2 py-1 rounded-full whitespace-nowrap ml-2">← Scroll →</span>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-gray-50 uppercase text-xs text-gray-500 font-bold border-b border-gray-200">
                                    <tr>
                                        <th className="px-6 py-4">Segment</th>
                                        <th className="px-6 py-4 text-right">Enabled Base</th>
                                        <th className="px-6 py-4 text-right">GPT Adoption</th>
                                        <th className="px-6 py-4 text-right">Projects Adoption</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {opportunities.map((row, i) => (
                                        <tr key={i} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4 font-medium text-gray-800">{row.segment}</td>
                                            <td className="px-6 py-4 text-right">{row.enabled}</td>
                                            <td className="px-6 py-4 text-right text-red-500 font-bold">{row.gptsRate.toFixed(1)}%</td>
                                            <td className="px-6 py-4 text-right text-gray-600">{row.projectsRate.toFixed(1)}%</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </>
            )}
            
            {/* Info Modals */}
            <InfoModal
                isOpen={showChartModal}
                onClose={() => setShowChartModal(false)}
                title="Tools"
                content="Tools are advanced AI capabilities that extend ChatGPT's functionality including File Search (analyze documents), Code Interpreter (write & execute code), DALL-E (generate images), and Web Browsing (retrieve real-time information)."
            />
            
            {segmentData.map((_d, i) => (
                <InfoModal
                    key={i}
                    isOpen={showMobileModals[i] || false}
                    onClose={() => setShowMobileModals(prev => ({ ...prev, [i]: false }))}
                    title="Tools"
                    content="Advanced AI capabilities: File Search (analyze documents), Code Interpreter (write & execute code), DALL-E (generate images), and Web Browsing (retrieve real-time information)."
                />
            ))}
        </div>
    );
};
