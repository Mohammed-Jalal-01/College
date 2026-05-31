import apiClient from './apiClient';

export const activitiesService = {
  getAll: async () => {
    const response = await apiClient.get('/activities');
    return response.data;
  },

  getById: async (id) => {
    const response = await apiClient.get(`/activities/${id}`);
    return response.data;
  },

  create: async (formData) => {
    const response = await apiClient.post('/activities', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  update: async (id, formData) => {
    const response = await apiClient.put(`/activities/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  delete: async (id) => {
    const response = await apiClient.delete(`/activities/${id}`);
    return response.data;
  },
};
