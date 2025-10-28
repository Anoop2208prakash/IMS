import { useState, useEffect, ChangeEvent } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import styles from '../../assets/scss/pages/admin/AdminPages.module.scss';
import Spinner from '../../components/common/Spinner';
import EmptyState from '../../components/common/EmptyState';
import Pagination from '../../components/common/Pagination';
import DeleteModal from '../../components/common/DeleteModal'; // 1. Import DeleteModal
import Searchbar from '../../components/common/Searchbar';
import { FaUserGraduate } from 'react-icons/fa';
import EditStudentModal from './EditStudentModal';

interface StudentData {
  id: string;
  name: string;
  email: string;
  student: {
    rollNumber: string;
    admissionDate: string;
  };
  programName: string;
}

const ManageStudentsPage = () => {
  const [students, setStudents] = useState<StudentData[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingStudent, setEditingStudent] = useState<StudentData | null>(null);
  
  // 3. Add state for DeleteModal
  const [deletingStudent, setDeletingStudent] = useState<StudentData | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  
  // 4. Add state for Searchbar
  const [searchTerm, setSearchTerm] = useState('');
  
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const response = await axios.get('http://localhost:5000/api/students');
      setStudents(response.data);
    } catch (err) {
      if (axios.isAxiosError(err) && err.response) {
        toast.error(err.response.data.message || 'Failed to fetch students.');
      } else {
        toast.error('An unexpected error occurred.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const handleStudentUpdated = () => {
    setEditingStudent(null);
    fetchStudents();
    toast.success('Student information updated!');
  };

  // 5. Update handleDelete to work with the modal
  const handleDelete = async () => {
    if (!deletingStudent) return;
    setDeleteLoading(true);
    try {
      await axios.delete(`http://localhost:5000/api/students/${deletingStudent.id}`);
      setStudents(current => current.filter(s => s.id !== deletingStudent.id));
      toast.success('Student deleted successfully!');
      setDeletingStudent(null);
    } catch (err) {
      if (axios.isAxiosError(err) && err.response) {
        toast.error(err.response.data.message || 'Failed to delete student.');
      } else {
        toast.error('An unexpected error occurred while deleting.');
      }
    } finally {
      setDeleteLoading(false);
    }
  };

  // 6. Filtering and Pagination Logic
  const filteredStudents = students.filter(student =>
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.student.rollNumber.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const currentItems = filteredStudents.slice(
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
    if (filteredStudents.length === 0) {
      return (
        <tr>
          <td colSpan={6}>
            <EmptyState 
              message={searchTerm ? `No students match "${searchTerm}"` : "No students found."} 
              icon={<FaUserGraduate size={40} />} 
            />
          </td>
        </tr>
      );
    }
    return currentItems.map((student) => (
      <tr key={student.id}>
        <td>{student.name}</td>
        <td>{student.email}</td>
        <td>{student.student?.rollNumber}</td>
        <td>{student.programName}</td>
        <td>{new Date(student.student?.admissionDate).toLocaleDateString()}</td>
        <td>
          <button
            onClick={() => setEditingStudent(student)}
            className={`${styles.button} ${styles.editButton}`}
          >
            Edit
          </button>
          {/* 7. Update delete button to open modal */}
          <button
            onClick={() => setDeletingStudent(student)}
            className={`${styles.button} ${styles.deleteButton}`}
          >
            Delete
          </button>
        </td>
      </tr>
    ));
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2>Manage Students</h2>
      </div>

      {/* 8. Add the Searchbar */}
      <div className={styles.searchContainer}>
        <Searchbar
          value={searchTerm}
          onChange={handleSearchChange}
          placeholder="Search by name, email, or roll number..."
        />
      </div>

      <table className={styles.table}>
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Roll Number</th>
            <th>Program</th>
            <th>Admission Date</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {renderTableBody()}
        </tbody>
      </table>

      <Pagination
        count={filteredStudents.length}
        page={page}
        rowsPerPage={rowsPerPage}
        onPageChange={setPage}
        onRowsPerPageChange={handleRowsPerPageChange}
      />

      {editingStudent && (
        <EditStudentModal
          student={editingStudent}
          onClose={() => setEditingStudent(null)}
          onStudentUpdated={handleStudentUpdated}
        />
      )}

      {/* 9. Add the DeleteModal */}
      {deletingStudent && (
        <DeleteModal
          title="Delete Student"
          message={`Are you sure you want to delete ${deletingStudent.name} (${deletingStudent.student.rollNumber})? This action is permanent.`}
          onClose={() => setDeletingStudent(null)}
          onConfirm={handleDelete}
          loading={deleteLoading}
        />
      )}
    </div>
  );
};

export default ManageStudentsPage;