import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import styles from '../../assets/scss/components/layout/Sidebar.module.scss';
import {
  BsFillGridFill, BsPersonBadgeFill, BsFillPersonPlusFill, BsFillPeopleFill,
  BsBookHalf, BsArrowLeftRight, BsCalendarCheck, BsClipboardCheck,
  BsReceipt, BsFileEarmarkPerson, BsCartFill, BsBoxSeam, BsPencilSquare,
  BsJournalBookmarkFill, BsBook, BsCardChecklist, BsMegaphoneFill,
  BsFileEarmarkTextFill, BsChevronLeft, BsChevronRight
} from 'react-icons/bs';
import { FaChalkboardTeacher, FaFileInvoiceDollar } from 'react-icons/fa';

interface SidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
}

const navLinks = {
  STUDENT: [
    { path: '/', label: 'Dashboard', icon: <BsFillGridFill /> },
    { path: '/id-card', label: 'ID Card', icon: <BsPersonBadgeFill /> },
    { path: '/my-subjects', label: 'My Subjects', icon: <BsJournalBookmarkFill /> },
    { path: '/library', label: 'Library', icon: <BsBookHalf /> },
    { path: '/my-loans', label: 'My Loans', icon: <BsArrowLeftRight /> },
    { path: '/my-attendance', label: 'My Attendance', icon: <BsCalendarCheck /> },
    { path: '/my-results', label: 'My Results', icon: <BsClipboardCheck /> },
    { path: '/my-invoices', label: 'My Invoices', icon: <BsReceipt /> },
    { path: '/admit-card-generator', label: 'Admit Card', icon: <BsFileEarmarkPerson /> },
    { path: '/stationary-store', label: 'Stationary Store', icon: <BsCartFill /> },
    { path: '/my-orders', label: 'My Orders', icon: <BsBoxSeam /> }
  ],
  TEACHER: [
    { path: '/', label: 'Dashboard', icon: <BsFillGridFill /> },
    { path: '/id-card', label: 'ID Card', icon: <BsPersonBadgeFill /> },
    { path: '/library', label: 'Library', icon: <BsBookHalf /> },
    { path: '/my-loans', label: 'My Loans', icon: <BsArrowLeftRight /> },
    { path: '/teacher/attendance', label: 'Mark Attendance', icon: <BsCalendarCheck /> },
    { path: '/teacher/marks', label: 'Enter Marks', icon: <BsPencilSquare /> },
  ],
  ADMIN: [
    { path: '/', label: 'Dashboard', icon: <BsFillGridFill /> },
    { path: '/id-card', label: 'ID Card', icon: <BsPersonBadgeFill /> },
    { path: '/admin/admissions', label: 'View Admissions', icon: <BsFillPersonPlusFill /> },
    { path: '/admin/students', label: 'Manage Students', icon: <BsFillPeopleFill /> },
    { path: '/admin/teachers', label: 'Manage Teachers', icon: <FaChalkboardTeacher /> },
    { path: '/admin/programs', label: 'Manage Programs', icon: <BsJournalBookmarkFill /> },
    { path: '/admin/semesters', label: 'Manage Semesters', icon: <BsBook /> },
    { path: '/admin/subjects', label: 'Manage Subjects', icon: <BsCardChecklist /> },
    { path: '/admin/exams', label: 'Manage Exams', icon: <BsPencilSquare /> },
    { path: '/admin/inventory', label: 'Manage Inventory', icon: <BsCartFill /> },
    { path: '/admin/orders', label: 'View Orders', icon: <BsBoxSeam /> },
    { path: '/admin/announcements', label: 'Announcements', icon: <BsMegaphoneFill /> }
  ],
  ADMIN_ADMISSION: [
    { path: '/', label: 'Dashboard', icon: <BsFillGridFill /> },
    { path: '/id-card', label: 'ID Card', icon: <BsPersonBadgeFill /> },
    { path: '/admin/admissions', label: 'View Admissions', icon: <BsFillPeopleFill /> },
    { path: '/admin/admission/new', label: 'New Admission', icon: <BsFillPersonPlusFill /> },
  ],
  ADMIN_FINANCE: [
    { path: '/', label: 'Dashboard', icon: <BsFillGridFill /> },
    { path: '/id-card', label: 'ID Card', icon: <BsPersonBadgeFill /> },
    { path: '/admin/finance/structures', label: 'Fee Structures', icon: <FaFileInvoiceDollar /> },
    { path: '/admin/finance/invoices/generate', label: 'Generate Invoices', icon: <BsFileEarmarkTextFill /> },
    { path: '/admin/orders', label: 'View Orders', icon: <BsBoxSeam /> },
  ],
  ADMIN_LIBRARY: [
    { path: '/', label: 'Dashboard', icon: <BsFillGridFill /> },
    { path: '/id-card', label: 'ID Card', icon: <BsPersonBadgeFill /> },
    { path: '/admin/library/books', label: 'Manage Books', icon: <BsBookHalf /> },
    { path: '/admin/library/loans', label: 'Manage Loans', icon: <BsArrowLeftRight /> },
  ],
  SUPER_ADMIN: [],
};

const Sidebar = ({ isCollapsed, onToggle }: SidebarProps) => {
  const { user } = useAuth();
  const linksToShow = user ? navLinks[user.role as keyof typeof navLinks] || [] : [];
  
  const sidebarClasses = `${styles.sidebar} ${isCollapsed ? styles.collapsed : ''}`;

  return (
    <aside className={sidebarClasses}>
      <nav className={styles.nav}>
        {linksToShow.map((link) => (
          <NavLink
            key={link.path}
            to={link.path}
            className={({ isActive }) => (isActive ? `${styles.navLink} ${styles.active}` : styles.navLink)}
            end={link.path === '/'}
          >
            <span className={styles.icon}>{link.icon}</span>
            <span className={styles.label}>{link.label}</span>
          </NavLink>
        ))}
      </nav>
      
      {/* 4. The toggle button is now here, *outside* the nav */}
      <button onClick={onToggle} className={styles.collapseToggle}>
        {isCollapsed ? <BsChevronRight /> : <BsChevronLeft />}
      </button>
    </aside>
  );
};

export default Sidebar;