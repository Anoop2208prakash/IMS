import { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import styles from './AdminPages.module.scss';
import Spinner from '../../components/common/Spinner';
import EmptyState from '../../components/common/EmptyState';
import { BsBook } from 'react-icons/bs';
import AddSemesterForm from './AddSemesterForm';
import EditSemesterModal from './EditSemesterModal';

interface SemesterData {
  id: string;
  name: string;
  programId: string; // Needed for the Edit Modal
  program: { title: string; };
}

const ManageSemestersPage = () => {
  const [semesters, setSemesters] = useState<SemesterData[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingSemester, setEditingSemester] = useState<SemesterData | null>(null);

  const fetchSemesters = async () => {
    setLoading(true);
    try {
      const response = await axios.get('http://localhost:5000/api/semesters');
      setSemesters(response.data);
    } catch (err) {
      if (axios.isAxiosError(err) && err.response) {
        toast.error(err.response.data.message || 'Failed to fetch semesters.');
      } else {
        toast.error('An unexpected error occurred.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSemesters();
  }, []);
  
  const handleSemesterAdded = () => {
    setShowAddForm(false);
    fetchSemesters();
  };

  const handleSemesterUpdated = () => {
    setEditingSemester(null);
    fetchSemesters();
  };

  const handleDelete = async (semesterId: string) => {
    if (!window.confirm('Are you sure you want to delete this semester?')) return;
    try {
      await axios.delete(`http://localhost:5000/api/semesters/${semesterId}`);
      toast.success('Semester deleted successfully!');
      setSemesters(current => current.filter(s => s.id !== semesterId));
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to delete semester.');
    }
  };

  const renderTableBody = () => {
    if (loading) {
      return <tr><td colSpan={3} className={styles.spinnerCell}><Spinner /></td></tr>;
    }
    if (semesters.length === 0) {
      return (
        <tr>
          <td colSpan={3}>
            <EmptyState message="No semesters found. Create a Program first, then add semesters." icon={<BsBook size={40} />} />
          </td>
        </tr>
      );
    }
    return semesters.map((semester) => (
      <tr key={semester.id}>
        <td>{semester.name}</td>
        <td>{semester.program.title}</td>
        <td>
          <button onClick={() => setEditingSemester(semester)} className={`${styles.button} ${styles.editButton}`}>Edit</button>
          <button onClick={() => handleDelete(semester.id)} className={`${styles.button} ${styles.deleteButton}`}>Delete</button>
        </td>
      </tr>
    ));
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2>Manage Semesters</h2>
        <button onClick={() => setShowAddForm(true)}>
          {showAddForm ? 'Cancel' : 'Add New Semester'}
        </button>
      </div>

      {showAddForm && <AddSemesterForm onSemesterAdded={handleSemesterAdded} onCancel={() => setShowAddForm(false)} />}
      
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Semester Name</th>
            <th>Program</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {renderTableBody()}
        </tbody>
      </table>

      {editingSemester && (
        <EditSemesterModal
          semester={editingSemester}
          onClose={() => setEditingSemester(null)}
          onSemesterUpdated={handleSemesterUpdated}
        />
      )}
    </div>
  );
};

export default ManageSemestersPage;