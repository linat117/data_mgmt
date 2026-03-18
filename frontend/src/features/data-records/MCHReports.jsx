import React, { useState, useEffect, useMemo } from 'react';
import { getAllReports, getAllClients, createReport, updateReport, deleteReport, getMentorMothers } from '../../services/recordService';
import { useAuthStore } from '../../store/authStore';
import { X, Eye, Pencil, Trash2, Download } from 'lucide-react';
import { MCH_CATEGORIES, getInitialMCHMetrics } from './mchFormStructure';
import * as XLSX from 'xlsx';

const OTHER_MENTOR = '__other__';

const MCHReports = ({ openModalRef }) => {
    const { user } = useAuthStore();
    const [reports, setReports] = useState([]);
    const [clients, setClients] = useState([]);
    const [mentorMotherNames, setMentorMotherNames] = useState([]);
    const [loading, setLoading] = useState(true);
    const [fetchError, setFetchError] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [viewReport, setViewReport] = useState(null);
    const [editingReport, setEditingReport] = useState(null);
    const [editingCell, setEditingCell] = useState(null); // { reportId, field, value }
    const [showAllColumns, setShowAllColumns] = useState(false);
    const [mentorFilter, setMentorFilter] = useState('');
    const [formData, setFormData] = useState({
        mentor_mother_name: '',
        date: new Date().toISOString().split('T')[0],
        total_green: '',
        total_blue: '',
        metrics: getInitialMCHMetrics(),
    });
    const [regionFilter, setRegionFilter] = useState('');

    // Check if user is super admin
    const isSuperAdmin = user?.role === 'SUPER_ADMIN';

    // Handle inline editing
    const handleCellDoubleClick = (reportId, field, currentValue) => {
        if (!isSuperAdmin) return;
        setEditingCell({ reportId, field, value: currentValue });
    };

    const handleCellChange = (e) => {
        const { value } = e.target;
        setEditingCell(prev => ({ ...prev, value }));
    };

    const handleCellBlur = async () => {
        if (!editingCell) return;
        
        const { reportId, field, value } = editingCell;
        const report = reports.find(r => r.id === reportId);
        
        if (!report) return;

        try {
            let updatedData = { ...report };
            
            if (field === 'total_green' || field === 'total_blue') {
                updatedData[field] = value === '' ? 0 : Number(value);
            } else if (field.startsWith('metric_')) {
                const metricKey = field.replace('metric_', '');
                updatedData.metrics = { ...updatedData.metrics, [metricKey]: value === '' ? 0 : Number(value) };
            } else if (field.startsWith('remark_')) {
                const metricKey = field.replace('remark_', '');
                updatedData.metrics = { ...updatedData.metrics, [`${metricKey}_remark`]: value };
            }

            await updateReport(reportId, updatedData);
            
            // Update local state
            setReports(prev => prev.map(r => 
                r.id === reportId ? updatedData : r
            ));
            
            // Update viewReport if it's the same report
            if (viewReport && viewReport.id === reportId) {
                setViewReport(updatedData);
            }
            
        } catch (err) {
            console.error('Failed to update report:', err);
            alert('Failed to update report. Please try again.');
        }
        
        setEditingCell(null);
    };

    const handleCellKeyPress = (e) => {
        if (e.key === 'Enter') {
            e.target.blur();
        } else if (e.key === 'Escape') {
            setEditingCell(null);
        }
    };

    // Excel export function
    const exportToExcel = () => {
        try {
            // Create workbook
            const wb = XLSX.utils.book_new();
            
            // Summary sheet
            const summaryData = filteredReports.map(report => {
                const relatedClients = clients.filter(
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
                    'Created At': report.created_at || '—'
                };
            });
            
            const summaryWs = XLSX.utils.json_to_sheet(summaryData);
            XLSX.utils.book_append_sheet(wb, summaryWs, 'Summary');
            
            // Detailed metrics sheet for reports that have metrics
            const detailedData = [];
            filteredReports.forEach(report => {
                if (!report.fromRegistrations && report.metrics) {
                    MCH_CATEGORIES.forEach(category => {
                        category.activities.forEach(activity => {
                            const value = (report.metrics || {})[activity.key] === 0 ? 0 : (report.metrics || {})[activity.key] || '';
                            const remark = (report.metrics || {})[`${activity.key}_remark`] || '';
                            
                            detailedData.push({
                                'Mentor Mother Name': report.mentor_mother_name,
                                'Date': report.date,
                                'Category No': category.no,
                                'Category Name': category.name,
                                'Activity': activity.label,
                                'No. Achieved': value,
                                'Remark': remark
                            });
                        });
                    });
                }
            });
            
            if (detailedData.length > 0) {
                const detailedWs = XLSX.utils.json_to_sheet(detailedData);
                XLSX.utils.book_append_sheet(wb, detailedWs, 'Detailed Metrics');
            }
            
            // Generate filename with date
            const today = new Date().toISOString().split('T')[0];
            const filename = `MCH_Reports_${today}.xlsx`;
            
            // Save file
            XLSX.writeFile(wb, filename);
            
        } catch (error) {
            console.error('Error exporting to Excel:', error);
            alert('Failed to export to Excel. Please try again.');
        }
    };

    const fetchReports = async () => {
        setFetchError('');
        try {
            const res = await getAllReports();
            const list = Array.isArray(res.data) ? res.data : [];
            if (list.length > 0) {
                setReports(list);
                setLoading(false);
                return;
            }
            setReports(list);
            try {
                const clientsRes = await getAllClients();
                const clients = Array.isArray(clientsRes.data) ? clientsRes.data : [];
                const byKey = {};
                clients.forEach((c) => {
                    const key = `${c.mentor_mother_name}|${c.date}`;
                    if (!byKey[key]) {
                        byKey[key] = {
                            id: `reg-${key}`,
                            mentor_mother_name: c.mentor_mother_name,
                            date: c.date,
                            total_green: c.total_green_cases ?? 0,
                            total_blue: c.total_blue_cases ?? 0,
                            metrics: {},
                            fromRegistrations: true,
                        };
                    }
                });
                const fromReg = Object.values(byKey);
                if (fromReg.length > 0) setReports(fromReg);
            } catch (innerErr) {
                console.error(innerErr);
            }
        } catch (err) {
            console.error(err);
            setFetchError(err?.response?.data?.detail || err?.message || 'Failed to load MCH reports.');
            setReports([]);
        } finally {
            setLoading(false);
        }
    };

    const fetchClients = async () => {
        try {
            const res = await getAllClients();
            setClients(Array.isArray(res.data) ? res.data : []);
        } catch (err) {
            console.error(err);
        }
    };

    const fetchMentorMothers = async () => {
        try {
            const res = await getMentorMothers();
            setMentorMotherNames(res.data.names || []);
        } catch (err) {
            console.error(err);
            // Fallback: extract mentor mother names from reports
            const uniqueMentors = Array.from(
                new Set(
                    reports
                        .map((r) => r.mentor_mother_name)
                        .filter((name) => name && typeof name === 'string')
                )
            );
            setMentorMotherNames(uniqueMentors);
        }
    };

    useEffect(() => {
        fetchReports();
        fetchClients();
        fetchMentorMothers(); // Fetch mentor mothers on component load
    }, []);

    // Update mentor mother names when reports are loaded
    useEffect(() => {
        if (reports.length > 0) {
            const uniqueMentors = Array.from(
                new Set(
                    reports
                        .map((r) => r.mentor_mother_name)
                        .filter((name) => name && typeof name === 'string')
                )
            );
            setMentorMotherNames(prev => {
                // Merge with existing names to avoid duplicates
                const merged = new Set([...prev, ...uniqueMentors]);
                return Array.from(merged).sort();
            });
        }
    }, [reports]);

    useEffect(() => {
        if (showModal) fetchMentorMothers();
    }, [showModal]);

    useEffect(() => {
        if (openModalRef) openModalRef.current = () => { setShowModal(true); resetForm(); };
        return () => { if (openModalRef) openModalRef.current = null; };
    }, [openModalRef]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name === 'mentor_mother_select') {
            setFormData(prev => ({ ...prev, mentor_mother_name: value === OTHER_MENTOR ? '' : value }));
            return;
        }
        if (name.startsWith('metric_')) {
            const key = name.slice(7);
            setFormData(prev => ({
                ...prev,
                metrics: { ...prev.metrics, [key]: key.endsWith('_remark') ? value : (value === '' ? '' : value) },
            }));
            return;
        }
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const buildMetricsPayload = () => {
        const metrics = {};
        Object.entries(formData.metrics).forEach(([key, val]) => {
            if (key.endsWith('_remark')) {
                metrics[key] = typeof val === 'string' ? val : '';
            } else {
                const n = Number(val);
                metrics[key] = isNaN(n) ? 0 : n;
            }
        });
        return metrics;
    };

    const mentorSelectValue = mentorMotherNames.includes(formData.mentor_mother_name) ? formData.mentor_mother_name : (formData.mentor_mother_name ? OTHER_MENTOR : '');

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!(formData.mentor_mother_name || '').trim()) {
            alert('Please select or enter Mentor Mother name.');
            return;
        }
        try {
            const dataToSubmit = {
                mentor_mother_name: formData.mentor_mother_name.trim(),
                date: formData.date,
                total_green: Number(formData.total_green) || 0,
                total_blue: Number(formData.total_blue) || 0,
                metrics: buildMetricsPayload(),
            };
            if (editingReport) {
                await updateReport(editingReport.id, dataToSubmit);
                setEditingReport(null);
            } else {
                await createReport(dataToSubmit);
            }
            setShowModal(false);
            resetForm();
            fetchReports();
        } catch (err) {
            console.error('Error creating report', err);
            alert('Failed to save report.');
        }
    };

    const resetForm = () => {
        setFormData({
            mentor_mother_name: '',
            date: new Date().toISOString().split('T')[0],
            total_green: '',
            total_blue: '',
            metrics: getInitialMCHMetrics(),
        });
        setEditingReport(null);
    };

    const openEditReport = (report) => {
        if (report.fromRegistrations) return;
        setViewReport(null);
        setEditingReport(report);
        setFormData({
            mentor_mother_name: report.mentor_mother_name ?? '',
            date: report.date ?? new Date().toISOString().split('T')[0],
            total_green: report.total_green ?? '',
            total_blue: report.total_blue ?? '',
            metrics: report.metrics && typeof report.metrics === 'object' ? { ...getInitialMCHMetrics(), ...report.metrics } : getInitialMCHMetrics(),
        });
        setShowModal(true);
    };

    const handleDeleteReport = async (report) => {
        if (report.fromRegistrations) return;
        if (!window.confirm(`Delete MCH report for ${report.mentor_mother_name} (${report.date})?`)) return;
        try {
            await deleteReport(report.id);
            setViewReport(null);
            setEditingReport(null);
            fetchReports();
        } catch (err) {
            console.error('Error deleting report', err);
            alert('Failed to delete report.');
        }
    };

    const regionOptions = Array.from(
        new Set(
            reports
                .map((r) => r.created_by_region_code)
                .filter((code) => code && typeof code === 'string')
        )
    );

    const filteredReports = useMemo(() => {
        let filtered = regionFilter
            ? reports.filter((r) => r.created_by_region_code === regionFilter)
            : reports;

        if (mentorFilter) {
            filtered = filtered.filter((r) => r.mentor_mother_name === mentorFilter);
        }

        return filtered;
    }, [reports, regionFilter, mentorFilter]);

    return (
        <div className="min-w-0">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-medium text-neutral-800 sm:text-xl">Maternal and Child Health Services Report</h2>
                <button
                    onClick={exportToExcel}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors text-sm"
                    disabled={filteredReports.length === 0}
                >
                    <Download className="h-4 w-4" />
                    Export to Excel
                </button>
            </div>

            <div className="bg-white shadow overflow-hidden sm:rounded-md">
                {fetchError && (
                    <div className="p-4 bg-red-50 border-b border-red-100 text-sm text-red-700">
                        {fetchError}
                    </div>
                )}
                {loading ? (
                    <div className="p-4 text-center text-neutral-500">Loading...</div>
                ) : (
                    <div className="overflow-x-auto -mx-3 sm:mx-0" style={{ WebkitOverflowScrolling: 'touch' }}>
                        {regionOptions.length > 0 && (
                            <div className="px-3 pt-3 pb-2 sm:px-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-sm">
                                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                                    <div className="flex items-center gap-2">
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
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-neutral-600 font-medium">Mentor Mother:</span>
                                        <select
                                            value={mentorFilter}
                                            onChange={(e) => setMentorFilter(e.target.value)}
                                            className="border border-neutral-300 rounded-md py-1 px-2 text-sm bg-white min-w-40"
                                        >
                                            <option value="">All</option>
                                            {mentorMotherNames.map((name) => (
                                                <option key={name} value={name}>
                                                    {name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setShowAllColumns(!showAllColumns)}
                                    className="text-primary-600 hover:text-primary-800 text-sm font-medium"
                                >
                                    {showAllColumns ? 'Show Less' : 'Show All Columns'}
                                </button>
                            </div>
                        )}
                        <table className="min-w-full divide-y divide-neutral-200">
                            <thead className="bg-neutral-50">
                                <tr>
                                    <th className="px-3 py-2 sm:px-6 sm:py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Client Name</th>
                                    <th className="px-3 py-2 sm:px-6 sm:py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Age</th>
                                    <th className="px-3 py-2 sm:px-6 sm:py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Sex</th>
                                    <th className="px-3 py-2 sm:px-6 sm:py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Folder</th>
                                    {showAllColumns && (
                                        <>
                                            <th className="px-3 py-2 sm:px-6 sm:py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Mentor Mother's Name</th>
                                            <th className="px-3 py-2 sm:px-6 sm:py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Added by</th>
                                            <th className="px-3 py-2 sm:px-6 sm:py-3 text-right text-xs font-medium text-neutral-500 uppercase tracking-wider">Actions</th>
                                        </>
                                    )}
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-neutral-200">
                                {filteredReports.map((report) => {
                                    const relatedClients = clients.filter(
                                        (c) =>
                                            c.mentor_mother_name === report.mentor_mother_name &&
                                            c.date === report.date
                                    );
                                    const firstClient = relatedClients[0] || {};
                                    const addedBy =
                                        report.created_by_name ||
                                        report.created_by_email ||
                                        firstClient.created_by_name ||
                                        firstClient.created_by_email ||
                                        '—';
                                    return (
                                        <tr key={report.id} className="hover:bg-neutral-50">
                                            <td className="px-3 py-3 whitespace-nowrap text-sm font-medium text-primary-600 sm:px-6 sm:py-4">
                                                {firstClient.name || '—'}
                                            </td>
                                            <td className="px-3 py-3 whitespace-nowrap text-sm text-neutral-900 sm:px-6 sm:py-4">
                                                {firstClient.age ?? '—'}
                                            </td>
                                            <td className="px-3 py-3 whitespace-nowrap text-sm text-neutral-900 sm:px-6 sm:py-4">
                                                {firstClient.sex || '—'}
                                            </td>
                                            <td className="px-3 py-3 whitespace-nowrap text-sm text-neutral-900 sm:px-6 sm:py-4">
                                                {firstClient.folder_number || '—'}
                                            </td>
                                            {showAllColumns && (
                                                <>
                                                    <td className="px-3 py-3 whitespace-nowrap text-sm text-neutral-900 sm:px-6 sm:py-4">
                                                        {report.mentor_mother_name}
                                                    </td>
                                                    <td className="px-3 py-3 text-sm text-neutral-500 sm:px-6 sm:py-4 whitespace-nowrap">
                                                        {addedBy}
                                                    </td>
                                                    <td className="px-3 py-3 sm:px-6 sm:py-4 whitespace-nowrap text-right">
                                                        <div className="flex items-center justify-end gap-1">
                                                            <button type="button" onClick={() => setViewReport(report)} className="p-1.5 text-neutral-500 hover:text-primary-600 rounded" title="View"><Eye className="h-4 w-4" /></button>
                                                            <button type="button" onClick={() => openEditReport(report)} className="p-1.5 text-neutral-500 hover:text-primary-600 rounded disabled:opacity-50 disabled:cursor-not-allowed" title="Edit" disabled={!!report.fromRegistrations}><Pencil className="h-4 w-4" /></button>
                                                            <button type="button" onClick={() => handleDeleteReport(report)} className="p-1.5 text-neutral-500 hover:text-red-600 rounded disabled:opacity-50 disabled:cursor-not-allowed" title="Delete" disabled={!!report.fromRegistrations}><Trash2 className="h-4 w-4" /></button>
                                                        </div>
                                                    </td>
                                                </>
                                            )}
                                        </tr>
                                    );
                                })}
                                {reports.length === 0 && (
                                    <tr>
                                        <td colSpan={showAllColumns ? 7 : 4} className="px-3 py-4 text-sm text-neutral-500 text-center sm:px-6">No reports found.</td>
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
                        <div className="relative bg-white rounded-lg text-left overflow-hidden shadow-xl w-full max-w-4xl max-h-[90vh] sm:max-h-[85vh] flex flex-col">
                            <div className="px-4 pt-5 pb-2 border-b border-neutral-200 flex-shrink-0">
                                <h3 className="text-base sm:text-lg leading-6 font-medium text-neutral-900 flex justify-between items-center gap-2">
                                    <span className="min-w-0">{editingReport ? 'Edit MCH Report' : 'Maternal and Child Health Services Report'}</span>
                                    <button onClick={() => { setShowModal(false); setEditingReport(null); }} className="flex-shrink-0 p-1 text-neutral-400 hover:text-neutral-500 rounded" aria-label="Close"><X className="h-5 w-5" /></button>
                                </h3>
                            </div>
                            <form onSubmit={handleSubmit} className="flex flex-col min-h-0">
                                <div className="px-4 py-4 overflow-y-auto flex-1 space-y-6">
                                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
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
                                            <input type="number" min="0" name="total_green" value={formData.total_green} onChange={handleChange} className="mt-1 block w-full border-neutral-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm py-2 px-3 border" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-neutral-700">Total case: Blue (Children)</label>
                                            <input type="number" min="0" name="total_blue" value={formData.total_blue} onChange={handleChange} className="mt-1 block w-full border-neutral-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm py-2 px-3 border" />
                                        </div>
                                    </div>

                                    <div className="border-t border-neutral-200 pt-4">
                                        <p className="text-sm font-medium text-neutral-700 mb-4">No. achieved / Remark by category</p>
                                        {MCH_CATEGORIES.map((category) => (
                                            <div key={category.no} className="mb-6">
                                                <h4 className="text-sm font-semibold text-neutral-800 mb-3">
                                                    {category.no}. {category.name}
                                                </h4>
                                                <div className="space-y-3 pl-2 border-l-2 border-neutral-200">
                                                    {category.activities.map((act) => (
                                                        <div key={act.key} className="grid grid-cols-1 gap-2 sm:grid-cols-12 sm:gap-4">
                                                            <div className="sm:col-span-6">
                                                                <label className="block text-xs text-neutral-600">{act.label}</label>
                                                                <div className="mt-1 flex gap-2 flex-wrap">
                                                                    <input
                                                                        type="number"
                                                                        min="0"
                                                                        name={`metric_${act.key}`}
                                                                        value={formData.metrics[act.key] ?? ''}
                                                                        onChange={handleChange}
                                                                        className="block w-24 border-neutral-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm py-1.5 px-2 border"
                                                                        placeholder="No"
                                                                    />
                                                                    {act.hasRemark && (
                                                                        <input
                                                                            type="text"
                                                                            name={`metric_${act.key}_remark`}
                                                                            value={formData.metrics[`${act.key}_remark`] ?? ''}
                                                                            onChange={handleChange}
                                                                            className="flex-1 min-w-[120px] border-neutral-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm py-1.5 px-2 border"
                                                                            placeholder="Remark"
                                                                        />
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div className="px-4 py-4 border-t border-neutral-200 flex-shrink-0 flex flex-col sm:flex-row justify-end gap-2">
                                    <button type="button" onClick={() => { setShowModal(false); setEditingReport(null); }} className="inline-flex justify-center rounded-md border border-neutral-300 shadow-sm px-4 py-2 bg-white text-sm font-medium text-neutral-700 hover:bg-neutral-50">
                                        Cancel
                                    </button>
                                    <button type="submit" className="inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary-600 text-sm font-medium text-white hover:bg-primary-700">
                                        {editingReport ? 'Update Report' : 'Save Report'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {viewReport && (
                <div className="fixed z-20 inset-0 overflow-y-auto p-4 sm:p-0">
                    <div className="flex min-h-full sm:min-h-screen items-center justify-center">
                        <div className="fixed inset-0 transition-opacity" onClick={() => setViewReport(null)}>
                            <div className="absolute inset-0 bg-neutral-500 opacity-75"></div>
                        </div>
                        <div className="relative bg-white rounded-lg text-left overflow-hidden shadow-xl w-full max-w-5xl max-h-[90vh] sm:max-h-[85vh] flex flex-col">
                            <div className="px-4 pt-5 pb-3 border-b border-neutral-200 flex-shrink-0">
                                <div className="flex justify-between items-start gap-2">
                                    <div>
                                        <h3 className="text-base sm:text-lg leading-6 font-medium text-neutral-900">
                                            Maternal and Child Health Services Report
                                        </h3>
                                        <div className="mt-3 space-y-1 text-sm text-neutral-800">
                                            <div className="flex flex-wrap gap-4">
                                                <span>
                                                    <span className="font-semibold">Mentor Mother’s Name:</span>{' '}
                                                    {viewReport.mentor_mother_name}
                                                </span>
                                                <span>
                                                    <span className="font-semibold">Date:</span> {viewReport.date}
                                                </span>
                                            </div>
                                            <div className="flex flex-wrap gap-4">
                                                <span>
                                                    <span className="font-semibold">Total case: Green (Mother)</span>{' '}
                                                    {editingCell?.reportId === viewReport.id && editingCell?.field === 'total_green' ? (
                                                        <input
                                                            type="number"
                                                            value={editingCell.value}
                                                            onChange={handleCellChange}
                                                            onBlur={handleCellBlur}
                                                            onKeyDown={handleCellKeyPress}
                                                            className="w-16 text-center border border-primary-500 rounded px-1 py-0.5 text-sm ml-2"
                                                            autoFocus
                                                        />
                                                    ) : (
                                                        <span 
                                                            className={isSuperAdmin ? 'hover:bg-primary-50 px-1 rounded cursor-pointer' : ''}
                                                            onDoubleClick={() => handleCellDoubleClick(viewReport.id, 'total_green', viewReport.total_green ?? 0)}
                                                        >
                                                            {viewReport.total_green ?? 0}
                                                        </span>
                                                    )}
                                                </span>
                                                <span>
                                                    <span className="font-semibold">Total case: Blue (Children)</span>{' '}
                                                    {editingCell?.reportId === viewReport.id && editingCell?.field === 'total_blue' ? (
                                                        <input
                                                            type="number"
                                                            value={editingCell.value}
                                                            onChange={handleCellChange}
                                                            onBlur={handleCellBlur}
                                                            onKeyDown={handleCellKeyPress}
                                                            className="w-16 text-center border border-primary-500 rounded px-1 py-0.5 text-sm ml-2"
                                                            autoFocus
                                                        />
                                                    ) : (
                                                        <span 
                                                            className={isSuperAdmin ? 'hover:bg-primary-50 px-1 rounded cursor-pointer' : ''}
                                                            onDoubleClick={() => handleCellDoubleClick(viewReport.id, 'total_blue', viewReport.total_blue ?? 0)}
                                                        >
                                                            {viewReport.total_blue ?? 0}
                                                        </span>
                                                    )}
                                                </span>
                                            </div>
                                            {viewReport.created_by_email && (
                                                <div className="flex flex-wrap gap-4 mt-1">
                                                    <span>
                                                        <span className="font-semibold">Added by:</span>{' '}
                                                        {viewReport.created_by_email}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => setViewReport(null)}
                                        className="flex-shrink-0 p-1 text-neutral-400 hover:text-neutral-500 rounded"
                                        aria-label="Close"
                                    >
                                        <X className="h-5 w-5" />
                                    </button>
                                </div>
                            </div>
                            <div className="px-4 py-4 overflow-y-auto flex-1 space-y-6">
                                {!viewReport.fromRegistrations && (
                                    <div className="overflow-x-auto" style={{ WebkitOverflowScrolling: 'touch' }}>
                                        {isSuperAdmin && (
                                            <div className="mb-2 p-2 bg-primary-50 border border-primary-200 rounded text-sm text-primary-700">
                                                💡 <strong>Super Admin:</strong> Double-click on any cell in the table to edit inline. Press Enter to save or Escape to cancel.
                                            </div>
                                        )}
                                        <table className="min-w-full border border-neutral-300 text-sm">
                                            <thead className="bg-neutral-50">
                                                <tr>
                                                    <th className="border border-neutral-300 px-2 py-1 text-left w-12">No</th>
                                                    <th className="border border-neutral-300 px-2 py-1 text-left w-56">
                                                        Category
                                                    </th>
                                                    <th className="border border-neutral-300 px-2 py-1 text-left">
                                                        Activity
                                                    </th>
                                                    <th className="border border-neutral-300 px-2 py-1 text-center w-24">
                                                        No- achieved
                                                    </th>
                                                    <th className="border border-neutral-300 px-2 py-1 text-left w-64">
                                                        Remark
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {MCH_CATEGORIES.map((category) => {
                                                    const rowSpan = category.activities.length;
                                                    return category.activities.map((act, index) => {
                                                        const value =
                                                            (viewReport.metrics || {})[act.key] === 0
                                                                ? 0
                                                                : (viewReport.metrics || {})[act.key] || '';
                                                        const remark = (viewReport.metrics || {})[`${act.key}_remark`] || '';
                                                        return (
                                                            <tr key={`${category.no}-${act.key}`}>
                                                                {index === 0 && (
                                                                    <>
                                                                        <td
                                                                            rowSpan={rowSpan}
                                                                            className="border border-neutral-300 px-2 py-1 align-top"
                                                                        >
                                                                            {category.no}
                                                                        </td>
                                                                        <td
                                                                            rowSpan={rowSpan}
                                                                            className="border border-neutral-300 px-2 py-1 align-top font-medium"
                                                                        >
                                                                            {category.name}
                                                                        </td>
                                                                    </>
                                                                )}
                                                                <td className="border border-neutral-300 px-2 py-1">
                                                                    {act.label}
                                                                </td>
                                                                <td 
                                                                    className="border border-neutral-300 px-2 py-1 text-center"
                                                                    onDoubleClick={() => handleCellDoubleClick(viewReport.id, `metric_${act.key}`, value)}
                                                                    style={{ cursor: isSuperAdmin ? 'pointer' : 'default' }}
                                                                >
                                                                    {editingCell?.reportId === viewReport.id && editingCell?.field === `metric_${act.key}` ? (
                                                                        <input
                                                                            type="number"
                                                                            value={editingCell.value}
                                                                            onChange={handleCellChange}
                                                                            onBlur={handleCellBlur}
                                                                            onKeyDown={handleCellKeyPress}
                                                                            className="w-16 text-center border border-primary-500 rounded px-1 py-0.5 text-sm"
                                                                            autoFocus
                                                                        />
                                                                    ) : (
                                                                        <span className={isSuperAdmin ? 'hover:bg-primary-50 px-1 rounded' : ''}>
                                                                            {value !== '' ? value : ''}
                                                                        </span>
                                                                    )}
                                                                </td>
                                                                <td 
                                                                    className="border border-neutral-300 px-2 py-1"
                                                                    onDoubleClick={() => handleCellDoubleClick(viewReport.id, `remark_${act.key}`, remark)}
                                                                    style={{ cursor: isSuperAdmin ? 'pointer' : 'default' }}
                                                                >
                                                                    {editingCell?.reportId === viewReport.id && editingCell?.field === `remark_${act.key}` ? (
                                                                        <input
                                                                            type="text"
                                                                            value={editingCell.value}
                                                                            onChange={handleCellChange}
                                                                            onBlur={handleCellBlur}
                                                                            onKeyDown={handleCellKeyPress}
                                                                            className="w-full border border-primary-500 rounded px-1 py-0.5 text-sm"
                                                                            autoFocus
                                                                        />
                                                                    ) : (
                                                                        <span className={isSuperAdmin ? 'hover:bg-primary-50 px-1 rounded' : ''}>
                                                                            {remark}
                                                                        </span>
                                                                    )}
                                                                </td>
                                                            </tr>
                                                        );
                                                    });
                                                })}
                                            </tbody>
                                        </table>
                                    </div>
                                )}

                                <div className="overflow-x-auto" style={{ WebkitOverflowScrolling: 'touch' }}>
                                    {(() => {
                                        const relatedClients = clients.filter(
                                            (c) =>
                                                c.mentor_mother_name === viewReport.mentor_mother_name &&
                                                c.date === viewReport.date
                                        );
                                        if (relatedClients.length === 0) {
                                            return (
                                                <p className="text-sm text-neutral-600">
                                                    No client registrations found for this Mentor Mother and date.
                                                </p>
                                            );
                                        }
                                        return (
                                            <table className="min-w-full border border-neutral-300 text-sm">
                                                <thead className="bg-neutral-50">
                                                    <tr>
                                                        <th className="border border-neutral-300 px-2 py-1 text-center w-12">
                                                            S.n
                                                        </th>
                                                        <th className="border border-neutral-300 px-2 py-1 text-left">
                                                            Name
                                                        </th>
                                                        <th className="border border-neutral-300 px-2 py-1 text-center">
                                                            Age
                                                        </th>
                                                        <th className="border border-neutral-300 px-2 py-1 text-center">
                                                            Sex
                                                        </th>
                                                        <th className="border border-neutral-300 px-2 py-1 text-left">
                                                            Folder
                                                        </th>
                                                        <th className="border border-neutral-300 px-2 py-1 text-left">
                                                            Address
                                                        </th>
                                                        <th className="border border-neutral-300 px-2 py-1 text-center">
                                                            Weight
                                                        </th>
                                                        <th className="border border-neutral-300 px-2 py-1 text-center">
                                                            MUAC
                                                        </th>
                                                        <th className="border border-neutral-300 px-2 py-1 text-left">
                                                            Identified problem
                                                        </th>
                                                        <th className="border border-neutral-300 px-2 py-1 text-left">
                                                            Counseling given
                                                        </th>
                                                        <th className="border border-neutral-300 px-2 py-1 text-left">
                                                            Demonstration shown by MM
                                                        </th>
                                                        <th className="border border-neutral-300 px-2 py-1 text-left">
                                                            Anything additional
                                                        </th>
                                                        <th className="border border-neutral-300 px-2 py-1 text-left">
                                                            Problem faced by MMs
                                                        </th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {relatedClients.map((client, index) => (
                                                        <tr key={client.id || index}>
                                                            <td className="border border-neutral-300 px-2 py-1 text-center">
                                                                {index + 1}
                                                            </td>
                                                            <td className="border border-neutral-300 px-2 py-1">
                                                                {client.name}
                                                            </td>
                                                            <td className="border border-neutral-300 px-2 py-1 text-center">
                                                                {client.age}
                                                            </td>
                                                            <td className="border border-neutral-300 px-2 py-1 text-center">
                                                                {client.sex}
                                                            </td>
                                                            <td className="border border-neutral-300 px-2 py-1">
                                                                {client.folder_number}
                                                            </td>
                                                            <td className="border border-neutral-300 px-2 py-1">
                                                                {client.address}
                                                            </td>
                                                            <td className="border border-neutral-300 px-2 py-1 text-center">
                                                                {client.weight}
                                                            </td>
                                                            <td className="border border-neutral-300 px-2 py-1 text-center">
                                                                {client.muac}
                                                            </td>
                                                            <td className="border border-neutral-300 px-2 py-1">
                                                                {client.identified_problem}
                                                            </td>
                                                            <td className="border border-neutral-300 px-2 py-1">
                                                                {client.counseling_given}
                                                            </td>
                                                            <td className="border border-neutral-300 px-2 py-1">
                                                                {client.demonstration_shown}
                                                            </td>
                                                            <td className="border border-neutral-300 px-2 py-1">
                                                                {client.anything_additional}
                                                            </td>
                                                            <td className="border border-neutral-300 px-2 py-1">
                                                                {client.problem_faced_by_mm}
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        );
                                    })()}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
export default MCHReports;
