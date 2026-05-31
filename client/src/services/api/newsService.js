import apiClient from './apiClient';

export const newsService = {
  getAll: async () => {
    const response = await apiClient.get('/news');
    return response.data;
  },

  getFeatured: async () => {
    const response = await apiClient.get('/news/featured');
    return response.data;
  },

  getById: async (id) => {
    const response = await apiClient.get(`/news/${id}`);
    return response.data;
  },

  create: async (formData) => {
    const response = await apiClient.post('/news', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  update: async (id, formData) => {
    const response = await apiClient.put(`/news/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  delete: async (id) => {
    const response = await apiClient.delete(`/news/${id}`);
    return response.data;
  },
};
