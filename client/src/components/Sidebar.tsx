import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, Clock, CalendarDays, Receipt, Moon, Sun, LogOut } from 'lucide-react';
import { clsx } from 'clsx';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const Sidebar = () => {
    const location = useLocation();
    const { logout, user } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const isAdmin = user?.role === 'admin';

    const menuItems = [
        { name: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
        ...(isAdmin ? [{ name: 'Employees', icon: Users, path: '/employees' }] : []),
        { name: 'Attendance', icon: Clock, path: '/attendance' },
        { name: 'Leaves', icon: CalendarDays, path: '/leaves' },
        { name: 'Payroll', icon: Receipt, path: '/payroll' },
    ];

    return (
        <div className="h-screen w-64 bg-slate-900 text-white flex flex-col fixed left-0 top-0">
            <div className="p-6 border-b border-slate-800 flex items-center gap-2">
                <Users className="h-6 w-6 text-primary" />
                <span className="text-xl font-bold">Staffly</span>
            </div>

            <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                {menuItems.map((item) => {
                    const isActive = location.pathname === item.path;
                    return (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={clsx(
                                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                                isActive
                                    ? 'bg-primary text-white'
                                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                            )}
                        >
                            <item.icon className="h-5 w-5" />
                            {item.name}
                        </Link>
                    );
                })}
            </nav>

            <div className="p-4 border-t border-slate-800 space-y-2">
                <button
                    onClick={toggleTheme}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-800 w-full transition-colors"
                >
                    {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                    <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
                </button>

                <button
                    onClick={logout}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-400 hover:text-red-300 hover:bg-red-900/20 w-full transition-colors"
                >
                    <LogOut className="h-5 w-5" />
                    <span>Logout</span>
                </button>
            </div>
        </div>
    );
};

export default Sidebar;
