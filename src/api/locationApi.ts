import api from '@/api';

export const locationApi = {
  getProvinces: () => api.get('/locations/provinces'),
  getWards: (provinceMa: string) => api.get(`/locations/provinces/${provinceMa}/wards`),
};
