import api from '@/api';

export const authApi = {
  login: (data: any) => api.post('/auth/login', data),
  register: (data: any) => api.post('/auth/register', data),
  registerOwner: (data: any) => api.post('/auth/register-owner', data),
  getMe: () => api.get('/auth/me'),
  updateMe: (data: any) => api.put('/auth/me', data),
  changePassword: (data: any) => api.post('/auth/change-password', data),
  logout: () => api.post('/auth/logout'),
};
