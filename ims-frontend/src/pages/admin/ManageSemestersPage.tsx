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
import FilterModal from '../../components/common/FilterModal'; // Reusable modal
import { BsBook, BsFilter } from 'react-icons/bs';
import ImportCSVModal from '../../components/common/ImportCSVModal';
import AddSemesterForm from './AddSemesterForm';
import EditSemesterModal from './EditSemesterModal';

interface SemesterData {
  id: string; name: string; programId: string; program: { title: string; };
}
interface ProgramData {
  id: string; title: string;
}
// 1. Define the type for the filter options
interface FilterOption {
  value: string;
  label: string;
}

const ManageSemestersPage = () => {
  const [semesters, setSemesters] = useState<SemesterData[]>([]);
  const [programs, setPrograms] = useState<ProgramData[]>([]); // 2. Need programs for the filter
  const [selectedProgramId, setSelectedProgramId] = useState('all');
  const [loading, setLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  
  // Modal states
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [editingSemester, setEditingSemester] = useState<SemesterData | null>(null);
  const [deletingSemester, setDeletingSemester] = useState<SemesterData | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Search & Pagination states
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // 3. Fetch programs for the filter modal
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
  }, [selectedProgramId]);
  
  useEffect(() => {
    fetchSemesters();
  }, [fetchSemesters]);
  
  // 4. This handler now matches the FilterModal's onApply prop
  const handleApplyFilter = (filters: { programId: string; semesterId: string }) => {
    setSelectedProgramId(filters.programId);
    // We don't use filters.semesterId in this file, but we accept it
  };
  
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
  
  const handleImportSuccess = () => {
    fetchSemesters();
  };

  const handleDelete = async () => {
    if (!deletingSemester) return;
    setDeleteLoading(true);
    try {
      await axios.delete(`http://localhost:5000/api/semesters/${deletingSemester.id}`);
      toast.success('Semester deleted successfully!');
      setSemesters(current => current.filter(s => s.id !== deletingSemester.id));
      setDeletingSemester(null);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to delete semester.');
    } finally {
      setDeleteLoading(false);
    }
  };
  
  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => { 
    setSearchTerm(e.target.value); 
    setPage(0); 
  };
  const handleRowsPerPageChange = (event: ChangeEvent<HTMLSelectElement>) => { 
    setRowsPerPage(Number.parseInt(event.target.value, 10)); 
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

  const handleExportCSV = async () => {
    if (filteredSemesters.length === 0) {
      toast.error('No data to export.');
      return;
    }
    toast.loading('Preparing download...');
    try {
      const response = await axios.get('http://localhost:5000/api/export/semesters', {
        params: {
          programId: selectedProgramId,
          searchTerm: searchTerm
        },
        responseType: 'blob',
      });
      const url = URL.createObjectURL(response.data);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', 'semesters_export.csv');
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.dismiss();
      toast.success('Data exported successfully!');
    } catch (err: any) {
      toast.dismiss();
      const errorText = await (err.response?.data as Blob).text();
      try {
        const errorJson = JSON.parse(errorText);
        toast.error(errorJson.message || 'Failed to export data.');
      } catch (e) {
        toast.error('Failed to export data.');
      }
    }
  };

  const menuActions = [
    {
      label: 'Add New Semester',
      onClick: () => setShowAddForm(true),
    },
    {
      label: 'Export CSV',
      onClick: handleExportCSV,
    },
    {
      label: 'Import CSV',
      onClick: () => setShowImportModal(true),
    }
  ];

  const renderTableBody = () => {
    if (loading) {
      return <tr><td colSpan={3} className={styles.spinnerCell}><Spinner /></td></tr>;
    }
    if (filteredSemesters.length === 0) {
      return (
        <tr>
          <td colSpan={3}>
            <EmptyState 
              message={searchTerm ? `No semesters match "${searchTerm}"` : "Please select a program or clear filters."} 
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
  
  // 5. Create the options array for the filter modal
  const programOptions: FilterOption[] = [
    { value: 'all', label: '-- All Programs --' },
    ...programs.map(p => ({ value: p.id, label: p.title }))
  ];

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2>Manage Semesters</h2>
        
        <div className={styles.headerActions}>
          <button className={styles.iconButton} onClick={() => setShowFilterModal(true)}>
            <BsFilter />
          </button>
          <HeaderMenu actions={menuActions} />
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

      {showImportModal && (
        <ImportCSVModal
          onClose={() => setShowImportModal(false)}
          onImportSuccess={handleImportSuccess}
          importUrl="http://localhost:5000/api/import/semesters"
        />
      )}

      {/* 6. Pass the new props to the reusable FilterModal */}
      {showFilterModal && (
        <FilterModal
          onClose={() => setShowFilterModal(false)}
          onApply={handleApplyFilter}
          initialFilters={{ programId: selectedProgramId, semesterId: 'all' }}
          filterType="program"
          programOptions={programOptions} // Pass the options
          semesterOptions={[]} // Pass an empty array
        />
      )}

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