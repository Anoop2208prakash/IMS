import type { LoginUserData, RegisterUserData } from '../types';
import api from './api';
// Make sure to import both types

export const registerUser = async (userData: RegisterUserData) => {
  const response = await api.post('/auth/register', userData);
  return response.data;
};

// Add this new function
export const loginUser = async (userData: LoginUserData) => {
  const response = await api.post('/auth/login', userData);
  return response.data;
};