import React, { useState, useEffect } from 'react';
import { getAllClients, createClient, updateClient, deleteClient, getMentorMothers } from '../../services/recordService';
import { X, Eye, Pencil, Trash2 } from 'lucide-react';

const OTHER_MENTOR = '__other__';

const getInitialFormData = () => ({
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
    problem_faced_by_mm: '',
    spss_start_date: '', spss_first_name: '', spss_last_name: '', spss_marital_status_code: '', spss_job: '', spss_payment: '',
    spss_number_child_deaths: '', spss_number_children_sd: '', spss_medical_record: '', spss_pregnant_record: '', spss_lactate: '',
    spss_nutrition_status: '', spss_starting_month: '', spss_first_pv_date: '', spss_number_miscarriages: '', spss_immunization_count: '',
    spss_delivery_status: '', spss_delivery_date: '', spss_child_death_after: '', spss_breastfeeding_status: '', spss_rh_factor: '',
    spss_no_antenatal: '', spss_no_postnatal: '', spss_child_no_after: '', spss_second_preg_date: '', spss_second_pregnancy: '',
    spss_second_breastfeeding: '', spss_second_antenatal: '', spss_second_postnatal: '', spss_second_immunization: '',
    spss_second_delivery_date: '', spss_number_children_after: '',
});

