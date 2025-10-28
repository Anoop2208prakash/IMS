import { Outlet } from 'react-router-dom';
import Sidebar from '../components/layout/Sidebar';
import ProfileDropdown from '../components/layout/ProfileDropdown';
import ThemeToggleButton from '../components/layout/ThemeToggleButton'; // <-- Import
import logo from '../assets/image/banner-logo.png';
import styles from '../assets/scss/layouts/MainLayout.module.scss';

const MainLayout = () => {
  return (
    <div className={styles.layout}>
      <Sidebar />
      <div className={styles.mainContent}>
        <header className={styles.header}>
          <div className={styles.logo}>
            <img src={logo} alt="Institute Logo" />
          </div>
          <div className={styles.headerControls}> {/* <-- Add a wrapper */}
            <ThemeToggleButton /> {/* <-- Add the button */}
            <ProfileDropdown />
          </div>
        </header>
        <main className={styles.content}>
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default MainLayout;