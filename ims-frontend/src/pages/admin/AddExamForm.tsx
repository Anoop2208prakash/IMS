import React, { useState } from 'react';
import axios from 'axios';
import styles from '../../assets/scss/pages/admin/AddForm.module.scss'; // Reuse styles

interface AddExamFormProps { onExamAdded: () => void; onCancel: () => void; }

const AddExamForm = ({ onExamAdded, onCancel }: AddExamFormProps) => {
  const [formData, setFormData] = useState({ name: '', date: '', totalMarks: 100 });
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'number' ? parseInt(value) || 0 : value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await axios.post('http://localhost:5000/api/exams', formData);
      onExamAdded();
    } catch (err: any) { setError(err.response?.data?.message || 'Failed to add exam.'); }
  };

  return (
    <div className={styles.formContainer}>
      <h3>Add New Exam</h3>
      <form onSubmit={handleSubmit}>
        <input type="text" name="name" placeholder="Exam Name (e.g., Mid-Term 2025)" onChange={handleChange} required />
        <input type="date" name="date" onChange={handleChange} required />
        <input type="number" name="totalMarks" min="1" placeholder="Total Marks" onChange={handleChange} required />
        {error && <p className={styles.error}>{error}</p>}
        <div className={styles.buttonGroup}>
          <button type="submit">Add Exam</button>
          <button type="button" onClick={onCancel}>Cancel</button>
        </div>
      </form>
    </div>
  );
};

export default AddExamForm;