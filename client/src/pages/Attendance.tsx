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
                const endpoint = isAdmin
                    ? 'http://localhost:5000/api/attendance/all'
                    : 'http://localhost:5000/api/attendance/me';

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
                <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">Attendance</h1>
                <p className="text-slate-500 dark:text-slate-400">View attendance records</p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>{isAdmin ? 'All Employee Attendance' : 'My Attendance History'}</CardTitle>
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
                                        <th className="px-6 py-3">Date</th>
                                        <th className="px-6 py-3">Check In</th>
                                        <th className="px-6 py-3">Check Out</th>
                                        <th className="px-6 py-3">Duration (Hrs)</th>
                                        <th className="px-6 py-3">Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {attendance.map((record) => (
                                        <tr key={record._id} className="bg-white border-b dark:bg-slate-900 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50">
                                            {isAdmin && (
                                                <td className="px-6 py-4 font-medium">
                                                    {typeof record.employeeId === 'object' ? record.employeeId.name : 'Unknown'}
                                                </td>
                                            )}
                                            <td className="px-6 py-4">{new Date(record.date).toLocaleDateString()}</td>
                                            <td className="px-6 py-4">{new Date(record.checkInTime).toLocaleTimeString()}</td>
                                            <td className="px-6 py-4">
                                                {record.checkOutTime ? new Date(record.checkOutTime).toLocaleTimeString() : '-'}
                                            </td>
                                            <td className="px-6 py-4">{record.workDuration || '-'}</td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${record.status === 'Present' ? 'bg-green-100 text-green-800' :
                                                        record.status === 'Absent' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
                                                    }`}>
                                                    {record.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                    {attendance.length === 0 && (
                                        <tr>
                                            <td colSpan={isAdmin ? 6 : 5} className="px-6 py-4 text-center text-slate-500">
                                                No attendance records found
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
