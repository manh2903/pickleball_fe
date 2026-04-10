import api from '@/api';

export const systemApi = {
  getSettings: () => api.get('/system/settings'),
};
