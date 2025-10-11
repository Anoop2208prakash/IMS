import React from 'react';
import styles from './StatCard.module.scss';

interface StatCardProps {
  title: string;
  value: string | number;
  icon?: string; // Emoji or icon character
}

const StatCard = ({ title, value, icon }: StatCardProps) => {
  return (
    <div className={styles.statCard}>
      <div className={styles.icon}>{icon}</div>
      <div className={styles.info}>
        <div className={styles.value}>{value}</div>
        <div className={styles.title}>{title}</div>
      </div>
    </div>
  );
};

export default StatCard;