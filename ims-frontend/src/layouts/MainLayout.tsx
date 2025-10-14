import { Outlet } from 'react-router-dom';
import Sidebar from '../components/layout/Sidebar';
import ProfileDropdown from '../components/layout/ProfileDropdown'; // <-- Import the new component
import styles from './MainLayout.module.scss';

const MainLayout = () => {
  return (
    <div className={styles.layout}>
      <Sidebar />
      <div className={styles.mainContent}>
        <header className={styles.header}>
          <ProfileDropdown /> {/* <-- Use the new component */}
        </header>
        <main className={styles.content}>
          <Outlet /> {/* This renders the current page */}
        </main>
      </div>
    </div>
  );
};

export default MainLayout;