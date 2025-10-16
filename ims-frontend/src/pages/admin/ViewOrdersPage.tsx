import { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import styles from './AdminPages.module.scss';
import Spinner from '../../components/common/Spinner';
import EmptyState from '../../components/common/EmptyState';
import { BsBoxSeam } from 'react-icons/bs';

type OrderStatus = 'PENDING' | 'COMPLETED' | 'CANCELLED';

interface Order {
  id: string;
  orderId: string;
  createdAt: string;
  totalAmount: number;
  status: OrderStatus;
  user: { name: string; };
}

const ViewOrdersPage = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:5000/api/orders/all');
      setOrders(response.data);
    } catch (err) {
      console.error("Fetch Orders Error:", err);
      if (axios.isAxiosError(err) && err.response) {
        toast.error(err.response.data.message || 'Failed to fetch orders.');
      } else {
        toast.error('An unexpected error occurred.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleStatusChange = async (orderId: string, newStatus: OrderStatus) => {
    const originalOrders = [...orders];
    setOrders(prevOrders =>
      prevOrders.map(order =>
        order.id === orderId ? { ...order, status: newStatus } : order
      )
    );

    try {
      await axios.put(`http://localhost:5000/api/orders/${orderId}/status`, { status: newStatus });
      toast.success('Order status updated!');
    } catch (err) {
      console.error("Update Status Error:", err); // Log the actual error
      toast.error('Failed to update status.');
      setOrders(originalOrders); // Revert UI on error
    }
  };
  
  const renderTableBody = () => {
    if (loading) {
      return (
        <tr>
          <td colSpan={6} className={styles.spinnerCell}>
            <Spinner />
          </td>
        </tr>
      );
    }
    if (orders.length === 0) {
      return (
        <tr>
          <td colSpan={6}>
            <EmptyState 
              message="No orders have been placed yet." 
              icon={<BsBoxSeam size={40} />} 
            />
          </td>
        </tr>
      );
    }
    return orders.map(order => (
      <tr key={order.id}>
        <td>{order.orderId}</td>
        <td>{order.user.name}</td>
        <td>{new Date(order.createdAt).toLocaleDateString()}</td>
        <td>${order.totalAmount.toFixed(2)}</td>
        <td>
          <select 
            value={order.status} 
            onChange={(e) => handleStatusChange(order.id, e.target.value as OrderStatus)}
            className={styles.statusSelect}
            disabled={order.status === 'COMPLETED' || order.status === 'CANCELLED'}
          >
            <option value="PENDING">Pending</option>
            <option value="COMPLETED">Completed</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </td>
        <td>
          <Link to={`/order/${order.orderId}`} className={`${styles.button} ${styles.viewButton}`}>
            View Details
          </Link>
        </td>
      </tr>
    ));
  };

  return (
    <div className={styles.container}>
      <h2>View All Orders</h2>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Order ID</th>
            <th>Customer Name</th>
            <th>Date</th>
            <th>Total Amount</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {renderTableBody()}
        </tbody>
      </table>
    </div>
  );
};

export default ViewOrdersPage;