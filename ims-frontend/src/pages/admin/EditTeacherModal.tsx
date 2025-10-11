// src/components/admin/EditTeacherModal.tsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import styles from './EditTeacherModal.module.scss';

interface TeacherData { /* ... same interface from ManageTeachersPage ... */ }

interface EditTeacherModalProps {
  teacher: TeacherData;
  onClose: () => void;
  onTeacherUpdated: () => void;
}

const EditTeacherModal = ({ teacher, onClose, onTeacherUpdated }: EditTeacherModalProps) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    department: '',
  });
  const [error, setError] = useState('');

  useEffect(() => {
    // Pre-fill the form when the component mounts with teacher data
    if (teacher) {
      setFormData({
        name: teacher.name,
        email: teacher.email,
        department: teacher.teacher.department,
      });
    }
  }, [teacher]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await axios.put(`http://localhost:5000/api/teachers/${teacher.id}`, formData);
      onTeacherUpdated();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update teacher.');
    }
  };

  return (
    <div className={styles.modalBackdrop}>
      <div className={styles.modalContent}>
        <h2>Edit Teacher</h2>
        <form onSubmit={handleSubmit}>
          <input type="text" name="name" value={formData.name} onChange={handleChange} required />
          <input type="email" name="email" value={formData.email} onChange={handleChange} required />
          <input type="text" name="department" value={formData.department} onChange={handleChange} required />
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

export default EditTeacherModal;