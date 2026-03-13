import api from './api';

/** Fetch distinct mentor mother names (from clients, reports, plans) for dropdowns */
export const getMentorMothers = () => api.get('/records/mentor-mothers/');

export const getClients = () => api.get('/records/clients/');

/** Fetch all client registrations across pages (for building MCH list from registrations). */
export const getAllClients = async () => {
    const all = [];
    let nextUrl = '/records/clients/';
    while (nextUrl) {
        const res = await api.get(nextUrl);
        const data = res.data;
        const list = Array.isArray(data) ? data : (data?.results || []);
        all.push(...list);
        nextUrl = data?.next || null;
    }
    return { data: all };
};

export const createClient = (data) => api.post('/records/clients/', data);
export const updateClient = (id, data) => api.patch(`/records/clients/${id}/`, data);
export const deleteClient = (id) => api.delete(`/records/clients/${id}/`);

/** Client follow-ups */
export const getClientFollowUps = (clientId) =>
    api.get('/records/client-followups/', { params: { client: clientId } });

export const createClientFollowUp = (data) => api.post('/records/client-followups/', data);

/** Single-page fetch (used by dashboard). */
export const getReports = () => api.get('/records/mch-reports/');

/** Fetch all MCH reports across pages (for list view so admin sees all registered reports). */
export const getAllReports = async () => {
    const all = [];
    let nextUrl = '/records/mch-reports/';
    while (nextUrl) {
        const res = await api.get(nextUrl);
        const data = res.data;
        const list = Array.isArray(data) ? data : (data?.results || []);
        all.push(...list);
        nextUrl = data?.next || null;
    }
    return { data: all };
};

export const createReport = (data) => api.post('/records/mch-reports/', data);
export const updateReport = (id, data) => api.patch(`/records/mch-reports/${id}/`, data);
export const deleteReport = (id) => api.delete(`/records/mch-reports/${id}/`);

export const getPlans = () => api.get('/records/weekly-plans/');

/** Fetch all weekly plans across pages (for dashboard charts). */
export const getAllPlans = async () => {
    const all = [];
    let nextUrl = '/records/weekly-plans/';
    while (nextUrl) {
        const res = await api.get(nextUrl);
        const data = res.data;
        const list = Array.isArray(data) ? data : (data?.results || []);
        all.push(...list);
        nextUrl = data?.next || null;
    }
    return { data: all };
};

export const createPlan = (data) => api.post('/records/weekly-plans/', data);
export const updatePlan = (id, data) => api.patch(`/records/weekly-plans/${id}/`, data);
export const deletePlan = (id) => api.delete(`/records/weekly-plans/${id}/`);
