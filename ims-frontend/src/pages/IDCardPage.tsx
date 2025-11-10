import { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast'; // 1. Import toast
import styles from '../assets/scss/pages/IDCardPage.module.scss';
import Spinner from '../components/common/Spinner';
import logo from '../assets/image/logo.png';
import { BsPersonSquare } from 'react-icons/bs';
import { useAuth } from '../context/AuthContext'; // 2. Import useAuth

// 3. Updated ProfileData interface
interface ProfileData {
  id: string;
  name: string;
  email: string;
  sID: string;
  role: string;
  student: { // Student has these fields
    admissionDate: string;
    photoUrl?: string;
    phoneNumber?: string;
    bloodGroup?: string;
    programName?: string; 
    durationYears?: number;
  } | null;
  teacher: { // Teacher does NOT have these fields
    dateJoined: string;
    department?: string;
  } | null;
}

// 4. Updated helper functions
const getTitle = (profile: ProfileData) => {
  return profile.student?.programName || profile.teacher?.department || profile.role.replace('_', ' ');
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

// 5. Photo only comes from the student record
const getPhotoUrl = (profile: ProfileData): string | null => {
  const photo = profile.student?.photoUrl;
  return photo ? `http://localhost:5000${photo}` : null;
};

// 6. Phone and Blood Group only come from the student record
const getPhoneNumber = (profile: ProfileData): string | null => {
  return profile.student?.phoneNumber || null;
}
const getBloodGroup = (profile: ProfileData): string | null => {
  return profile.student?.bloodGroup || null;
}

const IDCardPage = () => {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth(); // Get the logged-in user

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const response = await axios.get('http://localhost:5000/api/profile/me');
        setProfile(response.data);
      } catch (err) {
        // 7. Add error handling
        if (axios.isAxiosError(err) && err.response) {
          toast.error(err.response.data.message || 'Failed to fetch profile.');
        } else {
          toast.error('An unexpected error occurred.');
        }
      } finally {
        setLoading(false);
      }
    };
    
    if (user) { // Only fetch if the user is loaded
      fetchProfile();
    }
  }, [user]); // Re-run if user changes

  if (loading) {
    return <Spinner />;
  }
  
  if (!profile) {
    return <p>Could not load profile data.</p>;
  }

  const photoUrl = getPhotoUrl(profile);
  const phoneNumber = getPhoneNumber(profile);
  const bloodGroup = getBloodGroup(profile);
  const sIDLabel = profile.role === 'STUDENT' ? 'SID' : 'Staff ID';

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
              <span className={styles.label}>{sIDLabel}</span>
              <span className={styles.value}>: {profile.sID}</span>
              
              {bloodGroup && (
                <>
                  <span className={styles.label}>BLOOD</span>
                  <span className={styles.value}>: {bloodGroup}</span>
                </>
              )}
              
              {phoneNumber && (
                <>
                  <span className={styles.label}>PHONE</span>
                  <span className={styles.value}>: {phoneNumber}</span>
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
      
      <button className={styles.printButton} onClick={() => window.print()}>
        Print ID Card
      </button>
    </div>
  );
};

export default IDCardPage;