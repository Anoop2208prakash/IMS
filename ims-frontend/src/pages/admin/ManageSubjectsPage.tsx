import { useState, useEffect, ChangeEvent, useCallback } from 'react'; // 1. Import useCallback
import axios from 'axios';
import toast from 'react-hot-toast';
import styles from '../../assets/scss/pages/admin/AdminPages.module.scss';
import Spinner from '../../components/common/Spinner';
import EmptyState from '../../components/common/EmptyState';
import Pagination from '../../components/common/Pagination';
import DeleteModal from '../../components/common/DeleteModal';
import Searchbar from '../../components/common/Searchbar';
import { BsCardChecklist } from 'react-icons/bs';
import AddSubjectForm from './AddSubjectForm';
import EditSubjectModal from './EditSubjectModal';
import AssignTeacherModal from './AssignTeacherModal';

// Interfaces for our data
interface ProgramData { id: string; title: string; }
interface SemesterData { id: string; name: string; }
interface SubjectData {
  id: string; title: string; subjectCode: string; credits: number; semesterId: string;
  semester: { name: string; program: { title: string; }; };
}

const ManageSubjectsPage = () => {
  const [subjects, setSubjects] = useState<SubjectData[]>([]);
  const [programs, setPrograms] = useState<ProgramData[]>([]);
  const [semesters, setSemesters] = useState<SemesterData[]>([]);
  
  // Filter states
  const [selectedProgramId, setSelectedProgramId] = useState('all');
  const [selectedSemesterId, setSelectedSemesterId] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  
  // Modal states
  const [editingSubject, setEditingSubject] = useState<SubjectData | null>(null);
  const [assigningSubject, setAssigningSubject] = useState<SubjectData | null>(null);
  const [deletingSubject, setDeletingSubject] = useState<SubjectData | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  
  // Pagination states
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // --- Data Fetching ---

  // 1. Fetch all programs (runs once)
  useEffect(() => {
    axios.get('http://localhost:5000/api/programs')
      .then(res => setPrograms(res.data))
      .catch(() => toast.error('Failed to load programs.'));
  }, []);

  // 2. When a program is selected, fetch its semesters
  useEffect(() => {
    setSelectedSemesterId('all');
    if (selectedProgramId && selectedProgramId !== 'all') {
      axios.get(`http://localhost:5000/api/semesters?programId=${selectedProgramId}`)
        .then(res => setSemesters(res.data))
        .catch(() => toast.error('Failed to load semesters.'));
    } else {
      setSemesters([]);
    }
  }, [selectedProgramId]);

  // 3. Wrap fetchSubjects in useCallback
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
    // 4. Add the function's dependencies
  }, [selectedProgramId, selectedSemesterId]);

  // 5. Re-fetch subjects whenever the stable fetchSubjects function changes
  useEffect(() => {
    fetchSubjects();
  }, [fetchSubjects]);

  // --- Handlers ---
  const handleSubjectAdded = () => { setShowAddForm(false); fetchSubjects(); };
  const handleSubjectUpdated = () => { setEditingSubject(null); fetchSubjects(); };
  
  const handleDelete = async () => {
    if (!deletingSubject) return;
    setDeleteLoading(true);
    try {
      await axios.delete(`http://localhost:5000/api/subjects/${deletingSubject.id}`);
      toast.success('Subject deleted successfully!');
      setSubjects(current => current.filter(s => s.id !== deletingSubject.id));
      setDeletingSubject(null);
    } catch (err) {
      if (axios.isAxiosError(err) && err.response) {
        toast.error(err.response.data.message || 'Failed to delete subject.');
      } else {
        toast.error('An unexpected error occurred.');
      }
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

  // --- Filtering & Pagination ---
  const filteredSubjects = subjects.filter(subject =>
    subject.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    subject.subjectCode.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const currentItems = filteredSubjects.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  const renderTableBody = () => {
    if (loading) {
      return <tr><td colSpan={5} className={styles.spinnerCell}><Spinner /></td></tr>;
    }
    if (filteredSubjects.length === 0) {
      return (
        <tr>
          <td colSpan={5}>
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
        <td>
          <button onClick={() => setAssigningSubject(subject)} className={`${styles.button} ${styles.assignButton}`}>Assign</button>
          <button onClick={() => setEditingSubject(subject)} className={`${styles.button} ${styles.editButton}`}>Edit</button>
          <button onClick={() => setDeletingSubject(subject)} className={`${styles.button} ${styles.deleteButton}`}>Delete</button>
        </td>
      </tr>
    ));
  };
  
  const addFormSemesterId = selectedSemesterId === 'all' ? '' : selectedSemesterId;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2>Manage Subjects</h2>
        <div className={styles.headerActions}>
          <select 
            value={selectedProgramId} 
            onChange={(e) => setSelectedProgramId(e.target.value)} 
            className={styles.filterDropdown}
          >
            <option value="all">-- All Programs --</option>
            {programs.map(p => <option key={p.id} value={p.id}>{p.title}</option>)}
          </select>
          <select 
            value={selectedSemesterId} 
            onChange={(e) => setSelectedSemesterId(e.target.value)} 
            className={styles.filterDropdown}
            disabled={selectedProgramId === 'all'}
          >
            <option value="all">-- All Semesters --</option>
            {semesters.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
          <button 
            onClick={() => setShowAddForm(prev => !prev)}
            disabled={selectedSemesterId === 'all' && !showAddForm} 
          >
            {showAddForm ? 'Cancel' : 'Add New Subject'}
          </button>
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
          selectedSemesterId={addFormSemesterId}
        />
      )}
      
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

      <Pagination
        count={filteredSubjects.length}
        page={page}
        rowsPerPage={rowsPerPage}
        onPageChange={setPage}
        onRowsPerPageChange={handleRowsPerPageChange}
      />

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
          onTeacherAssigned={() => setAssigningSubject(null)}
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