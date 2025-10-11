import React, { useState, useEffect } from 'react';
import axios from 'axios';
import styles from './MarkAttendancePage.module.scss';

interface Course { id: string; title: string; }
interface Student { id: string; name: string; student: { rollNumber: string; } }
type AttendanceStatus = 'PRESENT' | 'ABSENT' | 'LATE';

const MarkAttendancePage = () => {
  const [myCourses, setMyCourses] = useState<Course[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [students, setStudents] = useState<Student[]>([]);
  const [attendance, setAttendance] = useState<Record<string, AttendanceStatus>>({});
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [message, setMessage] = useState('');

  // 1. Fetch the teacher's assigned courses on load
  useEffect(() => {
    axios.get('http://localhost:5000/api/teachers/my-courses')
      .then(res => setMyCourses(res.data))
      .catch(err => console.error(err));
  }, []);

  // 2. Fetch students when a course is selected
  useEffect(() => {
    if (selectedCourseId) {
      axios.get(`http://localhost:5000/api/courses/${selectedCourseId}/students`)
        .then(res => {
          setStudents(res.data);
          // Default all students to PRESENT
          const initialAttendance = res.data.reduce((acc: any, student: Student) => {
            acc[student.id] = 'PRESENT';
            return acc;
          }, {});
          setAttendance(initialAttendance);
        })
        .catch(err => console.error(err));
    }
  }, [selectedCourseId]);

  const handleStatusChange = (studentId: string, status: AttendanceStatus) => {
    setAttendance(prev => ({ ...prev, [studentId]: status }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const records = Object.entries(attendance).map(([studentId, status]) => ({ studentId, status }));
    try {
      const response = await axios.post('http://localhost:5000/api/attendance', {
        courseId: selectedCourseId,
        date,
        records,
      });
      setMessage(response.data.message);
    } catch (err: any) {
      setMessage(err.response?.data?.message || 'Failed to submit.');
    }
  };

  return (
    <div className={styles.container}>
      <h2>Mark Attendance</h2>
      <div className={styles.controls}>
        <select onChange={e => setSelectedCourseId(e.target.value)} value={selectedCourseId}>
          <option value="">-- Select a Course --</option>
          {myCourses.map(course => <option key={course.id} value={course.id}>{course.title}</option>)}
        </select>
        <input type="date" value={date} onChange={e => setDate(e.target.value)} />
      </div>

      {students.length > 0 && (
        <form onSubmit={handleSubmit}>
          <div className={styles.studentList}>
            {students.map(student => (
              <div key={student.id} className={styles.studentRow}>
                <span>{student.name} ({student.student.rollNumber})</span>
                <div className={styles.statusButtons}>
                  {['PRESENT', 'ABSENT', 'LATE'].map(status => (
                    <button
                      type="button"
                      key={status}
                      className={attendance[student.id] === status ? styles.active : ''}
                      onClick={() => handleStatusChange(student.id, status as AttendanceStatus)}
                    >
                      {status}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <button type="submit" className={styles.submitButton}>Submit Attendance</button>
          {message && <p>{message}</p>}
        </form>
      )}
    </div>
  );
};

export default MarkAttendancePage;