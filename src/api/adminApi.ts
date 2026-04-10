import api from '@/api';

export const adminApi = {
  getStats: () => api.get('/admin/stats'),
  getUsers: (params?: any) => api.get('/admin/users', { params }),
  updateUserStatus: (id: number | string, status: string) => api.put(`/users/${id}/status`, { status }),
  
  getVenues: (params?: any) => api.get('/admin/venues', { params }),
  updateVenueStatus: (id: number | string, status: string) => api.put(`/venues/${id}/status`, { status }),
  setVenueCommission: (id: number | string, rate: number) => api.put(`/venues/${id}/commission`, { commission_rate: rate }),

  getSettings: () => api.get('/admin/settings'),
  updateSetting: (key: string, data: { value: string, description?: string }) => api.put(`/admin/settings/${key}`, data),

  // Promotions (Platform-wide and management)
  getCoupons: (params?: any) => api.get('/coupons/admin', { params }),
  createCoupon: (data: any) => api.post('/coupons/admin', data),
  updateCouponStatus: (id: number | string, status: string) => api.put(`/coupons/admin/${id}/status`, { status }),
};
