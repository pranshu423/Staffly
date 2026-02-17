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
            case 'Applied': return 'bg-blue-100 text-blue-700 border-blue-200';
            case 'Screening': return 'bg-purple-100 text-purple-700 border-purple-200';
            case 'Interview': return 'bg-amber-100 text-amber-700 border-amber-200';
            case 'Offer': return 'bg-teal-100 text-teal-700 border-teal-200';
            case 'Hired': return 'bg-green-100 text-green-700 border-green-200';
            case 'Rejected': return 'bg-red-100 text-red-700 border-red-200';
            default: return 'bg-slate-100 text-slate-700 border-slate-200';
        }
    };

    return (
        <div ref={setNodeRef} className="flex flex-col w-80 h-full">
            <div className="flex items-center justify-between mb-4 p-1">
                <h3 className="font-bold text-slate-700">{title}</h3>
                <span className={clsx("px-2.5 py-0.5 rounded-full text-xs font-bold border", getStatusColor(title))}>
                    {count}
                </span>
            </div>
            <div className="flex-1 bg-slate-100/50 rounded-3xl p-3 space-y-3 overflow-y-auto border border-slate-200/60">
                {children}
            </div>
        </div>
    );
};
