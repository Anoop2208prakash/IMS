import { useState, ChangeEvent, FormEvent } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useNavigate, Link } from 'react-router-dom';
import styles from '../assets/scss/pages/StaffRegisterPage.module.scss'; // 1. Use the NEW stylesheet
import { FaUserPlus, FaCamera } from 'react-icons/fa';
import ButtonSpinner from '../components/common/ButtonSpinner';

// 2. REMOVE the generateRandomSID function

const StaffRegisterPage: React.FC = () => {
  // 3. REMOVE sID from the initial state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phoneNumber: '',
    dob: '',
    role: 'SUPER_ADMIN', // Default to SUPER_ADMIN
    department: '',
    bloodGroup: '',
    dateJoined: new Date().toISOString().split('T')[0],
  });

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const roleOptions = [
    { value: 'SUPER_ADMIN', label: 'Super Admin' },
    { value: 'TEACHER', label: 'Teacher' },
    { value: 'ADMIN', label: 'Admin' },
    { value: 'ADMIN_LIBRARY', label: 'Library Admin' },
    { value: 'ADMIN_ADMISSION', label: 'Admission Admin' },
    { value: 'ADMIN_FINANCE', label: 'Finance Admin' },
  ];

  const bloodGroupOptions = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    setFormData(prev => {
      const newState = { ...prev, [name]: value };
      if (name === 'role' && value !== 'TEACHER') {
        newState.department = '';
      }
      return newState;
    });
  };

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!imageFile) {
      toast.error('Profile image is required.');
      return;
    }
    
    setLoading(true);

    const submissionData = new FormData();
    submissionData.append('profileImage', imageFile);
    
    // 4. Loop through formData (sID is no longer in it)
    Object.keys(formData).forEach(key => {
      submissionData.append(key, formData[key as keyof typeof formData]);
    });
    
    submissionData.append('fullName', formData.name); // Match backend controller

    const promise = axios.post('http://localhost:5000/api/staff/register', submissionData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });

    toast.promise(promise, {
      loading: 'Creating staff member...',
      success: (res) => {
        navigate('/login'); // Go to login page on success
        return `${res.data.message}. Please log in.`;
      },
      error: (err) => err.response?.data?.message || 'Failed to create staff member.'
    }).finally(() => {
      setLoading(false);
    });
  };

  return (
    <div className={styles.pageWrapper}>
      <form className={styles.form} onSubmit={handleSubmit}>
        
        <div className={styles.header}>
          <h2><FaUserPlus /> Staff Registration (Temporary)</h2>
        </div>

        <div className={styles.formBody}>
          <div className={styles.contentWrapper}>
            
            <div className={styles.imageUploadColumn}>
              <div className={styles.formGroup}>
                <label>Profile Image</label>
                <div>
                  <input
                    type="file"
                    id="profileImage"
                    accept="image/*"
                    onChange={handleImageChange}
                    className={styles.fileInput}
                    required
                    disabled={loading}
                  />
                  <label htmlFor="profileImage" className={styles.imageUploadLabel}>
                    {imagePreview ? (
                      <img src={imagePreview} alt="Profile Preview" className={styles.imagePreview} />
                    ) : (
                      <div className={styles.imagePlaceholder}>
                        <FaCamera />
                        <span>Upload Photo</span>
                      </div>
                    )}
                  </label>
                </div>
              </div>
            </div>

            <div className={styles.fieldsColumn}>
              <div className={styles.formGrid}>
                <div className={styles.formGroup}>
                  <label htmlFor="name">Full Name</label>
                  <input
                    id="name" type="text" name="name"
                    value={formData.name} onChange={handleChange} required disabled={loading}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="email">Email</label>
                  <input
                    id="email" type="email" name="email"
                    value={formData.email} onChange={handleChange} required disabled={loading}
                  />
                </div>
                
                {/* 5. REMOVED the sID input field */}

                <div className={styles.formGroup}>
                  <label htmlFor="password">Password</label>
                  <input
                    id="password" type="password" name="password"
                    value={formData.password} onChange={handleChange} required disabled={loading}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="phoneNumber">Phone Number</label>
                  <input
                    id="phoneNumber" type="tel" name="phoneNumber"
                    value={formData.phoneNumber} onChange={handleChange} disabled={loading}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="dob">Date of Birth</label>
                  <input
                    id="dob" type="date" name="dob"
                    value={formData.dob} onChange={handleChange} required disabled={loading}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="role">Role</label>
                  <select
                    id="role" name="role"
                    value={formData.role} onChange={handleChange} disabled={loading}
                  >
                    {roleOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>

                {formData.role === 'TEACHER' && (
                  <div className={styles.formGroup}>
                    <label htmlFor="department">Department</label>
                    <input
                      id="department" type="text" name="department"
                      value={formData.department} onChange={handleChange}
                      placeholder="e.g., Computer Science"
                      required={formData.role === 'TEACHER'}
                      disabled={loading}
                    />
                  </div>
                )}

                <div className={styles.formGroup}>
                  <label htmlFor="bloodGroup">Blood Group</label>
                  <select
                    id="bloodGroup" name="bloodGroup"
                    value={formData.bloodGroup} onChange={handleChange} disabled={loading}
                  >
                    <option value="">Select...</option>
                    {bloodGroupOptions.map((bg) => (
                      <option key={bg} value={bg}>{bg}</option>
                    ))}
                  </select>
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="dateJoined">Date Joined</label>
                  <input
                    id="dateJoined" type="date" name="dateJoined"
                    value={formData.dateJoined} onChange={handleChange} required disabled={loading}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className={styles.formActions}>
          <Link to="/login" className={styles.cancelButton}>
            Back to Login
          </Link>
          <button 
            type="submit" 
            className={styles.submitButton}
            disabled={loading}
          >
            {loading ? <ButtonSpinner /> : 'Register'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default StaffRegisterPage;