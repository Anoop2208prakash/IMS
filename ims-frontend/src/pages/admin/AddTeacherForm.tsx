import React, { useState, ChangeEvent, FormEvent } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import styles from '../../assets/scss/pages/admin/AddForm.module.scss';
import ButtonSpinner from '../../components/common/ButtonSpinner';

interface AddTeacherFormProps {
  onTeacherAdded: () => void;
  onCancel: () => void;
}

const AddTeacherForm = ({ onTeacherAdded, onCancel }: AddTeacherFormProps) => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    department: '',
  });
  const [loading, setLoading] = useState(false); // 2. Add loading state

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); // 3. Set loading true

    // 4. Create the correct payload for the staff register endpoint
    const payload = {
      ...formData,
      role: 'TEACHER' // This is required by the backend
    };

    try {
      // 5. Call the correct API endpoint
      await axios.post('http://localhost:5000/api/staff/register', payload);
      toast.success('Teacher added successfully!');
      onTeacherAdded(); // Tell the parent component to refresh the list
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to add teacher.');
    } finally {
      setLoading(false); // 6. Set loading false
    }
  };

  return (
    <div className={styles.formContainer}>
      <h3>Add New Teacher</h3>
      <form onSubmit={handleSubmit}>
        <input type="text" name="fullName" placeholder="Full Name" onChange={handleChange} required disabled={loading} />
        <input type="email" name="email" placeholder="Email" onChange={handleChange} required disabled={loading} />
        <input type="password" name="password" placeholder="Password" onChange={handleChange} required disabled={loading} />
        <input type="text" name="department" placeholder="Department" onChange={handleChange} required disabled={loading} />
        
        <div className={styles.buttonGroup}>
          <button type="submit" disabled={loading}>
            {loading ? <ButtonSpinner /> : 'Add Teacher'}
          </button>
          <button type="button" onClick={onCancel} disabled={loading}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddTeacherForm;