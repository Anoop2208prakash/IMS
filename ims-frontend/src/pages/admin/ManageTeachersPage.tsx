import { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import styles from './AdminPages.module.scss';
import Spinner from '../../components/common/Spinner';
import EmptyState from '../../components/common/EmptyState';
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
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to fetch teachers.');
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
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to delete teacher.');
    }
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
          {loading ? (
            <tr>
              <td colSpan={6} className={styles.spinnerCell}>
                <Spinner />
              </td>
            </tr>
          ) : teachers.length === 0 ? (
            <tr>
              <td colSpan={6}>
                <EmptyState message="No teachers found. Click 'Add New Teacher' to get started." icon="👨‍🏫" />
              </td>
            </tr>
          ) : (
            teachers.map((teacher) => (
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
            ))
          )}
        </tbody>
      </table>
      
      {editingTeacher && <EditTeacherModal teacher={editingTeacher} onClose={() => setEditingTeacher(null)} onTeacherUpdated={handleTeacherUpdated} />}
    </div>
  );
};

export default ManageTeachersPage;