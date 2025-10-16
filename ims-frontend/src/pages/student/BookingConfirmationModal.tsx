import { useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import styles from './BookingConfirmationModal.module.scss';

interface Item { id: string; name: string; price: number; }
interface Order { orderId: string; /* other fields can be added here */ }
interface ModalProps {
  item: Item;
  onClose: () => void;
  onBookingSuccess: (order: Order) => void;
}

const BookingConfirmationModal = ({ item, onClose, onBookingSuccess }: ModalProps) => {
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    setLoading(true);
    try {
      const response = await axios.post('http://localhost:5000/api/orders', {
        items: [{ itemId: item.id, quantity }],
      });
      onBookingSuccess(response.data.order);
    } catch (err) {
      console.error("Booking Error:", err);
      if (axios.isAxiosError(err) && err.response) {
        toast.error(err.response.data.message || 'Booking failed.');
      } else {
        toast.error('An unexpected error occurred.');
      }
    } finally {
      setLoading(false);
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
          <input type="number" value={quantity} min="1" onChange={e => setQuantity(parseInt(e.target.value) || 1)} disabled={loading} />
        </div>
        <h4>Total: ${(item.price * quantity).toFixed(2)}</h4>
        <div className={styles.buttonGroup}>
          <button onClick={handleConfirm} className={styles.confirmButton} disabled={loading}>
            {loading ? 'Confirming...' : 'Confirm'}
          </button>
          <button onClick={onClose} className={styles.cancelButton} disabled={loading}>Cancel</button>
        </div>
      </div>
    </div>
  );
};

export default BookingConfirmationModal;