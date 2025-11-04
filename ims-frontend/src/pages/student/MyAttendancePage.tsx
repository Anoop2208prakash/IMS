import { useState, useEffect, useMemo, ChangeEvent } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import styles from '../../assets/scss/pages/student/MyAttendancePage.module.scss';
import Spinner from '../../components/common/Spinner';
import EmptyState from '../../components/common/EmptyState';
import Pagination from '../../components/common/Pagination';
import { BsCalendarCheck } from 'react-icons/bs';

interface AttendanceRecord {
  id: string;
  date: string;
  status: string;
  subject: { title: string; };
}

const MyAttendancePage = () => {
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);

  // Pagination state
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  useEffect(() => {
    setLoading(true);
    // This is the correct API endpoint for a student
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

  // Pagination logic
  const handleRowsPerPageChange = (event: ChangeEvent<HTMLSelectElement>) => {
    setRowsPerPage(Number.parseInt(event.target.value, 10));
    setPage(0);
  };

  const currentItems = records.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  const renderTableBody = () => {
    if (loading) {
      return (
        <tr>
          <td colSpan={3} className={styles.spinnerCell}>
            <Spinner />
          </td>
        </tr>
      );
    }
    if (records.length === 0) {
      return (
        <tr>
          <td colSpan={3}>
            <EmptyState 
              message="No attendance records found." 
              icon={<BsCalendarCheck size={40} />} 
            />
          </td>
        </tr>
      );
    }
    return currentItems.map((row) => (
      <tr key={row.id}>
        <td>{row.subject.title}</td>
        <td>{new Date(row.date).toLocaleDateString()}</td>
        <td>
          <span className={`${styles.status} ${styles[row.status.toLowerCase()]}`}>
            {row.status}
          </span>
        </td>
      </tr>
    ));
  };

  return (
    <div className={styles.container}>
      <h2>My Attendance</h2>
      <div className={styles.summaryGrid}>
        <div className={styles.summaryCard}><span>{summary.present}</span> Days Present</div>
        <div className={styles.summaryCard}><span>{summary.absent}</span> Days Absent</div>
        <div className={styles.summaryCard}><span>{summary.percentage}%</span> Overall</div>
      </div>
      
      {/* This is the manual table structure you wanted */}
      <table className={styles.attendanceTable}>
        <thead>
          <tr>
            <th>Subject</th>
            <th>Date</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {renderTableBody()}
        </tbody>
      </table>
      
      <Pagination
        count={records.length}
        page={page}
        rowsPerPage={rowsPerPage}
        onPageChange={setPage}
        onRowsPerPageChange={handleRowsPerPageChange}
      />
    </div>
  );
};

export default MyAttendancePage;