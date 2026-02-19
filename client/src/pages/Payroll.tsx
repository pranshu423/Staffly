import { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Plus } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import GeneratePayrollModal from '../components/GeneratePayrollModal';

interface PayrollRecord {
    _id: string;
    employeeId: {
        name: string;
        email: string;
    } | string;
    month: string;
    baseSalary: number;
    deductions: number;
    netPay: number;
    status: 'pending' | 'paid';
    createdAt: string;
}

const Payroll = () => {
    const [payrolls, setPayrolls] = useState<PayrollRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const { user } = useAuth();
    const isAdmin = user?.role === 'admin';

    const fetchPayroll = async () => {
        try {
            setLoading(true);
            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
            const endpoint = isAdmin
                ? `${apiUrl}/api/payroll/all`
                : `${apiUrl}/api/payroll/me`;

            const { data } = await axios.get(endpoint, { withCredentials: true });
            setPayrolls(data);
        } catch (error) {
            console.error('Failed to fetch payroll', error);
        } finally {
            setLoading(false);
        }
    };

    const handleMarkAsPaid = async (id: string) => {
        try {
            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
            await axios.put(`${apiUrl}/api/payroll/${id}/pay`, {}, { withCredentials: true });
            fetchPayroll();
        } catch (error) {
            console.error('Failed to mark as paid', error);
        }
    };

    useEffect(() => {
        fetchPayroll();
    }, [isAdmin]);



    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-4xl font-bold tracking-tight text-white mb-2">Payroll</h1>
                    <p className="text-slate-300 text-lg">
                        {isAdmin ? 'Manage employee salaries and payments' : 'View your salary history'}
                    </p>
                </div>
                {isAdmin && (
                    <Button onClick={() => setIsModalOpen(true)} className="shadow-lg shadow-blue-500/20">
                        <Plus className="mr-2 h-5 w-5" />
                        Generate Payroll
                    </Button>
                )}
            </div>

            <GeneratePayrollModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSuccess={fetchPayroll}
            />

            <Card>
                <CardHeader>
                    <CardTitle>Payroll History</CardTitle>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="text-white text-center py-8">Loading history...</div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="text-xs text-slate-400 uppercase bg-slate-900/50 border-b border-white/10">
                                    <tr>
                                        {isAdmin && <th className="px-6 py-4 font-bold tracking-wider">Employee</th>}
                                        <th className="px-6 py-4 font-bold tracking-wider">Month</th>
                                        <th className="px-6 py-4 font-bold tracking-wider">Base Salary</th>
                                        <th className="px-6 py-4 font-bold tracking-wider">Deductions</th>
                                        <th className="px-6 py-4 font-bold tracking-wider">Net Pay</th>
                                        <th className="px-6 py-4 font-bold tracking-wider">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {Array.isArray(payrolls) && payrolls.map((record) => (
                                        <tr key={record._id} className="bg-transparent hover:bg-white/5 transition-colors text-slate-200">
                                            {isAdmin && (
                                                <td className="px-6 py-4 font-bold text-white">
                                                    {record.employeeId && typeof record.employeeId === 'object' ? record.employeeId.name : 'Unknown'}
                                                </td>
                                            )}
                                            <td className="px-6 py-4 font-medium">{record.month}</td>
                                            <td className="px-6 py-4">₹{record.baseSalary}</td>
                                            <td className="px-6 py-4 text-red-300">-₹{record.deductions}</td>
                                            <td className="px-6 py-4 font-bold text-green-400">₹{record.netPay}</td>
                                            <td className="px-6 py-4">
                                                <button
                                                    onClick={() => {
                                                        if (isAdmin && record.status === 'pending') {
                                                            handleMarkAsPaid(record._id);
                                                        }
                                                    }}
                                                    disabled={!isAdmin || record.status === 'paid'}
                                                    className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all hover:scale-105 ${record.status === 'paid'
                                                        ? 'bg-green-500/20 text-green-300 border border-green-500/30'
                                                        : 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30 cursor-pointer hover:bg-yellow-500/30'
                                                        }`}
                                                    title={isAdmin && record.status === 'pending' ? "Click to Mark as Paid" : ""}
                                                >
                                                    {record.status}
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                    {(!Array.isArray(payrolls) || payrolls.length === 0) && (
                                        <tr>
                                            <td colSpan={isAdmin ? 6 : 5} className="px-6 py-12 text-center text-slate-400">
                                                <div className="flex flex-col items-center justify-center gap-2">
                                                    <div className="text-lg font-bold text-white">No records found</div>
                                                    <div className="text-sm">Payroll history will appear here</div>
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

export default Payroll;
