import React, { useState, useEffect } from 'react';
import { getDashboardStats } from '../../services/dashboardService';
import { getAllClients, getAllReports, getAllPlans } from '../../services/recordService';
import { useAuthStore } from '../../store/authStore';
import { Users, FileText, Activity, ShieldCheck } from 'lucide-react';
import {
    ResponsiveContainer,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    CartesianGrid,
    Legend,
    PieChart,
    Pie,
    Cell,
} from 'recharts';

const CHART_COLORS = {
    neutral: '#a3a3a3',
    primary: '#0d9488',
    secondary: '#0891b2',
    purple: '#7c3aed',
    green: '#22c55e',
    blue: '#3b82f6',
};

const OverviewBarColors = [CHART_COLORS.neutral, CHART_COLORS.primary, CHART_COLORS.secondary, CHART_COLORS.purple];

const Dashboard = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [chartsLoading, setChartsLoading] = useState(true);
    const [error, setError] = useState('');
    const [chartsError, setChartsError] = useState('');
    const [reportCharts, setReportCharts] = useState({
        clients: { green: 0, blue: 0 },
        mch: { green: 0, blue: 0 },
        plansByDay: [],
    });
    const [countsFromCharts, setCountsFromCharts] = useState({ mchReports: null, clients: null, plans: null });
    const { user, hasPermission } = useAuthStore();
    const canSeeDashboard = user?.role === 'SUPER_ADMIN' || user?.role === 'PM' || hasPermission('dashboard.view');

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
                    getAllClients(),
                    getAllReports(),
                    getAllPlans(),
                ]);

                const clients = Array.isArray(clientsRes.data) ? clientsRes.data : [];
                const reports = Array.isArray(reportsRes.data) ? reportsRes.data : [];
                const plans = Array.isArray(plansRes.data) ? plansRes.data : [];

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

                const dayOrder = ['Wixata', 'Kibxata', 'Roobi', 'Kamisa', 'Jimaata'];
                const plansByDayMap = plans.reduce((acc, p) => {
                    const day = p.day_of_week || 'Other';
                    acc[day] = (acc[day] || 0) + 1;
                    return acc;
                }, {});
                const plansByDay = dayOrder.map((day) => ({
                    name: day,
                    count: plansByDayMap[day] || 0,
                }));

                setReportCharts({
                    clients: clientTotals,
                    mch: mchTotals,
                    plansByDay,
                });
                setCountsFromCharts({ mchReports: reports.length, clients: clients.length, plans: plans.length });
            } catch (err) {
                console.error('Failed to fetch report charts', err);
                setChartsError('Some report charts could not be loaded.');
            } finally {
                setChartsLoading(false);
            }
        };

        if (canSeeDashboard) {
            fetchStats();
            fetchReportCharts();
        } else {
            setLoading(false);
            setChartsLoading(false);
        }
    }, [canSeeDashboard]);

    if (!canSeeDashboard) {
        return (
            <div className="bg-white shadow sm:rounded-lg">
                <div className="px-4 py-5 sm:p-6 text-center">
                    <ShieldCheck className="mx-auto h-12 w-12 text-green-500 mb-4" />
                    <h3 className="text-lg leading-6 font-medium text-neutral-900">Welcome, {user?.first_name || user?.email}</h3>
                    <div className="mt-2 text-sm text-neutral-500">
                        <p>You are logged in as a Mentor Mother. Navigate to Data Records to enter and view your data.</p>
                    </div>
                </div>
            </div>
        );
    }

    const overviewData = [
        { name: 'Users', value: stats?.total_users ?? 0, fill: CHART_COLORS.neutral },
        { name: 'Clients', value: stats?.total_clients ?? countsFromCharts.clients ?? 0, fill: CHART_COLORS.primary },
        { name: 'MCH Reports', value: stats?.total_mch_reports ?? countsFromCharts.mchReports ?? 0, fill: CHART_COLORS.secondary },
        { name: 'Weekly Plans', value: stats?.total_weekly_plans ?? countsFromCharts.plans ?? 0, fill: CHART_COLORS.purple },
        { name: 'Follow-ups', value: stats?.total_followups ?? 0, fill: CHART_COLORS.green },
    ];

    const clientPieData = [
        { name: 'Green (Mothers)', value: reportCharts.clients.green, fill: CHART_COLORS.green },
        { name: 'Blue (Children)', value: reportCharts.clients.blue, fill: CHART_COLORS.blue },
    ].filter((d) => d.value > 0);

    const mchPieData = [
        { name: 'Green (Mothers)', value: reportCharts.mch.green, fill: CHART_COLORS.green },
        { name: 'Blue (Children)', value: reportCharts.mch.blue, fill: CHART_COLORS.blue },
    ].filter((d) => d.value > 0);

    return (
        <div className="min-w-0">
            <h1 className="text-xl font-semibold text-neutral-900 mb-4 sm:text-2xl sm:mb-6">Dashboard</h1>
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
                                                <div className="text-2xl font-semibold text-neutral-900">
                                                    {stats?.total_mch_reports ?? countsFromCharts.mchReports ?? 0}
                                                </div>
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

                        <div className="bg-white overflow-hidden shadow rounded-lg">
                            <div className="p-4 sm:p-5">
                                <div className="flex items-center">
                                    <div className="flex-shrink-0">
                                        <Activity className="h-6 w-6 text-green-500" />
                                    </div>
                                    <div className="ml-5 w-0 flex-1">
                                        <dl>
                                            <dt className="text-sm font-medium text-neutral-500 truncate">Client Follow-ups</dt>
                                            <dd className="flex items-baseline">
                                                <div className="text-2xl font-semibold text-neutral-900">{stats?.total_followups || 0}</div>
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
                            {Math.max(...overviewData.map((d) => d.value)) === 0 ? (
                                <p className="text-sm text-neutral-500">
                                    No data available yet to display a chart. Data will appear here once records are created.
                                </p>
                            ) : (
                                <div className="h-64 sm:h-80 w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={overviewData} margin={{ top: 12, right: 12, left: 0, bottom: 0 }}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" />
                                            <XAxis dataKey="name" tick={{ fontSize: 12 }} stroke="#737373" />
                                            <YAxis tick={{ fontSize: 12 }} stroke="#737373" allowDecimals={false} />
                                            <Tooltip
                                                contentStyle={{ borderRadius: '8px', border: '1px solid #e5e5e5' }}
                                                formatter={(value) => [value, 'Count']}
                                            />
                                            <Bar dataKey="value" name="Count" radius={[4, 4, 0, 0]}>
                                                {overviewData.map((entry, index) => (
                                                    <Cell key={`cell-${entry.name}`} fill={OverviewBarColors[index]} />
                                                ))}
                                            </Bar>
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            )}
                        </div>

                        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                            <div className="bg-white shadow rounded-lg p-4 sm:p-5">
                                <h3 className="text-sm font-medium text-neutral-900 mb-3">
                                    Client Registrations – Green vs Blue
                                </h3>
                                {chartsLoading ? (
                                    <p className="text-xs sm:text-sm text-neutral-500">Loading chart...</p>
                                ) : clientPieData.length === 0 ? (
                                    <p className="text-xs sm:text-sm text-neutral-500">
                                        No client registration data available yet.
                                    </p>
                                ) : (
                                    <div className="h-56 sm:h-64 w-full">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <PieChart>
                                                <Pie
                                                    data={clientPieData}
                                                    dataKey="value"
                                                    nameKey="name"
                                                    cx="50%"
                                                    cy="50%"
                                                    outerRadius="70%"
                                                    innerRadius="45%"
                                                    paddingAngle={2}
                                                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                                >
                                                    {clientPieData.map((entry, index) => (
                                                        <Cell key={`cell-${index}`} fill={entry.fill} />
                                                    ))}
                                                </Pie>
                                                <Tooltip
                                                    contentStyle={{ borderRadius: '8px', border: '1px solid #e5e5e5' }}
                                                    formatter={(value) => [value, 'Cases']}
                                                />
                                                <Legend />
                                            </PieChart>
                                        </ResponsiveContainer>
                                    </div>
                                )}
                            </div>

                            <div className="bg-white shadow rounded-lg p-4 sm:p-5">
                                <h3 className="text-sm font-medium text-neutral-900 mb-3">
                                    MCH Reports – Green vs Blue
                                </h3>
                                {chartsLoading ? (
                                    <p className="text-xs sm:text-sm text-neutral-500">Loading chart...</p>
                                ) : mchPieData.length === 0 ? (
                                    <p className="text-xs sm:text-sm text-neutral-500">
                                        No MCH report data available yet.
                                    </p>
                                ) : (
                                    <div className="h-56 sm:h-64 w-full">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <PieChart>
                                                <Pie
                                                    data={mchPieData}
                                                    dataKey="value"
                                                    nameKey="name"
                                                    cx="50%"
                                                    cy="50%"
                                                    outerRadius="70%"
                                                    innerRadius="45%"
                                                    paddingAngle={2}
                                                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                                >
                                                    {mchPieData.map((entry, index) => (
                                                        <Cell key={`cell-${index}`} fill={entry.fill} />
                                                    ))}
                                                </Pie>
                                                <Tooltip
                                                    contentStyle={{ borderRadius: '8px', border: '1px solid #e5e5e5' }}
                                                    formatter={(value) => [value, 'Cases']}
                                                />
                                                <Legend />
                                            </PieChart>
                                        </ResponsiveContainer>
                                    </div>
                                )}
                            </div>

                            <div className="bg-white shadow rounded-lg p-4 sm:p-5">
                                <h3 className="text-sm font-medium text-neutral-900 mb-3">
                                    Weekly Plans – By Day of Week
                                </h3>
                                {chartsLoading ? (
                                    <p className="text-xs sm:text-sm text-neutral-500">Loading chart...</p>
                                ) : reportCharts.plansByDay.every((d) => d.count === 0) ? (
                                    <p className="text-xs sm:text-sm text-neutral-500">
                                        No weekly plans data available yet.
                                    </p>
                                ) : (
                                    <div className="h-56 sm:h-64 w-full">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <BarChart
                                                data={reportCharts.plansByDay}
                                                layout="vertical"
                                                margin={{ top: 4, right: 24, left: 48, bottom: 4 }}
                                            >
                                                <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" horizontal={false} />
                                                <XAxis type="number" tick={{ fontSize: 11 }} stroke="#737373" allowDecimals={false} />
                                                <YAxis type="category" dataKey="name" width={44} tick={{ fontSize: 11 }} stroke="#737373" />
                                                <Tooltip
                                                    contentStyle={{ borderRadius: '8px', border: '1px solid #e5e5e5' }}
                                                    formatter={(value) => [value, 'Plans']}
                                                />
                                                <Bar dataKey="count" name="Plans" fill={CHART_COLORS.primary} radius={[0, 4, 4, 0]} />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </div>
                                )}
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
