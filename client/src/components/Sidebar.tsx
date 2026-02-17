import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, Clock, CalendarDays, Receipt, LogOut, Briefcase, Box, FileText, Network } from 'lucide-react';
import { clsx } from 'clsx';
import { useAuth } from '../context/AuthContext';

const Sidebar = () => {
    const location = useLocation();
    const { logout, user } = useAuth();
    const isAdmin = user?.role === 'admin';

    const menuItems = [
        { name: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
        ...(isAdmin ? [
            { name: 'Employees', icon: Users, path: '/employees' },
            { name: 'Recruitment', icon: Briefcase, path: '/recruitment' },
            { name: 'Assets', icon: Box, path: '/assets' }
        ] : []),
        { name: 'Org Chart', icon: Network, path: '/org-chart' },
        { name: 'Attendance', icon: Clock, path: '/attendance' },
        { name: 'Leaves', icon: CalendarDays, path: '/leaves' },
        { name: 'Payroll', icon: Receipt, path: '/payroll' },
        { name: 'Documents', icon: FileText, path: '/documents' },

    ];

    return (
        <div className="h-screen w-64 glass-matte border-r border-white/50 flex flex-col fixed left-0 top-0 z-50">
            <div className="p-8 flex items-center gap-2">
                <span className="text-3xl font-['Pacifico'] text-slate-800 tracking-wide">Staffly</span>
            </div>

            <nav className="flex-1 px-4 space-y-2 overflow-y-auto mt-4">
                {menuItems.map((item) => {
                    const isActive = location.pathname === item.path;
                    return (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={clsx(
                                'flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all duration-200',
                                isActive
                                    ? 'bg-white/60 text-slate-900 shadow-lg shadow-black/5'
                                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/30'
                            )}
                        >
                            <item.icon className={clsx("h-5 w-5", isActive ? "text-slate-900" : "text-slate-500")} />
                            {item.name}
                        </Link>
                    );
                })}
            </nav>

            <div className="p-6 border-t border-slate-200/50 space-y-2">
                <button
                    onClick={logout}
                    className="flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold text-red-600 hover:text-red-700 hover:bg-red-50 w-full transition-colors"
                >
                    <LogOut className="h-5 w-5" />
                    <span>Logout</span>
                </button>
            </div>
        </div>
    );
};

export default Sidebar;
