import { useState, useEffect, ChangeEvent } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import styles from '../../../assets/scss/pages/admin/AdminPages.module.scss';
import Spinner from '../../../components/common/Spinner';
import EmptyState from '../../../components/common/EmptyState';
import Pagination from '../../../components/common/Pagination';
import DeleteModal from '../../../components/common/DeleteModal';
import Searchbar from '../../../components/common/Searchbar';
import { BsBookHalf } from 'react-icons/bs';
import AddBookForm from './AddBookForm';
import EditBookModal from './EditBookModal';
import CheckoutModal from './CheckoutModal';

interface BookData {
  id: string;
  title: string;
  isbn: string;
  availableQuantity: number;
  totalQuantity: number;
  publishedDate: string;
}

const ManageBooksPage = () => {
  const [books, setBooks] = useState<BookData[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  
  // Modal States
  const [editingBook, setEditingBook] = useState<BookData | null>(null);
  const [checkingOutBook, setCheckingOutBook] = useState<BookData | null>(null);
  const [deletingBook, setDeletingBook] = useState<BookData | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Search & Pagination States
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const fetchBooks = async () => {
    setLoading(true);
    try {
      const response = await axios.get('http://localhost:5000/api/books');
      setBooks(response.data);
    } catch (err) {
      if (axios.isAxiosError(err) && err.response) {
        toast.error(err.response.data.message || 'Failed to fetch books.');
      } else {
        toast.error('An unexpected error occurred.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBooks();
  }, []);

  const handleBookAdded = () => { setShowAddForm(false); fetchBooks(); toast.success('Book added successfully!'); };
  const handleBookUpdated = () => { setEditingBook(null); fetchBooks(); toast.success('Book updated successfully!'); };
  const handleCheckoutSuccess = () => { setCheckingOutBook(null); fetchBooks(); toast.success('Book checked out successfully!'); };

  const handleDelete = async () => {
    if (!deletingBook) return;
    setDeleteLoading(true);
    try {
      await axios.delete(`http://localhost:5000/api/books/${deletingBook.id}`);
      setBooks(current => current.filter(b => b.id !== deletingBook.id));
      toast.success('Book deleted successfully!');
      setDeletingBook(null);
    } catch (err) {
      if (axios.isAxiosError(err) && err.response) {
        toast.error(err.response.data.message || 'Failed to delete book.');
      } else {
        toast.error('An unexpected error occurred.');
      }
    } finally {
      setDeleteLoading(false);
    }
  };

  // --- Filtering & Pagination ---
  const filteredBooks = books.filter(book =>
    book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    book.isbn.includes(searchTerm)
  );

  const handleRowsPerPageChange = (event: ChangeEvent<HTMLSelectElement>) => {
    setRowsPerPage(Number.parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setPage(0);
  };

  const currentItems = filteredBooks.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  const renderTableBody = () => {
    if (loading) {
      return <tr><td colSpan={5} className={styles.spinnerCell}><Spinner /></td></tr>;
    }
    if (filteredBooks.length === 0) {
      return (
        <tr>
          <td colSpan={5}>
            <EmptyState 
              message={searchTerm ? "No books match your search." : "No books found. Click 'Add New Book' to begin."} 
              icon={<BsBookHalf size={40} />} 
            />
          </td>
        </tr>
      );
    }
    return currentItems.map((book) => (
      <tr key={book.id}>
        <td>{book.title}</td>
        <td>{book.isbn}</td>
        <td>{book.availableQuantity}</td>
        <td>{book.totalQuantity}</td>
        <td>
          <button
            onClick={() => setCheckingOutBook(book)}
            className={`${styles.button} ${styles.checkoutButton}`}
            disabled={book.availableQuantity === 0}
          >
            Checkout
          </button>
          <button onClick={() => setEditingBook(book)} className={`${styles.button} ${styles.editButton}`}>Edit</button>
          <button onClick={() => setDeletingBook(book)} className={`${styles.button} ${styles.deleteButton}`}>Delete</button>
        </td>
      </tr>
    ));
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2>Manage Books</h2>
        <div className={styles.headerActions}>
          <button onClick={() => setShowAddForm(prev => !prev)}>
            {showAddForm ? 'Cancel' : 'Add New Book'}
          </button>
        </div>
      </div>

      {/* Search Bar is now below the header */}
      <div className={styles.searchContainer}>
        <Searchbar
          value={searchTerm}
          onChange={handleSearchChange}
          placeholder="Search by title or ISBN..."
        />
      </div>

      {showAddForm && <AddBookForm onBookAdded={handleBookAdded} onCancel={() => setShowAddForm(false)} />}
      
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Title</th>
            <th>ISBN</th>
            <th>Available</th>
            <th>Total</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {renderTableBody()}
        </tbody>
      </table>

      <Pagination
        count={filteredBooks.length}
        page={page}
        rowsPerPage={rowsPerPage}
        onPageChange={setPage}
        onRowsPerPageChange={handleRowsPerPageChange}
      />

      {editingBook && <EditBookModal book={editingBook} onClose={() => setEditingBook(null)} onBookUpdated={handleBookUpdated} />}
      
      {checkingOutBook && (
        <CheckoutModal
          book={checkingOutBook}
          onClose={() => setCheckingOutBook(null)}
          onCheckoutSuccess={handleCheckoutSuccess}
        />
      )}
      
      {deletingBook && (
        <DeleteModal
          title="Delete Book"
          message={`Are you sure you want to delete "${deletingBook.title}"? This will remove all loan records associated with it.`}
          onClose={() => setDeletingBook(null)}
          onConfirm={handleDelete}
          loading={deleteLoading}
        />
      )}
    </div>
  );
};

export default ManageBooksPage;