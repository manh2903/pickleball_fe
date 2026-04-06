import api from '@/api';

export const withdrawalApi = {
  // Owner
  getMyWithdrawals: (params?: any) => 
    api.get('/withdrawals/my', { params }),
  requestWithdrawal: (data: any) => 
    api.post('/withdrawals', data),
  
  // Admin
  getAllRequests: (params?: any) => 
    api.get('/withdrawals/admin/all', { params }),
  updateStatus: (id: number | string, data: any) => 
    api.put(`/withdrawals/admin/${id}`, data),
};
