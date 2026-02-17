import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Mail, Phone, Calendar } from 'lucide-react';

interface Candidate {
    _id: string;
    name: string;
    email: string;
    phone: string;
    position: string;
    status: string;
    createdAt: string;
}

interface Props {
    candidate: Candidate;
    isOverlay?: boolean;
}

export const SortableCandidateCard = ({ candidate, isOverlay = false }: Props) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ id: candidate._id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.4 : 1,
    };

    if (isOverlay) {
        return (
            <div className="glass-card p-4 shadow-xl border-blue-500/30 cursor-grabbing bg-white rotate-2 transform scale-105">
                <div className="flex justify-between items-start mb-2">
                    <h4 className="font-bold text-slate-800">{candidate.name}</h4>
                    <span className="text-xs font-bold px-2 py-1 bg-slate-100 rounded-lg text-slate-600">
                        {candidate.position}
                    </span>
                </div>
                <div className="space-y-1">
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                        <Mail className="w-3 h-3" />
                        {candidate.email}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                        <Phone className="w-3 h-3" />
                        {candidate.phone}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            className="glass-card p-4 hover:border-blue-400/50 group cursor-grab active:cursor-grabbing bg-white"
        >
            <div className="flex justify-between items-start mb-2">
                <h4 className="font-bold text-slate-800 group-hover:text-blue-600 transition-colors">{candidate.name}</h4>
            </div>
            <div className="mb-3">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 bg-slate-100 rounded-md text-slate-500">
                    {candidate.position}
                </span>
            </div>
            <div className="space-y-1.5 pt-2 border-t border-slate-100">
                <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    {candidate.email}
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    {candidate.phone}
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-400 mt-2">
                    <Calendar className="w-3.5 h-3.5" />
                    {new Date(candidate.createdAt).toLocaleDateString()}
                </div>
            </div>
        </div>
    );
};
