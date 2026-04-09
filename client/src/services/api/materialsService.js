import apiClient from './apiClient';

export const materialsService = {
  getAll: async (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.branchId) params.append('branchId', filters.branchId);
    if (filters.studyTypeId) params.append('studyTypeId', filters.studyTypeId);
    if (filters.stageId) params.append('stageId', filters.stageId);
    if (filters.course) params.append('course', filters.course);
    
    const response = await apiClient.get(`/coursematerials?${params.toString()}`);
    return response.data;
  },

  getById: async (id) => {
    const response = await apiClient.get(`/coursematerials/${id}`);
    return response.data;
  },

  create: async (formData) => {
    const response = await apiClient.post('/coursematerials', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  update: async (id, formData) => {
    const response = await apiClient.put(`/coursematerials/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  delete: async (id) => {
    const response = await apiClient.delete(`/coursematerials/${id}`);
    return response.data;
  },
};
