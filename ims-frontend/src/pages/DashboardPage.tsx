import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom'; // Keep this, it's used in StudentDashboard
import StatCard from '../components/dashboard/StatCard';
import styles from '../assets/scss/pages/DashboardPage.module.scss';
import { FaUserGraduate, FaChalkboardTeacher } from 'react-icons/fa';
import { BsBookHalf, BsJournalBookmarkFill, BsPersonCheckFill, BsPersonXFill, BsGraphUp } from 'react-icons/bs';
import SkeletonLoader from '../components/common/SkeletonLoader';

// --- Interfaces for Type Safety ---
interface Announcement {
  id: string; title: string; content: string; createdAt: string;
  author: { name: string; };
}
interface Order { id: string; orderId: string; totalAmount: number; }
interface Loan { id: string; dueDate: string; book: { title: string; }; }

interface AdminData {
  studentCount: number; teacherCount: number; programCount: number; booksOnLoan: number;
  announcements: Announcement[];
}
interface StudentData {
  enrolledSubjects: number; // <-- FIX: Renamed from enrolledCourses
  booksOnLoan: number; 
  attendancePercentage: string;
  presentDays: number; 
  absentDays: number; 
  lateDays: number;
  recentOrders: Order[];
  upcomingDueDates: Loan[];
  announcements: Announcement[];
}

// --- Sub-Components ---
const AdminDashboard = ({ data }: { data: AdminData }) => (
  <div className={styles.dashboardGrid}>
    <StatCard title="Total Students" value={data.studentCount} icon={<FaUserGraduate />} />
    <StatCard title="Total Teachers" value={data.teacherCount} icon={<FaChalkboardTeacher />} />
    <StatCard title="Total Programs" value={data.programCount} icon={<BsJournalBookmarkFill />} />
    <StatCard title="Books on Loan" value={data.booksOnLoan} icon={<BsBookHalf />} />
  </div>
);

const StudentDashboard = ({ data }: { data: StudentData }) => (
  <>
    <div className={styles.dashboardGrid}>
      <StatCard title="Enrolled Subjects" value={data.enrolledSubjects} icon={<BsJournalBookmarkFill />} />
      <StatCard title="Days Present" value={data.presentDays} icon={<BsPersonCheckFill />} />
      <StatCard title="Days Absent" value={data.absentDays} icon={<BsPersonXFill />} />
      <StatCard title="Overall Attendance" value={`${data.attendancePercentage}%`} icon={<BsGraphUp />} />
    </div>
    <div className={styles.widgetsGrid}>
      <div className={styles.widget}>
        <h3>Recent Orders</h3>
        {data.recentOrders?.length > 0 ? (
          <ul className={styles.widgetList}>
            {data.recentOrders.map((order) => (
              <li key={order.id}>
                <span>{order.orderId}</span>
                <span>₹{order.totalAmount.toFixed(2)}</span>
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
            {data.upcomingDueDates.map((loan) => (
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

// --- NEW Skeleton Components ---
const AdminDashboardSkeleton = () => (
  <div className={styles.dashboardGrid}>
    <div className={styles.skeletonStatCard}><SkeletonLoader height="60px" /></div>
    <div className={styles.skeletonStatCard}><SkeletonLoader height="60px" /></div>
    <div className={styles.skeletonStatCard}><SkeletonLoader height="60px" /></div>
    <div className={styles.skeletonStatCard}><SkeletonLoader height="60px" /></div>
  </div>
);

const AnnouncementsSkeleton = () => (
  <>
    <div className={styles.skeletonAnnouncement}>
      <h4><SkeletonLoader width="30%" height="20px" /></h4>
      <SkeletonLoader width="100%" />
      <SkeletonLoader width="90%" />
    </div>
    <div className={styles.skeletonAnnouncement}>
      <h4><SkeletonLoader width="40%" height="20px" /></h4>
      <SkeletonLoader width="90%" />
    </div>
  </>
);

// --- Main Page Component ---
const DashboardPage = () => {
  const { user } = useAuth();
  const [data, setData] = useState<AdminData | StudentData | null>(null);
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

  if (!data && !loading) return <p>Could not load dashboard data.</p>;

  const renderDashboard = () => {
    if (loading) {
      const isAdminOrTeacher = ['ADMIN', 'SUPER_ADMIN', 'ADMIN_ADMISSION', 'ADMIN_FINANCE', 'ADMIN_LIBRARY', 'TEACHER'].includes(user!.role);
      if (isAdminOrTeacher) return <AdminDashboardSkeleton />;
      if (user?.role === 'STUDENT') return <AdminDashboardSkeleton />; // Can create a specific student skeleton later
      return <AdminDashboardSkeleton />;
    }
    
    // FIX: Corrected 'TEACHR' typo
    const isAdminOrTeacher = ['ADMIN', 'SUPER_ADMIN', 'ADMIN_ADMISSION', 'ADMIN_FINANCE', 'ADMIN_LIBRARY', 'TEACHER'].includes(user!.role);
    if (isAdminOrTeacher && data) {
      return <AdminDashboard data={data as AdminData} />;
    }
    if (user?.role === 'STUDENT' && data) {
      return <StudentDashboard data={data as StudentData} />;
    }
    return <p>Welcome to your dashboard!</p>;
  };

  const renderAnnouncements = () => {
    if (loading) {
      return <AnnouncementsSkeleton />;
    }
    // FIX: Check for data AND data.announcements
    if (data && data.announcements?.length > 0) {
      return data.announcements.map((ann) => (
        <div key={ann.id} className={styles.announcementCard}>
          <h4>{ann.title}</h4>
          <p>{ann.content}</p>
          <div className={styles.meta}>
            Posted by {ann.author.name} on {new Date(ann.createdAt).toLocaleDateString()}
          </div>
        </div>
      ));
    }
    return <p>No recent announcements.</p>;
  };

  return (
    <div className={styles.pageContainer}>
      <h2>Dashboard</h2>
      {renderDashboard()}
      <div className={styles.announcementsSection}>
        <h3>Institute Announcements</h3>
        {renderAnnouncements()}
      </div>
    </div>
  );
};

export default DashboardPage;