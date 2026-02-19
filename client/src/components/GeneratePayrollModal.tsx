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
            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
            const { data } = await axios.get(`${apiUrl}/api/employees`, { withCredentials: true });
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
            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
            await axios.post(`${apiUrl}/api/payroll/generate`, formData, { withCredentials: true });
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md">
            <div className="glass-card w-full max-w-md p-8 relative !bg-slate-900/90 !border-white/10">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-slate-400 hover:text-white bg-white/5 p-2 rounded-full hover:bg-white/10 transition-colors"
                >
                    <X className="h-5 w-5" />
                </button>

                <h2 className="text-2xl font-bold mb-6 text-white tracking-tight">Generate Payroll</h2>

                {error && <div className="mb-6 p-4 bg-red-500/10 text-red-300 border border-red-500/20 rounded-xl text-sm font-medium">{error}</div>}

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="space-y-2">
                        <label className="block text-sm font-bold text-slate-300 ml-1">
                            Employee
                        </label>
                        <select
                            name="employeeId"
                            value={formData.employeeId}
                            onChange={handleChange}
                            className="flex h-12 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-white appearance-none hover:bg-white/10 transition-colors"
                            required
                        >
                            <option value="" disabled className="bg-slate-900">Select Employee</option>
                            {employees.map(emp => (
                                <option key={emp._id} value={emp._id} className="bg-slate-900">{emp.name}</option>
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
