import React, { useState, ChangeEvent, FormEvent } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import styles from '../../assets/scss/pages/admin/AddForm.module.scss';
import ButtonSpinner from '../../components/common/ButtonSpinner';

interface AddStaffFormProps {
  onStaffAdded: () => void;
  onCancel: () => void;
}

const AddStaffForm = ({ onStaffAdded, onCancel }: AddStaffFormProps) => {
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
      await axios.post('http://localhost:5000/api/staff/register', formData);
      toast.success('Staff member created successfully!');
      onStaffAdded(); // This will close the form and refresh the list
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to create staff.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.formContainer}>
      <h3>Add New Staff Member</h3>
      <form onSubmit={handleSubmit}>
        <input type="text" name="fullName" placeholder="Full Name" value={formData.fullName} onChange={handleChange} required />
        <input type="email" name="email" placeholder="Email" value={formData.email} onChange={handleChange} required />
        <input type="password" name="password" placeholder="Temporary Password" value={formData.password} onChange={handleChange} required />
        
        <select name="role" value={formData.role} onChange={handleChange} required>
          <option value="TEACHER">Teacher</option>
          <option value="ADMIN">Admin</option>
          <option value="ADMIN_ADMISSION">Admin (Admission)</option>
          <option value="ADMIN_FINANCE">Admin (Finance)</option>
          <option value="ADMIN_LIBRARY">Admin (Library)</option>
        </select>

        {/* Conditional field for Teacher role */}
        {formData.role === 'TEACHER' && (
          <input 
            type="text" 
            name="department" 
            value={formData.department} 
            onChange={handleChange} 
            placeholder="Department (e.g., CSE)" 
            required 
          />
        )}

        <div className={styles.buttonGroup}>
          <button type="submit" disabled={loading}>
            {loading ? <ButtonSpinner /> : 'Add Staff'}
          </button>
          <button type="button" onClick={onCancel} disabled={loading}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddStaffForm;