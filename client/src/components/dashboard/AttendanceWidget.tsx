import React from 'react';
import { motion } from 'framer-motion';
import { Clock } from 'lucide-react';

interface AttendanceWidgetProps {
    checkInTime?: string;
    checkOutTime?: string;
    onCheckIn: () => void;
    onCheckOut: () => void;
    loading: boolean;
}

const AttendanceWidget: React.FC<AttendanceWidgetProps> = ({ checkInTime, checkOutTime, onCheckIn, onCheckOut, loading }) => {
    const today = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    // const [currentTime, setCurrentTime] = useState(new Date());

    // useEffect(() => {
    //     const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    //     return () => clearInterval(timer);
    // }, []);

    const checkInProgress = checkInTime ? 75 : 0; // 75% complete look when checked in
    const progress = checkInProgress;

    return (
        <div className="glass-card p-6 flex flex-col h-full justify-between">
            <div className="flex justify-between items-start">
                <div>
                    <h3 className="text-xl font-bold text-slate-800">Today's Attendance</h3>
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mt-1">{today.toUpperCase()}</p>
                </div>
                <Clock className="w-5 h-5 text-slate-400" />
            </div>

            <div className="flex-1 flex flex-col items-center justify-center py-2 relative min-h-0">
                {/* Circular Progress Container */}
                <div className="relative w-32 h-32 flex items-center justify-center">
                    {/* Background Circle */}
                    <svg className="absolute w-full h-full transform -rotate-90">
                        <circle
                            cx="64"
                            cy="64"
                            r="60"
                            stroke="#E2E8F0"
                            strokeWidth="8"
                            fill="transparent"
                        />
                        {/* Progress Circle */}
                        <motion.circle
                            initial={{ strokeDashoffset: 2 * Math.PI * 60 }}
                            animate={{ strokeDashoffset: 2 * Math.PI * 60 - (progress / 100) * 2 * Math.PI * 60 }}
                            transition={{ duration: 1 }}
                            cx="64"
                            cy="64"
                            r="60"
                            stroke="#3B82F6"
                            strokeWidth="8"
                            fill="transparent"
                            strokeDasharray={2 * Math.PI * 60}
                            strokeLinecap="round"
                        />
                    </svg>

                    {/* Check In Status / Time */}
                    <div className="absolute flex flex-col items-center">
                        {checkInTime ? (
                            <>
                                <span className="text-xl font-bold text-slate-800">
                                    {new Date(checkInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                                <span className="text-[10px] text-green-600 font-bold bg-green-100 px-2 py-0.5 rounded-full mt-1">On Time</span>
                            </>
                        ) : (
                            <Clock className="w-8 h-8 text-slate-300" />
                        )}
                    </div>
                </div>

                <p className="text-center text-sm text-slate-500 mt-3 font-medium">
                    {checkInTime
                        ? checkOutTime
                            ? "Checked out"
                            : "Working"
                        : "Not checked in"
                    }
                </p>
            </div>

            <button
                onClick={checkInTime && !checkOutTime ? onCheckOut : onCheckIn}
                disabled={loading || (!!checkInTime && !!checkOutTime)}
                className={`w-full py-3 rounded-xl font-bold text-white shadow-lg shadow-blue-500/30 transition-all active:scale-[0.98] ${checkInTime && !checkOutTime
                    ? 'bg-red-500 hover:bg-red-600 shadow-red-500/30'
                    : 'bg-blue-600 hover:bg-blue-700'
                    } disabled:opacity-50 disabled:cursor-not-allowed text-sm`}
            >
                {loading ? 'Processing...' : checkInTime && !checkOutTime ? 'Check Out' : 'Check In Now'}
            </button>
        </div>
    );
};

export default AttendanceWidget;
