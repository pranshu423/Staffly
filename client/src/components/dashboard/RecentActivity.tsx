
import React from 'react';

import { useNavigate } from 'react-router-dom';

interface Activity {
    _id: string;
    employeeId: {
        name: string;
    };
    checkInTime: string;
    checkOutTime?: string;
    status: string;
}

interface RecentActivityProps {
    activities: Activity[];
}

const RecentActivity: React.FC<RecentActivityProps> = ({ activities }) => {
    const navigate = useNavigate();

    // Helper to format time
    const formatTime = (dateString?: string) => {
        if (!dateString) return '--:--';
        return new Date(dateString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    // Helper to get initials
    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map((n) => n[0])
            .join('')
            .toUpperCase()
            .substring(0, 2);
    };

    return (
        <div className="glass-card p-6 mt-6">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-white">Recent Attendance Activity</h3>
                <button
                    onClick={() => navigate('/attendance')}
                    className="text-sm font-semibold text-blue-400 hover:text-blue-300"
                >
                    View History
                </button>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-white/10 text-left">
                            <th className="pb-4 pt-2 font-semibold text-slate-400 text-sm">Employee</th>
                            <th className="pb-4 pt-2 font-semibold text-slate-400 text-sm">Status</th>
                            <th className="pb-4 pt-2 font-semibold text-slate-400 text-sm">Check In</th>
                            <th className="pb-4 pt-2 font-semibold text-slate-400 text-sm">Check Out</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {activities.length > 0 ? (
                            activities.map((activity) => (
                                <tr key={activity._id} className="group hover:bg-white/5 transition-colors">
                                    <td className="py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold bg-purple-500/20 text-purple-300 ring-1 ring-purple-500/30">
                                                {getInitials(activity.employeeId?.name || 'Unknown')}
                                            </div>
                                            <span className="font-bold text-white">{activity.employeeId?.name || 'Unknown'}</span>
                                        </div>
                                    </td>
                                    <td className="py-4">
                                        <span className={`text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wide ${activity.checkOutTime ? 'bg-green-500/20 text-green-300 ring-1 ring-green-500/30' : 'bg-blue-500/20 text-blue-300 ring-1 ring-blue-500/30'}`}>
                                            {activity.checkOutTime ? 'Present (Out)' : 'Present (In)'}
                                        </span>
                                    </td>
                                    <td className="py-4 font-medium text-slate-300">{formatTime(activity.checkInTime)}</td>
                                    <td className="py-4 font-medium text-slate-300">{formatTime(activity.checkOutTime)}</td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={4} className="py-8 text-center text-slate-400 text-sm">
                                    No activity recorded today.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default RecentActivity;
