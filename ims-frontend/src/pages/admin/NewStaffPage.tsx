import { useState, ChangeEvent, FormEvent } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import styles from '../../assets/scss/pages/admin/admission/NewAdmissionPage.module.scss'; // Re-use Admission styles
import logo from '../../assets/image/banner-logo.png';
import ButtonSpinner from '../../components/common/ButtonSpinner';

const NewStaffPage = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    role: 'TEACHER',
    department: '',
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Make sure department is only sent if role is TEACHER
    const payload = {
      ...formData,
      department: formData.role === 'TEACHER' ? formData.department : undefined,
    };

    try {
      const response = await axios.post('http://localhost:5000/api/staff/register', payload);
      toast.success(response.data.message);
      // Reset form
      setFormData({
        fullName: '', email: '', password: '', role: 'TEACHER', department: '',
      });
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to submit registration.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.pageWrapper}>
      <form onSubmit={handleSubmit} className={styles.admissionForm}>
        {/* --- Header --- */}
        <div className={styles.header}>
          <div className={styles.headerContent}>
            <div className={styles.logoArea}>
              <img src={logo} alt="Institute Logo" className={styles.logo} />
              <div>
                <h1>Institute of Technology</h1>
                <p>Staff Registration Form</p>
              </div>
            </div>
            {/* We can add a photo box here later if needed */}
          </div>
        </div>

        {/* --- Form Body --- */}
        <div className={styles.formBody}>
          {/* --- Basic Info Section --- */}
          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label htmlFor="fullName">Full Name</label>
              <input type="text" name="fullName" id="fullName" value={formData.fullName} onChange={handleChange} required />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="email">Email Address</label>
              <input type="email" name="email" id="email" value={formData.email} onChange={handleChange} required />
            </div>
          </div>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label htmlFor="password">Temporary Password</label>
              <input type="password" name="password" id="password" value={formData.password} onChange={handleChange} required />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="role">Role</label>
              <select name="role" id="role" value={formData.role} onChange={handleChange}>
                <option value="TEACHER">Teacher</option>
                <option value="ADMIN">Admin</option>
                <option value="ADMIN_ADMISSION">Admin (Admission)</option>
                <option value="ADMIN_FINANCE">Admin (Finance)</option>
                <option value="ADMIN_LIBRARY">Admin (Library)</option>
                <option value="SUPER_ADMIN">Super Admin</option>
              </select>
            </div>
          </div>

          {/* Conditional field for Teacher role */}
          {formData.role === 'TEACHER' && (
            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label htmlFor="department">Department</label>
                <input 
                  type="text" 
                  name="department" 
                  id="department" 
                  value={formData.department} 
                  onChange={handleChange} 
                  placeholder="e.g., Computer Science"
                  required 
                />
              </div>
              <div className={styles.formGroup}>
                {/* Empty spacer to keep alignment */}
              </div>
            </div>
          )}
        </div>

        {/* --- Footer & Submit Button --- */}
        <div className={styles.footer}>
          <div className={styles.submissionArea}>
            <button type="submit" className={styles.submitButton} disabled={loading}>
              {loading ? <ButtonSpinner /> : 'Register Staff Member'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default NewStaffPage;