const ClientRegistrations = ({ openModalRef }) => {
    const [clients, setClients] = useState([]);
    const [mentorMotherNames, setMentorMotherNames] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [viewClient, setViewClient] = useState(null);
    const [editingClient, setEditingClient] = useState(null);
    const [formData, setFormData] = useState(getInitialFormData);

    const fetchClients = async () => {
        try {
            const res = await getAllClients();
            setClients(Array.isArray(res.data) ? res.data : []);
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
        if (openModalRef) openModalRef.current = () => { setEditingClient(null); setFormData(getInitialFormData()); setShowModal(true); };
        return () => { if (openModalRef) openModalRef.current = null; };
    }, [openModalRef]);

    const openEdit = (client) => {
        setViewClient(null);
        setEditingClient(client);
        setFormData(clientToFormData(client));
        setShowModal(true);
    };

    const clientToFormData = (c) => ({
        mentor_mother_name: c.mentor_mother_name ?? '',
        date: c.date ?? new Date().toISOString().split('T')[0],
        total_green_cases: c.total_green_cases ?? '',
        total_blue_cases: c.total_blue_cases ?? '',
        name: c.name ?? '',
        age: c.age ?? '',
        sex: c.sex ?? 'F',
        folder_number: c.folder_number ?? '',
        address: c.address ?? '',
        weight: c.weight ?? '',
        muac: c.muac ?? '',
        identified_problem: c.identified_problem ?? '',
        counseling_given: c.counseling_given ?? '',
        demonstration_shown: c.demonstration_shown ?? '',
        anything_additional: c.anything_additional ?? '',
        problem_faced_by_mm: c.problem_faced_by_mm ?? '',
        spss_start_date: c.spss_start_date ?? '',
        spss_first_name: c.spss_first_name ?? '',
        spss_last_name: c.spss_last_name ?? '',
        spss_marital_status_code: c.spss_marital_status_code ?? '',
        spss_job: c.spss_job ?? '',
        spss_payment: c.spss_payment ?? '',
        spss_number_child_deaths: c.spss_number_child_deaths ?? '',
        spss_number_children_sd: c.spss_number_children_sd ?? '',
        spss_medical_record: c.spss_medical_record ?? '',
        spss_pregnant_record: c.spss_pregnant_record ?? '',
        spss_lactate: c.spss_lactate ?? '',
        spss_nutrition_status: c.spss_nutrition_status ?? '',
        spss_starting_month: c.spss_starting_month ?? '',
        spss_first_pv_date: c.spss_first_pv_date ?? '',
        spss_number_miscarriages: c.spss_number_miscarriages ?? '',
        spss_immunization_count: c.spss_immunization_count ?? '',
        spss_delivery_status: c.spss_delivery_status ?? '',
        spss_delivery_date: c.spss_delivery_date ?? '',
        spss_child_death_after: c.spss_child_death_after ?? '',
        spss_breastfeeding_status: c.spss_breastfeeding_status ?? '',
        spss_rh_factor: c.spss_rh_factor ?? '',
        spss_no_antenatal: c.spss_no_antenatal ?? '',
        spss_no_postnatal: c.spss_no_postnatal ?? '',
        spss_child_no_after: c.spss_child_no_after ?? '',
        spss_second_preg_date: c.spss_second_preg_date ?? '',
        spss_second_pregnancy: c.spss_second_pregnancy ?? '',
        spss_second_breastfeeding: c.spss_second_breastfeeding ?? '',
        spss_second_antenatal: c.spss_second_antenatal ?? '',
        spss_second_postnatal: c.spss_second_postnatal ?? '',
        spss_second_immunization: c.spss_second_immunization ?? '',
        spss_second_delivery_date: c.spss_second_delivery_date ?? '',
        spss_number_children_after: c.spss_number_children_after ?? '',
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!(formData.mentor_mother_name || '').trim()) {
            alert('Please select or enter Mentor Mother name.');
            return;
        }
        try {
            const numericFields = [
                'spss_marital_status_code',
                'spss_payment',
                'spss_number_child_deaths',
                'spss_number_children_sd',
                'spss_medical_record',
                'spss_pregnant_record',
                'spss_lactate',
                'spss_nutrition_status',
                'spss_number_miscarriages',
                'spss_immunization_count',
                'spss_delivery_status',
                'spss_child_death_after',
                'spss_breastfeeding_status',
                'spss_rh_factor',
                'spss_no_antenatal',
                'spss_no_postnatal',
                'spss_child_no_after',
                'spss_second_pregnancy',
                'spss_second_breastfeeding',
                'spss_second_antenatal',
                'spss_second_postnatal',
                'spss_second_immunization',
                'spss_number_children_after',
            ];

            const decimalFields = ['weight', 'muac'];

            const dateFields = [
                'spss_start_date',
                'spss_first_pv_date',
                'spss_delivery_date',
                'spss_second_preg_date',
                'spss_second_delivery_date',
            ];

            const payload = {
                ...formData,
                total_green_cases: Number(formData.total_green_cases) || 0,
                total_blue_cases: Number(formData.total_blue_cases) || 0,
            };

            numericFields.forEach((field) => {
                const value = formData[field];
                payload[field] = value === '' ? null : Number(value);
            });

            decimalFields.forEach((field) => {
                const value = formData[field];
                payload[field] = value === '' ? null : Number(value);
            });

            dateFields.forEach((field) => {
                const value = formData[field];
                payload[field] = value || null;
            });

            if (editingClient) {
                await updateClient(editingClient.id, payload);
                setEditingClient(null);
            } else {
                await createClient(payload);
            }
            setShowModal(false);
            fetchClients();
        } catch (err) {
            console.error('Error creating client', err);
            alert('Failed to save record.');
        }
    };

    const handleDelete = async (client) => {
        if (!window.confirm(`Delete registration for "${client.name}" (${client.date})?`)) return;
        try {
            await deleteClient(client.id);
            setViewClient(null);
            setEditingClient(null);
            fetchClients();
        } catch (err) {
            console.error('Error deleting client', err);
            alert('Failed to delete record.');
        }
    };

    const closeModal = () => {
        setShowModal(false);
        setViewClient(null);
        setEditingClient(null);
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
                                    <th className="px-3 py-2 sm:px-4 sm:py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Mentor Mother</th>
                                    <th className="px-3 py-2 sm:px-4 sm:py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Date</th>
                                    <th className="px-3 py-2 sm:px-4 sm:py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Client Name</th>
                                    <th className="px-3 py-2 sm:px-4 sm:py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Added by</th>
                                    <th className="px-3 py-2 sm:px-4 sm:py-3 text-right text-xs font-medium text-neutral-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-neutral-200">
                                {clients.map((client) => (
                                    <tr key={client.id} className="hover:bg-neutral-50">
                                        <td className="px-3 py-3 text-sm text-neutral-900 sm:px-4 sm:py-3 whitespace-nowrap">{client.mentor_mother_name}</td>
                                        <td className="px-3 py-3 text-sm text-neutral-900 sm:px-4 sm:py-3 whitespace-nowrap">{client.date}</td>
                                        <td className="px-3 py-3 text-sm font-medium text-primary-600 sm:px-4 sm:py-3 whitespace-nowrap">{client.name}</td>
                                        <td className="px-3 py-3 text-sm text-neutral-500 sm:px-4 sm:py-3 whitespace-nowrap">{client.created_by_email ?? '-'}</td>
                                        <td className="px-3 py-3 text-sm sm:px-4 sm:py-3 whitespace-nowrap text-right">
                                            <div className="flex items-center justify-end gap-1">
                                                <button type="button" onClick={(e) => { e.stopPropagation(); setViewClient(client); }} className="p-1.5 text-neutral-500 hover:text-primary-600 rounded" title="View"><Eye className="h-4 w-4" /></button>
                                                <button type="button" onClick={(e) => { e.stopPropagation(); openEdit(client); }} className="p-1.5 text-neutral-500 hover:text-primary-600 rounded" title="Edit"><Pencil className="h-4 w-4" /></button>
                                                <button type="button" onClick={(e) => { e.stopPropagation(); handleDelete(client); }} className="p-1.5 text-neutral-500 hover:text-red-600 rounded" title="Delete"><Trash2 className="h-4 w-4" /></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {clients.length === 0 && (
                                    <tr>
                                        <td colSpan="5" className="px-3 py-4 text-sm text-neutral-500 text-center sm:px-4">
                                            No registrations found.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* View detail modal – all form fields */}
            {viewClient && (() => {
                const allFields = [
                    ['Mentor Mother Name', viewClient.mentor_mother_name],
                    ['Date', viewClient.date],
                    ['Total case: Green (Mother)', viewClient.total_green_cases],
                    ['Total case: Blue (Children)', viewClient.total_blue_cases],
                    ['Client Name', viewClient.name],
                    ['Age', viewClient.age],
                    ['Sex', viewClient.sex],
                    ['Folder Number', viewClient.folder_number],
                    ['Address', viewClient.address],
                    ['Weight (kg)', viewClient.weight],
                    ['MUAC (cm)', viewClient.muac],
                    ['Identified problem', viewClient.identified_problem],
                    ['Counseling given', viewClient.counseling_given],
                    ['Demonstration shown by MM', viewClient.demonstration_shown],
                    ['Anything additional', viewClient.anything_additional],
                    ['Problem faced by MMs', viewClient.problem_faced_by_mm],
                    ['Added by', viewClient.created_by_email],
                    ['Started Date (SDate)', viewClient.spss_start_date],
                    ['First Name (FName)', viewClient.spss_first_name],
                    ['Last Name (LName)', viewClient.spss_last_name],
                    ['Marital Status (MStatus)', viewClient.spss_marital_status_code],
                    ['Client Job (Job)', viewClient.spss_job],
                    ['Client Payment (Payment)', viewClient.spss_payment],
                    ['Number of Child Deaths (NoCDeath)', viewClient.spss_number_child_deaths],
                    ['Number of Children (NoChildSD)', viewClient.spss_number_children_sd],
                    ['Medical Record (MRecord)', viewClient.spss_medical_record],
                    ['Pregnant Record (PLactate)', viewClient.spss_pregnant_record],
                    ['Lactate (Lactate)', viewClient.spss_lactate],
                    ['Nutritional Status (Nutrisional)', viewClient.spss_nutrition_status],
                    ['Starting Month (SPmonth)', viewClient.spss_starting_month],
                    ['First Pregnant Visit Date (FristPVDate)', viewClient.spss_first_pv_date],
                    ['Number of Miscarriage (NoMiscarri)', viewClient.spss_number_miscarriages],
                    ['Immunization (Imunization)', viewClient.spss_immunization_count],
                    ['Delivery Status (DeliveryS)', viewClient.spss_delivery_status],
                    ['Delivery Date (DeliveryD)', viewClient.spss_delivery_date],
                    ['Child Death After (CDeathAFN)', viewClient.spss_child_death_after],
                    ['Breastfeeding (BreastF)', viewClient.spss_breastfeeding_status],
                    ['RH Factor (RHFactor)', viewClient.spss_rh_factor],
                    ['No. Antenatal (NoAntenat)', viewClient.spss_no_antenatal],
                    ['No. Postnatal (NoPostnata)', viewClient.spss_no_postnatal],
                    ['Child No. After (ChildNOAF)', viewClient.spss_child_no_after],
                    ['Second Date Pregnant (SDatePreg)', viewClient.spss_second_preg_date],
                    ['Second Pregnancy (SPregnanc)', viewClient.spss_second_pregnancy],
                    ['Second Breastfeeding (SPBreastF)', viewClient.spss_second_breastfeeding],
                    ['Second Antenatal (SAntenatal)', viewClient.spss_second_antenatal],
                    ['Second Postnatal (SPostnatal)', viewClient.spss_second_postnatal],
                    ['Second Immunization (SpImunizati)', viewClient.spss_second_immunization],
                    ['Second Delivery Date (SPDeliveryD)', viewClient.spss_second_delivery_date],
                    ['No. Children After (Nochildefte)', viewClient.spss_number_children_after],
                ];
                return (
                    <div className="fixed z-20 inset-0 overflow-y-auto p-4 sm:p-0">
                        <div className="flex min-h-full items-center justify-center">
                            <div className="fixed inset-0 bg-neutral-500 opacity-75" onClick={() => setViewClient(null)} />
                            <div className="relative bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
                                <div className="px-4 pt-5 pb-2 border-b border-neutral-200 flex justify-between items-center">
                                    <h3 className="text-lg font-medium text-neutral-900">Client Registration – Full Detail</h3>
                                    <button onClick={() => setViewClient(null)} className="p-1 text-neutral-400 hover:text-neutral-600 rounded" aria-label="Close"><X className="h-5 w-5" /></button>
                                </div>
                                <div className="px-4 py-4 overflow-y-auto flex-1 space-y-3 text-sm">
                                    {allFields.map(([label, val]) => (
                                        <div key={label}>
                                            <span className="font-medium text-neutral-700">{label}:</span>{' '}
                                            <span className="text-neutral-900">{val != null && val !== '' ? String(val) : '-'}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                );
            })()}

            {/* Add/Edit Modal */}
            {showModal && (
                <div className="fixed z-10 inset-0 overflow-y-auto">
                    <div className="flex min-h-screen items-center justify-center p-4 text-center sm:p-0">
                        <div className="fixed inset-0 transition-opacity" onClick={closeModal}>
                            <div className="absolute inset-0 bg-neutral-500 opacity-75"></div>
                        </div>

                        <div className="relative bg-white rounded-lg text-left overflow-hidden shadow-xl w-full max-h-[90vh] flex flex-col sm:my-8 sm:max-w-3xl sm:max-h-[85vh]">
                            <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4 overflow-y-auto flex-1 min-h-0">
                                <div className="sm:flex sm:items-start w-full">
                                    <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
                                        <h3 className="text-base sm:text-lg leading-6 font-medium text-neutral-900 flex justify-between items-start gap-2">
                                            <span className="min-w-0">{editingClient ? 'Edit Client Registration' : 'Add New Client Registration'}</span>
                                            <button onClick={closeModal} className="flex-shrink-0 p-1 text-neutral-400 hover:text-neutral-500 rounded" aria-label="Close"><X className="h-5 w-5" /></button>
                                        </h3>

                                        <form onSubmit={handleSubmit} className="mt-4 sm:mt-6 grid grid-cols-1 gap-y-4 sm:gap-y-6 gap-x-4 sm:grid-cols-2">
                                            <div>
                                                <label className="block text-sm font-medium text-neutral-700">Mentor Mother Name</label>
                                                <input
                                                    type="text"
                                                    name="mentor_mother_name"
                                                    value={formData.mentor_mother_name}
                                                    onChange={handleChange}
                                                    placeholder="Enter mentor mother name"
                                                    className="mt-1 block w-full border-neutral-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm py-2 px-3 border"
                                                />
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
                                        <div className="sm:col-span-2 pt-2 border-t border-neutral-200">
                                            <h4 className="text-sm font-semibold text-neutral-800 mb-2">Additional SPSS Fields</h4>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-neutral-700">Started Date (SDate)</label>
                                            <input type="date" name="spss_start_date" value={formData.spss_start_date} onChange={handleChange} className="mt-1 block w-full border-neutral-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm py-2 px-3 border" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-neutral-700">First Name (FName)</label>
                                            <input type="text" name="spss_first_name" value={formData.spss_first_name} onChange={handleChange} className="mt-1 block w-full border-neutral-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm py-2 px-3 border" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-neutral-700">Last Name (LName)</label>
                                            <input type="text" name="spss_last_name" value={formData.spss_last_name} onChange={handleChange} className="mt-1 block w-full border-neutral-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm py-2 px-3 border" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-neutral-700">Marital Status (MStatus)</label>
                                            <input type="number" name="spss_marital_status_code" value={formData.spss_marital_status_code} onChange={handleChange} className="mt-1 block w-full border-neutral-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm py-2 px-3 border" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-neutral-700">Client Job (Job)</label>
                                            <input type="text" name="spss_job" value={formData.spss_job} onChange={handleChange} className="mt-1 block w-full border-neutral-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm py-2 px-3 border" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-neutral-700">Client Payment (Payment)</label>
                                            <input type="number" name="spss_payment" value={formData.spss_payment} onChange={handleChange} className="mt-1 block w-full border-neutral-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm py-2 px-3 border" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-neutral-700">Number of Child Deaths (NoCDeath)</label>
                                            <input type="number" name="spss_number_child_deaths" value={formData.spss_number_child_deaths} onChange={handleChange} className="mt-1 block w-full border-neutral-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm py-2 px-3 border" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-neutral-700">Number of Children (NoChildSD)</label>
                                            <input type="number" name="spss_number_children_sd" value={formData.spss_number_children_sd} onChange={handleChange} className="mt-1 block w-full border-neutral-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm py-2 px-3 border" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-neutral-700">Medical Record (MRecord)</label>
                                            <input type="number" name="spss_medical_record" value={formData.spss_medical_record} onChange={handleChange} className="mt-1 block w-full border-neutral-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm py-2 px-3 border" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-neutral-700">Pregnant Record (PLactate)</label>
                                            <input type="number" name="spss_pregnant_record" value={formData.spss_pregnant_record} onChange={handleChange} className="mt-1 block w-full border-neutral-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm py-2 px-3 border" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-neutral-700">Lactate (Lactate)</label>
                                            <input type="number" name="spss_lactate" value={formData.spss_lactate} onChange={handleChange} className="mt-1 block w-full border-neutral-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm py-2 px-3 border" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-neutral-700">Nutritional Status (Nutrisional)</label>
                                            <input type="number" name="spss_nutrition_status" value={formData.spss_nutrition_status} onChange={handleChange} className="mt-1 block w-full border-neutral-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm py-2 px-3 border" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-neutral-700">Starting Month (SPmonth)</label>
                                            <input type="text" name="spss_starting_month" value={formData.spss_starting_month} onChange={handleChange} className="mt-1 block w-full border-neutral-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm py-2 px-3 border" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-neutral-700">First Pregnant Visit Date (FristPVDate)</label>
                                            <input type="date" name="spss_first_pv_date" value={formData.spss_first_pv_date} onChange={handleChange} className="mt-1 block w-full border-neutral-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm py-2 px-3 border" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-neutral-700">Number of Miscarriage (NoMiscarri)</label>
                                            <input type="number" name="spss_number_miscarriages" value={formData.spss_number_miscarriages} onChange={handleChange} className="mt-1 block w-full border-neutral-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm py-2 px-3 border" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-neutral-700">Immunization (Imunization)</label>
                                            <input type="number" name="spss_immunization_count" value={formData.spss_immunization_count} onChange={handleChange} className="mt-1 block w-full border-neutral-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm py-2 px-3 border" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-neutral-700">Delivery Status (DeliveryS)</label>
                                            <input type="number" name="spss_delivery_status" value={formData.spss_delivery_status} onChange={handleChange} className="mt-1 block w-full border-neutral-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm py-2 px-3 border" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-neutral-700">Delivery Date (DeliveryD)</label>
                                            <input type="date" name="spss_delivery_date" value={formData.spss_delivery_date} onChange={handleChange} className="mt-1 block w-full border-neutral-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm py-2 px-3 border" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-neutral-700">Child Death After (CDeathAFN)</label>
                                            <input type="number" name="spss_child_death_after" value={formData.spss_child_death_after} onChange={handleChange} className="mt-1 block w-full border-neutral-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm py-2 px-3 border" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-neutral-700">Breastfeeding (BreastF)</label>
                                            <input type="number" name="spss_breastfeeding_status" value={formData.spss_breastfeeding_status} onChange={handleChange} className="mt-1 block w-full border-neutral-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm py-2 px-3 border" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-neutral-700">RH Factor (RHFactor)</label>
                                            <input type="number" name="spss_rh_factor" value={formData.spss_rh_factor} onChange={handleChange} className="mt-1 block w-full border-neutral-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm py-2 px-3 border" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-neutral-700">No. Antenatal (NoAntenat)</label>
                                            <input type="number" name="spss_no_antenatal" value={formData.spss_no_antenatal} onChange={handleChange} className="mt-1 block w-full border-neutral-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm py-2 px-3 border" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-neutral-700">No. Postnatal (NoPostnata)</label>
                                            <input type="number" name="spss_no_postnatal" value={formData.spss_no_postnatal} onChange={handleChange} className="mt-1 block w-full border-neutral-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm py-2 px-3 border" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-neutral-700">Child No. After (ChildNOAF)</label>
                                            <input type="number" name="spss_child_no_after" value={formData.spss_child_no_after} onChange={handleChange} className="mt-1 block w-full border-neutral-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm py-2 px-3 border" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-neutral-700">Second Date Pregnant (SDatePreg)</label>
                                            <input type="date" name="spss_second_preg_date" value={formData.spss_second_preg_date} onChange={handleChange} className="mt-1 block w-full border-neutral-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm py-2 px-3 border" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-neutral-700">Second Pregnancy (SPregnanc)</label>
                                            <input type="number" name="spss_second_pregnancy" value={formData.spss_second_pregnancy} onChange={handleChange} className="mt-1 block w-full border-neutral-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm py-2 px-3 border" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-neutral-700">Second Breastfeeding (SPBreastF)</label>
                                            <input type="number" name="spss_second_breastfeeding" value={formData.spss_second_breastfeeding} onChange={handleChange} className="mt-1 block w-full border-neutral-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm py-2 px-3 border" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-neutral-700">Second Antenatal (SAntenatal)</label>
                                            <input type="number" name="spss_second_antenatal" value={formData.spss_second_antenatal} onChange={handleChange} className="mt-1 block w-full border-neutral-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm py-2 px-3 border" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-neutral-700">Second Postnatal (SPostnatal)</label>
                                            <input type="number" name="spss_second_postnatal" value={formData.spss_second_postnatal} onChange={handleChange} className="mt-1 block w-full border-neutral-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm py-2 px-3 border" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-neutral-700">Second Immunization (SpImunizati)</label>
                                            <input type="number" name="spss_second_immunization" value={formData.spss_second_immunization} onChange={handleChange} className="mt-1 block w-full border-neutral-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm py-2 px-3 border" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-neutral-700">Second Delivery Date (SPDeliveryD)</label>
                                            <input type="date" name="spss_second_delivery_date" value={formData.spss_second_delivery_date} onChange={handleChange} className="mt-1 block w-full border-neutral-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm py-2 px-3 border" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-neutral-700">No. Children After (Nochildefte)</label>
                                            <input type="number" name="spss_number_children_after" value={formData.spss_number_children_after} onChange={handleChange} className="mt-1 block w-full border-neutral-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm py-2 px-3 border" />
                                        </div>
                                            <div className="sm:col-span-2 flex flex-col sm:flex-row justify-end mt-4 sm:space-x-3">
                                                <button type="button" onClick={closeModal} className="w-full sm:w-auto mb-3 sm:mb-0 inline-flex justify-center rounded-md border border-neutral-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-neutral-700 hover:bg-neutral-50 sm:text-sm">
                                                    Cancel
                                                </button>
                                                <button type="submit" className="w-full sm:w-auto inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary-600 text-base font-medium text-white hover:bg-primary-700 sm:text-sm">
                                                    {editingClient ? 'Update Record' : 'Save Record'}
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
