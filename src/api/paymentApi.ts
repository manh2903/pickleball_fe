import api from '@/api';

export const paymentApi = {
  createVNPayUrl: (bookingId: number | string) => 
    api.post('/payments/create-vnpay-url', { bookingId }),
};
