import React from 'react';
import styles from './StatCard.module.scss';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode; // Change type from 'string' to 'React.ReactNode'
}

const StatCard = ({ title, value, icon }: StatCardProps) => {
  return (
    <div className={styles.statCard}>
      <div className={styles.icon}>{icon}</div> {/* This will now render the icon component */}
      <div className={styles.info}>
        <div className={styles.value}>{value}</div>
        <div className={styles.title}>{title}</div>
      </div>
    </div>
  );
};

export default StatCard;