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
        <div className="min-h-screen bg-midnight-animated flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
            <motion.div
                initial="hidden"
                animate="show"
                viewport={{ once: true }}
                variants={{
                    hidden: { opacity: 0 },
                    show: {
                        opacity: 1,
                        transition: {
                            staggerChildren: 0.2
                        }
                    }
                }}
                className="sm:mx-auto sm:w-full sm:max-w-md relative z-10"
            >
                <motion.div
                    variants={{
                        hidden: { opacity: 0, y: -20 },
                        show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100 } }
                    }}
                    className="text-center mb-8"
                >
                    <h2 className="text-5xl font-['Pacifico'] font-normal text-white mb-2 tracking-wide drop-shadow-md">
                        Staffly
                    </h2>
                    <p className="mt-2 text-slate-200 font-medium text-lg">
                        Elevate your workforce management
                    </p>
                </motion.div>

                <motion.div
                    variants={{
                        hidden: { opacity: 0, scale: 0.95 },
                        show: { opacity: 1, scale: 1, transition: { type: "spring", stiffness: 100 } }
                    }}
                    className="glass-card py-8 px-4 shadow-2xl sm:rounded-[2rem] sm:px-10 relative overflow-hidden !bg-white/5 border-white/10"
                >
                    <div className="absolute inset-0 bg-transparent backdrop-blur-xl z-[-1]" />
                    <form className="space-y-5" onSubmit={handleSubmit}>
                        <Input
                            label="Email address"
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            labelClassName="text-white"
                            className="h-12 bg-white/10 border border-white/20 focus:border-purple-400 focus:ring-purple-400 text-white placeholder:text-slate-400 rounded-xl shadow-sm hover:bg-white/20 transition-colors"
                        />

                        <div>
                            <Input
                                label="Password"
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                labelClassName="text-white"
                                className="h-12 bg-white/10 border border-white/20 focus:border-purple-400 focus:ring-purple-400 text-white placeholder:text-slate-400 rounded-xl shadow-sm hover:bg-white/20 transition-colors"
                            />
                        </div>

                        {error && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                className="text-red-600 text-sm font-medium bg-red-50 p-3 rounded-lg border border-red-100"
                            >
                                {error}
                            </motion.div>
                        )}

                        <Button
                            type="submit"
                            className="w-full h-12 text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 shadow-lg shadow-blue-500/30 rounded-xl transition-all duration-300 transform hover:-translate-y-0.5 border border-white/10"
                            isLoading={loading}
                        >
                            Sign in
                        </Button>


                    </form>

                    <div className="mt-8 text-center">
                        <p className="text-sm text-slate-300">
                            Don't have an account?{' '}
                            <Link to="/register" className="font-bold text-white hover:text-blue-300 hover:underline transition-colors">
                                Register company
                            </Link>
                        </p>
                    </div>
                </motion.div>
            </motion.div>
        </div>
    );
};

export default Login;
