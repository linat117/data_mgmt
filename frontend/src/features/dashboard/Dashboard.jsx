import React, { useState, useEffect } from 'react';
import { getDashboardStats } from '../../services/dashboardService';
import { getClients, getReports, getPlans } from '../../services/recordService';
import { useAuthStore } from '../../store/authStore';
import { Users, FileText, Activity, ShieldCheck } from 'lucide-react';

const Dashboard = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [chartsLoading, setChartsLoading] = useState(true);
    const [error, setError] = useState('');
    const [chartsError, setChartsError] = useState('');
    const [reportCharts, setReportCharts] = useState({
        clients: { green: 0, blue: 0 },
        mch: { green: 0, blue: 0 },
        plansByDay: {},
    });
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

        const fetchReportCharts = async () => {
            try {
                const [clientsRes, reportsRes, plansRes] = await Promise.all([
                    getClients(),
                    getReports(),
                    getPlans(),
                ]);

                const clients = clientsRes.data.results || clientsRes.data || [];
                const reports = reportsRes.data.results || reportsRes.data || [];
                const plans = plansRes.data.results || plansRes.data || [];

                const clientTotals = clients.reduce(
                    (acc, c) => {
                        acc.green += Number(c.total_green_cases) || 0;
                        acc.blue += Number(c.total_blue_cases) || 0;
                        return acc;
                    },
                    { green: 0, blue: 0 }
                );

                const mchTotals = reports.reduce(
                    (acc, r) => {
                        acc.green += Number(r.total_green) || 0;
                        acc.blue += Number(r.total_blue) || 0;
                        return acc;
                    },
                    { green: 0, blue: 0 }
                );

                const plansByDay = plans.reduce((acc, p) => {
                    const day = p.day_of_week || 'Other';
                    acc[day] = (acc[day] || 0) + 1;
                    return acc;
                }, {});

                setReportCharts({
                    clients: clientTotals,
                    mch: mchTotals,
                    plansByDay,
                });
            } catch (err) {
                console.error('Failed to fetch report charts', err);
                setChartsError('Some report charts could not be loaded.');
            } finally {
                setChartsLoading(false);
            }
        };

        if (isAdmin) {
            fetchStats();
            fetchReportCharts();
        } else {
            setLoading(false);
            setChartsLoading(false);
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
                <>
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

                    <div className="mt-8 space-y-6">
                        <div className="bg-white shadow rounded-lg p-4 sm:p-6">
                            <h2 className="text-base sm:text-lg font-medium text-neutral-900 mb-4">Overall Overview</h2>
                            {(() => {
                                const data = [
                                    { label: 'Users', value: stats?.total_users || 0, color: 'bg-neutral-400' },
                                    { label: 'Clients', value: stats?.total_clients || 0, color: 'bg-primary-400' },
                                    { label: 'MCH Reports', value: stats?.total_mch_reports || 0, color: 'bg-secondary-400' },
                                    { label: 'Weekly Plans', value: stats?.total_weekly_plans || 0, color: 'bg-purple-400' },
                                ];

                                const maxValue = Math.max(...data.map(item => item.value), 0);

                                if (!maxValue) {
                                    return (
                                        <p className="text-sm text-neutral-500">
                                            No data available yet to display a chart. Data will appear here once reports are created.
                                        </p>
                                    );
                                }

                                return (
                                    <div className="flex items-end gap-4 sm:gap-6 h-40 sm:h-48">
                                        {data.map(item => (
                                            <div key={item.label} className="flex-1 flex flex-col items-center">
                                                <div className="w-full bg-neutral-100 rounded-t-md overflow-hidden flex items-end">
                                                    <div
                                                        className={`${item.color} w-full transition-all duration-500`}
                                                        style={{ height: `${(item.value / maxValue) * 100}%` }}
                                                    />
                                                </div>
                                                <div className="mt-2 text-xs sm:text-sm font-medium text-neutral-700 text-center">
                                                    {item.label}
                                                </div>
                                                <div className="text-xs text-neutral-500">{item.value}</div>
                                            </div>
                                        ))}
                                    </div>
                                );
                            })()}
                        </div>

                        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                            <div className="bg-white shadow rounded-lg p-4 sm:p-5">
                                <h3 className="text-sm font-medium text-neutral-900 mb-3">
                                    Client Registrations – Green vs Blue
                                </h3>
                                {chartsLoading ? (
                                    <p className="text-xs sm:text-sm text-neutral-500">Loading chart...</p>
                                ) : (() => {
                                    const { green, blue } = reportCharts.clients;
                                    const total = green + blue;

                                    if (!total) {
                                        return (
                                            <p className="text-xs sm:text-sm text-neutral-500">
                                                No client registration data available yet.
                                            </p>
                                        );
                                    }

                                    const greenPct = (green / total) * 100;
                                    const bluePct = (blue / total) * 100;

                                    return (
                                        <div className="space-y-3">
                                            <div className="h-6 w-full bg-neutral-100 rounded-full overflow-hidden flex">
                                                <div
                                                    className="bg-green-500 h-full"
                                                    style={{ width: `${greenPct}%` }}
                                                />
                                                <div
                                                    className="bg-blue-500 h-full"
                                                    style={{ width: `${bluePct}%` }}
                                                />
                                            </div>
                                            <div className="flex justify-between text-xs sm:text-sm text-neutral-700">
                                                <span>Green (Mothers): {green}</span>
                                                <span>Blue (Children): {blue}</span>
                                            </div>
                                        </div>
                                    );
                                })()}
                            </div>

                            <div className="bg-white shadow rounded-lg p-4 sm:p-5">
                                <h3 className="text-sm font-medium text-neutral-900 mb-3">
                                    MCH Reports – Green vs Blue
                                </h3>
                                {chartsLoading ? (
                                    <p className="text-xs sm:text-sm text-neutral-500">Loading chart...</p>
                                ) : (() => {
                                    const { green, blue } = reportCharts.mch;
                                    const total = green + blue;

                                    if (!total) {
                                        return (
                                            <p className="text-xs sm:text-sm text-neutral-500">
                                                No MCH report data available yet.
                                            </p>
                                        );
                                    }

                                    const greenPct = (green / total) * 100;
                                    const bluePct = (blue / total) * 100;

                                    return (
                                        <div className="space-y-3">
                                            <div className="h-6 w-full bg-neutral-100 rounded-full overflow-hidden flex">
                                                <div
                                                    className="bg-green-500 h-full"
                                                    style={{ width: `${greenPct}%` }}
                                                />
                                                <div
                                                    className="bg-blue-500 h-full"
                                                    style={{ width: `${bluePct}%` }}
                                                />
                                            </div>
                                            <div className="flex justify-between text-xs sm:text-sm text-neutral-700">
                                                <span>Green (Mothers): {green}</span>
                                                <span>Blue (Children): {blue}</span>
                                            </div>
                                        </div>
                                    );
                                })()}
                            </div>

                            <div className="bg-white shadow rounded-lg p-4 sm:p-5">
                                <h3 className="text-sm font-medium text-neutral-900 mb-3">
                                    Weekly Plans – By Day of Week
                                </h3>
                                {chartsLoading ? (
                                    <p className="text-xs sm:text-sm text-neutral-500">Loading chart...</p>
                                ) : (() => {
                                    const dayOrder = ['Wixata', 'Kibxata', 'Roobi', 'Kamisa', 'Jimaata'];
                                    const data = dayOrder.map(day => ({
                                        label: day,
                                        value: reportCharts.plansByDay[day] || 0,
                                    }));

                                    const maxValue = Math.max(...data.map(d => d.value), 0);

                                    if (!maxValue) {
                                        return (
                                            <p className="text-xs sm:text-sm text-neutral-500">
                                                No weekly plans data available yet.
                                            </p>
                                        );
                                    }

                                    return (
                                        <div className="flex items-end gap-3 h-32">
                                            {data.map(d => (
                                                <div key={d.label} className="flex-1 flex flex-col items-center">
                                                    <div className="w-full bg-neutral-100 rounded-t-md overflow-hidden flex items-end">
                                                        <div
                                                            className="bg-primary-500 w-full"
                                                            style={{ height: `${(d.value / maxValue) * 100}%` }}
                                                        />
                                                    </div>
                                                    <div className="mt-1 text-[10px] sm:text-xs text-neutral-700 text-center">
                                                        {d.label}
                                                    </div>
                                                    <div className="text-[10px] text-neutral-500">{d.value}</div>
                                                </div>
                                            ))}
                                        </div>
                                    );
                                })()}
                            </div>
                        </div>

                        {chartsError && (
                            <p className="text-xs sm:text-sm text-red-600">
                                {chartsError}
                            </p>
                        )}
                    </div>
                </>
            )}
        </div>
    );
};

export default Dashboard;
