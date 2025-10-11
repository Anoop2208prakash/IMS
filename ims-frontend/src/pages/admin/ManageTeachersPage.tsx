// src/pages/admin/ManageTeachersPage.tsx
import { useState, useEffect } from 'react';
import axios from 'axios';
import styles from './AdminPages.module.scss';
import AddTeacherForm from './AddTeacherForm';
import EditTeacherModal from './EditTeacherModal';

// Define a type for our teacher data
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
  const [error, setError] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState<TeacherData | null>(null); // <-- State for modal

  const fetchTeachers = async () => {
    if (teachers.length === 0) setLoading(true);
    try {
      const response = await axios.get('http://localhost:5000/api/teachers');
      setTeachers(response.data);
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch data.');
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
  };

  const handleTeacherUpdated = () => {
    setEditingTeacher(null); // Close the modal
    fetchTeachers(); // Refresh the list
  };

  const handleDelete = async (teacherId: string) => {
    if (!window.confirm('Are you sure you want to delete this teacher?')) {
      return;
    }
    try {
      await axios.delete(`http://localhost:5000/api/teachers/${teacherId}`);
      setTeachers(currentTeachers =>
        currentTeachers.filter(teacher => teacher.id !== teacherId)
      );
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete teacher.');
    }
  };

  if (loading) return <p>Loading teachers...</p>;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2>Manage Teachers</h2>
        <button onClick={() => setShowAddForm(!showAddForm)}>
          {showAddForm ? 'Cancel' : 'Add New Teacher'}
        </button>
      </div>

      {showAddForm && (
        <AddTeacherForm
          onTeacherAdded={handleTeacherAdded}
          onCancel={() => setShowAddForm(false)}
        />
      )}

      {error && <p className={styles.error}>{error}</p>}

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
          {teachers.map((teacher) => (
            <tr key={teacher.id}>
              <td>{teacher.name}</td>
              <td>{teacher.email}</td>
              <td>{teacher.teacher.employeeId}</td>
              <td>{teacher.teacher.department}</td>
              <td>{new Date(teacher.teacher.dateJoined).toLocaleDateString()}</td>
              <td>
                <button
                  onClick={() => setEditingTeacher(teacher)}
                  className={`${styles.button} ${styles.editButton}`}
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(teacher.id)}
                  className={`${styles.button} ${styles.deleteButton}`}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {editingTeacher && (
        <EditTeacherModal
          teacher={editingTeacher}
          onClose={() => setEditingTeacher(null)}
          onTeacherUpdated={handleTeacherUpdated}
        />
      )}
    </div>
  );
};

export default ManageTeachersPage;