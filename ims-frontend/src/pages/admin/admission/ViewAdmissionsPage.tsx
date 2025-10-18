import { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import styles from '../AdminPages.module.scss';
import Spinner from '../../../components/common/Spinner';
import EmptyState from '../../../components/common/EmptyState';
import { FaUserGraduate } from 'react-icons/fa'; // 1. Import a suitable icon

interface StudentData {
  id: string;
  name: string;
  email: string;
  student: {
    rollNumber: string;
    admissionDate: string;
  };
  programName: string; // 2. Updated interface to expect programName
}

const ViewAdmissionsPage = () => {
  const [students, setStudents] = useState<StudentData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAdmittedStudents = async () => {
      try {
        setLoading(true);
        const response = await axios.get('http://localhost:5000/api/students');
        setStudents(response.data);
      } catch (err) { // 3. Fixed 'any' type error
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

  return (
    <div className={styles.container}>
      <h2>View All Admitted Students</h2>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Name</th>
            <th>Roll Number</th>
            <th>Email</th>
            <th>Admitted Program</th> {/* 4. Updated header text */}
            <th>Admission Date</th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td colSpan={5} className={styles.spinnerCell}>
                <Spinner />
              </td>
            </tr>
          ) : students.length === 0 ? (
            <tr>
              <td colSpan={5}>
                <EmptyState message="No students have been admitted yet." icon={<FaUserGraduate size={40} />} />
              </td>
            </tr>
          ) : (
            students.map((student) => (
              <tr key={student.id}>
                <td>{student.name}</td>
                <td>{student.student?.rollNumber || 'N/A'}</td>
                <td>{student.email}</td>
                <td>{student.programName}</td> {/* 5. Use the new programName field */}
                <td>{new Date(student.student?.admissionDate).toLocaleDateString()}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default ViewAdmissionsPage;