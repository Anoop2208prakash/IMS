import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import styles from './MainLayout.module.scss';

const MainLayout = () => {
  return (
    <div className={styles.appContainer}>
      <Navbar />
      <div className={styles.mainContent}>
        <Sidebar />
        <main className={styles.pageContent}>
          <Outlet /> {/* Child pages will render here */}
        </main>
      </div>
    </div>
  );
};

export default MainLayout;