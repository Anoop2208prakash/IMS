import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import StatCard from '../components/dashboard/StatCard';
import styles from './DashboardPage.module.scss';

// 1. Import icons from react-icons
import { FaUserGraduate, FaChalkboardTeacher } from 'react-icons/fa';
import { 
  BsBookHalf, 
  BsJournalBookmarkFill, 
  BsPersonCheckFill, 
  BsPersonXFill, 
  BsGraphUp 
} from 'react-icons/bs';

const DashboardPage = () => {
  const { user } = useAuth();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/dashboard');
        setData(response.data);
      } catch (error) {
        console.error("Failed to fetch dashboard data", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <p>Loading dashboard...</p>;
  if (!data) return <p>Could not load dashboard data.</p>;

  // --- Reusable Dashboard Components for Readability ---

  const AdminDashboard = () => (
    <div className={styles.dashboardGrid}>
      {/* 2. Replace emoji strings with icon components */}
      <StatCard title="Total Students" value={data.studentCount} icon={<FaUserGraduate />} />
      <StatCard title="Total Teachers" value={data.teacherCount} icon={<FaChalkboardTeacher />} />
      <StatCard title="Total Courses" value={data.courseCount} icon={<BsJournalBookmarkFill />} />
      <StatCard title="Books on Loan" value={data.booksOnLoan} icon={<BsBookHalf />} />
    </div>
  );

  const StudentDashboard = () => (
    <>
      <div className={styles.dashboardGrid}>
        <StatCard title="Enrolled Courses" value={data.enrolledCourses} icon={<BsJournalBookmarkFill />} />
        <StatCard title="Days Present" value={data.presentDays} icon={<BsPersonCheckFill />} />
        <StatCard title="Days Absent" value={data.absentDays} icon={<BsPersonXFill />} />
        <StatCard title="Overall Attendance" value={`${data.attendancePercentage}%`} icon={<BsGraphUp />} />
      </div>

      <div className={styles.widgetsGrid}>
        <div className={styles.widget}>
          <h3>Recent Orders</h3>
          {data.recentOrders?.length > 0 ? (
            <ul className={styles.widgetList}>
              {data.recentOrders.map((order: any) => (
                <li key={order.id}>
                  <span>{order.orderId}</span>
                  <span>${order.totalAmount.toFixed(2)}</span>
                  <Link to={`/order/${order.orderId}`} className={styles.viewLink}>View</Link>
                </li>
              ))}
            </ul>
          ) : <p>No recent orders found.</p>}
        </div>

        <div className={styles.widget}>
          <h3>Upcoming Due Dates</h3>
          {data.upcomingDueDates?.length > 0 ? (
            <ul className={styles.widgetList}>
              {data.upcomingDueDates.map((loan: any) => (
                <li key={loan.id}>
                  <span>{loan.book.title}</span>
                  <strong>Due: {new Date(loan.dueDate).toLocaleDateString()}</strong>
                </li>
              ))}
            </ul>
          ) : <p>No library books are due soon.</p>}
        </div>
      </div>
    </>
  );

  const renderDashboard = () => {
    const isAdminOrTeacher = ['ADMIN', 'SUPER_ADMIN', 'ADMIN_ADMISSION', 'ADMIN_FINANCE', 'ADMIN_LIBRARY', 'TEACHER'].includes(user!.role);
    
    if (isAdminOrTeacher) {
      return <AdminDashboard />;
    }
    if (user?.role === 'STUDENT') {
      return <StudentDashboard />;
    }
    return <p>Welcome to your dashboard!</p>;
  };

  return (
    <div>
      <h2>Dashboard</h2>
      {renderDashboard()}

      <div className={styles.announcementsSection}>
        <h3>Institute Announcements</h3>
        {data.announcements?.length > 0 ? (
          data.announcements.map((ann: any) => (
            <div key={ann.id} className={styles.announcementCard}>
              <h4>{ann.title}</h4>
              <p>{ann.content}</p>
              <div className={styles.meta}>
                Posted by {ann.author.name} on {new Date(ann.createdAt).toLocaleDateString()}
              </div>
            </div>
          ))
        ) : (
          <p>No recent announcements.</p>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;