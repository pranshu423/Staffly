import React, { useState } from 'react';
import { X } from 'lucide-react';
import { Button } from './ui/Button';

import axios from 'axios';

interface ApplyLeaveModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

const ApplyLeaveModal: React.FC<ApplyLeaveModalProps> = ({ isOpen, onClose, onSuccess }) => {
    const [formData, setFormData] = useState({
        type: 'casual',
        fromDate: '',
        toDate: '',
        reason: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    if (!isOpen) return null;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
            await axios.post(`${apiUrl}/api/leaves/apply`, formData, { withCredentials: true });
            onSuccess();
            onClose();
            // Reset form
            setFormData({
                type: 'casual',
                fromDate: '',
                toDate: '',
                reason: ''
            });
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to apply for leave');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-white dark:bg-slate-900 rounded-lg shadow-lg w-full max-w-md p-6 relative animate-in fade-in zoom-in-95 duration-200">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                >
                    <X className="h-5 w-5" />
                </button>

                <h2 className="text-xl font-bold mb-4 text-slate-900 dark:text-slate-100">
                    Apply for Leave
                </h2>

                {error && <div className="mb-4 p-2 bg-red-100 text-red-700 rounded text-sm">{error}</div>}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-1">
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                            Leave Type
                        </label>
                        <select
                            name="type"
                            value={formData.type}
                            onChange={handleChange}
                            className="flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                        >
                            <option value="casual">Casual Leave</option>
                            <option value="sick">Sick Leave</option>
                            <option value="paid">Paid Leave</option>
                        </select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                                From Date
                            </label>
                            <input
                                type="date"
                                name="fromDate"
                                value={formData.fromDate}
                                onChange={handleChange}
                                required
                                className="flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                                To Date
                            </label>
                            <input
                                type="date"
                                name="toDate"
                                value={formData.toDate}
                                onChange={handleChange}
                                required
                                className="flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                            />
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                            Reason
                        </label>
                        <textarea
                            name="reason"
                            value={formData.reason}
                            onChange={handleChange}
                            required
                            rows={3}
                            className="flex w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                            placeholder="Brief reason for your leave..."
                        />
                    </div>

                    <div className="flex justify-end gap-3 mt-6">
                        <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
                        <Button type="submit" isLoading={loading}>
                            Submit Request
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ApplyLeaveModal;
