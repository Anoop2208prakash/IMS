import { Outlet } from 'react-router-dom';
import Sidebar from '../components/layout/Sidebar';
import ProfileDropdown from '../components/layout/ProfileDropdown';
import styles from './MainLayout.module.scss';

const MainLayout = () => {
  return (
    <div className={styles.layout}>
      <Sidebar />
      <div className={styles.mainContent}>
        <header className={styles.header}>
          <ProfileDropdown />
        </header>
        <main className={styles.content}>
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default MainLayout;