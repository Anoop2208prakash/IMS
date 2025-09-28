import React, { useState, useEffect, useCallback } from 'react';
import { getCourses, createCourse } from '../services/courseService';
import Modal from '../components/common/Modal';
import styles from './CourseManagementPage.module.scss';

interface Course {
  id: string;
  title: string;
  courseCode: string;
  credits: number;
}

const CourseManagementPage = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newCourse, setNewCourse] = useState({
    title: '',
    description: '',
    courseCode: '',
    credits: 0,
  });

  const fetchCourses = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getCourses();
      setCourses(data);
    } catch (error) {
      console.error("Failed to fetch courses", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewCourse(prev => ({ ...prev, [name]: value }));
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createCourse({
        ...newCourse,
        credits: Number(newCourse.credits)
      });
      setIsModalOpen(false);
      setNewCourse({ title: '', description: '', courseCode: '', credits: 0 }); // Reset form
      fetchCourses();
    } catch (error) {
      alert('Failed to create course.');
    }
  };

  if (loading) return <div>Loading courses...</div>;

  return (
    <div className={styles.container}>
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add New Course">
        <form onSubmit={handleFormSubmit} className={styles.courseForm}>
          <input name="title" onChange={handleInputChange} value={newCourse.title} placeholder="Course Title" required />
          <input name="courseCode" onChange={handleInputChange} value={newCourse.courseCode} placeholder="Course Code (e.g., CS101)" required />
          <input name="credits" onChange={handleInputChange} value={newCourse.credits || ''} type="number" placeholder="Credits" required />
          <textarea name="description" onChange={handleInputChange} value={newCourse.description} placeholder="Description"></textarea>
          <button type="submit">Create Course</button>
        </form>
      </Modal>

      <div className={styles.header}>
        <h2>Course Management</h2>
        <button onClick={() => setIsModalOpen(true)}>Add New Course</button>
      </div>

      <table className={styles.coursesTable}>
        <thead>
          <tr>
            <th>Course Title</th>
            <th>Course Code</th>
            <th>Credits</th>
          </tr>
        </thead>
        <tbody>
          {courses.map(course => (
            <tr key={course.id}>
              <td>{course.title}</td>
              <td>{course.courseCode}</td>
              <td>{course.credits}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default CourseManagementPage;