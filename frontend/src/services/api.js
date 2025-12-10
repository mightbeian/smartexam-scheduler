import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const healthCheck = () => api.get('/api/health');

export const generateSyntheticData = (params) => 
  api.post('/api/generate-data', null, { params });

export const uploadCSV = (files) => {
  const formData = new FormData();
  Object.entries(files).forEach(([key, file]) => {
    if (file) formData.append(key, file);
  });
  return api.post('/api/upload-csv', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

export const getCourses = () => api.get('/api/data/courses');
export const getStudents = () => api.get('/api/data/students');
export const getRooms = () => api.get('/api/data/rooms');
export const getTimeslots = () => api.get('/api/data/timeslots');
export const getEnrollments = () => api.get('/api/data/enrollments');
export const getStatistics = () => api.get('/api/data/statistics');

export const startOptimization = (params) => 
  api.post('/api/optimize', params);

export const getOptimizationStatus = () => 
  api.get('/api/optimize/status');

export const getAllSchedules = () => api.get('/api/schedules');
export const getLatestSchedule = () => api.get('/api/schedules/latest');
export const getScheduleById = (id) => api.get(`/api/schedules/${id}`);

export default api;
