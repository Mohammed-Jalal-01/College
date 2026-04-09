import apiClient from './apiClient';

export const authService = {
  register: async (data) => {
    const response = await apiClient.post('/auth/register', data);
    return response.data;
  },

  login: async (credentials) => {
    const response = await apiClient.post('/auth/login', credentials);
    return response.data;
  },

  addStudentInfo: async (studentInfo) => {
    const response = await apiClient.post('/auth/student-info', studentInfo);
    return response.data;
  },

  deleteAccount: async () => {
    const response = await apiClient.delete('/auth/account');
    return response.data;
  },
};
