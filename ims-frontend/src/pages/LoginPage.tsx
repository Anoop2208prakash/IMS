import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast'; // <-- 1. Import toast
import styles from './AdmissionPage.module.scss'; // Reusing styles

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  // const [error, setError] = useState(''); // <-- This is no longer needed
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.post('http://localhost:5000/api/auth/login', { email, password });
      login(response.data.token, response.data.user);

      // 2. Show a success toast
      toast.success('Login successful!');

      // Navigate after a short delay to let the user see the toast
      setTimeout(() => navigate('/'), 1000);

    } catch (err: any) {
      // 3. Show an error toast
      toast.error(err.response?.data?.message || 'Login failed.');
      setLoading(false); // Make sure to stop loading on error
    }
  };

  return (
    <div className={styles.container}>
      <form onSubmit={handleSubmit} className={styles.form}>
        <h2>Login</h2>
        <div className={styles.formGroup}>
          <label htmlFor="email">Email Address</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required disabled={loading} />
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="password">Password</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required disabled={loading} />
        </div>
        
        <div style={{ textAlign: 'right', marginBottom: '15px', fontSize: '0.9em' }}>
          <Link to="/forgot-password">Forgot Password?</Link>
        </div>
        
        <button type="submit" className={styles.submitButton} disabled={loading}>
          {loading ? 'Logging in...' : 'Login'}
        </button>
        {/* The old error message is removed from here */}
      </form>
    </div>
  );
};

export default LoginPage;