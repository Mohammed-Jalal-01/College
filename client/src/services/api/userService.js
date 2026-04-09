import apiClient from './apiClient';

export const userService = {
  searchByDisplayId: async (displayId) => {
    const response = await apiClient.get(`/users/search/${displayId}`);
    return response.data;
  },

  getProfile: async (displayId) => {
    const response = await apiClient.get(`/users/profile/${displayId}`);
    return response.data;
  },
};
