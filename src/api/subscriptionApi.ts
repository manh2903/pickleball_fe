import api from '@/api';

export const subscriptionApi = {
  getPlans: () => api.get('/subscriptions/plans').then(res => res.data),
  getMySubscription: () => api.get('/subscriptions/my').then(res => res.data),
  purchasePlan: (optionId: number) => api.post('/subscriptions/purchase', { option_id: optionId }).then(res => res),
  
  // Admin only
  adminGetPlans: () => api.get('/subscriptions/admin/plans').then(res => res.data),
  adminCreateOption: (data: any) => api.post('/subscriptions/admin/options', data).then(res => res.data),
  adminUpdateOption: (id: number | string, data: any) => api.put(`/subscriptions/admin/options/${id}`, data).then(res => res.data),
  adminDeleteOption: (id: number | string) => api.delete(`/subscriptions/admin/options/${id}`).then(res => res.data),
};
