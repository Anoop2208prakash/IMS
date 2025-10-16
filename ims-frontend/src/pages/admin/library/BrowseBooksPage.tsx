import { useState, useEffect, KeyboardEvent, ChangeEvent } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import styles from './BrowseBooksPage.module.scss';
import { BsBookHalf, BsSearch } from 'react-icons/bs';
import EmptyState from '../../../components/common/EmptyState';
import Spinner from '../../../components/common/Spinner';
import Pagination from '../../../components/common/Pagination';

interface Book {
  id: string;
  title: string;
  isbn: string;
  availableQuantity: number;
}

const BrowseBooksPage = () => {
  const [books, setBooks] = useState<Book[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterQuery, setFilterQuery] = useState('');
  const [loading, setLoading] = useState(true);
  
  // --- New Pagination State ---
  const [page, setPage] = useState(0); // 0-indexed page for easier calculations
  const [rowsPerPage, setRowsPerPage] = useState(10);

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        setLoading(true);
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
    fetchBooks();
  }, []);

  const filteredBooks = books.filter(book =>
    book.title.toLowerCase().includes(filterQuery.toLowerCase())
  );
  
  // --- Pagination Logic ---
  const currentItems = filteredBooks.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  const handleSearch = () => {
    setFilterQuery(searchTerm);
    setPage(0); // Reset to first page on new search
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleRowsPerPageChange = (event: ChangeEvent<HTMLSelectElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0); // Reset to first page when rows per page changes
  };

  const renderTableBody = () => {
    if (loading) {
      return (
        <tr>
          <td colSpan={3} className={styles.spinnerCell}><Spinner /></td>
        </tr>
      );
    }
    if (filteredBooks.length === 0) {
      return (
        <tr>
          <td colSpan={3}>
            <EmptyState 
              message={filterQuery ? `No books found for "${filterQuery}"` : "The library catalog is empty."} 
              icon={<BsBookHalf size={40} />} 
            />
          </td>
        </tr>
      );
    }
    return currentItems.map(book => (
      <tr key={book.id}>
        <td>{book.title}</td>
        <td>{book.isbn}</td>
        <td>
          <span className={book.availableQuantity > 0 ? styles.available : styles.unavailable}>
            {book.availableQuantity > 0 ? `Available (${book.availableQuantity})` : 'Unavailable'}
          </span>
        </td>
      </tr>
    ));
  };

  return (
    <div className={styles.browseContainer}>
      <div className={styles.header}>
        <h2>Library Catalog</h2>
        <div className={styles.searchWrapper}>
          <input
            type="text"
            placeholder="Search by title..."
            className={styles.searchInput}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <button className={styles.searchButton} onClick={handleSearch}>
            <BsSearch size={18} />
          </button>
        </div>
      </div>

      <table className={styles.booksTable}>
        <thead>
          <tr>
            <th>Title</th>
            <th>ISBN</th>
            <th>Availability</th>
          </tr>
        </thead>
        <tbody>
          {renderTableBody()}
        </tbody>
      </table>

      {/* Render the new Pagination component */}
      <Pagination
        count={filteredBooks.length}
        page={page}
        rowsPerPage={rowsPerPage}
        onPageChange={setPage}
        onRowsPerPageChange={handleRowsPerPageChange}
      />
    </div>
  );
};

export default BrowseBooksPage;