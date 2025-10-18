import { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import styles from './AdminPages.module.scss';
import Spinner from '../../components/common/Spinner';
import EmptyState from '../../components/common/EmptyState';
import { FaUserGraduate } from 'react-icons/fa';
import EditStudentModal from './EditStudentModal';

// 1. Updated interface to match the new API response
interface StudentData {
  id: string;
  name: string;
  email: string;
  student: {
    rollNumber: string;
    admissionDate: string;
  };
  programName: string; // <-- This field comes from the updated API
}

const ManageStudentsPage = () => {
  const [students, setStudents] = useState<StudentData[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingStudent, setEditingStudent] = useState<StudentData | null>(null);

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

  const handleDelete = async (studentId: string) => {
    if (!window.confirm('Are you sure you want to delete this student?')) return;
    try {
      await axios.delete(`http://localhost:5000/api/students/${studentId}`);
      setStudents(current => current.filter(s => s.id !== studentId));
      toast.success('Student deleted successfully!');
    } catch (err) {
      if (axios.isAxiosError(err) && err.response) {
        toast.error(err.response.data.message || 'Failed to delete student.');
      } else {
        toast.error('An unexpected error occurred while deleting.');
      }
    }
  };

  // 3. New render function to simplify the table body logic
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
    if (students.length === 0) {
      return (
        <tr>
          <td colSpan={6}>
            <EmptyState 
              message="No students found. Use the 'New Admission' page to add students." 
              icon={<FaUserGraduate size={40} />} 
            />
          </td>
        </tr>
      );
    }
    return students.map((student) => (
      <tr key={student.id}>
        <td>{student.name}</td>
        <td>{student.email}</td>
        <td>{student.student?.rollNumber}</td>
        <td>{student.programName}</td> {/* 4. Use the new programName field */}
        <td>{new Date(student.student?.admissionDate).toLocaleDateString()}</td>
        <td>
          <button
            onClick={() => setEditingStudent(student)}
            className={`${styles.button} ${styles.editButton}`}
          >
            Edit
          </button>
          <button
            onClick={() => handleDelete(student.id)}
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
        {/* Button to add students is removed, as it's now on its own page */}
      </div>

      <table className={styles.table}>
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Roll Number</th>
            <th>Program</th> {/* 5. Updated table header */}
            <th>Admission Date</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {renderTableBody()}
        </tbody>
      </table>

      {editingStudent && (
        <EditStudentModal
          student={editingStudent}
          onClose={() => setEditingStudent(null)}
          onStudentUpdated={handleStudentUpdated}
        />
      )}
    </div>
  );
};

export default ManageStudentsPage;