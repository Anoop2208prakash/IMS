// src/pages/MyCoursesPage.tsx
import { useState, useEffect } from 'react';
import axios from 'axios';
import styles from '../assets/scss/pages/MyCoursesPage.module.scss';

interface Course {
  id: string;
  title: string;
  courseCode: string;
  description: string;
  credits: number;
}

const MyCoursesPage = () => {
 const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchMyCourses = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/enrollments/my-courses');
        setCourses(response.data);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to fetch courses.');
      } finally {
        setLoading(false);
      }
    };
    fetchMyCourses();
  }, []);

  if (loading) return <p>Loading your courses...</p>;
  if (error) return <p style={{ color: 'red' }}>{error}</p>;

  return (
    <div className={styles.coursesContainer}>
      <h2>My Courses</h2>
      {courses.length === 0 ? (
        <p>You are not currently enrolled in any courses.</p>
      ) : (
        <div className={styles.coursesGrid}>
          {courses.map(course => (
            <div key={course.id} className={styles.courseCard}>
              <h3>{course.title}</h3>
              <p className={styles.courseCode}>{course.courseCode}</p>
              <p className={styles.description}>{course.description}</p>
              <p className={styles.credits}><strong>Credits:</strong> {course.credits}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyCoursesPage;