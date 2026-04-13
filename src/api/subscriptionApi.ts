import api from '@/api';

export const subscriptionApi = {
  getPlans: () => api.get('/subscriptions/plans').then(res => res.data),
  getMySubscription: () => api.get('/subscriptions/my').then(res => res.data),
  purchasePlan: (optionId: number) => api.post('/subscriptions/purchase', { option_id: optionId }).then(res => res.data),
};
