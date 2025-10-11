import React, { useState, useEffect } from 'react';
import axios from 'axios';
import styles from './EditTeacherModal.module.scss'; // Reuse styles

interface CourseData {
  id: string;
  title: string;
  courseCode: string;
  credits: number;
}

interface EditCourseModalProps {
  course: CourseData;
  onClose: () => void;
  onCourseUpdated: () => void;
}

const EditCourseModal = ({ course, onClose, onCourseUpdated }: EditCourseModalProps) => {
  const [formData, setFormData] = useState({ title: '', courseCode: '', credits: 0 });
  const [error, setError] = useState('');

  useEffect(() => {
    if (course) {
      setFormData({
        title: course.title,
        courseCode: course.courseCode,
        credits: course.credits,
      });
    }
  }, [course]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'number' ? parseInt(value) || 0 : value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await axios.put(`http://localhost:5000/api/courses/${course.id}`, formData);
      onCourseUpdated();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update course.');
    }
  };

  return (
    <div className={styles.modalBackdrop}>
      <div className={styles.modalContent}>
        <h2>Edit Course</h2>
        <form onSubmit={handleSubmit}>
          <label>Title</label>
          <input type="text" name="title" value={formData.title} onChange={handleChange} required />
          <label>Course Code</label>
          <input type="text" name="courseCode" value={formData.courseCode} onChange={handleChange} required />
          <label>Credits</label>
          <input type="number" name="credits" value={formData.credits} onChange={handleChange} required />
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

export default EditCourseModal;