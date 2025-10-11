// src/components/admin/library/CheckoutModal.tsx
import React, { useState } from 'react';
import axios from 'axios';
import styles from '../EditTeacherModal.module.scss'; // Reuse styles

interface BookData { id: string; title: string; }
interface CheckoutModalProps {
  book: BookData;
  onClose: () => void;
  onCheckoutSuccess: () => void;
}

const CheckoutModal = ({ book, onClose, onCheckoutSuccess }: CheckoutModalProps) => {
  // Renamed state from userId to identifier
  const [identifier, setIdentifier] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      // Send 'identifier' in the request body
      await axios.post('http://localhost:5000/api/loans/checkout', {
        bookId: book.id,
        identifier: identifier,
      });
      onCheckoutSuccess();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to check out book.');
    }
  };

  return (
    <div className={styles.modalBackdrop}>
      <div className={styles.modalContent}>
        <h2>Checkout: {book.title}</h2>
        <form onSubmit={handleSubmit}>
          {/* Updated label and placeholder */}
          <label>Roll Number / Employee ID</label>
          <input
            type="text"
            placeholder="Enter borrower's ID..."
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            required
          />
          {error && <p className={styles.error}>{error}</p>}
          <div className={styles.buttonGroup}>
            <button type="submit">Confirm Checkout</button>
            <button type="button" onClick={onClose}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CheckoutModal;