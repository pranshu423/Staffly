import { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { Tree, TreeNode } from 'react-organizational-chart';
import { User, Edit2, Check, X, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';
import { Toaster, toast } from 'sonner';
import { useAuth } from '../context/AuthContext';

interface Employee {
    _id: string;
    name: string;
    role: string;
    email: string;
    reportsTo?: string;
    children?: Employee[];
}

const OrgChart = () => {
    const { user } = useAuth();
    const [employees, setEmployees] = useState<Employee[]>([]);

    const [zoom, setZoom] = useState(1);

    // Edit Mode State
    const [isEditMode, setIsEditMode] = useState(false);
    const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
    const [newManagerId, setNewManagerId] = useState('');

    useEffect(() => {
        fetchOrgData();
    }, []);

    const fetchOrgData = async () => {
        try {
            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
            const { data } = await axios.get(`${apiUrl}/api/employees/org-chart`, { withCredentials: true });
            setEmployees(data);
        } catch (error) {
            console.error('Failed to fetch org chart', error);
            toast.error('Failed to load organization chart');
            // Loading handled by initial state or could be added back if needed
        }
    };

    const buildTree = (data: Employee[]): Employee[] => {
        const idMapping = data.reduce((acc, el, i) => {
            acc[el._id] = i;
            return acc;
        }, {} as Record<string, number>);

        const root: Employee[] = [];

        data.forEach((el) => {
            // If reportsTo is null or doesn't exist in dataset (top level)
            if (!el.reportsTo || !idMapping[el.reportsTo]) {
                root.push(el);
                return;
            }

            const parentEl = data[idMapping[el.reportsTo]];
            parentEl.children = [...(parentEl.children || []), el];
        });

        return root;
    };

    const treeData = useMemo(() => buildTree(JSON.parse(JSON.stringify(employees))), [employees]);

    const handleUpdateManager = async () => {
        if (!selectedEmployee) return;

        try {
            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
            await axios.put(
                `${apiUrl}/api/employees/${selectedEmployee._id}`,
                { reportsTo: newManagerId || null }, // Allow clearing manager
                { withCredentials: true }
            );

            // Refresh data
            fetchOrgData();
            setSelectedEmployee(null);
            setNewManagerId('');
            toast.success('Reporting line updated');
        } catch (error: any) {
            toast.error('Failed to update reporting line');
        }
    };

    const Node = ({ node }: { node: Employee }) => {
        const isSelected = selectedEmployee?._id === node._id;

        return (
            <div className={`inline-block p-4 rounded-2xl border transition-all cursor-pointer backdrop-blur-md
                ${isSelected
                    ? 'bg-blue-600/20 border-blue-500 shadow-[0_0_30px_-5px_rgba(59,130,246,0.5)] ring-1 ring-blue-400'
                    : 'bg-slate-900/40 border-white/10 hover:border-white/20 hover:bg-slate-800/60 hover:shadow-xl hover:shadow-blue-500/10 hover:-translate-y-1'
                }
            `}
                onClick={() => {
                    if (isEditMode) {
                        setSelectedEmployee(node);
                        setNewManagerId(node.reportsTo || '');
                    }
                }}
            >
                <div className="flex flex-col items-center gap-2 min-w-[140px]">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg mb-1 shadow-lg
                        ${isSelected ? 'bg-blue-600 text-white' : 'bg-gradient-to-br from-slate-700 to-slate-800 text-slate-200 border border-white/5'}
                    `}>
                        {node.name.charAt(0)}
                    </div>
                    <p className="font-bold text-base text-white tracking-tight">{node.name}</p>
                    <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">{node.role}</p>
                    {isEditMode && node.reportsTo && (
                        <span className="text-[10px] text-slate-500 mt-1 bg-white/5 px-2 py-0.5 rounded-full border border-white/5">
                            Reports to: {employees.find(e => e._id === node.reportsTo)?.name || 'Unknown'}
                        </span>
                    )}
                </div>
            </div>
        );
    };

    const renderTree = (nodes: Employee[]) => {
        return nodes.map((node) => (
            <TreeNode key={node._id} label={<Node node={node} />}>
                {node.children && node.children.length > 0 && renderTree(node.children)}
            </TreeNode>
        ));
    };

    return (
        <div className="h-full flex flex-col">
            <Toaster richColors position="top-right" />

            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-4xl font-bold text-white mb-2 tracking-tight">Organization Chart</h1>
                    <p className="text-slate-300 font-medium text-lg">Visual hierarchy of the company</p>
                </div>

                <div className="flex items-center gap-3">
                    {user?.role === 'admin' && (
                        <button
                            onClick={() => {
                                setIsEditMode(!isEditMode);
                                setSelectedEmployee(null);
                            }}
                            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all shadow-lg border
                                ${isEditMode
                                    ? 'bg-blue-600/20 text-blue-300 border-blue-500/50 hover:bg-blue-600/30'
                                    : 'bg-white/5 text-white border-white/10 hover:bg-white/10 hover:border-white/20'
                                }
                            `}
                        >
                            <Edit2 className="w-4 h-4" />
                            {isEditMode ? 'Done Editing' : 'Edit Reporting'}
                        </button>
                    )}
                </div>
            </div>

            {/* Controls */}
            <div className="flex gap-2 mb-6">
                <button onClick={() => setZoom(z => Math.min(z + 0.1, 2))} className="p-3 bg-slate-900/50 text-white rounded-xl border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all shadow-lg"><ZoomIn className="w-5 h-5" /></button>
                <button onClick={() => setZoom(z => Math.max(z - 0.1, 0.5))} className="p-3 bg-slate-900/50 text-white rounded-xl border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all shadow-lg"><ZoomOut className="w-5 h-5" /></button>
                <button onClick={() => setZoom(1)} className="p-3 bg-slate-900/50 text-white rounded-xl border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all shadow-lg"><RotateCcw className="w-5 h-5" /></button>
            </div>

            {/* Editing Panel */}
            {isEditMode && selectedEmployee && (
                <div className="mb-6 p-6 bg-slate-900/80 rounded-3xl border border-white/10 animate-in slide-in-from-top-2 shadow-2xl backdrop-blur-md">
                    <div className="flex items-center gap-4">
                        <span className="font-bold text-white text-lg">Assign Manager for: <span className="text-blue-400 underline decoration-blue-500/50 underline-offset-4">{selectedEmployee.name}</span></span>
                        <select
                            className="px-4 py-3 rounded-xl border border-white/10 bg-black/40 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                            value={newManagerId}
                            onChange={(e) => setNewManagerId(e.target.value)}
                        >
                            <option value="" className="bg-slate-900">No Manager (Top Level)</option>
                            {employees
                                .filter(e => e._id !== selectedEmployee._id) // Prevent self-assignment
                                .map(e => (
                                    <option key={e._id} value={e._id} className="bg-slate-900">{e.name} ({e.role})</option>
                                ))}
                        </select>
                        <button
                            onClick={handleUpdateManager}
                            className="p-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-500 hover:to-indigo-500 transition-all shadow-lg hover:shadow-blue-500/25 border border-white/10"
                        >
                            <Check className="w-5 h-5" />
                        </button>
                        <button
                            onClick={() => setSelectedEmployee(null)}
                            className="p-3 bg-white/5 text-slate-400 rounded-xl hover:bg-white/10 hover:text-white transition-colors border border-white/5"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            )}

            <div className="glass-card rounded-[2.5rem] shadow-2xl border border-white/10 overflow-hidden flex-1 relative bg-slate-900/40">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-500/5 via-transparent to-transparent pointer-events-none" />

                <div className="w-full h-full overflow-auto p-10 flex justify-center items-start custom-scrollbar">
                    <div style={{ transform: `scale(${zoom})`, transformOrigin: 'top center', transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)' }}>
                        {treeData.length > 0 ? (
                            <Tree
                                lineWidth={'2px'}
                                lineColor={'rgba(255, 255, 255, 0.1)'}
                                lineBorderRadius={'16px'}
                                label={<div className="hidden">Root</div>} // Hidden root
                            >
                                {renderTree(treeData)}
                            </Tree>
                        ) : (
                            <div className="text-center text-slate-500 mt-20">
                                <User className="w-16 h-16 mx-auto mb-4 opacity-30" />
                                <p className="text-lg font-medium">No employees found to visualize.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OrgChart;
