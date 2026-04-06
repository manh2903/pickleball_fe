import api from '@/api';

export const reviewApi = {
  getVenueReviews: (venueId: string | number, params?: any) => 
    api.get(`/reviews/venue/${venueId}`, { params }),
  
  createReview: (data: { booking_id: number; rating: number; comment: string }) => 
    api.post('/reviews', data),
};
