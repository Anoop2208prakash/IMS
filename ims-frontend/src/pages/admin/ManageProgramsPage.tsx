import { useState, useEffect, ChangeEvent, useCallback } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import styles from '../../assets/scss/pages/admin/AdminPages.module.scss';
import Spinner from '../../components/common/Spinner';
import EmptyState from '../../components/common/EmptyState';
import Pagination from '../../components/common/Pagination';
import DeleteModal from '../../components/common/DeleteModal';
import Searchbar from '../../components/common/Searchbar';
import HeaderMenu from '../../components/common/HeaderMenu';
import ImportCSVModal from '../../components/common/ImportCSVModal';
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
  
  // Modal states
  const [showImportModal, setShowImportModal] = useState(false);
  const [editingProgram, setEditingProgram] = useState<ProgramData | null>(null);
  const [deletingProgram, setDeletingProgram] = useState<ProgramData | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const fetchPrograms = useCallback(async () => {
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
  }, []);

  useEffect(() => {
    fetchPrograms();
  }, [fetchPrograms]);
  
  const handleProgramAdded = () => {
    setShowAddForm(false);
    fetchPrograms();
  };

  const handleProgramUpdated = () => {
    setEditingProgram(null);
    fetchPrograms();
  };

  const handleImportSuccess = () => {
    fetchPrograms();
  };

  const handleDelete = async () => {
    if (!deletingProgram) return;
    setDeleteLoading(true);
    try {
      await axios.delete(`http://localhost:5000/api/programs/${deletingProgram.id}`);
      toast.success('Program deleted successfully!');
      setPrograms(current => current.filter(p => p.id !== deletingProgram.id));
      setDeletingProgram(null);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to delete program.');
    } finally {
      setDeleteLoading(false);
    }
  };

  const filteredPrograms = programs.filter(program =>
    program.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const currentItems = filteredPrograms.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  const handleRowsPerPageChange = (event: ChangeEvent<HTMLSelectElement>) => {
    setRowsPerPage(Number.parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setPage(0);
  };

  // --- THIS IS THE FIX ---
  const handleExportCSV = async () => {
    toast.loading('Preparing download...');
    try {
      // 1. Call the correct API endpoint: /api/export/programs
      const response = await axios.get('http://localhost:5000/api/export/programs', {
        params: { searchTerm },
        responseType: 'blob',
      });
      
      // 2. Create the download link
      const url = URL.createObjectURL(response.data);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', 'programs_export.csv');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.dismiss();
      toast.success('Data exported successfully!');
      
    } catch (err: any) {
      toast.dismiss();
      // This logic correctly reads the error message from the backend
      const errorText = await (err.response?.data as Blob).text();
      try {
        const errorJson = JSON.parse(errorText);
        toast.error(errorJson.message || 'Failed to export programs.');
      } catch (e) {
        toast.error('Failed to export programs.');
      }
    }
  };

  const menuActions = [
    {
      label: 'Add New Program',
      onClick: () => setShowAddForm(true),
    },
    { label: 'Export CSV', onClick: handleExportCSV },
    { label: 'Import CSV', onClick: () => setShowImportModal(true) }
  ];

  const renderTableBody = () => {
    if (loading) {
      return <tr><td colSpan={3} className={styles.spinnerCell}><Spinner /></td></tr>;
    }
    if (filteredPrograms.length === 0) {
      return (
        <tr>
          <td colSpan={3}>
            <EmptyState 
              message={searchTerm ? `No programs match "${searchTerm}"` : "No programs found. Click 'Add New Program' to begin."} 
              icon={<BsJournalBookmarkFill size={40} />} 
            />
          </td>
        </tr>
      );
    }
    return currentItems.map((program) => (
      <tr key={program.id}>
        <td>{program.title}</td>
        <td>{program.durationYears} years</td>
        <td>
          <button onClick={() => setEditingProgram(program)} className={`${styles.button} ${styles.editButton}`}>Edit</button>
          <button onClick={() => setDeletingProgram(program)} className={`${styles.button} ${styles.deleteButton}`}>Delete</button>
        </td>
      </tr>
    ));
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2>Manage Programs</h2>
        {/* --- THIS IS THE FIX --- */}
        {/* The filter button is removed */}
        <div className={styles.headerActions}>
          <HeaderMenu actions={menuActions} />
        </div>
      </div>

      <div className={styles.searchContainer}>
        <Searchbar
          value={searchTerm}
          onChange={handleSearchChange}
          placeholder="Search by program title..."
        />
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

      <Pagination
        count={filteredPrograms.length}
        page={page}
        rowsPerPage={rowsPerPage}
        onPageChange={setPage}
        onRowsPerPageChange={handleRowsPerPageChange}
      />

      {showImportModal && (
        <ImportCSVModal
          onClose={() => setShowImportModal(false)}
          onImportSuccess={handleImportSuccess}
          importUrl="http://localhost:5000/api/import/programs"
        />
      )}

      {editingProgram && (
        <EditProgramModal
          program={editingProgram}
          onClose={() => setEditingProgram(null)}
          onProgramUpdated={handleProgramUpdated}
        />
      )}

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