import React, { useEffect, useRef, useState } from 'react';
import styles from '../../assets/scss/components/common/HeaderMenu.module.scss';
import { BsThreeDots } from 'react-icons/bs';

interface Action {
  label: string;
  onClick: () => void;
  disabled?: boolean;
}

interface HeaderMenuProps {
  actions: Action[];
  // variant?: 'default' | 'primary'; // <-- This is now removed
}

const HeaderMenu = ({ actions }: HeaderMenuProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // The button just uses the default class now
  return (
    <div className={styles.menuWrapper} ref={menuRef}>
      <button className={styles.iconButton} onClick={() => setIsOpen(prev => !prev)}>
        <BsThreeDots />
      </button>

      {isOpen && (
        <ul className={styles.menuDropdown}>
          {actions.map((action, index) => (
            <li key={index}>
              <button 
                onClick={() => { action.onClick(); setIsOpen(false); }} 
                disabled={action.disabled}
              >
                {action.label}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default HeaderMenu;