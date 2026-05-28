import apiClient from './apiClient';

export const referenceDataService = {
  getBranches: async () => {
    const response = await apiClient.get('/branches');
    return response.data;
  },

  getStudyTypes: async () => {
    const response = await apiClient.get('/studytypes');
    return response.data;
  },

  getStudyTypesForRegistration: async () => {
    const response = await apiClient.get('/studytypes?registrationOnly=true');
    return response.data;
  },

  getStages: async () => {
    const response = await apiClient.get('/stages');
    return response.data;
  },
};
