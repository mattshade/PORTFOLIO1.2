import React from 'react';
import { NavLink } from 'react-router-dom';
import {
    LayoutDashboard,
    Users,
    Activity,
    Video,
    Calendar,
    X,
    BarChart2
} from 'lucide-react';

const NAV_ITEMS = [
    { icon: BarChart2, label: "Executive View", path: "/executive" },
    { icon: LayoutDashboard, label: "Overview", path: "/" },
    { icon: Users, label: "Adoption", path: "/adoption" },
    { icon: Activity, label: "Engagement", path: "/engagement" },
    { icon: Video, label: "Office Hours", path: "/office-hours" },
];

interface SidebarProps {
    isOpen?: boolean;
    onClose?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen = false, onClose }) => {
    return (
        <>
            {/* Mobile Backdrop */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 md:hidden"
                    onClick={onClose}
                />
            )}

            <aside className={`
                w-64 fixed left-0 top-0 z-50 flex flex-col 
                bg-white/80 backdrop-blur-xl border border-white/50 shadow-lg
                transition-all duration-300 ease-in-out
                
                md:h-[calc(100vh-2rem)] md:rounded-r-2xl md:rounded-l-none md:m-4 md:translate-x-0
                
                h-full m-0 rounded-none border-r
                ${isOpen ? 'translate-x-0' : '-translate-x-full'}
            `}>
                <div className="flex items-center justify-between px-4 mb-8 mt-4 md:mt-2">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-white/50 backdrop-blur-md flex items-center justify-center p-1 shadow-sm border border-white/60">
                            <img src={`${import.meta.env.BASE_URL}assets/logo.png`} alt="Logo" className="w-full h-full object-contain" />
                        </div>
                        <div>
                            <h1 className="font-bold text-gray-800 text-sm leading-tight">ChatGPT</h1>
                            <p className="text-xs text-brand-primary font-medium">Enablement</p>
                        </div>
                    </div>
                    {/* Mobile Close Button */}
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-black/5 rounded-lg md:hidden text-gray-500"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <nav className="flex-1 space-y-1 px-4">
                    {NAV_ITEMS.map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            onClick={() => onClose && onClose()}
                            className={({ isActive }) => `
              flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group
              ${isActive
                                    ? 'bg-brand-primary/10 text-brand-primary shadow-sm border border-brand-primary/5'
                                    : 'text-gray-600 hover:bg-white/40 hover:text-gray-900'}
            `}
                        >
                            <item.icon className="w-5 h-5" />
                            <span className="font-medium text-sm">{item.label}</span>
                        </NavLink>
                    ))}
                </nav>

                <div className="mt-auto px-4 py-4 border-t border-gray-200/50 space-y-4">
                    <div>
                        <p className="text-[10px] uppercase tracking-wider text-gray-400 font-bold mb-1.5 flex items-center gap-1.5">
                            <Calendar className="w-3 h-3" />
                            Data Period
                        </p>
                        <p className="text-xs font-semibold text-gray-700 pl-4.5 border-l-2 border-brand-primary/30 pl-2">
                            January 2026
                        </p>
                    </div>
                </div>
            </aside>
        </>
    );
};
