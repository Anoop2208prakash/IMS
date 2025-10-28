import { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import styles from '../../assets/scss/pages/student/MyResultsPage.module.scss';
import Spinner from '../../components/common/Spinner';
import EmptyState from '../../components/common/EmptyState';
import { BsClipboardCheck } from 'react-icons/bs';

interface Result {
  id: string;
  marksObtained: number;
  subject: { title: string; }; // <-- Changed from 'course'
  exam: { name: string; date: string; totalMarks: number; };
}

const MyResultsPage = () => {
  const [results, setResults] = useState<Result[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get('http://localhost:5000/api/exam-results/my-results')
      .then(res => setResults(res.data))
      .catch((err) => {
        if (axios.isAxiosError(err) && err.response) {
          toast.error(err.response.data.message || 'Failed to fetch results.');
        } else {
          toast.error('An unexpected error occurred.');
        }
      })
      .finally(() => setLoading(false));
  }, []);

  // Group results by exam name for better display
  const groupedResults = useMemo(() => {
    return results.reduce((acc, result) => {
      const examName = result.exam.name;
      if (!acc[examName]) acc[examName] = [];
      acc[examName].push(result);
      return acc;
    }, {} as Record<string, Result[]>);
  }, [results]);

  // Dedicated function to render the main content
  const renderContent = () => {
    if (loading) {
      return <Spinner />;
    }
    if (results.length === 0) {
      return <EmptyState message="No exam results have been published yet." icon={<BsClipboardCheck size={40} />} />;
    }
    return Object.entries(groupedResults).map(([examName, examResults]) => (
      <div key={examName} className={styles.examSection}>
        <h3>{examName}</h3>
        <table className={styles.resultsTable}>
          <thead>
            <tr>
              <th>Subject</th>
              <th>Marks Obtained</th>
              <th>Total Marks</th>
              <th>Percentage</th>
            </tr>
          </thead>
          <tbody>
            {examResults.map(result => (
              <tr key={result.id}>
                <td>{result.subject.title}</td>
                <td>{result.marksObtained}</td>
                <td>{result.exam.totalMarks}</td>
                <td>{((result.marksObtained / result.exam.totalMarks) * 100).toFixed(1)}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    ));
  };

  return (
    <div className={styles.container}>
      <h2>My Exam Results</h2>
      <div className={styles.contentArea}>
        {renderContent()}
      </div>
    </div>
  );
};

export default MyResultsPage;