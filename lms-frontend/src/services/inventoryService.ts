import api from './api';

interface NewItemData {
  name: string;
  description: string;
  type: 'UNIFORM' | 'STATIONERY';
  price: number;
  stock: number;
}

// Updated to accept an optional type filter
export const getInventoryItems = async (type?: 'UNIFORM' | 'STATIONERY') => {
  const token = localStorage.getItem('token');
  const response = await api.get('/inventory', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    params: { type }, // Pass the type as a query parameter
  });
  return response.data;
};

export const addInventoryItem = async (itemData: NewItemData) => {
  const token = localStorage.getItem('token');
  const response = await api.post('/inventory', itemData, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};