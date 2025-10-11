import React, { useState } from 'react';
import axios from 'axios';
import styles from './BookingConfirmationModal.module.scss';

interface Item { id: string; name: string; price: number; }
interface ModalProps {
  item: Item;
  onClose: () => void;
  onBookingSuccess: (order: any) => void;
}

const BookingConfirmationModal = ({ item, onClose, onBookingSuccess }: ModalProps) => {
  const [quantity, setQuantity] = useState(1);
  const [error, setError] = useState('');

  const handleConfirm = async () => {
    try {
      const response = await axios.post('http://localhost:5000/api/orders', {
        items: [{ itemId: item.id, quantity }],
      });
      onBookingSuccess(response.data.order);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Booking failed.');
    }
  };

  return (
    <div className={styles.modalBackdrop}>
      <div className={styles.modalContent}>
        <h2>Confirm Booking</h2>
        <h3>{item.name}</h3>
        <p>Price: ${item.price.toFixed(2)}</p>
        <div className={styles.quantity}>
          <label>Quantity:</label>
          <input type="number" value={quantity} min="1" onChange={e => setQuantity(parseInt(e.target.value) || 1)} />
        </div>
        <h4>Total: ${(item.price * quantity).toFixed(2)}</h4>
        {error && <p className={styles.error}>{error}</p>}
        <div className={styles.buttonGroup}>
          <button onClick={handleConfirm} className={styles.confirmButton}>Confirm</button>
          <button onClick={onClose} className={styles.cancelButton}>Cancel</button>
        </div>
      </div>
    </div>
  );
};

export default BookingConfirmationModal;