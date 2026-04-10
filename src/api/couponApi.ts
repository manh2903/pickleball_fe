import api from '@/api';

export const couponApi = {
  getOwnerCoupons: (venueId?: string) => {
    return api.get('/coupons/owner', { params: { venue_id: venueId } });
  },
  
  createCoupon: (data: any) => {
    return api.post('/coupons/owner', data);
  },
  
  updateStatus: (id: number, status: string) => {
    return api.put(`/coupons/owner/${id}/status`, { status });
  },
  
  validateCoupon: (data: { code: string, venue_id: number, total_amount: number }) => {
    return api.post('/coupons/validate', data);
  }
};
