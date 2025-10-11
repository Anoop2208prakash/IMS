import React, { useState } from 'react';
import axios from 'axios';
import styles from '../AddTeacherForm.module.scss';

interface AddBookFormProps {
  onBookAdded: () => void;
  onCancel: () => void;
}

const AddBookForm = ({ onBookAdded, onCancel }: AddBookFormProps) => {
  const [formData, setFormData] = useState({
    title: '',
    isbn: '',
    publishedDate: '',
    totalQuantity: 1,
  });
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseInt(value) : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await axios.post('http://localhost:5000/api/books', formData);
      onBookAdded();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to add book.');
    }
  };

  // 1. Create a variable to check if the form is valid
  const isFormValid =
    formData.title.trim() !== '' &&
    formData.isbn.trim() !== '' &&
    formData.publishedDate.trim() !== '' &&
    formData.totalQuantity > 0;

  return (
    <div className={styles.formContainer}>
      <h3>Add New Book</h3>
      <form onSubmit={handleSubmit}>
        <input type="text" name="title" placeholder="Book Title" value={formData.title} onChange={handleChange} required />
        <input type="text" name="isbn" placeholder="ISBN" value={formData.isbn} onChange={handleChange} required />
        <input type="date" name="publishedDate" placeholder="Published Date" value={formData.publishedDate} onChange={handleChange} required />
        <input type="number" name="totalQuantity" min="1" placeholder="Total Quantity" value={formData.totalQuantity} onChange={handleChange} required />
        {error && <p className={styles.error}>{error}</p>}
        <div className={styles.buttonGroup}>
          {/* 2. Disable the button if the form is not valid */}
          <button type="submit" disabled={!isFormValid}>Add Book</button>
          <button type="button" onClick={onCancel}>Cancel</button>
        </div>
      </form>
    </div>
  );
};

export default AddBookForm;