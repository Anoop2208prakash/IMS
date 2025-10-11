import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import styles from './MyAttendancePage.module.scss';

interface AttendanceRecord {
  id: string; date: string; status: string;
  course: { title: string; };
}

const MyAttendancePage = () => {
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    axios.get('http://localhost:5000/api/attendance/my-attendance')
      .then(res => setRecords(res.data))
      .catch(err => setError(err.response?.data?.message || 'Failed to fetch data.'))
      .finally(() => setLoading(false));
  }, []);

  // Calculate summary statistics
  const summary = useMemo(() => {
    const total = records.length;
    const present = records.filter(r => r.status === 'PRESENT').length;
    const absent = records.filter(r => r.status === 'ABSENT').length;
    const percentage = total > 0 ? ((present / total) * 100).toFixed(1) : 'N/A';
    return { total, present, absent, percentage };
  }, [records]);

  if (loading) return <p>Loading attendance history...</p>;
  if (error) return <p style={{ color: 'red' }}>{error}</p>;

  return (
    <div className={styles.container}>
      <h2>My Attendance</h2>
      <div className={styles.summaryGrid}>
        <div className={styles.summaryCard}><span>{summary.present}</span> Days Present</div>
        <div className={styles.summaryCard}><span>{summary.absent}</span> Days Absent</div>
        <div className={styles.summaryCard}><span>{summary.percentage}%</span> Overall</div>
      </div>
      <table className={styles.attendanceTable}>
        <thead>
          <tr><th>Course</th><th>Date</th><th>Status</th></tr>
        </thead>
        <tbody>
          {records.map(record => (
            <tr key={record.id}>
              <td>{record.course.title}</td>
              <td>{new Date(record.date).toLocaleDateString()}</td>
              <td><span className={`${styles.status} ${styles[record.status.toLowerCase()]}`}>{record.status}</span></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default MyAttendancePage;