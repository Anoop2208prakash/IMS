import { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import styles from '../assets/scss/pages/MySubjectsPage.module.scss'; // Use its own stylesheet
import Spinner from '../components/common/Spinner';
import EmptyState from '../components/common/EmptyState';
import { BsJournalBookmarkFill } from 'react-icons/bs';

interface Subject {
  id: string;
  title: string;
  subjectCode: string;
  credits: number;
  semester: {
    name: string;
    program: {
      title: string;
    };
  };
}

const MySubjectsPage = () => {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSubjects = async () => {
      setLoading(true);
      try {
        // This is the API endpoint we just created
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
    
    fetchSubjects();
  }, []);

  return (
    <div className={styles.container}>
      <h2>My Subjects</h2>
      
      {loading ? (
        <Spinner />
      ) : (
        <div className={styles.subjectsGrid}>
          {subjects.length === 0 ? (
            <div className={styles.emptyContainer}>
              <EmptyState 
                message="You are not enrolled in any subjects." 
                icon={<BsJournalBookmarkFill size={40} />} 
              />
            </div>
          ) : (
            subjects.map((subject) => (
              <div key={subject.id} className={styles.subjectCard}>
                <h3>{subject.title}</h3>
                <p className={styles.code}>{subject.subjectCode}</p>
                <p>{subject.semester.program.title}</p>
                <p>{subject.semester.name}</p>
                <p className={styles.credits}>
                  <strong>Credits:</strong> {subject.credits}
                </p>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default MySubjectsPage;