import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import styles from './OrderInvoicePage.module.scss';

// --- Interfaces for the invoice data structure ---
interface OrderItem {
  id: string;
  quantity: number;
  priceAtTimeOfPurchase: number;
  item: {
    name: string;
  };
}

interface InvoiceData {
  orderId: string;
  createdAt: string;
  totalAmount: number;
  user: {
    name: string;
  };
  items: OrderItem[];
}

const OrderInvoicePage = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const [invoice, setInvoice] = useState<InvoiceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (orderId) {
      setLoading(true);
      axios.get(`http://localhost:5000/api/orders/${orderId}`)
        .then(res => setInvoice(res.data))
        .catch(err => {
          console.error(err);
          setError(err.response?.data?.message || 'Failed to load invoice.');
        })
        .finally(() => setLoading(false));
    }
  }, [orderId]);

  if (loading) return <p>Loading invoice...</p>;
  if (error) return <p style={{ color: 'red' }}>{error}</p>;
  if (!invoice) return <p>No invoice data found.</p>;

  return (
    <div className={styles.pageContainer}>
      <div className={styles.invoiceBox}>
        <div className={styles.header}>
          <h1>Invoice</h1>
          <div className={styles.headerDetails}>
            <p><strong>Order ID:</strong> {invoice.orderId}</p>
            <p><strong>Date:</strong> {new Date(invoice.createdAt).toLocaleDateString()}</p>
          </div>
        </div>
        <div className={styles.customerDetails}>
          <p><strong>Invoice For:</strong></p>
          <p>{invoice.user.name}</p>
        </div>
        <table className={styles.itemsTable}>
          <thead>
            <tr>
              <th>Product</th>
              <th>Quantity</th>
              <th>Price</th>
              <th>Subtotal</th>
            </tr>
          </thead>
          <tbody>
            {invoice.items.map(item => (
              <tr key={item.id}>
                <td>{item.item.name}</td>
                <td>{item.quantity}</td>
                <td>${item.priceAtTimeOfPurchase.toFixed(2)}</td>
                <td>${(item.quantity * item.priceAtTimeOfPurchase).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className={styles.totalSection}>
          <strong>Total: ${invoice.totalAmount.toFixed(2)}</strong>
        </div>
      </div>
      <div className={styles.buttonRow}>
        <Link to="/my-orders" className={styles.backButton}>Back to My Orders</Link>
        <button className={styles.printButton} onClick={() => window.print()}>Print Invoice</button>
      </div>
    </div>
  );
};

export default OrderInvoicePage;