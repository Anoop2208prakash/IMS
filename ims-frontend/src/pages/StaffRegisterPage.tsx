import { useState, ChangeEvent, FormEvent } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import styles from '../assets/scss/pages/AdmissionPage.module.scss';
import ButtonSpinner from '../components/common/ButtonSpinner';
import { Link } from 'react-router-dom';

const StaffRegisterPage = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    role: 'TEACHER', // Default role
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

    try {
      const response = await axios.post('http://localhost:5000/api/staff/register', formData);
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
    <div className={styles.container}>
      <form onSubmit={handleSubmit} className={styles.form}>
        <h2>Staff Registration (Temporary)</h2>
        <div className={styles.formGroup}>
          <label htmlFor="fullName">Full Name</label>
          <input type="text" name="fullName" value={formData.fullName} onChange={handleChange} required disabled={loading} />
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="email">Email Address</label>
          <input type="email" name="email" value={formData.email} onChange={handleChange} required disabled={loading} />
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="password">Password</label>
          <input type="password" name="password" value={formData.password} onChange={handleChange} required disabled={loading} />
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="role">Role</label>
          <select name="role" value={formData.role} onChange={handleChange} disabled={loading}>
            <option value="TEACHER">Teacher</option>
            <option value="ADMIN">Admin</option>
            <option value="ADMIN_ADMISSION">Admin (Admission)</option>
            <option value="ADMIN_FINANCE">Admin (Finance)</option>
            <option value="ADMIN_LIBRARY">Admin (Library)</option>
          </select>
        </div>

        {/* Conditional field for Teacher role */}
        {formData.role === 'TEACHER' && (
          <div className={styles.formGroup}>
            <label htmlFor="department">Department</label>
            <input type="text" name="department" value={formData.department} onChange={handleChange} required={formData.role === 'TEACHER'} disabled={loading} />
          </div>
        )}

        <button type="submit" className={styles.submitButton} disabled={loading}>
          {loading ? <ButtonSpinner /> : 'Register'}
        </button>
        <Link to="/login" className={styles.backLink}>Back to Login</Link>
      </form>
    </div>
  );
};

export default StaffRegisterPage;