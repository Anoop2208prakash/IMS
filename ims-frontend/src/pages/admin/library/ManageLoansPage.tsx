import { useState, useEffect, ChangeEvent } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import styles from '../AdminPages.module.scss';
import Spinner from '../../../components/common/Spinner';
import EmptyState from '../../../components/common/EmptyState';
import Pagination from '../../../components/common/Pagination';
import DeleteModal from '../../../components/common/DeleteModal';
import Searchbar from '../../../components/common/Searchbar';
import { BsBookHalf } from 'react-icons/bs';

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
  
  const [returningLoan, setReturningLoan] = useState<LoanData | null>(null);
  const [returnLoading, setReturnLoading] = useState(false);

  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const fetchActiveLoans = async () => {
    setLoading(true);
    try {
      const response = await axios.get('http://localhost:5000/api/loans/active');
      setActiveLoans(response.data);
    } catch (err) {
      if (axios.isAxiosError(err) && err.response) {
        toast.error(err.response.data.message || 'Failed to fetch active loans.');
      } else {
        toast.error('An unexpected error occurred.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActiveLoans();
  }, []);

  const handleReturn = async () => {
    if (!returningLoan) return;
    setReturnLoading(true);
    try {
      await axios.post('http://localhost:5000/api/loans/return', { loanId: returningLoan.id });
      toast.success('Book marked as returned!');
      setActiveLoans(currentLoans => currentLoans.filter(loan => loan.id !== returningLoan.id));
      setReturningLoan(null);
    } catch (err) {
      if (axios.isAxiosError(err) && err.response) {
        toast.error(err.response.data.message || 'Failed to process return.');
      } else {
        toast.error('An unexpected error occurred.');
      }
    } finally {
      setReturnLoading(false);
    }
  };

  const filteredLoans = activeLoans.filter(loan =>
    loan.book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    loan.user.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleRowsPerPageChange = (event: ChangeEvent<HTMLSelectElement>) => {
    setRowsPerPage(Number.parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setPage(0);
  };

  const currentItems = filteredLoans.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  const renderTableBody = () => {
    if (loading) {
      return <tr><td colSpan={5} className={styles.spinnerCell}><Spinner /></td></tr>;
    }
    if (filteredLoans.length === 0) {
      return (
        <tr>
          <td colSpan={5}>
            <EmptyState 
              message={searchTerm ? "No loans match your search." : "There are no active loans."} 
              icon={<BsBookHalf size={40} />} 
            />
          </td>
        </tr>
      );
    }
    return currentItems.map((loan) => (
      <tr key={loan.id}>
        <td>{loan.book.title}</td>
        <td>{loan.user.name}</td>
        <td>{new Date(loan.checkoutDate).toLocaleDateString()}</td>
        <td>{new Date(loan.dueDate).toLocaleDateString()}</td>
        <td>
          <button
            onClick={() => setReturningLoan(loan)}
            className={`${styles.button} ${styles.returnButton}`}
          >
            Mark as Returned
          </button>
        </td>
      </tr>
    ));
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2>Manage Active Loans</h2>
      </div>

      {/* Search Bar is now below the header */}
      <div className={styles.searchContainer}>
        <Searchbar
          value={searchTerm}
          onChange={handleSearchChange}
          placeholder="Search by book or user..."
        />
      </div>

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
          {renderTableBody()}
        </tbody>
      </table>

      <Pagination
        count={filteredLoans.length}
        page={page}
        rowsPerPage={rowsPerPage}
        onPageChange={setPage}
        onRowsPerPageChange={handleRowsPerPageChange}
      />

      {returningLoan && (
        <DeleteModal
          title="Confirm Return"
          message={`Are you sure you want to mark "${returningLoan.book.title}" (loaned to ${returningLoan.user.name}) as returned?`}
          onClose={() => setReturningLoan(null)}
          onConfirm={handleReturn}
          loading={returnLoading}
        />
      )}
    </div>
  );
};

export default ManageLoansPage;