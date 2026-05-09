import React, { useMemo } from 'react';
import { useData } from '../context/DataContext';
import { KPICard } from '../components/KPICard';
import {
    Users, MessageSquare, Zap, Briefcase, FileText, Layers,
    TrendingUp, AlertCircle
} from 'lucide-react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid,
    ResponsiveContainer, Legend, LabelList
} from 'recharts';

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

export const ExecutiveView: React.FC = () => {
    const { platformRows } = useData();

    // All enabled users — no user-controlled filters on this view
    const enabledRows = useMemo(
        () => platformRows.filter(r => r.userStatus === 'enabled'),
        [platformRows]
    );

    // ── Top-level KPIs ─────────────────────────────────────────────────────────
    const kpiEnabled = enabledRows.length;
    const kpiActive = enabledRows.filter(r => r.isActive).length;
    const kpiActiveRate = kpiEnabled > 0 ? (kpiActive / kpiEnabled) * 100 : 0;
    const kpiMessages = enabledRows.reduce((a, b) => a + b.messages, 0);
    const kpiAvgMessages = kpiActive > 0 ? kpiMessages / kpiActive : 0;

    // ── Feature Depth ──────────────────────────────────────────────────────────
    const kpiTools = enabledRows.filter(r => r.toolsMessaged > 0).length;
    const kpiGpts = enabledRows.filter(r => r.gptsMessaged > 0).length;
    const kpiProjects = enabledRows.filter(r => r.projectsMessaged > 0).length;
    const kpiCreators = enabledRows.filter(r => r.projectsCreated > 0).length;

    const rateTools = kpiEnabled > 0 ? (kpiTools / kpiEnabled) * 100 : 0;
    const rateGpts = kpiEnabled > 0 ? (kpiGpts / kpiEnabled) * 100 : 0;
    const rateProjects = kpiEnabled > 0 ? (kpiProjects / kpiEnabled) * 100 : 0;
    const rateCreators = kpiEnabled > 0 ? (kpiCreators / kpiEnabled) * 100 : 0;

    // ── Segment data ───────────────────────────────────────────────────────────
    const segmentData = useMemo(() => {
        const groups: Record<string, {
            segment: string;
            enabled: number; active: number; messages: number;
            tools: number; gpts: number; projects: number;
        }> = {};

        enabledRows.forEach(r => {
            const key = r.businessSegment || 'Unassigned';
            if (!groups[key]) groups[key] = { segment: key, enabled: 0, active: 0, messages: 0, tools: 0, gpts: 0, projects: 0 };
            groups[key].enabled++;
            if (r.isActive) { groups[key].active++; groups[key].messages += r.messages; }
            if (r.toolsMessaged > 0) groups[key].tools++;
            if (r.gptsMessaged > 0) groups[key].gpts++;
            if (r.projectsMessaged > 0) groups[key].projects++;
        });

        return Object.values(groups).map(g => ({
            ...g,
            activeRate: g.enabled > 0 ? (g.active / g.enabled) * 100 : 0,
            avgMessages: g.active > 0 ? g.messages / g.active : 0,
            toolsRate: g.enabled > 0 ? (g.tools / g.enabled) * 100 : 0,
            gptsRate: g.enabled > 0 ? (g.gpts / g.enabled) * 100 : 0,
            projectsRate: g.enabled > 0 ? (g.projects / g.enabled) * 100 : 0,
        })).sort((a, b) => b.enabled - a.enabled);
    }, [enabledRows]);

    // ── Insights ───────────────────────────────────────────────────────────────
    const eligible = segmentData.filter(s => s.enabled >= 25);
    const topSegment = [...eligible].sort((a, b) => b.activeRate - a.activeRate)[0];
    const opportunitySegment = [...eligible].sort((a, b) => a.activeRate - b.activeRate)[0];

    const avgGptRate = segmentData.reduce((s, x) => s + x.gptsRate * x.enabled, 0) / (kpiEnabled || 1);
    const featureOpportunities = segmentData
        .filter(s => s.enabled > 10 && s.gptsRate < avgGptRate)
        .sort((a, b) => b.enabled - a.enabled);

    return (
        <div className="space-y-8">

            {/* ── Page Header ─────────────────────────────────────────────────── */}
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Executive Summary</h2>
                    <p className="text-gray-500 text-sm mt-1">Platform usage snapshot · January 2026</p>
                </div>
                <span className="text-xs font-semibold uppercase tracking-wider text-brand-primary bg-brand-primary/10 px-3 py-1 rounded-full self-start sm:self-auto">
                    All Segments
                </span>
            </div>

            {/* ── AI Portfolio Comparison ──────────────────────────────────────── */}
            <section className="glass-card overflow-hidden">
                <div className="px-6 pt-5 pb-3 border-b border-gray-100">
                    <h3 className="font-bold text-base text-gray-800">Enterprise AI Portfolio</h3>
                    <p className="text-xs text-gray-400 mt-0.5">License utilization across active AI platforms</p>
                </div>
                <div className="divide-y divide-gray-100">
                    {([
                        {
                            name: 'Adobe Firefly', label: 'Licenses Purchased', licensed: 498, active: 317, rate: 64, color: '#EA1111',
                            logo: (
                                <div className="w-8 h-8 rounded-lg bg-white shadow-sm border border-gray-100 flex items-center justify-center p-1 overflow-hidden shrink-0">
                                    <img src={`${import.meta.env.BASE_URL}assets/firefly.png`} alt="Adobe Firefly" className="w-full h-full object-contain"/>
                                </div>
                            ),
                        },
                        {
                            name: 'GitHub Copilot', label: 'Seats Allocated', licensed: 176, active: 124, rate: 70, color: '#24292E',
                            logo: (
                                <div className="w-8 h-8 rounded-lg bg-white shadow-sm border border-gray-100 flex items-center justify-center p-1 overflow-hidden shrink-0">
                                    <img src={`${import.meta.env.BASE_URL}assets/github-copilot.png`} alt="GitHub Copilot" className="w-full h-full object-contain"/>
                                </div>
                            ),
                        },
                        {
                            name: 'Microsoft Copilot', label: 'Paid Licenses', licensed: 328, active: 315, rate: 96, color: '#0078D4',
                            logo: (
                                <div className="w-8 h-8 rounded-lg bg-white shadow-sm border border-gray-100 flex items-center justify-center overflow-hidden shrink-0">
                                    <img src={`${import.meta.env.BASE_URL}assets/ms-copilot.png`} alt="Microsoft Copilot" className="w-9 h-9 object-contain"/>
                                </div>
                            ),
                        },
                        {
                            name: 'ChatGPT', label: 'Licenses Allocated', licensed: 690, active: 576, rate: 83, color: '#4F46E5',
                            logo: (
                                <div className="w-8 h-8 rounded-lg bg-white shadow-sm border border-gray-100 flex items-center justify-center overflow-hidden">
                                    <img src={`${import.meta.env.BASE_URL}assets/logo.png`} alt="ChatGPT" className="w-9 h-9 object-contain"/>
                                </div>
                            ),
                        },
                    ] as const).map((tool, i) => (
                        <div key={i} className="flex items-center gap-4 px-6 py-3">
                            {/* Logo + name */}
                            <div className="flex items-center gap-3 w-52 shrink-0">
                                {tool.logo}
                                <span className="text-sm font-semibold text-gray-800">{tool.name}</span>
                            </div>
                            {/* Licensed */}
                            <div className="w-28 shrink-0">
                                <div className="text-[10px] text-gray-400 uppercase tracking-wide">{tool.label}</div>
                                <div className="text-sm font-bold text-gray-700">{tool.licensed.toLocaleString()}</div>
                            </div>
                            {/* Active */}
                            <div className="w-24 shrink-0">
                                <div className="text-[10px] text-gray-400 uppercase tracking-wide">Active Users</div>
                                <div className="text-sm font-bold text-gray-700">{tool.active.toLocaleString()}</div>
                            </div>
                            {/* Utilization bar */}
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                    <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                                        <div className="h-full rounded-full" style={{ width: `${tool.rate}%`, backgroundColor: tool.color }} />
                                    </div>
                                    <span className="text-sm font-bold w-10 text-right shrink-0" style={{ color: tool.color }}>
                                        {tool.rate}%
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* ── ChatGPT Pulse ───────────────────────────────────────────────── */}
            <div className="glass-card p-6 border-l-4 border-brand-primary">
                <h3 className="font-bold text-lg mb-2 text-gray-800 flex items-center gap-1">
                    <img src={`${import.meta.env.BASE_URL}assets/logo.png`} alt="ChatGPT" className="w-8 h-8 object-contain" />
                    ChatGPT Pulse
                </h3>
                <p className="text-gray-600 leading-relaxed text-sm">
                    The platform closed January 2026 with{' '}
                    <strong className="text-gray-900">{kpiEnabled.toLocaleString()} enabled users</strong>,
                    of whom <strong className="text-gray-900">{kpiActive.toLocaleString()} ({kpiActiveRate.toFixed(1)}%)</strong> were
                    active in the month — generating a combined{' '}
                    <strong className="text-gray-900">{kpiMessages.toLocaleString()} messages</strong> at an
                    average of <strong className="text-gray-900">{kpiAvgMessages.toFixed(1)} msgs/active user</strong>.
                    Feature depth is growing, with <strong className="text-gray-900">{rateGpts.toFixed(1)}%</strong> of
                    enabled users leveraging Custom GPTs and <strong className="text-gray-900">{rateTools.toFixed(1)}%</strong> adopting
                    AI Tools.
                    {topSegment && (
                        <> <strong className="text-gray-900">{topSegment.segment}</strong> leads
                            active-user rate at <strong className="text-gray-900">{topSegment.activeRate.toFixed(1)}%</strong>.</>
                    )}
                    {opportunitySegment && opportunitySegment.segment !== topSegment?.segment && (
                        <> <strong className="text-orange-600">{opportunitySegment.segment}</strong> represents
                            the highest-priority engagement opportunity at <strong>{opportunitySegment.activeRate.toFixed(1)}%</strong> active rate.</>
                    )}
                </p>
            </div>

            {/* ── Usage KPIs ──────────────────────────────────────────────────── */}
            <section>
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Usage Overview</h3>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    <KPICard title="Enabled Users" value={kpiEnabled.toLocaleString()} icon={Users} color="blue" />
                    <KPICard title="Active Users (MAU)" value={kpiActive.toLocaleString()} subValue={`${kpiActiveRate.toFixed(1)}% active rate`} icon={Zap} color="purple" />
                    <KPICard title="Active Rate" value={`${kpiActiveRate.toFixed(1)}%`} subValue={`${kpiEnabled - kpiActive} not yet active`} icon={TrendingUp} color="green" />
                    <KPICard title="Total Messages" value={kpiMessages.toLocaleString()} icon={MessageSquare} color="orange" />
                    <KPICard title="Avg Msgs / Active" value={kpiAvgMessages.toFixed(1)} icon={MessageSquare} color="pink" />
                </div>
            </section>

            {/* ── Feature Depth ───────────────────────────────────────────────── */}
            <section>
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Feature Adoption (% of Enabled Users)</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <KPICard
                        title="Tools"
                        value={`${rateTools.toFixed(1)}%`}
                        subValue={`${kpiTools.toLocaleString()} users`}
                        icon={Briefcase}
                        color="green"
                    />
                    <KPICard title="Custom GPTs" value={`${rateGpts.toFixed(1)}%`} subValue={`${kpiGpts.toLocaleString()} users`} icon={FileText} color="blue" />
                    <KPICard title="Projects" value={`${rateProjects.toFixed(1)}%`} subValue={`${kpiProjects.toLocaleString()} users`} icon={Layers} color="purple" />
                    <KPICard title="Project Creators" value={`${rateCreators.toFixed(1)}%`} subValue={`${kpiCreators.toLocaleString()} creators`} icon={Layers} color="orange" />
                </div>
                <div className="flex flex-row gap-6 mt-3">
                    <p className="text-xs text-gray-500 flex-1"><span className="font-semibold text-emerald-600">Tools —</span> File Search, Code Interpreter, DALL·E &amp; Web Browsing</p>
                    <p className="text-xs text-gray-500 flex-1"><span className="font-semibold text-blue-600">Custom GPTs —</span> Purpose-built AI assistants for specific tasks or workflows</p>
                    <p className="text-xs text-gray-500 flex-1"><span className="font-semibold text-purple-600">Projects —</span> Persistent workspaces that retain context &amp; files across conversations</p>
                </div>
            </section>

            {/* ── Adoption by Segment Chart ────────────────────────────────────── */}
            <section className="glass-card p-6">
                <h3 className="font-bold text-base text-gray-800 mb-5">Enabled vs Active Users by Segment</h3>

                {/* Desktop */}
                <div className="hidden md:block h-48" style={{ pointerEvents: 'none' }}>
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={segmentData} margin={{ top: 24, right: 20, left: 10, bottom: 10 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                            <XAxis dataKey="segment" tick={<CustomTick />} interval={0} height={55} />
                            <YAxis tickFormatter={v => Math.round(v).toString()} tick={{ fontSize: 13 }} domain={[0, 'dataMax + 50']} />
                            <Legend wrapperStyle={{ paddingTop: '12px' }} />
                            <Bar dataKey="enabled" name="Enabled" fill="#C7D2FE" stroke="#A5B4FC" radius={[4, 4, 0, 0]} isAnimationActive={false}>
                                <LabelList dataKey="enabled" position="top" style={{ fontSize: 14, fill: '#6B7280', fontWeight: 600 }} formatter={(v: any) => Math.round(v)} />
                            </Bar>
                            <Bar dataKey="active" name="Active (MAU)" fill="#4F46E5" radius={[4, 4, 0, 0]} isAnimationActive={false}>
                                <LabelList dataKey="active" position="top" style={{ fontSize: 14, fill: '#4F46E5', fontWeight: 600 }} formatter={(v: any) => Math.round(v)} />
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* Mobile */}
                <div className="md:hidden space-y-3">
                    {segmentData.map((d, i) => (
                        <div key={i} className="space-y-1">
                            <div className="flex justify-between text-sm">
                                <span className="font-medium text-gray-700 truncate max-w-[60%]">{d.segment}</span>
                                <span className="text-brand-primary font-bold">{d.activeRate.toFixed(0)}% active</span>
                            </div>
                            <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                                <div className="bg-brand-primary h-full rounded-full" style={{ width: `${d.activeRate}%` }} />
                            </div>
                            <div className="flex justify-between text-[10px] text-gray-400">
                                <span>{d.enabled} enabled</span>
                                <span>{d.active} active</span>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* ── Feature Adoption by Segment Chart ──────────────────────────── */}
            <section className="glass-card p-6">
                <h3 className="font-bold text-base text-gray-800 mb-5">Feature Adoption Rates by Segment (%)</h3>

                {/* Desktop */}
                <div className="hidden md:block h-48" style={{ pointerEvents: 'none' }}>
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={segmentData} margin={{ top: 24, right: 20, left: 10, bottom: 10 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                            <XAxis dataKey="segment" tick={<CustomTick />} interval={0} height={55} />
                            <YAxis unit="%" tickFormatter={v => Math.round(v).toString()} tick={{ fontSize: 13 }} domain={[0, 100]} />
                            <Legend wrapperStyle={{ paddingTop: '12px' }} />
                            <Bar dataKey="toolsRate" name="Tools" fill="#34D399" radius={[4, 4, 0, 0]} isAnimationActive={false}>
                                <LabelList dataKey="toolsRate" position="top" style={{ fontSize: 13, fill: '#059669', fontWeight: 600 }} formatter={(v: any) => `${Math.round(v)}%`} />
                            </Bar>
                            <Bar dataKey="gptsRate" name="Custom GPTs" fill="#60A5FA" radius={[4, 4, 0, 0]} isAnimationActive={false}>
                                <LabelList dataKey="gptsRate" position="top" style={{ fontSize: 13, fill: '#2563EB', fontWeight: 600 }} formatter={(v: any) => `${Math.round(v)}%`} />
                            </Bar>
                            <Bar dataKey="projectsRate" name="Projects" fill="#A78BFA" radius={[4, 4, 0, 0]} isAnimationActive={false}>
                                <LabelList dataKey="projectsRate" position="top" style={{ fontSize: 13, fill: '#7C3AED', fontWeight: 600 }} formatter={(v: any) => `${Math.round(v)}%`} />
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* Mobile */}
                <div className="md:hidden grid gap-3">
                    {segmentData.map((d, i) => (
                        <div key={i} className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                            <div className="font-semibold text-gray-800 text-sm mb-2">{d.segment}</div>
                            <div className="grid grid-cols-3 gap-2 text-center text-sm">
                                <div className="bg-emerald-50 rounded-lg p-2">
                                    <div className="text-[10px] text-emerald-600 font-bold uppercase">Tools</div>
                                    <div className="font-bold text-gray-800">{d.toolsRate.toFixed(0)}%</div>
                                </div>
                                <div className="bg-blue-50 rounded-lg p-2">
                                    <div className="text-[10px] text-blue-600 font-bold uppercase">GPTs</div>
                                    <div className="font-bold text-gray-800">{d.gptsRate.toFixed(0)}%</div>
                                </div>
                                <div className="bg-purple-50 rounded-lg p-2">
                                    <div className="text-[10px] text-purple-600 font-bold uppercase">Proj</div>
                                    <div className="font-bold text-gray-800">{d.projectsRate.toFixed(0)}%</div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* ── Segment Breakdown Table ─────────────────────────────────────── */}
            <section className="glass-card overflow-hidden">
                <div className="px-6 pt-5 pb-3 border-b border-gray-100">
                    <h3 className="font-bold text-base text-gray-800">Segment Breakdown</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-gray-50 text-xs text-gray-500 uppercase border-b border-gray-100">
                            <tr>
                                <th className="px-6 py-3">Segment</th>
                                <th className="px-6 py-3 text-right">Enabled</th>
                                <th className="px-6 py-3 text-right">Active</th>
                                <th className="px-6 py-3 text-right">Active Rate</th>
                                <th className="px-6 py-3 text-right">Avg Msgs</th>
                                <th className="px-6 py-3 text-right">Tools %</th>
                                <th className="px-6 py-3 text-right">GPTs %</th>
                                <th className="px-6 py-3 text-right">Projects %</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {[...segmentData].sort((a, b) => b.activeRate - a.activeRate).map((row, i) => (
                                <tr key={i} className="hover:bg-gray-50/60 transition-colors">
                                    <td className="px-6 py-3 font-medium text-gray-800">{row.segment}</td>
                                    <td className="px-6 py-3 text-right text-gray-600">{row.enabled}</td>
                                    <td className="px-6 py-3 text-right text-gray-600">{row.active}</td>
                                    <td className="px-6 py-3 text-right font-bold text-brand-primary">{row.activeRate.toFixed(1)}%</td>
                                    <td className="px-6 py-3 text-right text-gray-600">{row.avgMessages.toFixed(1)}</td>
                                    <td className="px-6 py-3 text-right text-emerald-600">{row.toolsRate.toFixed(1)}%</td>
                                    <td className="px-6 py-3 text-right text-blue-600">{row.gptsRate.toFixed(1)}%</td>
                                    <td className="px-6 py-3 text-right text-purple-600">{row.projectsRate.toFixed(1)}%</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </section>

            {featureOpportunities.length > 0 && (
                <section className="glass-card p-6 border-l-4 border-orange-400 bg-orange-50/30">
                    <h3 className="font-bold text-base text-gray-800 flex items-center gap-2 mb-3">
                        <AlertCircle className="w-5 h-5 text-orange-500" />
                        Engagement Opportunities
                    </h3>
                    <p className="text-sm text-gray-600 mb-4">
                        Segments with above-average enablement but below-average Custom GPT adoption — prime candidates for targeted "Level 2" training.
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                        {featureOpportunities.slice(0, 6).map((seg, i) => (
                            <div key={i} className="bg-white/60 rounded-xl p-4 border border-orange-100">
                                <div className="font-semibold text-gray-800 text-sm mb-1">{seg.segment}</div>
                                <div className="text-xs text-gray-500">{seg.enabled} enabled users</div>
                                <div className="flex gap-3 mt-2 text-xs font-semibold">
                                    <span className="text-blue-600">GPTs: {seg.gptsRate.toFixed(1)}%</span>
                                    <span className="text-purple-600">Proj: {seg.projectsRate.toFixed(1)}%</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            )}

        </div>
    );
};
