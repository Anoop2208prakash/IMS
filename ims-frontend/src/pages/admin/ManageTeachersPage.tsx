import { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import styles from './AdminPages.module.scss';
import Spinner from '../../components/common/Spinner';
import EmptyState from '../../components/common/EmptyState';
import { FaChalkboardTeacher } from 'react-icons/fa'; // 1. Import a suitable icon
import AddTeacherForm from './AddTeacherForm';
import EditTeacherModal from './EditTeacherModal';

interface TeacherData {
  id: string;
  name: string;
  email: string;
  teacher: {
    employeeId: string;
    department: string;
    dateJoined: string;
  };
}

const ManageTeachersPage = () => {
  const [teachers, setTeachers] = useState<TeacherData[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState<TeacherData | null>(null);

  const fetchTeachers = async () => {
    setLoading(true);
    try {
      const response = await axios.get('http://localhost:5000/api/teachers');
      setTeachers(response.data);
    } catch (err) { // 2. Fix 'any' type error
      if (axios.isAxiosError(err) && err.response) {
        toast.error(err.response.data.message || 'Failed to fetch teachers.');
      } else {
        toast.error('An unexpected error occurred.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeachers();
  }, []);

  const handleTeacherAdded = () => {
    setShowAddForm(false);
    fetchTeachers();
    toast.success('Teacher added successfully!');
  };

  const handleTeacherUpdated = () => {
    setEditingTeacher(null);
    fetchTeachers();
    toast.success('Teacher information updated!');
  };

  const handleDelete = async (teacherId: string) => {
    if (!window.confirm('Are you sure you want to delete this teacher?')) return;
    try {
      await axios.delete(`http://localhost:5000/api/teachers/${teacherId}`);
      setTeachers(current => current.filter(t => t.id !== teacherId));
      toast.success('Teacher deleted successfully!');
    } catch (err) { // 2. Fix 'any' type error
      if (axios.isAxiosError(err) && err.response) {
        toast.error(err.response.data.message || 'Failed to delete teacher.');
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
    if (teachers.length === 0) {
      return (
        <tr>
          <td colSpan={6}>
            <EmptyState 
              message="No teachers found. Click 'Add New Teacher' to get started." 
              icon={<FaChalkboardTeacher size={40} />} 
            />
          </td>
        </tr>
      );
    }
    return teachers.map((teacher) => (
      <tr key={teacher.id}>
        <td>{teacher.name}</td>
        <td>{teacher.email}</td>
        <td>{teacher.teacher.employeeId}</td>
        <td>{teacher.teacher.department}</td>
        <td>{new Date(teacher.teacher.dateJoined).toLocaleDateString()}</td>
        <td>
          <button onClick={() => setEditingTeacher(teacher)} className={`${styles.button} ${styles.editButton}`}>Edit</button>
          <button onClick={() => handleDelete(teacher.id)} className={`${styles.button} ${styles.deleteButton}`}>Delete</button>
        </td>
      </tr>
    ));
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2>Manage Teachers</h2>
        <button onClick={() => setShowAddForm(true)}>
          {showAddForm ? 'Cancel' : 'Add New Teacher'}
        </button>
      </div>

      {showAddForm && <AddTeacherForm onTeacherAdded={handleTeacherAdded} onCancel={() => setShowAddForm(false)} />}

      <table className={styles.table}>
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Employee ID</th>
            <th>Department</th>
            <th>Date Joined</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {renderTableBody()} {/* 4. Call the new render function */}
        </tbody>
      </table>
      
      {editingTeacher && <EditTeacherModal teacher={editingTeacher} onClose={() => setEditingTeacher(null)} onTeacherUpdated={handleTeacherUpdated} />}
    </div>
  );
};

export default ManageTeachersPage;