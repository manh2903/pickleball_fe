import axiosInstance from './index';

export const notificationApi = {
  getNotifications: (params?: { page?: number; limit?: number }) =>
    axiosInstance.get('/notifications', { params }),

  markAsRead: (id: number) =>
    axiosInstance.put(`/notifications/${id}/read`),

  markAllAsRead: () =>
    axiosInstance.put('/notifications/read-all'),

  deleteNotification: (id: number) =>
    axiosInstance.delete(`/notifications/${id}`),
};
