import React, { useState, useEffect } from 'react';
import { getMyGrades } from '../services/enrollmentService';
import styles from './MyGradesPage.module.scss';

interface Enrollment {
  id: string;
  grade: string | null;
  course: {
    title: string;
    courseCode: string;
    credits: number;
  };
}

const MyGradesPage = () => {
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGrades = async () => {
      try {
        const data = await getMyGrades();
        setEnrollments(data);
      } catch (error) {
        console.error("Failed to fetch grades", error);
      } finally {
        setLoading(false);
      }
    };
    fetchGrades();
  }, []);

  if (loading) return <div>Loading your grades...</div>;

  return (
    <div className={styles.container}>
      <h2>My Grades</h2>
      <table className={styles.gradesTable}>
        <thead>
          <tr>
            <th>Course Code</th>
            <th>Course Title</th>
            <th>Credits</th>
            <th>Grade</th>
          </tr>
        </thead>
        <tbody>
          {enrollments.map((enrollment) => (
            <tr key={enrollment.id}>
              <td>{enrollment.course.courseCode}</td>
              <td>{enrollment.course.title}</td>
              <td>{enrollment.course.credits}</td>
              <td>{enrollment.grade || 'In Progress'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default MyGradesPage;