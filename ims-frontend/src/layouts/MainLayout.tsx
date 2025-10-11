// src/layouts/MainLayout.tsx
import { Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Sidebar from '../components/layout/Sidebar'; // <-- Import Sidebar
import styles from './MainLayout.module.scss'; // <-- We'll create this file

const MainLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className={styles.layout}>
      <Sidebar /> {/* <-- Add the Sidebar component */}
      <div className={styles.mainContent}>
        <header className={styles.header}>
          {user && (
            <div>
              <span>Welcome, {user.name}! (Role: {user.role})</span>
              <button onClick={handleLogout} className={styles.logoutButton}>
                Logout
              </button>
            </div>
          )}
        </header>
        <main className={styles.content}>
          <Outlet /> {/* This renders the current page */}
        </main>
      </div>
    </div>
  );
};

export default MainLayout;