import { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import styles from '../../assets/scss/pages/student/MyAttendancePage.module.scss';
import Spinner from '../../components/common/Spinner';
import DataTable, { Column } from '../../components/common/DataTable';
import { BsCalendarCheck } from 'react-icons/bs';

interface AttendanceRecord {
  id: string;
  date: string;
  status: string;
  subject: { title: string; }; // <-- Changed from 'course'
}

const MyAttendancePage = () => {
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get('http://localhost:5000/api/attendance/my-attendance')
      .then(res => setRecords(res.data))
      .catch((err) => {
        if (axios.isAxiosError(err) && err.response) {
          toast.error(err.response.data.message || 'Failed to fetch attendance.');
        } else {
          toast.error('An unexpected error occurred.');
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const summary = useMemo(() => {
    const total = records.length;
    const present = records.filter(r => r.status === 'PRESENT' || r.status === 'LATE').length;
    const absent = records.filter(r => r.status === 'ABSENT').length;
    const percentage = total > 0 ? ((present / total) * 100).toFixed(1) : '100';
    return { total, present, absent, percentage };
  }, [records]);

  const columns: Column<AttendanceRecord>[] = [
    {
      header: 'Subject', // <-- Changed from 'Course'
      accessor: (row) => row.subject.title // <-- Changed from 'course'
    },
    {
      header: 'Date',
      accessor: (row) => new Date(row.date).toLocaleDateString()
    },
    {
      header: 'Status',
      accessor: (row) => (
        <span className={`${styles.status} ${styles[row.status.toLowerCase()]}`}>
          {row.status}
        </span>
      )
    }
  ];

  if (loading) return <Spinner />;

  return (
    <div className={styles.container}>
      <h2>My Attendance</h2>
      <div className={styles.summaryGrid}>
        <div className={styles.summaryCard}><span>{summary.present}</span> Days Present</div>
        <div className={styles.summaryCard}><span>{summary.absent}</span> Days Absent</div>
        <div className={styles.summaryCard}><span>{summary.percentage}%</span> Overall</div>
      </div>
      
      {/* This DataTable component will now correctly display the data */}
      <DataTable columns={columns} data={records} />
    </div>
  );
};

export default MyAttendancePage;