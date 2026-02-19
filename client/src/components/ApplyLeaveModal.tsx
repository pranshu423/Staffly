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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md">
            <div className="glass-card w-full max-w-md p-8 relative !bg-slate-900/90 !border-white/10 animate-in fade-in zoom-in-95 duration-300">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-slate-400 hover:text-white bg-white/5 p-2 rounded-full hover:bg-white/10 transition-colors"
                >
                    <X className="h-5 w-5" />
                </button>

                <h2 className="text-2xl font-bold mb-6 text-white tracking-tight">
                    Apply for Leave
                </h2>

                {error && <div className="mb-6 p-4 bg-red-500/10 text-red-300 border border-red-500/20 rounded-xl text-sm font-medium">{error}</div>}

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="space-y-2">
                        <label className="block text-sm font-bold text-slate-300 ml-1">
                            Leave Type
                        </label>
                        <select
                            name="type"
                            value={formData.type}
                            onChange={handleChange}
                            className="flex h-12 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-white appearance-none hover:bg-white/10 transition-colors"
                        >
                            <option value="casual" className="bg-slate-900">Casual Leave</option>
                            <option value="sick" className="bg-slate-900">Sick Leave</option>
                            <option value="paid" className="bg-slate-900">Paid Leave</option>
                        </select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="block text-sm font-bold text-slate-300 ml-1">
                                From Date
                            </label>
                            <input
                                type="date"
                                name="fromDate"
                                value={formData.fromDate}
                                onChange={handleChange}
                                required
                                className="flex h-12 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-white hover:bg-white/10 transition-colors"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="block text-sm font-bold text-slate-300 ml-1">
                                To Date
                            </label>
                            <input
                                type="date"
                                name="toDate"
                                value={formData.toDate}
                                onChange={handleChange}
                                required
                                className="flex h-12 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-white hover:bg-white/10 transition-colors"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="block text-sm font-bold text-slate-300 ml-1">
                            Reason
                        </label>
                        <textarea
                            name="reason"
                            value={formData.reason}
                            onChange={handleChange}
                            required
                            rows={3}
                            className="flex w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-white resize-none hover:bg-white/10 transition-colors"
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
