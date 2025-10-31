import React, { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import styles from '../../assets/scss/pages/admin/AddForm.module.scss'; // Corrected path

interface Program { id: string; title: string; }

interface AddSemesterFormProps {
  onSemesterAdded: () => void;
  onCancel: () => void;
  programId: string; // This prop pre-selects the dropdown
}

const AddSemesterForm = ({ onSemesterAdded, onCancel, programId }: AddSemesterFormProps) => {
  const [formData, setFormData] = useState({ name: '', programId: programId || '' });
  const [programs, setPrograms] = useState<Program[]>([]);

  useEffect(() => {
    axios.get('http://localhost:5000/api/programs')
      .then(res => setPrograms(res.data))
      .catch(() => toast.error('Failed to load programs.'));
  }, []);

  // Update the form's state if the programId prop changes
  useEffect(() => {
    setFormData(prev => ({ ...prev, programId: programId }));
  }, [programId]);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/api/semesters', formData);
      toast.success('Semester created successfully!');
      onSemesterAdded();
    } catch (err) {
      if (axios.isAxiosError(err) && err.response) {
        toast.error(err.response.data.message || 'Failed to create semester.');
      } else {
        toast.error('An unexpected error occurred.');
      }
    }
  };

  return (
    <div className={styles.formContainer}>
      <h3>Add New Semester</h3>
      <form onSubmit={handleSubmit}>
        <input type="text" name="name" placeholder="Semester Name (e.g., Semester 1)" value={formData.name} onChange={handleChange} required />
        
        {/* --- THIS IS THE FIX --- */}
        {/* The 'disabled' prop is removed to allow selection */}
        <select name="programId" value={formData.programId} onChange={handleChange} required>
          <option value="" disabled>-- Select a Program --</option>
          {programs.map(p => <option key={p.id} value={p.id}>{p.title}</option>)}
        </select>
        
        <div className={styles.buttonGroup}>
          <button type="submit">Add Semester</button>
          <button type="button" onClick={onCancel}>Cancel</button>
        </div>
      </form>
    </div>
  );
};

export default AddSemesterForm;