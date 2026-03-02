import React, { useState, useEffect } from 'react';
import { getPlans, createPlan, getMentorMothers } from '../../services/recordService';
import { X } from 'lucide-react';

const OTHER_MENTOR = '__other__';

const WeeklyPlans = ({ openModalRef }) => {
    const [plans, setPlans] = useState([]);
    const [mentorMotherNames, setMentorMotherNames] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
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

    const fetchPlans = async () => {
        try {
            const res = await getPlans();
            setPlans(res.data.results || res.data);
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
        if (openModalRef) openModalRef.current = () => setShowModal(true);
        return () => { if (openModalRef) openModalRef.current = null; };
    }, [openModalRef]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name === 'mentor_mother_select') {
            setFormData(prev => ({ ...prev, mentor_mother_name: value === OTHER_MENTOR ? '' : value }));
            return;
        }
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const mentorSelectValue = mentorMotherNames.includes(formData.mentor_mother_name) ? formData.mentor_mother_name : (formData.mentor_mother_name ? OTHER_MENTOR : '');

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!(formData.mentor_mother_name || '').trim()) {
            alert('Please select or enter Mentor Mother name.');
            return;
        }
        try {
            await createPlan({ ...formData, mentor_mother_name: formData.mentor_mother_name.trim() });
            setShowModal(false);
            fetchPlans();
        } catch (err) {
            console.error('Error creating plan', err);
            alert('Failed to save record.');
        }
    };

    return (
        <div className="min-w-0">
            <h2 className="text-lg font-medium text-neutral-800 sm:text-xl mb-4">Weekly Plans (Karoora Guyyaa Fi Torbanii)</h2>

            <div className="bg-white shadow overflow-hidden sm:rounded-md">
                {loading ? (
                    <div className="p-4 text-center text-neutral-500">Loading...</div>
                ) : (
                    <div className="overflow-x-auto -mx-3 sm:mx-0" style={{ WebkitOverflowScrolling: 'touch' }}>
                        <table className="min-w-full divide-y divide-neutral-200">
                            <thead className="bg-neutral-50">
                                <tr>
                                    <th className="px-3 py-2 sm:px-6 sm:py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Date / Day</th>
                                    <th className="px-3 py-2 sm:px-6 sm:py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Client Name</th>
                                    <th className="px-3 py-2 sm:px-6 sm:py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">District</th>
                                    <th className="px-3 py-2 sm:px-6 sm:py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Objective</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-neutral-200">
                                {plans.map((plan) => (
                                    <tr key={plan.id} className="hover:bg-neutral-50">
                                        <td className="px-3 py-3 text-sm text-neutral-900 sm:px-6 sm:py-4">{plan.date} ({plan.day_of_week})</td>
                                        <td className="px-3 py-3 text-sm font-medium text-primary-600 sm:px-6 sm:py-4">{plan.client_name}</td>
                                        <td className="px-3 py-3 text-sm text-neutral-500 sm:px-6 sm:py-4">{plan.district}</td>
                                        <td className="px-3 py-3 text-sm text-neutral-500 truncate max-w-[150px] sm:max-w-xs sm:px-6 sm:py-4">{plan.objective}</td>
                                    </tr>
                                ))}
                                {plans.length === 0 && (
                                    <tr>
                                        <td colSpan="4" className="px-3 py-4 text-sm text-neutral-500 text-center sm:px-6">No plans found.</td>
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
                        <div className="relative bg-white rounded-lg text-left overflow-hidden shadow-xl w-full max-w-xl max-h-[90vh] sm:max-h-[85vh] flex flex-col">
                            <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4 overflow-y-auto flex-1 min-h-0">
                                <h3 className="text-base sm:text-lg leading-6 font-medium text-neutral-900 flex justify-between items-center gap-2 mb-4">
                                    <span className="min-w-0">Add Weekly Plan Context</span>
                                    <button onClick={() => setShowModal(false)} className="flex-shrink-0 p-1 text-neutral-400 hover:text-neutral-500 rounded" aria-label="Close"><X className="h-5 w-5" /></button>
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
                                        <button type="button" onClick={() => setShowModal(false)} className="w-full sm:w-auto mb-3 sm:mb-0 inline-flex justify-center rounded-md border border-neutral-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-neutral-700 hover:bg-neutral-50 sm:text-sm">
                                            Cancel
                                        </button>
                                        <button type="submit" className="w-full sm:w-auto inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary-600 text-base font-medium text-white hover:bg-primary-700 sm:text-sm">
                                            Save Record
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
export default WeeklyPlans;
