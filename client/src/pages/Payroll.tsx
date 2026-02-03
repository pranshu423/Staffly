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

    useEffect(() => {
        fetchPayroll();
    }, [isAdmin]);



    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">Payroll</h1>
                    <p className="text-slate-500 dark:text-slate-400">
                        {isAdmin ? 'Manage employee salaries and payments' : 'View your salary history'}
                    </p>
                </div>
                {isAdmin && (
                    <Button onClick={() => setIsModalOpen(true)}>
                        <Plus className="mr-2 h-4 w-4" />
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
                        <div>Loading...</div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="text-xs text-slate-500 uppercase bg-slate-50 dark:bg-slate-800 dark:text-slate-400">
                                    <tr>
                                        {isAdmin && <th className="px-6 py-3">Employee</th>}
                                        <th className="px-6 py-3">Month</th>
                                        <th className="px-6 py-3">Base Salary</th>
                                        <th className="px-6 py-3">Deductions</th>
                                        <th className="px-6 py-3">Net Pay</th>
                                        <th className="px-6 py-3">Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {Array.isArray(payrolls) && payrolls.map((record) => (
                                        <tr key={record._id} className="bg-white border-b dark:bg-slate-900 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50">
                                            {isAdmin && (
                                                <td className="px-6 py-4 font-medium">
                                                    {typeof record.employeeId === 'object' ? record.employeeId.name : 'Unknown'}
                                                </td>
                                            )}
                                            <td className="px-6 py-4">{record.month}</td>
                                            <td className="px-6 py-4">${record.baseSalary}</td>
                                            <td className="px-6 py-4 text-red-500">-${record.deductions}</td>
                                            <td className="px-6 py-4 font-bold text-green-600">${record.netPay}</td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${record.status === 'paid' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                                                    }`}>
                                                    {record.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                    {(!Array.isArray(payrolls) || payrolls.length === 0) && (
                                        <tr>
                                            <td colSpan={isAdmin ? 6 : 5} className="px-6 py-4 text-center text-slate-500">
                                                No records found
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
