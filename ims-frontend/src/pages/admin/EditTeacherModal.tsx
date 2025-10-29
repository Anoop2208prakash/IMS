import React, { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
// This uses the correct path based on your file structure screenshot
import styles from '../../assets/scss/pages/admin/AdminPages.module.scss'; 

// 1. Define the data structure for a teacher
interface TeacherData {
  id: string;
  name: string;
  email: string;
  sID: string; // Use the new sID
  teacher: {
    department: string;
  };
}

// 2. Define the props that this component accepts
interface EditTeacherModalProps {
  teacher: TeacherData;
  onClose: () => void;
  onTeacherUpdated: () => void;
}

// 3. Accept the props
const EditTeacherModal = ({ teacher, onClose, onTeacherUpdated }: EditTeacherModalProps) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    sID: '',
    department: '',
  });

  // 4. Pre-fill the form with the teacher's data
  useEffect(() => {
    if (teacher) {
      setFormData({
        name: teacher.name,
        email: teacher.email,
        sID: teacher.sID,
        department: teacher.teacher.department,
      });
    }
  }, [teacher]);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      // Send all updated fields to the backend
      await axios.put(`http://localhost:5000/api/teachers/${teacher.id}`, formData);
      toast.success('Teacher updated successfully!');
      onTeacherUpdated();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to update teacher.');
    }
  };

  return (
    <div className={styles.modalBackdrop}>
      <div className={styles.modalContent}>
        <h2>Edit Teacher</h2>
        <form onSubmit={handleSubmit}>
          <label>Name</label>
          <input type="text" name="name" value={formData.name} onChange={handleChange} required />
          <label>Email</label>
          <input type="email" name="email" value={formData.email} onChange={handleChange} required />
          <label>SID</label>
          <input type="text" name="sID" value={formData.sID} onChange={handleChange} required />
          <label>Department</label>
          <input type="text" name="department" value={formData.department} onChange={handleChange} required />
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