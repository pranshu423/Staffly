import { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { useAuth } from '../context/AuthContext';

interface AttendanceRecord {
    _id: string;
    date: string;
    checkInTime: string;
    checkOutTime?: string;
    status: string;
    workDuration: number;
    employeeId: {
        name: string;
        email: string;
    } | string; // Populated or ID
}

const Attendance = () => {
    const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();
    const isAdmin = user?.role === 'admin';

    useEffect(() => {
        const fetchAttendance = async () => {
            try {
                const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
                const endpoint = isAdmin
                    ? `${apiUrl}/api/attendance/all`
                    : `${apiUrl}/api/attendance/me`;

                const { data } = await axios.get(endpoint, { withCredentials: true });
                setAttendance(data);
            } catch (error) {
                console.error('Failed to fetch attendance', error);
            } finally {
                setLoading(false);
            }
        };

        fetchAttendance();
    }, [isAdmin]);

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-4xl font-bold tracking-tight text-white mb-2">Attendance</h1>
                <p className="text-slate-300 text-lg">View attendance records</p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="text-white text-xl">{isAdmin ? 'All Employee Attendance' : 'My Attendance History'}</CardTitle>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div>Loading...</div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="text-xs text-slate-400 uppercase bg-slate-900/50 border-b border-white/10">
                                    <tr>
                                        {isAdmin && <th className="px-6 py-4 font-bold tracking-wider">Employee</th>}
                                        <th className="px-6 py-4 font-bold tracking-wider">Date</th>
                                        <th className="px-6 py-4 font-bold tracking-wider">Check In</th>
                                        <th className="px-6 py-4 font-bold tracking-wider">Check Out</th>
                                        <th className="px-6 py-4 font-bold tracking-wider">Duration (Hrs)</th>
                                        <th className="px-6 py-4 font-bold tracking-wider">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {Array.isArray(attendance) && attendance.map((record) => (
                                        <tr key={record._id} className="bg-transparent hover:bg-white/5 transition-colors text-slate-200">
                                            {isAdmin && (
                                                <td className="px-6 py-4 font-bold text-white">
                                                    {record.employeeId && typeof record.employeeId === 'object' ? record.employeeId.name : 'Unknown'}
                                                </td>
                                            )}
                                            <td className="px-6 py-4 font-medium">{new Date(record.date).toLocaleDateString()}</td>
                                            <td className="px-6 py-4">{new Date(record.checkInTime).toLocaleTimeString()}</td>
                                            <td className="px-6 py-4">
                                                {record.checkOutTime ? new Date(record.checkOutTime).toLocaleTimeString() : '-'}
                                            </td>
                                            <td className="px-6 py-4">{record.workDuration ? record.workDuration.toFixed(2) : '-'}</td>
                                            <td className="px-6 py-4">
                                                <span className={`px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider ${record.status === 'Present' ? 'bg-green-500/20 text-green-300 border border-green-500/30' :
                                                    record.status === 'Absent' ? 'bg-red-500/20 text-red-300 border border-red-500/30' : 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30'
                                                    }`}>
                                                    {record.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                    {(!Array.isArray(attendance) || attendance.length === 0) && (
                                        <tr>
                                            <td colSpan={isAdmin ? 6 : 5} className="px-6 py-12 text-center text-slate-400">
                                                <div className="flex flex-col items-center justify-center gap-2">
                                                    <div className="text-lg font-bold text-white">No attendance records found</div>
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

export default Attendance;
