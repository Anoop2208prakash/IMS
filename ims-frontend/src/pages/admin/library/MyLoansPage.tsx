import { useState, useEffect } from 'react';
import axios from 'axios';
import styles from './MyLoansPage.module.scss';

interface Loan {
  id: string;
  checkoutDate: string;
  dueDate: string;
  returnDate: string | null;
  book: { title: string; };
}

const LoanStatus = ({ loan }: { loan: Loan }) => {
  const isOverdue = !loan.returnDate && new Date(loan.dueDate) < new Date();
  if (loan.returnDate) {
    return <span className={`${styles.status} ${styles.returned}`}>Returned</span>;
  }
  if (isOverdue) {
    return <span className={`${styles.status} ${styles.overdue}`}>Overdue</span>;
  }
  return <span className={`${styles.status} ${styles.active}`}>Active</span>;
};

const MyLoansPage = () => {
  const [loans, setLoans] = useState<Loan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchMyLoans = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/loans/my-loans');
        setLoans(response.data);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to fetch your loans.');
      } finally {
        setLoading(false);
      }
    };
    fetchMyLoans();
  }, []);

  if (loading) return <p>Loading your loan history...</p>;
  if (error) return <p style={{ color: 'red' }}>{error}</p>;

  return (
    <div className={styles.container}>
      <h2>My Loan History</h2>
      <table className={styles.loansTable}>
        <thead>
          <tr>
            <th>Book Title</th>
            <th>Checkout Date</th>
            <th>Due Date</th>
            <th>Return Date</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {loans.map(loan => (
            <tr key={loan.id}>
              <td>{loan.book.title}</td>
              <td>{new Date(loan.checkoutDate).toLocaleDateString()}</td>
              <td>{new Date(loan.dueDate).toLocaleDateString()}</td>
              <td>{loan.returnDate ? new Date(loan.returnDate).toLocaleDateString() : '—'}</td>
              <td><LoanStatus loan={loan} /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default MyLoansPage;