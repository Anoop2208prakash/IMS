import { useState, useEffect, ChangeEvent } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import styles from '../../assets/scss/pages/admin/AdminPages.module.scss';
import Spinner from '../../components/common/Spinner';
import EmptyState from '../../components/common/EmptyState';
import Pagination from '../../components/common/Pagination';
import DeleteModal from '../../components/common/DeleteModal';
import Searchbar from '../../components/common/Searchbar'; // 1. Import Searchbar
import { BsPencilSquare } from 'react-icons/bs';
import AddExamForm from './AddExamForm';
import EditExamModal from './EditExamModal';

interface ExamData {
  id: string;
  name: string;
  date: string;
  totalMarks: number;
}

const ManageExamsPage = () => {
  const [exams, setExams] = useState<ExamData[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  
  // Modal States
  const [editingExam, setEditingExam] = useState<ExamData | null>(null);
  const [deletingExam, setDeletingExam] = useState<ExamData | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Search & Pagination States
  const [searchTerm, setSearchTerm] = useState(''); // 2. Add search state
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const fetchExams = async () => {
    setLoading(true);
    try {
      const response = await axios.get('http://localhost:5000/api/exams');
      setExams(response.data);
    } catch (err) {
      if (axios.isAxiosError(err) && err.response) {
        toast.error(err.response.data.message || 'Failed to fetch exams.');
      } else {
        toast.error('An unexpected error occurred.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExams();
  }, []);

  const handleExamAdded = () => {
    setShowAddForm(false);
    fetchExams();
    toast.success('Exam created successfully!');
  };

  const handleExamUpdated = () => {
    setEditingExam(null);
    fetchExams();
    toast.success('Exam updated successfully!');
  };

  const handleDelete = async () => {
    if (!deletingExam) return;
    setDeleteLoading(true);
    try {
      await axios.delete(`http://localhost:5000/api/exams/${deletingExam.id}`);
      setExams(current => current.filter(e => e.id !== deletingExam.id));
      toast.success('Exam deleted successfully!');
      setDeletingExam(null);
    } catch (err) {
      if (axios.isAxiosError(err) && err.response) {
        toast.error(err.response.data.message || 'Failed to delete exam.');
      } else {
        toast.error('An unexpected error occurred while deleting.');
      }
    } finally {
      setDeleteLoading(false);
    }
  };

  // --- Filtering & Pagination ---
  const filteredExams = exams.filter(exam =>
    exam.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleRowsPerPageChange = (event: ChangeEvent<HTMLSelectElement>) => {
    setRowsPerPage(Number.parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setPage(0);
  };

  const currentItems = filteredExams.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  const renderTableBody = () => {
    if (loading) {
      return (
        <tr>
          <td colSpan={4} className={styles.spinnerCell}>
            <Spinner />
          </td>
        </tr>
      );
    }
    if (filteredExams.length === 0) {
      return (
        <tr>
          <td colSpan={4}>
            <EmptyState 
              message={searchTerm ? `No exams match "${searchTerm}"` : "No exams found. Click 'Add New Exam' to get started."} 
              icon={<BsPencilSquare size={40} />} 
            />
          </td>
        </tr>
      );
    }
    return currentItems.map((exam) => (
      <tr key={exam.id}>
        <td>{exam.name}</td>
        <td>{new Date(exam.date).toLocaleDateString()}</td>
        <td>{exam.totalMarks}</td>
        <td>
          <button onClick={() => setEditingExam(exam)} className={`${styles.button} ${styles.editButton}`}>Edit</button>
          <button onClick={() => setDeletingExam(exam)} className={`${styles.button} ${styles.deleteButton}`}>Delete</button>
        </td>
      </tr>
    ));
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2>Manage Exams</h2>
        <button onClick={() => setShowAddForm(prev => !prev)}>
          {showAddForm ? 'Cancel' : 'Add New Exam'}
        </button>
      </div>

      {/* 3. Add the Searchbar */}
      <div className={styles.searchContainer}>
        <Searchbar
          value={searchTerm}
          onChange={handleSearchChange}
          placeholder="Search by exam name..."
        />
      </div>

      {showAddForm && <AddExamForm onExamAdded={handleExamAdded} onCancel={() => setShowAddForm(false)} />}

      <table className={styles.table}>
        <thead>
          <tr>
            <th>Exam Name</th>
            <th>Date</th>
            <th>Total Marks</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {renderTableBody()}
        </tbody>
      </table>

      {/* 4. Update count to use filtered data */}
      <Pagination
        count={filteredExams.length}
        page={page}
        rowsPerPage={rowsPerPage}
        onPageChange={setPage}
        onRowsPerPageChange={handleRowsPerPageChange}
      />

      {editingExam && <EditExamModal exam={editingExam} onClose={() => setEditingExam(null)} onExamUpdated={handleExamUpdated} />}
      
      {deletingExam && (
        <DeleteModal
          title="Delete Exam"
          message={`Are you sure you want to delete the "${deletingExam.name}" exam? This action cannot be undone.`}
          onClose={() => setDeletingExam(null)}
          onConfirm={handleDelete}
          loading={deleteLoading}
        />
      )}
    </div>
  );
};

export default ManageExamsPage;