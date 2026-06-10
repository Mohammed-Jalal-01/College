import apiClient from './apiClient';

const normalizeTime = (value) => {
  if (!value) return value;
  const parts = value.split(':');
  if (parts.length === 2) return `${value}:00`;
  return value;
};

const normalizePayload = (data) => ({
  ...data,
  startTime: normalizeTime(data.startTime),
  endTime: normalizeTime(data.endTime),
});

export const schedulesService = {
  getAll: async (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.branchId) params.append('branchId', filters.branchId);
    if (filters.studyTypeId) params.append('studyTypeId', filters.studyTypeId);
    if (filters.stageId) params.append('stageId', filters.stageId);
    
    const response = await apiClient.get(`/lectureschedules?${params.toString()}`);
    return response.data;
  },

  getById: async (id) => {
    const response = await apiClient.get(`/lectureschedules/${id}`);
    return response.data;
  },

  create: async (data) => {
    const response = await apiClient.post('/lectureschedules', normalizePayload(data));
    return response.data;
  },

  update: async (id, data) => {
    const response = await apiClient.put(`/lectureschedules/${id}`, normalizePayload(data));
    return response.data;
  },

  delete: async (id) => {
    const response = await apiClient.delete(`/lectureschedules/${id}`);
    return response.data;
  },
};
