import { useState, useEffect } from 'react';
import axios from 'axios';
import styles from './BrowseBooksPage.module.scss';

interface Book {
  id: string;
  title: string;
  isbn: string;
  availableQuantity: number;
}

const BrowseBooksPage = () => {
  const [books, setBooks] = useState<Book[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/books');
        setBooks(response.data);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to fetch books.');
      } finally {
        setLoading(false);
      }
    };
    fetchBooks();
  }, []);

  // Filter books based on the search term
  const filteredBooks = books.filter(book =>
    book.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <p>Loading library catalog...</p>;
  if (error) return <p style={{ color: 'red' }}>{error}</p>;

  return (
    <div className={styles.browseContainer}>
      <div className={styles.header}>
        <h2>Library Catalog</h2>
        <input
          type="text"
          placeholder="Search by title..."
          className={styles.searchInput}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className={styles.booksGrid}>
        {filteredBooks.map(book => (
          <div key={book.id} className={styles.bookCard}>
            <h3>{book.title}</h3>
            <p><strong>ISBN:</strong> {book.isbn}</p>
            <p className={book.availableQuantity > 0 ? styles.available : styles.unavailable}>
              {book.availableQuantity > 0 ? `${book.availableQuantity} Available` : 'Unavailable'}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BrowseBooksPage;