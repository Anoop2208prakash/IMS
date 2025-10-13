import React, { useState } from 'react'; // <-- FIX: Correctly import useState
import { Link } from 'react-router-dom';
import axios from 'axios';
import styles from './AdmissionPage.module.scss'; // Reuse existing styles

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    setError('');
    try {
      const response = await axios.post('http://localhost:5000/api/auth/forgot-password', { email });
      setMessage(response.data.message);
    } catch (err: any) {
      setError(err.response?.data?.message || 'An error occurred.');
    }
  };

  return (
    <div className={styles.container}>
      <form onSubmit={handleSubmit} className={styles.form}>
        <h2>Forgot Password</h2>
        <p>Enter your email to receive a password reset link.</p>
        <div className={styles.formGroup}>
          <label htmlFor="email">Email Address</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
        <button type="submit" className={styles.submitButton}>Send Reset Link</button>
        {message && <p className={styles.successMessage}>{message}</p>}
        {error && <p className={styles.errorMessage}>{error}</p>}
        <Link to="/login" style={{ marginTop: '15px', display: 'block' }}>Back to Login</Link>
      </form>
    </div>
  );
};

export default ForgotPasswordPage;