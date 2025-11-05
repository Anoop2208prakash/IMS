import { useState, useEffect, ChangeEvent, useCallback } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import styles from '../../assets/scss/pages/admin/AdminPages.module.scss';
import Spinner from '../../components/common/Spinner';
import EmptyState from '../../components/common/EmptyState';
import Pagination from '../../components/common/Pagination';
import DeleteModal from '../../components/common/DeleteModal';
import Searchbar from '../../components/common/Searchbar';
import HeaderMenu from '../../components/common/HeaderMenu';
import { BsShieldLockFill } from 'react-icons/bs';
import AddStaffForm from './AddStaffForm';

interface StaffData {
  id: string;
  name: string;
  email: string;
  sID: string;
  role: string;
  teacher: {
    department: string;
  } | null;
}

const ManageStaffPage = () => {
  const [staff, setStaff] = useState<StaffData[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  
  const [deletingStaff, setDeletingStaff] = useState<StaffData | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const fetchStaff = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axios.get('http://localhost:5000/api/staff');
      setStaff(response.data);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to fetch staff.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStaff();
  }, [fetchStaff]);

  const handleStaffAdded = () => {
    setShowAddForm(false);
    fetchStaff();
  };

  const handleDelete = async () => {
    if (!deletingStaff) return;
    setDeleteLoading(true);
    try {
      await axios.delete(`http://localhost:5000/api/staff/${deletingStaff.id}`);
      setStaff(current => current.filter(s => s.id !== deletingStaff.id));
      toast.success('Staff member deleted successfully!');
      setDeletingStaff(null);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to delete staff member.');
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

  const filteredStaff = staff.filter(s =>
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.sID.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.role.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const currentItems = filteredStaff.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  const menuActions = [
    {
      label: 'Add New Staff',
      onClick: () => setShowAddForm(true),
    }
  ];

  const renderTableBody = () => {
    if (loading) {
      return <tr><td colSpan={5} className={styles.spinnerCell}><Spinner /></td></tr>;
    }
    if (filteredStaff.length === 0) {
      return (
        <tr>
          <td colSpan={5}>
            <EmptyState 
              message={searchTerm ? "No staff match your search." : "No staff found."}
              icon={<BsShieldLockFill size={40} />} 
            />
          </td>
        </tr>
      );
    }
    return currentItems.map((user) => (
      <tr key={user.id}>
        <td>{user.name}</td>
        <td>{user.sID}</td>
        <td>{user.email}</td>
        <td>{user.role}</td>
        <td>
          <button 
            onClick={() => setDeletingStaff(user)} 
            className={`${styles.button} ${styles.deleteButton}`}
            disabled={user.role === 'SUPER_ADMIN'}
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
        <h2>Manage Staff</h2>
        <div className={styles.headerActions}>
          <HeaderMenu actions={menuActions} />
        </div>
      </div>

      <div className={styles.searchContainer}>
        <Searchbar
          value={searchTerm}
          onChange={handleSearchChange}
          placeholder="Search by name, SID, email, or role..."
        />
      </div>

      {showAddForm && <AddStaffForm onStaffAdded={handleStaffAdded} onCancel={() => setShowAddForm(false)} />}

      <table className={styles.table}>
        <thead>
          <tr>
            <th>Name</th>
            <th>SID</th>
            <th>Email</th>
            <th>Role</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {renderTableBody()}
        </tbody>
      </table>
      
      <Pagination
        count={filteredStaff.length}
        page={page}
        rowsPerPage={rowsPerPage}
        onPageChange={setPage}
        onRowsPerPageChange={handleRowsPerPageChange}
      />
      
      {deletingStaff && (
        <DeleteModal
          title="Delete Staff Member"
          message={`Are you sure you want to delete ${deletingStaff.name}? This action is permanent.`}
          onClose={() => setDeletingStaff(null)}
          onConfirm={handleDelete}
          loading={deleteLoading}
        />
      )}
    </div>
  );
};

export default ManageStaffPage;