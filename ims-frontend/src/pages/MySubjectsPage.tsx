import { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import styles from '../assets/scss/pages/MySubjectsPage.module.scss';
import Spinner from '../components/common/Spinner';
import EmptyState from '../components/common/EmptyState';
import { BsCardChecklist } from 'react-icons/bs';

interface Subject {
  id: string;
  title: string;
  subjectCode: string;
  credits: number;
  programTitle: string;
  semesterName: string;
}

const MySubjectsPage = () => {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMySubjects = async () => {
      try {
        setLoading(true);
        const response = await axios.get('http://localhost:5000/api/enrollments/my-subjects');
        setSubjects(response.data);
      } catch (err) {
        if (axios.isAxiosError(err) && err.response) {
          toast.error(err.response.data.message || 'Failed to fetch subjects.');
        } else {
          toast.error('An unexpected error occurred.');
        }
      } finally {
        setLoading(false);
      }
    };
    fetchMySubjects();
  }, []);

  if (loading) return <Spinner />;

  return (
    <div className={styles.container}>
      <h2>My Subjects</h2>
      {subjects.length === 0 ? (
        <EmptyState message="You are not enrolled in any subjects." icon={<BsCardChecklist size={40} />} />
      ) : (
        <div className={styles.subjectsGrid}>
          {subjects.map(subject => (
            <div key={subject.id} className={styles.subjectCard}>
              <h3>{subject.title}</h3>
              <p className={styles.code}>{subject.subjectCode}</p>
              <p>{subject.programTitle}</p>
              <p>{subject.semesterName}</p>
              <p className={styles.credits}><strong>Credits:</strong> {subject.credits}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MySubjectsPage;