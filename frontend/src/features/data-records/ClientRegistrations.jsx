import React, { useState, useEffect } from 'react';
import { getAllClients, createClient, updateClient, deleteClient, getMentorMothers } from '../../services/recordService';
import { useAuthStore } from '../../store/authStore';
import { X, Eye, Pencil, Trash2 } from 'lucide-react';
import { DATA_RECORD_SECTIONS, VALUE_LABELS, getLabelForValue } from './dataRecordFormStructure';

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
    spss_third_preg_date: '', spss_third_pregnancy: '', spss_third_breastfeeding: '', spss_third_antenatal: '',
    spss_third_postnatal: '', spss_third_immunization: '', spss_third_delivery_date: '', spss_third_number_children_after: '',
});

const pregnancyDefaults = {
    preg_date: '',
    pregnancy: '',
    breastfeeding: '',
    antenatal: '',
    postnatal: '',
    immunization: '',
    delivery_date: '',
    number_children_after: '',
};

const buildPregnanciesFromClient = (c) => {
    if (Array.isArray(c?.pregnancies) && c.pregnancies.length > 0) {
        return c.pregnancies.map((p) => ({
            ...pregnancyDefaults,
            ...p,
        }));
    }
    const list = [];
    if (
        c.spss_second_preg_date ||
        c.spss_second_pregnancy ||
        c.spss_second_breastfeeding ||
        c.spss_second_antenatal ||
        c.spss_second_postnatal ||
        c.spss_second_immunization ||
        c.spss_second_delivery_date ||
        c.spss_number_children_after
    ) {
        list.push({
            ...pregnancyDefaults,
            preg_date: c.spss_second_preg_date || '',
            pregnancy: c.spss_second_pregnancy || '',
            breastfeeding: c.spss_second_breastfeeding || '',
            antenatal: c.spss_second_antenatal || '',
            postnatal: c.spss_second_postnatal || '',
            immunization: c.spss_second_immunization || '',
            delivery_date: c.spss_second_delivery_date || '',
            number_children_after: c.spss_number_children_after || '',
        });
    }
    if (
        c.spss_third_preg_date ||
        c.spss_third_pregnancy ||
        c.spss_third_breastfeeding ||
        c.spss_third_antenatal ||
        c.spss_third_postnatal ||
        c.spss_third_immunization ||
        c.spss_third_delivery_date ||
        c.spss_third_number_children_after
    ) {
        list.push({
            ...pregnancyDefaults,
            preg_date: c.spss_third_preg_date || '',
            pregnancy: c.spss_third_pregnancy || '',
            breastfeeding: c.spss_third_breastfeeding || '',
            antenatal: c.spss_third_antenatal || '',
            postnatal: c.spss_third_postnatal || '',
            immunization: c.spss_third_immunization || '',
            delivery_date: c.spss_third_delivery_date || '',
            number_children_after: c.spss_third_number_children_after || '',
        });
    }
    return list;
};

