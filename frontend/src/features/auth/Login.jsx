import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import api from '../../services/api';
import { Lock, Mail } from 'lucide-react';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();
    const { setTokens, setUser } = useAuthStore();

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await api.post('/auth/login/', { email, password });
            setTokens(response.data.access, response.data.refresh);

            // Normally, you might decode the JWT or fetch the user profile here.
            // Since our simple backend doesn't decode, let's just make a fast API call or decode JWT (if added)
            // For now we'll fetch /users/ if admin, or assume DATA_EXPERT if forbidden.
            // A safer approach is adding /auth/me to backend. I'll mock basic assignment.

            const payloadBase64 = response.data.access.split('.')[1];
            const payloadStr = atob(payloadBase64);
            const payload = JSON.parse(payloadStr);

            // The role needs to be known. We'll add role to TokenObtainPair later if needed, 
            // but for now let's attempt a dashboard request to check if admin.
            try {
                await api.get('/dashboard/stats/');
                setUser({ email, role: 'ADMIN', user_id: payload.user_id });
            } catch (e) {
                setUser({ email, role: 'DATA_EXPERT', user_id: payload.user_id });
            }

            navigate('/dashboard');
        } catch (err) {
            if (err.response && err.response.data && err.response.data.detail) {
                setError(err.response.data.detail);
            } else {
                setError('Login failed. Please check your credentials.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-neutral-50 flex flex-col justify-center py-8 px-4 sm:py-12 sm:px-6 lg:px-8">
            <div className="w-full sm:mx-auto sm:max-w-md">
                <h2 className="mt-4 sm:mt-6 text-center text-2xl sm:text-3xl font-extrabold text-neutral-900">
                    Sign in to your account
                </h2>
                <p className="mt-2 text-center text-sm text-neutral-600">
                    Role-Based Data Management System
                </p>
            </div>

            <div className="mt-6 sm:mt-8 w-full sm:mx-auto sm:max-w-md">
                <div className="bg-white py-6 px-4 shadow sm:rounded-lg sm:py-8 sm:px-10">
                    <form className="space-y-6" onSubmit={handleLogin}>
                        {error && (
                            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm">
                                {error}
                            </div>
                        )}
                        <div>
                            <label className="block text-sm font-medium text-neutral-700">Email address</label>
                            <div className="mt-1 relative rounded-md shadow-sm">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Mail className="h-5 w-5 text-neutral-400" />
                                </div>
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="focus:ring-primary-500 focus:border-primary-500 block w-full pl-10 sm:text-sm border-neutral-300 rounded-md py-2 px-3 border"
                                    placeholder="admin@datam.com"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-neutral-700">Password</label>
                            <div className="mt-1 relative rounded-md shadow-sm">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Lock className="h-5 w-5 text-neutral-400" />
                                </div>
                                <input
                                    type="password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="focus:ring-primary-500 focus:border-primary-500 block w-full pl-10 sm:text-sm border-neutral-300 rounded-md py-2 px-3 border"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>

                        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                            <div className="flex items-center">
                                <input
                                    id="remember-me"
                                    name="remember-me"
                                    type="checkbox"
                                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-neutral-300 rounded"
                                />
                                <label htmlFor="remember-me" className="ml-2 block text-sm text-neutral-900">
                                    Remember me
                                </label>
                            </div>

                            <div className="text-sm">
                                <a href="#" className="font-medium text-primary-600 hover:text-primary-500">
                                    Forgot your password?
                                </a>
                            </div>
                        </div>

                        <div>
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
                            >
                                {loading ? 'Signing in...' : 'Sign in'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Login;
