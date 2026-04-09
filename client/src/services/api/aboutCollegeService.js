import apiClient from './apiClient';

export const aboutCollegeService = {
  get: async () => {
    const response = await apiClient.get('/aboutcollege');
    return response.data;
  },

  update: async (data) => {
    const response = await apiClient.put('/aboutcollege', data);
    return response.data;
  },
};
