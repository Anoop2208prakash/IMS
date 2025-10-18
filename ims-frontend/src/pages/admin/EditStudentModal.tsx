import React, { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import styles from './EditModal.module.scss'; // Use the generic EditModal style

// 1. Update the interface to match the data from the parent page
interface StudentData {
  id: string;
  name: string;
  email: string;
  student: {
    rollNumber: string;
  };
  programName: string; // This is just for display, not editing
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

  // 2. Pre-fill the form with the correct data structure
  useEffect(() => {
    if (student) {
      setFormData({
        name: student.name,
        email: student.email,
        rollNumber: student.student.rollNumber,
      });
    }
  }, [student]);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      // 3. Send the updated data to the API
      await axios.put(`http://localhost:5000/api/students/${student.id}`, formData);
      toast.success('Student updated successfully!');
      onStudentUpdated();
    } catch (err) {
      if (axios.isAxiosError(err) && err.response) {
        toast.error(err.response.data.message || 'Failed to update student.');
      } else {
        toast.error('An unexpected error occurred.');
      }
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