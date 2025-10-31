import { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import styles from '../../assets/scss/pages/admin/AddForm.module.scss'; // Corrected path

interface Program { id: string; title: string; }
interface Semester { id: string; name: string; }

// 1. Update the props interface to accept the initial values
interface AddSubjectFormProps {
  onSubjectAdded: () => void;
  onCancel: () => void;
  initialProgramId: string;
  initialSemesterId: string;
}

const AddSubjectForm = ({ onSubjectAdded, onCancel, initialProgramId, initialSemesterId }: AddSubjectFormProps) => {
  // Form data
  const [title, setTitle] = useState('');
  const [subjectCode, setSubjectCode] = useState('');
  const [credits, setCredits] = useState('');
  
  // Dropdown data
  const [programs, setPrograms] = useState<Program[]>([]);
  const [semesters, setSemesters] = useState<Semester[]>([]);
  
  // Selected values
  const [selectedProgramId, setSelectedProgramId] = useState(initialProgramId || '');
  const [selectedSemesterId, setSelectedSemesterId] = useState(initialSemesterId || '');

  // 2. Fetch all programs on load
  useEffect(() => {
    axios.get('http://localhost:5000/api/programs')
      .then(res => setPrograms(res.data))
      .catch(() => toast.error('Failed to load programs.'));
  }, []);

  // 3. When selectedProgramId changes, fetch its semesters
  useEffect(() => {
    if (selectedProgramId && selectedProgramId !== 'all') {
      axios.get(`http://localhost:5000/api/semesters?programId=${selectedProgramId}`)
        .then(res => setSemesters(res.data))
        .catch(() => toast.error('Failed to load semesters.'));
    } else {
      setSemesters([]);
    }
    // Reset semester if program changes
    if (selectedProgramId !== initialProgramId) {
      setSelectedSemesterId('');
    }
  }, [selectedProgramId, initialProgramId]);
  
  // 4. Handle initial semester selection
  useEffect(() => {
    if (initialProgramId && initialProgramId !== 'all') {
      axios.get(`http://localhost:5000/api/semesters?programId=${initialProgramId}`)
        .then(res => {
          setSemesters(res.data);
          setSelectedSemesterId(initialSemesterId || '');
        })
        .catch(() => toast.error('Failed to load initial semesters.'));
    }
  }, [initialProgramId, initialSemesterId]);


  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/api/subjects', {
        title,
        subjectCode,
        credits,
        semesterId: selectedSemesterId
      });
      toast.success('Subject created successfully!');
      onSubjectAdded();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to create subject.');
    }
  };

  return (
    <div className={styles.formContainer}>
      <h3>Add New Subject</h3>
      <form onSubmit={handleSubmit}>
        <input type="text" name="title" placeholder="Subject Title (e.g., Data Structures)" value={title} onChange={(e) => setTitle(e.target.value)} required />
        <input type="text" name="subjectCode" placeholder="Subject Code (e.g., CS101)" value={subjectCode} onChange={(e) => setSubjectCode(e.target.value)} required />
        <input type="number" name="credits" placeholder="Credits" value={credits} min="1" onChange={(e) => setCredits(e.target.value)} required />
        
        <select value={selectedProgramId} onChange={(e) => setSelectedProgramId(e.target.value)} required>
          <option value="" disabled>-- Select a Program --</option>
          <option value="all" disabled>-- All Programs --</option>
          {programs.map(p => (
            <option key={p.id} value={p.id}>{p.title}</option>
          ))}
        </select>

        <select value={selectedSemesterId} onChange={(e) => setSelectedSemesterId(e.target.value)} required disabled={!selectedProgramId || selectedProgramId === 'all'}>
          <option value="" disabled>-- Select a Semester --</option>
          <option value="all" disabled>-- All Semesters --</option>
          {semesters.map(s => (
            <option key={s.id} value={s.id}>{s.name}</option>
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