import React, { useState, useEffect } from 'react';
import axios from 'axios';
import styles from './NewAdmissionPage.module.scss';

interface Course { id: string; title: string; }

const NewAdmissionPage = () => {
  const [formData, setFormData] = useState({ fullName: '', email: '', password: '', courseId: '' });
  const [courses, setCourses] = useState<Course[]>([]);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    // Fetch courses to populate the dropdown
    axios.get('http://localhost:5000/api/courses')
      .then(res => {
        setCourses(res.data);
        if (res.data.length > 0) {
          setFormData(prev => ({ ...prev, courseId: res.data[0].id }));
        }
      })
      .catch(() => setError('Could not load courses.'));
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    setError('');
    try {
      // POST to the secure student creation endpoint
      await axios.post('http://localhost:5000/api/students', formData);
      setMessage(`Student "${formData.fullName}" admitted successfully!`);
      // Clear the form for the next entry
      setFormData({ fullName: '', email: '', password: '', courseId: courses[0]?.id || '' });
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to admit student.');
    }
  };

  return (
    <div className={styles.container}>
      <form onSubmit={handleSubmit} className={styles.form}>
        <h2>New Student Admission</h2>
        <div className={styles.formGroup}>
          <label>Full Name</label>
          <input type="text" name="fullName" value={formData.fullName} onChange={handleChange} required />
        </div>
        <div className={styles.formGroup}>
          <label>Email Address</label>
          <input type="email" name="email" value={formData.email} onChange={handleChange} required />
        </div>
        <div className={styles.formGroup}>
          <label>Temporary Password</label>
          <input type="password" name="password" value={formData.password} onChange={handleChange} required />
        </div>
        <div className={styles.formGroup}>
          <label>Course</label>
          <select name="courseId" value={formData.courseId} onChange={handleChange} required>
            <option value="" disabled>-- Select a Course --</option>
            {courses.map(course => <option key={course.id} value={course.id}>{course.title}</option>)}
          </select>
        </div>
        <button type="submit" className={styles.submitButton}>Admit Student</button>
        {message && <p className={styles.successMessage}>{message}</p>}
        {error && <p className={styles.errorMessage}>{error}</p>}
      </form>
    </div>
  );
};

export default NewAdmissionPage;