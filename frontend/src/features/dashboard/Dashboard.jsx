import React, { useState, useEffect } from 'react';
import { getDashboardStats } from '../../services/dashboardService';
import { useAuthStore } from '../../store/authStore';
import { Users, FileText, Activity, ShieldCheck } from 'lucide-react';

const Dashboard = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const { user } = useAuthStore();
    const isAdmin = user?.role === 'ADMIN';

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await getDashboardStats();
                setStats(res.data);
            } catch (err) {
                console.error('Failed to fetch stats', err);
                setError('Failed to load dashboard statistics.');
            } finally {
                setLoading(false);
            }
        };

        if (isAdmin) {
            fetchStats();
        } else {
            setLoading(false);
        }
    }, [isAdmin]);

    if (!isAdmin) {
        return (
            <div className="bg-white shadow sm:rounded-lg">
                <div className="px-4 py-5 sm:p-6 text-center">
                    <ShieldCheck className="mx-auto h-12 w-12 text-green-500 mb-4" />
                    <h3 className="text-lg leading-6 font-medium text-neutral-900">Welcome, {user?.email}</h3>
                    <div className="mt-2 text-sm text-neutral-500">
                        <p>You are logged in as a Data Entry Expert. Navigate to Data Records to manage your tasks.</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-w-0">
            <h1 className="text-xl font-semibold text-neutral-900 mb-4 sm:text-2xl sm:mb-6">Admin Dashboard</h1>
            {error && <div className="mb-4 text-red-600 text-sm sm:text-base">{error}</div>}

            {loading ? (
                <div className="text-neutral-500 text-sm sm:text-base">Loading statistics...</div>
            ) : (
                <div className="grid grid-cols-1 gap-3 sm:gap-5 sm:grid-cols-2 lg:grid-cols-4">

                    <div className="bg-white overflow-hidden shadow rounded-lg">
                        <div className="p-4 sm:p-5">
                            <div className="flex items-center">
                                <div className="flex-shrink-0">
                                    <Users className="h-6 w-6 text-neutral-400" />
                                </div>
                                <div className="ml-5 w-0 flex-1">
                                    <dl>
                                        <dt className="text-sm font-medium text-neutral-500 truncate">Total Users</dt>
                                        <dd className="flex items-baseline">
                                            <div className="text-2xl font-semibold text-neutral-900">{stats?.total_users || 0}</div>
                                        </dd>
                                    </dl>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white overflow-hidden shadow rounded-lg">
                        <div className="p-4 sm:p-5">
                            <div className="flex items-center">
                                <div className="flex-shrink-0">
                                    <FileText className="h-6 w-6 text-primary-400" />
                                </div>
                                <div className="ml-5 w-0 flex-1">
                                    <dl>
                                        <dt className="text-sm font-medium text-neutral-500 truncate">Client Registrations</dt>
                                        <dd className="flex items-baseline">
                                            <div className="text-2xl font-semibold text-neutral-900">{stats?.total_clients || 0}</div>
                                        </dd>
                                    </dl>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white overflow-hidden shadow rounded-lg">
                        <div className="p-4 sm:p-5">
                            <div className="flex items-center">
                                <div className="flex-shrink-0">
                                    <Activity className="h-6 w-6 text-secondary-400" />
                                </div>
                                <div className="ml-5 w-0 flex-1">
                                    <dl>
                                        <dt className="text-sm font-medium text-neutral-500 truncate">MCH Reports</dt>
                                        <dd className="flex items-baseline">
                                            <div className="text-2xl font-semibold text-neutral-900">{stats?.total_mch_reports || 0}</div>
                                        </dd>
                                    </dl>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white overflow-hidden shadow rounded-lg">
                        <div className="p-4 sm:p-5">
                            <div className="flex items-center">
                                <div className="flex-shrink-0">
                                    <FileText className="h-6 w-6 text-purple-400" />
                                </div>
                                <div className="ml-5 w-0 flex-1">
                                    <dl>
                                        <dt className="text-sm font-medium text-neutral-500 truncate">Weekly Plans</dt>
                                        <dd className="flex items-baseline">
                                            <div className="text-2xl font-semibold text-neutral-900">{stats?.total_weekly_plans || 0}</div>
                                        </dd>
                                    </dl>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            )}
        </div>
    );
};

export default Dashboard;
