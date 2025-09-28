import React, { useState, useEffect } from 'react';
import { getDashboardStats, getAdminDashboardStats } from '../services/dashboardService';
import { useAuth } from '../context/AuthContext';
import styles from './DashboardPage.module.scss';

interface Stats {
  totalBooks: number;
  activeLoans: number;
  overdueLoans: number;
}

interface AdminStats {
  totalUsers: number;
  totalCourses: number;
  pendingFees: number;
}

const DashboardPage = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<Stats | null>(null);
  const [adminStats, setAdminStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAllStats = async () => {
      try {
        const generalStatsPromise = getDashboardStats();

        if (user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN') {
          const adminStatsPromise = getAdminDashboardStats();
          const [generalData, adminData] = await Promise.all([
            generalStatsPromise,
            adminStatsPromise,
          ]);
          setStats(generalData);
          setAdminStats(adminData);
        } else {
          const generalData = await generalStatsPromise;
          setStats(generalData);
        }
      } catch (error) {
        console.error("Failed to fetch dashboard stats", error);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchAllStats();
    }
  }, [user]);

  if (loading) return <div>Loading dashboard...</div>;

  return (
    <div className={styles.dashboard}>
      {(user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN') && adminStats && (
        <>
          <h2>Admin Overview</h2>
          <div className={styles.statsGrid}>
            <div className={styles.statCard}>
              <h3>Total Users</h3>
              <p>{adminStats.totalUsers}</p>
            </div>
            <div className={styles.statCard}>
              <h3>Total Courses</h3>
              <p>{adminStats.totalCourses}</p>
            </div>
            <div className={styles.statCard}>
              <h3>Pending Fees</h3>
              <p>${adminStats.pendingFees.toFixed(2)}</p>
            </div>
          </div>
          <hr className={styles.divider} />
        </>
      )}

      <h2>Library Overview</h2>
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <h3>Total Books</h3>
          <p>{stats?.totalBooks}</p>
        </div>
        <div className={styles.statCard}>
          <h3>Active Loans</h3>
          <p>{stats?.activeLoans}</p>
        </div>
        <div className={`${styles.statCard} ${styles.overdue}`}>
          <h3>Overdue Loans</h3>
          <p>{stats?.overdueLoans}</p>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;