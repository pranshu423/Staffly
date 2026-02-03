import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import axios from 'axios';
import { motion } from 'framer-motion';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
            const { data } = await axios.post(`${apiUrl}/api/auth/login`, {
                email,
                password,
            });

            login(data);
            navigate('/dashboard');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to login');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
            {/* Animated Background Blobs */}
            <motion.div
                animate={{
                    scale: [1, 1.2, 1],
                    rotate: [0, 90, 0],
                }}
                transition={{
                    duration: 20,
                    repeat: Infinity,
                    repeatType: "reverse"
                }}
                className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-purple-400/30 dark:bg-purple-600/20 blur-[120px] rounded-full pointer-events-none mix-blend-multiply dark:mix-blend-screen"
            />
            <motion.div
                animate={{
                    scale: [1, 1.1, 1],
                    x: [0, 50, 0],
                }}
                transition={{
                    duration: 15,
                    repeat: Infinity,
                    repeatType: "reverse"
                }}
                className="absolute bottom-[-10%] right-[-5%] w-[500px] h-[500px] bg-indigo-400/30 dark:bg-indigo-600/20 blur-[100px] rounded-full pointer-events-none mix-blend-multiply dark:mix-blend-screen"
            />

            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="sm:mx-auto sm:w-full sm:max-w-md relative z-10"
            >
                <div className="text-center mb-10">
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.2, duration: 0.5 }}
                        className="inline-block"
                    >
                        <h2 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-indigo-600 dark:from-purple-400 dark:to-indigo-400 tracking-tight mb-2 drop-shadow-sm">
                            Staffly
                        </h2>
                    </motion.div>

                    <p className="mt-3 text-base text-slate-600 dark:text-slate-300 font-medium">
                        Elevate your workforce management
                    </p>
                </div>

                <div className="bg-white/60 dark:bg-slate-900/50 backdrop-blur-xl py-8 px-4 shadow-2xl shadow-indigo-500/10 border border-white/50 dark:border-slate-700/50 sm:rounded-3xl sm:px-10 relative overflow-hidden group">
                    {/* Glass Reflection Effect */}
                    <div className="absolute inset-0 bg-gradient-to-b from-white/40 to-transparent dark:from-white/5 pointer-events-none" />

                    <form className="space-y-6 relative z-10" onSubmit={handleSubmit}>
                        <div>
                            <Input
                                label="Email address"
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="bg-white/50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 focus:ring-purple-500 focus:border-purple-500"
                            />
                        </div>

                        <div>
                            <Input
                                label="Password"
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="bg-white/50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 focus:ring-purple-500 focus:border-purple-500"
                            />
                        </div>

                        {error && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                className="text-red-600 dark:text-red-400 text-sm font-semibold bg-red-50/80 dark:bg-red-900/30 p-3 rounded-xl border border-red-100 dark:border-red-900/50 flex items-center gap-2"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                </svg>
                                {error}
                            </motion.div>
                        )}

                        <div>
                            <Button
                                type="submit"
                                className="w-full h-12 text-lg font-semibold bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 transition-all duration-300 transform hover:-translate-y-0.5 rounded-xl"
                                isLoading={loading}
                            >
                                Sign in
                            </Button>
                        </div>

                        <div className="relative my-8">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-slate-200 dark:border-slate-700" />
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="bg-transparent px-4 text-slate-500 dark:text-slate-400 font-medium bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm rounded-full">
                                    Demo Access
                                </span>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <Button
                                type="button"
                                variant="outline"
                                className="h-11 border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-800/50 hover:bg-white dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 font-medium rounded-xl transition-all hover:border-purple-300 dark:hover:border-purple-700"
                                onClick={() => {
                                    setEmail('admin@staffly.com');
                                    setPassword('admin123');
                                }}
                            >
                                Demo Admin
                            </Button>
                            <Button
                                type="button"
                                variant="outline"
                                className="h-11 border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-800/50 hover:bg-white dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 font-medium rounded-xl transition-all hover:border-indigo-300 dark:hover:border-indigo-700"
                                onClick={() => {
                                    setEmail('employee@staffly.com');
                                    setPassword('employee123');
                                }}
                            >
                                Demo Employee
                            </Button>
                        </div>
                    </form>

                    <div className="mt-8 text-center">
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                            Don't have an account?{' '}
                            <Link to="/register" className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 transition-all">
                                Register company
                            </Link>
                        </p>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default Login;
