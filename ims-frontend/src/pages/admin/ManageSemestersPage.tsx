import { useState, useEffect, ChangeEvent, useCallback } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import styles from '../../assets/scss/pages/admin/AdminPages.module.scss';
import Spinner from '../../components/common/Spinner';
import EmptyState from '../../components/common/EmptyState';
import Pagination from '../../components/common/Pagination';
import DeleteModal from '../../components/common/DeleteModal';
import Searchbar from '../../components/common/Searchbar'; // 1. Import Searchbar
import { BsBook } from 'react-icons/bs';
import AddSemesterForm from './AddSemesterForm';
import EditSemesterModal from './EditSemesterModal';

interface SemesterData {
  id: string;
  name: string;
  programId: string;
  program: { title: string; };
}
interface ProgramData {
  id: string;
  title: string;
}

const ManageSemestersPage = () => {
  const [semesters, setSemesters] = useState<SemesterData[]>([]);
  const [programs, setPrograms] = useState<ProgramData[]>([]);
  const [selectedProgramId, setSelectedProgramId] = useState('all');
  const [loading, setLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  
  // Modal states
  const [editingSemester, setEditingSemester] = useState<SemesterData | null>(null);
  const [deletingSemester, setDeletingSemester] = useState<SemesterData | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Search & Pagination states
  const [searchTerm, setSearchTerm] = useState(''); // 2. Add search state
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Fetch all programs for the filter dropdown
  useEffect(() => {
    axios.get('http://localhost:5000/api/programs')
      .then(res => setPrograms(res.data))
      .catch(() => toast.error('Failed to load programs.'));
  }, []);

  // Fetch semesters based on the selected program ID
  const fetchSemesters = useCallback(async () => {
    setLoading(true);
    try {
      const params = selectedProgramId === 'all' ? {} : { programId: selectedProgramId };
      const response = await axios.get('http://localhost:5000/api/semesters', { params });
      setSemesters(response.data);
    } catch (err) {
      if (axios.isAxiosError(err) && err.response) {
        toast.error(err.response.data.message || 'Failed to fetch semesters.');
      } else {
        toast.error('An unexpected error occurred.');
      }
    } finally {
      setLoading(false);
      setPage(0);
    }
  }, [selectedProgramId]); // Dependency array
  
  // Re-fetch semesters when the selected program changes
  useEffect(() => {
    fetchSemesters();
  }, [fetchSemesters]);
  
  const handleSemesterAdded = () => {
    setShowAddForm(false);
    fetchSemesters();
    toast.success('Semester added successfully!');
  };

  const handleSemesterUpdated = () => {
    setEditingSemester(null);
    fetchSemesters();
    toast.success('Semester updated successfully!');
  };

  const handleDelete = async () => {
    if (!deletingSemester) return;
    setDeleteLoading(true);
    try {
      await axios.delete(`http://localhost:5000/api/semesters/${deletingSemester.id}`);
      toast.success('Semester deleted successfully!');
      setSemesters(current => current.filter(s => s.id !== deletingSemester.id));
      setDeletingSemester(null);
    } catch (err) {
      if (axios.isAxiosError(err) && err.response) {
        toast.error(err.response.data.message || 'Failed to delete semester.');
      } else {
        toast.error('An unexpected error occurred.');
      }
    } finally {
      setDeleteLoading(false);
    }
  };

  // --- Filtering & Pagination ---
  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setPage(0);
  };
  
  const filteredSemesters = semesters.filter(semester =>
    semester.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    semester.program.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const currentItems = filteredSemesters.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  const handleRowsPerPageChange = (event: ChangeEvent<HTMLSelectElement>) => {
    setRowsPerPage(Number.parseInt(event.target.value, 10));
    setPage(0);
  };

  const renderTableBody = () => {
    if (loading) {
      return <tr><td colSpan={3} className={styles.spinnerCell}><Spinner /></td></tr>;
    }
    if (filteredSemesters.length === 0) {
      return (
        <tr>
          <td colSpan={3}>
            <EmptyState 
              message={searchTerm ? `No semesters match "${searchTerm}"` : (selectedProgramId === 'all' ? "Select a program to view semesters." : "No semesters found for this program.")}
              icon={<BsBook size={40} />} 
            />
          </td>
        </tr>
      );
    }
    return currentItems.map((semester) => (
      <tr key={semester.id}>
        <td>{semester.name}</td>
        <td>{semester.program.title}</td>
        <td>
          <button onClick={() => setEditingSemester(semester)} className={`${styles.button} ${styles.editButton}`}>Edit</button>
          <button onClick={() => setDeletingSemester(semester)} className={`${styles.button} ${styles.deleteButton}`}>Delete</button>
        </td>
      </tr>
    ));
  };

  const addFormProgramId = selectedProgramId === 'all' ? '' : selectedProgramId;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2>Manage Semesters</h2>
        <div className={styles.headerActions}>
          <select 
            value={selectedProgramId} 
            onChange={(e) => setSelectedProgramId(e.target.value)} 
            className={styles.filterDropdown}
          >
            <option value="all">-- All Programs --</option>
            {programs.map(p => <option key={p.id} value={p.id}>{p.title}</option>)}
          </select>
          <button 
            onClick={() => setShowAddForm(prev => !prev)}
            disabled={selectedProgramId === 'all' && !showAddForm}
          >
            {showAddForm ? 'Cancel' : 'Add New Semester'}
          </button>
        </div>
      </div>

      <div className={styles.searchContainer}>
        <Searchbar
          value={searchTerm}
          onChange={handleSearchChange}
          placeholder="Search by semester or program..."
        />
      </div>

      {showAddForm && (
        <AddSemesterForm 
          onSemesterAdded={handleSemesterAdded} 
          onCancel={() => setShowAddForm(false)}
          programId={addFormProgramId}
        />
      )}
      
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

      <Pagination
        count={filteredSemesters.length}
        page={page}
        rowsPerPage={rowsPerPage}
        onPageChange={setPage}
        onRowsPerPageChange={handleRowsPerPageChange}
      />

      {editingSemester && (
        <EditSemesterModal
          semester={editingSemester}
          onClose={() => setEditingSemester(null)}
          onSemesterUpdated={handleSemesterUpdated}
        />
      )}

      {deletingSemester && (
        <DeleteModal
          title="Delete Semester"
          message={`Are you sure you want to delete "${deletingSemester.name}"? This action cannot be undone.`}
          onClose={() => setDeletingSemester(null)}
          onConfirm={handleDelete}
          loading={deleteLoading}
        />
      )}
    </div>
  );
};

export default ManageSemestersPage;