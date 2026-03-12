import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getUsers } from '../../services/userService';
import { getAllClients, getAllReports, getAllPlans } from '../../services/recordService';
import { ArrowLeft, UserCircle } from 'lucide-react';

const ROLE_LABELS = {
    SUPER_ADMIN: 'Super Admin',
    PM: 'Project Manager',
    MENTOR_MOTHER: 'Mentor Mother',
};

const UserDetail = () => {
    const { userId } = useParams();
    const navigate = useNavigate();

    const [user, setUser] = useState(null);
    const [loadingUser, setLoadingUser] = useState(true);
    const [loadingActivity, setLoadingActivity] = useState(true);
    const [clients, setClients] = useState([]);
    const [reports, setReports] = useState([]);
    const [plans, setPlans] = useState([]);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchUserAndActivity = async () => {
            try {
                setError('');
                setLoadingUser(true);
                setLoadingActivity(true);

                const usersRes = await getUsers();
                const list = usersRes.data.results || usersRes.data || [];
                const found = list.find((u) => String(u.id) === String(userId));
                if (!found) {
                    setError('User not found.');
                    setLoadingUser(false);
                    setLoadingActivity(false);
                    return;
                }
                setUser(found);
                setLoadingUser(false);

                // Pre-compute team (for PMs)
                const idStr = String(found.id);
                const userFullName =
                    [found.first_name, found.last_name].filter(Boolean).join(' ') || found.email;
                const teamMmIds = list
                    .filter((u) => u.role === 'MENTOR_MOTHER' && String(u.pm) === idStr)
                    .map((u) => String(u.id));

                try {
                    const [clientsRes, reportsRes, plansRes] = await Promise.all([
                        getAllClients(),
                        getAllReports(),
                        getAllPlans(),
                    ]);

                    const allClients = Array.isArray(clientsRes.data) ? clientsRes.data : [];
                    const allReports = Array.isArray(reportsRes.data) ? reportsRes.data : [];
                    const allPlans = Array.isArray(plansRes.data) ? plansRes.data : [];

                    // Filter activity based on role
                    let userClients = allClients;
                    let userReports = allReports;
                    let userPlans = allPlans;

                    if (found.role === 'MENTOR_MOTHER') {
                        userClients = allClients.filter(
                            (c) =>
                                String(c.created_by) === idStr ||
                                (c.mentor_mother_name && c.mentor_mother_name === userFullName)
                        );
                        userReports = allReports.filter(
                            (r) =>
                                String(r.created_by) === idStr ||
                                (r.mentor_mother_name && r.mentor_mother_name === userFullName)
                        );
                        userPlans = allPlans.filter(
                            (p) =>
                                String(p.created_by) === idStr ||
                                (p.mentor_mother_name && p.mentor_mother_name === userFullName)
                        );
                    } else if (found.role === 'PM') {
                        userClients = allClients.filter((c) => {
                            const createdBy = String(c.created_by);
                            return createdBy === idStr || teamMmIds.includes(createdBy);
                        });
                        userReports = allReports.filter((r) => {
                            const createdBy = String(r.created_by);
                            return createdBy === idStr || teamMmIds.includes(createdBy);
                        });
                        userPlans = allPlans.filter((p) => {
                            const createdBy = String(p.created_by);
                            return createdBy === idStr || teamMmIds.includes(createdBy);
                        });
                    } else {
                        // Super Admin or other roles – just records they personally created
                        userClients = allClients.filter((c) => String(c.created_by) === idStr);
                        userReports = allReports.filter((r) => String(r.created_by) === idStr);
                        userPlans = allPlans.filter((p) => String(p.created_by) === idStr);
                    }

                    setClients(userClients);
                    setReports(userReports);
                    setPlans(userPlans);
                } catch (activityErr) {
                    console.error(activityErr);
                    setError('Failed to load user activity.');
                }
            } catch (err) {
                console.error(err);
                setError('Failed to load user details.');
            } finally {
                setLoadingActivity(false);
            }
        };

        fetchUserAndActivity();
    }, [userId]);

    const fullName = user
        ? [user.first_name, user.last_name].filter(Boolean).join(' ') || user.email
        : '';

    return (
        <div className="min-w-0">
            <button
                type="button"
                onClick={() => navigate('/users')}
                className="inline-flex items-center text-sm text-primary-700 hover:text-primary-900 mb-3"
            >
                <ArrowLeft className="h-4 w-4 mr-1" />
                Back to users
            </button>

            <div className="bg-white shadow sm:rounded-lg">
                <div className="px-4 py-5 sm:px-6 border-b border-neutral-200 flex items-center gap-3">
                    <UserCircle className="h-10 w-10 text-neutral-400" />
                    <div>
                        <h2 className="text-lg font-medium leading-6 text-neutral-900">
                            {loadingUser ? 'Loading user…' : fullName}
                        </h2>
                        {user && (
                            <p className="mt-1 max-w-2xl text-sm text-neutral-500">
                                {ROLE_LABELS[user.role] || user.role} · {user.email}
                            </p>
                        )}
                    </div>
                </div>
                {error && (
                    <div className="px-4 py-3 sm:px-6 text-sm text-red-600 border-b border-red-100 bg-red-50">
                        {error}
                    </div>
                )}
                {user && (
                    <div className="px-4 py-5 sm:px-6 space-y-4 text-sm">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <span className="font-medium text-neutral-700">Name:</span>{' '}
                                <span className="text-neutral-900">
                                    {[user.first_name, user.last_name].filter(Boolean).join(' ') || '—'}
                                </span>
                            </div>
                            <div>
                                <span className="font-medium text-neutral-700">Email:</span>{' '}
                                <span className="text-neutral-900">{user.email}</span>
                            </div>
                            <div>
                                <span className="font-medium text-neutral-700">Phone:</span>{' '}
                                <span className="text-neutral-900">{user.phone_number || '—'}</span>
                            </div>
                            <div>
                                <span className="font-medium text-neutral-700">Region:</span>{' '}
                                <span className="text-neutral-900">{user.region_name || '—'}</span>
                            </div>
                            <div>
                                <span className="font-medium text-neutral-700">Role:</span>{' '}
                                <span className="text-neutral-900">
                                    {ROLE_LABELS[user.role] || user.role}
                                </span>
                            </div>
                            <div>
                                <span className="font-medium text-neutral-700">Assigned PM:</span>{' '}
                                <span className="text-neutral-900">{user.pm_email || '—'}</span>
                            </div>
                            <div>
                                <span className="font-medium text-neutral-700">Status:</span>{' '}
                                <span className="text-neutral-900">
                                    {user.is_active !== false ? 'Active' : 'Disabled'}
                                </span>
                            </div>
                            <div>
                                <span className="font-medium text-neutral-700">Date joined:</span>{' '}
                                <span className="text-neutral-900">
                                    {new Date(user.date_joined).toLocaleString()}
                                </span>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <div className="mt-6 space-y-6">
                <div className="bg-white shadow sm:rounded-lg">
                    <div className="px-4 py-3 sm:px-6 border-b border-neutral-200 flex justify-between items-center">
                        <h3 className="text-sm font-medium text-neutral-900">Client registrations</h3>
                        {loadingActivity && <span className="text-xs text-neutral-500">Loading…</span>}
                    </div>
                    <div className="px-3 py-3 sm:px-6">
                        {clients.length === 0 ? (
                            <p className="text-sm text-neutral-500">No client registrations created by this user.</p>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-neutral-200 text-sm">
                                    <thead className="bg-neutral-50">
                                        <tr>
                                            <th className="px-2 py-1 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Date</th>
                                            <th className="px-2 py-1 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Client</th>
                                            <th className="px-2 py-1 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Mentor Mother</th>
                                            <th className="px-2 py-1 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Folder</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-neutral-200">
                                        {clients.map((c) => (
                                            <tr key={c.id}>
                                                <td className="px-2 py-1 whitespace-nowrap">{c.date}</td>
                                                <td className="px-2 py-1 whitespace-nowrap">{c.name}</td>
                                                <td className="px-2 py-1 whitespace-nowrap">{c.mentor_mother_name}</td>
                                                <td className="px-2 py-1 whitespace-nowrap">{c.folder_number || '—'}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="bg-white shadow sm:rounded-lg">
                        <div className="px-4 py-3 sm:px-6 border-b border-neutral-200 flex justify-between items-center">
                            <h3 className="text-sm font-medium text-neutral-900">MCH reports</h3>
                            {loadingActivity && <span className="text-xs text-neutral-500">Loading…</span>}
                        </div>
                        <div className="px-3 py-3 sm:px-6">
                            {reports.length === 0 ? (
                                <p className="text-sm text-neutral-500">No MCH reports created by this user.</p>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-neutral-200 text-sm">
                                        <thead className="bg-neutral-50">
                                            <tr>
                                                <th className="px-2 py-1 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Date</th>
                                                <th className="px-2 py-1 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Mentor Mother</th>
                                                <th className="px-2 py-1 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Green / Blue</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-neutral-200">
                                            {reports.map((r) => (
                                                <tr key={r.id}>
                                                    <td className="px-2 py-1 whitespace-nowrap">{r.date}</td>
                                                    <td className="px-2 py-1 whitespace-nowrap">{r.mentor_mother_name}</td>
                                                    <td className="px-2 py-1 whitespace-nowrap">
                                                        {r.total_green ?? 0} / {r.total_blue ?? 0}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="bg-white shadow sm:rounded-lg">
                        <div className="px-4 py-3 sm:px-6 border-b border-neutral-200 flex justify-between items-center">
                            <h3 className="text-sm font-medium text-neutral-900">Weekly plans</h3>
                            {loadingActivity && <span className="text-xs text-neutral-500">Loading…</span>}
                        </div>
                        <div className="px-3 py-3 sm:px-6">
                            {plans.length === 0 ? (
                                <p className="text-sm text-neutral-500">No weekly plans created by this user.</p>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-neutral-200 text-sm">
                                        <thead className="bg-neutral-50">
                                            <tr>
                                                <th className="px-2 py-1 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Date</th>
                                                <th className="px-2 py-1 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Day</th>
                                                <th className="px-2 py-1 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">District</th>
                                                <th className="px-2 py-1 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Client</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-neutral-200">
                                            {plans.map((p) => (
                                                <tr key={p.id}>
                                                    <td className="px-2 py-1 whitespace-nowrap">{p.date}</td>
                                                    <td className="px-2 py-1 whitespace-nowrap">{p.day_of_week}</td>
                                                    <td className="px-2 py-1 whitespace-nowrap">{p.district}</td>
                                                    <td className="px-2 py-1 whitespace-nowrap">{p.client_name}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserDetail;

