import api from './api';

export const getUsers = (params = {}) => api.get('/users/', { params });
export const createUser = (data) => api.post('/users/', data);
export const updateUser = (id, data) => api.patch(`/users/${id}/`, data);
export const deleteUser = (id) => api.delete(`/users/${id}/`);

export const getRegions = () => api.get('/regions/');
export const createRegion = (data) => api.post('/regions/', data);
export const updateRegion = (id, data) => api.patch(`/regions/${id}/`, data);
export const deleteRegion = (id) => api.delete(`/regions/${id}/`);

export const getPermissions = () => api.get('/permissions/');
export const getMe = () => api.get('auth/me/');

export const getUserFollowUps = (userId) => api.get('/client-followups/', { params: { created_by: userId } });
