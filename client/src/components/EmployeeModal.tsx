import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import axios from 'axios';

interface Employee {
    _id: string;
    name: string;
    email: string;
    employeeId: string;
    department: string;
    role: string;
    joiningDate: string;
    password?: string;
}

interface EmployeeModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    employeeToEdit?: Employee | null;
}

const EmployeeModal: React.FC<EmployeeModalProps> = ({ isOpen, onClose, onSuccess, employeeToEdit }) => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        department: '',
        role: 'employee',
        joiningDate: new Date().toISOString().split('T')[0]
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (employeeToEdit) {
            setFormData({
                name: employeeToEdit.name,
                email: employeeToEdit.email,
                password: '', // Leave blank to keep existing
                department: employeeToEdit.department || '',
                role: employeeToEdit.role,
                joiningDate: employeeToEdit.joiningDate ? new Date(employeeToEdit.joiningDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]
            });
        } else {
            setFormData({
                name: '',
                email: '',
                password: '',
                department: '',
                role: 'employee',
                joiningDate: new Date().toISOString().split('T')[0]
            });
        }
        setError('');
    }, [employeeToEdit, isOpen]);

    if (!isOpen) return null;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
            if (employeeToEdit) {
                await axios.put(`${apiUrl}/api/employees/${employeeToEdit._id}`, formData, { withCredentials: true });
            } else {
                await axios.post(`${apiUrl}/api/employees`, formData, { withCredentials: true });
            }
            onSuccess();
            onClose();
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to save employee');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md">
            <div className="glass-card w-full max-w-md p-8 relative !bg-slate-900/90 !border-white/10 animate-in fade-in zoom-in-95 duration-300">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-slate-400 hover:text-white bg-white/5 rounded-full p-2 hover:bg-white/10 transition-colors"
                >
                    <X className="h-4 w-4" />
                </button>

                <h2 className="text-2xl font-bold mb-6 text-white tracking-tight">
                    {employeeToEdit ? 'Edit Employee' : 'Add New Employee'}
                </h2>

                {error && <div className="mb-4 p-3 bg-red-500/20 text-red-300 border border-red-500/30 rounded-lg text-sm font-medium">{error}</div>}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <Input
                        label="Full Name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                    />
                    <Input
                        label="Email"
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                    />
                    <Input
                        label={employeeToEdit ? "Password (Leave blank to keep current)" : "Password"}
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        required={!employeeToEdit}
                        autoComplete="new-password"
                    />
                    <Input
                        label="Department"
                        name="department"
                        value={formData.department}
                        onChange={handleChange}
                    />

                    <Input
                        label="Joining Date"
                        type="date"
                        name="joiningDate"
                        value={formData.joiningDate}
                        onChange={handleChange}
                        required
                    />

                    <div className="flex justify-end gap-3 mt-6">
                        <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
                        <Button type="submit" isLoading={loading}>
                            {employeeToEdit ? 'Update Employee' : 'Add Employee'}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EmployeeModal;
