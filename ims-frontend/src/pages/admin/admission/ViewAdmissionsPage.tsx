import React, { useState, useEffect } from 'react';
import axios from 'axios';
import styles from '../AdminPages.module.scss'; // Reuse shared admin styles

interface StudentData {
  id: string;
  name: string;
  email: string;
  student: {
    rollNumber: string;
    admissionDate: string;
  };
  enrollments: Array<{
    course: {
      title: string;
    };
  }>;
}

const ViewAdmissionsPage = () => {
  const [students, setStudents] = useState<StudentData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchAdmittedStudents = async () => {
      try {
        setLoading(true);
        // This API endpoint is already secured for the correct admin roles
        const response = await axios.get('http://localhost:5000/api/students');
        setStudents(response.data);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to fetch admission data.');
      } finally {
        setLoading(false);
      }
    };
    fetchAdmittedStudents();
  }, []);

  if (loading) return <p>Loading admission records...</p>;
  if (error) return <p className={styles.error}>{error}</p>;

  return (
    <div className={styles.container}>
      <h2>View All Admitted Students</h2>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Name</th>
            <th>Roll Number</th>
            <th>Email</th>
            <th>Admitted Course</th>
            <th>Admission Date</th>
          </tr>
        </thead>
        <tbody>
          {students.map((student) => (
            <tr key={student.id}>
              <td>{student.name}</td>
              <td>{student.student?.rollNumber || 'N/A'}</td>
              <td>{student.email}</td>
              <td>{student.enrollments[0]?.course?.title || 'Not Enrolled'}</td>
              <td>{new Date(student.student?.admissionDate).toLocaleDateString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ViewAdmissionsPage;