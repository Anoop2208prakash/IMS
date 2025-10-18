import { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import styles from './AdminPages.module.scss';
import Spinner from '../../components/common/Spinner';
import EmptyState from '../../components/common/EmptyState';
import { BsCardChecklist } from 'react-icons/bs'; // 1. Import the new modal
import AddSubjectForm from './AddSubjectForm';
import AssignTeacherModal from './AssignTeacherModal';
import EditSubjectModal from './EditSubjectModal';

interface SubjectData {
  id: string;
  title: string;
  subjectCode: string;
  credits: number;
  semesterId: string;
  semester: {
    name: string;
    program: { title: string; };
  };
}

const ManageSubjectsPage = () => {
  const [subjects, setSubjects] = useState<SubjectData[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingSubject, setEditingSubject] = useState<SubjectData | null>(null);
  const [assigningSubject, setAssigningSubject] = useState<SubjectData | null>(null); // 2. Add state for the new modal

  const fetchSubjects = async () => {
    setLoading(true);
    try {
      const response = await axios.get('http://localhost:5000/api/subjects');
      setSubjects(response.data);
    } catch (err) {
      if (axios.isAxiosError(err) && err.response) {
        toast.error(err.response.data.message || 'Failed to fetch subjects.');
      } else {
        toast.error('An unexpected error occurred.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubjects();
  }, []);
  
  const handleSubjectAdded = () => {
    setShowAddForm(false);
    fetchSubjects();
  };

  const handleSubjectUpdated = () => {
    setEditingSubject(null);
    fetchSubjects();
  };

  const handleDelete = async (subjectId: string) => {
    if (!window.confirm('Are you sure you want to delete this subject?')) return;
    try {
      await axios.delete(`http://localhost:5000/api/subjects/${subjectId}`);
      toast.success('Subject deleted successfully!');
      setSubjects(current => current.filter(s => s.id !== subjectId));
    } catch (err) { // 3. Fix 'any' type error
      if (axios.isAxiosError(err) && err.response) {
        toast.error(err.response.data.message || 'Failed to delete subject.');
      } else {
        toast.error('An unexpected error occurred while deleting.');
      }
    }
  };

  const renderTableBody = () => {
    if (loading) {
      return <tr><td colSpan={5} className={styles.spinnerCell}><Spinner /></td></tr>;
    }
    if (subjects.length === 0) {
      return (
        <tr>
          <td colSpan={5}>
            <EmptyState message="No subjects found. Create Programs and Semesters first." icon={<BsCardChecklist size={40} />} />
          </td>
        </tr>
      );
    }
    return subjects.map((subject) => (
      <tr key={subject.id}>
        <td>{subject.title}</td>
        <td>{subject.subjectCode}</td>
        <td>{subject.semester.program.title}</td>
        <td>{subject.semester.name}</td>
        <td>
          {/* 4. Add the "Assign" button */}
          <button 
            onClick={() => setAssigningSubject(subject)} 
            className={`${styles.button} ${styles.assignButton}`}
          >
            Assign
          </button>
          <button onClick={() => setEditingSubject(subject)} className={`${styles.button} ${styles.editButton}`}>Edit</button>
          <button onClick={() => handleDelete(subject.id)} className={`${styles.button} ${styles.deleteButton}`}>Delete</button>
        </td>
      </tr>
    ));
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2>Manage Subjects</h2>
        <button onClick={() => setShowAddForm(true)}>
          {showAddForm ? 'Cancel' : 'Add New Subject'}
        </button>
      </div>

      {showAddForm && <AddSubjectForm onSubjectAdded={handleSubjectAdded} onCancel={() => setShowAddForm(false)} />}
      
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Subject Title</th>
            <th>Code</th>
            <th>Program</th>
            <th>Semester</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {renderTableBody()}
        </tbody>
      </table>

      {editingSubject && (
        <EditSubjectModal
          subject={editingSubject}
          onClose={() => setEditingSubject(null)}
          onSubjectUpdated={handleSubjectUpdated}
        />
      )}

      {/* 5. Add the new modal to the JSX */}
      {assigningSubject && (
        <AssignTeacherModal
          subject={assigningSubject}
          onClose={() => setAssigningSubject(null)}
          onTeacherAssigned={() => setAssigningSubject(null)}
        />
      )}
    </div>
  );
};

export default ManageSubjectsPage;