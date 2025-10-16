import { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import styles from './AdminPages.module.scss';
import Spinner from '../../components/common/Spinner';
import EmptyState from '../../components/common/EmptyState';
import { BsPencilSquare } from 'react-icons/bs'; // Import a suitable icon
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
  const [editingExam, setEditingExam] = useState<ExamData | null>(null);

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

  const handleDelete = async (examId: string) => {
    if (!window.confirm('Are you sure you want to delete this exam?')) return;
    try {
      await axios.delete(`http://localhost:5000/api/exams/${examId}`);
      setExams(current => current.filter(e => e.id !== examId));
      toast.success('Exam deleted successfully!');
    } catch (err) {
      if (axios.isAxiosError(err) && err.response) {
        toast.error(err.response.data.message || 'Failed to delete exam.');
      } else {
        toast.error('An unexpected error occurred while deleting.');
      }
    }
  };

  // --- New Render Function for the Table Body ---
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
    if (exams.length === 0) {
      return (
        <tr>
          <td colSpan={4}>
            <EmptyState 
              message="No exams found. Click 'Add New Exam' to get started." 
              icon={<BsPencilSquare size={40} />} 
            />
          </td>
        </tr>
      );
    }
    return exams.map((exam) => (
      <tr key={exam.id}>
        <td>{exam.name}</td>
        <td>{new Date(exam.date).toLocaleDateString()}</td>
        <td>{exam.totalMarks}</td>
        <td>
          <button onClick={() => setEditingExam(exam)} className={`${styles.button} ${styles.editButton}`}>Edit</button>
          <button onClick={() => handleDelete(exam.id)} className={`${styles.button} ${styles.deleteButton}`}>Delete</button>
        </td>
      </tr>
    ));
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2>Manage Exams</h2>
        <button onClick={() => setShowAddForm(true)}>
          {showAddForm ? 'Cancel' : 'Add New Exam'}
        </button>
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

      {editingExam && <EditExamModal exam={editingExam} onClose={() => setEditingExam(null)} onExamUpdated={handleExamUpdated} />}
    </div>
  );
};

export default ManageExamsPage;