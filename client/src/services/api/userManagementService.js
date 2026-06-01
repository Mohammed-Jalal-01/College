import apiClient from './apiClient';

export const userManagementService = {
  getAllUsers: async () => {
    const response = await apiClient.get('/usermanagement/users');
    return response.data;
  },

  getUserStats: async () => {
    const response = await apiClient.get('/usermanagement/stats');
    return response.data;
  },

  promoteToAdmin: async (userId) => {
    const response = await apiClient.post('/usermanagement/promote-to-admin', { userId });
    return response.data;
  },

  demoteToRegular: async (userId) => {
    const response = await apiClient.post('/usermanagement/demote-to-regular', { userId });
    return response.data;
  },

  transferSuperAdmin: async (newSuperAdminId) => {
    const response = await apiClient.post('/usermanagement/transfer-superadmin', { newSuperAdminId });
    return response.data;
  },

  getFacultyUsers: async () => {
    const response = await apiClient.get('/usermanagement/faculty-users');
    return response.data;
  },

  getDashboardStats: async () => {
    const response = await apiClient.get('/usermanagement/dashboard-stats');
    return response.data;
  },
};
