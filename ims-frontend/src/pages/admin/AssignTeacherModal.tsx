import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import styles from './EditModal.module.scss'; // Reuse modal styles

interface SubjectData { id: string; title: string; }
interface TeacherData { id: string; name: string; }

interface AssignTeacherModalProps {
  subject: SubjectData;
  onClose: () => void;
  onTeacherAssigned: () => void;
}

const AssignTeacherModal = ({ subject, onClose, onTeacherAssigned }: AssignTeacherModalProps) => {
  const [teachers, setTeachers] = useState<TeacherData[]>([]);
  const [selectedTeacherId, setSelectedTeacherId] = useState('');

  // Fetch all available teachers for the dropdown
  useEffect(() => {
    axios.get('http://localhost:5000/api/teachers')
      .then(res => {
        setTeachers(res.data);
        if (res.data.length > 0) {
          setSelectedTeacherId(res.data[0].id); // Default to the first teacher
        }
      })
      .catch(() => toast.error('Failed to load teachers.'));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTeacherId) {
      toast.error('Please select a teacher.');
      return;
    }
    try {
      await axios.post(
        `http://localhost:5000/api/subjects/${subject.id}/assign-teacher`,
        { teacherId: selectedTeacherId }
      );
      toast.success('Teacher assigned successfully!');
      onTeacherAssigned();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to assign teacher.');
    }
  };

  return (
    <div className={styles.modalBackdrop}>
      <div className={styles.modalContent}>
        <h2>Assign Teacher to "{subject.title}"</h2>
        <form onSubmit={handleSubmit}>
          <label>Select Teacher</label>
          <select value={selectedTeacherId} onChange={(e) => setSelectedTeacherId(e.target.value)}>
            {teachers.map(teacher => (
              <option key={teacher.id} value={teacher.id}>{teacher.name}</option>
            ))}
          </select>
          <div className={styles.buttonGroup}>
            <button type="submit">Assign</button>
            <button type="button" onClick={onClose}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AssignTeacherModal;