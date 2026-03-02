import React, { useState, useEffect } from 'react';
import { getClients, createClient, getMentorMothers } from '../../services/recordService';
import { X } from 'lucide-react';

const OTHER_MENTOR = '__other__';

const ClientRegistrations = ({ openModalRef }) => {
    const [clients, setClients] = useState([]);
    const [mentorMotherNames, setMentorMotherNames] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({
        mentor_mother_name: '',
        date: new Date().toISOString().split('T')[0],
        total_green_cases: '',
        total_blue_cases: '',
        name: '',
        age: '',
        sex: 'F',
        folder_number: '',
        address: '',
        weight: '',
        muac: '',
        identified_problem: '',
        counseling_given: '',
        demonstration_shown: '',
        anything_additional: '',
        problem_faced_by_mm: ''
    });

    const fetchClients = async () => {
        try {
            const res = await getClients();
            setClients(res.data.results || res.data);
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
        fetchClients();
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
            const payload = {
                ...formData,
                total_green_cases: Number(formData.total_green_cases) || 0,
                total_blue_cases: Number(formData.total_blue_cases) || 0
            };
            await createClient(payload);
            setShowModal(false);
            fetchClients();
        } catch (err) {
            console.error('Error creating client', err);
            alert('Failed to save record.');
        }
    };

    return (
        <div>
            <h2 className="text-xl font-medium text-neutral-800 mb-4">Client Registrations</h2>

            <div className="bg-white shadow overflow-hidden sm:rounded-md">
                {loading ? (
                    <div className="p-4 text-center text-neutral-500">Loading...</div>
                ) : (
                    <div className="overflow-x-auto -mx-3 sm:mx-0" style={{ WebkitOverflowScrolling: 'touch' }}>
                        <table className="min-w-full divide-y divide-neutral-200">
                            <thead className="bg-neutral-50">
                                <tr>
                                    <th className="px-3 py-2 sm:px-6 sm:py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Date</th>
                                    <th className="px-3 py-2 sm:px-6 sm:py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Total Green</th>
                                    <th className="px-3 py-2 sm:px-6 sm:py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Total Blue</th>
                                    <th className="px-3 py-2 sm:px-6 sm:py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Name</th>
                                    <th className="px-3 py-2 sm:px-6 sm:py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Age/Sex</th>
                                    <th className="px-3 py-2 sm:px-6 sm:py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Folder</th>
                                    <th className="px-3 py-2 sm:px-6 sm:py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">MUAC</th>
                                    <th className="px-3 py-2 sm:px-6 sm:py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Mentor Mother</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-neutral-200">
                                {clients.map((client) => (
                                    <tr key={client.id} className="hover:bg-neutral-50">
                                        <td className="px-3 py-3 whitespace-nowrap text-sm text-neutral-900 sm:px-6 sm:py-4">{client.date}</td>
                                        <td className="px-3 py-3 whitespace-nowrap text-sm text-neutral-500 sm:px-6 sm:py-4">{client.total_green_cases ?? '-'}</td>
                                        <td className="px-3 py-3 whitespace-nowrap text-sm text-neutral-500 sm:px-6 sm:py-4">{client.total_blue_cases ?? '-'}</td>
                                        <td className="px-3 py-3 whitespace-nowrap text-sm font-medium text-primary-600 sm:px-6 sm:py-4">{client.name}</td>
                                        <td className="px-3 py-3 whitespace-nowrap text-sm text-neutral-500 sm:px-6 sm:py-4">{client.age} / {client.sex}</td>
                                        <td className="px-3 py-3 whitespace-nowrap text-sm text-neutral-500 sm:px-6 sm:py-4">{client.folder_number || '-'}</td>
                                        <td className="px-3 py-3 whitespace-nowrap text-sm text-neutral-500 sm:px-6 sm:py-4">{client.muac || '-'}</td>
                                        <td className="px-3 py-3 whitespace-nowrap text-sm text-neutral-500 sm:px-6 sm:py-4">{client.mentor_mother_name}</td>
                                    </tr>
                                ))}
                                {clients.length === 0 && (
                                    <tr>
                                        <td colSpan="8" className="px-3 py-4 text-sm text-neutral-500 text-center sm:px-6">No registrations found.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed z-10 inset-0 overflow-y-auto">
                    <div className="flex min-h-screen items-center justify-center p-4 text-center sm:p-0">
                        <div className="fixed inset-0 transition-opacity" onClick={() => setShowModal(false)}>
                            <div className="absolute inset-0 bg-neutral-500 opacity-75"></div>
                        </div>

                        <div className="relative bg-white rounded-lg text-left overflow-hidden shadow-xl w-full max-h-[90vh] flex flex-col sm:my-8 sm:max-w-3xl sm:max-h-[85vh]">
                            <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4 overflow-y-auto flex-1 min-h-0">
                                <div className="sm:flex sm:items-start w-full">
                                    <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
                                        <h3 className="text-base sm:text-lg leading-6 font-medium text-neutral-900 flex justify-between items-start gap-2">
                                            <span className="min-w-0">Add New Client Registration</span>
                                            <button onClick={() => setShowModal(false)} className="flex-shrink-0 p-1 text-neutral-400 hover:text-neutral-500 rounded" aria-label="Close"><X className="h-5 w-5" /></button>
                                        </h3>

                                        <form onSubmit={handleSubmit} className="mt-4 sm:mt-6 grid grid-cols-1 gap-y-4 sm:gap-y-6 gap-x-4 sm:grid-cols-2">
                                            <div>
                                                <label className="block text-sm font-medium text-neutral-700">Mentor Mother Name</label>
                                                <select name="mentor_mother_select" value={mentorSelectValue} onChange={handleChange} className="mt-1 block w-full border-neutral-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm py-2 px-3 border">
                                                    <option value="">— Select or type below —</option>
                                                    {mentorMotherNames.map((n) => <option key={n} value={n}>{n}</option>)}
                                                    <option value={OTHER_MENTOR}>Other (type below)</option>
                                                </select>
                                                {(mentorSelectValue === OTHER_MENTOR || (formData.mentor_mother_name && !mentorMotherNames.includes(formData.mentor_mother_name))) && (
                                                    <input type="text" name="mentor_mother_name" value={formData.mentor_mother_name} onChange={handleChange} placeholder="Enter mentor mother name" className="mt-2 block w-full border-neutral-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm py-2 px-3 border" />
                                                )}
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-neutral-700">Date</label>
                                                <input type="date" required name="date" value={formData.date} onChange={handleChange} className="mt-1 block w-full border-neutral-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm py-2 px-3 border" />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-neutral-700">Total case: Green (Mother)</label>
                                                <input type="number" min="0" name="total_green_cases" value={formData.total_green_cases} onChange={handleChange} className="mt-1 block w-full border-neutral-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm py-2 px-3 border" placeholder="0" />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-neutral-700">Total case: Blue (Children)</label>
                                                <input type="number" min="0" name="total_blue_cases" value={formData.total_blue_cases} onChange={handleChange} className="mt-1 block w-full border-neutral-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm py-2 px-3 border" placeholder="0" />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-neutral-700">Client Name</label>
                                                <input type="text" required name="name" value={formData.name} onChange={handleChange} className="mt-1 block w-full border-neutral-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm py-2 px-3 border" />
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-sm font-medium text-neutral-700">Age</label>
                                                    <input type="number" required name="age" value={formData.age} onChange={handleChange} className="mt-1 block w-full border-neutral-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm py-2 px-3 border" />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-neutral-700">Sex</label>
                                                    <select name="sex" value={formData.sex} onChange={handleChange} className="mt-1 block w-full border-neutral-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm py-2 px-3 border">
                                                        <option value="F">Female</option>
                                                        <option value="M">Male</option>
                                                    </select>
                                                </div>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-neutral-700">Folder Number</label>
                                                <input type="text" name="folder_number" value={formData.folder_number} onChange={handleChange} className="mt-1 block w-full border-neutral-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm py-2 px-3 border" />
                                            </div>
                                            <div className="sm:col-span-2">
                                                <label className="block text-sm font-medium text-neutral-700">Address</label>
                                                <input type="text" required name="address" value={formData.address} onChange={handleChange} className="mt-1 block w-full border-neutral-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm py-2 px-3 border" />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-neutral-700">Weight (kg)</label>
                                                <input type="number" step="0.01" name="weight" value={formData.weight} onChange={handleChange} className="mt-1 block w-full border-neutral-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm py-2 px-3 border" />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-neutral-700">MUAC (cm)</label>
                                                <input type="number" step="0.01" name="muac" value={formData.muac} onChange={handleChange} className="mt-1 block w-full border-neutral-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm py-2 px-3 border" />
                                            </div>
                                            <div className="sm:col-span-2">
                                                <label className="block text-sm font-medium text-neutral-700">Identified Problem</label>
                                                <textarea required name="identified_problem" value={formData.identified_problem} onChange={handleChange} rows="2" className="mt-1 block w-full border border-neutral-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm py-2 px-3"></textarea>
                                            </div>
                                            <div className="sm:col-span-2">
                                                <label className="block text-sm font-medium text-neutral-700">Counseling Given</label>
                                                <textarea required name="counseling_given" value={formData.counseling_given} onChange={handleChange} rows="2" className="mt-1 block w-full border border-neutral-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm py-2 px-3"></textarea>
                                            </div>
                                            <div className="sm:col-span-2">
                                                <label className="block text-sm font-medium text-neutral-700">Demonstration shown by MM</label>
                                                <textarea name="demonstration_shown" value={formData.demonstration_shown} onChange={handleChange} rows="2" className="mt-1 block w-full border border-neutral-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm py-2 px-3"></textarea>
                                            </div>
                                            <div className="sm:col-span-2">
                                                <label className="block text-sm font-medium text-neutral-700">Anything additional</label>
                                                <textarea name="anything_additional" value={formData.anything_additional} onChange={handleChange} rows="2" className="mt-1 block w-full border border-neutral-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm py-2 px-3"></textarea>
                                            </div>
                                            <div className="sm:col-span-2">
                                                <label className="block text-sm font-medium text-neutral-700">Problem faced by MMs</label>
                                                <textarea name="problem_faced_by_mm" value={formData.problem_faced_by_mm} onChange={handleChange} rows="2" className="mt-1 block w-full border border-neutral-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm py-2 px-3"></textarea>
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
                    </div>
                </div>
            )}
        </div>
    );
};
export default ClientRegistrations;
