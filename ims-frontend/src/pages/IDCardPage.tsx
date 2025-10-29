import { useState, useEffect } from 'react';
import axios from 'axios';
import styles from '../assets/scss/pages/IDCardPage.module.scss';
import Spinner from '../components/common/Spinner';
import logo from '../assets/image/logo.png';
import { BsPersonSquare } from 'react-icons/bs';

// 1. Updated ProfileData interface
interface ProfileData {
  id: string;
  name: string;
  email: string;
  sID: string; // <-- This is the new ID
  role: string;
  student?: {
    // rollNumber: string; // <-- Removed
    admissionDate: string;
    photoUrl?: string;
    phoneNumber?: string;
    bloodGroup?: string;
    programName?: string; 
    durationYears?: number;
  };
  teacher?: {
    // employeeId: string; // <-- Removed
    dateJoined: string;
    department?: string;
    photoUrl?: string;
  };
}

// 2. Updated helper functions
const getIdentifier = (profile: ProfileData) => {
  return profile.sID; // Just return the sID
};

const getTitle = (profile: ProfileData) => {
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
  return 'N/A';
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
  
  if (!profile) {
    // This message will now only appear if the API call truly fails
    return <p>Could not load profile data.</p>;
  }

  const photoUrl = getPhotoUrl(profile);
  const { student } = profile;
  const isStudent = student && profile.role === 'STUDENT';

  return (
    <div className={styles.pageContainer}>
      <div className={styles.idCard}>
        
        <div className={styles.topClip}></div>
        <div className={styles.cardBody}>
          <div className={styles.photo}>
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
              <span className={styles.label}>{isStudent ? 'SID' : 'ID'}</span>
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