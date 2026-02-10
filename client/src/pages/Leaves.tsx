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
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">Leave Management</h1>
                    <p className="text-slate-500 dark:text-slate-400">
                        {isAdmin ? 'Manage employee leave requests' : 'View and apply for leaves'}
                    </p>
                </div>
                {!isAdmin && (
                    <Button onClick={() => setIsModalOpen(true)}>
                        <Plus className="mr-2 h-4 w-4" />
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
                        <div>Loading...</div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="text-xs text-slate-500 uppercase bg-slate-50 dark:bg-slate-800 dark:text-slate-400">
                                    <tr>
                                        {isAdmin && <th className="px-6 py-3">Employee</th>}
                                        <th className="px-6 py-3">Type</th>
                                        <th className="px-6 py-3">From</th>
                                        <th className="px-6 py-3">To</th>
                                        <th className="px-6 py-3">Reason</th>
                                        <th className="px-6 py-3">Status</th>
                                        {isAdmin && <th className="px-6 py-3">Actions</th>}
                                    </tr>
                                </thead>
                                <tbody>
                                    {Array.isArray(leaves) && leaves.map((leave) => (
                                        <tr key={leave._id} className="bg-white border-b border-slate-200 hover:bg-slate-50 text-slate-900">
                                            {isAdmin && (
                                                <td className="px-6 py-4 font-medium">
                                                    {leave.employeeId && typeof leave.employeeId === 'object' ? leave.employeeId.name : 'Unknown'}
                                                </td>
                                            )}
                                            <td className="px-6 py-4 capitalize">{leave.type}</td>
                                            <td className="px-6 py-4">{new Date(leave.fromDate).toLocaleDateString()}</td>
                                            <td className="px-6 py-4">{new Date(leave.toDate).toLocaleDateString()}</td>
                                            <td className="px-6 py-4 truncate max-w-xs">{leave.reason}</td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${leave.status === 'approved' ? 'bg-green-100 text-green-800' :
                                                    leave.status === 'rejected' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
                                                    }`}>
                                                    {leave.status}
                                                </span>
                                            </td>
                                            {isAdmin && (
                                                <td className="px-6 py-4 flex gap-2">
                                                    {leave.status === 'pending' && (
                                                        <>
                                                            <Button size="sm" variant="ghost" className="text-green-600 hover:bg-green-50" onClick={() => handleUpdateStatus(leave._id, 'approved')}>
                                                                <Check className="h-4 w-4" />
                                                            </Button>
                                                            <Button size="sm" variant="ghost" className="text-red-600 hover:bg-red-50" onClick={() => handleUpdateStatus(leave._id, 'rejected')}>
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
                                            <td colSpan={isAdmin ? 7 : 5} className="px-6 py-4 text-center text-slate-500">
                                                No specific records found
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
