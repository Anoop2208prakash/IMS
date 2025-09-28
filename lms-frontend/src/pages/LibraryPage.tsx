import React, { useState, useEffect, useCallback } from 'react';
import { getBooks, addBook, deleteBook } from '../services/libraryService';
import { useAuth } from '../context/AuthContext';
import Modal from '../components/common/Modal';
import styles from './LibraryPage.module.scss';

// Define a type for our book data for better TypeScript support
interface Book {
  id: string;
  title: string;
  isbn: string;
  availableQuantity: number;
  authors: { author: { name: string } }[];
}

const LibraryPage = () => {
  const { user } = useAuth();
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newBook, setNewBook] = useState({
    title: '',
    authorName: '',
    isbn: '',
    publishedDate: '',
    totalQuantity: '',
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);

  const fetchBooks = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getBooks(searchTerm, currentPage);
      setBooks(data.books);
      setTotalPages(data.totalPages);
    } catch (error) {
      setError('Failed to fetch books. The catalog may be empty.');
      console.error("Failed to fetch books", error);
    } finally {
      setLoading(false);
    }
  }, [searchTerm, currentPage]);

  useEffect(() => {
    fetchBooks();
  }, [fetchBooks]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewBook({ ...newBook, [e.target.name]: e.target.value });
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addBook(newBook);
      setIsModalOpen(false);
      setNewBook({ title: '', authorName: '', isbn: '', publishedDate: '', totalQuantity: '' });
      fetchBooks();
    } catch (err) {
      console.error(err);
      alert('Failed to add book. Ensure all fields are correct.');
    }
  };

  const handleDelete = async (bookId: string) => {
    if (window.confirm('Are you sure you want to delete this book?')) {
      try {
        await deleteBook(bookId);
        fetchBooks(); // Refresh the list after deletion
      } catch (error) {
        alert('Failed to delete book.');
        console.error(error);
      }
    }
  };

  const isLibraryAdmin = user?.role === 'ADMIN_LIBRARY' || user?.role === 'SUPER_ADMIN';

  return (
    <div className={styles.libraryContainer}>
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add New Book">
        <form onSubmit={handleFormSubmit} className={styles.addBookForm}>
          <input name="title" value={newBook.title} onChange={handleInputChange} placeholder="Title" required />
          <input name="authorName" value={newBook.authorName} onChange={handleInputChange} placeholder="Author Name" required />
          <input name="isbn" value={newBook.isbn} onChange={handleInputChange} placeholder="ISBN" required />
          <input name="publishedDate" value={newBook.publishedDate} onChange={handleInputChange} type="date" required />
          <input name="totalQuantity" value={newBook.totalQuantity} onChange={handleInputChange} placeholder="Quantity" type="number" required />
          <button type="submit">Add Book</button>
        </form>
      </Modal>

      <div className={styles.header}>
        <h2>Library Catalog</h2>
        {isLibraryAdmin && (
          <button onClick={() => setIsModalOpen(true)}>Add New Book</button>
        )}
      </div>

      <div className={styles.searchBar}>
        <input
          type="text"
          placeholder="Search by title..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {error && <p className={styles.error}>{error}</p>}
      
      <table className={styles.booksTable}>
        <thead>
          <tr>
            <th>Title</th>
            <th>Author(s)</th>
            <th>ISBN</th>
            <th>Available</th>
            {isLibraryAdmin && <th>Actions</th>}
          </tr>
        </thead>
        <tbody>
          {books.length > 0 ? (
            books.map((book) => (
              <tr key={book.id}>
                <td>{book.title}</td>
                <td>{book.authors.map(a => a.author.name).join(', ')}</td>
                <td>{book.isbn}</td>
                <td>{book.availableQuantity}</td>
                {isLibraryAdmin && (
                  <td>
                    <button className={styles.deleteButton} onClick={() => handleDelete(book.id)}>
                      Delete
                    </button>
                  </td>
                )}
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={isLibraryAdmin ? 5 : 4}>No books found in the library.</td>
            </tr>
          )}
        </tbody>
      </table>

      <div className={styles.pagination}>
        <button
          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
          disabled={currentPage === 1 || loading}
        >
          Previous
        </button>
        <span>
          Page {currentPage} of {totalPages || 1}
        </span>
        <button
          onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
          disabled={currentPage === totalPages || loading || totalPages === 0}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default LibraryPage;