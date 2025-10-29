import React, { useState, FormEvent } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import styles from '../../../assets/scss/pages/admin/AdminPages.module.scss'; // 1. Corrected path to generic modal styles

interface BookData { id: string; title: string; }
interface CheckoutModalProps {
  book: BookData;
  onClose: () => void;
  onCheckoutSuccess: () => void;
}

const CheckoutModal = ({ book, onClose, onCheckoutSuccess }: CheckoutModalProps) => {
  const [sID, setSID] = useState(''); // 2. Changed state to sID
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 14); // 14-day loan

    try {
      await axios.post('http://localhost:5000/api/loans/checkout', {
        bookId: book.id,
        userIdentifier: sID, // 3. Send sID as userIdentifier
        dueDate: dueDate.toISOString(),
      });
      toast.success('Book checked out successfully!');
      onCheckoutSuccess();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to check out book.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.modalBackdrop}>
      <div className={styles.modalContent}>
        <h2>Checkout: {book.title}</h2>
        <form onSubmit={handleSubmit}>
          <label>User SID</label>
          <input
            type="text"
            placeholder="Enter 7-digit SID..."
            value={sID}
            onChange={(e) => setSID(e.target.value)}
            required
            disabled={loading}
          />
          <div className={styles.buttonGroup}>
            <button type="submit" disabled={loading}>
              {loading ? 'Processing...' : 'Confirm Checkout'}
            </button>
            <button type="button" onClick={onClose} disabled={loading}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CheckoutModal;