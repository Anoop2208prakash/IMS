import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import styles from './IDCardPage.module.scss';

interface ProfileData {
  id: string; name: string; email: string; role: string;
  student?: { rollNumber: string; };
  teacher?: { employeeId: string; };
}

// Helper function to get the correct title for the card
const getCardTitle = (role: string) => {
  if (role === 'STUDENT') return 'STUDENT ID CARD';
  return 'STAFF ID CARD';
};

// Helper function to get the correct ID number
const getIdentifier = (profile: ProfileData) => {
  if (profile.student) return profile.student.rollNumber;
  if (profile.teacher) return profile.teacher.employeeId;
  return profile.id.substring(0, 8).toUpperCase(); // Fallback for Admins
};

const IDCardPage = () => {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/profile/me');
        setProfile(response.data);
      } catch (err) {
        console.error("Failed to fetch profile", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  if (loading) return <p>Loading ID Card...</p>;
  if (!profile) return <p>Could not load profile data.</p>;

  return (
    <div className={styles.pageContainer}>
      <div className={styles.idCard}>
        <div className={styles.header}>
          <h3>Institute of Technology</h3>
          <h4>{getCardTitle(profile.role)}</h4>
        </div>
        <div className={styles.content}>
          <div className={styles.photo}>
            <span>PHOTO</span>
          </div>
          <div className={styles.details}>
            <p><strong>Name:</strong> {profile.name}</p>
            <p><strong>ID:</strong> {getIdentifier(profile)}</p>
            <p><strong>Role:</strong> {profile.role}</p>
            <p><strong>Valid Until:</strong> 12/2028</p>
          </div>
        </div>
      </div>
      <button className={styles.printButton} onClick={() => window.print()}>
        Print ID Card
      </button>
    </div>
  );
};

export default IDCardPage;