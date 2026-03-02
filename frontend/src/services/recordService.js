import api from './api';

/** Fetch distinct mentor mother names (from clients, reports, plans) for dropdowns */
export const getMentorMothers = () => api.get('/records/mentor-mothers/');

export const getClients = () => api.get('/records/clients/');
export const createClient = (data) => api.post('/records/clients/', data);

export const getReports = () => api.get('/records/mch-reports/');
export const createReport = (data) => api.post('/records/mch-reports/', data);

export const getPlans = () => api.get('/records/weekly-plans/');
export const createPlan = (data) => api.post('/records/weekly-plans/', data);
