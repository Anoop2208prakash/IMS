import React, { useState } from 'react';
import axios from 'axios';
import styles from './ChangePasswordPage.module.scss';

const ChangePasswordPage = () => {
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    setError('');

    // Client-side validation
    if (formData.newPassword !== formData.confirmPassword) {
      setError('New passwords do not match.');
      return;
    }
    if (formData.newPassword.length < 4) {
      setError('New password must be at least 4 characters long.');
      return;
    }

    try {
      const response = await axios.put('http://localhost:5000/api/auth/change-password', {
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword,
      });
      setMessage(response.data.message);
      setFormData({ currentPassword: '', newPassword: '', confirmPassword: '' }); // Clear form
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to change password.');
    }
  };

  return (
    <div className={styles.container}>
      <form onSubmit={handleSubmit} className={styles.form}>
        <h2>Change Password</h2>
        <div className={styles.formGroup}>
          <label>Current Password</label>
          <input type="password" name="currentPassword" value={formData.currentPassword} onChange={handleChange} required />
        </div>
        <div className={styles.formGroup}>
          <label>New Password</label>
          <input type="password" name="newPassword" value={formData.newPassword} onChange={handleChange} required />
        </div>
        <div className={styles.formGroup}>
          <label>Confirm New Password</label>
          <input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} required />
        </div>
        <button type="submit" className={styles.submitButton}>Update Password</button>
        {message && <p className={styles.successMessage}>{message}</p>}
        {error && <p className={styles.errorMessage}>{error}</p>}
      </form>
    </div>
  );
};

export default ChangePasswordPage;