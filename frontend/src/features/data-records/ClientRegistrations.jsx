import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { getAllClients, createClient, updateClient, deleteClient, getMentorMothers, getClientFollowUps, createClientFollowUp, getAllReports, getAllPlans } from '../../services/recordService';
import { useAuthStore } from '../../store/authStore';
import { X, Eye, Pencil, Trash2, FileText, Loader } from 'lucide-react';
import { DATA_RECORD_SECTIONS, VALUE_LABELS, getLabelForValue } from './dataRecordFormStructure';
import Pagination from '../../components/common/Pagination';
import ExpandableFollowUpTable from '../../components/data-records/ExpandableFollowUpTable';
import {
    ResponsiveContainer,
    BarChart,
    Bar,
    LineChart,
    Line,
    XAxis,
    YAxis,
    Tooltip,
    CartesianGrid,
    Legend,
} from 'recharts';

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

const FollowUpByList = ({ followupCreators }) => {
    const [showAll, setShowAll] = useState(false);
    
    const getNameFromEmail = (email) => {
        const nameMatch = email.match(/^([^.]+)@/);
        return nameMatch ? nameMatch[1].charAt(0).toUpperCase() + nameMatch[1].slice(1) : email;
    };
    
    const names = followupCreators.map(getNameFromEmail);
    const displayNames = showAll ? names : names.slice(0, 2);
    const hasMore = names.length > 2;
    
    return (
        <span className="ml-1 text-xs text-neutral-400">
            by {displayNames.join(', ')}
            {hasMore && (
                <button
                    type="button"
                    onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setShowAll(!showAll);
                    }}
                    className="text-primary-600 hover:text-primary-700 underline ml-1"
                >
                    {showAll ? 'less' : `+${names.length - 2} more`}
                </button>
            )}
        </span>
    );
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
    const [followUpsByClient, setFollowUpsByClient] = useState({});
    const [showFollowUpModal, setShowFollowUpModal] = useState(false);
    const [followUpClient, setFollowUpClient] = useState(null);
    const [followUpForm, setFollowUpForm] = useState({
        notes: '',
        weight: '',
        muac: '',
        identified_problem: '',
        counseling_given: '',
        anything_additional: '',
        problem_faced_by_mm: '',
        images: [], // Store multiple images
    });
    const [viewFollowUpDetail, setViewFollowUpDetail] = useState(null);
    const [reportClient, setReportClient] = useState(null);
    const [reportFollowUps, setReportFollowUps] = useState([]);
    const [reportMch, setReportMch] = useState([]);
    const [reportPlans, setReportPlans] = useState([]);
    const [reportLoading, setReportLoading] = useState(false);
    const [followUpLoading, setFollowUpLoading] = useState(null); // Track which client ID is loading
    const [followUpHistoryField, setFollowUpHistoryField] = useState(null);
    const [expandedFollowUps, setExpandedFollowUps] = useState(new Set());
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(25);
    const [sortBy, setSortBy] = useState('created_at');
    const [sortOrder, setSortOrder] = useState('desc');

    const fetchClients = async () => {
        try {
            const params = {
                sort_by: sortBy,
                sort_order: sortOrder
            };
            const res = await getAllClients(params);
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
    }, [sortBy, sortOrder]);

    useEffect(() => {
        if (showModal) fetchMentorMothers();
    }, [showModal]);

    useEffect(() => {
        // Close history dropdown when follow-up modal closes
        if (!showFollowUpModal) {
            setFollowUpHistoryField(null);
        }
    }, [showFollowUpModal]);

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

    // Memoize expensive operations
    const filteredClients = useMemo(() => {
        let filtered = regionFilter
            ? clients.filter((c) => c.created_by_region_code === regionFilter)
            : clients;

        if (mentorFilter) {
            filtered = filtered.filter((c) => c.mentor_mother_name === mentorFilter);
        }

        if (searchTerm.trim()) {
            const term = searchTerm.toLowerCase();
            filtered = filtered.filter((c) => {
                const inName = (c.name || '').toLowerCase().includes(term);
                const inFolder = (c.folder_number || '').toLowerCase().includes(term);
                const inAddress = (c.address || '').toLowerCase().includes(term);
                const inMentor = (c.mentor_mother_name || '').toLowerCase().includes(term);
                return inName || inFolder || inAddress || inMentor;
            });
        }
        
        return filtered;
    }, [clients, regionFilter, mentorFilter, searchTerm]);

    // Pagination
    const paginatedClients = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        return filteredClients.slice(startIndex, endIndex);
    }, [filteredClients, currentPage, itemsPerPage]);

    const totalPages = Math.ceil(filteredClients.length / itemsPerPage);

    // Reset page when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [regionFilter, mentorFilter, searchTerm]);

    // Memoize options
    const regionOptions = useMemo(() => 
        Array.from(
            new Set(
                clients
                    .map((c) => c.created_by_region_code)
                    .filter((code) => code && typeof code === 'string')
            )
        ), [clients]);

    const mentorOptions = useMemo(() =>
        Array.from(
            new Set(
                clients
                    .map((c) => c.mentor_mother_name)
                    .filter((name) => name && typeof name === 'string')
            )
        ), [clients]);

    // Debounce search to prevent excessive re-renders
    const debouncedSearch = useCallback(
        (value) => {
            setSearchTerm(value);
        },
        []
    );

    const handleSearchChange = useCallback((e) => {
        const value = e.target.value;
        // Simple debounce without external library
        const timeoutId = setTimeout(() => {
            debouncedSearch(value);
        }, 300);
        
        // Clear previous timeout
        return () => clearTimeout(timeoutId);
    }, [debouncedSearch]);

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

    const openFollowUp = async (client) => {
        try {
            setFollowUpLoading(client.id);
            setFollowUpClient(client);
            setFollowUpForm({
                notes: '',
                weight: client.weight || '',
                muac: client.muac || '',
                identified_problem: client.identified_problem || '',
                counseling_given: client.counseling_given || '',
                anything_additional: client.anything_additional || '',
                problem_faced_by_mm: client.problem_faced_by_mm || '',
                images: [], // Reset images for new follow-up
            });
            const res = await getClientFollowUps(client.id);
            const list = Array.isArray(res.data) ? res.data : (res.data?.results || []);
            setFollowUpsByClient((prev) => ({ ...prev, [client.id]: list }));
            setShowFollowUpModal(true);
        } catch (err) {
            console.error('Failed to load follow-ups', err);
            alert('Failed to load follow-ups for this client.');
        } finally {
            setFollowUpLoading(null);
        }
    };

    const handleFollowUpChange = (e) => {
        const { name, value } = e.target;
        setFollowUpForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleImageUpload = (e) => {
        const files = Array.from(e.target.files);
        const validImages = files.filter(file => file.type.startsWith('image/'));
        
        setFollowUpForm((prev) => ({
            ...prev,
            images: [...prev.images, ...validImages]
        }));
    };

    const removeImage = (index) => {
        setFollowUpForm((prev) => ({
            ...prev,
            images: prev.images.filter((_, i) => i !== index)
        }));
    };

    const saveFollowUp = async (e) => {
        e.preventDefault();
        if (!followUpClient) return;
        try {
            const payload = {
                client: followUpClient.id,
                notes: followUpForm.notes || '',
                data: {
                    weight: followUpForm.weight || null,
                    muac: followUpForm.muac || null,
                    identified_problem: followUpForm.identified_problem || '',
                    counseling_given: followUpForm.counseling_given || '',
                    anything_additional: followUpForm.anything_additional || '',
                    problem_faced_by_mm: followUpForm.problem_faced_by_mm || '',
                },
                images: followUpForm.images, // Include images in payload
            };
            const res = await createClientFollowUp(payload);
            const created = res.data;
            setFollowUpsByClient((prev) => {
                const existing = prev[followUpClient.id] || [];
                return { ...prev, [followUpClient.id]: [created, ...existing] };
            });
            fetchClients();
            setFollowUpForm((prev) => ({ ...prev, notes: '', images: [] })); // Reset both notes and images
        } catch (err) {
            console.error('Failed to save follow-up', err);
            alert('Failed to save follow-up.');
        }
    };

    const closeFollowUpModal = () => {
        setShowFollowUpModal(false);
        setFollowUpClient(null);
    };

    const openReport = async (client) => {
        setReportClient(client);
        setReportLoading(true);
        setReportFollowUps([]);
        setReportMch([]);
        setReportPlans([]);
        try {
            const [fuRes, reportsRes, plansRes] = await Promise.all([
                getClientFollowUps(client.id),
                getAllReports(),
                getAllPlans(),
            ]);
            const fuList = Array.isArray(fuRes.data) ? fuRes.data : (fuRes.data?.results || []);
            setReportFollowUps(fuList);
            const reports = Array.isArray(reportsRes.data) ? reportsRes.data : (reportsRes.data?.results || []);
            const plans = Array.isArray(plansRes.data) ? plansRes.data : (plansRes.data?.results || []);
            setReportMch(reports.filter((r) => r.mentor_mother_name === client.mentor_mother_name && r.date === client.date));
            setReportPlans(plans.filter((p) => (p.client_name || '').toLowerCase().includes((client.name || '').toLowerCase())));
        } catch (err) {
            console.error('Failed to load report data', err);
        } finally {
            setReportLoading(false);
        }
    };

    const closeReport = () => {
        setReportClient(null);
        setReportFollowUps([]);
        setReportMch([]);
        setReportPlans([]);
        setViewFollowUpDetail(null);
    };

    const getFollowUpHistoryForField = (fieldKey) => {
        const list = followUpClient ? (followUpsByClient[followUpClient.id] || []) : [];
        
        return list.map((fu) => {
            const value = fieldKey === 'notes' ? (fu.notes || '') : ((fu.data || {})[fieldKey] ?? '');
            const date = fu.date || (fu.created_at && fu.created_at.split('T')[0]) || '—';
            const by = fu.created_by_name || fu.created_by_email || '—';
            return { fu, value, date, by };
        }).filter(({ value }) => {
            // Include meaningful values - handle strings, numbers, and other types
            if (value === null || value === undefined) return false;
            if (typeof value === 'string') return value.trim() !== '';
            if (typeof value === 'number') return true; // Include zero values for numbers
            return Boolean(value);
        });
    };

    const openFollowUpDetailFromHistory = (fu) => {
        setViewFollowUpDetail(fu);
        setFollowUpHistoryField(null);
    };

    const toggleFollowUpExpansion = (fuId) => {
        setExpandedFollowUps(prev => {
            const newSet = new Set(prev);
            if (newSet.has(fuId)) {
                newSet.delete(fuId);
            } else {
                newSet.add(fuId);
            }
            return newSet;
        });
    };

    const FollowUpHistoryBtn = ({ fieldKey, label }) => {
        const isOpen = followUpHistoryField === fieldKey;
        const history = getFollowUpHistoryForField(fieldKey);
        
        return (
            <span className="relative inline-flex items-center gap-1 ml-1">
                <button
                    type="button"
                    onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setFollowUpHistoryField(isOpen ? null : fieldKey);
                    }}
                    className="px-2 py-1 text-xs rounded text-neutral-400 hover:text-primary-600 hover:bg-primary-50 focus:outline-none focus:ring-2 focus:ring-primary-500 border border-neutral-300 cursor-pointer"
                    title={`Previous ${label} values`}
                    aria-expanded={isOpen}
                    aria-haspopup="true"
                    style={{ pointerEvents: 'auto' }}
                >
                    <span style={{ pointerEvents: 'none' }}>History</span>
                </button>
                {isOpen && (
                    <>
                        <div 
                            className="fixed inset-0 z-50" 
                            onClick={(e) => {
                                e.preventDefault();
                                setFollowUpHistoryField(null);
                            }} 
                            aria-hidden="true" 
                        />
                        <div className="absolute left-0 top-full mt-1 z-[60] min-w-[250px] max-w-sm max-h-64 overflow-y-auto bg-white border border-neutral-200 rounded-md shadow-xl py-1 text-xs">
                            {history.length === 0 ? (
                                <div className="px-3 py-2 text-neutral-500 italic">No previous values found</div>
                            ) : (
                                history.map(({ fu, value, date, by }) => (
                                    <button
                                        key={fu.id}
                                        type="button"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            openFollowUpDetailFromHistory(fu);
                                        }}
                                        className="w-full text-left px-3 py-2 hover:bg-neutral-50 border-b border-neutral-100 last:border-0 transition-colors"
                                    >
                                        <div className="flex items-center justify-between">
                                            <span className="font-medium text-neutral-700">{date}</span>
                                            <span className="text-neutral-500 text-xs">by {by}</span>
                                        </div>
                                        <p className="mt-1 text-neutral-800 truncate" title={String(value)}>{String(value).slice(0, 60)}{String(value).length > 60 ? '…' : ''}</p>
                                    </button>
                                ))
                            )}
                        </div>
                    </>
                )}
            </span>
        );
    };

    const buildWeightMuacChartData = () => {
        if (!reportClient) return [];
        const points = [];
        const regDate = reportClient.date;
        const w = reportClient.weight != null && reportClient.weight !== '' ? Number(reportClient.weight) : null;
        const m = reportClient.muac != null && reportClient.muac !== '' ? Number(reportClient.muac) : null;
        if (regDate && (w != null || m != null)) {
            points.push({ date: regDate, weight: w, muac: m, label: 'Registration' });
        }
        (reportFollowUps || []).forEach((fu, i) => {
            const d = fu.date || (fu.created_at && fu.created_at.split('T')[0]);
            const data = fu.data || {};
            const fw = data.weight != null && data.weight !== '' ? Number(data.weight) : null;
            const fm = data.muac != null && data.muac !== '' ? Number(data.muac) : null;
            if (d && (fw != null || fm != null)) {
                points.push({ date: d, weight: fw, muac: fm, label: `F/U ${i + 1}` });
            }
        });
        return points.sort((a, b) => (a.date < b.date ? -1 : 1));
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
                                <>
                                    <span className="text-neutral-600 font-medium ml-0 sm:ml-2">Sort:</span>
                                    <select
                                        value={sortBy}
                                        onChange={(e) => setSortBy(e.target.value)}
                                        className="border border-neutral-300 rounded-md py-1 px-2 text-sm bg-white"
                                    >
                                        <option value="created_at">Created Date</option>
                                        <option value="date">Registration Date</option>
                                        <option value="name">Client Name</option>
                                        <option value="folder_number">Folder Number</option>
                                    </select>
                                    <select
                                        value={sortOrder}
                                        onChange={(e) => setSortOrder(e.target.value)}
                                        className="border border-neutral-300 rounded-md py-1 px-2 text-sm bg-white"
                                    >
                                        <option value="desc">Newest First</option>
                                        <option value="asc">Oldest First</option>
                                    </select>
                                </>
                            </div>
                            <div className="mt-2 sm:mt-0">
                                <input
                                    type="text"
                                    onChange={handleSearchChange}
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
                                    <th className="px-3 py-2 sm:px-4 sm:py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Follow-ups</th>
                                    <th className="px-3 py-2 sm:px-4 sm:py-3 text-right text-xs font-medium text-neutral-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-neutral-200">
                                {paginatedClients.map((client) => (
                                    <tr key={client.id} className="hover:bg-neutral-50">
                                        <td className="px-3 py-3 text-sm text-neutral-900 sm:px-4 sm:py-3 whitespace-nowrap">{client.mentor_mother_name}</td>
                                        <td className="px-3 py-3 text-sm text-neutral-900 sm:px-4 sm:py-3 whitespace-nowrap">{client.date}</td>
                                        <td className="px-3 py-3 text-sm font-medium text-primary-600 sm:px-4 sm:py-3 whitespace-nowrap">{client.name}</td>
                                        <td className="px-3 py-3 text-sm text-neutral-500 sm:px-4 sm:py-3 whitespace-nowrap">
                                            {client.followup_count ?? 0}
                                            {Array.isArray(client.followup_created_by) && client.followup_created_by.length > 0 && (
                                                <FollowUpByList followupCreators={client.followup_created_by} />
                                            )}
                                        </td>
                                        <td className="px-3 py-3 text-sm sm:px-4 sm:py-3 whitespace-nowrap text-right">
                                            <div className="flex items-center justify-end gap-1">
                                                <button type="button" onClick={(e) => { e.stopPropagation(); setViewClient(client); }} className="p-1.5 text-neutral-500 hover:text-primary-600 rounded" title="View"><Eye className="h-4 w-4" /></button>
                                                <button type="button" onClick={(e) => { e.stopPropagation(); openEdit(client); }} className="p-1.5 text-neutral-500 hover:text-primary-600 rounded" title="Edit"><Pencil className="h-4 w-4" /></button>
                                                <button 
                                                    type="button" 
                                                    onClick={(e) => { e.stopPropagation(); openFollowUp(client); }} 
                                                    className="px-2 py-1 text-xs border border-primary-500 text-primary-600 rounded hover:bg-primary-50 flex items-center gap-1 min-w-[70px] justify-center" 
                                                    title="Add follow-up"
                                                    disabled={followUpLoading === client.id}
                                                >
                                                    {followUpLoading === client.id ? (
                                                        <>
                                                            <Loader className="h-3 w-3 animate-spin" />
                                                            Loading...
                                                        </>
                                                    ) : (
                                                        'Follow Up'
                                                    )}
                                                </button>
                                                {/* <button type="button" onClick={(e) => { e.stopPropagation(); openReport(client); }} className="p-1.5 text-neutral-500 hover:text-primary-600 rounded" title="Client report"><FileText className="h-4 w-4" /></button> */}
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
            <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
                itemsPerPage={itemsPerPage}
                totalItems={filteredClients.length}
                onItemsPerPageChange={setItemsPerPage}
            />

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

            {showFollowUpModal && followUpClient && (
                <div className="fixed z-20 inset-0 overflow-y-auto">
                    <div className="flex min-h-screen items-center justify-center p-2 text-center sm:p-4">
                        <div className="fixed inset-0 transition-opacity" onClick={closeFollowUpModal}>
                            <div className="absolute inset-0 bg-neutral-500 opacity-60"></div>
                        </div>
                        <div className="relative bg-white rounded-lg text-left overflow-hidden shadow-xl w-[90vw] max-w-7xl h-[95vh] max-h-[95vh] flex flex-col">
                            <div className="px-4 pt-5 pb-3 border-b border-neutral-200 flex items-center justify-between">
                                <h3 className="text-base sm:text-lg leading-6 font-medium text-neutral-900">
                                    Follow-up for {followUpClient.name} ({followUpClient.folder_number || 'No folder'})
                                </h3>
                                <button
                                    onClick={closeFollowUpModal}
                                    className="flex-shrink-0 p-1 text-neutral-400 hover:text-neutral-500 rounded"
                                    aria-label="Close"
                                >
                                    <X className="h-5 w-5" />
                                </button>
                            </div>
                            <div className="px-4 py-4 overflow-y-auto flex-1 space-y-4 text-sm">
                                {followUpsByClient[followUpClient.id] && followUpsByClient[followUpClient.id].length > 0 && (
                                    <div className="rounded-md bg-neutral-50 border border-neutral-200 p-3">
                                        <div className="flex items-center justify-between mb-2">
                                            <p className="text-sm font-medium text-neutral-800">Previous record (summary)</p>
                                            <button
                                                type="button"
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    e.stopPropagation();
                                                    openReport(followUpClient);
                                                }}
                                                className="p-1.5 text-neutral-500 hover:text-primary-600 rounded border border-neutral-300 hover:border-primary-500 hover:bg-primary-50"
                                                title="Client report"
                                            >
                                               {/*  <FileText className="h-4 w-4" />*/}See client report
                                            </button>
                                        </div>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 text-xs sm:text-sm text-neutral-700">
                                            <div><span className="font-semibold">Identified problem:</span> {followUpsByClient[followUpClient.id][0].data?.identified_problem || followUpsByClient[followUpClient.id][0].notes || '-'}</div>
                                            <div><span className="font-semibold">Counseling given:</span> {followUpsByClient[followUpClient.id][0].data?.counseling_given || '-'}</div>
                                            <div><span className="font-semibold">Weight:</span> {followUpsByClient[followUpClient.id][0].data?.weight ?? '-'}</div>
                                            <div><span className="font-semibold">MUAC:</span> {followUpsByClient[followUpClient.id][0].data?.muac ?? '-'}</div>
                                        </div>
                                    </div>
                                )}
                                <form onSubmit={saveFollowUp} className="space-y-4">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                            <label className="flex items-center text-sm font-medium text-neutral-700">
                                                Weight (kg)
                                                <FollowUpHistoryBtn fieldKey="weight" label="weight" />
                                            </label>
                                            <input
                                                type="number"
                                                step="0.01"
                                                name="weight"
                                                value={followUpForm.weight}
                                                onChange={handleFollowUpChange}
                                                className="mt-1 block w-full border border-neutral-300 rounded-md sm:text-sm py-2 px-3"
                                            />
                                        </div>
                                        <div>
                                            <label className="flex items-center text-sm font-medium text-neutral-700">
                                                MUAC (cm)
                                                <FollowUpHistoryBtn fieldKey="muac" label="MUAC" />
                                            </label>
                                            <input
                                                type="number"
                                                step="0.01"
                                                name="muac"
                                                value={followUpForm.muac}
                                                onChange={handleFollowUpChange}
                                                className="mt-1 block w-full border border-neutral-300 rounded-md sm:text-sm py-2 px-3"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="flex items-center text-sm font-medium text-neutral-700">
                                            Identified problem (updated)
                                            <FollowUpHistoryBtn fieldKey="identified_problem" label="identified problem" />
                                        </label>
                                        <textarea
                                            name="identified_problem"
                                            value={followUpForm.identified_problem}
                                            onChange={handleFollowUpChange}
                                            rows={2}
                                            className="mt-1 block w-full border border-neutral-300 rounded-md sm:text-sm py-2 px-3"
                                        />
                                    </div>
                                    <div>
                                        <label className="flex items-center text-sm font-medium text-neutral-700">
                                            Counseling given (updated)
                                            <FollowUpHistoryBtn fieldKey="counseling_given" label="counseling given" />
                                        </label>
                                        <textarea
                                            name="counseling_given"
                                            value={followUpForm.counseling_given}
                                            onChange={handleFollowUpChange}
                                            rows={2}
                                            className="mt-1 block w-full border border-neutral-300 rounded-md sm:text-sm py-2 px-3"
                                        />
                                    </div>
                                    <div>
                                        <label className="flex items-center text-sm font-medium text-neutral-700">
                                            Anything additional
                                            <FollowUpHistoryBtn fieldKey="anything_additional" label="anything additional" />
                                        </label>
                                        <textarea
                                            name="anything_additional"
                                            value={followUpForm.anything_additional}
                                            onChange={handleFollowUpChange}
                                            rows={2}
                                            className="mt-1 block w-full border border-neutral-300 rounded-md sm:text-sm py-2 px-3"
                                        />
                                    </div>
                                    <div>
                                        <label className="flex items-center text-sm font-medium text-neutral-700">
                                            Problem faced by MM
                                            <FollowUpHistoryBtn fieldKey="problem_faced_by_mm" label="problem faced by MM" />
                                        </label>
                                        <textarea
                                            name="problem_faced_by_mm"
                                            value={followUpForm.problem_faced_by_mm}
                                            onChange={handleFollowUpChange}
                                            rows={2}
                                            className="mt-1 block w-full border border-neutral-300 rounded-md sm:text-sm py-2 px-3"
                                        />
                                    </div>
                                    <div>
                                        <label className="flex items-center text-sm font-medium text-neutral-700">
                                            Follow-up notes
                                            <FollowUpHistoryBtn fieldKey="notes" label="notes" />
                                        </label>
                                        <textarea
                                            name="notes"
                                            value={followUpForm.notes}
                                            onChange={handleFollowUpChange}
                                            rows={2}
                                            className="mt-1 block w-full border border-neutral-300 rounded-md sm:text-sm py-2 px-3"
                                        />
                                    </div>
                                    <div>
                                        <label className="flex items-center text-sm font-medium text-neutral-700 mb-2">
                                            Images
                                        </label>
                                        <div className="space-y-2">
                                            <div className="flex items-center gap-2">
                                                <input
                                                    type="file"
                                                    multiple
                                                    accept="image/*"
                                                    onChange={handleImageUpload}
                                                    className="hidden"
                                                    id="follow-up-images"
                                                />
                                                <label
                                                    htmlFor="follow-up-images"
                                                    className="px-3 py-2 border border-neutral-300 rounded-md text-sm text-neutral-700 hover:bg-neutral-50 cursor-pointer flex items-center gap-2"
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                                    </svg>
                                                    Add Images
                                                </label>
                                            </div>
                                            {followUpForm.images.length > 0 && (
                                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                                                    {followUpForm.images.map((image, index) => (
                                                        <div key={index} className="relative group">
                                                            <img
                                                                src={URL.createObjectURL(image)}
                                                                alt={`Upload ${index + 1}`}
                                                                className="w-full h-24 object-cover rounded-md border border-neutral-200"
                                                            />
                                                            <button
                                                                type="button"
                                                                onClick={() => removeImage(index)}
                                                                className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                                            >
                                                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                                </svg>
                                                            </button>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex justify-end gap-2 pt-2">
                                        <button
                                            type="button"
                                            onClick={closeFollowUpModal}
                                            className="inline-flex justify-center rounded-md border border-neutral-300 shadow-sm px-4 py-2 bg-white text-sm font-medium text-neutral-700 hover:bg-neutral-50"
                                        >
                                            Close
                                        </button>
                                        <button
                                            type="submit"
                                            className="inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary-600 text-sm font-medium text-white hover:bg-primary-700"
                                        >
                                            Save follow-up
                                        </button>
                                    </div>
                                </form>

                                <div className="pt-4 border-t border-neutral-200">
                                    <h4 className="text-sm font-semibold text-neutral-800 mb-2">
                                        Previous follow-ups ({(followUpsByClient[followUpClient.id] || []).length})
                                    </h4>
                                    <ExpandableFollowUpTable followups={followUpsByClient[followUpClient.id] || []} />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Follow-up detail modal */}
            {viewFollowUpDetail && (
                <div className="fixed z-30 inset-0 overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center p-4">
                        <div className="fixed inset-0 bg-neutral-500 opacity-60" onClick={() => setViewFollowUpDetail(null)} />
                        <div className="relative bg-white rounded-lg shadow-xl w-full max-w-lg">
                            <div className="px-4 pt-4 pb-2 border-b border-neutral-200 flex justify-between items-center">
                                <h3 className="text-base font-medium text-neutral-900">Follow-up detail</h3>
                                <button onClick={() => setViewFollowUpDetail(null)} className="p-1 text-neutral-400 hover:text-neutral-600 rounded"><X className="h-5 w-5" /></button>
                            </div>
                            <div className="px-4 py-4 space-y-3 text-sm">
                                <div className="flex flex-wrap gap-4">
                                    <span><span className="font-semibold">Date:</span> {viewFollowUpDetail.date || (viewFollowUpDetail.created_at && new Date(viewFollowUpDetail.created_at).toLocaleString())}</span>
                                    <span><span className="font-semibold">By:</span> {viewFollowUpDetail.created_by_name || viewFollowUpDetail.created_by_email || '—'}</span>
                                </div>
                                {viewFollowUpDetail.notes && (
                                    <div><span className="font-semibold">Notes:</span><p className="mt-1 text-neutral-700">{viewFollowUpDetail.notes}</p></div>
                                )}
                                {viewFollowUpDetail.data && typeof viewFollowUpDetail.data === 'object' && Object.keys(viewFollowUpDetail.data).length > 0 && (
                                    <div className="border-t border-neutral-200 pt-3">
                                        <p className="font-semibold text-neutral-800 mb-2">Recorded data</p>
                                        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                            {viewFollowUpDetail.data.weight != null && viewFollowUpDetail.data.weight !== '' && <><dt className="text-neutral-500">Weight (kg)</dt><dd>{viewFollowUpDetail.data.weight}</dd></>}
                                            {viewFollowUpDetail.data.muac != null && viewFollowUpDetail.data.muac !== '' && <><dt className="text-neutral-500">MUAC (cm)</dt><dd>{viewFollowUpDetail.data.muac}</dd></>}
                                            {viewFollowUpDetail.data.identified_problem && <><dt className="text-neutral-500">Identified problem</dt><dd className="sm:col-span-1">{viewFollowUpDetail.data.identified_problem}</dd></>}
                                            {viewFollowUpDetail.data.counseling_given && <><dt className="text-neutral-500">Counseling given</dt><dd className="sm:col-span-1">{viewFollowUpDetail.data.counseling_given}</dd></>}
                                            {viewFollowUpDetail.data.anything_additional && <><dt className="text-neutral-500">Anything additional</dt><dd className="sm:col-span-1">{viewFollowUpDetail.data.anything_additional}</dd></>}
                                            {viewFollowUpDetail.data.problem_faced_by_mm && <><dt className="text-neutral-500">Problem faced by MM</dt><dd className="sm:col-span-1">{viewFollowUpDetail.data.problem_faced_by_mm}</dd></>}
                                        </dl>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Client report modal */}
            {reportClient && (
                <div className="fixed z-20 inset-0 overflow-y-auto">
                    <div className="flex min-h-screen items-center justify-center p-4 text-center sm:p-0">
                        <div className="fixed inset-0 bg-neutral-500 opacity-60" onClick={closeReport} />
                        <div className="relative bg-white rounded-lg shadow-xl w-full max-w-5xl max-h-[90vh] flex flex-col">
                            <div className="px-4 pt-5 pb-3 border-b border-neutral-200 flex items-center justify-between flex-shrink-0">
                                <h2 className="text-lg font-semibold text-neutral-900">Client report – {reportClient.name} ({reportClient.folder_number || '—'})</h2>
                                <button onClick={closeReport} className="p-1 text-neutral-400 hover:text-neutral-600 rounded"><X className="h-5 w-5" /></button>
                            </div>
                            <div className="px-4 py-4 overflow-y-auto flex-1 space-y-6 text-sm">
                                {reportLoading ? (
                                    <p className="text-neutral-500">Loading report...</p>
                                ) : (
                                    <>
                                        <section>
                                            <h3 className="text-sm font-semibold text-neutral-800 mb-2">Summary</h3>
                                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 rounded-md bg-neutral-50 p-3">
                                                <div><span className="text-neutral-500">Mentor Mother</span><br />{reportClient.mentor_mother_name || '—'}</div>
                                                <div><span className="text-neutral-500">Date</span><br />{reportClient.date || '—'}</div>
                                                <div><span className="text-neutral-500">Age / Sex</span><br />{reportClient.age ?? '—'} / {reportClient.sex || '—'}</div>
                                                <div><span className="text-neutral-500">Added by</span><br />{reportClient.created_by_name || reportClient.created_by_email || '—'}</div>
                                                <div className="col-span-2 sm:col-span-4"><span className="text-neutral-500">Address</span><br />{reportClient.address || '—'}</div>
                                            </div>
                                        </section>

                                        <section>
                                            <h3 className="text-sm font-semibold text-neutral-800 mb-2">Registration (key fields)</h3>
                                            <div className="overflow-x-auto border border-neutral-200 rounded-md">
                                                <table className="min-w-full text-sm">
                                                    <thead className="bg-neutral-50"><tr><th className="px-3 py-2 text-left">Field</th><th className="px-3 py-2 text-left">Value</th></tr></thead>
                                                    <tbody className="divide-y divide-neutral-100">
                                                        <tr><td className="px-3 py-2 text-neutral-600">Weight (kg)</td><td className="px-3 py-2">{reportClient.weight ?? '—'}</td></tr>
                                                        <tr><td className="px-3 py-2 text-neutral-600">MUAC (cm)</td><td className="px-3 py-2">{reportClient.muac ?? '—'}</td></tr>
                                                        <tr><td className="px-3 py-2 text-neutral-600">Identified problem</td><td className="px-3 py-2">{reportClient.identified_problem || '—'}</td></tr>
                                                        <tr><td className="px-3 py-2 text-neutral-600">Counseling given</td><td className="px-3 py-2">{reportClient.counseling_given || '—'}</td></tr>
                                                        <tr><td className="px-3 py-2 text-neutral-600">Problem faced by MM</td><td className="px-3 py-2">{reportClient.problem_faced_by_mm || '—'}</td></tr>
                                                    </tbody>
                                                </table>
                                            </div>
                                        </section>

                                        <section>
                                            <h3 className="text-sm font-semibold text-neutral-800 mb-2">Follow-ups ({reportFollowUps.length})</h3>
                                            <ExpandableFollowUpTable followups={reportFollowUps} />
                                        </section>

                                        {buildWeightMuacChartData().length > 0 && (
                                            <section>
                                                <h3 className="text-sm font-semibold text-neutral-800 mb-2">Weight & MUAC over time</h3>
                                                <div className="h-64 w-full">
                                                    <ResponsiveContainer width="100%" height="100%">
                                                        <LineChart data={buildWeightMuacChartData()} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                                                            <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" />
                                                            <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                                                            <YAxis yAxisId="left" tick={{ fontSize: 11 }} />
                                                            <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11 }} />
                                                            <Tooltip />
                                                            <Legend />
                                                            <Line yAxisId="left" type="monotone" dataKey="weight" name="Weight (kg)" stroke="#0d9488" strokeWidth={2} dot={{ r: 4 }} />
                                                            <Line yAxisId="right" type="monotone" dataKey="muac" name="MUAC (cm)" stroke="#0891b2" strokeWidth={2} dot={{ r: 4 }} />
                                                        </LineChart>
                                                    </ResponsiveContainer>
                                                </div>
                                            </section>
                                        )}

                                        <section>
                                            <h3 className="text-sm font-semibold text-neutral-800 mb-2">Follow-ups by date</h3>
                                            {reportFollowUps.length === 0 ? (
                                                <p className="text-neutral-500">No data for chart.</p>
                                            ) : (
                                                (() => {
                                                    const byDate = {};
                                                    reportFollowUps.forEach((fu) => {
                                                        const d = fu.date || (fu.created_at && fu.created_at.split('T')[0]) || '—';
                                                        byDate[d] = (byDate[d] || 0) + 1;
                                                    });
                                                    const chartData = Object.entries(byDate).map(([date, count]) => ({ date, count })).sort((a, b) => (a.date < b.date ? -1 : 1));
                                                    return (
                                                        <div className="h-48 w-full">
                                                            <ResponsiveContainer width="100%" height="100%">
                                                                <BarChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 24 }}>
                                                                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" />
                                                                    <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                                                                    <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                                                                    <Tooltip />
                                                                    <Bar dataKey="count" name="Follow-ups" fill="#0d9488" radius={[4, 4, 0, 0]} />
                                                                </BarChart>
                                                            </ResponsiveContainer>
                                                        </div>
                                                    );
                                                })()
                                            )}
                                        </section>

                                        {reportMch.length > 0 && (
                                            <section>
                                                <h3 className="text-sm font-semibold text-neutral-800 mb-2">Related MCH reports (same mentor & date)</h3>
                                                <div className="overflow-x-auto border border-neutral-200 rounded-md">
                                                    <table className="min-w-full text-sm">
                                                        <thead className="bg-neutral-50"><tr><th className="px-3 py-2 text-left">Date</th><th className="px-3 py-2 text-left">Total Green</th><th className="px-3 py-2 text-left">Total Blue</th></tr></thead>
                                                        <tbody className="divide-y divide-neutral-100">
                                                            {reportMch.map((r) => (
                                                                <tr key={r.id}><td className="px-3 py-2">{r.date}</td><td className="px-3 py-2">{r.total_green ?? 0}</td><td className="px-3 py-2">{r.total_blue ?? 0}</td></tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </section>
                                        )}

                                        {reportPlans.length > 0 && (
                                            <section>
                                                <h3 className="text-sm font-semibold text-neutral-800 mb-2">Related weekly plans</h3>
                                                <div className="overflow-x-auto border border-neutral-200 rounded-md">
                                                    <table className="min-w-full text-sm">
                                                        <thead className="bg-neutral-50">
                                                            <tr><th className="px-3 py-2 text-left">Date</th><th className="px-3 py-2 text-left">Day</th><th className="px-3 py-2 text-left">District</th><th className="px-3 py-2 text-left">Content</th></tr>
                                                        </thead>
                                                        <tbody className="divide-y divide-neutral-100">
                                                            {reportPlans.map((p) => (
                                                                <tr key={p.id}>
                                                                    <td className="px-3 py-2">{p.date}</td>
                                                                    <td className="px-3 py-2">{p.day_of_week || '—'}</td>
                                                                    <td className="px-3 py-2">{p.district || '—'}</td>
                                                                    <td className="px-3 py-2 max-w-xs truncate">{p.content || '—'}</td>
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </section>
                                        )}
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
export default ClientRegistrations;
