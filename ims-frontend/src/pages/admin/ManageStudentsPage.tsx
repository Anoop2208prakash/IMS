import { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import styles from './AdminPages.module.scss';
import Spinner from '../../components/common/Spinner';
import EmptyState from '../../components/common/EmptyState';
import { FaUserGraduate } from 'react-icons/fa'; // 1. Import a suitable icon
import AddStudentForm from './AddStudentForm';
import EditStudentModal from './EditStudentModal';

interface StudentData {
  id: string;
  name: string;
  email: string;
  student: {
    rollNumber: string;
    admissionDate: string;
  };
  enrollments: Array<{
    course: {
      title: string;
    };
  }>;
}

const ManageStudentsPage = () => {
  const [students, setStudents] = useState<StudentData[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingStudent, setEditingStudent] = useState<StudentData | null>(null);

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const response = await axios.get('http://localhost:5000/api/students');
      setStudents(response.data);
    } catch (err) { // 2. Fix 'any' type error
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

  const handleStudentAdded = () => {
    setShowAddForm(false);
    fetchStudents();
    toast.success('Student added successfully!');
  };

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
    } catch (err) { // 2. Fix 'any' type error
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
              message="No students found. Click 'Add New Student' to get started." 
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
        <td>{student.enrollments[0]?.course?.title || 'N/A'}</td>
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
        <button onClick={() => setShowAddForm(true)}>
          {showAddForm ? 'Cancel' : 'Add New Student'}
        </button>
      </div>

      {showAddForm && (
        <AddStudentForm
          onStudentAdded={handleStudentAdded}
          onCancel={() => setShowAddForm(false)}
        />
      )}

      <table className={styles.table}>
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Roll Number</th>
            <th>Course</th>
            <th>Admission Date</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {renderTableBody()} {/* 4. Call the new render function */}
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