import { useState, useEffect, ChangeEvent, useCallback } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import styles from '../../assets/scss/pages/admin/AdminPages.module.scss';
import Spinner from '../../components/common/Spinner';
import EmptyState from '../../components/common/EmptyState';
import Pagination from '../../components/common/Pagination';
import DeleteModal from '../../components/common/DeleteModal';
import Searchbar from '../../components/common/Searchbar';
import HeaderMenu from '../../components/common/HeaderMenu';
import FilterModal from '../../components/common/FilterModal';
import { BsShieldLockFill, BsFilter } from 'react-icons/bs';

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
interface FilterOption {
  value: string;
  label: string;
}

const ManageStaffPage = () => {
  const [staff, setStaff] = useState<StaffData[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [deletingStaff, setDeletingStaff] = useState<StaffData | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const [selectedRole, setSelectedRole] = useState('all');
  const [showFilterModal, setShowFilterModal] = useState(false);

  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  
  const navigate = useNavigate();

  const fetchStaff = useCallback(async () => {
    setLoading(true);
    try {
      const params = { role: selectedRole };
      const response = await axios.get('http://localhost:5000/api/staff', { params });
      setStaff(response.data);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to fetch staff.');
    } finally {
      setLoading(false);
      setPage(0);
    }
  }, [selectedRole]);

  useEffect(() => {
    fetchStaff();
  }, [fetchStaff]);

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

  const handleApplyFilter = (filters: { programId: string; semesterId: string }) => {
    setSelectedRole(filters.programId);
  };

  const roleOptions: FilterOption[] = [
    { value: 'all', label: 'All Roles' },
    { value: 'SUPER_ADMIN', label: 'Super Admin' },
    { value: 'ADMIN', label: 'Admin' },
    { value: 'ADMIN_ADMISSION', label: 'Admin (Admission)' },
    { value: 'ADMIN_FINANCE', label: 'Admin (Finance)' },
    { value: 'ADMIN_LIBRARY', label: 'Admin (Library)' },
    { value: 'TEACHER', label: 'Teacher' },
  ];

  const filteredStaff = staff.filter(s =>
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.sID.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const currentItems = filteredStaff.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  const menuActions = [
    {
      label: 'Add New Staff',
      onClick: () => navigate('/staff-register'), // Go to the temporary page
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
          <button className={styles.iconButton} onClick={() => setShowFilterModal(true)}>
            <BsFilter />
          </button>
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
      
      {/* --- THIS IS THE FIX --- */}
      {showFilterModal && (
        <FilterModal
          onClose={() => setShowFilterModal(false)}
          onApply={handleApplyFilter}
          initialFilters={{ programId: selectedRole, semesterId: 'all' }}
          filterType="program"          // 1. Use the 'program' type, NOT 'category'
          programLabel="Role"           // 2. Set the label to "Role"
          programOptions={roleOptions}  // 3. Pass in the roleOptions
          semesterOptions={[]} 
        />
      )}
      {/* ----------------------- */}

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