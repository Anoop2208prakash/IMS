import React, { useState, useEffect } from 'react';
import axios from 'axios';
import styles from './EditTeacherModal.module.scss'; // Reuse styles

interface ExamData { id: string; name: string; date: string; totalMarks: number; }
interface EditExamModalProps { exam: ExamData; onClose: () => void; onExamUpdated: () => void; }

const EditExamModal = ({ exam, onClose, onExamUpdated }: EditExamModalProps) => {
  const [formData, setFormData] = useState({ name: '', date: '', totalMarks: 100 });
  const [error, setError] = useState('');

  useEffect(() => {
    if (exam) {
      setFormData({
        name: exam.name,
        date: new Date(exam.date).toISOString().split('T')[0],
        totalMarks: exam.totalMarks,
      });
    }
  }, [exam]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => { /* ... same as AddExamForm ... */ };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await axios.put(`http://localhost:5000/api/exams/${exam.id}`, formData);
      onExamUpdated();
    } catch (err: any) { setError(err.response?.data?.message || 'Failed to update exam.'); }
  };

  return (
    <div className={styles.modalBackdrop}>
      <div className={styles.modalContent}>
        <h2>Edit Exam</h2>
        <form onSubmit={handleSubmit}>
          <label>Exam Name</label>
          <input type="text" name="name" value={formData.name} onChange={handleChange} required />
          <label>Date</label>
          <input type="date" name="date" value={formData.date} onChange={handleChange} required />
          <label>Total Marks</label>
          <input type="number" name="totalMarks" value={formData.totalMarks} min="1" onChange={handleChange} required />
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

export default EditExamModal;