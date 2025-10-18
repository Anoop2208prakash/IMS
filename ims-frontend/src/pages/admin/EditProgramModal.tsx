import React, { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import styles from './EditModal.module.scss'; // A new, generic stylesheet

interface ProgramData { id: string; title: string; durationYears: number; }
interface EditProgramModalProps {
  program: ProgramData;
  onClose: () => void;
  onProgramUpdated: () => void;
}

const EditProgramModal = ({ program, onClose, onProgramUpdated }: EditProgramModalProps) => {
  const [formData, setFormData] = useState({ title: '', durationYears: 0 });

  useEffect(() => {
    if (program) {
      setFormData({
        title: program.title,
        durationYears: program.durationYears,
      });
    }
  }, [program]);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      await axios.put(`http://localhost:5000/api/programs/${program.id}`, formData);
      toast.success('Program updated successfully!');
      onProgramUpdated();
    } catch (err) {
      if (axios.isAxiosError(err) && err.response) {
        toast.error(err.response.data.message || 'Failed to update program.');
      } else {
        toast.error('An unexpected error occurred.');
      }
    }
  };

  return (
    <div className={styles.modalBackdrop}>
      <div className={styles.modalContent}>
        <h2>Edit Program</h2>
        <form onSubmit={handleSubmit}>
          <label>Program Title</label>
          <input type="text" name="title" value={formData.title} onChange={handleChange} required />
          <label>Duration (in years)</label>
          <input type="number" name="durationYears" value={formData.durationYears} min="1" onChange={handleChange} required />
          <div className={styles.buttonGroup}>
            <button type="submit">Save Changes</button>
            <button type="button" onClick={onClose}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProgramModal;