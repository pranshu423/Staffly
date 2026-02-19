import { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Plus, Check, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import ApplyLeaveModal from '../components/ApplyLeaveModal';

interface Leave {
    _id: string;
    type: string;
    fromDate: string;
    toDate: string;
    reason: string;
    status: string;
    employeeId: {
        name: string;
        email: string;
    } | string;
    createdAt: string;
}

const Leaves = () => {
    const [leaves, setLeaves] = useState<Leave[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const { user } = useAuth();
    const isAdmin = user?.role === 'admin';

    const fetchLeaves = async () => {
        try {
            setLoading(true);
            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
            const endpoint = isAdmin
                ? `${apiUrl}/api/leaves/all`
                : `${apiUrl}/api/leaves/me`;

            const { data } = await axios.get(endpoint, { withCredentials: true });
            setLeaves(data);
        } catch (error) {
            console.error('Failed to fetch leaves', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLeaves();
    }, [isAdmin]);

    const handleUpdateStatus = async (id: string, status: string) => {
        try {
            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
            await axios.put(`${apiUrl}/api/leaves/${id}/status`, { status }, { withCredentials: true });
            fetchLeaves();
        } catch (error) {
            console.error('Failed to update status', error);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-4xl font-bold tracking-tight text-white mb-2">Leave Management</h1>
                    <p className="text-slate-300 text-lg">
                        {isAdmin ? 'Manage employee leave requests' : 'View and apply for leaves'}
                    </p>
                </div>
                {!isAdmin && (
                    <Button onClick={() => setIsModalOpen(true)} className="shadow-lg shadow-blue-500/20">
                        <Plus className="mr-2 h-5 w-5" />
                        Apply for Leave
                    </Button>
                )}
            </div>

            <ApplyLeaveModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSuccess={fetchLeaves}
            />

            <Card>
                <CardHeader>
                    <CardTitle>{isAdmin ? 'Leave Approval Queue' : 'My Leave History'}</CardTitle>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="text-white text-center py-8">Loading...</div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="text-xs text-slate-400 uppercase bg-slate-900/50 border-b border-white/10">
                                    <tr>
                                        {isAdmin && <th className="px-6 py-4 font-bold tracking-wider">Employee</th>}
                                        <th className="px-6 py-4 font-bold tracking-wider">Type</th>
                                        <th className="px-6 py-4 font-bold tracking-wider">From</th>
                                        <th className="px-6 py-4 font-bold tracking-wider">To</th>
                                        <th className="px-6 py-4 font-bold tracking-wider">Reason</th>
                                        <th className="px-6 py-4 font-bold tracking-wider">Status</th>
                                        {isAdmin && <th className="px-6 py-4 font-bold tracking-wider">Actions</th>}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {Array.isArray(leaves) && leaves.map((leave) => (
                                        <tr key={leave._id} className="bg-transparent hover:bg-white/5 transition-colors text-slate-200">
                                            {isAdmin && (
                                                <td className="px-6 py-4 font-bold text-white">
                                                    {leave.employeeId && typeof leave.employeeId === 'object' ? leave.employeeId.name : 'Unknown'}
                                                </td>
                                            )}
                                            <td className="px-6 py-4 capitalize font-medium">{leave.type}</td>
                                            <td className="px-6 py-4">{new Date(leave.fromDate).toLocaleDateString()}</td>
                                            <td className="px-6 py-4">{new Date(leave.toDate).toLocaleDateString()}</td>
                                            <td className="px-6 py-4 truncate max-w-xs">{leave.reason}</td>
                                            <td className="px-6 py-4">
                                                <span className={`px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider ${leave.status === 'approved' ? 'bg-green-500/20 text-green-300 border border-green-500/30' :
                                                    leave.status === 'rejected' ? 'bg-red-500/20 text-red-300 border border-red-500/30' : 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30'
                                                    }`}>
                                                    {leave.status}
                                                </span>
                                            </td>
                                            {isAdmin && (
                                                <td className="px-6 py-4 flex gap-2">
                                                    {leave.status === 'pending' && (
                                                        <>
                                                            <Button size="sm" variant="ghost" className="text-green-400 hover:text-green-300 hover:bg-green-500/10" onClick={() => handleUpdateStatus(leave._id, 'approved')}>
                                                                <Check className="h-4 w-4" />
                                                            </Button>
                                                            <Button size="sm" variant="ghost" className="text-red-400 hover:text-red-300 hover:bg-red-500/10" onClick={() => handleUpdateStatus(leave._id, 'rejected')}>
                                                                <X className="h-4 w-4" />
                                                            </Button>
                                                        </>
                                                    )}
                                                </td>
                                            )}
                                        </tr>
                                    ))}
                                    {(!Array.isArray(leaves) || leaves.length === 0) && (
                                        <tr>
                                            <td colSpan={isAdmin ? 7 : 5} className="px-6 py-12 text-center text-slate-400">
                                                <div className="flex flex-col items-center justify-center gap-2">
                                                    <div className="text-lg font-bold text-white">No requests found</div>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default Leaves;
