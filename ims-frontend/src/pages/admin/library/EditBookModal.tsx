import React, { useState, useEffect } from 'react';
import axios from 'axios';
import styles from '../EditTeacherModal.module.scss'; // Reuse styles

// The interface must include the 'id'
interface BookData {
  id: string;
  title: string;
  isbn: string;
  availableQuantity: number;
  totalQuantity: number;
  publishedDate: string;
}

interface EditBookModalProps {
  book: BookData;
  onClose: () => void;
  onBookUpdated: () => void;
}

const EditBookModal = ({ book, onClose, onBookUpdated }: EditBookModalProps) => {
  const [formData, setFormData] = useState({
    title: '',
    isbn: '',
    publishedDate: '',
    totalQuantity: 0,
    availableQuantity: 0,
  });
  const [error, setError] = useState('');

  useEffect(() => {
    if (book) {
      setFormData({
        title: book.title,
        isbn: book.isbn,
        // Format the date for the date input field (YYYY-MM-DD)
        publishedDate: new Date(book.publishedDate).toISOString().split('T')[0],
        totalQuantity: book.totalQuantity,
        availableQuantity: book.availableQuantity,
      });
    }
  }, [book]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseInt(value) || 0 : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      // The error happens here if book.id doesn't exist on the type
      await axios.put(`http://localhost:5000/api/books/${book.id}`, formData);
      onBookUpdated();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update book.');
    }
  };

  return (
    <div className={styles.modalBackdrop}>
      <div className={styles.modalContent}>
        <h2>Edit Book</h2>
        <form onSubmit={handleSubmit}>
          <label>Title</label>
          <input type="text" name="title" value={formData.title} onChange={handleChange} required />
          <label>ISBN</label>
          <input type="text" name="isbn" value={formData.isbn} onChange={handleChange} required />
          <label>Published Date</label>
          <input type="date" name="publishedDate" value={formData.publishedDate} onChange={handleChange} required />
          <label>Total Quantity</label>
          <input type="number" name="totalQuantity" value={formData.totalQuantity} min="0" onChange={handleChange} required />
          <label>Available Quantity</label>
          <input type="number" name="availableQuantity" value={formData.availableQuantity} min="0" onChange={handleChange} required />
          {error && <p className={styles.error}>{error}</p>}
          <div className={styles.buttonGroup}>
            <button type="submit">Save Changes</button>
            <button type="button" onClick={onClose}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditBookModal;