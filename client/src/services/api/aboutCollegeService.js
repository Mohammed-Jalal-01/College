import apiClient from './apiClient';

export const aboutCollegeService = {
  getAll: async () => {
    const response = await apiClient.get('/aboutcollege');
    return response.data;
  },

  create: async (formData) => {
    const response = await apiClient.post('/aboutcollege', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  update: async (id, formData) => {
    const response = await apiClient.put(`/aboutcollege/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  delete: async (id) => {
    const response = await apiClient.delete(`/aboutcollege/${id}`);
    return response.data;
  },
};
