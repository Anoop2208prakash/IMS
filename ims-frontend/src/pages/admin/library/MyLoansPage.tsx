import { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import styles from './MyLoansPage.module.scss';
import { BsBookHalf } from 'react-icons/bs';
import Spinner from '../../../components/common/Spinner';
import EmptyState from '../../../components/common/EmptyState';

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

  useEffect(() => {
    const fetchMyLoans = async () => {
      try {
        setLoading(true);
        const response = await axios.get('http://localhost:5000/api/loans/my-loans');
        setLoans(response.data);
      } catch (err) {
        if (axios.isAxiosError(err) && err.response) {
          toast.error(err.response.data.message || 'Failed to fetch your loans.');
        } else {
          toast.error('An unexpected error occurred.');
        }
      } finally {
        setLoading(false);
      }
    };
    fetchMyLoans();
  }, []);

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
    if (loans.length === 0) {
      return (
        <tr>
          <td colSpan={5}>
            <EmptyState message="You have no loan history." icon={<BsBookHalf size={40} />} />
          </td>
        </tr>
      );
    }
    return loans.map(loan => (
      <tr key={loan.id}>
        <td>{loan.book.title}</td>
        <td>{new Date(loan.checkoutDate).toLocaleDateString()}</td>
        <td>{new Date(loan.dueDate).toLocaleDateString()}</td>
        <td>{loan.returnDate ? new Date(loan.returnDate).toLocaleDateString() : '—'}</td>
        <td><LoanStatus loan={loan} /></td>
      </tr>
    ));
  };

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
          {renderTableBody()}
        </tbody>
      </table>
    </div>
  );
};

export default MyLoansPage;