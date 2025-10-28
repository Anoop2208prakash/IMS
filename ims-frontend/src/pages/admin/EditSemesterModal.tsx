import React, { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import styles from '../../assets/scss/pages/admin/EditModal.module.scss'; // Reuse the generic modal style

interface Program { id: string; title: string; }
interface SemesterData { id: string; name: string; programId: string; }
interface EditSemesterModalProps {
  semester: SemesterData;
  onClose: () => void;
  onSemesterUpdated: () => void;
}

const EditSemesterModal = ({ semester, onClose, onSemesterUpdated }: EditSemesterModalProps) => {
  const [formData, setFormData] = useState({ name: '', programId: '' });
  const [programs, setPrograms] = useState<Program[]>([]);

  // Fetch programs for the dropdown
  useEffect(() => {
    axios.get('http://localhost:5000/api/programs')
      .then(res => setPrograms(res.data))
      .catch(() => toast.error('Failed to load programs.'));
  }, []);

  // Pre-fill form data when the component receives a semester
  useEffect(() => {
    if (semester) {
      setFormData({
        name: semester.name,
        programId: semester.programId,
      });
    }
  }, [semester]);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      await axios.put(`http://localhost:5000/api/semesters/${semester.id}`, formData);
      toast.success('Semester updated successfully!');
      onSemesterUpdated();
    } catch (err) {
      if (axios.isAxiosError(err) && err.response) {
        toast.error(err.response.data.message || 'Failed to update semester.');
      } else {
        toast.error('An unexpected error occurred.');
      }
    }
  };

  return (
    <div className={styles.modalBackdrop}>
      <div className={styles.modalContent}>
        <h2>Edit Semester</h2>
        <form onSubmit={handleSubmit}>
          <label>Semester Name</label>
          <input type="text" name="name" value={formData.name} onChange={handleChange} required />
          <label>Program</label>
          <select name="programId" value={formData.programId} onChange={handleChange} required>
            <option value="" disabled>-- Select a Program --</option>
            {programs.map(p => <option key={p.id} value={p.id}>{p.title}</option>)}
          </select>
          <div className={styles.buttonGroup}>
            <button type="submit">Save Changes</button>
            <button type="button" onClick={onClose}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditSemesterModal;