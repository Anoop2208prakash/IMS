import { useState, useEffect, ChangeEvent } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import styles from '../../assets/scss/pages/student/MyOrdersPage.module.scss';
import Spinner from '../../components/common/Spinner';
import EmptyState from '../../components/common/EmptyState';
import Pagination from '../../components/common/Pagination'; // 1. Import Pagination
import { BsBoxSeam } from 'react-icons/bs';

type OrderStatus = 'PENDING' | 'COMPLETED' | 'CANCELLED';

interface Order {
  id: string;
  orderId: string;
  createdAt: string;
  totalAmount: number;
  status: OrderStatus;
}

const MyOrdersPage = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  // 2. Add state for Pagination
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  useEffect(() => {
    const fetchMyOrders = async () => {
      try {
        setLoading(true);
        const response = await axios.get('http://localhost:5000/api/orders/my-orders');
        setOrders(response.data);
      } catch (err) {
        if (axios.isAxiosError(err) && err.response) {
          toast.error(err.response.data.message || 'Failed to fetch your orders.');
        } else {
          toast.error('An unexpected error occurred.');
        }
      } finally {
        setLoading(false);
      }
    };
    fetchMyOrders();
  }, []);

  // 3. Add pagination handlers
  const handleRowsPerPageChange = (event: ChangeEvent<HTMLSelectElement>) => {
    setRowsPerPage(Number.parseInt(event.target.value, 10));
    setPage(0);
  };

  const currentItems = orders.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  const renderTableBody = () => {
    if (loading) {
      return (
        <tr>
          <td colSpan={5} className={styles.spinnerCell}>
            <Spinner />
          </td>
        </tr>
      );
    }
    if (orders.length === 0) {
      return (
        <tr>
          <td colSpan={5}>
            <EmptyState message="You have not placed any orders yet." icon={<BsBoxSeam size={40} />} />
          </td>
        </tr>
      );
    }
    // 4. Map over currentItems
    return currentItems.map(order => (
      <tr key={order.id}>
        <td>{order.orderId}</td>
        <td>{new Date(order.createdAt).toLocaleDateString()}</td>
        <td>₹{order.totalAmount.toFixed(2)}</td>
        <td>
          <span className={`${styles.status} ${styles[order.status.toLowerCase()]}`}>
            {order.status}
          </span>
        </td>
        <td>
          <Link to={`/order/${order.orderId}`} className={styles.viewButton}>
            View Invoice
          </Link>
        </td>
      </tr>
    ));
  };

  return (
    <div className={styles.container}>
      <h2>My Orders</h2>
      <table className={styles.ordersTable}>
        <thead>
          <tr>
            <th>Order ID</th>
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

      {/* 5. Add Pagination component */}
      <Pagination
        count={orders.length}
        page={page}
        rowsPerPage={rowsPerPage}
        onPageChange={setPage}
        onRowsPerPageChange={handleRowsPerPageChange}
      />
    </div>
  );
};

export default MyOrdersPage;