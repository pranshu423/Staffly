import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { FileText, CheckCircle2, AlertCircle } from 'lucide-react';
import AttendanceWidget from '../components/dashboard/AttendanceWidget';
import StatsWidget from '../components/dashboard/StatsWidget';
import RecentActivity from '../components/dashboard/RecentActivity';
import { motion, type Variants } from 'framer-motion';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, rectSortingStrategy } from '@dnd-kit/sortable';
import { SortableWidget } from '../components/dashboard/SortableWidget';
import confetti from 'canvas-confetti';


const Dashboard = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const { onlineUsers } = useSocket();
    const [attendance, setAttendance] = useState<any>(null);
    const [pendingLeaves, setPendingLeaves] = useState(0);
    const [teamStatus, setTeamStatus] = useState<{ inOffice: number; totalEmployees: number; onLeave: number; previewEmployees?: any[] }>({ inOffice: 0, totalEmployees: 0, onLeave: 0 });
    const [recentActivity, setRecentActivity] = useState([]);
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);

    // Helper to get initials
    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map((n) => n[0])
            .join('')
            .toUpperCase()
            .substring(0, 2);
    };

    // Widgets State
    const [items, setItems] = useState(['attendance', 'stats', 'team']);

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 5,
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

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
        } finally {
            setFetching(false);
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
            confetti({
                particleCount: 100,
                spread: 70,
                origin: { y: 0.6 }
            });
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
            confetti({
                particleCount: 100,
                spread: 70,
                origin: { y: 0.6 },
                colors: ['#ef4444', '#f87171'] // Red confetti for checkout
            });
            await fetchDashboardData();
        } catch (error: any) {
            console.error('Check-out failed', error);
            alert(error.response?.data?.message || 'Check-out failed');
        } finally {
            setLoading(false);
        }
    };

    const handleDragEnd = (event: any) => {
        const { active, over } = event;

        if (active.id !== over.id) {
            setItems((items) => {
                const oldIndex = items.indexOf(active.id);
                const newIndex = items.indexOf(over.id);
                return arrayMove(items, oldIndex, newIndex);
            });
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

    const itemVariant: Variants = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 50 } }
    };

    const renderWidget = (id: string) => {
        switch (id) {
            case 'attendance':
                return (
                    <AttendanceWidget
                        checkInTime={attendance?.checkInTime}
                        checkOutTime={attendance?.checkOutTime}
                        onCheckIn={handleCheckIn}
                        onCheckOut={handleCheckOut}
                        loading={loading}
                        fetching={fetching}
                    />
                );
            case 'stats':
                if (user?.role === 'admin') {
                    return (
                        <StatsWidget title="Pending Requests" icon={AlertCircle} fetching={fetching}>
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
                    );
                } else {
                    return (
                        <StatsWidget title="My Status" icon={CheckCircle2} fetching={fetching}>
                            <div className="flex flex-col items-center text-center">
                                <div className="text-4xl font-bold text-slate-800 mb-2">Active</div>
                                <p className="text-slate-500">You are currently marked active.</p>
                            </div>
                        </StatsWidget>
                    );
                }
            case 'team':
                return (
                    <StatsWidget title="Team Status" icon={CheckCircle2} fetching={fetching}>
                        <div className="flex justify-between items-center mb-4 p-3 bg-green-50 rounded-lg border border-green-100">
                            <span className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                                <span className="relative flex h-3 w-3">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                                </span>
                                Online Now
                            </span>
                            <span className="text-lg font-bold text-green-700">{onlineUsers.length}</span>
                        </div>

                        <div className="flex justify-between items-center mb-2">
                            <span className="text-sm font-semibold text-slate-600">In Office</span>
                            <span className="text-sm font-bold text-slate-900">{teamStatus.inOffice} / {teamStatus.totalEmployees}</span>
                        </div>
                        <div className="w-full bg-slate-200 rounded-full h-2 mb-6">
                            <div
                                className="bg-blue-500 h-2 rounded-full transition-all duration-1000"
                                style={{ width: `${teamStatus.totalEmployees > 0 ? Math.min((teamStatus.inOffice / teamStatus.totalEmployees) * 100, 100) : 0}%` }}
                            ></div>
                        </div>

                        <div className="flex justify-between items-center mb-6">
                            <span className="text-sm font-semibold text-slate-600">On Leave</span>
                            <span className="text-sm font-bold text-slate-900">{teamStatus.onLeave}</span>
                        </div>

                        <div className="flex items-center gap-2">
                            {teamStatus.previewEmployees && teamStatus.previewEmployees.length > 0 ? (
                                <div className="flex -space-x-2 overflow-hidden">
                                    {teamStatus.previewEmployees.map((emp: any) => (
                                        <div
                                            key={emp._id}
                                            className="inline-flex h-8 w-8 items-center justify-center rounded-full ring-2 ring-white bg-indigo-500 text-white text-xs font-bold"
                                            title={emp.name}
                                        >
                                            {getInitials(emp.name)}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-xs text-slate-400 italic">No active employees</div>
                            )}
                        </div>

                        <button
                            onClick={() => navigate('/employees')}
                            className="text-blue-600 font-semibold text-sm mt-auto flex items-center gap-1 hover:gap-2 transition-all"
                        >
                            View all employees →
                        </button>
                    </StatsWidget>
                );
            default:
                return null;
        }
    };

    return (
        <motion.div
            className="space-y-8"
            variants={container}
            initial="hidden"
            animate="show"
        >
            <motion.div variants={itemVariant}>
                <h1 className="text-4xl font-bold tracking-tight text-slate-900 leading-tight">Dashboard</h1>
                <p className="text-slate-600 font-medium text-lg mt-2">
                    Welcome back, {user?.name}. Here's what's happening today.
                </p>
                <div className="mt-2 text-xs text-slate-900 font-bold">
                    💡 Tip: You can drag and drop widgets to reorder them!
                </div>
            </motion.div>

            {/* Widgets Grid - Draggable */}
            <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
            >
                <SortableContext items={items} strategy={rectSortingStrategy}>
                    <div className="grid gap-6 md:grid-cols-3">
                        {items.map((id) => (
                            <SortableWidget key={id} id={id} className="md:col-span-1 h-80">
                                {renderWidget(id)}
                            </SortableWidget>
                        ))}
                    </div>
                </SortableContext>
            </DndContext>

            {/* Recent Activity Section */}
            <motion.div variants={itemVariant}>
                <RecentActivity activities={recentActivity} />
            </motion.div>
        </motion.div>
    );
};

export default Dashboard;
