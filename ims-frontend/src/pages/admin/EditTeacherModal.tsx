import React, { useState, ChangeEvent, FormEvent } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import styles from '../../assets/scss/pages/admin/AddForm.module.scss'; // <-- This path is updated

interface AddTeacherFormProps {
  onTeacherAdded: () => void;
  onCancel: () => void;
}

const AddTeacherForm = ({ onTeacherAdded, onCancel }: AddTeacherFormProps) => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    department: '',
  });
  const [error, setError] = useState('');

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await axios.post('http://localhost:5000/api/teachers', formData);
      toast.success('Teacher added successfully!');
      onTeacherAdded();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to add teacher.');
      toast.error(err.response?.data?.message || 'Failed to add teacher.');
    }
  };

  return (
    <div className={styles.formContainer}>
      <h3>Add New Teacher</h3>
      <form onSubmit={handleSubmit}>
        <input type="text" name="fullName" placeholder="Full Name" onChange={handleChange} required />
        <input type="email" name="email" placeholder="Email" onChange={handleChange} required />
        <input type="password" name="password" placeholder="Temporary Password" onChange={handleChange} required />
        <input type="text" name="department" placeholder="Department (e.g., CSE)" onChange={handleChange} required />
        
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