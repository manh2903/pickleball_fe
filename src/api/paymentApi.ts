import api from '@/api';

export const paymentApi = {
  getMyPayments: () => api.get('/payments/my').then(res => res.data),
};
