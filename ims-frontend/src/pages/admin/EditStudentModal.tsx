import React, { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import styles from '../../assets/scss/pages/admin/EditModal.module.scss'; // Use the correct path

// 1. This interface now matches the one in ManageStudentsPage.tsx
interface StudentData {
  id: string;
  name: string;
  email: string;
  sID: string; // <-- Use sID
  student: {
    admissionDate: string;
  };
  programName: string;
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
    sID: '', // <-- Use sID
  });

  // 2. Pre-fill the form with the correct data
  useEffect(() => {
    if (student) {
      setFormData({
        name: student.name,
        email: student.email,
        sID: student.sID, // <-- Use sID
      });
    }
  }, [student]);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      // 3. Send sID to the backend (as required by student.controller.ts)
      await axios.put(`http://localhost:5000/api/students/${student.id}`, formData);
      toast.success('Student updated successfully!');
      onStudentUpdated();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to update student.');
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
          
          <label>SID</label>
          <input type="text" name="sID" value={formData.sID} onChange={handleChange} required />

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