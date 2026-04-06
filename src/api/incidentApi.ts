import api from '@/api';

export const incidentApi = {
  getVenueIncidents: (venueId: number | string, params?: any) => 
    api.get(`/incidents/venue/${venueId}`, { params }),
  
  createIncident: (data: any) => 
    api.post('/incidents', data),
  
  updateStatus: (id: number | string, data: { status: string; resolution_notes?: string }) => 
    api.put(`/incidents/${id}/status`, data),
};
