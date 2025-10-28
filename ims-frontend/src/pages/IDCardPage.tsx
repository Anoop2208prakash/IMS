import { useState, useEffect } from 'react';
import axios from 'axios';
import styles from '../assets/scss/pages/IDCardPage.module.scss';
import Spinner from '../components/common/Spinner';
import logo from '../assets/image/logo.png'; // Assuming this is the university crest logo
import { BsPersonSquare } from 'react-icons/bs'; // Import the placeholder icon

// 1. Updated ProfileData interface to include all required fields
interface ProfileData {
  id: string;
  name: string;
  email: string;
  role: string;
  student?: {
    rollNumber: string;
    admissionDate: string;
    photoUrl?: string;
    phoneNumber?: string;
    bloodGroup?: string;
    // These fields are from our new Program/Subject structure
    programName?: string; 
    durationYears?: number;
  };
  teacher?: {
    employeeId: string;
    dateJoined: string;
    department?: string;
    photoUrl?: string;
  };
}

// 2. Helper functions to get the correct data
const getIdentifier = (profile: ProfileData) => {
  return profile.student?.rollNumber || profile.teacher?.employeeId || 'N/A';
};

const getTitle = (profile: ProfileData) => {
  // This logic now checks for the student's program name
  return profile.student?.programName || profile.teacher?.department || profile.role;
};

const getJoinDate = (profile: ProfileData) => {
  const dateStr = profile.student?.admissionDate || profile.teacher?.dateJoined;
  return dateStr ? new Date(dateStr).toLocaleDateString('en-GB') : 'N/A';
};

const getExpireDate = (profile: ProfileData) => {
  if (profile.student && profile.student.admissionDate && profile.student.durationYears) {
    const joinDate = new Date(profile.student.admissionDate);
    joinDate.setFullYear(joinDate.getFullYear() + profile.student.durationYears);
    return joinDate.toLocaleDateString('en-GB');
  }
  return 'N/A'; // Or a static date for teachers
};

const getPhotoUrl = (profile: ProfileData): string | null => {
  const photo = profile.student?.photoUrl || profile.teacher?.photoUrl;
  return photo ? `http://localhost:5000${photo}` : null;
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

  if (loading) {
    return <Spinner />;
  }
  
  if (!profile) return <p>Could not load profile data.</p>;

  const photoUrl = getPhotoUrl(profile);
  const { student } = profile;
  const isStudent = student && profile.role === 'STUDENT';

  return (
    <div className={styles.pageContainer}>
      <div className={styles.idCard}>
        
        <div className={styles.topClip}></div>
        <div className={styles.cardBody}>
          <div className={styles.photo}>
            {/* 3. Use the icon if no photoUrl exists */}
            {photoUrl ? (
              <img src={photoUrl} alt="Profile" />
            ) : (
              <BsPersonSquare className={styles.photoIcon} />
            )}
          </div>

          <div className={styles.details}>
            <p className={styles.name}>{profile.name}</p>
            <p className={styles.title}>{getTitle(profile)}</p>

            <div className={styles.infoGrid}>
              <span className={styles.label}>CODE</span>
              <span className={styles.value}>: {getIdentifier(profile)}</span>
              
              {profile.student?.bloodGroup && (
                <>
                  <span className={styles.label}>BLOOD</span>
                  <span className={styles.value}>: {profile.student.bloodGroup}</span>
                </>
              )}
              
              {profile.student?.phoneNumber && (
                <>
                  <span className={styles.label}>PHONE</span>
                  <span className={styles.value}>: {profile.student.phoneNumber}</span>
                </>
              )}
              
              <span className={styles.label}>EMAIL</span>
              <span className={styles.value}>: {profile.email}</span>
            </div>
          </div>

          <div className={styles.footer}>
            <img src={logo} alt="Company Logo" className={styles.companyLogo} />
            <div className={styles.dates}>
              <p>
                <span className={styles.label}>Join</span>
                <span className={styles.value}>: {getJoinDate(profile)}</span>
              </p>
              <p>
                <span className={styles.label}>Expire</span>
                <span className={styles.value}>: {getExpireDate(profile)}</span>
              </p>
            </div>
          </div>
        </div>
      </div>
      
      <button className={styles.printButton} onClick={() => globalThis.print()}>
        Print ID Card
      </button>
    </div>
  );
};

export default IDCardPage;