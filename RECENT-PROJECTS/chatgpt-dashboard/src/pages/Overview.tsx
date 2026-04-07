import React, { useMemo, useState } from 'react';
import { useData } from '../context/DataContext';
import { KPICard } from '../components/KPICard';
import { FilterBar } from '../components/FilterBar';
import { Users, MessageSquare, Zap, Briefcase, Layers, FileText, Eye, UserPlus, XCircle, Activity } from 'lucide-react';

export const Overview: React.FC = () => {
    const { validationStats, platformRows, meetings } = useData();
    const [filters, setFilters] = useState({ segment: 'All', org: 'All', activeOnly: false });

    // const pStats = validationStats.platform; // Unused

    const ohStats = validationStats.officeHours;

    // Filter Logic for dynamic KPIs
    // Note: The top-level KPIs requested in prompt are GLOBAL unless filtered.
    // We will calculate them dynamically based on filters for the "Executive Overview content".

    const filteredRows = useMemo(() => {
        return platformRows.filter(r => {
            if (r.userStatus !== 'enabled') return false; // Default to enabled only for base metrics per prompt "from enabled users unless otherwise noted"
            if (filters.segment !== 'All' && r.businessSegment !== filters.segment) return false;
            if (filters.org !== 'All' && r.organization !== filters.org) return false;
            if (filters.activeOnly && !r.isActive) return false;
            return true;
        });
    }, [platformRows, filters]);

    // Computed KPIs based on filtered set
    const kpiEnabled = filteredRows.length;
    const kpiActive = filteredRows.filter(r => r.isActive).length;
    const kpiActiveRate = kpiEnabled > 0 ? (kpiActive / kpiEnabled) * 100 : 0;
    const kpiMessages = filteredRows.reduce((a, b) => a + b.messages, 0);
    const kpiAvgMessages = kpiActive > 0 ? kpiMessages / kpiActive : 0;

    const kpiTools = filteredRows.filter(r => r.toolsMessaged > 0).length;
    const kpiGpts = filteredRows.filter(r => r.gptsMessaged > 0).length;
    const kpiProjects = filteredRows.filter(r => r.projectsMessaged > 0).length;
    const kpiCreators = filteredRows.filter(r => r.projectsCreated > 0).length;

    // Calculate percentages relative to ENABLED base (as per prompt "Adoption rates... must use enabled users as denominator")
    const rateTools = kpiEnabled > 0 ? (kpiTools / kpiEnabled) * 100 : 0;
    const rateGpts = kpiEnabled > 0 ? (kpiGpts / kpiEnabled) * 100 : 0;
    const rateProjects = kpiEnabled > 0 ? (kpiProjects / kpiEnabled) * 100 : 0;
    const rateCreators = kpiEnabled > 0 ? (kpiCreators / kpiEnabled) * 100 : 0;

    // Identify Opportunity (Lowest performing large segment)
    const opportunitySegment = useMemo(() => {
        const groups: Record<string, { enabled: number, active: number }> = {};
        platformRows.forEach(r => {
            if (r.userStatus !== 'enabled') return;
            const seg = r.businessSegment || 'Unassigned';
            if (!groups[seg]) groups[seg] = { enabled: 0, active: 0 };
            groups[seg].enabled++;
            if (r.isActive) groups[seg].active++;
        });

        // Find segment with >25 enabled and lowest rate
        const eligible = Object.entries(groups)
            .map(([name, stats]) => ({
                name,
                rate: (stats.active / stats.enabled) * 100
            }))
            .filter(g => groups[g.name].enabled >= 25)
            .sort((a, b) => a.rate - b.rate);

        return eligible.length > 0 ? eligible[0] : null;
    }, [platformRows]);

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Overview</h2>
                    <p className="text-gray-500 text-sm mt-1">Platform performance &amp; Enablement impact (Jan 2026)</p>
                </div>
                <div className="md:max-w-md">
                    <FilterBar filters={filters} setFilters={setFilters} />
                </div>
            </div>

            {/* Executive Summary */}
            <div className="glass-card p-6 border-l-4 border-brand-primary">
                <h3 className="font-bold text-lg mb-2 text-gray-800 flex items-center gap-2">
                    <Activity className="w-5 h-5 text-brand-primary" />
                    Platform Pulse
                </h3>
                <p className="text-gray-600 leading-relaxed text-sm">
                    Platform adoption remains robust with <strong className="text-gray-900">{kpiEnabled.toLocaleString()} enabled users</strong> maintaining a healthy <strong className="text-gray-900">{kpiActiveRate.toFixed(1)}% active rate</strong>.
                    Engagement depth is increasing, evidenced by <strong className="text-gray-900">{rateGpts.toFixed(1)}%</strong> of users leveraging Custom GPTs.
                    {opportunitySegment && (
                        <>
                            However, an opportunity exists within <strong className="text-gray-900">{opportunitySegment.name}</strong>, which currently trails the average with a <strong>{opportunitySegment.rate.toFixed(1)}%</strong> utilization rate.
                        </>
                    )}
                </p>
            </div>

            {/* Platform Metrics */}
            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-2">Platform Adoption (Jan 2026)</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <KPICard title="Enabled Users" value={kpiEnabled.toLocaleString()} icon={Users} color="blue" />
                <KPICard title="Active Users (MAU)" value={kpiActive.toLocaleString()} subValue={`${kpiActiveRate.toFixed(2)}% Rate`} icon={Zap} color="purple" />
                <KPICard title="Total Messages" value={kpiMessages.toLocaleString()} icon={MessageSquare} color="orange" />
                <KPICard title="Avg Msgs / Active" value={kpiAvgMessages.toFixed(2)} icon={MessageSquare} color="pink" />
                {/* 5th slot empty or spacer */}
            </div>

            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mt-6 mb-2">Feature Depth (vs Enabled Base)</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <KPICard
                    title="Tools Adoption"
                    value={`${rateTools.toFixed(2)}%`}
                    subValue={`${kpiTools} Users`}
                    icon={Briefcase}
                    color="green"
                    info="Tools are advanced AI capabilities that extend ChatGPT's functionality: File Search (analyze documents), Code Interpreter (write & execute code), DALL-E (generate images), and Web Browsing (retrieve real-time information)."
                />
                <KPICard title="Custom GPTs" value={`${rateGpts.toFixed(2)}%`} subValue={`${kpiGpts} Users`} icon={FileText} color="blue" />
                <KPICard title="Projects Usage" value={`${rateProjects.toFixed(2)}%`} subValue={`${kpiProjects} Users`} icon={Layers} color="purple" />
                <KPICard title="Project Creators" value={`${rateCreators.toFixed(2)}%`} subValue={`${kpiCreators} Creators`} icon={Layers} color="orange" />
            </div>

            {/* Office Hours Section */}
            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mt-6 mb-2">Enablement: Office Hours</h3>
            <div className="glass-card p-6 bg-gradient-to-r from-blue-50/50 to-purple-50/50">
                <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
                    <div className="flex flex-col">
                        <span className="text-xs text-gray-500 font-bold uppercase">Sessions</span>
                        <span className="text-2xl font-bold text-gray-800 mt-1">{ohStats.meetingsDetected}</span>
                        <span className="text-xs text-gray-400 mt-1">Distinct Meetings</span>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-xs text-gray-500 font-bold uppercase">Total Views</span>
                        <span className="text-2xl font-bold text-gray-800 mt-1">{ohStats.totalViews}</span>
                        <Eye className="w-4 h-4 text-blue-400 mt-auto" />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-xs text-gray-500 font-bold uppercase">Registered</span>
                        <span className="text-2xl font-bold text-gray-800 mt-1">{ohStats.totalRegistered}</span>
                        <UserPlus className="w-4 h-4 text-green-400 mt-auto" />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-xs text-gray-500 font-bold uppercase">Canceled</span>
                        <span className="text-2xl font-bold text-gray-800 mt-1">{meetings.reduce((a, b) => a + b.canceled, 0)}</span>
                        <XCircle className="w-4 h-4 text-red-400 mt-auto" />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-xs text-gray-500 font-bold uppercase">View → Reg Conversion</span>
                        <span className="text-2xl font-bold text-brand-primary mt-1">{ohStats.conversionRate.toFixed(2)}%</span>
                        <div className="w-full bg-gray-200 h-1 mt-auto rounded-full overflow-hidden">
                            <div className="bg-brand-primary h-full" style={{ width: `${ohStats.conversionRate}%` }} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
