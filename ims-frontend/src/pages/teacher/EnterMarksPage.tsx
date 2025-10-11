import React, { useState, useEffect } from 'react';
import axios from 'axios';
import styles from './EnterMarksPage.module.scss';

// --- Interfaces for our data structures ---
interface Course { id: string; title: string; }
interface Exam { id: string; name: string; totalMarks: number; }
interface Student { id: string; name: string; student: { rollNumber: string; } }

const EnterMarksPage = () => {
  // --- State Management ---
  const [myCourses, setMyCourses] = useState<Course[]>([]);
  const [exams, setExams] = useState<Exam[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [selectedExamId, setSelectedExamId] = useState('');
  const [marks, setMarks] = useState<Record<string, string>>({}); // Store marks as strings for input flexibility
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  // --- Data Fetching ---

  // 1. Fetch the teacher's courses and all available exams when the page loads
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [coursesRes, examsRes] = await Promise.all([
          axios.get('http://localhost:5000/api/teachers/my-courses'),
          axios.get('http://localhost:5000/api/exams')
        ]);
        setMyCourses(coursesRes.data);
        setExams(examsRes.data);
      } catch (error) {
        setMessage('Failed to load initial data.');
        console.error(error);
      }
    };
    fetchInitialData();
  }, []);

  // 2. Fetch the student roster whenever a course is selected
  useEffect(() => {
    if (selectedCourseId) {
      setLoading(true);
      setStudents([]); // Clear previous student list
      setMarks({});   // Clear previous marks
      axios.get(`http://localhost:5000/api/courses/${selectedCourseId}/students`)
        .then(res => setStudents(res.data))
        .catch(err => {
          setMessage('Failed to load student roster.');
          console.error(err);
        })
        .finally(() => setLoading(false));
    }
  }, [selectedCourseId]);

  // --- Handlers ---

  const handleMarkChange = (studentId: string, value: string) => {
    setMarks(prev => ({ ...prev, [studentId]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCourseId || !selectedExamId || students.length === 0) {
      setMessage('Please select a course and exam.');
      return;
    }

    const results = students.map(student => ({
      studentId: student.id,
      marksObtained: parseFloat(marks[student.id]) || 0, // Default to 0 if empty
    }));

    try {
      const response = await axios.post('http://localhost:5000/api/exam-results', {
        courseId: selectedCourseId,
        examId: selectedExamId,
        results,
      });
      setMessage(response.data.message);
    } catch (err: any) {
      setMessage(err.response?.data?.message || 'Failed to submit marks.');
    }
  };

  return (
    <div className={styles.container}>
      <h2>Enter Marks</h2>
      <div className={styles.controls}>
        <select onChange={e => setSelectedCourseId(e.target.value)} value={selectedCourseId}>
          <option value="" disabled>-- Select a Course --</option>
          {myCourses.map(course => <option key={course.id} value={course.id}>{course.title}</option>)}
        </select>
        <select onChange={e => setSelectedExamId(e.target.value)} value={selectedExamId}>
          <option value="" disabled>-- Select an Exam --</option>
          {exams.map(exam => <option key={exam.id} value={exam.id}>{exam.name}</option>)}
        </select>
      </div>

      {loading && <p>Loading students...</p>}

      {students.length > 0 && selectedExamId && (
        <form onSubmit={handleSubmit}>
          <table className={styles.marksTable}>
            <thead>
              <tr>
                <th>Student Name</th>
                <th>Roll Number</th>
                <th>Marks Obtained (out of {exams.find(e => e.id === selectedExamId)?.totalMarks || 100})</th>
              </tr>
            </thead>
            <tbody>
              {students.map(student => (
                <tr key={student.id}>
                  <td>{student.name}</td>
                  <td>{student.student.rollNumber}</td>
                  <td>
                    <input
                      type="number"
                      className={styles.marksInput}
                      min="0"
                      max={exams.find(e => e.id === selectedExamId)?.totalMarks || 100}
                      value={marks[student.id] || ''}
                      onChange={e => handleMarkChange(student.id, e.target.value)}
                      required
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <button type="submit" className={styles.submitButton}>Submit Marks</button>
        </form>
      )}
      
      {message && <p className={styles.message}>{message}</p>}
    </div>
  );
};

export default EnterMarksPage;