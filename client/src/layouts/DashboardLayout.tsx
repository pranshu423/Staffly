import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';

const DashboardLayout = () => {
    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex font-sans">
            <Sidebar />
            <div className="flex-1 ml-64 flex flex-col">
                <Navbar />
                <main className="flex-1 p-6 overflow-auto">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default DashboardLayout;
