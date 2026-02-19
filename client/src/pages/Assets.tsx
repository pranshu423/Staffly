import { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Box, Monitor, Armchair, ChevronDown, User } from 'lucide-react';
import { Toaster, toast } from 'sonner';

interface Asset {
    _id: string;
    name: string;
    type: string;
    serialNumber: string;
    status: 'Available' | 'Assigned' | 'Broken' | 'Lost';
    assignedTo?: {
        _id: string;
        name: string;
        email: string;
    };
    purchaseDate: string;
}

interface Employee {
    _id: string;
    name: string;
    email: string;
}

const Assets = () => {
    const [assets, setAssets] = useState<Asset[]>([]);
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
    const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);

    // Form States
    const [formData, setFormData] = useState({
        name: '',
        type: 'Electronics',
        serialNumber: '',
        purchaseDate: ''
    });

    const [assignData, setAssignData] = useState({
        employeeId: ''
    });

    useEffect(() => {
        fetchAssets();
        fetchEmployees();
    }, []);

    const fetchAssets = async () => {
        try {
            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
            const { data } = await axios.get(`${apiUrl}/api/assets`, { withCredentials: true });
            setAssets(data);
        } catch (error) {
            console.error('Failed to fetch assets', error);
            toast.error('Failed to load assets');
        } finally {
            setIsLoading(false);
        }
    };

    const fetchEmployees = async () => {
        try {
            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
            const { data } = await axios.get(`${apiUrl}/api/employees`, { withCredentials: true });
            setEmployees(data);
        } catch (error) {
            console.error('Failed to fetch employees', error);
        }
    };

    const handleAddAsset = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
            const { data } = await axios.post(`${apiUrl}/api/assets`, formData, { withCredentials: true });
            setAssets([data, ...assets]);
            setIsAddModalOpen(false);
            setFormData({ name: '', type: 'Electronics', serialNumber: '', purchaseDate: '' });
            toast.success('Asset added successfully');
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to add asset');
        }
    };

    const handleAssignAsset = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
            const { data } = await axios.put(
                `${apiUrl}/api/assets/${selectedAsset?._id}`,
                { assignedTo: assignData.employeeId },
                { withCredentials: true }
            );

            setAssets(assets.map(a => a._id === data._id ? data : a));
            setIsAssignModalOpen(false);
            setAssignData({ employeeId: '' });
            toast.success(assignData.employeeId ? 'Asset assigned successfully' : 'Asset unassigned successfully');
        } catch (error: any) {
            toast.error('Failed to update asset assignment');
        }
    };

    const handleUnassign = async (asset: Asset) => {
        try {
            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
            await axios.put(
                `${apiUrl}/api/assets/${asset._id}`,
                { status: 'Available' }, // Setting status to Available automatically unassigns in backend logic if strictly followed, but clearer to send update
                { withCredentials: true }
            );
            // Or explicitly send assignedTo: null if the backend supports it. 
            // Our backend logic says: if assignedTo is provided...
            // Let's rely on the Update logic we wrote: 
            // if (assignedTo !== undefined) ... if (assignedTo) ... else { assignedTo = undefined; status = 'Available' }
            // So we send assignedTo: '' (empty string) to triggers the else block.

            const { data: updatedData } = await axios.put(
                `${apiUrl}/api/assets/${asset._id}`,
                { assignedTo: '' },
                { withCredentials: true }
            );

            setAssets(assets.map(a => a._id === updatedData._id ? updatedData : a));
            toast.success('Asset unassigned');
        } catch (error: any) {
            toast.error('Failed to unassign asset');
        }
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Available': return 'bg-green-100 text-green-700 border-green-200';
            case 'Assigned': return 'bg-blue-100 text-blue-700 border-blue-200';
            case 'Broken': return 'bg-red-100 text-red-700 border-red-200';
            case 'Lost': return 'bg-slate-100 text-slate-700 border-slate-200';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    return (
        <div className="h-full flex flex-col">
            <Toaster richColors position="top-right" />

            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-4xl font-bold text-white mb-2 tracking-tight">Asset Management</h1>
                    <p className="text-slate-300 font-medium text-lg">Track and assign company assets</p>
                </div>
                <button
                    onClick={() => setIsAddModalOpen(true)}
                    className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40 border border-white/10 transition-all hover:-translate-y-0.5"
                >
                    <Plus className="w-5 h-5" />
                    Add Asset
                </button>
            </div>

            <div className="glass-card rounded-[2.5rem] shadow-2xl border border-white/10 overflow-hidden flex-1 relative bg-slate-900/40">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-slate-900/50 border-b border-white/10">
                            <tr>
                                <th className="px-6 py-5 text-left text-xs font-bold text-slate-300 uppercase tracking-wider">Asset Name</th>
                                <th className="px-6 py-5 text-left text-xs font-bold text-slate-300 uppercase tracking-wider">Serial Number</th>
                                <th className="px-6 py-5 text-left text-xs font-bold text-slate-300 uppercase tracking-wider">Type</th>
                                <th className="px-6 py-5 text-left text-xs font-bold text-slate-300 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-5 text-left text-xs font-bold text-slate-300 uppercase tracking-wider">Assigned To</th>
                                <th className="px-6 py-5 text-left text-xs font-bold text-slate-300 uppercase tracking-wider">Purchase Date</th>
                                <th className="px-6 py-5 text-right text-xs font-bold text-slate-300 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {assets.map((asset) => (
                                <tr key={asset._id} className="hover:bg-white/5 transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-4">
                                            <div className="p-3 bg-white/5 rounded-xl text-slate-300 group-hover:text-white group-hover:bg-blue-500/20 transition-colors border border-white/5">
                                                {asset.type === 'Electronics' ? <Monitor className="w-5 h-5" /> : <Armchair className="w-5 h-5" />}
                                            </div>
                                            <span className="font-bold text-white text-base">{asset.name}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm font-medium text-slate-300">{asset.serialNumber}</td>
                                    <td className="px-6 py-4 text-sm font-medium text-slate-300">{asset.type}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-3 py-1 rounded-lg text-xs font-bold border uppercase tracking-wider ${getStatusColor(asset.status).replace('bg-green-100', 'bg-green-500/20').replace('text-green-700', 'text-green-300').replace('border-green-200', 'border-green-500/30').replace('bg-blue-100', 'bg-blue-500/20').replace('text-blue-700', 'text-blue-300').replace('border-blue-200', 'border-blue-500/30').replace('bg-red-100', 'bg-red-500/20').replace('text-red-700', 'text-red-300').replace('border-red-200', 'border-red-500/30').replace('bg-slate-100', 'bg-slate-500/20').replace('text-slate-700', 'text-slate-300').replace('border-slate-200', 'border-slate-500/30')}`}>
                                            {asset.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        {asset.assignedTo ? (
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center text-xs font-bold text-blue-300 border border-blue-500/30">
                                                    {asset.assignedTo.name.charAt(0)}
                                                </div>
                                                <span className="text-sm font-bold text-white">{asset.assignedTo.name}</span>
                                            </div>
                                        ) : (
                                            <span className="text-sm text-slate-500 italic font-medium">Unassigned</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-sm font-medium text-slate-300">
                                        {new Date(asset.purchaseDate).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        {asset.status === 'Available' ? (
                                            <button
                                                onClick={() => {
                                                    setSelectedAsset(asset);
                                                    setAssignData({ employeeId: '' });
                                                    setIsAssignModalOpen(true);
                                                }}
                                                className="text-xs font-bold text-blue-300 hover:text-white bg-blue-500/20 px-4 py-2 rounded-xl hover:bg-blue-500/40 transition-all border border-blue-500/30"
                                            >
                                                Assign
                                            </button>
                                        ) : asset.assignedTo ? (
                                            <button
                                                onClick={() => handleUnassign(asset)}
                                                className="text-xs font-bold text-red-300 hover:text-white bg-red-500/20 px-4 py-2 rounded-xl hover:bg-red-500/40 transition-all border border-red-500/30"
                                            >
                                                Unassign
                                            </button>
                                        ) : (
                                            <span className="text-xs text-slate-500 font-medium">Unavailable</span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                            {assets.length === 0 && !isLoading && (
                                <tr>
                                    <td colSpan={7} className="px-6 py-12 text-center text-slate-500">
                                        <div className="flex flex-col items-center gap-4">
                                            <div className="p-4 bg-white/5 rounded-full border border-white/5">
                                                <Box className="w-10 h-10 text-slate-500" />
                                            </div>
                                            <p className="font-medium text-lg text-slate-400">No assets found</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Add Asset Modal */}
            {isAddModalOpen && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
                    <div className="glass-card !bg-slate-900/90 rounded-3xl p-8 w-full max-w-md shadow-2xl animate-in fade-in zoom-in duration-300 border border-white/10">
                        <h2 className="text-2xl font-bold text-white mb-6 tracking-tight">Add New Asset</h2>
                        <form onSubmit={handleAddAsset} className="space-y-5">
                            <div>
                                <label className="block text-sm font-bold text-slate-300 mb-2 ml-1">Asset Name</label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        required
                                        className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-blue-500 font-medium text-white placeholder:text-slate-500 outline-none hover:bg-white/10 transition-colors"
                                        placeholder="MacBook Pro"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    />
                                    <div className="absolute left-3 top-3.5 text-slate-400">
                                        <Box className="w-5 h-5" />
                                    </div>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-300 mb-2 ml-1">Type</label>
                                <select
                                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-blue-500 font-medium text-white appearance-none outline-none hover:bg-white/10 transition-colors"
                                    value={formData.type}
                                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                >
                                    <option value="Electronics" className="bg-slate-900">Electronics</option>
                                    <option value="Furniture" className="bg-slate-900">Furniture</option>
                                    <option value="Vehicle" className="bg-slate-900">Vehicle</option>
                                    <option value="Other" className="bg-slate-900">Other</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-300 mb-2 ml-1">Serial Number</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-blue-500 font-medium text-white placeholder:text-slate-500 outline-none hover:bg-white/10 transition-colors"
                                    placeholder="SN-12345678"
                                    value={formData.serialNumber}
                                    onChange={(e) => setFormData({ ...formData, serialNumber: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-300 mb-2 ml-1">Purchase Date</label>
                                <input
                                    type="date"
                                    required
                                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-blue-500 font-medium text-white outline-none hover:bg-white/10 transition-colors dark-date-picker"
                                    value={formData.purchaseDate}
                                    onChange={(e) => setFormData({ ...formData, purchaseDate: e.target.value })}
                                />
                            </div>

                            <div className="flex gap-3 pt-6">
                                <button
                                    type="button"
                                    onClick={() => setIsAddModalOpen(false)}
                                    className="flex-1 py-3.5 bg-white/5 hover:bg-white/10 text-slate-300 rounded-xl font-bold transition-colors border border-white/10"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 py-3.5 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white rounded-xl font-bold transition-all shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 hover:-translate-y-0.5"
                                >
                                    Add Asset
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Assign Asset Modal */}
            {isAssignModalOpen && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
                    <div className="glass-card !bg-slate-900/90 rounded-3xl p-8 w-full max-w-md shadow-2xl animate-in fade-in zoom-in duration-300 border border-white/10">
                        <h2 className="text-2xl font-bold text-white mb-2 tracking-tight">Assign Asset</h2>
                        <p className="text-slate-400 mb-6 font-medium">Assign <strong className="text-white">{selectedAsset?.name}</strong> to an employee.</p>

                        <form onSubmit={handleAssignAsset} className="space-y-5">
                            <div>
                                <label className="block text-sm font-bold text-slate-300 mb-2 ml-1">Select Employee</label>
                                <div className="relative">
                                    <select
                                        required
                                        className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-blue-500 font-medium text-white appearance-none outline-none hover:bg-white/10 transition-colors"
                                        value={assignData.employeeId}
                                        onChange={(e) => setAssignData({ employeeId: e.target.value })}
                                    >
                                        <option value="" className="bg-slate-900">Select an employee</option>
                                        {employees.map(emp => (
                                            <option key={emp._id} value={emp._id} className="bg-slate-900">{emp.name} ({emp.email})</option>
                                        ))}
                                    </select>
                                    <div className="absolute left-3 top-3.5 text-slate-400">
                                        <User className="w-5 h-5" />
                                    </div>
                                    <div className="absolute right-3 top-3.5 text-slate-400 pointer-events-none">
                                        <ChevronDown className="w-5 h-5" />
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-3 pt-6">
                                <button
                                    type="button"
                                    onClick={() => setIsAssignModalOpen(false)}
                                    className="flex-1 py-3.5 bg-white/5 hover:bg-white/10 text-slate-300 rounded-xl font-bold transition-colors border border-white/10"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 py-3.5 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white rounded-xl font-bold transition-all shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 hover:-translate-y-0.5"
                                >
                                    Assign
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Assets;
