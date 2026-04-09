import apiClient from './apiClient';

export const updatesService = {
  getAll: async () => {
    const response = await apiClient.get('/updates');
    return response.data;
  },

  getById: async (id) => {
    const response = await apiClient.get(`/updates/${id}`);
    return response.data;
  },

  create: async (data) => {
    const response = await apiClient.post('/updates', data);
    return response.data;
  },

  update: async (id, data) => {
    const response = await apiClient.put(`/updates/${id}`, data);
    return response.data;
  },

  delete: async (id) => {
    const response = await apiClient.delete(`/updates/${id}`);
    return response.data;
  },
};
