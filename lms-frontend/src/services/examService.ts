import api from './api';

export const getExams = async () => {
  const token = localStorage.getItem('token');
  const response = await api.get('/exams', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

export const registerForExam = async (examId: string) => {
  const token = localStorage.getItem('token');
  const response = await api.post(`/exams/${examId}/register`, {}, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

export const getMyRegistrations = async () => {
  const token = localStorage.getItem('token');
  const response = await api.get('/exams/my-registrations', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};