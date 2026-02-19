import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import axios from 'axios';
import { motion } from 'framer-motion';

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
        <div className="min-h-screen bg-midnight-animated flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="sm:mx-auto sm:w-full sm:max-w-md relative z-10"
            >
                <div className="text-center mb-8">
                    <h2 className="text-5xl font-['Pacifico'] font-normal text-white tracking-wide mb-2 drop-shadow-md">
                        Join Staffly
                    </h2>
                    <p className="mt-2 text-sm text-slate-200 font-medium">
                        Start your journey with us
                    </p>
                </div>

                <div className="glass-card py-8 px-4 shadow-2xl sm:rounded-[2rem] sm:px-10 relative overflow-hidden !bg-white/5 border-white/10">
                    <div className="absolute inset-0 bg-transparent backdrop-blur-xl z-[-1]" />
                    <form className="space-y-4" onSubmit={handleSubmit}>
                        <Input
                            label="Full Name"
                            type="text"
                            required
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            labelClassName="text-white"
                            className="h-11 bg-white/10 border border-white/20 focus:border-purple-400 focus:ring-purple-400 text-white placeholder:text-slate-400 rounded-xl shadow-sm hover:bg-white/20 transition-colors"
                        />

                        <Input
                            label="Work Email"
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            labelClassName="text-white"
                            className="h-11 bg-white/10 border border-white/20 focus:border-purple-400 focus:ring-purple-400 text-white placeholder:text-slate-400 rounded-xl shadow-sm hover:bg-white/20 transition-colors"
                        />

                        <Input
                            label="Password"
                            type="password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            labelClassName="text-white"
                            className="h-11 bg-white/10 border border-white/20 focus:border-purple-400 focus:ring-purple-400 text-white placeholder:text-slate-400 rounded-xl shadow-sm hover:bg-white/20 transition-colors"
                        />

                        <Input
                            label="Company Name"
                            type="text"
                            required
                            value={companyName}
                            onChange={(e) => setCompanyName(e.target.value)}
                            labelClassName="text-white"
                            className="h-11 bg-white/10 border border-white/20 focus:border-purple-400 focus:ring-purple-400 text-white placeholder:text-slate-400 rounded-xl shadow-sm hover:bg-white/20 transition-colors"
                        />

                        {error && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                className="text-red-500 text-sm font-medium bg-red-50 p-3 rounded-lg"
                            >
                                {error}
                            </motion.div>
                        )}

                        <div className="pt-2">
                            <Button
                                type="submit"
                                className="w-full h-11 text-base font-bold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 shadow-lg shadow-blue-500/30 rounded-xl transition-all duration-300 border border-white/10"
                                isLoading={loading}
                            >
                                Create Account
                            </Button>
                        </div>
                    </form>

                    <div className="mt-6 text-center">
                        <p className="text-sm text-slate-300">
                            Already have an account?{' '}
                            <Link to="/login" className="font-bold text-white hover:text-blue-300 transition-colors">
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
