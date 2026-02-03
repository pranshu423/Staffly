import { User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
    const { user } = useAuth();

    return (
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 sticky top-0 z-10 dark:bg-slate-900 dark:border-slate-800">
            <div className="text-sm text-slate-500 dark:text-slate-400">
                Welcome back, <span className="font-semibold text-slate-900 dark:text-slate-100">{user?.name || 'User'}</span>!
            </div>

            <div className="flex items-center gap-4">
                <div className="flex items-center gap-3 pl-4 border-l border-slate-200 dark:border-slate-700">
                    <div className="text-right hidden sm:block">
                        <p className="text-sm font-medium text-slate-900 dark:text-slate-100">{user?.name}</p>
                        <p className="text-xs text-slate-500 capitalize">{user?.role}</p>
                    </div>
                    <div className="h-9 w-9 bg-primary text-white rounded-full flex items-center justify-center font-semibold">
                        {user?.name?.[0] || <User className="h-5 w-5" />}
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Navbar;
