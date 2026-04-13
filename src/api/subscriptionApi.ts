import api from '@/api';

export const subscriptionApi = {
  getPlans: () => api.get('/subscriptions/plans').then(res => res.data),
  getMySubscription: () => api.get('/subscriptions/my').then(res => res.data),
  purchasePlan: (planId: number) => api.post('/subscriptions/purchase', { plan_id: planId }).then(res => res.data),
};
