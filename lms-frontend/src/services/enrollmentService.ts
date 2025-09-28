import api from './api';

export const getMyGrades = async () => {
  const token = localStorage.getItem('token');
  const response = await api.get('/enrollments/my-grades', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};