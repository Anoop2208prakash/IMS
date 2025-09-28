import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { NavLink } from 'react-router-dom';
import { useClickOutside } from '../../hooks/useClickOutside'; // Import the hook
import styles from './Navbar.module.scss';

const Navbar = () => {
  const { user, logout } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Use the hook to get a ref and attach the handler
  const dropdownRef = useClickOutside(() => {
    setIsDropdownOpen(false);
  });

  return (
    <nav className={styles.navbar}>
      <div className={styles.brand}>Institute MS</div>
      <div className={styles.userInfo}>
        <span>Welcome, {user?.name}</span>
        {/* Attach the ref to the dropdown's container */}
        <div className={styles.profileContainer} ref={dropdownRef}>
          <div 
            className={styles.profileCircle} 
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          >
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          {isDropdownOpen && (
            <div className={styles.dropdown}>
              <NavLink to="/profile" onClick={() => setIsDropdownOpen(false)}>
                Update Profile
              </NavLink>
              <button onClick={logout}>Logout</button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;