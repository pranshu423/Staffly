import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import axios from 'axios';

interface GeneratePayrollModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

const GeneratePayrollModal: React.FC<GeneratePayrollModalProps> = ({ isOpen, onClose, onSuccess }) => {
    const [employees, setEmployees] = useState<any[]>([]);
    const [formData, setFormData] = useState({
        employeeId: '',
        month: new Date().toISOString().slice(0, 7), // YYYY-MM
        baseSalary: '',
        deductions: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (isOpen) {
            fetchEmployees();
        }
    }, [isOpen]);

    const fetchEmployees = async () => {
        try {
            const { data } = await axios.get('http://localhost:5000/api/employees', { withCredentials: true });
            setEmployees(data);
            if (data.length > 0 && !formData.employeeId) {
                setFormData(prev => ({ ...prev, employeeId: data[0]._id }));
            }
        } catch (error) {
            console.error('Failed to fetch employees', error);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            await axios.post('http://localhost:5000/api/payroll/generate', formData, { withCredentials: true });
            onSuccess();
            onClose();
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to generate payroll');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-white dark:bg-slate-900 rounded-lg shadow-lg w-full max-w-md p-6 relative">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                >
                    <X className="h-5 w-5" />
                </button>

                <h2 className="text-xl font-bold mb-4 text-slate-900 dark:text-slate-100">Generate Payroll</h2>

                {error && <div className="mb-4 p-2 bg-red-100 text-red-700 rounded text-sm">{error}</div>}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-1">
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                            Employee
                        </label>
                        <select
                            name="employeeId"
                            value={formData.employeeId}
                            onChange={handleChange}
                            className="flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                            required
                        >
                            <option value="" disabled>Select Employee</option>
                            {employees.map(emp => (
                                <option key={emp._id} value={emp._id}>{emp.name}</option>
                            ))}
                        </select>
                    </div>

                    <Input
                        label="Month"
                        type="month"
                        name="month"
                        value={formData.month}
                        onChange={handleChange}
                        required
                    />

                    <div className="grid grid-cols-2 gap-4">
                        <Input
                            label="Base Salary"
                            type="number"
                            name="baseSalary"
                            value={formData.baseSalary}
                            onChange={handleChange}
                            required
                            min="0"
                        />
                        <Input
                            label="Deductions"
                            type="number"
                            name="deductions"
                            value={formData.deductions}
                            onChange={handleChange}
                            min="0"
                        />
                    </div>

                    <div className="flex justify-end gap-3 mt-6">
                        <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
                        <Button type="submit" isLoading={loading}>Generate</Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default GeneratePayrollModal;
