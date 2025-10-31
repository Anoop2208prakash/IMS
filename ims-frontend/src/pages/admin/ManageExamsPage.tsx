import { useState, useEffect, ChangeEvent, useCallback } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import styles from '../../assets/scss/pages/admin/AdminPages.module.scss';
import Spinner from '../../components/common/Spinner';
import EmptyState from '../../components/common/EmptyState';
import Pagination from '../../components/common/Pagination';
import DeleteModal from '../../components/common/DeleteModal';
import Searchbar from '../../components/common/Searchbar';
import HeaderMenu from '../../components/common/HeaderMenu'; // 1. Import
import ImportCSVModal from '../../components/common/ImportCSVModal'; // 2. Import
import { BsPencilSquare, BsFilter } from 'react-icons/bs'; // 3. Import;
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
  const [showImportModal, setShowImportModal] = useState(false); // 4. Add state
  const [editingExam, setEditingExam] = useState<ExamData | null>(null);
  const [deletingExam, setDeletingExam] = useState<ExamData | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Search & Pagination States
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const fetchExams = useCallback(async () => {
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
  }, []); // 5. Add dependency

  useEffect(() => {
    fetchExams();
  }, [fetchExams]);

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

  const handleImportSuccess = () => {
    fetchExams();
  };

  const handleDelete = async () => {
    if (!deletingExam) return;
    setDeleteLoading(true);
    try {
      await axios.delete(`http://localhost:5000/api/exams/${deletingExam.id}`);
      setExams(current => current.filter(e => e.id !== deletingExam.id));
      toast.success('Exam deleted successfully!');
      setDeletingExam(null);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to delete exam.');
    } finally {
      setDeleteLoading(false);
    }
  };

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

  const handleExportCSV = async () => {
    toast.loading('Preparing download...');
    try {
      const response = await axios.get('http://localhost:5000/api/export/exams', {
        params: { searchTerm },
        responseType: 'blob',
      });
      const url = URL.createObjectURL(response.data);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', 'exams_export.csv');
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
        toast.error(errorJson.message || 'Failed to export exams.');
      } catch (e) {
        toast.error('Failed to export exams.');
      }
    }
  };

  const menuActions = [
    {
      label: 'Add New Exam',
      onClick: () => setShowAddForm(true),
    },
    { label: 'Export CSV', onClick: handleExportCSV },
    { label: 'Import CSV', onClick: () => setShowImportModal(true) }
  ];

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
        {/* 6. Use new header controls */}
        <div className={styles.headerActions}>
          <button className={styles.iconButton} onClick={() => toast.error('No filters available for this page.')}>
            <BsFilter />
          </button>
          <HeaderMenu actions={menuActions} />
        </div>
      </div>

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

      <Pagination
        count={filteredExams.length}
        page={page}
        rowsPerPage={rowsPerPage}
        onPageChange={setPage}
        onRowsPerPageChange={handleRowsPerPageChange}
      />

      {/* 7. Render new Import Modal */}
      {showImportModal && (
        <ImportCSVModal
          onClose={() => setShowImportModal(false)}
          onImportSuccess={handleImportSuccess}
          importUrl="http://localhost:5000/api/import/exams"
        />
      )}

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