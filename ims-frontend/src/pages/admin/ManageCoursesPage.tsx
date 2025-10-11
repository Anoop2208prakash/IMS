import { useState, useEffect } from 'react';
import axios from 'axios';
import styles from './AdminPages.module.scss';
import AddCourseForm from './AddCourseForm';
import EditCourseModal from './EditCourseModal';
import AssignTeacherModal from './AssignTeacherModal';

interface CourseData {
  id: string;
  title: string;
  courseCode: string;
  credits: number;
}

const ManageCoursesPage = () => {
  const [courses, setCourses] = useState<CourseData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingCourse, setEditingCourse] = useState<CourseData | null>(null);
  const [assigningCourse, setAssigningCourse] = useState<CourseData | null>(null);

  const fetchCourses = async () => {
    if (courses.length === 0) setLoading(true);
    try {
      const response = await axios.get('http://localhost:5000/api/courses');
      setCourses(response.data); // <-- Using setCourses here
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch courses.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const handleCourseAdded = () => {
    setShowAddForm(false);
    fetchCourses();
  };

  const handleCourseUpdated = () => {
    setEditingCourse(null);
    fetchCourses();
  };

  const handleDelete = async (courseId: string) => {
    if (!window.confirm('Are you sure you want to delete this course?')) return;
    try {
      await axios.delete(`http://localhost:5000/api/courses/${courseId}`);
      setCourses(current => current.filter(c => c.id !== courseId)); // <-- Using setCourses here
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete course.');
    }
  };

  if (loading) return <p>Loading courses...</p>;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2>Manage Courses</h2>
        <button onClick={() => setShowAddForm(!showAddForm)}>
          {showAddForm ? 'Cancel' : 'Add New Course'}
        </button>
      </div>

      {showAddForm && (
        <AddCourseForm
          onCourseAdded={handleCourseAdded}
          onCancel={() => setShowAddForm(false)}
        />
      )}

      {error && <p className={styles.error}>{error}</p>}

      <table className={styles.table}>
        <thead>
          <tr>
            <th>Title</th>
            <th>Course Code</th>
            <th>Credits</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {courses.map((course) => (
            <tr key={course.id}>
              <td>{course.title}</td>
              <td>{course.courseCode}</td>
              <td>{course.credits}</td>
              <td>
                <button
                  onClick={() => setAssigningCourse(course)}
                  className={`${styles.button} ${styles.assignButton}`}
                >
                  Assign
                </button>
                <button
                  onClick={() => setEditingCourse(course)}
                  className={`${styles.button} ${styles.editButton}`}
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(course.id)}
                  className={`${styles.button} ${styles.deleteButton}`}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {editingCourse && (
        <EditCourseModal
          course={editingCourse}
          onClose={() => setEditingCourse(null)}
          onCourseUpdated={handleCourseUpdated}
        />
      )}

      {assigningCourse && (
        <AssignTeacherModal
          course={assigningCourse}
          onClose={() => setAssigningCourse(null)}
          onTeacherAssigned={() => setAssigningCourse(null)}
        />
      )}
    </div>
  );
};

export default ManageCoursesPage;