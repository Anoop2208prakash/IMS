import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import styles from './MyResultsPage.module.scss';

interface Result {
  id: string; marksObtained: number;
  course: { title: string; };
  exam: { name: string; date: string; totalMarks: number; };
}

const MyResultsPage = () => {
  const [results, setResults] = useState<Result[]>([]);
  const [loading, setLoading] = useState(true);
  // ... error state

  useEffect(() => {
    axios.get('http://localhost:5000/api/exam-results/my-results')
      .then(res => setResults(res.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  // Group results by exam name
  const groupedResults = useMemo(() => {
    return results.reduce((acc, result) => {
      const examName = result.exam.name;
      if (!acc[examName]) acc[examName] = [];
      acc[examName].push(result);
      return acc;
    }, {} as Record<string, Result[]>);
  }, [results]);

  if (loading) return <p>Loading your results...</p>;

  return (
    <div className={styles.container}>
      <h2>My Exam Results</h2>
      {Object.entries(groupedResults).map(([examName, examResults]) => (
        <div key={examName} className={styles.examSection}>
          <h3>{examName}</h3>
          <table className={styles.resultsTable}>
            <thead>
              <tr>
                <th>Course</th><th>Marks Obtained</th><th>Total Marks</th><th>Percentage</th>
              </tr>
            </thead>
            <tbody>
              {examResults.map(result => (
                <tr key={result.id}>
                  <td>{result.course.title}</td>
                  <td>{result.marksObtained}</td>
                  <td>{result.exam.totalMarks}</td>
                  <td>{((result.marksObtained / result.exam.totalMarks) * 100).toFixed(1)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}
    </div>
  );
};

export default MyResultsPage;