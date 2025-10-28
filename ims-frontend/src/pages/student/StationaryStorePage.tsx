import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import styles from '../../assets/scss/pages/student/StationaryStorePage.module.scss';
import Spinner from '../../components/common/Spinner';
import EmptyState from '../../components/common/EmptyState';
import { BsCartX } from 'react-icons/bs';
import BookingConfirmationModal from './BookingConfirmationModal';

interface Item {
  id: string;
  name: string;
  price: number;
  quantityInStock: number;
  category: 'STATIONARY' | 'UNIFORM' | 'OTHER';
}

interface Order {
  orderId: string;
}

type Category = 'STATIONARY' | 'UNIFORM';

const StationaryStorePage = () => {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<Category>('STATIONARY');
  const [bookingItem, setBookingItem] = useState<Item | null>(null);
  const navigate = useNavigate();

  const fetchItems = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:5000/api/inventory');
      setItems(response.data);
    } catch (err) {
      if (axios.isAxiosError(err) && err.response) {
        toast.error(err.response.data.message || 'Failed to load store items.');
      } else {
        toast.error('An unexpected error occurred.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const handleBookingSuccess = (order: Order) => {
    setBookingItem(null);
    toast.success(`Booking successful! Order ID: ${order.orderId}`);
    navigate(`/order/${order.orderId}`);
  };

  const filteredItems = items.filter(item => item.category === activeCategory);

  // --- New Render Function ---
  const renderStoreContent = () => {
    if (loading) {
      return (
        <div className={styles.spinnerContainer}>
          <Spinner />
        </div>
      );
    }
    if (filteredItems.length === 0) {
      return (
        <div className={styles.emptyGrid}>
          <EmptyState message={`No ${activeCategory.toLowerCase()} items found.`} icon={<BsCartX size={40} />} />
        </div>
      );
    }
    return filteredItems.map(item => (
      <div key={item.id} className={styles.itemCard}>
        <h3>{item.name}</h3>
        <p className={styles.price}>₹{item.price.toFixed(2)}</p>
        <p className={styles.stock}>{item.quantityInStock} in stock</p>
        <button
          onClick={() => setBookingItem(item)}
          disabled={item.quantityInStock === 0}
        >
          Book Now
        </button>
      </div>
    ));
  };

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

      <div className={styles.itemsGrid}>
        {renderStoreContent()} {/* <-- Call the new render function */}
      </div>

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