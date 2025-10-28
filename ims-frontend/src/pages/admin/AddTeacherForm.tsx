// src/components/admin/AddTeacherForm.tsx
import React, { useState } from 'react';
import axios from 'axios';
import styles from '../../assets/scss/pages/admin/AddForm.module.scss';

interface AddTeacherFormProps {
  onTeacherAdded: () => void; // Function to refresh the teacher list
  onCancel: () => void; // Function to hide the form
}

const AddTeacherForm = ({ onTeacherAdded, onCancel }: AddTeacherFormProps) => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    department: '',
  });
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await axios.post('http://localhost:5000/api/teachers', formData);
      onTeacherAdded(); // Tell the parent component to refresh the list
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to add teacher.');
    }
  };

  return (
    <div className={styles.formContainer}>
      <h3>Add New Teacher</h3>
      <form onSubmit={handleSubmit}>
        <input type="text" name="fullName" placeholder="Full Name" onChange={handleChange} required />
        <input type="email" name="email" placeholder="Email" onChange={handleChange} required />
        <input type="password" name="password" placeholder="Password" onChange={handleChange} required />
        <input type="text" name="department" placeholder="Department" onChange={handleChange} required />
        {error && <p className={styles.error}>{error}</p>}
        <div className={styles.buttonGroup}>
          <button type="submit">Add Teacher</button>
          <button type="button" onClick={onCancel}>Cancel</button>
        </div>
      </form>
    </div>
  );
};

export default AddTeacherForm;