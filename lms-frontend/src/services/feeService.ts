import api from './api';

export const getUserFees = async (userId: string) => {
  const token = localStorage.getItem('token');
  const response = await api.get(`/fees/user/${userId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

interface NewFeeData {
  userId: string;
  courseId: string;
  amount: number;
  dueDate: string;
}

export const createFee = async (feeData: NewFeeData) => {
  const token = localStorage.getItem('token');
  const response = await api.post('/fees', feeData, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

export const recordPayment = async (paymentData: { feeId: string; amount: number }) => {
  const token = localStorage.getItem('token');
  const response = await api.post('/fees/payment', paymentData, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};