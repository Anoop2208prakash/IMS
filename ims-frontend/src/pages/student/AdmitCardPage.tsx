import { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import styles from '../../assets/scss/pages/student/AdmitCardPage.module.scss';
import Spinner from '../../components/common/Spinner'; // 1. Import Spinner

// --- Interfaces for Type Safety ---
interface Exam {
  id: string;
  name: string;
}

interface CourseEnrollment {
  course: {
    title: string;
    courseCode: string;
  };
}

interface AdmitCardData {
  exam: { name: string; date: string; };
  student: {
    name: string;
    student: { 
      rollNumber: string;
      photoUrl?: string; // Add photoUrl here
    };
    enrollments: CourseEnrollment[];
  };
}

const AdmitCardPage = () => {
  const [exams, setExams] = useState<Exam[]>([]);
  const [selectedExamId, setSelectedExamId] = useState('');
  const [admitCardData, setAdmitCardData] = useState<AdmitCardData | null>(null);
  const [loading, setLoading] = useState(false); // For "Generate" button
  const [initialLoading, setInitialLoading] = useState(true); // For initial page load

  // Fetch all available exams for the dropdown on initial load
  useEffect(() => {
    setInitialLoading(true);
    axios.get('http://localhost:5000/api/exams')
      .then(res => setExams(res.data))
      .catch((err) => { // 2. Fix 'any' type error
        if (axios.isAxiosError(err) && err.response) {
          toast.error(err.response.data.message || 'Could not load exams.');
        } else {
          toast.error('An unexpected error occurred.');
        }
      })
      .finally(() => setInitialLoading(false));
  }, []);

  const handleGenerate = async () => {
    if (!selectedExamId) return;
    setLoading(true);
    setAdmitCardData(null);
    try {
      const res = await axios.get(`http://localhost:5000/api/exams/${selectedExamId}/admit-card`);
      setAdmitCardData(res.data);
    } catch (err) { // 2. Fix 'any' type error
      if (axios.isAxiosError(err) && err.response) {
        toast.error(err.response.data.message || 'Failed to generate admit card.');
      } else {
        toast.error('An unexpected error occurred.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return <Spinner />;
  }

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
        </div>
      ) : (
        <>
          <div className={styles.admitCard}>
            <div className={styles.header}>
              <h2>Institute Management System</h2>
              <h1>Admit Card</h1>
            </div>
            <div className={styles.cardBody}>
              <div className={styles.photo}>
                {admitCardData.student.student.photoUrl ? (
                  <img src={`http://localhost:5000${admitCardData.student.student.photoUrl}`} alt="Student" />
                ) : (
                  <span>PHOTO</span>
                )}
              </div>
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