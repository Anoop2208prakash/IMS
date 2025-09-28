import React, { useState, useEffect } from 'react';
import { getCourses } from '../services/courseService';
import { submitApplication } from '../services/admissionService';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
// import styles from './AdmissionPage.module.scss';

interface Course {
  id: string;
  title: string;
}

interface AdmissionFormData {
  fullName: string;
  fatherName: string;
  motherName: string;
  birthDate: string;
  gender: string;
  fullAddress: string;
  religion: string;
  nationality: string;
  phoneNumber: string;
  email: string;
  bloodGroup: string;
  tenthPercentage: string;
  twelfthPercentage: string;
  guardianPhoneNumber: string;
  courseId: string;
  password: string;
  confirmPassword: string;
}

const AdmissionPage = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [formData, setFormData] = useState<AdmissionFormData>({
    fullName: '',
    fatherName: '',
    motherName: '',
    birthDate: '',
    gender: '',
    fullAddress: '',
    religion: '',
    nationality: '',
    phoneNumber: '',
    email: '',
    bloodGroup: '',
    tenthPercentage: '',
    twelfthPercentage: '',
    guardianPhoneNumber: '',
    courseId: '',
    password: '',
    confirmPassword: '',
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    getCourses().then(setCourses).catch(err => console.error("Error fetching courses:", err));
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (!selectedFile) {
      setError('Please upload a student photo.');
      return;
    }

    const data = new FormData();
    Object.keys(formData).forEach(key => {
      data.append(key, formData[key as keyof AdmissionFormData]);
    });
    data.append('studentPhoto', selectedFile);

    try {
      await submitApplication(data);
      alert('Application submitted successfully! You can now log in.');
      navigate('/login');
    } catch (err) {
      if (axios.isAxiosError(err) && err.response) {
        setError(err.response.data.message || 'Failed to submit application.');
      } else {
        setError('An unexpected error occurred.');
      }
    }
  };

  return (
    <div>
      <h2>Admission Form</h2>
      <form onSubmit={handleSubmit}>
        <input name="fullName" placeholder="Student's Name" onChange={handleChange} required />
        <input name="fatherName" placeholder="Father's Name" onChange={handleChange} required />
        <input name="motherName" placeholder="Mother's Name" onChange={handleChange} required />
        <input name="birthDate" type="date" onChange={handleChange} required />
        <input name="gender" placeholder="Gender" onChange={handleChange} required />
        <textarea name="fullAddress" placeholder="Full Address" onChange={handleChange} required />
        <input name="religion" placeholder="Religion" onChange={handleChange} />
        <input name="nationality" placeholder="Nationality" onChange={handleChange} />
        <input name="phoneNumber" placeholder="Phone Number" onChange={handleChange} required />
        <input name="email" type="email" placeholder="Email" onChange={handleChange} required />
        <input name="bloodGroup" placeholder="Blood Group" onChange={handleChange} />
        <input name="tenthPercentage" type="number" placeholder="10th Percentage" onChange={handleChange} required />
        <input name="twelfthPercentage" type="number" placeholder="12th Percentage" onChange={handleChange} required />
        <input name="guardianPhoneNumber" placeholder="Guardian's Mobile" onChange={handleChange} required />
        <select name="courseId" value={formData.courseId} onChange={handleChange} required>
          <option value="">Select a Course</option>
          {courses.map(course => <option key={course.id} value={course.id}>{course.title}</option>)}
        </select>
        <input name="password" type="password" placeholder="Create Password" onChange={handleChange} required />
        <input name="confirmPassword" type="password" placeholder="Confirm Password" onChange={handleChange} required />
        <label>Upload Photo</label>
        <input name="studentPhoto" type="file" onChange={handleFileChange} accept="image/*" required />
        
        {error && <p style={{ color: 'red' }}>{error}</p>}
        
        <button type="submit">Submit Application</button>
      </form>
    </div>
  );
};

export default AdmissionPage;