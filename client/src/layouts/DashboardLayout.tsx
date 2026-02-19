import { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import { useSocket } from '../context/SocketContext';
import { useAuth } from '../context/AuthContext';
import { Toaster, toast } from 'sonner';
import { AnimatePresence, motion } from 'framer-motion';

const DashboardLayout = () => {
    const { socket } = useSocket();
    const { user } = useAuth();
    const location = useLocation();

    useEffect(() => {
        if (!socket) return;

        socket.on('new_leave_request', (data: any) => {
            if (user?.role === 'admin') {
                toast.info(`New Leave Request`, {
                    description: `${data.employeeName} requested ${data.type} leave: ${data.reason}`,
                    duration: 5000,
                });
            }
        });

        socket.on('leave_status_updated', (data: any) => {
            toast.success(`Leave Status Updated`, {
                description: `Your leave request has been ${data.status}.`,
                duration: 5000,
            });
        });

        socket.on('new_candidate', (data: any) => {
            if (user?.role === 'admin') {
                toast.info(`New Application`, {
                    description: `${data.name} applied for ${data.position}`,
                    duration: 5000,
                });
            }
        });

        return () => {
            socket.off('new_leave_request');
            socket.off('leave_status_updated');
            socket.off('new_candidate');
        };
    }, [socket, user]);

    return (
        <div className="min-h-screen bg-midnight-animated flex font-sans text-slate-100">
            <Toaster richColors position="top-right" />
            <Sidebar />
            <div className="flex-1 ml-64 flex flex-col h-screen overflow-hidden">
                <Navbar />
                <main className="flex-1 p-6 overflow-auto">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={location.pathname}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.3 }}
                            className="h-full"
                        >
                            <Outlet />
                        </motion.div>
                    </AnimatePresence>
                </main>
            </div>
        </div>
    );
};

export default DashboardLayout;
