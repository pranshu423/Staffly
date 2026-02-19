import { useDroppable } from '@dnd-kit/core';
import { clsx } from 'clsx';

interface Props {
    id: string;
    title: string;
    count: number;
    children: React.ReactNode;
}

export const DroppableColumn = ({ id, title, count, children }: Props) => {
    const { setNodeRef } = useDroppable({
        id
    });

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Applied': return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
            case 'Screening': return 'bg-purple-500/20 text-purple-300 border-purple-500/30';
            case 'Interview': return 'bg-amber-500/20 text-amber-300 border-amber-500/30';
            case 'Offer': return 'bg-teal-500/20 text-teal-300 border-teal-500/30';
            case 'Hired': return 'bg-green-500/20 text-green-300 border-green-500/30';
            case 'Rejected': return 'bg-red-500/20 text-red-300 border-red-500/30';
            default: return 'bg-slate-500/20 text-slate-300 border-slate-500/30';
        }
    };

    return (
        <div ref={setNodeRef} className="flex flex-col w-80 h-full">
            <div className="flex items-center justify-between mb-4 p-1">
                <h3 className="font-bold text-white tracking-wide">{title}</h3>
                <span className={clsx("px-2.5 py-0.5 rounded-lg text-xs font-bold border", getStatusColor(title))}>
                    {count}
                </span>
            </div>
            <div className="flex-1 bg-slate-900/40 rounded-[1.5rem] p-3 space-y-3 overflow-y-auto border border-white/5 custom-scrollbar backdrop-blur-sm">
                {children}
            </div>
        </div>
    );
};
