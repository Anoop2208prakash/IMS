import React, { useState, ChangeEvent, FormEvent } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import styles from '../../assets/scss/pages/admin/AddForm.module.scss'; // <-- This path is now fixed

interface AddProgramFormProps {
  onProgramAdded: () => void;
  onCancel: () => void;
}

const AddProgramForm = ({ onProgramAdded, onCancel }: AddProgramFormProps) => {
  const [formData, setFormData] = useState({ title: '', durationYears: '' });

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/api/programs', formData);
      toast.success('Program created successfully!');
      onProgramAdded();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to create program.');
    }
  };

  return (
    <div className={styles.formContainer}>
      <h3>Add New Program</h3>
      <form onSubmit={handleSubmit}>
        <input type="text" name="title" placeholder="Program Title (e.g., BTech)" value={formData.title} onChange={handleChange} required />
        <input type="number" name="durationYears" placeholder="Duration (in years)" value={formData.durationYears} min="1" onChange={handleChange} required />
        <div className={styles.buttonGroup}>
          <button type="submit">Add Program</button>
          <button type="button" onClick={onCancel}>Cancel</button>
        </div>
      </form>
    </div>
  );
};

export default AddProgramForm;