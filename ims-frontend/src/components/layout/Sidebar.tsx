import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import styles from '../../assets/scss/components/layout/Sidebar.module.scss';

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
  // --- THIS IS THE FIX ---
  ADMIN: [
    { path: '/', label: 'Dashboard' },
    { path: '/id-card', label: 'ID Card' },
    { path: '/admin/admissions', label: 'View Admissions' },
    { path: '/admin/students', label: 'Manage Students' },
    { path: '/admin/teachers', label: 'Manage Teachers' },
    { path: '/admin/programs', label: 'Manage Programs' },   // <-- New Page
    { path: '/admin/semesters', label: 'Manage Semesters' }, // <-- New Page
    { path: '/admin/subjects', label: 'Manage Subjects' },  // <-- New Page
    { path: '/admin/exams', label: 'Manage Exams' },
    { path: '/admin/inventory', label: 'Manage Inventory' },
    { path: '/admin/orders', label: 'View Orders' },
    { path: '/admin/announcements', label: 'Announcements' }
  ],
  // -------------------------
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
  SUPER_ADMIN: [],
};

// ... (rest of Sidebar.tsx component is unchanged)
const Sidebar = ({ isMobileOpen, onClose }: { isMobileOpen: boolean; onClose: () => void; }) => {
  const { user } = useAuth();
  const linksToShow = user ? navLinks[user.role as keyof typeof navLinks] || [] : [];
  const sidebarClasses = `${styles.sidebar} ${isMobileOpen ? styles.mobileOpen : ''}`;

  return (
    <aside className={sidebarClasses}>
      <nav className={styles.nav}>
        {linksToShow.map((link) => (
          <NavLink
            key={link.path}
            to={link.path}
            className={({ isActive }) => (isActive ? `${styles.navLink} ${styles.active}` : styles.navLink)}
            end={link.path === '/'}
            onClick={onClose}
          >
            {link.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;