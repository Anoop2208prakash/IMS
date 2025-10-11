import { useState, useEffect } from 'react';
import axios from 'axios';
import styles from '../AdminPages.module.scss'; // <-- Import new modal
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
  const [error, setError] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingBook, setEditingBook] = useState<BookData | null>(null);
  const [checkingOutBook, setCheckingOutBook] = useState<BookData | null>(null); // <-- State for new modal

  const fetchBooks = async () => {
    if (books.length === 0) setLoading(true);
    try {
      const response = await axios.get('http://localhost:5000/api/books');
      setBooks(response.data);
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch books.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBooks();
  }, []);

  const handleBookAdded = () => { setShowAddForm(false); fetchBooks(); };
  const handleBookUpdated = () => { setEditingBook(null); fetchBooks(); };
  const handleDelete = async (bookId: string) => { /* ... no changes ... */ };

  const handleCheckoutSuccess = () => {
    setCheckingOutBook(null); // Close the modal
    fetchBooks(); // Refresh the list to show the updated quantity
  };

  if (loading) return <p>Loading books...</p>;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2>Manage Books</h2>
        <button onClick={() => setShowAddForm(!showAddForm)}>
          {showAddForm ? 'Cancel' : 'Add New Book'}
        </button>
      </div>

      {showAddForm && <AddBookForm onBookAdded={handleBookAdded} onCancel={() => setShowAddForm(false)} />}
      {error && <p className={styles.error}>{error}</p>}

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
          {books.map((book) => (
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
                <button onClick={() => handleDelete(book.id)} className={`${styles.button} ${styles.deleteButton}`}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {editingBook && <EditBookModal book={editingBook} onClose={() => setEditingBook(null)} onBookUpdated={handleBookUpdated} />}
      
      {checkingOutBook && (
        <CheckoutModal
          book={checkingOutBook}
          onClose={() => setCheckingOutBook(null)}
          onCheckoutSuccess={handleCheckoutSuccess}
        />
      )}
    </div>
  );
};

export default ManageBooksPage;