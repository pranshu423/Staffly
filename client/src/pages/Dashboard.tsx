import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { FileText, CheckCircle2, AlertCircle } from 'lucide-react';
import AttendanceWidget from '../components/dashboard/AttendanceWidget';
import StatsWidget from '../components/dashboard/StatsWidget';
import RecentActivity from '../components/dashboard/RecentActivity';
import { motion, type Variants } from 'framer-motion';

const Dashboard = () => {
    const { user } = useAuth();
    const [attendance, setAttendance] = useState<any>(null);
    const [pendingLeaves, setPendingLeaves] = useState(0);
    const [teamStatus, setTeamStatus] = useState({ inOffice: 0, totalEmployees: 0, onLeave: 0 });
    const [recentActivity, setRecentActivity] = useState([]);
    const [loading, setLoading] = useState(false);

    const fetchDashboardData = async () => {
        try {
            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
            const headers = { withCredentials: true };

            const [attendanceRes, leavesRes, teamRes, recentRes] = await Promise.all([
                axios.get(`${apiUrl}/api/attendance/today`, headers),
                user?.role === 'admin' ? axios.get(`${apiUrl}/api/leaves/all`, headers) : Promise.resolve({ data: [] }),
                axios.get(`${apiUrl}/api/attendance/team-status`, headers),
                axios.get(`${apiUrl}/api/attendance/recent-activity`, headers)
            ]);

            setAttendance(attendanceRes.data);
            if (user?.role === 'admin') {
                setPendingLeaves(leavesRes.data.filter((l: any) => l.status === 'pending').length);
            }
            setTeamStatus(teamRes.data);
            setRecentActivity(recentRes.data);

        } catch (error) {
            console.error('Failed to fetch dashboard data', error);
        }
    };

    useEffect(() => {
        if (user) {
            fetchDashboardData();
        }
    }, [user]);

    const handleCheckIn = async () => {
        try {
            setLoading(true);
            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
            await axios.post(`${apiUrl}/api/attendance/check-in`, {}, { withCredentials: true });
            await fetchDashboardData();
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
            await fetchDashboardData();
        } catch (error: any) {
            console.error('Check-out failed', error);
            alert(error.response?.data?.message || 'Check-out failed');
        } finally {
            setLoading(false);
        }
    };

    const container: Variants = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
                delayChildren: 0.2
            }
        }
    };

    const item: Variants = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 50 } }
    };

    return (
        <motion.div
            className="space-y-8"
            variants={container}
            initial="hidden"
            animate="show"
        >
            <motion.div variants={item}>
                <h1 className="text-4xl font-bold tracking-tight text-slate-900 leading-tight">Dashboard</h1>
                <p className="text-slate-600 font-medium text-lg mt-2">
                    Welcome back, {user?.name}. Here's what's happening today.
                </p>
            </motion.div>

            {/* Widgets Grid */}
            <div className="grid gap-6 md:grid-cols-3">
                {/* Attendance Widget */}
                <motion.div variants={item} className="md:col-span-1 h-80">
                    <AttendanceWidget
                        checkInTime={attendance?.checkInTime}
                        checkOutTime={attendance?.checkOutTime}
                        onCheckIn={handleCheckIn}
                        onCheckOut={handleCheckOut}
                        loading={loading}
                    />
                </motion.div>

                {/* Pending Requests Widget */}
                {user?.role === 'admin' ? (
                    <motion.div variants={item} className="md:col-span-1 h-80">
                        <StatsWidget title="Pending Requests" icon={AlertCircle}>
                            <div className="flex items-center gap-6">
                                <div className="bg-orange-100 p-4 rounded-2xl">
                                    <FileText className="w-12 h-12 text-orange-500" />
                                </div>
                                <div>
                                    <div className="text-6xl font-bold text-slate-800">{pendingLeaves}</div>
                                    <div className="text-slate-500 font-medium leading-tight mt-1">pending<br />approvals</div>
                                </div>
                            </div>
                            <div className="mt-8 text-sm text-slate-500 font-medium">
                                Employees waiting for your response.
                            </div>
                        </StatsWidget>
                    </motion.div>
                ) : (
                    <motion.div variants={item} className="md:col-span-1 h-80">
                        {/* Placeholder for Employee second widget if needed, keeping it balanced */}
                        <StatsWidget title="My Status" icon={CheckCircle2}>
                            <div className="flex flex-col items-center text-center">
                                <div className="text-4xl font-bold text-slate-800 mb-2">Active</div>
                                <p className="text-slate-500">You are currently marked active.</p>
                            </div>
                        </StatsWidget>
                    </motion.div>
                )}

                {/* Team Status Widget (Visual Only for now as per design) */}
                <motion.div variants={item} className="md:col-span-1 h-80">
                    <StatsWidget title="Team Status" icon={CheckCircle2}>
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-sm font-semibold text-slate-600">In Office</span>
                            <span className="text-sm font-bold text-slate-900">{teamStatus.inOffice} / {teamStatus.totalEmployees}</span>
                        </div>
                        <div className="w-full bg-slate-200 rounded-full h-2 mb-6">
                            <div
                                className="bg-green-500 h-2 rounded-full transition-all duration-1000"
                                style={{ width: `${teamStatus.totalEmployees > 0 ? (teamStatus.inOffice / teamStatus.totalEmployees) * 100 : 0}%` }}
                            ></div>
                        </div>

                        <div className="flex justify-between items-center mb-6">
                            <span className="text-sm font-semibold text-slate-600">On Leave</span>
                            <span className="text-sm font-bold text-slate-900">{teamStatus.onLeave}</span>
                        </div>

                        <div className="flex items-center">
                            {/* Mock Avatars */}
                            <div className="flex -space-x-2 overflow-hidden">
                                <div className="inline-block h-8 w-8 rounded-full ring-2 ring-white bg-gray-300"></div>
                                <div className="inline-block h-8 w-8 rounded-full ring-2 ring-white bg-gray-400"></div>
                                <div className="inline-block h-8 w-8 rounded-full ring-2 ring-white bg-gray-500"></div>
                            </div>
                        </div>

                        <button className="text-blue-600 font-semibold text-sm mt-auto flex items-center gap-1 hover:gap-2 transition-all">
                            View all employees →
                        </button>
                    </StatsWidget>
                </motion.div>
            </div>

            {/* Recent Activity Section */}
            <motion.div variants={item}>
                <RecentActivity activities={recentActivity} />
            </motion.div>
        </motion.div>
    );
};

export default Dashboard;
