import api from './api';

export const getDashboardStats = async () => {
  const token = localStorage.getItem('token');
  const response = await api.get('/dashboard/stats', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

export const getAdminDashboardStats = async () => {
  const token = localStorage.getItem('token');
  const response = await api.get('/dashboard/admin-stats', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};