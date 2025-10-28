import React, { useState } from 'react';
import axios from 'axios';
import styles from '../../assets/scss/pages/admin/AddForm.module.scss'; // Reuse styles

interface AddCourseFormProps {
  onCourseAdded: () => void;
  onCancel: () => void;
}

const AddCourseForm = ({ onCourseAdded, onCancel }: AddCourseFormProps) => {
  const [formData, setFormData] = useState({
    title: '',
    courseCode: '',
    credits: 0,
    description: '',
  });
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'number' ? parseInt(value) || 0 : value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await axios.post('http://localhost:5000/api/courses', formData);
      onCourseAdded();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to add course.');
    }
  };

  return (
    <div className={styles.formContainer}>
      <h3>Add New Course</h3>
      <form onSubmit={handleSubmit}>
        <input type="text" name="title" placeholder="Course Title" onChange={handleChange} required />
        <input type="text" name="courseCode" placeholder="Course Code" onChange={handleChange} required />
        <input type="number" name="credits" placeholder="Credits" onChange={handleChange} required />
        <input type="text" name="description" placeholder="Description" onChange={handleChange} />
        {error && <p className={styles.error}>{error}</p>}
        <div className={styles.buttonGroup}>
          <button type="submit">Add Course</button>
          <button type="button" onClick={onCancel}>Cancel</button>
        </div>
      </form>
    </div>
  );
};

export default AddCourseForm;