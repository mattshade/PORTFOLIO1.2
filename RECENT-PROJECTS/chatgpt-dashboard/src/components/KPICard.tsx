import React, { useState } from 'react';
import type { LucideIcon } from 'lucide-react';
import { clsx } from 'clsx';
import { Info } from 'lucide-react';
import { InfoModal } from './InfoModal';

interface KPICardProps {
    title: string;
    value: string | number;
    subValue?: string;
    icon?: LucideIcon;
    trend?: 'up' | 'down' | 'neutral';
    trendValue?: string;
    color?: 'blue' | 'purple' | 'pink' | 'orange' | 'green';
    className?: string;
    info?: string;
}

const colorMap = {
    blue: 'bg-blue-500/10 text-blue-600 border-blue-200/50',
    purple: 'bg-purple-500/10 text-purple-600 border-purple-200/50',
    pink: 'bg-pink-500/10 text-pink-600 border-pink-200/50',
    orange: 'bg-orange-500/10 text-orange-600 border-orange-200/50',
    green: 'bg-emerald-500/10 text-emerald-600 border-emerald-200/50',
};

export const KPICard: React.FC<KPICardProps> = ({
    title,
    value,
    subValue,
    icon: Icon,
    trend,
    trendValue,
    color = 'blue',
    className,
    info
}) => {
    const [showModal, setShowModal] = useState(false);

    return (
        <>
            <div className={clsx("glass-card p-5 relative overflow-hidden group", className)}>
                <div className="flex justify-between items-start mb-2 relative z-10">
                    <div className="flex items-center gap-1.5 overflow-hidden">
                        <h3 className="text-sm font-medium text-gray-500 truncate">{title}</h3>
                        {info && (
                            <Info 
                                className="w-3.5 h-3.5 text-gray-400 cursor-pointer hover:text-gray-600 transition-colors" 
                                onClick={() => setShowModal(true)}
                            />
                        )}
                    </div>
                    {Icon && <Icon className={clsx("w-5 h-5 flex-shrink-0", colorMap[color].split(' ')[1])} />}
                </div>

            <div className="relative z-10">
                <div className="text-3xl font-bold text-gray-800 tracking-tight">{value}</div>
                {subValue && <div className="text-xs text-gray-500 mt-1 font-medium">{subValue}</div>}
            </div>

            {trend && (
                <div className={clsx("mt-3 text-xs font-semibold flex items-center gap-1",
                    trend === 'up' ? "text-green-600" : trend === 'down' ? "text-red-500" : "text-gray-400"
                )}>
                    {trend === 'up' && "↑"} {trend === 'down' && "↓"} {trendValue}
                </div>
            )}

            {/* Background decoration */}
            <div className={clsx("absolute -bottom-4 -right-4 w-24 h-24 rounded-full blur-2xl opacity-40 transition-opacity group-hover:opacity-60",
                color === 'blue' && 'bg-blue-300',
                color === 'purple' && 'bg-purple-300',
                color === 'pink' && 'bg-pink-300',
                color === 'orange' && 'bg-orange-300',
                color === 'green' && 'bg-emerald-300',
            )} />
        </div>
        
        {/* Info Modal */}
        {info && (
            <InfoModal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                title={title}
                content={info}
            />
        )}
        </>
    );
};
