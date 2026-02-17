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

            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800">Asset Management</h1>
                    <p className="text-slate-500 font-medium">Track and assign company assets</p>
                </div>
                <button
                    onClick={() => setIsAddModalOpen(true)}
                    className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-xl font-bold hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/20 active:scale-95"
                >
                    <Plus className="w-5 h-5" />
                    Add Asset
                </button>
            </div>

            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden flex-1">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-slate-50 border-b border-slate-100">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Asset Name</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Serial Number</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Type</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Assigned To</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Purchase Date</th>
                                <th className="px-6 py-4 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {assets.map((asset) => (
                                <tr key={asset._id} className="hover:bg-slate-50/50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-slate-100 rounded-lg text-slate-600">
                                                {asset.type === 'Electronics' ? <Monitor className="w-5 h-5" /> : <Armchair className="w-5 h-5" />}
                                            </div>
                                            <span className="font-bold text-slate-700">{asset.name}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm font-medium text-slate-600">{asset.serialNumber}</td>
                                    <td className="px-6 py-4 text-sm font-medium text-slate-600">{asset.type}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(asset.status)}`}>
                                            {asset.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        {asset.assignedTo ? (
                                            <div className="flex items-center gap-2">
                                                <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-xs font-bold text-blue-600">
                                                    {asset.assignedTo.name.charAt(0)}
                                                </div>
                                                <span className="text-sm font-medium text-slate-700">{asset.assignedTo.name}</span>
                                            </div>
                                        ) : (
                                            <span className="text-sm text-slate-400 italic">Unassigned</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-sm font-medium text-slate-600">
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
                                                className="text-xs font-bold text-blue-600 hover:text-blue-700 bg-blue-50 px-3 py-1.5 rounded-lg hover:bg-blue-100 transition-colors"
                                            >
                                                Assign
                                            </button>
                                        ) : asset.assignedTo ? (
                                            <button
                                                onClick={() => handleUnassign(asset)}
                                                className="text-xs font-bold text-red-600 hover:text-red-700 bg-red-50 px-3 py-1.5 rounded-lg hover:bg-red-100 transition-colors"
                                            >
                                                Unassign
                                            </button>
                                        ) : (
                                            <span className="text-xs text-slate-400">Unavailable</span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                            {assets.length === 0 && !isLoading && (
                                <tr>
                                    <td colSpan={7} className="px-6 py-12 text-center text-slate-500">
                                        <div className="flex flex-col items-center gap-2">
                                            <Box className="w-8 h-8 text-slate-300" />
                                            <p className="font-medium">No assets found</p>
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
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl animate-in fade-in zoom-in duration-200">
                        <h2 className="text-2xl font-bold text-slate-900 mb-6">Add New Asset</h2>
                        <form onSubmit={handleAddAsset} className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1">Asset Name</label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        required
                                        className="w-full pl-10 pr-4 py-3 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-blue-500 font-medium"
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
                                <label className="block text-sm font-bold text-slate-700 mb-1">Type</label>
                                <select
                                    className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-blue-500 font-medium appearance-none"
                                    value={formData.type}
                                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                >
                                    <option value="Electronics">Electronics</option>
                                    <option value="Furniture">Furniture</option>
                                    <option value="Vehicle">Vehicle</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1">Serial Number</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-blue-500 font-medium"
                                    placeholder="SN-12345678"
                                    value={formData.serialNumber}
                                    onChange={(e) => setFormData({ ...formData, serialNumber: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1">Purchase Date</label>
                                <input
                                    type="date"
                                    required
                                    className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-blue-500 font-medium"
                                    value={formData.purchaseDate}
                                    onChange={(e) => setFormData({ ...formData, purchaseDate: e.target.value })}
                                />
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setIsAddModalOpen(false)}
                                    className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold transition-colors shadow-lg shadow-slate-900/20"
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
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl animate-in fade-in zoom-in duration-200">
                        <h2 className="text-2xl font-bold text-slate-900 mb-2">Assign Asset</h2>
                        <p className="text-slate-500 mb-6">Assign <strong>{selectedAsset?.name}</strong> to an employee.</p>

                        <form onSubmit={handleAssignAsset} className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1">Select Employee</label>
                                <div className="relative">
                                    <select
                                        required
                                        className="w-full pl-10 pr-4 py-3 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-blue-500 font-medium appearance-none"
                                        value={assignData.employeeId}
                                        onChange={(e) => setAssignData({ employeeId: e.target.value })}
                                    >
                                        <option value="">Select an employee</option>
                                        {employees.map(emp => (
                                            <option key={emp._id} value={emp._id}>{emp.name} ({emp.email})</option>
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

                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setIsAssignModalOpen(false)}
                                    className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold transition-colors shadow-lg shadow-slate-900/20"
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
