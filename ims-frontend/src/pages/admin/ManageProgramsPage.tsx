import { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import styles from './AdminPages.module.scss';
import Spinner from '../../components/common/Spinner';
import EmptyState from '../../components/common/EmptyState';
import DeleteModal from '../../components/common/DeleteModal'; // 1. Import DeleteModal
import { BsJournalBookmarkFill } from 'react-icons/bs';
import AddProgramForm from './AddProgramForm';
import EditProgramModal from './EditProgramModal';

interface ProgramData {
  id: string;
  title: string;
  durationYears: number;
}

const ManageProgramsPage = () => {
  const [programs, setPrograms] = useState<ProgramData[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingProgram, setEditingProgram] = useState<ProgramData | null>(null);
  
  // 2. Add state for the delete modal
  const [deletingProgram, setDeletingProgram] = useState<ProgramData | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchPrograms = async () => {
    setLoading(true);
    try {
      const response = await axios.get('http://localhost:5000/api/programs');
      setPrograms(response.data);
    } catch (err) {
      if (axios.isAxiosError(err) && err.response) {
        toast.error(err.response.data.message || 'Failed to fetch programs.');
      } else {
        toast.error('An unexpected error occurred.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPrograms();
  }, []);
  
  const handleProgramAdded = () => {
    setShowAddForm(false);
    fetchPrograms();
  };

  const handleProgramUpdated = () => {
    setEditingProgram(null);
    fetchPrograms();
  };

  // 3. Update handleDelete to use the new modal state
  const handleDelete = async () => {
    if (!deletingProgram) return;
    
    setDeleteLoading(true);
    try {
      await axios.delete(`http://localhost:5000/api/programs/${deletingProgram.id}`);
      toast.success('Program deleted successfully!');
      setPrograms(current => current.filter(p => p.id !== deletingProgram.id));
      setDeletingProgram(null); // Close the modal on success
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to delete program.');
    } finally {
      setDeleteLoading(false);
    }
  };

  const renderTableBody = () => {
    if (loading) {
      return <tr><td colSpan={3} className={styles.spinnerCell}><Spinner /></td></tr>;
    }
    if (programs.length === 0) {
      return (
        <tr>
          <td colSpan={3}>
            <EmptyState message="No programs found. Click 'Add New Program' to begin." icon={<BsJournalBookmarkFill size={40} />} />
          </td>
        </tr>
      );
    }
    return programs.map((program) => (
      <tr key={program.id}>
        <td>{program.title}</td>
        <td>{program.durationYears} years</td>
        <td>
          <button onClick={() => setEditingProgram(program)} className={`${styles.button} ${styles.editButton}`}>Edit</button>
          {/* 4. Change onClick to open the modal */}
          <button onClick={() => setDeletingProgram(program)} className={`${styles.button} ${styles.deleteButton}`}>Delete</button>
        </td>
      </tr>
    ));
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2>Manage Programs</h2>
        <button onClick={() => setShowAddForm(!showAddForm)}>
          {showAddForm ? 'Cancel' : 'Add New Program'}
        </button>
      </div>

      {showAddForm && <AddProgramForm onProgramAdded={handleProgramAdded} onCancel={() => setShowAddForm(false)} />}
      
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Program Title</th>
            <th>Duration</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {renderTableBody()}
        </tbody>
      </table>

      {editingProgram && (
        <EditProgramModal
          program={editingProgram}
          onClose={() => setEditingProgram(null)}
          onProgramUpdated={handleProgramUpdated}
        />
      )}

      {/* 5. Add the DeleteModal to the JSX */}
      {deletingProgram && (
        <DeleteModal
          title="Delete Program"
          message={`Are you sure you want to delete the "${deletingProgram.title}" program? This action cannot be undone.`}
          onClose={() => setDeletingProgram(null)}
          onConfirm={handleDelete}
          loading={deleteLoading}
        />
      )}
    </div>
  );
};

export default ManageProgramsPage;