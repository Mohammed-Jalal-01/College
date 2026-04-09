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

  create: async (data) => {
    const response = await apiClient.post('/news', data);
    return response.data;
  },

  update: async (id, data) => {
    const response = await apiClient.put(`/news/${id}`, data);
    return response.data;
  },

  delete: async (id) => {
    const response = await apiClient.delete(`/news/${id}`);
    return response.data;
  },
};
