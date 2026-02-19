import { User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
    const { user } = useAuth();

    return (
        <header className="h-20 flex items-center justify-between px-8 sticky top-0 z-10 box-border bg-slate-900/50 backdrop-blur-sm border-b border-white/5">
            <div className="text-sm font-medium text-slate-200 tracking-wide">
                Welcome back, <span className="font-bold text-white">{user?.name || 'User'}</span>!
            </div>

            <div className="flex items-center gap-4">
                <div className="flex items-center gap-3">
                    <div className="text-right hidden sm:block leading-tight">
                        <p className="text-sm font-bold text-white">{user?.name}</p>
                        <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">{user?.role === 'admin' ? 'Administrator' : user?.role}</p>
                    </div>
                    <div className="h-10 w-10 bg-gradient-to-br from-blue-500 to-purple-600 text-white rounded-full flex items-center justify-center font-bold shadow-lg shadow-blue-500/20 ring-2 ring-white/10">
                        {user?.name?.[0] || <User className="h-5 w-5" />}
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Navbar;
