import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import styles from './Sidebar.module.scss';
// The logo is no longer imported here

// Define the links for each role
const navLinks = {
  STUDENT: [
    { path: '/', label: 'Dashboard' },
    { path: '/id-card', label: 'ID Card' },
    { path: '/my-subjects', label: 'My Subjects' },
    { path: '/library', label: 'Library' },
    { path: '/my-loans', label: 'My Loans' },
    { path: '/my-attendance', label: 'My Attendance' },
    { path: '/my-results', label: 'My Results' },
    { path: '/my-invoices', label: 'My Invoices' },
    { path: '/admit-card-generator', label: 'Admit Card' },
    { path: '/stationary-store', label: 'Stationary Store' },
    { path: '/my-orders', label: 'My Orders' }
  ],
  TEACHER: [
    { path: '/', label: 'Dashboard' },
    { path: '/id-card', label: 'ID Card' },
    { path: '/library', label: 'Library' },
    { path: '/my-loans', label: 'My Loans' },
    { path: '/teacher/attendance', label: 'Mark Attendance' },
    { path: '/teacher/marks', label: 'Enter Marks' },
  ],
  ADMIN: [
    { path: '/', label: 'Dashboard' },
    { path: '/id-card', label: 'ID Card' },
    { path: '/admin/admissions', label: 'View Admissions' },
    { path: '/admin/students', label: 'Manage Students' },
    { path: '/admin/teachers', label: 'Manage Teachers' },
    { path: '/admin/programs', label: 'Manage Programs' },
    { path: '/admin/semesters', label: 'Manage Semesters' },
    { path: '/admin/subjects', label: 'Manage Subjects' },
    { path: '/admin/exams', label: 'Manage Exams' },
    { path: '/admin/inventory', label: 'Manage Inventory' },
    { path: '/admin/orders', label: 'View Orders' },
    { path: '/admin/announcements', label: 'Announcements' }
  ],
  ADMIN_ADMISSION: [
    { path: '/', label: 'Dashboard' },
    { path: '/id-card', label: 'ID Card' },
    { path: '/admin/admissions', label: 'View Admissions' },
    { path: '/admin/admission/new', label: 'New Admission' },
  ],
  ADMIN_FINANCE: [
    { path: '/', label: 'Dashboard' },
    { path: '/id-card', label: 'ID Card' },
    { path: '/admin/finance/structures', label: 'Fee Structures' },
    { path: '/admin/finance/invoices/generate', label: 'Generate Invoices' },
    { path: '/admin/orders', label: 'View Orders' },
  ],
  ADMIN_LIBRARY: [
    { path: '/', label: 'Dashboard' },
    { path: '/id-card', label: 'ID Card' },
    { path: '/admin/library/books', label: 'Manage Books' },
    { path: '/admin/library/loans', label: 'Manage Loans' },
  ],
  SUPER_ADMIN: [], // Can be defined later
};

const Sidebar = () => {
  const { user } = useAuth();

  // Determine which links to show.
  const linksToShow = user ? navLinks[user.role as keyof typeof navLinks] || [] : [];

  return (
    <aside className={styles.sidebar}>
      {/* The logo div has been removed from here */}
      <nav className={styles.nav}>
        {linksToShow.map((link) => (
          <NavLink
            key={link.path}
            to={link.path}
            className={({ isActive }) => (isActive ? `${styles.navLink} ${styles.active}` : styles.navLink)}
            end={link.path === '/'} // Ensures only the Dashboard link is active on the root path
          >
            {link.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;