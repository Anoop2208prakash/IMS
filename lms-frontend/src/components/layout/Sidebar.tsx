import React from 'react';
import { NavLink } from 'react-router-dom';
import styles from './Sidebar.module.scss';
import { useAuth } from '../../context/AuthContext';

const Sidebar = () => {
  const { user } = useAuth();

  return (
    <aside className={styles.sidebar}>
      <nav>
        <ul>
          {/* == General Links for All Users == */}
          
          <li><NavLink to="/dashboard" className={({ isActive }) => (isActive ? styles.active : '')}>Dashboard</NavLink></li>
          {/* <li><NavLink to="/profile" className={({ isActive }) => (isActive ? styles.active : '')}>Profile</NavLink></li> */}
          <li><NavLink to="/id-card" className={({ isActive }) => (isActive ? styles.active : '')}>ID Card</NavLink></li>
          <hr />
          {(user?.role === 'USER'|| user?.role === 'SUPER_ADMIN') && (
            <>
              <li><NavLink to="/my-loans" className={({ isActive }) => (isActive ? styles.active : '')}>My Loans</NavLink></li>
              <li><NavLink to="/my-grades" className={({ isActive }) => (isActive ? styles.active : '')}>My Grades</NavLink></li>
              <li><NavLink to="/exam-form" className={({ isActive }) => (isActive ? styles.active : '')}>Exam Form</NavLink></li>
              <li><NavLink to="/admit-card" className={({ isActive }) => (isActive ? styles.active : '')}>Admit Card</NavLink></li>
              <hr />
              <li><NavLink to="/stationery" className={({ isActive }) => (isActive ? styles.active : '')}>Stationery</NavLink></li>
              <li><NavLink to="/uniforms" className={({ isActive }) => (isActive ? styles.active : '')}>Uniforms</NavLink></li>
              <hr />
            </>
          )}

          {/* == General Admin Links == */}
          {(user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN') && (
            <>
              <li><NavLink to="/users" className={({ isActive }) => (isActive ? styles.active : '')}>User Management</NavLink></li>
              <li><NavLink to="/courses" className={({ isActive }) => (isActive ? styles.active : '')}>Course Management</NavLink></li>
              <li><NavLink to="/fees" className={({ isActive }) => (isActive ? styles.active : '')}>Fee Management</NavLink></li>
              <hr />
            </>
          )}

          {/* == Library Admin Links == */}
          {(user?.role === 'ADMIN_LIBRARY' || user?.role === 'SUPER_ADMIN') && (
            <>
              <li><NavLink to="/issue-book" className={({ isActive }) => (isActive ? styles.active : '')}>Issue Book</NavLink></li>
              <li><NavLink to="/return-book" className={({ isActive }) => (isActive ? styles.active : '')}>Return Book</NavLink></li>
              <hr />
            </>
          )}
          
          {/* == Inventory Admin Links == */}
          {(user?.role === 'ADMIN_STATIONERY' || user?.role === 'ADMIN_UNIFORMS' || user?.role === 'SUPER_ADMIN') && (
            <li><NavLink to="/manage-inventory" className={({ isActive }) => (isActive ? styles.active : '')}>Manage Inventory</NavLink></li>
          )}

          {/* == Admission Admin Links == */}
          {(user?.role === 'ADMIN_ADMISSION' || user?.role === 'SUPER_ADMIN') && (
            <>
            <li><NavLink to="/admission" className={({ isActive }) => (isActive ? styles.active : '')}>Admissions</NavLink></li>
            <li><NavLink to="/view-admissions" className={({ isActive }) => (isActive ? styles.active : '')}>View Admissions</NavLink></li>
            </>
          )}
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;