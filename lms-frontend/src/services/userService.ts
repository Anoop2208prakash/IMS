import api from './api';
import type { Role } from '../types';

interface NewUserData {
  name: string;
  email: string;
  password?: string;
  role: Role;
}

interface UpdateUserData {
  name: string;
  email: string;
  role: Role;
  password?: string; 
}

interface PasswordData {
  oldPassword: string;
  newPassword: string;
}

export const getUserProfile = async () => {
  const token = localStorage.getItem('token');
  if (!token) throw new Error('No token found');

  const response = await api.get('/users/profile', {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

export const updateUserProfile = async (profileData: { name: string }) => {
  const token = localStorage.getItem('token');
  if (!token) throw new Error('No token found');

  const response = await api.put('/users/profile', profileData, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

export const getAllUsers = async () => {
  const token = localStorage.getItem('token');
  if (!token) throw new Error('No token found');
  
  const response = await api.get('/users', {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

export const createUser = async (userData: NewUserData) => {
  const token = localStorage.getItem('token');
  const response = await api.post('/users', userData, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

export const updateUser = async (userId: string, userData: UpdateUserData) => {
  const token = localStorage.getItem('token');
  const response = await api.put(`/users/${userId}`, userData, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

export const deleteUser = async (userId: string) => {
  const token = localStorage.getItem('token');
  await api.delete(`/users/${userId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const updateMyPassword = async (passwordData: PasswordData) => {
  const token = localStorage.getItem('token');
  const response = await api.patch('/users/profile/password', passwordData, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

export const uploadProfileImage = async (formData: FormData) => {
  const token = localStorage.getItem('token');
  const response = await api.post('/users/profile/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

export const getMyStudentProfile = async () => {
  const token = localStorage.getItem('token');
  const response = await api.get('/users/student-profile', {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};