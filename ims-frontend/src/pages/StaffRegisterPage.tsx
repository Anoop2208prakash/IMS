// src/pages/StaffRegisterPage.tsx
import React, { useState } from 'react';
import axios from 'axios';
import styles from './AdmissionPage.module.scss'; // Reuse existing styles

const StaffRegisterPage = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    role: 'TEACHER', // Default role
    department: '',
  });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    try {
      const response = await axios.post('http://localhost:5000/api/staff/register', formData);
      setMessage(response.data.message);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to submit registration.');
    }
  };

  return (
    <div className={styles.container}>
      <form onSubmit={handleSubmit} className={styles.form}>
        <h2>Staff Registration (Temporary)</h2>
        <div className={styles.formGroup}>
          <label htmlFor="fullName">Full Name</label>
          <input type="text" name="fullName" value={formData.fullName} onChange={handleChange} required />
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="email">Email Address</label>
          <input type="email" name="email" value={formData.email} onChange={handleChange} required />
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="password">Password</label>
          <input type="password" name="password" value={formData.password} onChange={handleChange} required />
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="role">Role</label>
          <select name="role" value={formData.role} onChange={handleChange}>
            <option value="TEACHER">Teacher</option>
            <option value="ADMIN">Admin</option>
            <option value="ADMIN_ADMISSION">Admin (Admission)</option>
            <option value="ADMIN_FINANCE">Admin (Finance)</option>
            <option value="ADMIN_LIBRARY">Admin (Library)</option>
          </select>
        </div>

        {/* Conditional field for Teacher role */}
        {formData.role === 'TEACHER' && (
          <div className={styles.formGroup}>
            <label htmlFor="department">Department</label>
            <input type="text" name="department" value={formData.department} onChange={handleChange} required />
          </div>
        )}

        <button type="submit" className={styles.submitButton}>Register</button>
        {message && <p className={styles.successMessage}>{message}</p>}
        {error && <p className={styles.errorMessage}>{error}</p>}
      </form>
    </div>
  );
};

export default StaffRegisterPage;