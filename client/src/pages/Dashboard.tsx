import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Clock, CalendarDays, FileText, CheckCircle2, AlertCircle } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { motion } from 'framer-motion';

const Dashboard = () => {
    const { user } = useAuth();
    const today = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    const [attendance, setAttendance] = useState<any>(null);
    const [leaveBalance, setLeaveBalance] = useState<any>(null);
    const [pendingLeaves, setPendingLeaves] = useState(0);
    const [loading, setLoading] = useState(false);

    const fetchTodayAttendance = async () => {
        try {
            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
            const { data } = await axios.get(`${apiUrl}/api/attendance/today`, { withCredentials: true });
            setAttendance(data);
        } catch (error) {
            console.error('Failed to fetch attendance', error);
        }
    };

    const fetchLeaveData = async () => {
        if (!user) return;
        try {
            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
            if (user.role === 'employee') {
                const { data } = await axios.get(`${apiUrl}/api/leaves/balance`, { withCredentials: true });
                setLeaveBalance(data);
            } else if (user.role === 'admin') {
                const { data } = await axios.get(`${apiUrl}/api/leaves/all`, { withCredentials: true });
                setPendingLeaves(data.filter((l: any) => l.status === 'pending').length);
            }
        } catch (error) {
            console.error('Failed to fetch leave data', error);
        }
    };

    useEffect(() => {
        fetchTodayAttendance();
        fetchLeaveData();
    }, [user]);

    const handleCheckIn = async () => {
        try {
            setLoading(true);
            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
            await axios.post(`${apiUrl}/api/attendance/check-in`, {}, { withCredentials: true });
            await fetchTodayAttendance();
        } catch (error: any) {
            console.error('Check-in failed', error);
            alert(error.response?.data?.message || 'Check-in failed');
        } finally {
            setLoading(false);
        }
    };

    const handleCheckOut = async () => {
        try {
            setLoading(true);
            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
            await axios.post(`${apiUrl}/api/attendance/check-out`, {}, { withCredentials: true });
            await fetchTodayAttendance();
        } catch (error: any) {
            console.error('Check-out failed', error);
            alert(error.response?.data?.message || 'Check-out failed');
        } finally {
            setLoading(false);
        }
    };

    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const item = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0 }
    };

    return (
        <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="space-y-6"
        >
            <motion.div variants={item}>
                <h1 className="text-3xl font-bold tracking-tight text-slate-800 dark:text-slate-100">Dashboard</h1>
                <p className="text-slate-600 dark:text-slate-400 font-medium">Welcome back, {user?.name}</p>
            </motion.div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                <motion.div variants={item}>
                    <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-800 backdrop-blur-sm overflow-hidden relative">
                        <div className="absolute top-0 right-0 p-4 opacity-10">
                            <Clock className="w-24 h-24" />
                        </div>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
                            <CardTitle className="text-sm font-semibold text-slate-800 dark:text-slate-200">Today's Attendance</CardTitle>
                            <Clock className="h-4 w-4 text-primary" />
                        </CardHeader>
                        <CardContent className="relative z-10">
                            <div className="text-xs text-slate-600 mb-6 font-semibold uppercase tracking-wider">{today}</div>
                            <div className="flex flex-col gap-3">
                                {attendance ? (
                                    <>
                                        <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-100 dark:border-green-900/30">
                                            <div className="flex items-center gap-2">
                                                <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-green-400" />
                                                <span className="text-sm font-medium text-green-700 dark:text-green-300">Check In</span>
                                            </div>
                                            <span className="text-sm font-bold text-slate-900 dark:text-slate-100">
                                                {new Date(attendance.checkInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>
                                        {attendance.checkOutTime ? (
                                            <div className="flex items-center justify-between p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-100 dark:border-orange-900/30">
                                                <div className="flex items-center gap-2">
                                                    <LogOutIcon className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                                                    <span className="text-sm font-medium text-orange-700 dark:text-orange-300">Check Out</span>
                                                </div>
                                                <span className="text-sm font-bold text-slate-900 dark:text-slate-100">
                                                    {new Date(attendance.checkOutTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                            </div>
                                        ) : (
                                            <Button
                                                variant="outline"
                                                className="w-full mt-2 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 hover:border-red-300 transition-colors"
                                                onClick={handleCheckOut}
                                                isLoading={loading}
                                            >
                                                Check Out
                                            </Button>
                                        )}
                                    </>
                                ) : (
                                    <div className="text-center py-4">
                                        <p className="text-sm text-slate-500 mb-4">You haven't checked in yet today.</p>
                                        <Button
                                            className="w-full bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20 transition-all hover:scale-[1.02]"
                                            onClick={handleCheckIn}
                                            isLoading={loading}
                                        >
                                            Check In Now
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                {user?.role === 'employee' && (
                    <motion.div variants={item}>
                        <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-800 backdrop-blur-sm overflow-hidden relative">
                            <div className="absolute top-0 right-0 p-4 opacity-10">
                                <CalendarDays className="w-24 h-24" />
                            </div>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
                                <CardTitle className="text-sm font-medium text-slate-700 dark:text-slate-300">Leave Balance</CardTitle>
                                <CalendarDays className="h-4 w-4 text-primary" />
                            </CardHeader>
                            <CardContent className="relative z-10">
                                <div className="grid grid-cols-3 gap-3 mt-4">
                                    <BalanceCard label="Casual" count={leaveBalance?.casual || 0} color="blue" />
                                    <BalanceCard label="Sick" count={leaveBalance?.sick || 0} color="red" />
                                    <BalanceCard label="Paid" count={leaveBalance?.paid || 0} color="green" />
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                )}

                {user?.role === 'admin' && (
                    <motion.div variants={item}>
                        <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-800 backdrop-blur-sm overflow-hidden relative">
                            <div className="absolute top-0 right-0 p-4 opacity-10">
                                <FileText className="w-24 h-24" />
                            </div>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
                                <CardTitle className="text-sm font-medium text-slate-700 dark:text-slate-300">Pending Requests</CardTitle>
                                <AlertCircle className="h-4 w-4 text-orange-500" />
                            </CardHeader>
                            <CardContent className="relative z-10">
                                <div className="mt-4 flex items-baseline gap-2">
                                    <span className="text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">{pendingLeaves}</span>
                                    <span className="text-sm text-slate-500 font-medium">pending approvals</span>
                                </div>
                                <p className="text-xs text-slate-400 mt-2">
                                    Employees waiting for your response.
                                </p>
                            </CardContent>
                        </Card>
                    </motion.div>
                )}
            </div>
        </motion.div>
    );
};

// Helper components for cleaner code
const LogOutIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" x2="9" y1="12" y2="12" /></svg>
);

const BalanceCard = ({ label, count, color }: { label: string, count: number, color: string }) => {
    const colorClasses: Record<string, string> = {
        blue: 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300 border-blue-100 dark:border-blue-900/30',
        red: 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-300 border-red-100 dark:border-red-900/30',
        green: 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-300 border-green-100 dark:border-green-900/30',
    };

    return (
        <div className={`p-3 rounded-xl border ${colorClasses[color]} flex flex-col items-center justify-center transition-transform hover:scale-105`}>
            <div className="text-2xl font-bold">{count}</div>
            <div className="text-[10px] uppercase tracking-wider font-semibold opacity-80">{label}</div>
        </div>
    );
};

export default Dashboard;