const ClientRegistrations = ({ openModalRef }) => {
    const { user: currentUser } = useAuthStore();
    const [clients, setClients] = useState([]);
    const [mentorMotherNames, setMentorMotherNames] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [viewClient, setViewClient] = useState(null);
    const [editingClient, setEditingClient] = useState(null);
    const [formData, setFormData] = useState(getInitialFormData);
    const [regionFilter, setRegionFilter] = useState('');
    const [mentorFilter, setMentorFilter] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [pregnancies, setPregnancies] = useState([]);

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
        if (openModalRef) {
            openModalRef.current = () => {
                setEditingClient(null);
                setFormData(getInitialFormData());
                setPregnancies([]);
                setShowModal(true);
            };
        }
        return () => { if (openModalRef) openModalRef.current = null; };
    }, [openModalRef]);

    const openEdit = (client) => {
        setViewClient(null);
        setEditingClient(client);
        const data = clientToFormData(client);
        setFormData(data);
        setPregnancies(buildPregnanciesFromClient(client));
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
        spss_third_preg_date: c.spss_third_preg_date ?? '',
        spss_third_pregnancy: c.spss_third_pregnancy ?? '',
        spss_third_breastfeeding: c.spss_third_breastfeeding ?? '',
        spss_third_antenatal: c.spss_third_antenatal ?? '',
        spss_third_postnatal: c.spss_third_postnatal ?? '',
        spss_third_immunization: c.spss_third_immunization ?? '',
        spss_third_delivery_date: c.spss_third_delivery_date ?? '',
        spss_third_number_children_after: c.spss_third_number_children_after ?? '',
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const combinedFormData = { ...formData };

            if (pregnancies[0]) {
                const p0 = pregnancies[0];
                combinedFormData.spss_second_preg_date = p0.preg_date || '';
                combinedFormData.spss_second_pregnancy = p0.pregnancy || '';
                combinedFormData.spss_second_breastfeeding = p0.breastfeeding || '';
                combinedFormData.spss_second_antenatal = p0.antenatal || '';
                combinedFormData.spss_second_postnatal = p0.postnatal || '';
                combinedFormData.spss_second_immunization = p0.immunization || '';
                combinedFormData.spss_second_delivery_date = p0.delivery_date || '';
                combinedFormData.spss_number_children_after = p0.number_children_after || '';
            }
            if (pregnancies[1]) {
                const p1 = pregnancies[1];
                combinedFormData.spss_third_preg_date = p1.preg_date || '';
                combinedFormData.spss_third_pregnancy = p1.pregnancy || '';
                combinedFormData.spss_third_breastfeeding = p1.breastfeeding || '';
                combinedFormData.spss_third_antenatal = p1.antenatal || '';
                combinedFormData.spss_third_postnatal = p1.postnatal || '';
                combinedFormData.spss_third_immunization = p1.immunization || '';
                combinedFormData.spss_third_delivery_date = p1.delivery_date || '';
                combinedFormData.spss_third_number_children_after = p1.number_children_after || '';
            }

            const addedByDisplay = [currentUser?.first_name, currentUser?.last_name].filter(Boolean).join(' ') || currentUser?.email || 'Unknown';
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
                'spss_third_pregnancy',
                'spss_third_breastfeeding',
                'spss_third_antenatal',
                'spss_third_postnatal',
                'spss_third_immunization',
                'spss_third_number_children_after',
            ];

            const decimalFields = ['weight', 'muac'];

            const dateFields = [
                'spss_start_date',
                'spss_first_pv_date',
                'spss_delivery_date',
                'spss_second_preg_date',
                'spss_second_delivery_date',
                'spss_third_preg_date',
                'spss_third_delivery_date',
            ];

            const payload = {
                ...combinedFormData,
                mentor_mother_name: editingClient ? (formData.mentor_mother_name || addedByDisplay) : addedByDisplay,
                total_green_cases: editingClient ? (Number(formData.total_green_cases) || 0) : 0,
                total_blue_cases: editingClient ? (Number(formData.total_blue_cases) || 0) : 0,
            };
            if (!(payload.name || '').trim()) {
                const first = (combinedFormData.spss_first_name || '').trim();
                const last = (combinedFormData.spss_last_name || '').trim();
                payload.name = [first, last].filter(Boolean).join(' ') || 'Client';
            }
            if (!(payload.address || '').trim()) payload.address = '-';
            if (!(payload.identified_problem || '').trim()) payload.identified_problem = '-';
            if (!(payload.counseling_given || '').trim()) payload.counseling_given = '-';

            numericFields.forEach((field) => {
                const value = combinedFormData[field];
                payload[field] = value === '' ? null : Number(value);
            });

            decimalFields.forEach((field) => {
                const value = combinedFormData[field];
                payload[field] = value === '' ? null : Number(value);
            });

            dateFields.forEach((field) => {
                const value = combinedFormData[field];
                payload[field] = value || null;
            });

            payload.pregnancies = pregnancies.map((p) => ({ ...pregnancyDefaults, ...p }));

            if (editingClient) {
                await updateClient(editingClient.id, payload);
                setEditingClient(null);
                setShowModal(false);
                fetchClients();
            } else {
                const res = await createClient(payload);
                const created = res?.data || {};
                // Update form with values returned by API (including auto-assigned folder_number)
                setFormData(clientToFormData(created));
                setPregnancies(buildPregnanciesFromClient(created));
                setEditingClient(created);
                fetchClients();
            }
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

    const regionOptions = Array.from(
        new Set(
            clients
                .map((c) => c.created_by_region_code)
                .filter((code) => code && typeof code === 'string')
        )
    );

    const mentorOptions = Array.from(
        new Set(
            clients
                .map((c) => c.mentor_mother_name)
                .filter((name) => name && typeof name === 'string')
        )
    );

    let filteredClients = regionFilter
        ? clients.filter((c) => c.created_by_region_code === regionFilter)
        : clients;

    if (mentorFilter) {
        filteredClients = filteredClients.filter((c) => c.mentor_mother_name === mentorFilter);
    }

    if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase();
        filteredClients = filteredClients.filter((c) => {
            const inName = (c.name || '').toLowerCase().includes(term);
            const inFolder = (c.folder_number || '').toLowerCase().includes(term);
            const inAddress = (c.address || '').toLowerCase().includes(term);
            const inMentor = (c.mentor_mother_name || '').toLowerCase().includes(term);
            return inName || inFolder || inAddress || inMentor;
        });
    }

    const addPregnancy = () => {
        setPregnancies((prev) => [...prev, { ...pregnancyDefaults }]);
    };

    const removePregnancy = (index) => {
        setPregnancies((prev) => prev.filter((_, i) => i !== index));
    };

    const handlePregnancyChange = (index, field, value) => {
        setPregnancies((prev) =>
            prev.map((p, i) => (i === index ? { ...p, [field]: value } : p)),
        );
    };

    const getPregnancyTitle = (index) => {
        const ordinals = ['Second', 'Third', 'Fourth', 'Fifth', 'Sixth', 'Seventh', 'Eighth', 'Ninth', 'Tenth'];
        const base = ordinals[index] || `${index + 2}th`;
        return `${base} pregnancy`;
    };

    return (
        <div>
            <h2 className="text-xl font-medium text-neutral-800 mb-4">Client Registrations</h2>

            <div className="bg-white shadow overflow-hidden sm:rounded-md">
                {loading ? (
                    <div className="p-4 text-center text-neutral-500">Loading...</div>
                ) : (
                    <div className="overflow-x-auto -mx-3 sm:mx-0" style={{ WebkitOverflowScrolling: 'touch' }}>
                        <div className="px-3 pt-3 pb-2 sm:px-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between text-sm">
                            <div className="flex flex-wrap items-center gap-2">
                                {regionOptions.length > 0 && (
                                    <>
                                        <span className="text-neutral-600 font-medium">Region:</span>
                                        <select
                                            value={regionFilter}
                                            onChange={(e) => setRegionFilter(e.target.value)}
                                            className="border border-neutral-300 rounded-md py-1 px-2 text-sm bg-white"
                                        >
                                            <option value="">All</option>
                                            {regionOptions.map((code) => (
                                                <option key={code} value={code}>
                                                    {code}
                                                </option>
                                            ))}
                                        </select>
                                    </>
                                )}
                                {mentorOptions.length > 0 && (
                                    <>
                                        <span className="text-neutral-600 font-medium ml-0 sm:ml-2">Mentor Mother:</span>
                                        <select
                                            value={mentorFilter}
                                            onChange={(e) => setMentorFilter(e.target.value)}
                                            className="border border-neutral-300 rounded-md py-1 px-2 text-sm bg-white"
                                        >
                                            <option value="">All</option>
                                            {mentorOptions.map((name) => (
                                                <option key={name} value={name}>
                                                    {name}
                                                </option>
                                            ))}
                                        </select>
                                    </>
                                )}
                            </div>
                            <div className="mt-2 sm:mt-0">
                                <input
                                    type="text"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    placeholder="Search by client, folder, mentor, address..."
                                    className="w-full sm:w-64 border border-neutral-300 rounded-md py-1.5 px-3 text-sm"
                                />
                            </div>
                        </div>
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
                                {filteredClients.map((client) => (
                                    <tr key={client.id} className="hover:bg-neutral-50">
                                        <td className="px-3 py-3 text-sm text-neutral-900 sm:px-4 sm:py-3 whitespace-nowrap">{client.mentor_mother_name}</td>
                                        <td className="px-3 py-3 text-sm text-neutral-900 sm:px-4 sm:py-3 whitespace-nowrap">{client.date}</td>
                                        <td className="px-3 py-3 text-sm font-medium text-primary-600 sm:px-4 sm:py-3 whitespace-nowrap">{client.name}</td>
                                        <td className="px-3 py-3 text-sm text-neutral-500 sm:px-4 sm:py-3 whitespace-nowrap">
                                            {client.created_by_name || client.created_by_email || '—'}
                                        </td>
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

            {/* View detail modal – formatted daily report style */}
            {viewClient && (() => {
                return (
                    <div className="fixed z-20 inset-0 overflow-y-auto p-4 sm:p-0">
                        <div className="flex min-h-full items-center justify-center">
                            <div className="fixed inset-0 bg-neutral-500 opacity-75" onClick={() => setViewClient(null)} />
                            <div className="relative bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
                                <div className="px-4 pt-5 pb-3 border-b border-neutral-200 flex justify-between items-center">
                                    <h3 className="text-lg font-medium text-neutral-900">Daily Client Report</h3>
                                    <button onClick={() => setViewClient(null)} className="p-1 text-neutral-400 hover:text-neutral-600 rounded" aria-label="Close"><X className="h-5 w-5" /></button>
                                </div>
                                <div className="px-4 py-4 overflow-y-auto flex-1 space-y-4 text-sm">
                                    <div className="space-y-1">
                                        <div className="flex flex-wrap gap-6">
                                            <span>
                                                <span className="font-semibold">MM’s Name:</span>{' '}
                                                {viewClient.mentor_mother_name || '-'}
                                            </span>
                                            <span>
                                                <span className="font-semibold">Date:</span>{' '}
                                                {viewClient.date || '-'}
                                            </span>
                                        </div>
                                        <div className="flex flex-wrap gap-6">
                                            <span>
                                                <span className="font-semibold">Total case: Green</span>{' '}
                                                {viewClient.total_green_cases ?? 0}
                                            </span>
                                            <span>
                                                <span className="font-semibold">Blue</span>{' '}
                                                {viewClient.total_blue_cases ?? 0}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="overflow-x-auto" style={{ WebkitOverflowScrolling: 'touch' }}>
                                        <table className="min-w-full border border-neutral-300 text-sm">
                                            <thead className="bg-neutral-50">
                                                <tr>
                                                    <th className="border border-neutral-300 px-2 py-1 text-center w-12">S.n</th>
                                                    <th className="border border-neutral-300 px-2 py-1 text-left">Name</th>
                                                    <th className="border border-neutral-300 px-2 py-1 text-center">Age</th>
                                                    <th className="border border-neutral-300 px-2 py-1 text-center">Sex</th>
                                                    <th className="border border-neutral-300 px-2 py-1 text-left">Folder</th>
                                                    <th className="border border-neutral-300 px-2 py-1 text-left">Address</th>
                                                    <th className="border border-neutral-300 px-2 py-1 text-center">Weight</th>
                                                    <th className="border border-neutral-300 px-2 py-1 text-center">MUAC</th>
                                                    <th className="border border-neutral-300 px-2 py-1 text-left">Identified problem</th>
                                                    <th className="border border-neutral-300 px-2 py-1 text-left">Counseling given</th>
                                                    <th className="border border-neutral-300 px-2 py-1 text-left">Demonstration shown by MM</th>
                                                    <th className="border border-neutral-300 px-2 py-1 text-left">Anything additional</th>
                                                    <th className="border border-neutral-300 px-2 py-1 text-left">Problem faced by MMs</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                <tr>
                                                    <td className="border border-neutral-300 px-2 py-1 text-center">1</td>
                                                    <td className="border border-neutral-300 px-2 py-1">{viewClient.name}</td>
                                                    <td className="border border-neutral-300 px-2 py-1 text-center">{viewClient.age}</td>
                                                    <td className="border border-neutral-300 px-2 py-1 text-center">{viewClient.sex}</td>
                                                    <td className="border border-neutral-300 px-2 py-1">{viewClient.folder_number}</td>
                                                    <td className="border border-neutral-300 px-2 py-1">{viewClient.address}</td>
                                                    <td className="border border-neutral-300 px-2 py-1 text-center">{viewClient.weight}</td>
                                                    <td className="border border-neutral-300 px-2 py-1 text-center">{viewClient.muac}</td>
                                                    <td className="border border-neutral-300 px-2 py-1">{viewClient.identified_problem}</td>
                                                    <td className="border border-neutral-300 px-2 py-1">{viewClient.counseling_given}</td>
                                                    <td className="border border-neutral-300 px-2 py-1">{viewClient.demonstration_shown}</td>
                                                    <td className="border border-neutral-300 px-2 py-1">{viewClient.anything_additional}</td>
                                                    <td className="border border-neutral-300 px-2 py-1">{viewClient.problem_faced_by_mm}</td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
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

                                        <form onSubmit={handleSubmit} className="mt-4 sm:mt-6 space-y-6">
                                            <div className="rounded-md bg-neutral-50 border border-neutral-200 px-3 py-2 text-sm">
                                                <span className="font-medium text-neutral-700">Added by: </span>
                                                <span className="text-neutral-900">
                                                    {[currentUser?.first_name, currentUser?.last_name].filter(Boolean).join(' ') || currentUser?.email || '—'}
                                                </span>
                                                <span className="text-neutral-500 ml-1">(this record will be saved under your account)</span>
                                            </div>
                                            <div className="grid grid-cols-1 gap-y-4 gap-x-4 sm:grid-cols-2">
                                                <div>
                                                    <label className="block text-sm font-medium text-neutral-700">Date</label>
                                                    <input type="date" required name="date" value={formData.date} onChange={handleChange} className="mt-1 block w-full border border-neutral-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm py-2 px-3" />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-neutral-700">Sex</label>
                                                    <select name="sex" value={formData.sex} onChange={handleChange} className="mt-1 block w-full border border-neutral-300 rounded-md sm:text-sm py-2 px-3">
                                                        <option value="F">Female</option>
                                                        <option value="M">Male</option>
                                                    </select>
                                                </div>
                                            </div>

                                            {DATA_RECORD_SECTIONS.filter(
                                                (section) =>
                                                    section.title !== 'Second pregnancy' &&
                                                    section.title !== 'Third pregnancy',
                                            ).map((section) => (
                                                    <div key={section.title} className="border-t border-neutral-200 pt-4">
                                                        <h4 className="text-sm font-semibold text-neutral-800 mb-3">{section.title}</h4>
                                                        <div className="grid grid-cols-1 gap-y-4 gap-x-4 sm:grid-cols-2">
                                                        {section.fields.map((field) => {
                                                            const val = formData[field.key];
                                                            const inputClass = 'mt-1 block w-full border border-neutral-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm py-2 px-3';
                                                            if (field.key === 'folder_number') {
                                                                return (
                                                                    <div key={field.key}>
                                                                        <label className="block text-sm font-medium text-neutral-700">{field.label}</label>
                                                                        <input
                                                                            type="text"
                                                                            name={field.key}
                                                                            value={formData.folder_number || ''}
                                                                            readOnly
                                                                            placeholder="Auto-assigned (e.g. AA_001)"
                                                                            className="mt-1 block w-full border border-neutral-300 rounded-md bg-neutral-50 text-neutral-700 sm:text-sm py-2 px-3"
                                                                        />
                                                                    </div>
                                                                );
                                                            }
                                                            if (field.type === 'date') {
                                                                return (
                                                                    <div key={field.key}>
                                                                        <label className="block text-sm font-medium text-neutral-700">{field.label}</label>
                                                                        <input type="date" name={field.key} value={val || ''} onChange={handleChange} className={inputClass} />
                                                                    </div>
                                                                );
                                                            }
                                                            if (field.type === 'number') {
                                                                return (
                                                                    <div key={field.key}>
                                                                        <label className="block text-sm font-medium text-neutral-700">{field.label}</label>
                                                                        <input type="number" name={field.key} value={val ?? ''} onChange={handleChange} step={field.step} className={inputClass} />
                                                                    </div>
                                                                );
                                                            }
                                                            if (field.type === 'select') {
                                                                const opts = VALUE_LABELS[field.options] || [];
                                                                const isString = field.storeAs === 'string';
                                                                return (
                                                                    <div key={field.key}>
                                                                        <label className="block text-sm font-medium text-neutral-700">{field.label}</label>
                                                                        <select name={field.key} value={val ?? ''} onChange={handleChange} className={inputClass}>
                                                                            <option value="">— Select —</option>
                                                                            {opts.map((o) => (
                                                                                <option key={o.value} value={isString ? String(o.value) : o.value}>{o.label}</option>
                                                                            ))}
                                                                        </select>
                                                                    </div>
                                                                );
                                                            }
                                                            return (
                                                                <div key={field.key}>
                                                                    <label className="block text-sm font-medium text-neutral-700">{field.label}</label>
                                                                    <input type="text" name={field.key} value={val ?? ''} onChange={handleChange} className={inputClass} />
                                                                </div>
                                                            );
                                                        })}
                                                        </div>
                                                    </div>
                                                ))}

                                            <div className="border-t border-neutral-200 pt-4">
                                                <div className="flex items-center justify-between gap-2 mb-3">
                                                    <h4 className="text-sm font-semibold text-neutral-800">Pregnancies after first</h4>
                                                    <button
                                                        type="button"
                                                        onClick={addPregnancy}
                                                        className="inline-flex items-center px-3 py-1.5 border border-primary-600 text-primary-700 text-xs font-medium rounded-md hover:bg-primary-50"
                                                    >
                                                        + Add pregnancy
                                                    </button>
                                                </div>
                                                {pregnancies.length === 0 && (
                                                    <p className="text-xs text-neutral-500">
                                                        No additional pregnancies added yet. Click &ldquo;Add pregnancy&rdquo; to record second, third, fourth, and more.
                                                    </p>
                                                )}
                                                <div className="space-y-4">
                                                    {pregnancies.map((preg, index) => {
                                                        const title = getPregnancyTitle(index);
                                                        const optsDelivery = VALUE_LABELS.DELIVERY_STORY || [];
                                                        const optsBreast = VALUE_LABELS.BREAST_FEEDING || [];
                                                        const optsImmun = VALUE_LABELS.IMMUNIZATION || [];
                                                        return (
                                                            <div key={index} className="border border-neutral-200 rounded-md p-3">
                                                                <div className="flex items-center justify-between mb-3">
                                                                    <h5 className="text-sm font-semibold text-neutral-800">{title}</h5>
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => removePregnancy(index)}
                                                                        className="text-xs text-red-600 hover:text-red-700"
                                                                    >
                                                                        Remove
                                                                    </button>
                                                                </div>
                                                                <div className="grid grid-cols-1 gap-y-4 gap-x-4 sm:grid-cols-2">
                                                                    <div>
                                                                        <label className="block text-sm font-medium text-neutral-700">Date of pregnancy</label>
                                                                        <input
                                                                            type="date"
                                                                            value={preg.preg_date || ''}
                                                                            onChange={(e) => handlePregnancyChange(index, 'preg_date', e.target.value)}
                                                                            className="mt-1 block w-full border border-neutral-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm py-2 px-3"
                                                                        />
                                                                    </div>
                                                                    <div>
                                                                        <label className="block text-sm font-medium text-neutral-700">Pregnancy delivery</label>
                                                                        <select
                                                                            value={preg.pregnancy ?? ''}
                                                                            onChange={(e) => handlePregnancyChange(index, 'pregnancy', e.target.value)}
                                                                            className="mt-1 block w-full border border-neutral-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm py-2 px-3"
                                                                        >
                                                                            <option value="">— Select —</option>
                                                                            {optsDelivery.map((o) => (
                                                                                <option key={o.value} value={o.value}>{o.label}</option>
                                                                            ))}
                                                                        </select>
                                                                    </div>
                                                                    <div>
                                                                        <label className="block text-sm font-medium text-neutral-700">Breast feeding</label>
                                                                        <select
                                                                            value={preg.breastfeeding ?? ''}
                                                                            onChange={(e) => handlePregnancyChange(index, 'breastfeeding', e.target.value)}
                                                                            className="mt-1 block w-full border border-neutral-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm py-2 px-3"
                                                                        >
                                                                            <option value="">— Select —</option>
                                                                            {optsBreast.map((o) => (
                                                                                <option key={o.value} value={o.value}>{o.label}</option>
                                                                            ))}
                                                                        </select>
                                                                    </div>
                                                                    <div>
                                                                        <label className="block text-sm font-medium text-neutral-700">Antenatal care</label>
                                                                        <input
                                                                            type="number"
                                                                            value={preg.antenatal ?? ''}
                                                                            onChange={(e) => handlePregnancyChange(index, 'antenatal', e.target.value)}
                                                                            className="mt-1 block w-full border border-neutral-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm py-2 px-3"
                                                                        />
                                                                    </div>
                                                                    <div>
                                                                        <label className="block text-sm font-medium text-neutral-700">Postnatal care</label>
                                                                        <input
                                                                            type="number"
                                                                            value={preg.postnatal ?? ''}
                                                                            onChange={(e) => handlePregnancyChange(index, 'postnatal', e.target.value)}
                                                                            className="mt-1 block w-full border border-neutral-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm py-2 px-3"
                                                                        />
                                                                    </div>
                                                                    <div>
                                                                        <label className="block text-sm font-medium text-neutral-700">Immunization</label>
                                                                        <select
                                                                            value={preg.immunization ?? ''}
                                                                            onChange={(e) => handlePregnancyChange(index, 'immunization', e.target.value)}
                                                                            className="mt-1 block w-full border border-neutral-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm py-2 px-3"
                                                                        >
                                                                            <option value="">— Select —</option>
                                                                            {optsImmun.map((o) => (
                                                                                <option key={o.value} value={o.value}>{o.label}</option>
                                                                            ))}
                                                                        </select>
                                                                    </div>
                                                                    <div>
                                                                        <label className="block text-sm font-medium text-neutral-700">Delivery date</label>
                                                                        <input
                                                                            type="date"
                                                                            value={preg.delivery_date || ''}
                                                                            onChange={(e) => handlePregnancyChange(index, 'delivery_date', e.target.value)}
                                                                            className="mt-1 block w-full border border-neutral-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm py-2 px-3"
                                                                        />
                                                                    </div>
                                                                    <div>
                                                                        <label className="block text-sm font-medium text-neutral-700">Number of children after this pregnancy</label>
                                                                        <input
                                                                            type="number"
                                                                            value={preg.number_children_after ?? ''}
                                                                            onChange={(e) => handlePregnancyChange(index, 'number_children_after', e.target.value)}
                                                                            className="mt-1 block w-full border border-neutral-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm py-2 px-3"
                                                                        />
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>

                                            <div className="border-t border-neutral-200 pt-4">
                                                <h4 className="text-sm font-semibold text-neutral-800 mb-3">Additional notes</h4>
                                                <div className="grid grid-cols-1 gap-y-4 sm:grid-cols-2">
                                                    <div className="sm:col-span-2">
                                                        <label className="block text-sm font-medium text-neutral-700">Identified problem</label>
                                                        <textarea name="identified_problem" value={formData.identified_problem} onChange={handleChange} rows={2} className="mt-1 block w-full border border-neutral-300 rounded-md sm:text-sm py-2 px-3" />
                                                    </div>
                                                    <div className="sm:col-span-2">
                                                        <label className="block text-sm font-medium text-neutral-700">Counseling given</label>
                                                        <textarea name="counseling_given" value={formData.counseling_given} onChange={handleChange} rows={2} className="mt-1 block w-full border border-neutral-300 rounded-md sm:text-sm py-2 px-3" />
                                                    </div>
                                                    <div className="sm:col-span-2">
                                                        <label className="block text-sm font-medium text-neutral-700">Anything additional</label>
                                                        <textarea
                                                            name="anything_additional"
                                                            value={formData.anything_additional}
                                                            onChange={handleChange}
                                                            rows={2}
                                                            className="mt-1 block w-full border border-neutral-300 rounded-md sm:text-sm py-2 px-3"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm font-medium text-neutral-700">Weight (kg)</label>
                                                        <input type="number" step="0.01" name="weight" value={formData.weight} onChange={handleChange} className="mt-1 block w-full border border-neutral-300 rounded-md sm:text-sm py-2 px-3" />
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm font-medium text-neutral-700">MUAC (cm)</label>
                                                        <input type="number" step="0.01" name="muac" value={formData.muac} onChange={handleChange} className="mt-1 block w-full border border-neutral-300 rounded-md sm:text-sm py-2 px-3" />
                                                    </div>
                                                    <div className="sm:col-span-2">
                                                        <label className="block text-sm font-medium text-neutral-700">Demonstration shown</label>
                                                        <textarea name="demonstration_shown" value={formData.demonstration_shown} onChange={handleChange} rows={2} className="mt-1 block w-full border border-neutral-300 rounded-md sm:text-sm py-2 px-3" />
                                                    </div>
                                                    <div className="sm:col-span-2">
                                                        <label className="block text-sm font-medium text-neutral-700">Problem faced by MM</label>
                                                        <textarea name="problem_faced_by_mm" value={formData.problem_faced_by_mm} onChange={handleChange} rows={2} className="mt-1 block w-full border border-neutral-300 rounded-md sm:text-sm py-2 px-3" />
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="sm:col-span-2 flex flex-col sm:flex-row justify-end gap-2 pt-4 border-t border-neutral-200">
                                                <button type="button" onClick={closeModal} className="w-full sm:w-auto inline-flex justify-center rounded-md border border-neutral-300 shadow-sm px-4 py-2 bg-white text-sm font-medium text-neutral-700 hover:bg-neutral-50">
                                                    Cancel
                                                </button>
                                                <button type="submit" className="w-full sm:w-auto inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary-600 text-sm font-medium text-white hover:bg-primary-700">
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
