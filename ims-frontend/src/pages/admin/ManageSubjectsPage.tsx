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
import FilterModal from '../../components/common/FilterModal';
import { BsCardChecklist, BsFilter } from 'react-icons/bs';
import AddSubjectForm from './AddSubjectForm';
import AssignTeacherModal from './AssignTeacherModal';
import EditSubjectModal from './EditSubjectModal';

interface SubjectData {
  id: string; title: string; subjectCode: string; credits: number; semesterId: string;
  semester: { name: string; program: { title: string; }; };
  teacher: { id: string; name: string } | null;
}
interface ProgramData { id: string; title: string; }
interface SemesterData { id: string; name: string; }
interface FilterOption {
  value: string;
  label: string;
}

const ManageSubjectsPage = () => {
  // Filter states
  const [selectedProgramId, setSelectedProgramId] = useState('all');
  const [selectedSemesterId, setSelectedSemesterId] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  
  const [subjects, setSubjects] = useState<SubjectData[]>([]);
  const [programs, setPrograms] = useState<ProgramData[]>([]);
  const [semesters, setSemesters] = useState<SemesterData[]>([]);

  const [loading, setLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  
  // Modal states
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [editingSubject, setEditingSubject] = useState<SubjectData | null>(null);
  const [assigningSubject, setAssigningSubject] = useState<SubjectData | null>(null);
  const [deletingSubject, setDeletingSubject] = useState<SubjectData | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Fetch programs for the filter modal
  useEffect(() => {
    axios.get('http://localhost:5000/api/programs')
      .then(res => setPrograms(res.data))
      .catch(() => toast.error('Failed to load programs.'));
  }, []);

  // Fetch semesters when the filter's program ID changes
  useEffect(() => {
    if (selectedProgramId && selectedProgramId !== 'all') {
      axios.get(`http://localhost:5000/api/semesters?programId=${selectedProgramId}`)
        .then(res => setSemesters(res.data))
        .catch(() => toast.error('Failed to load semesters.'));
    } else {
      setSemesters([]);
    }
    // Reset semester if program changes
    if (selectedProgramId !== 'all') {
      setSelectedSemesterId('all');
    }
  }, [selectedProgramId]);

  const fetchSubjects = useCallback(async () => {
    setLoading(true);
    let params: { [key: string]: string } = {};
    if (selectedSemesterId !== 'all') {
      params = { semesterId: selectedSemesterId };
    } else if (selectedProgramId !== 'all') {
      params = { programId: selectedProgramId };
    }

    try {
      const response = await axios.get('http://localhost:5000/api/subjects', { params });
      setSubjects(response.data);
    } catch (err) {
      if (axios.isAxiosError(err) && err.response) {
        toast.error(err.response.data.message || 'Failed to fetch subjects.');
      } else {
        toast.error('An unexpected error occurred.');
      }
    } finally {
      setLoading(false);
      setPage(0);
    }
  }, [selectedProgramId, selectedSemesterId]);

  useEffect(() => {
    fetchSubjects();
  }, [fetchSubjects]);

  // --- Handlers ---
  const handleSubjectAdded = () => { setShowAddForm(false); fetchSubjects(); };
  const handleSubjectUpdated = () => { setEditingSubject(null); fetchSubjects(); };
  const handleTeacherAssigned = () => { setAssigningSubject(null); fetchSubjects(); };
  const handleImportSuccess = () => { fetchSubjects(); };
  
  const handleDelete = async () => {
    if (!deletingSubject) return;
    setDeleteLoading(true);
    try {
      await axios.delete(`http://localhost:5000/api/subjects/${deletingSubject.id}`);
      toast.success('Subject deleted successfully!');
      setSubjects(current => current.filter(s => s.id !== deletingSubject.id));
      setDeletingSubject(null);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to delete subject.');
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleRowsPerPageChange = (event: ChangeEvent<HTMLSelectElement>) => {
    setRowsPerPage(Number.parseInt(event.target.value, 10));
    setPage(0);
  };
  
  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setPage(0);
  };
  
  const filteredSubjects = subjects.filter(subject =>
    subject.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    subject.subjectCode.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const currentItems = filteredSubjects.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  const handleExportCSV = async () => {
    toast.loading('Preparing download...');
    try {
      const response = await axios.get('http://localhost:5000/api/export/subjects', {
        params: {
          programId: selectedProgramId,
          semesterId: selectedSemesterId,
          searchTerm: searchTerm
        },
        responseType: 'blob',
      });
      const url = URL.createObjectURL(response.data);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', 'subjects_export.csv');
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
        toast.error(errorJson.message || 'Failed to export subjects.');
      } catch (e) {
        toast.error('Failed to export subjects.');
      }
    }
  };

  // --- THIS IS THE FIX ---
  const menuActions = [
    {
      label: 'Add New Subject',
      onClick: () => setShowAddForm(true),
      // 'disabled' property removed
    },
    { label: 'Export CSV', onClick: handleExportCSV },
    { label: 'Import CSV', onClick: () => setShowImportModal(true) }
  ];
  
  const handleApplyFilters = (filters: { programId: string, semesterId: string }) => {
    setSelectedProgramId(filters.programId);
    setSelectedSemesterId(filters.semesterId);
  };

  const renderTableBody = () => {
    if (loading) {
      return (
        <tr>
          <td colSpan={6} className={styles.spinnerCell}>
            <Spinner />
          </td>
        </tr>
      );
    }
    if (filteredSubjects.length === 0) {
      return (
        <tr>
          <td colSpan={6}>
            <EmptyState 
              message={searchTerm ? "No subjects match your search." : "No subjects found for the selected filter."} 
              icon={<BsCardChecklist size={40} />} 
            />
          </td>
        </tr>
      );
    }
    return currentItems.map((subject) => (
      <tr key={subject.id}>
        <td>{subject.title}</td>
        <td>{subject.subjectCode}</td>
        <td>{subject.semester.program.title}</td>
        <td>{subject.semester.name}</td>
        <td>{subject.teacher ? subject.teacher.name : 'N/A'}</td>
        <td>
          <button onClick={() => setAssigningSubject(subject)} className={`${styles.button} ${styles.assignButton}`}>Assign</button>
          <button onClick={() => setEditingSubject(subject)} className={`${styles.button} ${styles.editButton}`}>Edit</button>
          <button onClick={() => setDeletingSubject(subject)} className={`${styles.button} ${styles.deleteButton}`}>Delete</button>
        </td>
      </tr>
    ));
  };
  
  const addFormSemesterId = selectedSemesterId === 'all' ? '' : selectedSemesterId;
  const addFormProgramId = selectedProgramId === 'all' ? '' : selectedProgramId;

  const programOptions: FilterOption[] = [
    { value: 'all', label: '-- All Programs --' },
    ...programs.map(p => ({ value: p.id, label: p.title }))
  ];

  const semesterOptions: FilterOption[] = [
    { value: 'all', label: '-- All Semesters --' },
    ...semesters.map(s => ({ value: s.id, label: s.name }))
  ];

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2>Manage Subjects</h2>
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
          placeholder="Search by subject title or code..."
        />
      </div>

      {showAddForm && (
        <AddSubjectForm 
          onSubjectAdded={handleSubjectAdded} 
          onCancel={() => setShowAddForm(false)}
          initialProgramId={addFormProgramId}
          initialSemesterId={addFormSemesterId}
        />
      )}
      
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Subject Title</th>
            <th>Code</th>
            <th>Program</th>
            <th>Semester</th>
            <th>Teacher</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {renderTableBody()}
        </tbody>
      </table>

      <Pagination
        count={filteredSubjects.length}
        page={page}
        rowsPerPage={rowsPerPage}
        onPageChange={setPage}
        onRowsPerPageChange={handleRowsPerPageChange}
      />

      {showFilterModal && (
        <FilterModal
          onClose={() => setShowFilterModal(false)}
          onApply={handleApplyFilters}
          initialFilters={{ programId: selectedProgramId, semesterId: selectedSemesterId }}
          filterType="programAndSemester"
          programOptions={programOptions}
          semesterOptions={semesterOptions}
        />
      )}

      {showImportModal && (
        <ImportCSVModal
          onClose={() => setShowImportModal(false)}
          onImportSuccess={handleImportSuccess}
          importUrl="http://localhost:5000/api/import/subjects"
        />
      )}

      {editingSubject && (
        <EditSubjectModal
          subject={editingSubject}
          onClose={() => setEditingSubject(null)}
          onSubjectUpdated={handleSubjectUpdated}
        />
      )}
      
      {assigningSubject && (
        <AssignTeacherModal
          subject={assigningSubject}
          onClose={() => setAssigningSubject(null)}
          onTeacherAssigned={handleTeacherAssigned}
        />
      )}

      {deletingSubject && (
        <DeleteModal
          title="Delete Subject"
          message={`Are you sure you want to delete "${deletingSubject.title}"?`}
          onClose={() => setDeletingSubject(null)}
          onConfirm={handleDelete}
          loading={deleteLoading}
        />
      )}
    </div>
  );
};

export default ManageSubjectsPage;