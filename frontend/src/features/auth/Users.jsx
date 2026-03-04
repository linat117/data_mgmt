import React, { useState, useEffect } from 'react';
import { getUsers, createUser, updateUser, deleteUser } from '../../services/userService';
import { useAuthStore } from '../../store/authStore';
import { Plus, X, UserCircle, Pencil, UserX, UserCheck, Trash2 } from 'lucide-react';

const Users = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editUser, setEditUser] = useState(null);
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        role: 'DATA_EXPERT'
    });
    const [editFormData, setEditFormData] = useState({
        email: '',
        role: 'DATA_EXPERT',
        is_active: true,
        password: ''
    });
    const { user: currentUser } = useAuthStore();

    const fetchUsers = async () => {
        try {
            const res = await getUsers();
            setUsers(res.data.results || res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleEditChange = (e) => {
        const { name, value } = e.target;
        const isCheckbox = e.target.type === 'checkbox';
        setEditFormData(prev => ({ ...prev, [name]: isCheckbox ? e.target.checked : value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await createUser(formData);
            setShowModal(false);
            setFormData({ email: '', password: '', role: 'DATA_EXPERT' });
            fetchUsers();
        } catch (err) {
            console.error('Error creating user', err);
            alert(JSON.stringify(err.response?.data) || 'Failed to create user');
        }
    };

    const openEditModal = (u) => {
        setEditUser(u);
        setEditFormData({
            email: u.email,
            role: u.role,
            is_active: u.is_active !== false,
            password: ''
        });
    };

    const handleEditSubmit = async (e) => {
        e.preventDefault();
        if (!editUser) return;
        try {
            const payload = { email: editFormData.email, role: editFormData.role, is_active: editFormData.is_active };
            if (editFormData.password && editFormData.password.trim()) {
                payload.password = editFormData.password;
            }
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
        if (!deleteTarget) return;
        try {
            await deleteUser(deleteTarget.id);
            setDeleteTarget(null);
            fetchUsers();
        } catch (err) {
            alert(err.response?.data?.detail || 'Failed to delete user.');
        }
    };

    const isCurrentUser = (u) => String(u.id) === String(currentUser?.user_id) || u.email === currentUser?.email;

    return (
        <div className="min-w-0">
            <div className="flex flex-col gap-4 mb-6 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0 flex-1">
                    <h2 className="text-xl font-semibold text-neutral-900 sm:text-2xl">User Management</h2>
                    <p className="mt-1 sm:mt-2 text-sm text-neutral-700">Manage system administrators and data entry experts.</p>
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    className="w-full sm:w-auto inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 shadow-sm hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 flex-shrink-0"
                >
                    <Plus className="-ml-1 mr-2 h-5 w-5 flex-shrink-0" /> Add New User
                </button>
            </div>

            <div className="bg-white shadow overflow-hidden sm:rounded-md">
                {loading ? (
                    <div className="p-4 text-center text-neutral-500">Loading...</div>
                ) : (
                    <div className="overflow-x-auto -mx-3 sm:mx-0" style={{ WebkitOverflowScrolling: 'touch' }}>
                        <table className="min-w-full divide-y divide-neutral-200">
                            <thead className="bg-neutral-50">
                                <tr>
                                    <th className="px-3 py-2 sm:px-6 sm:py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">User / Email</th>
                                    <th className="px-3 py-2 sm:px-6 sm:py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Role</th>
                                    <th className="px-3 py-2 sm:px-6 sm:py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Status</th>
                                    <th className="px-3 py-2 sm:px-6 sm:py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Date Joined</th>
                                    <th className="px-3 py-2 sm:px-6 sm:py-3 text-right text-xs font-medium text-neutral-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-neutral-200">
                                {users.map((u) => (
                                    <tr key={u.id} className={`hover:bg-neutral-50 ${u.is_active === false ? 'bg-neutral-50 opacity-75' : ''}`}>
                                        <td className="px-3 py-3 whitespace-nowrap sm:px-6 sm:py-4">
                                            <div className="flex items-center min-w-0">
                                                <div className="flex-shrink-0 h-8 w-8 sm:h-10 sm:w-10">
                                                    <UserCircle className="h-8 w-8 sm:h-10 sm:w-10 text-neutral-400" />
                                                </div>
                                                <div className="ml-2 sm:ml-4 min-w-0">
                                                    <div className="text-sm font-medium text-neutral-900 truncate">{u.email}</div>
                                                    {isCurrentUser(u) && (
                                                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-neutral-100 text-neutral-800">You</span>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-3 py-3 whitespace-nowrap sm:px-6 sm:py-4">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${u.role === 'ADMIN' ? 'bg-purple-100 text-purple-800' : 'bg-green-100 text-green-800'
                                                }`}>
                                                {u.role === 'ADMIN' ? 'Administrator' : 'Data Expert'}
                                            </span>
                                        </td>
                                        <td className="px-3 py-3 whitespace-nowrap sm:px-6 sm:py-4">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-medium rounded-full ${u.is_active !== false ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                                {u.is_active !== false ? 'Active' : 'Disabled'}
                                            </span>
                                        </td>
                                        <td className="px-3 py-3 whitespace-nowrap text-sm text-neutral-500 sm:px-6 sm:py-4">
                                            {new Date(u.date_joined).toLocaleDateString()}
                                        </td>
                                        <td className="px-3 py-3 whitespace-nowrap sm:px-6 sm:py-4">
                                            <div className="flex items-center justify-end gap-1 sm:gap-2">
                                                <button
                                                    onClick={() => openEditModal(u)}
                                                    className="p-2 text-neutral-500 hover:text-primary-600 hover:bg-primary-50 rounded-md transition-colors"
                                                    title="Edit"
                                                >
                                                    <Pencil className="h-4 w-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleToggleActive(u)}
                                                    disabled={isCurrentUser(u)}
                                                    title={u.is_active !== false ? 'Disable' : 'Enable'}
                                                    className={`p-2 rounded-md transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${u.is_active !== false
                                                        ? 'text-neutral-500 hover:text-amber-600 hover:bg-amber-50'
                                                        : 'text-neutral-500 hover:text-green-600 hover:bg-green-50'
                                                        }`}
                                                >
                                                    {u.is_active !== false ? <UserX className="h-4 w-4" /> : <UserCheck className="h-4 w-4" />}
                                                </button>
                                                <button
                                                    onClick={() => setDeleteTarget(u)}
                                                    disabled={isCurrentUser(u)}
                                                    className="p-2 text-neutral-500 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
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
                                        <td colSpan="5" className="px-3 py-4 text-center text-neutral-500 text-sm sm:px-6">No users found.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {showModal && (
                <div className="fixed z-10 inset-0 overflow-y-auto p-4 sm:p-0">
                    <div className="flex min-h-full sm:min-h-screen items-center justify-center">
                        <div className="fixed inset-0 transition-opacity" onClick={() => setShowModal(false)}>
                            <div className="absolute inset-0 bg-neutral-500 opacity-75"></div>
                        </div>
                        <div className="relative bg-white rounded-lg text-left overflow-hidden shadow-xl w-full max-w-lg max-h-[90vh] sm:max-h-[85vh] flex flex-col">
                            <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4 overflow-y-auto">
                                <h3 className="text-base sm:text-lg leading-6 font-medium text-neutral-900 flex justify-between items-center mb-4">
                                    Add New User
                                    <button onClick={() => setShowModal(false)} className="p-1 text-neutral-400 hover:text-neutral-500 rounded" aria-label="Close"><X className="h-5 w-5" /></button>
                                </h3>
                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-neutral-700">Email address</label>
                                        <input type="email" required name="email" value={formData.email} onChange={handleChange} className="mt-1 block w-full border-neutral-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm py-2 px-3 border" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-neutral-700">Password</label>
                                        <input type="password" required name="password" autoComplete="new-password" value={formData.password} onChange={handleChange} className="mt-1 block w-full border-neutral-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm py-2 px-3 border" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-neutral-700">Role</label>
                                        <select name="role" value={formData.role} onChange={handleChange} className="mt-1 block w-full border-neutral-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm py-2 px-3 border">
                                            <option value="DATA_EXPERT">Data Entry Expert</option>
                                            <option value="ADMIN">Administrator</option>
                                        </select>
                                    </div>
                                    <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end sm:pt-4">
                                        <button type="button" onClick={() => setShowModal(false)} className="w-full sm:w-auto bg-white py-2 px-4 border border-neutral-300 rounded-md shadow-sm text-sm font-medium text-neutral-700 hover:bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500">
                                            Cancel
                                        </button>
                                        <button type="submit" className="w-full sm:w-auto inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500">
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
                        <div className="fixed inset-0 transition-opacity" onClick={() => setEditUser(null)}>
                            <div className="absolute inset-0 bg-neutral-500 opacity-75"></div>
                        </div>
                        <div className="relative bg-white rounded-lg text-left overflow-hidden shadow-xl w-full max-w-lg max-h-[90vh] sm:max-h-[85vh] flex flex-col">
                            <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4 overflow-y-auto">
                                <h3 className="text-base sm:text-lg leading-6 font-medium text-neutral-900 flex justify-between items-center mb-4">
                                    Edit User
                                    <button onClick={() => setEditUser(null)} className="p-1 text-neutral-400 hover:text-neutral-500 rounded" aria-label="Close"><X className="h-5 w-5" /></button>
                                </h3>
                                <form onSubmit={handleEditSubmit} className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-neutral-700">Email address</label>
                                        <input type="email" required name="email" value={editFormData.email} onChange={handleEditChange} className="mt-1 block w-full border-neutral-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm py-2 px-3 border" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-neutral-700">Role</label>
                                        <select name="role" value={editFormData.role} onChange={handleEditChange} className="mt-1 block w-full border-neutral-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm py-2 px-3 border">
                                            <option value="DATA_EXPERT">Data Entry Expert</option>
                                            <option value="ADMIN">Administrator</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="flex items-center gap-2">
                                            <input type="checkbox" name="is_active" checked={editFormData.is_active} onChange={handleEditChange} className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-neutral-300 rounded" />
                                            <span className="text-sm font-medium text-neutral-700">Active (user can log in)</span>
                                        </label>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-neutral-700">New password (optional)</label>
                                        <input type="password" name="password" autoComplete="new-password" value={editFormData.password} onChange={handleEditChange} placeholder="Leave blank to keep current" className="mt-1 block w-full border-neutral-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm py-2 px-3 border" minLength={8} />
                                    </div>
                                    <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end sm:pt-4">
                                        <button type="button" onClick={() => setEditUser(null)} className="w-full sm:w-auto bg-white py-2 px-4 border border-neutral-300 rounded-md shadow-sm text-sm font-medium text-neutral-700 hover:bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500">
                                            Cancel
                                        </button>
                                        <button type="submit" className="w-full sm:w-auto inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500">
                                            Save Changes
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
                        <div className="fixed inset-0 transition-opacity" onClick={() => setDeleteTarget(null)}>
                            <div className="absolute inset-0 bg-neutral-500 opacity-75"></div>
                        </div>
                        <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full p-6">
                            <h3 className="text-lg font-medium text-neutral-900 mb-2">Delete User</h3>
                            <p className="text-sm text-neutral-600 mb-6">
                                Are you sure you want to delete <strong>{deleteTarget.email}</strong>? This action cannot be undone.
                            </p>
                            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                                <button type="button" onClick={() => setDeleteTarget(null)} className="w-full sm:w-auto bg-white py-2 px-4 border border-neutral-300 rounded-md shadow-sm text-sm font-medium text-neutral-700 hover:bg-neutral-50">
                                    Cancel
                                </button>
                                <button type="button" onClick={handleDeleteConfirm} className="w-full sm:w-auto inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700">
                                    Delete
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
export default Users;
