import React, { useState } from 'react';
import { issueBook } from '../services/libraryService';

const IssueBookPage = () => {
  const [bookId, setBookId] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });
    try {
      await issueBook({ bookId, userEmail });
      setMessage({ type: 'success', text: 'Book issued successfully!' });
      setBookId('');
      setUserEmail('');
    } catch (err: any) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to issue book.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2>Issue a Book</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={bookId}
          onChange={(e) => setBookId(e.target.value)}
          placeholder="Enter Book ID"
          required
        />
        <input
          type="email"
          value={userEmail}
          onChange={(e) => setUserEmail(e.target.value)}
          placeholder="Enter User Email"
          required
        />
        <button type="submit" disabled={loading}>
          {loading ? 'Issuing...' : 'Issue Book'}
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

export default IssueBookPage;