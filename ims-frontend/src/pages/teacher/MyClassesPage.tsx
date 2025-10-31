import { useState, useEffect, ChangeEvent } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import styles from '../../assets/scss/pages/admin/AdminPages.module.scss'; // Reusing admin styles
import Spinner from '../../components/common/Spinner';
import EmptyState from '../../components/common/EmptyState';
import Searchbar from '../../components/common/Searchbar';
import Pagination from '../../components/common/Pagination';
import { BsCardChecklist } from 'react-icons/bs';

// 1. This interface is now a simple Subject
interface Subject {
  id: string;
  title: string;
  subjectCode: string;
  semester: {
    name: string;
    program: {
      title: string;
    };
  };
}

const MyClassesPage = () => {
  const [subjects, setSubjects] = useState<Subject[]>([]); // 2. State is now Subject[]
  const [loading, setLoading] = useState(true);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  useEffect(() => {
    const fetchSubjects = async () => {
      setLoading(true);
      try {
        const response = await axios.get('http://localhost:5000/api/teachers/my-subjects');
        setSubjects(response.data);
      } catch (err) {
        if (axios.isAxiosError(err) && err.response) {
          toast.error(err.response.data.message || 'Failed to fetch assigned subjects.');
        } else {
          toast.error('An unexpected error occurred.');
        }
      } finally {
        setLoading(false);
      }
    };
    
    fetchSubjects();
  }, []);

  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setPage(0);
  };

  const handleRowsPerPageChange = (event: ChangeEvent<HTMLSelectElement>) => {
    setRowsPerPage(Number.parseInt(event.target.value, 10));
    setPage(0);
  };

  // 3. Filter logic is simplified
  const filteredSubjects = subjects.filter(s =>
    s.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.subjectCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.semester.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.semester.program.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const currentItems = filteredSubjects.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  const renderTableBody = () => {
    if (loading) {
      return (
        <tr>
          <td colSpan={4} className={styles.spinnerCell}>
            <Spinner />
          </td>
        </tr>
      );
    }
    if (filteredSubjects.length === 0) {
      return (
        <tr>
          <td colSpan={4}>
            <EmptyState 
              message={searchTerm ? "No subjects match your search." : "You have not been assigned to any subjects yet."} 
              icon={<BsCardChecklist size={40} />} 
            />
          </td>
        </tr>
      );
    }
    // 4. Map over subjects directly
    return currentItems.map((subject) => (
      <tr key={subject.id}>
        <td>{subject.title}</td>
        <td>{subject.subjectCode}</td>
        <td>{subject.semester.program.title}</td>
        <td>{subject.semester.name}</td>
      </tr>
    ));
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2>My Subjects</h2>
      </div>
      
      <div className={styles.searchContainer}>
        <Searchbar
          value={searchTerm}
          onChange={handleSearchChange}
          placeholder="Search by subject, code, or program..."
        />
      </div>
      
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Subject Title</th>
            <th>Code</th>
            <th>Program</th>
            <th>Semester</th>
          </tr>
        </thead>
        <tbody>
          {renderTableBody()}
        </tbody>
      </table>
      
      <Pagination
        count={filteredSubjects.length}
        page={page}
        rowsPerPage={rowsPerPage}
        onPageChange={setPage}
        onRowsPerPageChange={handleRowsPerPageChange}
      />
    </div>
  );
};

export default MyClassesPage;