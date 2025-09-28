import api from './api';

// Define a type for the new book data
interface NewBookData {
  title: string;
  authorName: string;
  isbn: string;
  publishedDate: string;
  totalQuantity: string;
}

export const getBooks = async (searchTerm: string = '', page: number = 1) => {
  const token = localStorage.getItem('token');
  const response = await api.get('/books', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    params: {
      search: searchTerm,
      page: page,
      pageSize: 10,
    },
  });
  return response.data;
};

export const addBook = async (bookData: NewBookData) => {
  const token = localStorage.getItem('token');
  const response = await api.post('/books', bookData, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

export const issueBook = async (issueData: { isbn: string; userEmail: string }) => {
  const token = localStorage.getItem('token');
  const response = await api.post('/loans/issue', issueData, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};
  
export const returnBook = async (returnData: { isbn: string }) => {
  const token = localStorage.getItem('token');
  const response = await api.post('/loans/return', returnData, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

// Add this missing function
export const getMyLoans = async () => {
  const token = localStorage.getItem('token');
  const response = await api.get('/loans/my-loans', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

export const deleteBook = async (bookId: string) => {
  const token = localStorage.getItem('token');
  const response = await api.delete(`/books/${bookId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};