// src/pages/AdmissionPage.tsx
import React, { useState } from 'react';
import axios from 'axios';
import styles from '../assets/scss/pages/AdmissionPage.module.scss'; // We'll create this file next

const AdmissionPage = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    courseId: 'clxzk098d00008ap8p3q1x2yz', // Hardcoded for now. We'll fetch courses later.
  });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    try {
      const response = await axios.post('http://localhost:5000/api/admissions/apply', formData);
      setMessage(response.data.message);
      // Optionally, redirect to login page after a delay
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to submit application.');
    }
  };

  return (
    <div className={styles.container}>
      <form onSubmit={handleSubmit} className={styles.form}>
        <h2>Admission Form</h2>
        <div className={styles.formGroup}>
          <label htmlFor="fullName">Full Name</label>
          <input type="text" id="fullName" name="fullName" value={formData.fullName} onChange={handleChange} required />
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="email">Email Address</label>
          <input type="email" id="email" name="email" value={formData.email} onChange={handleChange} required />
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="password">Password</label>
          <input type="password" id="password" name="password" value={formData.password} onChange={handleChange} required />
        </div>
        <button type="submit" className={styles.submitButton}>Apply</button>
        {message && <p className={styles.successMessage}>{message}</p>}
        {error && <p className={styles.errorMessage}>{error}</p>}
      </form>
    </div>
  );
};

export default AdmissionPage;