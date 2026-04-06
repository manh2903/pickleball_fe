import api from '@/api';

export interface VenueFilter {
  city?: string;
  district?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export const venueApi = {
  getVenues: (params: VenueFilter) => api.get('/venues', { params }),
  getVenueById: (id: string | number) => api.get(`/venues/${id}`),
};
