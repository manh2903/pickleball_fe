import api from '@/api';

export const paymentApi = {
  getMyPayments: () => api.get('/payments/my').then(res => res.data),
  createVNPayUrl: (bookingId: number | string) => 
    api.post('/payments/create-vnpay-url', { bookingId }),
};
