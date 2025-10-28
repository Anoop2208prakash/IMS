// src/pages/ProfilePage.tsx
import { useState, useEffect } from 'react';
import axios from 'axios';
import styles from '../assets/scss/pages/ProfilePage.module.scss';

interface ProfileData {
  id: string;
  name: string;
  email: string;
  role: string;
  student?: { rollNumber: string; admissionDate: string; };
  teacher?: { employeeId: string; department: string; };
}

const ProfilePage = () => {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/profile/me');
        setProfile(response.data);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to fetch profile.');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  if (loading) return <p>Loading profile...</p>;
  if (error) return <p style={{ color: 'red' }}>{error}</p>;
  if (!profile) return <p>No profile data found.</p>;

  return (
    <div className={styles.profileContainer}>
      <div className={styles.profileCard}>
        <h2>My Profile</h2>
        <div className={styles.profileInfo}>
          <p><strong>Name:</strong> {profile.name}</p>
          <p><strong>Email:</strong> {profile.email}</p>
          <p><strong>Role:</strong> {profile.role}</p>
        </div>
        <hr />
        {/* Conditionally render role-specific details */}
        {profile.student && (
          <div className={styles.roleDetails}>
            <h3>Student Details</h3>
            <p><strong>Roll Number:</strong> {profile.student.rollNumber}</p>
            <p><strong>Admission Date:</strong> {new Date(profile.student.admissionDate).toLocaleDateString()}</p>
          </div>
        )}
        {profile.teacher && (
          <div className={styles.roleDetails}>
            <h3>Teacher Details</h3>
            <p><strong>Employee ID:</strong> {profile.teacher.employeeId}</p>
            <p><strong>Department:</strong> {profile.teacher.department}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;