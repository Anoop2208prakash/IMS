import { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import styles from './AdminPages.module.scss';
import DataTable, { Column } from '../../components/common/DataTable'; 
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
    } catch (err) {
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
    } catch (err) {
      if (axios.isAxiosError(err) && err.response) {
        toast.error(err.response.data.message || 'Failed to delete teacher.');
      } else {
        toast.error('An unexpected error occurred while deleting.');
      }
    }
  };

  // 2. Define the columns for the DataTable
  const columns: Column<TeacherData>[] = [
    { header: 'Name', accessor: 'name' },
    { header: 'Email', accessor: 'email' },
    { header: 'Employee ID', accessor: (row) => row.teacher.employeeId },
    { header: 'Department', accessor: (row) => row.teacher.department },
    { header: 'Date Joined', accessor: (row) => new Date(row.teacher.dateJoined).toLocaleDateString() },
  ];

  // 3. Define a function to render the action buttons
  const renderActions = (teacher: TeacherData) => (
    <>
      <button onClick={() => setEditingTeacher(teacher)} className={`${styles.button} ${styles.editButton}`}>Edit</button>
      <button onClick={() => handleDelete(teacher.id)} className={`${styles.button} ${styles.deleteButton}`}>Delete</button>
    </>
  );

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2>Manage Teachers</h2>
        <button onClick={() => setShowAddForm(true)}>
          {showAddForm ? 'Cancel' : 'Add New Teacher'}
        </button>
      </div>

      {showAddForm && <AddTeacherForm onTeacherAdded={handleTeacherAdded} onCancel={() => setShowAddForm(false)} />}

      {/* 4. Render the reusable DataTable component */}
      <DataTable
        columns={columns}
        data={teachers}
        loading={loading}
        renderActions={renderActions}
      />
      
      {editingTeacher && <EditTeacherModal teacher={editingTeacher} onClose={() => setEditingTeacher(null)} onTeacherUpdated={handleTeacherUpdated} />}
    </div>
  );
};

export default ManageTeachersPage;