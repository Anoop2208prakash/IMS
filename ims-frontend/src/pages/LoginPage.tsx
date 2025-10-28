import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import styles from '../assets/scss/pages/AdmissionPage.module.scss';
import ButtonSpinner from '../components/common/ButtonSpinner';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [formErrors, setFormErrors] = useState({ email: '', password: '' });
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const validate = () => {
    const errors = { email: '', password: '' };
    let isValid = true;

    if (!email) {
      errors.email = 'Email address is required.';
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      errors.email = 'Email address is invalid.';
      isValid = false;
    }

    if (!password) {
      errors.password = 'Password is required.';
      isValid = false;
    } else if (password.length < 3) {
      errors.password = 'Password must be at least 6 characters.';
      isValid = false;
    }

    setFormErrors(errors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormErrors({ email: '', password: '' });

    if (!validate()) {
      return;
    }
    
    setLoading(true);
    try {
      const response = await axios.post('http://localhost:5000/api/auth/login', { email, password });
      login(response.data.token, response.data.user);
      toast.success('Login successful!');
      setTimeout(() => navigate('/'), 1000);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Login failed.');
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <form onSubmit={handleSubmit} className={styles.form}>
        <h2>Login</h2>
        <div className={styles.formGroup}>
          <label htmlFor="email">Email Address</label>
          <input 
            type="email" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            required 
            disabled={loading} 
          />
          {formErrors.email && <p className={styles.validationError}>{formErrors.email}</p>}
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="password">Password</label>
          <input 
            type="password" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            required 
            disabled={loading} 
          />
          {formErrors.password && <p className={styles.validationError}>{formErrors.password}</p>}
        </div>
        
        {/* --- THIS IS THE FIX --- */}
        <Link to="/forgot-password" className={styles.forgotPasswordLink}>
          Forgot Password?
        </Link>
        {/* ---------------------- */}
        
        <button type="submit" className={styles.submitButton} disabled={loading}>
          {loading ? <ButtonSpinner /> : 'Login'}
        </button>
      </form>
    </div>
  );
};

export default LoginPage;