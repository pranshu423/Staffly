import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import axios from 'axios';
import { motion } from 'framer-motion';
import ThemeToggle from '../components/ThemeToggle';

const Register = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [companyName, setCompanyName] = useState('');
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
            const { data } = await axios.post(`${apiUrl}/api/auth/register`, {
                name,
                email,
                password,
                companyName
            });

            login(data);
            navigate('/dashboard');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to register');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#AAB99A] flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden transition-colors duration-500">
            {/* Theme Toggle */}
            <div className="absolute top-6 right-6 z-50">
                <ThemeToggle />
            </div>

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="sm:mx-auto sm:w-full sm:max-w-md relative z-10"
            >
                <div className="text-center mb-8">
                    <h2 className="text-5xl font-['Pacifico'] font-normal text-slate-800 dark:text-slate-100 tracking-wide mb-2">
                        Join <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-indigo-600 dark:from-purple-400 dark:to-indigo-400">Staffly</span>
                    </h2>
                    <p className="mt-2 text-sm text-slate-600 dark:text-slate-400 font-medium">
                        Start your journey with us
                    </p>
                </div>

                <div className="glass-card py-8 px-4 shadow-2xl sm:rounded-[2rem] sm:px-10 relative overflow-hidden">
                    <div className="absolute inset-0 bg-white/40 backdrop-blur-xl z-[-1]" />
                    <form className="space-y-4" onSubmit={handleSubmit}>
                        <Input
                            label="Full Name"
                            type="text"
                            required
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="h-11 bg-slate-200/80 dark:bg-black/20 border-transparent focus:border-purple-500 focus:ring-purple-500 text-slate-900 dark:text-white placeholder:text-slate-500 dark:placeholder:text-slate-500 rounded-xl"
                        />

                        <Input
                            label="Work Email"
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="h-11 bg-slate-200/80 dark:bg-black/20 border-transparent focus:border-purple-500 focus:ring-purple-500 text-slate-900 dark:text-white placeholder:text-slate-500 dark:placeholder:text-slate-500 rounded-xl"
                        />

                        <Input
                            label="Password"
                            type="password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="h-11 bg-slate-200/80 dark:bg-black/20 border-transparent focus:border-purple-500 focus:ring-purple-500 text-slate-900 dark:text-white placeholder:text-slate-500 dark:placeholder:text-slate-500 rounded-xl"
                        />

                        <Input
                            label="Company Name"
                            type="text"
                            required
                            value={companyName}
                            onChange={(e) => setCompanyName(e.target.value)}
                            className="h-11 bg-slate-200/80 dark:bg-black/20 border-transparent focus:border-purple-500 focus:ring-purple-500 text-slate-900 dark:text-white placeholder:text-slate-500 dark:placeholder:text-slate-500 rounded-xl"
                        />

                        {error && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                className="text-red-500 text-sm font-medium bg-red-50/50 dark:bg-red-900/10 p-3 rounded-lg"
                            >
                                {error}
                            </motion.div>
                        )}

                        <div className="pt-2">
                            <Button
                                type="submit"
                                className="w-full h-11 text-base font-semibold bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 shadow-lg shadow-purple-500/20 rounded-xl transition-all duration-300"
                                isLoading={loading}
                            >
                                Create Account
                            </Button>
                        </div>
                    </form>

                    <div className="mt-6 text-center">
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                            Already have an account?{' '}
                            <Link to="/login" className="font-bold text-purple-600 hover:text-purple-500 dark:text-purple-400 transition-colors">
                                Sign in
                            </Link>
                        </p>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default Register;
