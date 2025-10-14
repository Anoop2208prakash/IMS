import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import styles from './ProfileDropdown.module.scss';

const ProfileDropdown = () => {
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!user) return null;

  return (
    <div className={styles.profileDropdown} ref={dropdownRef}>
      <button className={styles.profileButton} onClick={() => setIsOpen(!isOpen)}>
        {user.name.charAt(0).toUpperCase()}
      </button>

      {isOpen && (
        <ul className={styles.dropdownMenu}>
          <li><Link to="/profile" onClick={() => setIsOpen(false)}>My Profile</Link></li>
          <li><Link to="/change-password" onClick={() => setIsOpen(false)}>Change Password</Link></li>
          <li><button onClick={handleLogout}>Logout</button></li>
        </ul>
      )}
    </div>
  );
};

export default ProfileDropdown;