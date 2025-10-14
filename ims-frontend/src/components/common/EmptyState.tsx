import React from 'react';
import styles from './EmptyState.module.scss';

interface EmptyStateProps {
  message: string;
  icon?: string; // Optional emoji icon
}

const EmptyState = ({ message, icon = '📄' }: EmptyStateProps) => {
  return (
    <div className={styles.emptyState}>
      <div className={styles.icon}>{icon}</div>
      <p>{message}</p>
    </div>
  );
};

export default EmptyState;