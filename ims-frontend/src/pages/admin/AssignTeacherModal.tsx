import React, { useState, useEffect } from 'react';
import axios from 'axios';
import styles from './EditTeacherModal.module.scss'; // Reuse styles

interface CourseData { id: string; title: string; /* ... */ }
interface TeacherData { id: string; name: string; /* ... */ }

interface AssignTeacherModalProps {
  course: CourseData;
  onClose: () => void;
  onTeacherAssigned: () => void;
}

const AssignTeacherModal = ({ course, onClose, onTeacherAssigned }: AssignTeacherModalProps) => {
  const [teachers, setTeachers] = useState<TeacherData[]>([]);
  const [selectedTeacherId, setSelectedTeacherId] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchTeachers = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/teachers');
        setTeachers(response.data);
        if (response.data.length > 0) {
          setSelectedTeacherId(response.data[0].id);
        }
      } catch (err) {
        setError('Failed to load teachers.');
      }
    };
    fetchTeachers();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await axios.post(
        `http://localhost:5000/api/courses/${course.id}/assign-teacher`,
        { teacherId: selectedTeacherId }
      );
      onTeacherAssigned();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to assign teacher.');
    }
  };

  return (
    <div className={styles.modalBackdrop}>
      <div className={styles.modalContent}>
        <h2>Assign Teacher to "{course.title}"</h2>
        <form onSubmit={handleSubmit}>
          <label>Select Teacher</label>
          <select 
            value={selectedTeacherId} 
            onChange={(e) => setSelectedTeacherId(e.target.value)}
          >
            {teachers.map(teacher => (
              <option key={teacher.id} value={teacher.id}>{teacher.name}</option>
            ))}
          </select>
          {error && <p className={styles.error}>{error}</p>}
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