import { useState, useEffect } from 'react';
import { DndContext, DragOverlay, closestCorners, KeyboardSensor, PointerSensor, useSensor, useSensors, type DragStartEvent, type DragOverEvent, type DragEndEvent } from '@dnd-kit/core';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import axios from 'axios';
import { Plus, Search, Phone, Mail, FileText } from 'lucide-react';
import { SortableCandidateCard } from '../components/recruitment/SortableCandidateCard.tsx';
import { DroppableColumn } from '../components/recruitment/DroppableColumn';
import { createPortal } from 'react-dom';
import { Toaster, toast } from 'sonner';

interface Candidate {
    _id: string;
    name: string;
    email: string;
    phone: string;
    position: string;
    status: string;
    resumeUrl?: string;
    createdAt: string;
}

const COLUMNS = ['Applied', 'Screening', 'Interview', 'Offer', 'Hired', 'Rejected'];

const RecruitmentBoard = () => {
    const [candidates, setCandidates] = useState<Candidate[]>([]);
    const [activeId, setActiveId] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        position: '',
        resumeUrl: ''
    });

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    useEffect(() => {
        fetchCandidates();
    }, []);

    const fetchCandidates = async () => {
        try {
            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
            const { data } = await axios.get(`${apiUrl}/api/recruitment/candidates`, { withCredentials: true });
            setCandidates(data);
        } catch (error) {
            console.error('Failed to fetch candidates', error);
            toast.error('Failed to load candidates');
        }
    };

    const handleAddCandidate = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
            const { data } = await axios.post(`${apiUrl}/api/recruitment/candidates`, formData, { withCredentials: true });
            setCandidates([data, ...candidates]);
            setIsModalOpen(false);
            setFormData({ name: '', email: '', phone: '', position: '', resumeUrl: '' });
            toast.success('Candidate added successfully');
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to add candidate');
        }
    };

    const onDragStart = (event: DragStartEvent) => {
        setActiveId(event.active.id as string);
    };

    const onDragOver = (event: DragOverEvent) => {
        const { active, over } = event;
        if (!over) return;

        const activeId = active.id as string;
        const overId = over.id as string;

        // Find the containers
        const activeCandidate = candidates.find(c => c._id === activeId);
        const overCandidate = candidates.find(c => c._id === overId);

        if (!activeCandidate) return;

        const activeColumn = activeCandidate.status;
        const overColumn = overCandidate ? overCandidate.status : overId; // overId is column name if dropped on empty column

        if (activeColumn !== overColumn) {
            // We'll handle state update in dragEnd to correspond with API call
        }
    };

    const onDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event;
        setActiveId(null);

        if (!over) return;

        const activeId = active.id as string;
        const overId = over.id as string;

        const activeCandidate = candidates.find(c => c._id === activeId);
        if (!activeCandidate) return;

        const activeColumn = activeCandidate.status;
        // If dropped over a candidate, get their status, else use the column id directly
        const overCandidate = candidates.find(c => c._id === overId);
        const overColumn = overCandidate ? overCandidate.status : overId;

        if (activeColumn !== overColumn) {
            // Optimistic Update
            setCandidates((items) => {
                return items.map(item =>
                    item._id === activeId ? { ...item, status: overColumn } : item
                );
            });

            // API Call
            try {
                const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
                await axios.put(`${apiUrl}/api/recruitment/candidates/${activeId}/status`, { status: overColumn }, { withCredentials: true });
                toast.success(`Moved to ${overColumn}`);
            } catch (error) {
                console.error('Update failed', error);
                toast.error('Failed to update status');
                fetchCandidates(); // Revert
            }
        }
    };

    return (
        <div className="h-full flex flex-col">
            <Toaster richColors position="top-right" />

            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-4xl font-bold text-white mb-2 tracking-tight">Recruitment</h1>
                    <p className="text-slate-300 font-medium text-lg">Manage your hiring pipeline</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40 border border-white/10 transition-all hover:-translate-y-0.5"
                >
                    <Plus className="w-5 h-5" />
                    Add Candidate
                </button>
            </div>

            <div className="flex-1 overflow-x-auto pb-4">
                <DndContext
                    sensors={sensors}
                    collisionDetection={closestCorners}
                    onDragStart={onDragStart}
                    onDragOver={onDragOver}
                    onDragEnd={onDragEnd}
                >
                    <div className="flex gap-6 min-w-max h-full">
                        {COLUMNS.map((col) => (
                            <DroppableColumn key={col} id={col} title={col} count={candidates.filter(c => c.status === col).length}>
                                {candidates
                                    .filter((c) => c.status === col)
                                    .map((candidate) => (
                                        <SortableCandidateCard key={candidate._id} candidate={candidate} />
                                    ))}
                            </DroppableColumn>
                        ))}
                    </div>

                    {createPortal(
                        <DragOverlay>
                            {activeId ? (
                                <SortableCandidateCard
                                    candidate={candidates.find(c => c._id === activeId)!}
                                    isOverlay
                                />
                            ) : null}
                        </DragOverlay>,
                        document.body
                    )}
                </DndContext>
            </div>

            {/* Add Candidate Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
                    <div className="glass-card !bg-slate-900/90 rounded-3xl p-8 w-full max-w-md shadow-2xl animate-in fade-in zoom-in duration-300 border border-white/10">
                        <h2 className="text-2xl font-bold text-white mb-6 tracking-tight">Add New Candidate</h2>
                        <form onSubmit={handleAddCandidate} className="space-y-5">
                            <div>
                                <label className="block text-sm font-bold text-slate-300 mb-2 ml-1">Full Name</label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        required
                                        className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-blue-500 font-medium text-white placeholder:text-slate-500 outline-none hover:bg-white/10 transition-colors"
                                        placeholder="Enter full name"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    />
                                    <div className="absolute left-3 top-3.5 text-slate-400">
                                        <FileText className="w-5 h-5" />
                                    </div>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-300 mb-2 ml-1">Email</label>
                                <div className="relative">
                                    <input
                                        type="email"
                                        required
                                        className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-blue-500 font-medium text-white placeholder:text-slate-500 outline-none hover:bg-white/10 transition-colors"
                                        placeholder="Enter email address"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    />
                                    <div className="absolute left-3 top-3.5 text-slate-400">
                                        <Mail className="w-5 h-5" />
                                    </div>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-300 mb-2 ml-1">Phone</label>
                                <div className="relative">
                                    <input
                                        type="tel"
                                        required
                                        className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-blue-500 font-medium text-white placeholder:text-slate-500 outline-none hover:bg-white/10 transition-colors"
                                        placeholder="Enter phone number"
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    />
                                    <div className="absolute left-3 top-3.5 text-slate-400">
                                        <Phone className="w-5 h-5" />
                                    </div>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-300 mb-2 ml-1">Position</label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        required
                                        className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-blue-500 font-medium text-white placeholder:text-slate-500 outline-none hover:bg-white/10 transition-colors"
                                        placeholder="Enter position applied for"
                                        value={formData.position}
                                        onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                                    />
                                    <div className="absolute left-3 top-3.5 text-slate-400">
                                        <Search className="w-5 h-5" />
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-3 pt-6">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="flex-1 py-3.5 bg-white/5 hover:bg-white/10 text-slate-300 rounded-xl font-bold transition-colors border border-white/10"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 py-3.5 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white rounded-xl font-bold transition-all shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 hover:-translate-y-0.5"
                                >
                                    Add Candidate
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RecruitmentBoard;
