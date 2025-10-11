import { useState, useEffect } from 'react';
import axios from 'axios';
import styles from '../AdminPages.module.scss';

interface LoanData {
  id: string;
  checkoutDate: string;
  dueDate: string;
  user: { name: string; };
  book: { title: string; };
}

const ManageLoansPage = () => {
  const [activeLoans, setActiveLoans] = useState<LoanData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchActiveLoans = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/loans/active');
        setActiveLoans(response.data);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to fetch active loans.');
      } finally {
        setLoading(false);
      }
    };
    fetchActiveLoans();
  }, []);

  const handleReturn = async (loanId: string) => {
    if (!window.confirm('Are you sure you want to mark this book as returned?')) return;
    try {
      await axios.post('http://localhost:5000/api/loans/return', { loanId });
      // Update the UI immediately by removing the returned loan from the list
      setActiveLoans(currentLoans => currentLoans.filter(loan => loan.id !== loanId));
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to process return.');
    }
  };

  if (loading) return <p>Loading active loans...</p>;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2>Manage Active Loans</h2>
      </div>

      {error && <p className={styles.error}>{error}</p>}

      <table className={styles.table}>
        <thead>
          <tr>
            <th>Book Title</th>
            <th>User Name</th>
            <th>Checkout Date</th>
            <th>Due Date</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {activeLoans.map((loan) => (
            <tr key={loan.id}>
              <td>{loan.book.title}</td>
              <td>{loan.user.name}</td>
              <td>{new Date(loan.checkoutDate).toLocaleDateString()}</td>
              <td>{new Date(loan.dueDate).toLocaleDateString()}</td>
              <td>
                <button
                  onClick={() => handleReturn(loan.id)}
                  className={`${styles.button} ${styles.returnButton}`}
                >
                  Mark as Returned
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ManageLoansPage;