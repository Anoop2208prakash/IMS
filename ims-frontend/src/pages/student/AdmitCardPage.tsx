import React, { useState, useEffect } from 'react';
import axios from 'axios';
import styles from './AdmitCardPage.module.scss';

// --- Interfaces for our data structures ---
interface Exam {
  id: string;
  name: string;
}

interface AdmitCardData {
  exam: { name: string; date: string; };
  student: {
    name: string;
    student: { rollNumber: string; };
    enrollments: Array<{ course: { title: string; courseCode: string; } }>;
  };
}

const AdmitCardPage = () => {
  const [exams, setExams] = useState<Exam[]>([]);
  const [selectedExamId, setSelectedExamId] = useState('');
  const [admitCardData, setAdmitCardData] = useState<AdmitCardData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Fetch all available exams for the dropdown on initial load
  useEffect(() => {
    axios.get('http://localhost:5000/api/exams')
      .then(res => setExams(res.data))
      .catch(() => setError('Could not load exams.'));
  }, []);

  const handleGenerate = async () => {
    if (!selectedExamId) return;
    setLoading(true);
    setError('');
    setAdmitCardData(null);
    try {
      const res = await axios.get(`http://localhost:5000/api/exams/${selectedExamId}/admit-card`);
      setAdmitCardData(res.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to generate admit card.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.pageContainer}>
      {!admitCardData ? (
        <div className={styles.selectorContainer}>
          <h2>Generate Admit Card</h2>
          <p>Select an exam from the list below to generate your admit card.</p>
          <div className={styles.controls}>
            <select onChange={e => setSelectedExamId(e.target.value)} value={selectedExamId}>
              <option value="" disabled>-- Select an Exam --</option>
              {exams.map(exam => <option key={exam.id} value={exam.id}>{exam.name}</option>)}
            </select>
            <button onClick={handleGenerate} disabled={!selectedExamId || loading}>
              {loading ? 'Generating...' : 'Generate'}
            </button>
          </div>
          {error && <p className={styles.error}>{error}</p>}
        </div>
      ) : (
        <>
          <div className={styles.admitCard}>
            <div className={styles.header}>
              <h2>Institute Management System</h2>
              <h1>Admit Card</h1>
            </div>
            <div className={styles.cardBody}>
              <div className={styles.photo}><span>PHOTO</span></div>
              <div className={styles.details}>
                <p><strong>Name:</strong> {admitCardData.student.name}</p>
                <p><strong>Roll No:</strong> {admitCardData.student.student.rollNumber}</p>
                <p><strong>Exam:</strong> {admitCardData.exam.name}</p>
                <p><strong>Date:</strong> {new Date(admitCardData.exam.date).toLocaleDateString()}</p>
              </div>
            </div>
            <div className={styles.subjectsTable}>
              <table>
                <thead><tr><th>Course Code</th><th>Course Title</th></tr></thead>
                <tbody>
                  {admitCardData.student.enrollments.map(e => (
                    <tr key={e.course.courseCode}>
                      <td>{e.course.courseCode}</td>
                      <td>{e.course.title}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <div className={styles.buttonRow}>
            <button className={styles.backButton} onClick={() => setAdmitCardData(null)}>Go Back</button>
            <button className={styles.printButton} onClick={() => window.print()}>Print Admit Card</button>
          </div>
        </>
      )}
    </div>
  );
};

export default AdmitCardPage;