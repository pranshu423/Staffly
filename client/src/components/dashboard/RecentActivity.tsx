
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
                <h3 className="text-xl font-bold text-slate-800">Recent Attendance Activity</h3>
                <button
                    onClick={() => navigate('/attendance')}
                    className="text-sm font-semibold text-blue-600 hover:text-blue-700"
                >
                    View History
                </button>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-slate-200/50 text-left">
                            <th className="pb-4 pt-2 font-semibold text-slate-500 text-sm">Employee</th>
                            <th className="pb-4 pt-2 font-semibold text-slate-500 text-sm">Status</th>
                            <th className="pb-4 pt-2 font-semibold text-slate-500 text-sm">Check In</th>
                            <th className="pb-4 pt-2 font-semibold text-slate-500 text-sm">Check Out</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200/30">
                        {activities.length > 0 ? (
                            activities.map((activity) => (
                                <tr key={activity._id} className="group hover:bg-white/30 transition-colors">
                                    <td className="py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold bg-purple-100 text-purple-600">
                                                {getInitials(activity.employeeId?.name || 'Unknown')}
                                            </div>
                                            <span className="font-bold text-slate-700">{activity.employeeId?.name || 'Unknown'}</span>
                                        </div>
                                    </td>
                                    <td className="py-4">
                                        <span className={`text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wide ${activity.checkOutTime ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                                            {activity.checkOutTime ? 'Present (Out)' : 'Present (In)'}
                                        </span>
                                    </td>
                                    <td className="py-4 font-medium text-slate-600">{formatTime(activity.checkInTime)}</td>
                                    <td className="py-4 font-medium text-slate-600">{formatTime(activity.checkOutTime)}</td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={4} className="py-8 text-center text-slate-500 text-sm">
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
