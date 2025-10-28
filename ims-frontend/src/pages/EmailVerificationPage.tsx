import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import styles from '../assets/scss/pages/AdmissionPage.module.scss'; // Reuse styles

const EmailVerificationPage = () => {
  const { token } = useParams<{ token: string }>();
  const [status, setStatus] = useState('Verifying...');
  const [error, setError] = useState(false);

  useEffect(() => {
    if (token) {
      axios.get(`http://localhost:5000/api/auth/verify-email/${token}`)
        .then(response => {
          setStatus(response.data.message);
          setError(false);
        })
        .catch(err => {
          setStatus(err.response?.data?.message || 'Verification failed.');
          setError(true);
        });
    }
  }, [token]);

  return (
    <div className={styles.container}>
      <div className={styles.form}>
        <h2>Email Verification</h2>
        <p className={error ? styles.errorMessage : styles.successMessage}>
          {status}
        </p>
        {!error && <Link to="/login">Proceed to Login</Link>}
      </div>
    </div>
  );
};

export default EmailVerificationPage;