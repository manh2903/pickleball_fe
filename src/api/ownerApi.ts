import api from '@/api';

export const ownerApi = {
  // Statistics
  getStats: (venueId?: string | number) => api.get('/owner/stats', { params: { venue_id: venueId } }),
  
  // Venue Management
  getVenues: () => api.get('/owner/venues'),
  createVenue: (data: any) => api.post('/owner/venues', data),
  updateVenue: (id: number | string, data: any) => api.put(`/owner/venues/${id}`, data),
  
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
  
  // Check-in (for Staff/Owner)
  checkIn: (bookingCode: string) => api.post('/staff/bookings/checkin', { booking_code: bookingCode }),
};
