import React, { useState, useEffect } from 'react';
import { getReports, createReport, getMentorMothers } from '../../services/recordService';
import { X } from 'lucide-react';
import { MCH_CATEGORIES, getInitialMCHMetrics } from './mchFormStructure';

const OTHER_MENTOR = '__other__';

const MCHReports = ({ openModalRef }) => {
    const [reports, setReports] = useState([]);
    const [mentorMotherNames, setMentorMotherNames] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [viewReport, setViewReport] = useState(null);
    const [formData, setFormData] = useState({
        mentor_mother_name: '',
        date: new Date().toISOString().split('T')[0],
        total_green: '',
        total_blue: '',
        metrics: getInitialMCHMetrics(),
    });

    const fetchReports = async () => {
        try {
            const res = await getReports();
            setReports(res.data.results || res.data);
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
        fetchReports();
    }, []);

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
            await createReport(dataToSubmit);
            setShowModal(false);
            setFormData({
                mentor_mother_name: '',
                date: new Date().toISOString().split('T')[0],
                total_green: '',
                total_blue: '',
                metrics: getInitialMCHMetrics(),
            });
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
    };

    return (
        <div className="min-w-0">
            <h2 className="text-lg font-medium text-neutral-800 sm:text-xl mb-4">Maternal and Child Health Services Report</h2>

            <div className="bg-white shadow overflow-hidden sm:rounded-md">
                {loading ? (
                    <div className="p-4 text-center text-neutral-500">Loading...</div>
                ) : (
                    <div className="overflow-x-auto -mx-3 sm:mx-0" style={{ WebkitOverflowScrolling: 'touch' }}>
                        <table className="min-w-full divide-y divide-neutral-200">
                            <thead className="bg-neutral-50">
                                <tr>
                                    <th className="px-3 py-2 sm:px-6 sm:py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Date</th>
                                    <th className="px-3 py-2 sm:px-6 sm:py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Mentor Mother</th>
                                    <th className="px-3 py-2 sm:px-6 sm:py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Green</th>
                                    <th className="px-3 py-2 sm:px-6 sm:py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Blue</th>
                                    <th className="px-3 py-2 sm:px-6 sm:py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Metrics</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-neutral-200">
                                {reports.map((report) => (
                                <tr
                                        key={report.id}
                                        className="hover:bg-neutral-50 cursor-pointer"
                                        onClick={() => setViewReport(report)}
                                    >
                                        <td className="px-3 py-3 whitespace-nowrap text-sm font-medium text-primary-600 sm:px-6 sm:py-4">{report.date}</td>
                                        <td className="px-3 py-3 whitespace-nowrap text-sm text-neutral-900 sm:px-6 sm:py-4">{report.mentor_mother_name}</td>
                                        <td className="px-3 py-3 whitespace-nowrap text-sm text-neutral-500 sm:px-6 sm:py-4">{report.total_green ?? '-'}</td>
                                        <td className="px-3 py-3 whitespace-nowrap text-sm text-neutral-500 sm:px-6 sm:py-4">{report.total_blue ?? '-'}</td>
                                        <td className="px-3 py-3 text-sm text-neutral-500 sm:px-6 sm:py-4">
                                            {report.metrics && typeof report.metrics === 'object' ? (
                                                <span className="text-neutral-600">{Object.keys(report.metrics).filter(k => !k.endsWith('_remark')).length} activities recorded</span>
                                            ) : '-'}
                                        </td>
                                    </tr>
                                ))}
                                {reports.length === 0 && (
                                    <tr>
                                        <td colSpan="5" className="px-3 py-4 text-sm text-neutral-500 text-center sm:px-6">No reports found.</td>
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
                                    <span className="min-w-0">Maternal and Child Health Services Report</span>
                                    <button onClick={() => setShowModal(false)} className="flex-shrink-0 p-1 text-neutral-400 hover:text-neutral-500 rounded" aria-label="Close"><X className="h-5 w-5" /></button>
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
                                    <button type="button" onClick={() => setShowModal(false)} className="inline-flex justify-center rounded-md border border-neutral-300 shadow-sm px-4 py-2 bg-white text-sm font-medium text-neutral-700 hover:bg-neutral-50">
                                        Cancel
                                    </button>
                                    <button type="submit" className="inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary-600 text-sm font-medium text-white hover:bg-primary-700">
                                        Save Report
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
                                                    {viewReport.total_green ?? 0}
                                                </span>
                                                <span>
                                                    <span className="font-semibold">Total case: Blue (Children)</span>{' '}
                                                    {viewReport.total_blue ?? 0}
                                                </span>
                                            </div>
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
                            <div className="px-4 py-4 overflow-y-auto flex-1">
                                <div className="overflow-x-auto" style={{ WebkitOverflowScrolling: 'touch' }}>
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
                                                            <td className="border border-neutral-300 px-2 py-1 text-center">
                                                                {value !== '' ? value : ''}
                                                            </td>
                                                            <td className="border border-neutral-300 px-2 py-1">
                                                                {remark}
                                                            </td>
                                                        </tr>
                                                    );
                                                });
                                            })}
                                        </tbody>
                                    </table>
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
