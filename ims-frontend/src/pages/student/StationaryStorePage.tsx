import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import styles from './StationaryStorePage.module.scss';
import BookingConfirmationModal from './BookingConfirmationModal';

interface Item {
  id: string;
  name: string;
  price: number;
  quantityInStock: number;
  category: 'STATIONARY' | 'UNIFORM' | 'OTHER';
}

type Category = 'STATIONARY' | 'UNIFORM';

const StationaryStorePage = () => {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [activeCategory, setActiveCategory] = useState<Category>('STATIONARY');
  const [bookingItem, setBookingItem] = useState<Item | null>(null);
  const navigate = useNavigate(); // Hook for navigation

  const fetchItems = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:5000/api/inventory');
      setItems(response.data);
    } catch (err) {
      console.error(err);
      setMessage('Failed to load store items.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const handleBookingSuccess = (order: any) => {
    setBookingItem(null); // Close the modal
    // Immediately navigate to the invoice page for the new order
    navigate(`/order/${order.orderId}`);
  };

  const filteredItems = items.filter(item => item.category === activeCategory);

  if (loading) return <p>Loading store...</p>;

  return (
    <div className={styles.storeContainer}>
      <h2>Stationary & Uniform Store</h2>
      
      <div className={styles.tabContainer}>
        <button
          className={activeCategory === 'STATIONARY' ? styles.active : ''}
          onClick={() => setActiveCategory('STATIONARY')}
        >
          Stationary
        </button>
        <button
          className={activeCategory === 'UNIFORM' ? styles.active : ''}
          onClick={() => setActiveCategory('UNIFORM')}
        >
          Uniforms
        </button>
      </div>

      {message && <p className={styles.message}>{message}</p>}

      <div className={styles.itemsGrid}>
        {filteredItems.length > 0 ? (
          filteredItems.map(item => (
            <div key={item.id} className={styles.itemCard}>
              <h3>{item.name}</h3>
              <p className={styles.price}>${item.price.toFixed(2)}</p>
              <p className={styles.stock}>{item.quantityInStock} in stock</p>
              <button
                onClick={() => setBookingItem(item)} // This opens the booking modal
                disabled={item.quantityInStock === 0}
              >
                Book Now
              </button>
            </div>
          ))
        ) : (
          <p className={styles.noData}>Data not found!</p>
        )}
      </div>

      {/* Conditionally render the booking modal */}
      {bookingItem && (
        <BookingConfirmationModal
          item={bookingItem}
          onClose={() => setBookingItem(null)}
          onBookingSuccess={handleBookingSuccess}
        />
      )}
    </div>
  );
};

export default StationaryStorePage;