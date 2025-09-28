import React, { useState, useEffect } from 'react';
import { getExams, registerForExam } from '../services/examService';
import styles from './ExamFormPage.module.scss';

interface Exam {
  id: string;
  title: string;
  date: string;
  course: {
    title: string;
  };
}

const ExamFormPage = () => {
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  const fetchExams = async () => {
    try {
      const data = await getExams();
      setExams(data);
    } catch (error) {
      console.error("Failed to fetch exams", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExams();
  }, []);

  const handleRegister = async (examId: string) => {
    try {
      await registerForExam(examId);
      setMessage('Successfully registered for the exam!');
      // Optionally, you could refetch exams to update the UI (e.g., disable button)
    } catch (error) {
      setMessage('You are already registered for this exam.');
      console.error("Failed to register for exam", error);
    }
  };

  if (loading) return <div>Loading available exams...</div>;

  return (
    <div className={styles.container}>
      <h2>Exam Registration</h2>
      {message && <p className={styles.message}>{message}</p>}
      <table className={styles.examsTable}>
        <thead>
          <tr>
            <th>Exam Title</th>
            <th>Course</th>
            <th>Date</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {exams.map((exam) => (
            <tr key={exam.id}>
              <td>{exam.title}</td>
              <td>{exam.course.title}</td>
              <td>{new Date(exam.date).toLocaleDateString()}</td>
              <td>
                <button onClick={() => handleRegister(exam.id)}>
                  Register
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ExamFormPage;