import React, { useState, useMemo } from 'react';
import { useData } from '../context/DataContext';
import { MessageSquare, Hash, TrendingUp, Sparkles } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export const OfficeHours: React.FC = () => {
    const { meetings } = useData();
    const [selectedMeetingId, setSelectedMeetingId] = useState<string>('all');

    // Filter Logic
    const filteredMeetings = useMemo(() => {
        if (selectedMeetingId === 'all') return meetings;
        return meetings.filter(m => m.id === selectedMeetingId);
    }, [meetings, selectedMeetingId]);

    // Aggregate Participants
    const participants = useMemo(() => {
        return filteredMeetings.flatMap(m => m.participants.map(p => ({
            ...p,
            meetingTitle: m.title
        })));
    }, [filteredMeetings]);

    // Topic Grouping
    const topicGroups = useMemo(() => {
        const keywords = {
            "Prompt Engineering": /prompt/i,
            "Workflow Automation": /workflow|automat/i,
            "Projects & Custom GPTs": /project|gpt|custom/i,
            "Governance & Security": /govern|legal|policy|safe/i,
            "Image / Video Generation": /image|video|audio|dalle|sora/i,
            "Integrations": /integration|api|connect/i,
            "Copilot vs ChatGPT": /copilot|competitor/i,
            "Measurement & ROI": /measure|roi|kpi/i
        };

        const groups: Record<string, typeof participants> = {};

        participants.filter(p => p.question && p.question.trim().length > 0).forEach(p => {
            let matched = false;
            for (const [topic, regex] of Object.entries(keywords)) {
                if (regex.test(p.question)) {
                    if (!groups[topic]) groups[topic] = [];
                    groups[topic].push(p);
                    matched = true;
                    // Allow multi-tagging? For now, break on first match for simplicity in UI
                    break;
                }
            }
            if (!matched) {
                if (!groups["General Inquiry"]) groups["General Inquiry"] = [];
                groups["General Inquiry"].push(p);
            }
        });

        // Convert to array and sort by count
        return Object.entries(groups)
            .map(([topic, items]) => ({ topic, items }))
            .sort((a, b) => b.items.length - a.items.length);
    }, [participants]);

    // Chart Data: Registrations over time
    const timelineData = useMemo(() => {
        return meetings.map(m => ({
            date: m.dateStr,
            registered: m.registered,
            views: m.pageViews
        })).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    }, [meetings]);

    const redact = (text: string) => {
        if (!text) return "";
        return text.replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, '[EMAIL REDACTED]');
    };

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
                <h2 className="text-2xl font-bold text-gray-900">Office Hours Intelligence</h2>

                {/* Meeting Selector */}
                <div className="flex items-center gap-4 bg-white/40 p-2 rounded-xl border border-white/50 w-full md:w-auto">
                    <span className="text-xs font-bold text-gray-500 uppercase ml-2 whitespace-nowrap">Scope:</span>
                    <select
                        className="bg-transparent border-none text-sm font-medium focus:ring-0 text-gray-800 py-1 w-full md:w-auto"
                        value={selectedMeetingId}
                        onChange={(e) => setSelectedMeetingId(e.target.value)}
                    >
                        <option value="all">Global (All Meetings)</option>
                        {meetings.map(m => (
                            <option key={m.id} value={m.id}>{m.dateStr}: {m.title.substring(0, 30)}...</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Executive Summary */}
            <div className="glass-card p-6 border-l-4 border-brand-primary">
                <h3 className="font-bold text-lg mb-2 text-gray-800 flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-brand-primary" />
                    Session Intelligence
                </h3>
                <p className="text-gray-600 leading-relaxed text-sm">
                    Recent Office Hours sessions have driven high engagement in key areas like <strong>Prompt Engineering</strong> and <strong>Governance</strong>, which are the top recurring themes.
                    The conversion rate from page views to registrations reflects strong interest, with an average of <strong>{meetings.length > 0 ? (meetings.reduce((acc, m) => acc + m.conversionRate, 0) / meetings.length).toFixed(0) : 0}%</strong> across all recent sessions.
                    Participant questions suggest a maturing user base shifting focus towards advanced workflow automation.
                </p>
            </div>

            {/* Meeting Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {filteredMeetings.map(m => (
                    <div key={m.id} className="glass-card p-4 flex flex-col hover:shadow-md transition-all duration-200">
                        <div className="flex justify-between items-start mb-2">
                            <div className="bg-blue-50 text-blue-600 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide">{m.dateStr}</div>
                            <div className="text-xs font-mono text-gray-400">{m.conversionRate.toFixed(0)}% CONV</div>
                        </div>
                        <h4 className="font-bold text-gray-800 text-sm mb-3 leading-snug line-clamp-2" title={m.title}>{m.title}</h4>

                        <div className="mt-auto flex justify-between items-end border-t border-gray-100 pt-3 text-center">
                            <div className="flex flex-col items-start">
                                <span className="text-[10px] text-gray-400 uppercase font-bold">Views</span>
                                <span className="text-sm font-bold text-gray-700">{m.pageViews}</span>
                            </div>
                            <div className="flex flex-col items-center">
                                <span className="text-[10px] text-gray-400 uppercase font-bold">Reg</span>
                                <span className="text-sm font-bold text-brand-primary">{m.registered}</span>
                            </div>
                            <div className="flex flex-col items-end">
                                <span className="text-[10px] text-gray-400 uppercase font-bold">Attended</span>
                                {/* Mocking attendance as ~60% of reg for display logic if we had it, else showing Reg */}
                                <span className="text-sm font-bold text-gray-700">-</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Timeline Chart - Full Width */}
            <div className="glass-card p-6">
                <div className="flex items-center gap-2 mb-6">
                    <TrendingUp className="w-5 h-5 text-gray-400" />
                    <h3 className="font-bold text-lg text-gray-800">Registration Trend</h3>
                </div>
                <div className="h-48 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={timelineData} margin={{ top: 35, right: 30, left: 20, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                            <XAxis dataKey="date" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10 }} tickFormatter={(value) => Math.round(value).toString()} domain={[0, 'dataMax + 5']} />
                            <Tooltip
                                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                formatter={(value: any) => typeof value === 'number' ? Math.round(value) : value}
                            />
                            <Line type="monotone" dataKey="registered" stroke="#4F46E5" strokeWidth={3} dot={{ r: 4, fill: '#4F46E5', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 6 }} />
                            <Line type="monotone" dataKey="views" stroke="#94A3B8" strokeWidth={2} strokeDasharray="4 4" dot={false} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Trending Topics & Questions */}
            <div className="space-y-4">
                <div className="flex justify-between items-center px-2">
                    <div className="flex items-center gap-2">
                        <Hash className="w-5 h-5 text-brand-primary" />
                        <h3 className="font-bold text-xl text-gray-900">Top Questions by Theme</h3>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {topicGroups.map((group) => (
                        <div key={group.topic} className="glass-card flex flex-col overflow-hidden group">
                            <div className="p-4 border-b border-gray-100/50 bg-gradient-to-r from-white/50 to-white/10 flex justify-between items-center">
                                <h4 className="font-bold text-gray-800 text-sm truncate pr-2" title={group.topic}>{group.topic}</h4>
                                <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full text-xs font-bold">{group.items.length}</span>
                            </div>
                            <div className="p-0 bg-white/30 flex-1">
                                <ul className="divide-y divide-gray-50">
                                    {group.items.map((item, idx) => (
                                        <li key={idx} className="p-4 hover:bg-white/50 transition-colors">
                                            <div className="flex items-start gap-3">
                                                <MessageSquare className="w-4 h-4 text-brand-primary/40 mt-0.5 shrink-0" />
                                                <div className="space-y-1">
                                                    <p className="text-sm text-gray-700 italic leading-relaxed">"{redact(item.question)}"</p>

                                                    <div className="flex flex-wrap items-center gap-2 mt-2">
                                                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">{item.department}</span>
                                                        {item.jobTitle && (
                                                            <>
                                                                <span className="text-[10px] text-gray-300">•</span>
                                                                <span className="text-[10px] text-gray-400">{item.jobTitle}</span>
                                                            </>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    ))}

                    {topicGroups.length === 0 && (
                        <div className="col-span-full py-12 text-center text-gray-400 bg-white/30 rounded-2xl border border-dashed border-gray-300">
                            No questions found matching current filters.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
