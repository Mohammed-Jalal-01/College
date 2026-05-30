import apiClient from './apiClient';

export const gradesService = {
  getAll: async (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.branchId) params.append('branchId', filters.branchId);
    if (filters.studyTypeId) params.append('studyTypeId', filters.studyTypeId);
    if (filters.stageId) params.append('stageId', filters.stageId);

    const response = await apiClient.get(`/grades?${params.toString()}`);
    return response.data;
  },

  getById: async (id) => {
    const response = await apiClient.get(`/grades/${id}`);
    return response.data;
  },

  create: async (formData) => {
    const response = await apiClient.post('/grades', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  update: async (id, formData) => {
    const response = await apiClient.put(`/grades/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  delete: async (id) => {
    const response = await apiClient.delete(`/grades/${id}`);
    return response.data;
  },
};
