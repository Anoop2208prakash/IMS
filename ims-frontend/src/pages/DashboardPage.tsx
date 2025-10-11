import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import StatCard from '../components/dashboard/StatCard';
import styles from './DashboardPage.module.scss';

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

  const renderDashboard = () => {
    switch (user?.role) {
      case 'ADMIN':
      case 'SUPER_ADMIN':
      case 'ADMIN_ADMISSION':
      case 'ADMIN_FINANCE':
      case 'ADMIN_LIBRARY':
      case 'TEACHER': // Teacher will see admin dashboard for now
        return (
          <>
            <StatCard title="Total Students" value={data.studentCount} icon="🎓" />
            <StatCard title="Total Teachers" value={data.teacherCount} icon="👨‍🏫" />
            <StatCard title="Total Courses" value={data.courseCount} icon="📚" />
            <StatCard title="Books on Loan" value={data.booksOnLoan} icon="📖" />
          </>
        );
      case 'STUDENT':
        return (
          <>
            <StatCard title="Enrolled Courses" value={data.enrolledCourses} icon="📚" />
            <StatCard title="Books on Loan" value={data.booksOnLoan} icon="📖" />
            <StatCard title="Attendance" value={`${data.attendancePercentage}%`} icon="✅" />
          </>
        );
      default:
        return <p>Welcome to your dashboard!</p>;
    }
  };

  return (
    <div>
      <h2>Dashboard</h2>
      <div className={styles.dashboardGrid}>
        {renderDashboard()}
      </div>
    </div>
  );
};

export default DashboardPage;