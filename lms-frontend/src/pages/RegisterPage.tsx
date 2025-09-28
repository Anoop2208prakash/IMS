import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { registerUser } from '../services/authService';
import { getCourses } from '../services/courseService';
import type { RegisterUserData } from '../types';
import axios from 'axios';

interface Course {
  id: string;
  title: string;
}

const RegisterPage = () => {
  const [formData, setFormData] = useState<RegisterUserData>({
    name: '',
    email: '',
    password: '',
    rollNumber: '',
    admissionDate: '',
    courseId: '',
  });
  const [courses, setCourses] = useState<Course[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const data = await getCourses();
        setCourses(data);
      } catch (error) {
        console.error("Failed to fetch courses", error);
      }
    };
    fetchCourses();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await registerUser(formData);
      alert('Registration successful! Redirecting to login...');
      navigate('/login');
    } catch (err) {
      if (axios.isAxiosError(err) && err.response) {
        setError(err.response.data.message || 'An unexpected error occurred.');
      } else {
        setError('An unexpected error occurred.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2>Student Registration</h2>
      <form onSubmit={handleSubmit}>
        <input name="name" type="text" value={formData.name} onChange={handleChange} placeholder="Full Name" required />
        <input name="email" type="email" value={formData.email} onChange={handleChange} placeholder="Email Address" required />
        <input name="password" type="password" value={formData.password} onChange={handleChange} placeholder="Password" required />
        <input name="rollNumber" type="text" value={formData.rollNumber} onChange={handleChange} placeholder="Roll Number" required />
        <input name="admissionDate" type="date" value={formData.admissionDate} onChange={handleChange} required />
        
        <select name="courseId" value={formData.courseId} onChange={handleChange} required>
          <option value="">-- Select a Course --</option>
          {courses.map(course => (
            <option key={course.id} value={course.id}>
              {course.title}
            </option>
          ))}
        </select>
        
        {error && <p style={{ color: 'red' }}>{error}</p>}
        
        <button type="submit" disabled={loading}>
          {loading ? 'Registering...' : 'Register'}
        </button>
      </form>
    </div>
  );
};

export default RegisterPage; 