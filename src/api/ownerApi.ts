import api from '@/api';

export const ownerApi = {
  // Statistics
  getStats: (venueId?: string | number) => api.get('/owner/stats', { params: { venue_id: venueId } }),
  getAnalytics: (params?: { venue_id?: string | number; start_date?: string; end_date?: string }) => api.get('/owner/analytics', { params }),
  getCashflow: () => api.get('/owner/cashflow').then(res => res.data),
  
  // Venue Management
  getVenues: () => api.get('/owner/venues'),
  getVenue: (id: number | string) => api.get(`/owner/venues/${id}`),
  createVenue: (data: any) => api.post('/owner/venues', data),
  updateVenue: (id: number | string, data: any) => api.put(`/owner/venues/${id}`, data),
  getReports: (venueId: number | string, params?: any) => api.get(`/owner/venues/${venueId}/reports`, { params }),
  
  // Court Management
  getCourts: (venueId: number | string) => api.get(`/owner/venues/${venueId}/courts`),
  createCourt: (venueId: number | string, data: any) => api.post(`/owner/venues/${venueId}/courts`, data),
  updateCourt: (venueId: number | string, id: number | string, data: any) => api.put(`/owner/venues/${venueId}/courts/${id}`, data),
  deleteCourt: (venueId: number | string, id: number | string) => api.delete(`/owner/venues/${venueId}/courts/${id}`),
  
  // Booking Management
  getBookings: (params?: any) => api.get('/owner/bookings', { params }),
  getBookingDetail: (id: number | string) => api.get(`/owner/bookings/${id}`),
  confirmBookingPayment: (id: number | string) => api.post(`/bookings/${id}/confirm-payment`),
  
  // Staff Management
  getStaffs: (venueId: number | string) => api.get(`/owner/venues/${venueId}/staffs`),
  createStaff: (venueId: number | string, data: any) => api.post(`/owner/venues/${venueId}/staffs`, data),
  updateStaff: (id: number | string, data: any) => api.put(`/owner/staffs/${id}`, data),
  updateStaffPassword: (id: number | string, data: { password: string }) => api.patch(`/owner/staffs/${id}/password`, data),
  
  // Check-in (for Staff/Owner)
  checkIn: (bookingCode: string) => api.post('/staff/bookings/checkin', { booking_code: bookingCode }),

  // Reviews
  getVenueReviews: (venueId: number | string, params?: any) => api.get(`/owner/venues/${venueId}/reviews`, { params }),

  // Image Upload
  uploadVenueImage: (venueId: number | string, file: File) => {
    const formData = new FormData();
    formData.append('image', file);
    formData.append('venue_id', String(venueId));
    return api.post('/owner/venues/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },

  deleteVenueImage: (venueId: number | string, imageUrl: string) => 
    api.delete('/owner/venues/image', { data: { venue_id: venueId, imageUrl } }),
};
