import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/layout/Sidebar';
import ProfileDropdown from '../components/layout/ProfileDropdown';
import ThemeToggleButton from '../components/layout/ThemeToggleButton';
import logo from '../assets/image/banner-logo.png';
import styles from '../assets/scss/layouts/MainLayout.module.scss';

const MainLayout = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const toggleSidebarCollapse = () => {
    setIsSidebarCollapsed(prev => !prev);
  };

  // --- THIS IS THE FIX ---
  // Apply the collapsed class to the root .layout element
  const layoutClass = isSidebarCollapsed
    ? `${styles.layout} ${styles.layoutCollapsed}`
    : styles.layout;

  return (
    <div className={layoutClass}>
      <Sidebar 
        isCollapsed={isSidebarCollapsed} 
        onToggle={toggleSidebarCollapse} 
      />
      
      <div className={styles.mainContent}>
        {/* The header is now *inside* mainContent */}
        <header className={styles.header}>
          <div className={styles.headerLeft}>
            <div className={styles.logo}>
              <img src={logo} alt="Institute Logo" />
            </div>
          </div>
          <div className={styles.headerControls}>
            <ThemeToggleButton />
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