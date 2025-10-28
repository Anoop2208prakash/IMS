import { useState, useEffect, ChangeEvent } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import styles from '../../assets/scss/pages/admin/AdminPages.module.scss';
import Spinner from '../../components/common/Spinner';
import EmptyState from '../../components/common/EmptyState';
import Pagination from '../../components/common/Pagination';
import Searchbar from '../../components/common/Searchbar';
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
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

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
      // Refetch to ensure data consistency (e.g., if un-cancelling failed due to stock)
      fetchOrders();
    } catch (err) {
      console.error("Update Status Error:", err);
      if (axios.isAxiosError(err) && err.response) {
        toast.error(err.response.data.message || 'Failed to update status.');
      } else {
        toast.error('Failed to update status.');
      }
      setOrders(originalOrders); // Revert UI on error
    }
  };
  
  // --- Filtering & Pagination ---
  const filteredOrders = orders.filter(order =>
    order.orderId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.status.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const currentItems = filteredOrders.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  const handleRowsPerPageChange = (event: ChangeEvent<HTMLSelectElement>) => {
    setRowsPerPage(Number.parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setPage(0);
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
    if (filteredOrders.length === 0) {
      return (
        <tr>
          <td colSpan={6}>
            <EmptyState 
              message={searchTerm ? `No orders match "${searchTerm}"` : "No orders have been placed yet."} 
              icon={<BsBoxSeam size={40} />} 
            />
          </td>
        </tr>
      );
    }
    return currentItems.map(order => (
      <tr key={order.id}>
        <td>{order.orderId}</td>
        <td>{order.user.name}</td>
        <td>{new Date(order.createdAt).toLocaleDateString()}</td>
        <td>₹{order.totalAmount.toFixed(2)}</td>
        <td>
          <select 
            value={order.status} 
            onChange={(e) => handleStatusChange(order.id, e.target.value as OrderStatus)}
            className={styles.statusSelect}
            disabled={order.status === 'COMPLETED'} // Only disable if COMPLETED
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
      
      <div className={styles.searchContainer}>
        <Searchbar
          value={searchTerm}
          onChange={handleSearchChange}
          placeholder="Search by Order ID, Customer, or Status..."
        />
      </div>

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

      <Pagination
        count={filteredOrders.length}
        page={page}
        rowsPerPage={rowsPerPage}
        onPageChange={setPage}
        onRowsPerPageChange={handleRowsPerPageChange}
      />
    </div>
  );
};

export default ViewOrdersPage;