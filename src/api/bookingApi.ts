import api from '@/api';

export const bookingApi = {
  getAvailability: (params: { court_id?: number | string; venue_id?: number | string; date: string }) => 
    api.get('/bookings/availability', { params }),
  
  createBooking: (data: { 
    slot_id?: number; 
    slot_ids?: number[]; 
    coupon_code?: string; 
    notes?: string;
    payment_method?: 'vnpay' | 'cash';
    customer_name: string;
    customer_phone: string;
    customer_email: string;
  }) => 
    api.post('/bookings', data),
  
  getMyBookings: (params?: any) => 
    api.get('/bookings/my', { params }),
  
  getBookingById: (id: string | number) => 
    api.get(`/bookings/${id}`),
  
  cancelBooking: (id: string | number, reason?: string) => 
    api.post(`/bookings/${id}/cancel`, { cancel_reason: reason }),

  confirmPayment: (id: string | number) =>
    api.post(`/bookings/${id}/confirm-payment`),
  
  createWalkInBooking: (data: any) => 
    api.post('/bookings/walk-in', data),
};
