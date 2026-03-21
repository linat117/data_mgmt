import React, { useState, useEffect, useMemo } from 'react';
import { getDashboardData, processChartData } from '../../services/optimizedDashboardService';
import { getAllReports, getAllClients, getAllPlans } from '../../services/recordService';
import { useAuthStore } from '../../store/authStore';
import { Users, FileText, Activity, ShieldCheck, Download } from 'lucide-react';
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
import * as XLSX from 'xlsx';

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
    const [error, setError] = useState('');
    const [chartData, setChartData] = useState({
        clients: { green: 0, blue: 0 },
        mch: { green: 0, blue: 0 },
        plansByDay: [],
        ageDistribution: [],
        counts: { mchReports: null, clients: null, plans: null }
    });
    const [regionFilter, setRegionFilter] = useState('');
    const [allRegions, setAllRegions] = useState([]);
    const [regionsLoaded, setRegionsLoaded] = useState(false);
    const { user, hasPermission } = useAuthStore();
    const canSeeDashboard = user?.role === 'SUPER_ADMIN' || user?.role === 'PM' || hasPermission('dashboard.view');

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                setLoading(true);
                const data = await getDashboardData(regionFilter);
                setStats(data.stats);
                
                // Only set allRegions on first load
                if (!regionsLoaded) {
                    setAllRegions(data.allRegions || []);
                    setRegionsLoaded(true);
                }
                
                // Process chart data
                const processedData = processChartData(data);
                setChartData(processedData);
                
            } catch (err) {
                console.error('Failed to fetch dashboard data', err);
                setError('Failed to load dashboard data.');
            } finally {
                setLoading(false);
            }
        };

        if (canSeeDashboard) {
            fetchDashboardData();
        } else {
            setLoading(false);
        }
    }, [canSeeDashboard, regionFilter]);

    // Memoize chart data to prevent unnecessary re-renders
    const overviewData = useMemo(() => [
        { name: 'Users', value: stats?.total_users ?? 0, fill: CHART_COLORS.neutral },
        { name: 'Clients', value: chartData.counts.clients ?? 0, fill: CHART_COLORS.primary },
        { name: 'MCH Reports', value: chartData.counts.mchReports ?? 0, fill: CHART_COLORS.secondary },
        { name: 'Weekly Plans', value: chartData.counts.plans ?? 0, fill: CHART_COLORS.purple },
        { name: 'Follow-ups', value: stats?.total_followups ?? 0, fill: CHART_COLORS.green },
    ], [stats, chartData.counts]);

    const clientPieData = useMemo(() => [
        { name: 'Green (Mothers)', value: chartData.clients.green, fill: CHART_COLORS.green },
        { name: 'Blue (Children)', value: chartData.clients.blue, fill: CHART_COLORS.blue },
    ].filter((d) => d.value > 0), [chartData.clients]);

    const mchPieData = useMemo(() => [
        { name: 'Green (Mothers)', value: chartData.mch.green, fill: CHART_COLORS.green },
        { name: 'Blue (Children)', value: chartData.mch.blue, fill: CHART_COLORS.blue },
    ].filter((d) => d.value > 0), [chartData.mch]);

    // Export functions
    const exportMCHData = async () => {
        try {
            // Fetch detailed MCH data with region filter
            const [reportsRes, clientsRes] = await Promise.all([
                getAllReports(),
                getAllClients()
            ]);
            
            const reports = Array.isArray(reportsRes.data) ? reportsRes.data : [];
            const clients = Array.isArray(clientsRes.data) ? clientsRes.data : [];

            // Apply region filter if specified
            const filteredReports = regionFilter 
                ? reports.filter(r => r.created_by_region_code === regionFilter)
                : reports;
            const filteredClients = regionFilter
                ? clients.filter(c => c.created_by_region_code === regionFilter)
                : clients;

            // Create workbook
            const wb = XLSX.utils.book_new();
            
            // Summary data
            const summaryData = [
                { 'Metric': 'Total Green Cases (Mothers)', 'Count': chartData.mch.green },
                { 'Metric': 'Total Blue Cases (Children)', 'Count': chartData.mch.blue },
                { 'Metric': 'Total MCH Reports', 'Count': chartData.counts.mchReports || 0 },
                { 'Metric': 'Region Filter', 'Count': regionFilter || 'All Regions' },
            ];
            
            const summaryWs = XLSX.utils.json_to_sheet(summaryData);
            XLSX.utils.book_append_sheet(wb, summaryWs, 'MCH Summary');
            
            // Detailed reports data
            const detailedData = filteredReports.map(report => {
                const relatedClients = filteredClients.filter(
                    (c) => c.mentor_mother_name === report.mentor_mother_name && c.date === report.date
                );
                const firstClient = relatedClients[0] || {};
                const addedBy = report.created_by_name || report.created_by_email || firstClient.created_by_name || firstClient.created_by_email || '—';
                
                return {
                    'Mentor Mother Name': report.mentor_mother_name,
                    'Date': report.date,
                    'Client Name': firstClient.name || '—',
                    'Age': firstClient.age || '—',
                    'Sex': firstClient.sex || '—',
                    'Folder Number': firstClient.folder_number || '—',
                    'Total Green (Mother)': report.total_green || 0,
                    'Total Blue (Children)': report.total_blue || 0,
                    'Added By': addedBy,
                    'Region': report.created_by_region_code || '—',
                    'Created At': report.created_at || '—'
                };
            });
            
            if (detailedData.length > 0) {
                const detailedWs = XLSX.utils.json_to_sheet(detailedData);
                XLSX.utils.book_append_sheet(wb, detailedWs, 'MCH Reports');
            }
            
            // Generate filename with date and region
            const today = new Date().toISOString().split('T')[0];
            const regionSuffix = regionFilter ? `_${regionFilter}` : '';
            const filename = `MCH_Dashboard_Export_${today}${regionSuffix}.xlsx`;
            
            // Save file
            XLSX.writeFile(wb, filename);
            
        } catch (error) {
            console.error('Error exporting MCH data:', error);
            alert('Failed to export MCH data. Please try again.');
        }
    };

    const exportClientData = async () => {
        try {
            // Fetch detailed client data
            const clientsRes = await getAllClients();
            const clients = Array.isArray(clientsRes.data) ? clientsRes.data : [];

            // Apply region filter if specified
            const filteredClients = regionFilter
                ? clients.filter(c => c.created_by_region_code === regionFilter)
                : clients;

            // Create workbook
            const wb = XLSX.utils.book_new();
            
            // Summary data
            const summaryData = [
                { 'Metric': 'Total Green Cases (Mothers)', 'Count': chartData.clients.green },
                { 'Metric': 'Total Blue Cases (Children)', 'Count': chartData.clients.blue },
                { 'Metric': 'Total Client Registrations', 'Count': chartData.counts.clients || 0 },
                { 'Metric': 'Region Filter', 'Count': regionFilter || 'All Regions' },
            ];
            
            const summaryWs = XLSX.utils.json_to_sheet(summaryData);
            XLSX.utils.book_append_sheet(wb, summaryWs, 'Client Summary');
            
            // Detailed client data
            const detailedData = filteredClients.map(client => ({
                'Mentor Mother Name': client.mentor_mother_name,
                'Date': client.date,
                'Client Name': client.name,
                'Age': client.age,
                'Sex': client.sex,
                'Folder Number': client.folder_number,
                'Address': client.address,
                'Weight': client.weight || '—',
                'MUAC': client.muac || '—',
                'Total Green Cases': client.total_green_cases || 0,
                'Total Blue Cases': client.total_blue_cases || 0,
                'Added By': client.created_by_name || client.created_by_email || '—',
                'Region': client.created_by_region_code || '—',
                'Created At': client.created_at
            }));
            
            if (detailedData.length > 0) {
                const detailedWs = XLSX.utils.json_to_sheet(detailedData);
                XLSX.utils.book_append_sheet(wb, detailedWs, 'Client Registrations');
            }
            
            // Generate filename with date and region
            const today = new Date().toISOString().split('T')[0];
            const regionSuffix = regionFilter ? `_${regionFilter}` : '';
            const filename = `Client_Dashboard_Export_${today}${regionSuffix}.xlsx`;
            
            // Save file
            XLSX.writeFile(wb, filename);
            
        } catch (error) {
            console.error('Error exporting client data:', error);
            alert('Failed to export client data. Please try again.');
        }
    };

    const exportWeeklyPlans = async () => {
        try {
            // Fetch detailed weekly plans data
            const plansRes = await getAllPlans();
            const plans = Array.isArray(plansRes.data) ? plansRes.data : [];

            // Create workbook
            const wb = XLSX.utils.book_new();
            
            // Summary data
            const summaryData = [
                { 'Metric': 'Total Weekly Plans', 'Count': chartData.counts.plans || 0 },
            ];
            
            const summaryWs = XLSX.utils.json_to_sheet(summaryData);
            XLSX.utils.book_append_sheet(wb, summaryWs, 'Weekly Plans Summary');
            
            // Detailed plans data
            const detailedData = plans.map(plan => ({
                'Mentor Mother Name': plan.mentor_mother_name,
                'Date': plan.date,
                'District': plan.district,
                'Day of Week': plan.day_of_week,
                'Client Name': plan.client_name,
                'Content': plan.content,
                'Objective': plan.objective,
                'Observation': plan.observation,
                'Added By': plan.created_by_name || plan.created_by_email || '—',
                'Created At': plan.created_at
            }));
            
            if (detailedData.length > 0) {
                const detailedWs = XLSX.utils.json_to_sheet(detailedData);
                XLSX.utils.book_append_sheet(wb, detailedWs, 'Weekly Plans');
            }
            
            // Generate filename with date
            const today = new Date().toISOString().split('T')[0];
            const filename = `Weekly_Plans_Dashboard_Export_${today}.xlsx`;
            
            // Save file
            XLSX.writeFile(wb, filename);
            
        } catch (error) {
            console.error('Error exporting weekly plans data:', error);
            alert('Failed to export weekly plans data. Please try again.');
        }
    };

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

    return (
        <div className="min-w-0">
            <h1 className="text-xl font-semibold text-neutral-900 mb-4 sm:text-2xl sm:mb-6">Dashboard</h1>
            {error && <div className="mb-4 text-red-600 text-sm sm:text-base">{error}</div>}

            {/* Region Filter */}
            {!loading && allRegions.length > 0 && (
                <div className="mb-6 flex items-center gap-3">
                    <label htmlFor="region-filter" className="text-sm font-medium text-neutral-700">
                        Filter by Region:
                    </label>
                    <select
                        id="region-filter"
                        value={regionFilter}
                        onChange={(e) => setRegionFilter(e.target.value)}
                        className="border border-neutral-300 rounded-md py-2 px-3 text-sm bg-white focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                    >
                        <option value="">All Regions</option>
                        {allRegions.map((region) => (
                            <option key={region} value={region}>
                                {region}
                            </option>
                        ))}
                    </select>
                    {regionFilter && (
                        <span className="text-sm text-neutral-500">
                            Showing data for <strong>{regionFilter}</strong>
                        </span>
                    )}
                </div>
            )}

            {loading ? (
                <div className="text-neutral-500 text-sm sm:text-base">Loading dashboard data...</div>
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
                                                <div className="text-2xl font-semibold text-neutral-900">{chartData.counts.clients || 0}</div>
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
                                                    {chartData.counts.mchReports || 0}
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
                                                <div className="text-2xl font-semibold text-neutral-900">{chartData.counts.plans || 0}</div>
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
                                <div className="flex justify-between items-center mb-3">
                                    <h3 className="text-sm font-medium text-neutral-900">
                                        Client Registrations – Green vs Blue
                                    </h3>
                                    <button
                                        onClick={exportClientData}
                                        className="flex items-center gap-1 px-2 py-1 bg-green-600 text-white rounded text-xs hover:bg-green-700 transition-colors"
                                        disabled={loading || chartData.counts.clients === 0}
                                    >
                                        <Download className="h-3 w-3" />
                                        Export
                                    </button>
                                </div>
                                {loading ? (
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
                                <div className="flex justify-between items-center mb-3">
                                    <h3 className="text-sm font-medium text-neutral-900">
                                        Age Distribution
                                    </h3>
                                </div>
                                {loading ? (
                                    <p className="text-xs sm:text-sm text-neutral-500">Loading chart...</p>
                                ) : chartData.ageDistribution.length === 0 ? (
                                    <p className="text-xs sm:text-sm text-neutral-500">
                                        No age data available yet.
                                    </p>
                                ) : (
                                    <div className="h-56 sm:h-64 w-full">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <BarChart
                                                data={chartData.ageDistribution}
                                                margin={{ top: 12, right: 12, left: 24, bottom: 4 }}
                                            >
                                                <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" />
                                                <XAxis 
                                                    dataKey="ageGroup" 
                                                    tick={{ fontSize: 11 }} 
                                                    stroke="#737373"
                                                    angle={-45}
                                                    textAnchor="end"
                                                    height={60}
                                                />
                                                <YAxis tick={{ fontSize: 11 }} stroke="#737373" allowDecimals={false} />
                                                <Tooltip
                                                    contentStyle={{ borderRadius: '8px', border: '1px solid #e5e5e5' }}
                                                    formatter={(value) => [value, 'Clients']}
                                                />
                                                <Bar 
                                                    dataKey="count" 
                                                    name="Clients" 
                                                    fill={CHART_COLORS.purple} 
                                                    radius={[4, 4, 0, 0]} 
                                                />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </div>
                                )}
                            </div>

                            <div className="bg-white shadow rounded-lg p-4 sm:p-5">
                                <div className="flex justify-between items-center mb-3">
                                    <h3 className="text-sm font-medium text-neutral-900">
                                        MCH Reports – Green vs Blue
                                    </h3>
                                    <button
                                        onClick={exportMCHData}
                                        className="flex items-center gap-1 px-2 py-1 bg-green-600 text-white rounded text-xs hover:bg-green-700 transition-colors"
                                        disabled={loading || chartData.counts.mchReports === 0}
                                    >
                                        <Download className="h-3 w-3" />
                                        Export
                                    </button>
                                </div>
                                {loading ? (
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
                                <div className="flex justify-between items-center mb-3">
                                    <h3 className="text-sm font-medium text-neutral-900">
                                        Weekly Plans – By Day of Week
                                    </h3>
                                    <button
                                        onClick={exportWeeklyPlans}
                                        className="flex items-center gap-1 px-2 py-1 bg-green-600 text-white rounded text-xs hover:bg-green-700 transition-colors"
                                        disabled={loading || chartData.counts.plans === 0}
                                    >
                                        <Download className="h-3 w-3" />
                                        Export
                                    </button>
                                </div>
                                {loading ? (
                                    <p className="text-xs sm:text-sm text-neutral-500">Loading chart...</p>
                                ) : chartData.plansByDay.every((d) => d.count === 0) ? (
                                    <p className="text-xs sm:text-sm text-neutral-500">
                                        No weekly plans data available yet.
                                    </p>
                                ) : (
                                    <div className="h-56 sm:h-64 w-full">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <BarChart
                                                data={chartData.plansByDay}
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
                    </div>
                </>
            )}
        </div>
    );
};

export default Dashboard;
