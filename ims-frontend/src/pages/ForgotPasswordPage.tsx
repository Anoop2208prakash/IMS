import { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import styles from './AdmissionPage.module.scss';
import ButtonSpinner from '../components/common/ButtonSpinner';

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false); // Add loading state

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const response = await axios.post('http://localhost:5000/api/auth/forgot-password', { email });
      toast.success(response.data.message);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'An error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <form onSubmit={handleSubmit} className={styles.form}>
        <h2>Forgot Password</h2>
        <p className={styles.subheading}>Enter your email to receive a password reset link.</p>
        <div className={styles.formGroup}>
          <label htmlFor="email">Email Address</label>
          <input 
            type="email" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            required 
            disabled={loading} 
          />
        </div>
        <button type="submit" className={styles.submitButton} disabled={loading}>
          {loading ? <ButtonSpinner /> : 'Send Reset Link'}
        </button>
        <Link to="/login" className={styles.backLink}>Back to Login</Link>
      </form>
    </div>
  );
};

export default ForgotPasswordPage;