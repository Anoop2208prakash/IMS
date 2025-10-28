import React, { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import styles from '../../assets/scss/pages/admin/EditModal.module.scss'; // Reuse the generic modal style

interface Semester { id: string; name: string; program: { title: string; } }
interface SubjectData {
  id: string;
  title: string;
  subjectCode: string;
  credits: number;
  semesterId: string;
}
interface EditSubjectModalProps {
  subject: SubjectData;
  onClose: () => void;
  onSubjectUpdated: () => void;
}

const EditSubjectModal = ({ subject, onClose, onSubjectUpdated }: EditSubjectModalProps) => {
  const [formData, setFormData] = useState({ title: '', subjectCode: '', credits: 0, semesterId: '' });
  const [semesters, setSemesters] = useState<Semester[]>([]);

  // Fetch semesters for the dropdown
  useEffect(() => {
    axios.get('http://localhost:5000/api/semesters')
      .then(res => setSemesters(res.data))
      .catch(() => toast.error('Failed to load semesters.'));
  }, []);

  // Pre-fill form data when the component receives a subject
  useEffect(() => {
    if (subject) {
      setFormData({
        title: subject.title,
        subjectCode: subject.subjectCode,
        credits: subject.credits,
        semesterId: subject.semesterId,
      });
    }
  }, [subject]);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      await axios.put(`http://localhost:5000/api/subjects/${subject.id}`, formData);
      toast.success('Subject updated successfully!');
      onSubjectUpdated();
    } catch (err) {
      if (axios.isAxiosError(err) && err.response) {
        toast.error(err.response.data.message || 'Failed to update subject.');
      } else {
        toast.error('An unexpected error occurred.');
      }
    }
  };

  return (
    <div className={styles.modalBackdrop}>
      <div className={styles.modalContent}>
        <h2>Edit Subject</h2>
        <form onSubmit={handleSubmit}>
          <label>Subject Title</label>
          <input type="text" name="title" value={formData.title} onChange={handleChange} required />
          <label>Subject Code</label>
          <input type="text" name="subjectCode" value={formData.subjectCode} onChange={handleChange} required />
          <label>Credits</label>
          <input type="number" name="credits" value={formData.credits.toString()} min="1" onChange={handleChange} required />
          <label>Semester</label>
          <select name="semesterId" value={formData.semesterId} onChange={handleChange} required>
            <option value="" disabled>-- Select a Semester --</option>
            {semesters.map(s => (
              <option key={s.id} value={s.id}>{s.program.title} - {s.name}</option>
            ))}
          </select>
          <div className={styles.buttonGroup}>
            <button type="submit">Save Changes</button>
            <button type="button" onClick={onClose}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditSubjectModal;