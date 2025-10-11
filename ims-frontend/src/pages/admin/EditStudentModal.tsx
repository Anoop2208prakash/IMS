import React, { useState, useEffect } from 'react';
import axios from 'axios';
// We can reuse the same modal styles from the teacher edit modal
import styles from './EditTeacherModal.module.scss'; 

// This interface should match the one in ManageStudentsPage.tsx
interface StudentData {
  id: string;
  name: string;
  email: string;
  student: {
    rollNumber: string;
    admissionDate: string;
  };
  enrollments: Array<{ course: { title: string; } }>;
}

interface EditStudentModalProps {
  student: StudentData;
  onClose: () => void;
  onStudentUpdated: () => void;
}

const EditStudentModal = ({ student, onClose, onStudentUpdated }: EditStudentModalProps) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    rollNumber: '',
  });
  const [error, setError] = useState('');

  // This effect runs when the component receives a new 'student' prop,
  // pre-filling the form with their current data.
  useEffect(() => {
    if (student) {
      setFormData({
        name: student.name,
        email: student.email,
        rollNumber: student.student.rollNumber,
      });
    }
  }, [student]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await axios.put(`http://localhost:5000/api/students/${student.id}`, formData);
      onStudentUpdated(); // Notify parent to refresh and close
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update student.');
    }
  };

  return (
    <div className={styles.modalBackdrop}>
      <div className={styles.modalContent}>
        <h2>Edit Student</h2>
        <form onSubmit={handleSubmit}>
          <label>Name</label>
          <input type="text" name="name" value={formData.name} onChange={handleChange} required />

          <label>Email</label>
          <input type="email" name="email" value={formData.email} onChange={handleChange} required />
          
          <label>Roll Number</label>
          <input type="text" name="rollNumber" value={formData.rollNumber} onChange={handleChange} required />
          
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

export default EditStudentModal;