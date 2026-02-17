import React from 'react';
import { type LucideIcon } from 'lucide-react';
import { LoadingSkeleton } from '../ui/LoadingSkeleton';

interface StatsWidgetProps {
    title: string;
    icon: LucideIcon;
    children: React.ReactNode;
    fetching?: boolean;
}

const StatsWidget: React.FC<StatsWidgetProps> = ({ title, icon: Icon, children, fetching }) => {
    return (
        <div className="glass-card p-6 h-full flex flex-col justify-between">
            <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-bold text-slate-800">{title}</h3>
                <Icon className="w-5 h-5 text-slate-400" />
            </div>
            <div className="flex-1 flex flex-col justify-center">
                {fetching ? (
                    <div className="space-y-4">
                        <LoadingSkeleton count={2} />
                        <LoadingSkeleton height={30} width="60%" />
                    </div>
                ) : (
                    children
                )}
            </div>
        </div>
    );
};

export default StatsWidget;
