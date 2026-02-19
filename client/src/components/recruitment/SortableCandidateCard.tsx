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
            <div className="glass-card p-4 shadow-xl border-blue-500/50 cursor-grabbing !bg-slate-800 rotate-2 transform scale-105">
                <div className="flex justify-between items-start mb-2">
                    <h4 className="font-bold text-white">{candidate.name}</h4>
                    <span className="text-xs font-bold px-2 py-1 bg-white/10 rounded-lg text-slate-300 border border-white/5">
                        {candidate.position}
                    </span>
                </div>
                <div className="space-y-1">
                    <div className="flex items-center gap-2 text-xs text-slate-400">
                        <Mail className="w-3 h-3" />
                        {candidate.email}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-400">
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
            className="glass-card p-4 hover:border-blue-500/30 group cursor-grab active:cursor-grabbing !bg-slate-900/60 hover:!bg-slate-900/80 transition-all hover:shadow-lg hover:shadow-blue-500/5 hover:-translate-y-1"
        >
            <div className="flex justify-between items-start mb-2">
                <h4 className="font-bold text-slate-200 group-hover:text-blue-400 transition-colors tracking-tight">{candidate.name}</h4>
            </div>
            <div className="mb-3">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 bg-white/5 rounded-md text-slate-400 border border-white/5 group-hover:border-white/10 transition-colors">
                    {candidate.position}
                </span>
            </div>
            <div className="space-y-1.5 pt-3 border-t border-white/5">
                <div className="flex items-center gap-2 text-xs text-slate-400 font-medium group-hover:text-slate-300 transition-colors">
                    <Mail className="w-3.5 h-3.5 text-slate-500 group-hover:text-blue-400/70 transition-colors" />
                    {candidate.email}
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-400 font-medium group-hover:text-slate-300 transition-colors">
                    <Phone className="w-3.5 h-3.5 text-slate-500 group-hover:text-blue-400/70 transition-colors" />
                    {candidate.phone}
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-500 mt-2 group-hover:text-slate-400 transition-colors">
                    <Calendar className="w-3.5 h-3.5" />
                    {new Date(candidate.createdAt).toLocaleDateString()}
                </div>
            </div>
        </div>
    );
};
