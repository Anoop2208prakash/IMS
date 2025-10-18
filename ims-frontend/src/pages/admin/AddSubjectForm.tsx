import React, { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import styles from './AddForm.module.scss';

interface Semester { id: string; name: string; program: { title: string; } }
interface AddSubjectFormProps { onSubjectAdded: () => void; onCancel: () => void; }

const AddSubjectForm = ({ onSubjectAdded, onCancel }: AddSubjectFormProps) => {
  const [formData, setFormData] = useState({ title: '', subjectCode: '', credits: '', semesterId: '' });
  const [semesters, setSemesters] = useState<Semester[]>([]);

  useEffect(() => {
    axios.get('http://localhost:5000/api/semesters')
      .then(res => setSemesters(res.data))
      .catch(() => toast.error('Failed to load semesters.'));
  }, []);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/api/subjects', formData);
      toast.success('Subject created successfully!');
      onSubjectAdded();
    } catch (err) {
      if (axios.isAxiosError(err) && err.response) {
        toast.error(err.response.data.message || 'Failed to create subject.');
      } else {
        toast.error('An unexpected error occurred.');
      }
    }
  };

  return (
    <div className={styles.formContainer}>
      <h3>Add New Subject</h3>
      <form onSubmit={handleSubmit}>
        <input type="text" name="title" placeholder="Subject Title (e.g., Data Structures)" value={formData.title} onChange={handleChange} required />
        <input type="text" name="subjectCode" placeholder="Subject Code (e.g., CS101)" value={formData.subjectCode} onChange={handleChange} required />
        <input type="number" name="credits" placeholder="Credits" value={formData.credits} min="1" onChange={handleChange} required />
        <select name="semesterId" value={formData.semesterId} onChange={handleChange} required>
          <option value="" disabled>-- Select a Semester --</option>
          {semesters.map(s => (
            <option key={s.id} value={s.id}>{s.program.title} - {s.name}</option>
          ))}
        </select>
        <div className={styles.buttonGroup}>
          <button type="submit">Add Subject</button>
          <button type="button" onClick={onCancel}>Cancel</button>
        </div>
      </form>
    </div>
  );
};

export default AddSubjectForm;