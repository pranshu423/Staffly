import React from 'react';
import { motion } from 'framer-motion';
import { Clock } from 'lucide-react';
import { LoadingSkeleton } from '../ui/LoadingSkeleton';

interface AttendanceWidgetProps {
    checkInTime?: string;
    checkOutTime?: string;
    onCheckIn: () => void;
    onCheckOut: () => void;
    loading: boolean; // Processing state
    fetching?: boolean; // Initial data load state
}

// AttendanceWidget.tsx updated for GenZ dark theme
const AttendanceWidget: React.FC<AttendanceWidgetProps> = ({ checkInTime, checkOutTime, onCheckIn, onCheckOut, loading, fetching }) => {
    const today = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

    if (fetching) {
        return (
            <div className="glass-card p-6 flex flex-col h-full justify-between">
                <div className="flex justify-between items-start">
                    <div>
                        <LoadingSkeleton width={120} height={24} />
                        <LoadingSkeleton width={80} height={16} className="mt-2" />
                    </div>
                    <LoadingSkeleton circle width={24} height={24} />
                </div>
                <div className="flex-1 flex flex-col items-center justify-center py-2">
                    <LoadingSkeleton circle width={128} height={128} />
                </div>
                <LoadingSkeleton height={48} className="rounded-xl" />
            </div>
        );
    }

    const checkInProgress = checkInTime ? 75 : 0;
    const progress = checkInProgress;

    return (
        <div className="glass-card p-6 flex flex-col h-full justify-between relative bg-slate-900/40 border border-white/5">
            <div className="absolute inset-0 bg-blue-500/5 rounded-[2rem] pointer-events-none" />

            <div className="flex justify-between items-start relative z-10">
                <div>
                    <h3 className="text-xl font-bold text-white tracking-tight">Today's Attendance</h3>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">{today.toUpperCase()}</p>
                </div>
                <Clock className="w-5 h-5 text-slate-400" />
            </div>

            <div className="flex-1 flex flex-col items-center justify-center py-2 relative min-h-0 z-10">
                {/* Circular Progress Container */}
                <div className="relative w-32 h-32 flex items-center justify-center">
                    {/* Background Circle */}
                    <svg className="absolute w-full h-full transform -rotate-90 overflow-visible" viewBox="0 0 128 128">
                        <circle
                            cx="64"
                            cy="64"
                            r="58"
                            stroke="#334155"
                            strokeWidth="8"
                            fill="transparent"
                            className="text-slate-700"
                        />
                        {/* Progress Circle */}
                        <motion.circle
                            initial={{ strokeDashoffset: 2 * Math.PI * 58 }}
                            animate={{ strokeDashoffset: 2 * Math.PI * 58 - (progress / 100) * 2 * Math.PI * 58 }}
                            transition={{ duration: 1 }}
                            cx="64"
                            cy="64"
                            r="58"
                            stroke="#3B82F6"
                            strokeWidth="8"
                            fill="transparent"
                            strokeDasharray={2 * Math.PI * 58}
                            strokeLinecap="round"
                            className="drop-shadow-[0_0_10px_rgba(59,130,246,0.5)]"
                        />
                    </svg>

                    {/* Check In Status / Time */}
                    <div className="absolute flex flex-col items-center">
                        {checkInTime ? (
                            <>
                                <span className="text-2xl font-bold text-white">
                                    {new Date(checkInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                                <span className="text-[10px] text-green-300 font-bold bg-green-500/20 border border-green-500/30 px-2 py-0.5 rounded-full mt-1">On Time</span>
                            </>
                        ) : (
                            <Clock className="w-10 h-10 text-slate-600" />
                        )}
                    </div>
                </div>

                <p className="text-center text-sm text-slate-400 mt-4 font-medium">
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
                className={`w-full py-3.5 rounded-xl font-bold text-white shadow-lg transition-all active:scale-[0.98] relative z-10 ${checkInTime && !checkOutTime
                    ? 'bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 shadow-red-500/30'
                    : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 shadow-blue-500/30'
                    } disabled:opacity-50 disabled:cursor-not-allowed text-sm border border-white/10`}
            >
                {loading ? 'Processing...' : checkInTime && !checkOutTime ? 'Check Out' : 'Check In Now'}
            </button>
        </div>
    );
};

export default AttendanceWidget;
