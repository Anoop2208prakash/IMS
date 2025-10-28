import { useState, useEffect, ChangeEvent } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import styles from '../../../assets/scss/pages/admin/AdminPages.module.scss';
import Spinner from '../../../components/common/Spinner';
import EmptyState from '../../../components/common/EmptyState';
import Pagination from '../../../components/common/Pagination';
import Searchbar from '../../../components/common/Searchbar'; // 1. Import Searchbar
import { FaUserGraduate } from 'react-icons/fa';

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

const ViewAdmissionsPage = () => {
  const [students, setStudents] = useState<StudentData[]>([]);
  const [loading, setLoading] = useState(true);
  
  // 2. Add state for search
  const [searchTerm, setSearchTerm] = useState('');
  
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  useEffect(() => {
    const fetchAdmittedStudents = async () => {
      try {
        setLoading(true);
        const response = await axios.get('http://localhost:5000/api/students');
        setStudents(response.data);
      } catch (err) {
        if (axios.isAxiosError(err) && err.response) {
          toast.error(err.response.data.message || 'Failed to fetch admission data.');
        } else {
          toast.error('An unexpected error occurred.');
        }
      } finally {
        setLoading(false);
      }
    };
    fetchAdmittedStudents();
  }, []);

  // 3. Filtering Logic
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
    setPage(0); // Reset to first page on new search
  };

  const renderTableBody = () => {
    if (loading) {
      return (
        <tr>
          <td colSpan={5} className={styles.spinnerCell}><Spinner /></td>
        </tr>
      );
    }
    // 4. Update check to use filtered data
    if (filteredStudents.length === 0) {
      return (
        <tr>
          <td colSpan={5}>
            <EmptyState 
              message={searchTerm ? `No students match "${searchTerm}"` : "No students have been admitted yet."} 
              icon={<FaUserGraduate size={40} />} 
            />
          </td>
        </tr>
      );
    }
    // 5. Map over 'currentItems' for pagination
    return currentItems.map((student) => (
      <tr key={student.id}>
        <td>{student.name}</td>
        <td>{student.student?.rollNumber || 'N/A'}</td>
        <td>{student.email}</td>
        <td>{student.programName}</td>
        <td>{new Date(student.student?.admissionDate).toLocaleDateString()}</td>
      </tr>
    ));
  };

  return (
    <div className={styles.container}>
      <h2>View All Admitted Students</h2>
      
      {/* 6. Add the Searchbar component */}
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
            <th>Roll Number</th>
            <th>Email</th>
            <th>Admitted Program</th>
            <th>Admission Date</th>
          </tr>
        </thead>
        <tbody>
          {renderTableBody()}
        </tbody>
      </table>

      <Pagination
        count={filteredStudents.length} // 7. Update count to use filtered data
        page={page}
        rowsPerPage={rowsPerPage}
        onPageChange={setPage}
        onRowsPerPageChange={handleRowsPerPageChange}
      />
    </div>
  );
};

export default ViewAdmissionsPage;