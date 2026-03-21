import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    getUsers,
    createUser,
    updateUser,
    deleteUser,
    getRegions,
    createRegion,
    getPermissions,
} from '../../services/userService';
import { useAuthStore } from '../../store/authStore';
import { Plus, X, UserCircle, Pencil, UserX, UserCheck, Trash2, MapPin } from 'lucide-react';
import Pagination from '../../components/common/Pagination';

const ROLE_LABELS = { SUPER_ADMIN: 'Super Admin', PM: 'Project Manager', MENTOR_MOTHER: 'Mentor Mother' };

const defaultUserForm = {
    email: '',
    password: '',
    first_name: '',
    last_name: '',
    phone_number: '',
    role: 'MENTOR_MOTHER',
    region: '',
    pm: '',
    feature_permissions: [],
};

const Users = () => {
    const [users, setUsers] = useState([]);
    const [regions, setRegions] = useState([]);
    const [permissions, setPermissions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editUser, setEditUser] = useState(null);
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [showRegionModal, setShowRegionModal] = useState(false);
    const [regionForm, setRegionForm] = useState({ name: '', code: '' });
    const [formData, setFormData] = useState(defaultUserForm);
    const [showSuperAdminConfirm, setShowSuperAdminConfirm] = useState(false);
    const [pendingSuperAdminData, setPendingSuperAdminData] = useState(null);
    const [editFormData, setEditFormData] = useState({
        email: '',
        first_name: '',
        last_name: '',
        phone_number: '',
        role: 'MENTOR_MOTHER',
        region: '',
        pm: '',
        is_active: true,
        password: '',
        feature_permissions: [],
    });
    const { user: currentUser } = useAuthStore();
    const navigate = useNavigate();
    const isSuperAdmin = currentUser?.role === 'SUPER_ADMIN';
    const isPM = currentUser?.role === 'PM';
    const [roleFilter, setRoleFilter] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(25);

    const fetchUsers = async () => {
        try {
            const res = await getUsers();
            const allUsers = res.data.results || res.data || [];
            setUsers(allUsers);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const fetchRegions = async () => {
        if (!isSuperAdmin) return;
        try {
            const res = await getRegions();
            setRegions(res.data.results || res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const fetchPermissions = async () => {
        try {
            const res = await getPermissions();
            setPermissions(res.data.results || res.data);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        fetchUsers();
        fetchRegions();
        fetchPermissions();
    }, [isSuperAdmin]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        if (name === 'pm' && value) {
            const pmUser = users.find((u) => u.id === value);
            if (pmUser?.region) setFormData((prev) => ({ ...prev, region: pmUser.region }));
        }
    };

    const handleEditChange = (e) => {
        const { name, value } = e.target;
        const isCheckbox = e.target.type === 'checkbox';
        setEditFormData((prev) => ({ ...prev, [name]: isCheckbox ? e.target.checked : value }));
    };

    const handlePermissionToggle = (permId, isCreate = true) => {
        if (isCreate) {
            setFormData((prev) => ({
                ...prev,
                feature_permissions: prev.feature_permissions.includes(permId)
                    ? prev.feature_permissions.filter((x) => x !== permId)
                    : [...prev.feature_permissions, permId],
            }));
        } else {
            setEditFormData((prev) => ({
                ...prev,
                feature_permissions: prev.feature_permissions.includes(permId)
                    ? prev.feature_permissions.filter((x) => x !== permId)
                    : [...prev.feature_permissions, permId],
            }));
        }
    };

    const buildCreatePayload = () => {
        const payload = {
            email: formData.email,
            first_name: formData.first_name,
            last_name: formData.last_name,
            phone_number: formData.phone_number,
            role: formData.role,
        };
        if (formData.password) payload.password = formData.password;
        if (formData.role === 'PM') {
            payload.region = formData.region || null;
        }
        if (formData.role === 'MENTOR_MOTHER') {
            payload.pm = formData.pm || null;
        }
        if (formData.feature_permissions?.length) payload.feature_permissions = formData.feature_permissions;
        return payload;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Check if creating a super admin and show confirmation
        if (formData.role === 'SUPER_ADMIN') {
            setPendingSuperAdminData(buildCreatePayload());
            setShowSuperAdminConfirm(true);
            return;
        }
        
        try {
            await createUser(buildCreatePayload());
            setShowModal(false);
            setFormData(defaultUserForm);
            fetchUsers();
        } catch (err) {
            console.error('Error creating user', err);
            alert(JSON.stringify(err.response?.data) || 'Failed to create user');
        }
    };
    
    const confirmSuperAdminCreation = async () => {
        if (!pendingSuperAdminData) return;
        
        try {
            await createUser(pendingSuperAdminData);
            setShowSuperAdminConfirm(false);
            setPendingSuperAdminData(null);
            setShowModal(false);
            setFormData(defaultUserForm);
            fetchUsers();
        } catch (err) {
            console.error('Error creating super admin', err);
            alert(JSON.stringify(err.response?.data) || 'Failed to create super admin');
        }
    };
    
    const cancelSuperAdminCreation = () => {
        setShowSuperAdminConfirm(false);
        setPendingSuperAdminData(null);
    };

    const pmOptions = users.filter((u) => u.role === 'PM');

    const openEditModal = (u) => {
        setEditUser(u);
        setEditFormData({
            email: u.email,
            first_name: u.first_name || '',
            last_name: u.last_name || '',
            phone_number: u.phone_number || '',
            role: u.role,
            region: u.region || '',
            pm: u.pm || '',
            is_active: u.is_active !== false,
            password: '',
            feature_permissions: u.permission_codes ? permissions.filter((p) => u.permission_codes.includes(p.code)).map((p) => p.id) : [],
        });
    };

    const handleEditSubmit = async (e) => {
        e.preventDefault();
        if (!editUser) return;
        try {
            const payload = {
                email: editFormData.email,
                first_name: editFormData.first_name,
                last_name: editFormData.last_name,
                phone_number: editFormData.phone_number,
                role: editFormData.role,
                is_active: editFormData.is_active,
                region: editFormData.region || null,
                pm: editFormData.pm || null,
                feature_permissions: editFormData.feature_permissions || [],
            };
            if (editFormData.password?.trim()) payload.password = editFormData.password;
            await updateUser(editUser.id, payload);
            setEditUser(null);
            fetchUsers();
        } catch (err) {
            console.error('Error updating user', err);
            alert(err.response?.data?.detail || JSON.stringify(err.response?.data) || 'Failed to update user');
        }
    };

    const handleToggleActive = async (u) => {
        try {
            await updateUser(u.id, { is_active: !u.is_active });
            fetchUsers();
        } catch (err) {
            alert(err.response?.data?.detail || 'Failed to update user status.');
        }
    };

    const handleDeleteConfirm = async () => {
        console.log('Delete confirm called, deleteTarget:', deleteTarget);
        if (!deleteTarget) {
            console.log('No delete target, returning');
            return;
        }
        try {
            console.log('Attempting to delete user:', deleteTarget.id);
            await deleteUser(deleteTarget.id);
            console.log('Delete successful');
            setDeleteTarget(null);
            fetchUsers();
        } catch (err) {
            console.error('Error deleting user:', err);
            alert(err.response?.data?.detail || 'Failed to delete user.');
        }
    };

    const handleRegionSubmit = async (e) => {
        e.preventDefault();
        try {
            await createRegion(regionForm);
            setShowRegionModal(false);
            setRegionForm({ name: '', code: '' });
            fetchRegions();
        } catch (err) {
            alert(err.response?.data?.detail || JSON.stringify(err.response?.data) || 'Failed to create region.');
        }
    };

    const isCurrentUser = (u) => String(u.id) === String(currentUser?.user_id) || u.email === currentUser?.email;

    const filteredUsers = roleFilter
        ? users.filter((u) => u.role === roleFilter)
        : users;

    // Pagination
    const paginatedUsers = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        return filteredUsers.slice(startIndex, endIndex);
    }, [filteredUsers, currentPage, itemsPerPage]);

    const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);

    // Reset page when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [roleFilter]);

    const createRoleOptions = () => {
        if (isSuperAdmin) {
            return [
                <option key="SUPER_ADMIN" value="SUPER_ADMIN">Super Admin</option>,
                <option key="PM" value="PM">Project Manager</option>,
                <option key="MENTOR_MOTHER" value="MENTOR_MOTHER">Mentor Mother</option>
            ];
        }
        return [<option key="MENTOR_MOTHER" value="MENTOR_MOTHER">Mentor Mother</option>];
    };

    return (
        <div className="min-w-0">
            <div className="flex flex-col gap-4 mb-6 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0 flex-1">
                    <h2 className="text-xl font-semibold text-neutral-900 sm:text-2xl">User Management</h2>
                    <p className="mt-1 sm:mt-2 text-sm text-neutral-700">Manage Project Managers and Mentor Mothers.</p>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                    {isSuperAdmin && (
                        <button
                            type="button"
                            onClick={() => setShowRegionModal(true)}
                            className="inline-flex items-center px-4 py-2 border border-neutral-300 rounded-md text-sm font-medium text-neutral-700 bg-white hover:bg-neutral-50"
                        >
                            <MapPin className="-ml-0.5 mr-2 h-4 w-4" /> Add Region
                        </button>
                    )}
                    <button
                        onClick={() => setShowModal(true)}
                        className="inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
                    >
                        <Plus className="-ml-1 mr-2 h-5 w-5 flex-shrink-0" /> Add User
                    </button>
                </div>
            </div>

            {isSuperAdmin && regions.length > 0 && (
                <div className="bg-white shadow overflow-hidden sm:rounded-md mb-6">
                    <div className="px-4 py-3 border-b border-neutral-200 font-medium text-neutral-900">Regions</div>
                    <ul className="divide-y divide-neutral-200">
                        {regions.map((r) => (
                            <li key={r.id} className="px-4 py-2 flex justify-between text-sm">
                                <span>{r.name}</span>
                                <span className="text-neutral-500">{r.code}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            <div className="bg-white shadow overflow-hidden sm:rounded-md">
                {loading ? (
                    <div className="p-4 text-center text-neutral-500">Loading...</div>
                ) : (
                    <div className="overflow-x-auto -mx-3 sm:mx-0" style={{ WebkitOverflowScrolling: 'touch' }}>
                        <div className="px-3 pt-3 pb-2 sm:px-6 flex items-center gap-3 text-sm">
                            <span className="text-neutral-600 font-medium">Filter by role:</span>
                            <select
                                value={roleFilter}
                                onChange={(e) => setRoleFilter(e.target.value)}
                                className="border border-neutral-300 rounded-md py-1 px-2 bg-white text-sm"
                            >
                                <option value="">All</option>
                                <option value="SUPER_ADMIN">Super Admin</option>
                                <option value="PM">Project Manager</option>
                                <option value="MENTOR_MOTHER">Mentor Mother</option>
                            </select>
                        </div>
                        <table className="min-w-full divide-y divide-neutral-200">
                            <thead className="bg-neutral-50">
                                <tr>
                                    <th className="px-3 py-2 sm:px-6 sm:py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Name / Email</th>
                                    <th className="px-3 py-2 sm:px-6 sm:py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Role</th>
                                    <th className="px-3 py-2 sm:px-6 sm:py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Region</th>
                                    <th className="px-3 py-2 sm:px-6 sm:py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">PM</th>
                                    <th className="px-3 py-2 sm:px-6 sm:py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Status</th>
                                    <th className="px-3 py-2 sm:px-6 sm:py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Date Joined</th>
                                    <th className="px-3 py-2 sm:px-6 sm:py-3 text-right text-xs font-medium text-neutral-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-neutral-200">
                                {paginatedUsers.map((u) => (
                                    <tr key={u.id} className={`hover:bg-neutral-50 ${u.is_active === false ? 'bg-neutral-50 opacity-75' : ''}`}>
                                        <td className="px-3 py-3 whitespace-nowrap sm:px-6 sm:py-4">
                                            <div className="flex items-center min-w-0">
                                                <UserCircle className="h-8 w-8 sm:h-10 sm:w-10 text-neutral-400 flex-shrink-0" />
                                                <div className="ml-2 sm:ml-4 min-w-0">
                                                    <div className="text-sm font-medium text-neutral-900 truncate">
                                                        {[u.first_name, u.last_name].filter(Boolean).join(' ') || u.email}
                                                    </div>
                                                    <div className="text-xs text-neutral-500 truncate">{u.email}</div>
                                                    {isCurrentUser(u) && (
                                                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-neutral-100 text-neutral-800">You</span>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-3 py-3 whitespace-nowrap sm:px-6 sm:py-4">
                                            <span
                                                className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                                    u.role === 'SUPER_ADMIN' ? 'bg-purple-100 text-purple-800' : u.role === 'PM' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                                                }`}
                                            >
                                                {ROLE_LABELS[u.role] || u.role}
                                            </span>
                                        </td>
                                        <td className="px-3 py-3 whitespace-nowrap text-sm text-neutral-500 sm:px-6 sm:py-4">{u.region_name || '—'}</td>
                                        <td className="px-3 py-3 whitespace-nowrap text-sm text-neutral-500 sm:px-6 sm:py-4">{u.pm_email || '—'}</td>
                                        <td className="px-3 py-3 whitespace-nowrap sm:px-6 sm:py-4">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-medium rounded-full ${u.is_active !== false ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                                {u.is_active !== false ? 'Active' : 'Disabled'}
                                            </span>
                                        </td>
                                        <td className="px-3 py-3 whitespace-nowrap text-sm text-neutral-500 sm:px-6 sm:py-4">{new Date(u.date_joined).toLocaleDateString()}</td>
                                        <td className="px-3 py-3 whitespace-nowrap sm:px-6 sm:py-4">
                                            <div className="flex items-center justify-end gap-1 sm:gap-2">
                                                <button
                                                    onClick={() => navigate(`/users/${u.id}`)}
                                                    className="p-2 text-neutral-500 hover:text-primary-600 hover:bg-primary-50 rounded-md"
                                                    title="View details"
                                                >
                                                    <UserCircle className="h-4 w-4" />
                                                </button>
                                                <button onClick={() => openEditModal(u)} className="p-2 text-neutral-500 hover:text-primary-600 hover:bg-primary-50 rounded-md" title="Edit">
                                                    <Pencil className="h-4 w-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleToggleActive(u)}
                                                    disabled={isCurrentUser(u)}
                                                    title={u.is_active !== false ? 'Disable' : 'Enable'}
                                                    className={`p-2 rounded-md transition-colors disabled:opacity-40 ${u.is_active !== false ? 'text-neutral-500 hover:text-amber-600 hover:bg-amber-50' : 'text-neutral-500 hover:text-green-600 hover:bg-green-50'}`}
                                                >
                                                    {u.is_active !== false ? <UserX className="h-4 w-4" /> : <UserCheck className="h-4 w-4" />}
                                                </button>
                                                <button
                                                    onClick={() => setDeleteTarget(u)}
                                                    disabled={isCurrentUser(u)}
                                                    className="p-2 text-neutral-500 hover:text-red-600 hover:bg-red-50 rounded-md disabled:opacity-40"
                                                    title="Delete"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {users.length === 0 && (
                                    <tr>
                                        <td colSpan="7" className="px-3 py-4 text-center text-neutral-500 text-sm sm:px-6">No users found.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {showRegionModal && (
                <div className="fixed z-10 inset-0 overflow-y-auto p-4">
                    <div className="flex min-h-full items-center justify-center">
                        <div className="fixed inset-0 bg-neutral-500 opacity-75" onClick={() => setShowRegionModal(false)} />
                        <div className="relative bg-white rounded-lg shadow-xl w-full max-w-md p-6">
                            <h3 className="text-lg font-medium text-neutral-900 mb-4">Add Region</h3>
                            <form onSubmit={handleRegionSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-neutral-700">Name</label>
                                    <input
                                        type="text"
                                        required
                                        value={regionForm.name}
                                        onChange={(e) => setRegionForm((p) => ({ ...p, name: e.target.value }))}
                                        className="mt-1 block w-full border border-neutral-300 rounded-md py-2 px-3 sm:text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-neutral-700">Code</label>
                                    <input
                                        type="text"
                                        required
                                        value={regionForm.code}
                                        onChange={(e) => setRegionForm((p) => ({ ...p, code: e.target.value }))}
                                        className="mt-1 block w-full border border-neutral-300 rounded-md py-2 px-3 sm:text-sm"
                                    />
                                </div>
                                <div className="flex justify-end gap-2 pt-2">
                                    <button type="button" onClick={() => setShowRegionModal(false)} className="px-4 py-2 border border-neutral-300 rounded-md text-sm font-medium text-neutral-700 hover:bg-neutral-50">
                                        Cancel
                                    </button>
                                    <button type="submit" className="px-4 py-2 bg-primary-600 text-white rounded-md text-sm font-medium hover:bg-primary-700">
                                        Create Region
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {showModal && (
                <div className="fixed z-10 inset-0 overflow-y-auto p-4 sm:p-0">
                    <div className="flex min-h-full sm:min-h-screen items-center justify-center">
                        <div className="fixed inset-0 bg-neutral-500 opacity-75" onClick={() => setShowModal(false)} />
                        <div className="relative bg-white rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
                            <div className="p-6">
                                <h3 className="text-lg font-medium text-neutral-900 mb-4">Add User</h3>
                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-neutral-700">First name</label>
                                            <input type="text" name="first_name" value={formData.first_name} onChange={handleChange} className="mt-1 block w-full border border-neutral-300 rounded-md py-2 px-3 sm:text-sm" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-neutral-700">Last name</label>
                                            <input type="text" name="last_name" value={formData.last_name} onChange={handleChange} className="mt-1 block w-full border border-neutral-300 rounded-md py-2 px-3 sm:text-sm" />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-neutral-700">Email</label>
                                        <input type="email" required name="email" value={formData.email} onChange={handleChange} className="mt-1 block w-full border border-neutral-300 rounded-md py-2 px-3 sm:text-sm" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-neutral-700">Phone number</label>
                                        <input type="text" name="phone_number" value={formData.phone_number} onChange={handleChange} className="mt-1 block w-full border border-neutral-300 rounded-md py-2 px-3 sm:text-sm" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-neutral-700">Password (user can change after first login)</label>
                                        <input type="password" name="password" autoComplete="new-password" value={formData.password} onChange={handleChange} placeholder="Min 8 characters" className="mt-1 block w-full border border-neutral-300 rounded-md py-2 px-3 sm:text-sm" minLength={8} />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-neutral-700">Role</label>
                                        <select name="role" value={formData.role} onChange={handleChange} className="mt-1 block w-full border border-neutral-300 rounded-md py-2 px-3 sm:text-sm">
                                            {createRoleOptions()}
                                        </select>
                                    </div>
                                    {formData.role === 'PM' && (
                                        <div>
                                            <label className="block text-sm font-medium text-neutral-700">Region</label>
                                            <select name="region" value={formData.region} onChange={handleChange} className="mt-1 block w-full border border-neutral-300 rounded-md py-2 px-3 sm:text-sm">
                                                <option value="">Select region</option>
                                                {regions.map((r) => (
                                                    <option key={r.id} value={r.id}>{r.name} ({r.code})</option>
                                                ))}
                                            </select>
                                        </div>
                                    )}
                                    {formData.role === 'MENTOR_MOTHER' && (
                                        <div>
                                            <label className="block text-sm font-medium text-neutral-700">Assigned to PM</label>
                                            <select name="pm" value={formData.pm} onChange={handleChange} className="mt-1 block w-full border border-neutral-300 rounded-md py-2 px-3 sm:text-sm">
                                                <option value="">Select PM</option>
                                                {pmOptions.map((p) => (
                                                    <option key={p.id} value={p.id}>{p.first_name} {p.last_name} ({p.email}) — {p.region_name}</option>
                                                ))}
                                            </select>
                                            <p className="mt-1 text-xs text-neutral-500">Region will be set from the PM.</p>
                                        </div>
                                    )}
                                    {permissions.length > 0 && (formData.role === 'PM' || formData.role === 'MENTOR_MOTHER') && (
                                        <div>
                                            <label className="block text-sm font-medium text-neutral-700 mb-2">Permissions</label>
                                            <p className="text-xs text-neutral-500 mb-2">Choose which modules and actions this user can access.</p>
                                            <div className="border border-neutral-200 rounded-md p-3 max-h-48 overflow-y-auto space-y-2">
                                                {permissions.map((p) => (
                                                    <label key={p.id} className="flex items-center gap-2">
                                                        <input
                                                            type="checkbox"
                                                            checked={formData.feature_permissions.includes(p.id)}
                                                            onChange={() => handlePermissionToggle(p.id, true)}
                                                        />
                                                        <span className="text-sm">{p.name} ({p.code})</span>
                                                    </label>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                    <div className="flex justify-end gap-2 pt-4">
                                        <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 border border-neutral-300 rounded-md text-sm font-medium text-neutral-700 hover:bg-neutral-50">
                                            Cancel
                                        </button>
                                        <button type="submit" className="px-4 py-2 bg-primary-600 text-white rounded-md text-sm font-medium hover:bg-primary-700">
                                            Create User
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {editUser && (
                <div className="fixed z-10 inset-0 overflow-y-auto p-4 sm:p-0">
                    <div className="flex min-h-full sm:min-h-screen items-center justify-center">
                        <div className="fixed inset-0 bg-neutral-500 opacity-75" onClick={() => setEditUser(null)} />
                        <div className="relative bg-white rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
                            <div className="p-6">
                                <h3 className="text-lg font-medium text-neutral-900 mb-4">Edit User</h3>
                                <form onSubmit={handleEditSubmit} className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-neutral-700">First name</label>
                                            <input type="text" name="first_name" value={editFormData.first_name} onChange={handleEditChange} className="mt-1 block w-full border border-neutral-300 rounded-md py-2 px-3 sm:text-sm" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-neutral-700">Last name</label>
                                            <input type="text" name="last_name" value={editFormData.last_name} onChange={handleEditChange} className="mt-1 block w-full border border-neutral-300 rounded-md py-2 px-3 sm:text-sm" />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-neutral-700">Email</label>
                                        <input type="email" required name="email" value={editFormData.email} onChange={handleEditChange} className="mt-1 block w-full border border-neutral-300 rounded-md py-2 px-3 sm:text-sm" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-neutral-700">Phone number</label>
                                        <input type="text" name="phone_number" value={editFormData.phone_number} onChange={handleEditChange} className="mt-1 block w-full border border-neutral-300 rounded-md py-2 px-3 sm:text-sm" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-neutral-700">New password (optional)</label>
                                        <input type="password" name="password" autoComplete="new-password" value={editFormData.password} onChange={handleEditChange} placeholder="Leave blank to keep current" className="mt-1 block w-full border border-neutral-300 rounded-md py-2 px-3 sm:text-sm" minLength={8} />
                                    </div>
                                    {isSuperAdmin && (
                                        <div>
                                            <label className="block text-sm font-medium text-neutral-700">Role</label>
                                            <select name="role" value={editFormData.role} onChange={handleEditChange} className="mt-1 block w-full border border-neutral-300 rounded-md py-2 px-3 sm:text-sm">
                                                <option value="SUPER_ADMIN">Super Admin</option>
                                                <option value="PM">Project Manager</option>
                                                <option value="MENTOR_MOTHER">Mentor Mother</option>
                                            </select>
                                        </div>
                                    )}
                                    {editFormData.role === 'PM' && (
                                        <div>
                                            <label className="block text-sm font-medium text-neutral-700">Region</label>
                                            <select name="region" value={editFormData.region} onChange={handleEditChange} className="mt-1 block w-full border border-neutral-300 rounded-md py-2 px-3 sm:text-sm">
                                                <option value="">Select region</option>
                                                {regions.map((r) => (
                                                    <option key={r.id} value={r.id}>{r.name} ({r.code})</option>
                                                ))}
                                            </select>
                                        </div>
                                    )}
                                    {editFormData.role === 'MENTOR_MOTHER' && (
                                        <div>
                                            <label className="block text-sm font-medium text-neutral-700">Assigned to PM</label>
                                            <select name="pm" value={editFormData.pm} onChange={handleEditChange} className="mt-1 block w-full border border-neutral-300 rounded-md py-2 px-3 sm:text-sm">
                                                <option value="">Select PM</option>
                                                {pmOptions.map((p) => (
                                                    <option key={p.id} value={p.id}>{p.first_name} {p.last_name} ({p.email})</option>
                                                ))}
                                            </select>
                                        </div>
                                    )}
                                    {permissions.length > 0 && (
                                        <div>
                                            <label className="block text-sm font-medium text-neutral-700 mb-2">Permissions</label>
                                            <p className="text-xs text-neutral-500 mb-2">Control which modules and actions this user can access (e.g. view dashboard, edit records).</p>
                                            <div className="border border-neutral-200 rounded-md p-3 max-h-48 overflow-y-auto space-y-2">
                                                {permissions.map((p) => (
                                                    <label key={p.id} className="flex items-center gap-2">
                                                        <input
                                                            type="checkbox"
                                                            checked={editFormData.feature_permissions.includes(p.id)}
                                                            onChange={() => handlePermissionToggle(p.id, false)}
                                                        />
                                                        <span className="text-sm">{p.name} ({p.code})</span>
                                                    </label>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                    <div>
                                        <label className="flex items-center gap-2">
                                            <input type="checkbox" name="is_active" checked={editFormData.is_active} onChange={handleEditChange} className="h-4 w-4 text-primary-600 border-neutral-300 rounded" />
                                            <span className="text-sm font-medium text-neutral-700">Active</span>
                                        </label>
                                    </div>
                                    <div className="flex justify-end gap-2 pt-4">
                                        <button type="button" onClick={() => setEditUser(null)} className="px-4 py-2 border border-neutral-300 rounded-md text-sm font-medium text-neutral-700 hover:bg-neutral-50">
                                            Cancel
                                        </button>
                                        <button type="submit" className="px-4 py-2 bg-primary-600 text-white rounded-md text-sm font-medium hover:bg-primary-700">
                                            Save
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {deleteTarget && (
                <div className="fixed z-10 inset-0 overflow-y-auto p-4">
                    <div className="flex min-h-full items-center justify-center">
                        <div className="fixed inset-0 bg-neutral-500 opacity-75" onClick={() => setDeleteTarget(null)} />
                        <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full p-6">
                            <h3 className="text-lg font-medium text-neutral-900 mb-2">Delete User</h3>
                            <p className="text-sm text-neutral-600 mb-6">
                                Are you sure you want to delete <strong>{deleteTarget.email}</strong>? This action cannot be undone.
                            </p>
                            <div className="flex justify-end gap-2">
                                <button type="button" onClick={() => setDeleteTarget(null)} className="px-4 py-2 border border-neutral-300 rounded-md text-sm font-medium text-neutral-700 hover:bg-neutral-50">
                                    Cancel
                                </button>
                                <button 
                                    type="button" 
                                    onClick={() => {
                                        console.log('Delete button clicked');
                                        handleDeleteConfirm();
                                    }} 
                                    className="px-4 py-2 bg-red-600 text-white rounded-md text-sm font-medium hover:bg-red-700"
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {showSuperAdminConfirm && (
                <div className="fixed z-10 inset-0 overflow-y-auto p-4">
                    <div className="flex min-h-full items-center justify-center">
                        <div className="fixed inset-0 bg-neutral-500 opacity-75" onClick={cancelSuperAdminCreation} />
                        <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full p-6">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="flex-shrink-0">
                                    <UserCircle className="h-8 w-8 text-purple-600" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-medium text-neutral-900">Create Super Admin</h3>
                                    <p className="text-sm text-neutral-600">Confirm this sensitive action</p>
                                </div>
                            </div>
                            
                            <div className="bg-purple-50 border border-purple-200 rounded-md p-4 mb-4">
                                <p className="text-sm text-purple-800 font-medium mb-2">⚠️ Important Security Notice</p>
                                <ul className="text-sm text-purple-700 space-y-1">
                                    <li>• Super Admins have full system access</li>
                                    <li>• They can manage all users and data</li>
                                    <li>• This action cannot be easily reversed</li>
                                    <li>• Only create for trusted personnel</li>
                                </ul>
                            </div>
                            
                            <div className="bg-neutral-50 rounded-md p-3 mb-4">
                                <p className="text-sm text-neutral-600">
                                    Are you sure you want to create <strong>{formData.first_name} {formData.last_name}</strong> ({formData.email}) as a Super Admin?
                                </p>
                            </div>
                            
                            <div className="flex justify-end gap-2">
                                <button 
                                    type="button" 
                                    onClick={cancelSuperAdminCreation} 
                                    className="px-4 py-2 border border-neutral-300 rounded-md text-sm font-medium text-neutral-700 hover:bg-neutral-50"
                                >
                                    Cancel
                                </button>
                                <button 
                                    type="button" 
                                    onClick={confirmSuperAdminCreation} 
                                    className="px-4 py-2 bg-purple-600 text-white rounded-md text-sm font-medium hover:bg-purple-700"
                                >
                                    Create Super Admin
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
                itemsPerPage={itemsPerPage}
                totalItems={filteredUsers.length}
                onItemsPerPageChange={setItemsPerPage}
            />
        </div>
    );
};
export default Users;
