import { useState, useEffect, ChangeEvent } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import styles from '../../../assets/scss/pages/admin/library/BrowseBooksPage.module.scss';
import { BsBookHalf } from 'react-icons/bs';
import Spinner from '../../../components/common/Spinner';
import EmptyState from '../../../components/common/EmptyState';
import Searchbar from '../../../components/common/Searchbar';
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
  const [loading, setLoading] = useState(true);
  
  const [page, setPage] = useState(0);
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
    book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    book.isbn.includes(searchTerm)
  );
  
  const currentItems = filteredBooks.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setPage(0);
  };

  const handleRowsPerPageChange = (event: ChangeEvent<HTMLSelectElement>) => {
    setRowsPerPage(Number.parseInt(event.target.value, 10));
    setPage(0);
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
              message={searchTerm ? `No books found for "${searchTerm}"` : "The library catalog is empty."} 
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
      </div>

      {/* 2. Add a new wrapper for the search bar */}
      <div className={styles.searchContainer}>
        <Searchbar
          value={searchTerm}
          onChange={handleSearchChange}
          placeholder="Search by title or ISBN..."
        />
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