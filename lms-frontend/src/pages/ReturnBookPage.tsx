import React, { useState } from 'react';
import { returnBook } from '../services/libraryService';

const ReturnBookPage = () => {
  const [bookId, setBookId] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });
    try {
      await returnBook({ bookId });
      setMessage({ type: 'success', text: 'Book returned successfully!' });
      setBookId('');
    } catch (err: any) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to return book.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2>Return a Book</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={bookId}
          onChange={(e) => setBookId(e.target.value)}
          placeholder="Enter Book ID to Return"
          required
        />
        <button type="submit" disabled={loading}>
          {loading ? 'Processing...' : 'Return Book'}
        </button>
      </form>
      {message.text && (
        <p style={{ color: message.type === 'success' ? 'green' : 'red' }}>
          {message.text}
        </p>
      )}
    </div>
  );
};

export default ReturnBookPage;