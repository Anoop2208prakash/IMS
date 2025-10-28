import React, { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import styles from '../../../assets/scss/pages/admin/EditModal.module.scss'; // Reuse generic modal style

interface Program { id: string; title: string; }

// This interface must match the data from the parent page
interface FeeStructureData {
  id: string;
  name: string;
  amount: number;
  programId: string; // <-- This was 'courseId'
}

interface EditFeeStructureModalProps {
  structure: FeeStructureData;
  onClose: () => void;
  onFeeStructureUpdated: () => void;
}

const EditFeeStructureModal = ({ structure, onClose, onFeeStructureUpdated }: EditFeeStructureModalProps) => {
  const [formData, setFormData] = useState({ name: '', amount: 0, programId: '' });
  const [programs, setPrograms] = useState<Program[]>([]);
  const [error, setError] = useState('');

  // Fetch all programs for the dropdown
  useEffect(() => {
    axios.get('http://localhost:5000/api/programs') // <-- Fetch programs, not courses
      .then(res => setPrograms(res.data))
      .catch(() => toast.error('Could not load programs.'));
  }, []);

  // Pre-fill the form with the existing data
  useEffect(() => {
    if (structure) {
      setFormData({
        name: structure.name,
        amount: structure.amount,
        programId: structure.programId, // <-- This was 'courseId'
      });
    }
  }, [structure]);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) || 0 : value,
    }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await axios.put(`http://localhost:5000/api/fees/structures/${structure.id}`, formData);
      onFeeStructureUpdated();
    } catch (err) {
      if (axios.isAxiosError(err) && err.response) {
        toast.error(err.response.data.message || 'Failed to update fee structure.');
      } else {
        toast.error('An unexpected error occurred.');
      }
    }
  };

  return (
    <div className={styles.modalBackdrop}>
      <div className={styles.modalContent}>
        <h2>Edit Fee Structure</h2>
        <form onSubmit={handleSubmit}>
          <label>Fee Name</label>
          <input type="text" name="name" value={formData.name} onChange={handleChange} required />

          <label>Amount (₹)</label>
          <input type="number" name="amount" value={formData.amount} min="0" step="0.01" onChange={handleChange} required />

          <label>Associated Program</label>
          <select name="programId" value={formData.programId} onChange={handleChange} required>
            <option value="" disabled>-- Select a Program --</option>
            {programs.map(program => <option key={program.id} value={program.id}>{program.title}</option>)}
          </select>

          {error && <p className={styles.error}>{error}</p>}
          <div className={styles.buttonGroup}>
            <button type="submit">Save Changes</button>
            <button type="button" onClick={onClose}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditFeeStructureModal;