import { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import EmployeeModal from '../components/EmployeeModal';

interface Employee {
    _id: string;
    name: string;
    email: string;
    employeeId: string;
    department: string;
    role: string;
    isActive: boolean;
    joiningDate: string;
}

const Employees = () => {
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [employeeToEdit, setEmployeeToEdit] = useState<Employee | null>(null);
    const { user } = useAuth();

    const fetchEmployees = async () => {
        try {
            setLoading(true);
            const { data } = await axios.get('http://localhost:5000/api/employees', { withCredentials: true });
            setEmployees(data);
        } catch (error) {
            console.error('Failed to fetch employees', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user?.role === 'admin') {
            fetchEmployees();
        }
    }, [user]);

    const handleAdd = () => {
        setEmployeeToEdit(null);
        setIsModalOpen(true);
    };

    const handleEdit = (emp: Employee) => {
        setEmployeeToEdit(emp);
        setIsModalOpen(true);
    };

    const handleDelete = async (id: string) => {
        if (window.confirm('Are you sure you want to delete this employee?')) {
            try {
                await axios.delete(`http://localhost:5000/api/employees/${id}`, { withCredentials: true });
                fetchEmployees();
            } catch (error) {
                console.error('Failed to delete employee', error);
            }
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">Employees</h1>
                    <p className="text-slate-500 dark:text-slate-400">Manage your organization's staff</p>
                </div>
                <Button onClick={handleAdd}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Employee
                </Button>
            </div>

            <EmployeeModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSuccess={fetchEmployees}
                employeeToEdit={employeeToEdit}
            />

            <Card>
                <CardHeader>
                    <CardTitle>All Employees</CardTitle>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div>Loading...</div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="text-xs text-slate-500 uppercase bg-slate-50 dark:bg-slate-800 dark:text-slate-400">
                                    <tr>
                                        <th className="px-6 py-3">Employee ID</th>
                                        <th className="px-6 py-3">Name</th>
                                        <th className="px-6 py-3">Email</th>
                                        <th className="px-6 py-3">Department</th>
                                        <th className="px-6 py-3">Role</th>
                                        <th className="px-6 py-3">Status</th>
                                        <th className="px-6 py-3">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {employees.map((emp) => (
                                        <tr key={emp._id} className="bg-white border-b dark:bg-slate-900 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50">
                                            <td className="px-6 py-4 font-medium">{emp.employeeId}</td>
                                            <td className="px-6 py-4">{emp.name}</td>
                                            <td className="px-6 py-4">{emp.email}</td>
                                            <td className="px-6 py-4">{emp.department || '-'}</td>
                                            <td className="px-6 py-4 capitalize">{emp.role}</td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${emp.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                                    {emp.isActive ? 'Active' : 'Inactive'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 flex gap-2">
                                                <Button size="sm" variant="ghost" onClick={() => handleEdit(emp)}>
                                                    <Pencil className="h-4 w-4 text-slate-500" />
                                                </Button>
                                                <Button size="sm" variant="ghost" className="text-red-500 hover:text-red-600 hover:bg-red-50" onClick={() => handleDelete(emp._id)}>
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </td>
                                        </tr>
                                    ))}
                                    {employees.length === 0 && (
                                        <tr>
                                            <td colSpan={7} className="px-6 py-4 text-center text-slate-500">
                                                No employees found
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

export default Employees;
