import React, { useState, useEffect, useMemo } from 'react';
import { getAllPlans, createPlan, updatePlan, deletePlan, getMentorMothers } from '../../services/recordService';
import { X, Eye, Pencil, Trash2, Plus } from 'lucide-react';
import Pagination from '../../components/common/Pagination';

const OTHER_MENTOR = '__other__';

const WeeklyPlans = ({ openModalRef }) => {
    const [plans, setPlans] = useState([]);
    const [mentorMotherNames, setMentorMotherNames] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [viewPlan, setViewPlan] = useState(null);
    const [editingPlan, setEditingPlan] = useState(null);
    const [formData, setFormData] = useState({
        mentor_mother_name: '',
        date: new Date().toISOString().split('T')[0],
        district: '',
        day_of_week: 'Wixata', // Monday
        client_name: '',
        content: '',
        objective: '',
        observation: ''
    });
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(25);

    const fetchPlans = async () => {
        try {
            const res = await getAllPlans();
            setPlans(Array.isArray(res.data) ? res.data : []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const fetchMentorMothers = async () => {
        try {
            const res = await getMentorMothers();
            setMentorMotherNames(res.data.names || []);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        fetchPlans();
    }, []);

    useEffect(() => {
        if (showModal) fetchMentorMothers();
    }, [showModal]);

    useEffect(() => {
        if (openModalRef) openModalRef.current = () => { setEditingPlan(null); setShowModal(true); };
        return () => { if (openModalRef) openModalRef.current = null; };
    }, [openModalRef]);

    const openEdit = (plan) => {
        setViewPlan(null);
        setEditingPlan(plan);
        setFormData({
            mentor_mother_name: plan.mentor_mother_name ?? '',
            date: plan.date ?? new Date().toISOString().split('T')[0],
            district: plan.district ?? '',
            day_of_week: plan.day_of_week ?? 'Wixata',
            client_name: plan.client_name ?? '',
            content: plan.content ?? '',
            objective: plan.objective ?? '',
            observation: plan.observation ?? '',
        });
        setShowModal(true);
    };

    const handleDelete = async (plan) => {
        if (!window.confirm(`Delete weekly plan for ${plan.client_name} (${plan.day_of_week})?`)) return;
        try {
            await deletePlan(plan.id);
            setViewPlan(null);
            setEditingPlan(null);
            fetchPlans();
        } catch (err) {
            console.error('Error deleting plan', err);
            alert('Failed to delete record.');
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name === 'mentor_mother_select') {
            setFormData(prev => ({ ...prev, mentor_mother_name: value === OTHER_MENTOR ? '' : value }));
            return;
        }
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const mentorSelectValue = mentorMotherNames.includes(formData.mentor_mother_name) ? formData.mentor_mother_name : (formData.mentor_mother_name ? OTHER_MENTOR : '');

    // Pagination
    const paginatedPlans = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        return plans.slice(startIndex, endIndex);
    }, [plans, currentPage, itemsPerPage]);

    const totalPages = Math.ceil(plans.length / itemsPerPage);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!(formData.mentor_mother_name || '').trim()) {
            alert('Please select or enter Mentor Mother name.');
            return;
        }
        try {
            const payload = { ...formData, mentor_mother_name: formData.mentor_mother_name.trim() };
            if (editingPlan) {
                await updatePlan(editingPlan.id, payload);
                setEditingPlan(null);
            } else {
                await createPlan(payload);
            }
            setShowModal(false);
            fetchPlans();
        } catch (err) {
            console.error('Error creating plan', err);
            alert('Failed to save record.');
        }
    };

    return (
        <div className="min-w-0">
            <div className="flex flex-col gap-4 mb-6 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0 flex-1">
                    <h2 className="text-lg font-medium text-neutral-800 sm:text-xl mb-1">Maternal and Child Health Project (MCHP)</h2>
                    <p className="text-sm text-neutral-700 mb-4">Karoora Guyyaa Fi Torbanii / ዕለታዊ እና ሳምንታዊ ዕቅድ</p>
                </div>
                <div className="flex-shrink-0">
                    <button
                        type="button"
                        onClick={() => { setEditingPlan(null); setShowModal(true); }}
                        className="w-full sm:w-auto inline-flex items-center justify-center rounded-md border border-transparent bg-primary-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                    >
                        <Plus className="-ml-0.5 mr-2 h-4 w-4 flex-shrink-0" />
                        Add Weekly Plan
                    </button>
                </div>
            </div>

            <div className="bg-white shadow overflow-hidden sm:rounded-md">
                {loading ? (
                    <div className="p-4 text-center text-neutral-500">Loading...</div>
                ) : (
                    <div className="overflow-x-auto -mx-3 sm:mx-0" style={{ WebkitOverflowScrolling: 'touch' }}>
                        <table className="min-w-full divide-y divide-neutral-200">
                            <thead className="bg-neutral-50">
                                <tr>
                                    <th className="px-3 py-2 sm:px-4 sm:py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Date</th>
                                    <th className="px-3 py-2 sm:px-4 sm:py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Day</th>
                                    <th className="px-3 py-2 sm:px-4 sm:py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Client Name</th>
                                    <th className="px-3 py-2 sm:px-4 sm:py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Added by</th>
                                    <th className="px-3 py-2 sm:px-4 sm:py-3 text-right text-xs font-medium text-neutral-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-neutral-200">
                                {paginatedPlans.map((plan) => (
                                    <tr key={plan.id} className="hover:bg-neutral-50">
                                        <td className="px-3 py-3 text-sm text-neutral-900 sm:px-4 sm:py-3 whitespace-nowrap">{plan.date}</td>
                                        <td className="px-3 py-3 text-sm text-neutral-900 sm:px-4 sm:py-3 whitespace-nowrap">{plan.day_of_week}</td>
                                        <td className="px-3 py-3 text-sm font-medium text-primary-600 sm:px-4 sm:py-3">{plan.client_name}</td>
                                        <td className="px-3 py-3 text-sm text-neutral-500 sm:px-4 sm:py-3 whitespace-nowrap">{plan.created_by_email ?? '-'}</td>
                                        <td className="px-3 py-3 text-sm sm:px-4 sm:py-3 whitespace-nowrap text-right">
                                            <div className="flex items-center justify-end gap-1">
                                                <button type="button" onClick={() => setViewPlan(plan)} className="p-1.5 text-neutral-500 hover:text-primary-600 rounded" title="View"><Eye className="h-4 w-4" /></button>
                                                <button type="button" onClick={() => openEdit(plan)} className="p-1.5 text-neutral-500 hover:text-primary-600 rounded" title="Edit"><Pencil className="h-4 w-4" /></button>
                                                <button type="button" onClick={() => handleDelete(plan)} className="p-1.5 text-neutral-500 hover:text-red-600 rounded" title="Delete"><Trash2 className="h-4 w-4" /></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {plans.length === 0 && (
                                    <tr>
                                        <td colSpan="5" className="px-3 py-4 text-sm text-neutral-500 text-center sm:px-4">
                                            No plans found.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* View detail modal */}
            {viewPlan && (
                <div className="fixed z-20 inset-0 overflow-y-auto p-4 sm:p-0">
                    <div className="flex min-h-full items-center justify-center">
                        <div className="fixed inset-0 bg-neutral-500 opacity-75" onClick={() => setViewPlan(null)} />
                        <div className="relative bg-white rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] flex flex-col">
                            <div className="px-4 pt-5 pb-2 border-b border-neutral-200 flex justify-between items-center">
                                <h3 className="text-lg font-medium text-neutral-900">Weekly Plan – Full Detail</h3>
                                <button onClick={() => setViewPlan(null)} className="p-1 text-neutral-400 hover:text-neutral-600 rounded" aria-label="Close"><X className="h-5 w-5" /></button>
                            </div>
                            <div className="px-4 py-4 overflow-y-auto space-y-3 text-sm">
                                {[
                                    ['Mentor Mother', viewPlan.mentor_mother_name],
                                    ['Date', viewPlan.date],
                                    ['District (Gooxii)', viewPlan.district],
                                    ['Day of Week', viewPlan.day_of_week],
                                    ['Client Name (Maqaa mamilaa)', viewPlan.client_name],
                                    ['Content (Qabiyyee)', viewPlan.content],
                                    ['Objective (Kayyoo)', viewPlan.objective],
                                    ['Observation (Yaada)', viewPlan.observation],
                                    ['Added by', viewPlan.created_by_email],
                                ].map(([label, val]) => (
                                    <div key={label}>
                                        <span className="font-medium text-neutral-700">{label}:</span>
                                        <div className="mt-0.5 text-neutral-900 whitespace-pre-wrap">{val ?? '-'}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {showModal && (
                <div className="fixed z-10 inset-0 overflow-y-auto p-4 sm:p-0">
                    <div className="flex min-h-full sm:min-h-screen items-center justify-center">
                        <div className="fixed inset-0 transition-opacity" onClick={() => { setShowModal(false); setEditingPlan(null); }}>
                            <div className="absolute inset-0 bg-neutral-500 opacity-75"></div>
                        </div>
                        <div className="relative bg-white rounded-lg text-left overflow-hidden shadow-xl w-full max-w-xl max-h-[90vh] sm:max-h-[85vh] flex flex-col">
                            <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4 overflow-y-auto flex-1 min-h-0">
                                <h3 className="text-base sm:text-lg leading-6 font-medium text-neutral-900 flex justify-between items-center gap-2 mb-4">
                                    <span className="min-w-0">{editingPlan ? 'Edit Weekly Plan' : 'Add Weekly Plan Context'}</span>
                                    <button onClick={() => { setShowModal(false); setEditingPlan(null); }} className="flex-shrink-0 p-1 text-neutral-400 hover:text-neutral-500 rounded" aria-label="Close"><X className="h-5 w-5" /></button>
                                </h3>
                                <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-y-4 sm:grid-cols-2 sm:gap-x-4">
                                    <div>
                                        <label className="block text-sm font-medium text-neutral-700">Mentor Mother Name</label>
                                        <select name="mentor_mother_select" value={mentorSelectValue} onChange={handleChange} className="mt-1 block w-full border-neutral-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm py-2 border">
                                            <option value="">— Select or type below —</option>
                                            {mentorMotherNames.map((n) => <option key={n} value={n}>{n}</option>)}
                                            <option value={OTHER_MENTOR}>Other (type below)</option>
                                        </select>
                                        {(mentorSelectValue === OTHER_MENTOR || (formData.mentor_mother_name && !mentorMotherNames.includes(formData.mentor_mother_name))) && (
                                            <input type="text" name="mentor_mother_name" value={formData.mentor_mother_name} onChange={handleChange} placeholder="Enter mentor mother name" className="mt-2 block w-full border-neutral-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm py-2 border" />
                                        )}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-neutral-700">District (Gooxii)</label>
                                        <input type="text" required name="district" value={formData.district} onChange={handleChange} className="mt-1 block w-full border-neutral-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm py-2 border" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-neutral-700">Date</label>
                                        <input type="date" required name="date" value={formData.date} onChange={handleChange} className="mt-1 block w-full border-neutral-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm py-2 border" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-neutral-700">Day of Week</label>
                                        <select name="day_of_week" value={formData.day_of_week} onChange={handleChange} className="mt-1 block w-full border-neutral-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm py-2 border">
                                            <option value="Wixata">Wixata (Monday)</option>
                                            <option value="Kibxata">Kibxata (Tuesday)</option>
                                            <option value="Roobi">Roobi (Wednesday)</option>
                                            <option value="Kamisa">Kamisa (Thursday)</option>
                                            <option value="Jimaata">Jimaata (Friday)</option>
                                        </select>
                                    </div>
                                    <div className="sm:col-span-2">
                                        <label className="block text-sm font-medium text-neutral-700">Client Name</label>
                                        <input type="text" required name="client_name" value={formData.client_name} onChange={handleChange} className="mt-1 block w-full border-neutral-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm py-2 border" />
                                    </div>
                                    <div className="sm:col-span-2">
                                        <label className="block text-sm font-medium text-neutral-700">Content (Qabiyyee)</label>
                                        <textarea required name="content" value={formData.content} onChange={handleChange} rows="2" className="mt-1 block w-full border border-neutral-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm py-2 px-3"></textarea>
                                    </div>
                                    <div className="sm:col-span-2">
                                        <label className="block text-sm font-medium text-neutral-700">Objective (Kayyoo)</label>
                                        <textarea required name="objective" value={formData.objective} onChange={handleChange} rows="2" className="mt-1 block w-full border border-neutral-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm py-2 px-3"></textarea>
                                    </div>
                                    <div className="sm:col-span-2">
                                        <label className="block text-sm font-medium text-neutral-700">Observation (Yaada)</label>
                                        <textarea required name="observation" value={formData.observation} onChange={handleChange} rows="2" className="mt-1 block w-full border border-neutral-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm py-2 px-3"></textarea>
                                    </div>
                                    <div className="sm:col-span-2 flex flex-col sm:flex-row justify-end mt-4 sm:space-x-3">
                                        <button type="button" onClick={() => { setShowModal(false); setEditingPlan(null); }} className="w-full sm:w-auto mb-3 sm:mb-0 inline-flex justify-center rounded-md border border-neutral-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-neutral-700 hover:bg-neutral-50 sm:text-sm">
                                            Cancel
                                        </button>
                                        <button type="submit" className="w-full sm:w-auto inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary-600 text-base font-medium text-white hover:bg-primary-700 sm:text-sm">
                                            {editingPlan ? 'Update Record' : 'Save Record'}
                                        </button>
                                    </div>
                                </form>
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
                totalItems={plans.length}
                onItemsPerPageChange={setItemsPerPage}
            />
        </div>
    );
};
export default WeeklyPlans;
