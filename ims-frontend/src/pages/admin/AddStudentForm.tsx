import React, { useState, useEffect } from 'react';
import axios from 'axios';
import styles from './AddTeacherForm.module.scss';

interface Course {
  id: string;
  title: string;
}

interface AddStudentFormProps {
  onStudentAdded: () => void;
  onCancel: () => void;
}

const AddStudentForm = ({ onStudentAdded, onCancel }: AddStudentFormProps) => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    courseId: '', // Will hold the ID of the selected course
  });
  const [courses, setCourses] = useState<Course[]>([]); // State to hold the list of courses
  const [error, setError] = useState('');

  // 1. Fetch courses when the component mounts
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/courses');
        setCourses(response.data);
        // Set the default selection to the first course if available
        if (response.data.length > 0) {
          setFormData(prev => ({ ...prev, courseId: response.data[0].id }));
        }
      } catch (err) {
        console.error("Failed to fetch courses", err);
        setError("Could not load courses for selection.");
      }
    };
    fetchCourses();
  }, []); // Empty array ensures this runs only once

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!formData.courseId) {
      setError('Please select a course.');
      return;
    }
    try {
      await axios.post('http://localhost:5000/api/students', formData);
      onStudentAdded();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to add student.');
    }
  };

  return (
    <div className={styles.formContainer}>
      <h3>Add New Student</h3>
      <form onSubmit={handleSubmit}>
        <input type="text" name="fullName" placeholder="Full Name" onChange={handleChange} required />
        <input type="email" name="email" placeholder="Email" onChange={handleChange} required />
        <input type="password" name="password" placeholder="Temporary Password" onChange={handleChange} required />
        
        {/* 2. Replace text input with a dropdown menu */}
        <select name="courseId" value={formData.courseId} onChange={handleChange} required>
          <option value="" disabled>-- Select a Course --</option>
          {/* 3. Dynamically create an option for each course */}
          {courses.map(course => (
            <option key={course.id} value={course.id}>
              {course.title}
            </option>
          ))}
        </select>
        
        {error && <p className={styles.error}>{error}</p>}
        <div className={styles.buttonGroup}>
          <button type="submit">Add Student</button>
          <button type="button" onClick={onCancel}>Cancel</button>
        </div>
      </form>
    </div>
  );
};

export default AddStudentForm;