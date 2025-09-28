import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getMyStudentProfile } from '../services/userService';
import styles from './IDCardPage.module.scss';

// Helper function to get the title based on the user's role
const getCardTitle = (role: string | undefined) => {
  switch (role) {
    case 'ADMIN':
    case 'SUPER_ADMIN':
    case 'ADMIN_LIBRARY':
    case 'ADMIN_UNIFORMS':
    case 'ADMIN_STATIONERY':
      return 'STAFF ID CARD';
    case 'USER':
    default:
      return 'STUDENT ID CARD';
  }
};

interface StudentProfile {
  rollNumber: string;
  profileImageUrl?: string;
}

const IDCardPage = () => {
  const { user } = useAuth();
  const [student, setStudent] = useState<StudentProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Only fetch student-specific data if the user is a student
    if (user?.role === 'USER') {
      const fetchStudentProfile = async () => {
        try {
          const data = await getMyStudentProfile();
          setStudent(data);
        } catch (error) {
          console.error("Failed to fetch student profile", error);
        } finally {
          setLoading(false);
        }
      };
      fetchStudentProfile();
    } else {
      setLoading(false); // No student profile needed for admins
    }
  }, [user]);

  if (loading) return <div>Loading ID Card...</div>;

  return (
    <div className={styles.container}>
      <div className={styles.idCard}>
        <div className={styles.header}>
          <h3>{getCardTitle(user?.role)}</h3>
        </div>
        <div className={styles.content}>
          <div className={styles.photo}>
            {student?.profileImageUrl ? (
              <img src={`http://localhost:8080${student.profileImageUrl}`} alt="Profile" />
            ) : (
              <span>PHOTO</span>
            )}
          </div>
          <div className={styles.details}>
            <p><strong>Name:</strong> {user?.name}</p>
            <p><strong>ID:</strong> {student?.rollNumber || user?.userId.substring(0, 8).toUpperCase()}</p>
            <p><strong>Role:</strong> {user?.role}</p>
            <p><strong>Valid Until:</strong> 12/2026</p>
          </div>
        </div>
        <div className={styles.footer}>
          <strong>Institute of Technology</strong>
        </div>
      </div>
      <button className={styles.printButton} onClick={() => window.print()}>
        Print ID Card
      </button>
    </div>
  );
};

export default IDCardPage;