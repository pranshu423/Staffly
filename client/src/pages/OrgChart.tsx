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
            <div className={`inline-block p-3 rounded-xl border-2 transition-all cursor-pointer bg-white
                ${isSelected ? 'border-blue-500 shadow-lg ring-2 ring-blue-200' : 'border-slate-200 hover:border-blue-300 hover:shadow-md'}
            `}
                onClick={() => {
                    if (isEditMode) {
                        setSelectedEmployee(node);
                        setNewManagerId(node.reportsTo || '');
                    }
                }}
            >
                <div className="flex flex-col items-center gap-1 min-w-[120px]">
                    <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold mb-1">
                        {node.name.charAt(0)}
                    </div>
                    <p className="font-bold text-sm text-slate-800">{node.name}</p>
                    <p className="text-xs text-slate-500 font-medium capitalize">{node.role}</p>
                    {isEditMode && node.reportsTo && (
                        <span className="text-[10px] text-slate-400">Reports to: {employees.find(e => e._id === node.reportsTo)?.name || 'Unknown'}</span>
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

            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800">Organization Chart</h1>
                    <p className="text-slate-500 font-medium">Visual hierarchy of the company</p>
                </div>

                <div className="flex items-center gap-2">
                    {user?.role === 'admin' && (
                        <button
                            onClick={() => {
                                setIsEditMode(!isEditMode);
                                setSelectedEmployee(null);
                            }}
                            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold transition-all
                                ${isEditMode ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}
                            `}
                        >
                            <Edit2 className="w-4 h-4" />
                            {isEditMode ? 'Done Editing' : 'Edit Reporting'}
                        </button>
                    )}
                </div>
            </div>

            {/* Controls */}
            <div className="flex gap-2 mb-4">
                <button onClick={() => setZoom(z => Math.min(z + 0.1, 2))} className="p-2 bg-white rounded-lg border border-slate-200 hover:bg-slate-50"><ZoomIn className="w-4 h-4" /></button>
                <button onClick={() => setZoom(z => Math.max(z - 0.1, 0.5))} className="p-2 bg-white rounded-lg border border-slate-200 hover:bg-slate-50"><ZoomOut className="w-4 h-4" /></button>
                <button onClick={() => setZoom(1)} className="p-2 bg-white rounded-lg border border-slate-200 hover:bg-slate-50"><RotateCcw className="w-4 h-4" /></button>
            </div>

            {/* Editing Panel */}
            {isEditMode && selectedEmployee && (
                <div className="mb-6 p-4 bg-blue-50 rounded-2xl border border-blue-100 animate-in slide-in-from-top-2">
                    <div className="flex items-center gap-4">
                        <span className="font-bold text-blue-800">Assign Manager for: <span className="underline">{selectedEmployee.name}</span></span>
                        <select
                            className="px-4 py-2 rounded-xl border-none focus:ring-2 focus:ring-blue-500"
                            value={newManagerId}
                            onChange={(e) => setNewManagerId(e.target.value)}
                        >
                            <option value="">No Manager (Top Level)</option>
                            {employees
                                .filter(e => e._id !== selectedEmployee._id) // Prevent self-assignment
                                .map(e => (
                                    <option key={e._id} value={e._id}>{e.name} ({e.role})</option>
                                ))}
                        </select>
                        <button
                            onClick={handleUpdateManager}
                            className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            <Check className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => setSelectedEmployee(null)}
                            className="p-2 bg-slate-200 text-slate-600 rounded-lg hover:bg-slate-300 transition-colors"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            )}

            <div className="bg-slate-50 rounded-3xl shadow-inner border border-slate-200 overflow-auto flex-1 p-10 flex justify-center items-start">
                <div style={{ transform: `scale(${zoom})`, transformOrigin: 'top center', transition: 'transform 0.2s' }}>
                    {treeData.length > 0 ? (
                        <Tree
                            lineWidth={'2px'}
                            lineColor={'#cbd5e1'}
                            lineBorderRadius={'10px'}
                            label={<div className="hidden">Root</div>} // Hidden root
                        >
                            {renderTree(treeData)}
                        </Tree>
                    ) : (
                        <div className="text-center text-slate-400 mt-20">
                            <User className="w-12 h-12 mx-auto mb-2 opacity-50" />
                            <p>No employees found to visualize.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default OrgChart;
