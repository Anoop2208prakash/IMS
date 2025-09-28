import api from './api';

export const submitApplication = async (formData: FormData) => {
  const response = await api.post('/admissions/apply', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export const getApplications = async () => {
  const token = localStorage.getItem('token');
  const response = await api.get('/admissions', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};