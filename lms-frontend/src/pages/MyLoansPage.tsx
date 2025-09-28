import React, { useState, useEffect } from 'react';
import { getMyLoans } from '../services/libraryService';

interface Loan {
  id: string;
  dueDate: string;
  book: {
    title: string;
    isbn: string;
  };
}

const MyLoansPage = () => {
  const [loans, setLoans] = useState<Loan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLoans = async () => {
      try {
        const data = await getMyLoans();
        setLoans(data);
      } catch (error) {
        console.error("Failed to fetch loans", error);
      } finally {
        setLoading(false);
      }
    };
    fetchLoans();
  }, []);

  if (loading) return <div>Loading your loans...</div>;

  return (
    <div>
      <h2>My Active Loans</h2>
      {loans.length > 0 ? (
        <ul>
          {loans.map((loan) => (
            <li key={loan.id} style={{ marginBottom: '1rem', border: '1px solid #ccc', padding: '1rem' }}>
              <strong>{loan.book.title}</strong> (ISBN: {loan.book.isbn})
              <br />
              <span>Due Date: {new Date(loan.dueDate).toLocaleDateString()}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p>You have no books currently on loan.</p>
      )}
    </div>
  );
};

export default MyLoansPage;