import { useState, useEffect, ChangeEvent } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import styles from '../../assets/scss/pages/admin/AdminPages.module.scss';
import Spinner from '../../components/common/Spinner';
import EmptyState from '../../components/common/EmptyState';
import Pagination from '../../components/common/Pagination';
import DeleteModal from '../../components/common/DeleteModal';
import Searchbar from '../../components/common/Searchbar';
import { FaChalkboardTeacher } from 'react-icons/fa';
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
  
  // Modal States
  const [editingTeacher, setEditingTeacher] = useState<TeacherData | null>(null);
  const [deletingTeacher, setDeletingTeacher] = useState<TeacherData | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Search & Pagination States
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

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

  const handleDelete = async () => {
    if (!deletingTeacher) return;
    setDeleteLoading(true);
    try {
      await axios.delete(`http://localhost:5000/api/teachers/${deletingTeacher.id}`);
      setTeachers(current => current.filter(t => t.id !== deletingTeacher.id));
      toast.success('Teacher deleted successfully!');
      setDeletingTeacher(null);
    } catch (err) {
      if (axios.isAxiosError(err) && err.response) {
        toast.error(err.response.data.message || 'Failed to delete teacher.');
      } else {
        toast.error('An unexpected error occurred while deleting.');
      }
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setPage(0);
  };
  
  const handleRowsPerPageChange = (event: ChangeEvent<HTMLSelectElement>) => {
    setRowsPerPage(Number.parseInt(event.target.value, 10));
    setPage(0);
  };

  // Filter teachers based on search term
  const filteredTeachers = teachers.filter(teacher =>
    teacher.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    teacher.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    teacher.teacher.employeeId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    teacher.teacher.department.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const currentItems = filteredTeachers.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

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
    if (filteredTeachers.length === 0) {
      return (
        <tr>
          <td colSpan={6}>
            <EmptyState 
              message={searchTerm ? "No teachers match your search." : "No teachers found. Click 'Add New Teacher' to get started."}
              icon={<FaChalkboardTeacher size={40} />} 
            />
          </td>
        </tr>
      );
    }
    return currentItems.map((teacher) => (
      <tr key={teacher.id}>
        <td>{teacher.name}</td>
        <td>{teacher.email}</td>
        <td>{teacher.teacher.employeeId}</td>
        <td>{teacher.teacher.department}</td>
        <td>{new Date(teacher.teacher.dateJoined).toLocaleDateString()}</td>
        <td>
          <button onClick={() => setEditingTeacher(teacher)} className={`${styles.button} ${styles.editButton}`}>Edit</button>
          <button onClick={() => setDeletingTeacher(teacher)} className={`${styles.button} ${styles.deleteButton}`}>Delete</button>
        </td>
      </tr>
    ));
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2>Manage Teachers</h2>
        <button onClick={() => setShowAddForm(prev => !prev)}>
          {showAddForm ? 'Cancel' : 'Add New Teacher'}
        </button>
      </div>

      <div className={styles.searchContainer}>
        <Searchbar
          value={searchTerm}
          onChange={handleSearchChange}
          placeholder="Search by name, email, ID, or department..."
        />
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
          {renderTableBody()}
        </tbody>
      </table>
      
      <Pagination
        count={filteredTeachers.length}
        page={page}
        rowsPerPage={rowsPerPage}
        onPageChange={setPage}
        onRowsPerPageChange={handleRowsPerPageChange}
      />
      
      {editingTeacher && <EditTeacherModal teacher={editingTeacher} onClose={() => setEditingTeacher(null)} onTeacherUpdated={handleTeacherUpdated} />}
      
      {deletingTeacher && (
        <DeleteModal
          title="Delete Teacher"
          message={`Are you sure you want to delete ${deletingTeacher.name}? This action is permanent.`}
          onClose={() => setDeletingTeacher(null)}
          onConfirm={handleDelete}
          loading={deleteLoading}
        />
      )}
    </div>
  );
};

export default ManageTeachersPage;